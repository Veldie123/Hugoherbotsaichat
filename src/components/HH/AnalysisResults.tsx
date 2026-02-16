import { AppLayout } from "./AppLayout";
import { AdminLayout } from "./AdminLayout";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { ChatBubble } from "./ChatBubble";
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  ChevronRight,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Target,
  BarChart3,
  Loader2,
  MessageSquare,
  Zap,
  Calendar,
  Clock,
  Play,
  Trophy,
  Wrench,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Send,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getTechniekByNummer } from "../../data/technieken-service";

interface AnalysisResultsProps {
  navigate?: (page: string, data?: any) => void;
  analysisId?: string;
  isPreview?: boolean;
  isAdmin?: boolean;
  navigationData?: { conversationId?: string; fromAdmin?: boolean; autoLoadFirst?: boolean };
}

interface TranscriptTurn {
  idx: number;
  startMs: number;
  endMs: number;
  speaker: 'seller' | 'customer';
  text: string;
}

interface TurnEvaluation {
  turnIdx: number;
  techniques: Array<{
    id: string;
    naam: string;
    quality: 'perfect' | 'goed' | 'bijna' | 'gemist';
    score: number;
    stappen_gevolgd?: string[];
  }>;
  overallQuality: string;
  rationale: string;
}

interface CustomerSignalResult {
  turnIdx: number;
  houding: string;
  confidence: number;
  recommendedTechniqueIds: string[];
  currentPhase?: number;
}

interface PhaseScore {
  score: number;
  techniquesFound: Array<{ id: string; naam: string; quality: string; count: number }>;
  totalPossible: number;
}

interface PhaseCoverage {
  phase1: PhaseScore;
  phase2: {
    overall: PhaseScore;
    explore: { score: number; themes: string[]; missing: string[] };
    probe: { score: number; found: boolean; examples: string[] };
    impact: { score: number; found: boolean; examples: string[] };
    commit: { score: number; found: boolean; examples: string[] };
  };
  phase3: PhaseScore;
  phase4: PhaseScore;
  overall: number;
}

interface MissedOpportunity {
  turnIdx: number;
  type: string;
  description: string;
  sellerSaid: string;
  customerSaid: string;
  betterQuestion: string;
}

interface CoachMoment {
  id: string;
  timestamp: string;
  turnIndex: number;
  phase: number;
  label: string;
  type: 'big_win' | 'quick_fix' | 'turning_point';
  customerSignal?: string;
  sellerText: string;
  customerText: string;
  whyItMatters: string;
  betterAlternative: string;
  recommendedTechniques: string[];
  replay: {
    startTurnIndex: number;
    contextTurns: number;
  };
}

interface CoachDebriefMessage {
  type: 'coach_text' | 'moment_ref' | 'scoreboard';
  text?: string;
  momentId?: string;
  cta?: string[];
}

interface CoachDebrief {
  oneliner: string;
  epicMomentum: string;
  messages: CoachDebriefMessage[];
}

interface AnalysisInsights {
  phaseCoverage: PhaseCoverage;
  missedOpportunities: MissedOpportunity[];
  summaryMarkdown: string;
  strengths: Array<{ text: string; quote: string; turnIdx: number }>;
  improvements: Array<{ text: string; quote: string; turnIdx: number; betterApproach: string }>;
  microExperiments: string[];
  overallScore: number;
  coachDebrief?: CoachDebrief;
  moments?: CoachMoment[];
}

interface FullAnalysisResult {
  conversation: {
    id: string;
    userId: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
    completedAt?: string;
  };
  transcript: TranscriptTurn[];
  evaluations: TurnEvaluation[];
  signals: CustomerSignalResult[];
  insights: AnalysisInsights;
}

const PHASE_LABELS: Record<number, { name: string; description: string; color: string; bgColor: string }> = {
  1: { name: 'Fase 1: Opening', description: 'Koopklimaat, Gentleman\'s Agreement, Instapvraag', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  2: { name: 'Fase 2: EPIC', description: 'Explore, Probe, Impact, Commitment', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200' },
  3: { name: 'Fase 3: Aanbeveling', description: 'O.V.B., USP\'s, Mening vragen', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
  4: { name: 'Fase 4: Beslissing', description: 'Bezwaarbehandeling, Closing', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
};

export function AnalysisResults({
  navigate,
  isPreview = false,
  isAdmin = false,
  navigationData,
}: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<"coach" | "timeline">(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') === 'timeline' ? 'timeline' : 'coach';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FullAnalysisResult | null>(null);
  const [expandedMoment, setExpandedMoment] = useState<string | null>(null);

  const [replayMoment, setReplayMoment] = useState<CoachMoment | null>(null);
  const [replayContext, setReplayContext] = useState<any>(null);
  const [replayHistory, setReplayHistory] = useState<Array<{ role: 'seller' | 'customer'; content: string }>>([]);
  const [replayInput, setReplayInput] = useState('');
  const [replayLoading, setReplayLoading] = useState(false);
  const [replayFeedback, setReplayFeedback] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ momentId: string; type: string; data: any } | null>(null);

  const [resolvedConversationId, setResolvedConversationId] = useState<string | null>(
    navigationData?.conversationId || sessionStorage.getItem('analysisId') || null
  );

  const [processingStep, setProcessingStep] = useState<string | null>(null);

  const replayRef = useRef<HTMLDivElement>(null);
  const actionResultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigationData?.conversationId && navigationData.conversationId !== resolvedConversationId) {
      setResolvedConversationId(navigationData.conversationId);
      setResult(null);
      setError(null);
      setLoading(true);
      setActiveTab("coach");
      setExpandedMoment(null);
      setReplayMoment(null);
      setReplayContext(null);
      setReplayHistory([]);
      setReplayFeedback(null);
      setActionLoading(null);
      setActionResult(null);
    }
  }, [navigationData?.conversationId]);

  useEffect(() => {
    if (resolvedConversationId) return;
    if (!navigationData?.autoLoadFirst) {
      setError('Geen analyse ID gevonden');
      setLoading(false);
      return;
    }
    const loadFirst = async () => {
      try {
        const res = await fetch('/api/v2/analysis/list');
        if (!res.ok) { setError('Kon analyses niet ophalen'); setLoading(false); return; }
        const data = await res.json();
        const analyses = data.analyses || [];
        if (analyses.length > 0) {
          setResolvedConversationId(analyses[0].id);
        } else {
          setError('Geen analyses gevonden');
          setLoading(false);
        }
      } catch {
        setError('Kon analyses niet ophalen');
        setLoading(false);
      }
    };
    loadFirst();
  }, [resolvedConversationId, navigationData?.autoLoadFirst]);

  useEffect(() => {
    if (!resolvedConversationId) {
      return;
    }

    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/v2/analysis/results/${resolvedConversationId}`);
        const data = await response.json();

        if (response.status === 202) {
          const statusLabels: Record<string, string> = {
            'transcribing': 'Transcriberen...',
            'analyzing': 'Turns analyseren...',
            'evaluating': 'EPIC technieken evalueren...',
            'generating_report': 'Rapport genereren...',
          };
          setProcessingStep(statusLabels[data.status] || 'Bezig met verwerken...');

          if (!pollInterval) {
            pollInterval = setInterval(fetchResults, 3000);
          }
          return;
        }

        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }

        if (!response.ok) {
          setError(data.error || 'Resultaten ophalen mislukt');
          setLoading(false);
          return;
        }

        setResult(data);
        setProcessingStep(null);
        setLoading(false);
      } catch (err) {
        if (pollInterval) clearInterval(pollInterval);
        setError('Kon resultaten niet ophalen');
        setLoading(false);
      }
    };

    fetchResults();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [resolvedConversationId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-hh-success";
    if (score >= 60) return "text-hh-warn";
    return "text-hh-destructive";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-hh-success/10 border-hh-success/20";
    if (score >= 60) return "bg-hh-warn/10 border-hh-warn/20";
    return "bg-hh-destructive/10 border-hh-destructive/20";
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'perfect': return { label: 'Perfect', color: 'bg-hh-success/10 text-hh-success border-hh-success/20' };
      case 'goed': return { label: 'Goed', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'bijna': return { label: 'Bijna', color: 'bg-hh-warn/10 text-hh-warn border-hh-warn/20' };
      case 'gemist': return { label: 'Gemist', color: 'bg-hh-destructive/10 text-hh-destructive border-hh-destructive/20' };
      default: return { label: quality, color: 'bg-hh-ui-100 text-hh-muted' };
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSignalLabel = (houding: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      'interesse': { label: 'Interesse', color: 'bg-hh-success/10 text-hh-success' },
      'akkoord': { label: 'Akkoord', color: 'bg-hh-success/10 text-hh-success' },
      'vraag': { label: 'Vraag', color: 'bg-blue-100 text-blue-700' },
      'twijfel': { label: 'Twijfel', color: 'bg-hh-warn/10 text-hh-warn' },
      'bezwaar': { label: 'Bezwaar', color: 'bg-hh-destructive/10 text-hh-destructive' },
      'uitstel': { label: 'Uitstel', color: 'bg-orange-100 text-orange-700' },
      'negatief': { label: 'Negatief', color: 'bg-hh-destructive/10 text-hh-destructive' },
      'vaag': { label: 'Vaag', color: 'bg-hh-warn/10 text-hh-warn' },
      'ontwijkend': { label: 'Ontwijkend', color: 'bg-orange-100 text-orange-700' },
      'neutraal': { label: 'Neutraal', color: 'bg-hh-ui-100 text-hh-muted' },
    };
    return labels[houding] || labels['neutraal'];
  };

  const getPhaseBadge = (turnIdx: number) => {
    const signal = result?.signals.find(s => s.turnIdx === turnIdx);
    const phase = signal?.currentPhase;
    if (!phase) {
      const eval_ = result?.evaluations.find(e => e.turnIdx === turnIdx);
      if (eval_ && eval_.techniques.length > 0) {
        const firstTech = eval_.techniques[0].id;
        if (firstTech.startsWith('0') || firstTech.startsWith('1')) return 1;
        if (firstTech.startsWith('2')) return 2;
        if (firstTech.startsWith('3')) return 3;
        if (firstTech.startsWith('4')) return 4;
      }
      return null;
    }
    return phase;
  };

  const determinePhaseForTurn = (turnIdx: number): number | null => {
    if (!result) return null;

    const signal = result.signals.find(s => s.turnIdx === turnIdx);
    if (signal?.currentPhase) return signal.currentPhase;

    const eval_ = result.evaluations.find(e => e.turnIdx === turnIdx);
    if (eval_ && eval_.techniques.length > 0) {
      const firstTech = eval_.techniques[0].id;
      if (firstTech.startsWith('0') || firstTech.startsWith('1')) return 1;
      if (firstTech.startsWith('2')) return 2;
      if (firstTech.startsWith('3')) return 3;
      if (firstTech.startsWith('4')) return 4;
    }

    const prevSignals = result.signals.filter(s => s.turnIdx < turnIdx && s.currentPhase);
    if (prevSignals.length > 0) {
      return prevSignals[prevSignals.length - 1].currentPhase!;
    }

    return 1;
  };

  const startReplay = async (moment: CoachMoment) => {
    if (!resolvedConversationId) return;
    setReplayMoment(moment);
    setReplayHistory([]);
    setReplayFeedback(null);
    setReplayLoading(true);
    try {
      const res = await fetch('/api/v2/analysis/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: resolvedConversationId, startTurnIndex: moment.turnIndex }),
      });
      if (!res.ok) throw new Error('Replay start failed');
      const data = await res.json();
      setReplayContext(data);
    } catch {
      setReplayContext({ error: true, goal: 'Er ging iets mis bij het laden van de replay. Probeer het opnieuw.' });
    }
    setReplayLoading(false);
    setTimeout(() => replayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const sendReplayMessage = async () => {
    if (!replayInput.trim() || !resolvedConversationId || !replayMoment) return;
    const msg = replayInput.trim();
    setReplayInput('');
    setReplayLoading(true);
    setReplayFeedback(null);

    const newHistory = [...replayHistory, { role: 'seller' as const, content: msg }];
    setReplayHistory(newHistory);

    try {
      const res = await fetch('/api/v2/analysis/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: resolvedConversationId,
          startTurnIndex: replayMoment.turnIndex,
          userMessage: msg,
          replayHistory: newHistory,
        }),
      });
      if (!res.ok) throw new Error('Replay failed');
      const data = await res.json();
      setReplayHistory([...newHistory, { role: 'customer', content: data.customerReply || 'Geen reactie ontvangen.' }]);
      if (data.feedback) setReplayFeedback(data.feedback);
    } catch {
      setReplayHistory([...newHistory, { role: 'customer', content: 'Er ging iets mis. Probeer opnieuw.' }]);
    }
    setReplayLoading(false);
  };

  const runCoachAction = async (momentId: string, actionType: string) => {
    if (!resolvedConversationId) return;
    setActionLoading(`${momentId}-${actionType}`);
    setActionResult(null);
    try {
      const res = await fetch('/api/v2/analysis/coach-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: resolvedConversationId, momentId, actionType }),
      });
      if (!res.ok) throw new Error('Action failed');
      const data = await res.json();
      setActionResult({ momentId, type: actionType, data });
      setTimeout(() => actionResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    } catch (err) {
      setActionResult({ momentId, type: actionType, data: { error: 'Er ging iets mis. Probeer het opnieuw.' } });
      setTimeout(() => actionResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }
    setActionLoading(null);
  };

  const handleExportPDF = async () => {
    if (!result) return;
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxW = pageW - 2 * margin;
    let y = 20;

    const checkPage = (needed: number) => {
      if (y + needed > 275) {
        doc.addPage();
        y = 20;
      }
    };

    const addWrappedText = (text: string, fontSize: number, isBold = false, color: [number, number, number] = [30, 30, 30]) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, maxW);
      const lineH = fontSize * 0.5;
      for (const line of lines) {
        checkPage(lineH);
        doc.text(line, margin, y);
        y += lineH;
      }
    };

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('HUGO HERBOTS', margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('E.P.I.C. Sales Analyse Rapport', margin, y);
    y += 12;

    addWrappedText(result.conversation.title || 'Gespreksanalyse', 16, true);
    y += 2;
    addWrappedText(`Datum: ${new Date(result.conversation.createdAt).toLocaleDateString('nl-BE')}`, 10, false, [100, 116, 139]);
    y += 8;

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    const coverage = result.insights.phaseCoverage;
    const overallScore = result.insights.overallScore;

    addWrappedText('Fase Scores', 14, true);
    y += 2;
    addWrappedText(`Totaalscore: ${overallScore}/100`, 12, true, overallScore >= 70 ? [34, 197, 94] : overallScore >= 50 ? [245, 158, 11] : [239, 68, 68]);
    y += 4;

    const phases = [
      { name: 'Fase 1: Opening', score: coverage?.phase1?.score ?? 0 },
      { name: 'Fase 2: EPIC (Ontdekking)', score: coverage?.phase2?.overall?.score ?? 0 },
      { name: 'Fase 3: Aanbeveling', score: coverage?.phase3?.score ?? 0 },
      { name: 'Fase 4: Beslissing', score: coverage?.phase4?.score ?? 0 },
    ];
    for (const phase of phases) {
      addWrappedText(`${phase.name}: ${phase.score}%`, 10, false);
      y += 1;
    }

    if (coverage?.phase2) {
      y += 2;
      addWrappedText(`  E: ${coverage.phase2.explore?.score ?? 0}%  P: ${coverage.phase2.probe?.score ?? 0}%  I: ${coverage.phase2.impact?.score ?? 0}%  C: ${coverage.phase2.commit?.score ?? 0}%`, 9, false, [100, 116, 139]);
    }
    y += 6;

    addWrappedText('Sterke Punten', 14, true, [34, 197, 94]);
    y += 2;
    for (const s of result.insights.strengths) {
      checkPage(15);
      addWrappedText(`+ ${s.text}`, 10, false);
      if (s.quote) {
        addWrappedText(`  "${s.quote}"`, 9, false, [100, 116, 139]);
      }
      y += 2;
    }
    y += 4;

    addWrappedText('Verbeterpunten', 14, true, [239, 68, 68]);
    y += 2;
    for (const imp of result.insights.improvements) {
      checkPage(15);
      addWrappedText(`- ${imp.text}`, 10, false);
      if (imp.betterApproach) {
        addWrappedText(`  Tip: ${imp.betterApproach}`, 9, false, [100, 116, 139]);
      }
      y += 2;
    }
    y += 4;

    if (result.insights.missedOpportunities && result.insights.missedOpportunities.length > 0) {
      addWrappedText('Gemiste Kansen', 14, true, [245, 158, 11]);
      y += 2;
      for (const opp of result.insights.missedOpportunities) {
        checkPage(20);
        addWrappedText(`${opp.type} - ${opp.description}`, 10, true);
        addWrappedText(`Beter alternatief: "${opp.betterQuestion}"`, 9, false, [100, 116, 139]);
        y += 3;
      }
      y += 4;
    }

    if (result.insights.microExperiments && result.insights.microExperiments.length > 0) {
      addWrappedText('Micro-experimenten', 14, true, [59, 130, 246]);
      y += 2;
      for (const exp of result.insights.microExperiments) {
        checkPage(15);
        addWrappedText(`- ${exp}`, 10, false);
        y += 3;
      }
      y += 4;
    }

    addWrappedText('Transcript Samenvatting', 14, true);
    y += 2;
    const sellerTurns = result.transcript.filter(t => t.speaker === 'seller').length;
    const customerTurns = result.transcript.filter(t => t.speaker === 'customer').length;
    addWrappedText(`${result.transcript.length} beurten totaal (Verkoper: ${sellerTurns}, Klant: ${customerTurns})`, 10, false, [100, 116, 139]);
    y += 6;

    checkPage(10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('Gegenereerd door Hugo Herbots AI Sales Coach - hugoherbots.ai', margin, 285);

    doc.save(`${result.conversation.title || 'analyse'}-rapport.pdf`);
  };

  const useAdminLayout = !!navigationData?.fromAdmin;
  const Layout = useAdminLayout
    ? ({ children: c }: { children: React.ReactNode }) => <AdminLayout currentPage="admin-uploads" navigate={navigate as (page: string) => void}>{c}</AdminLayout>
    : ({ children: c }: { children: React.ReactNode }) => <AppLayout currentPage="analysis" navigate={navigate} isAdmin={isAdmin}>{c}</AppLayout>;

  if (loading || processingStep) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 text-hh-primary animate-spin mx-auto" />
            <p className="text-hh-text font-medium">{processingStep || 'Resultaten laden...'}</p>
            {processingStep && (
              <p className="text-[14px] leading-[20px] text-hh-muted">
                Dit kan enkele minuten duren afhankelijk van de lengte van het gesprek.
              </p>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !result) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <AlertCircle className="w-8 h-8 text-hh-destructive mx-auto" />
            <p className="text-hh-text">{error || 'Geen resultaten gevonden'}</p>
            <Button variant="outline" onClick={() => navigate?.("upload-analysis")}>
              Terug naar uploads
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const { conversation, transcript, evaluations, signals, insights } = result;
  const { phaseCoverage, missedOpportunities, strengths: rawStrengths, improvements: rawImprovements, microExperiments, overallScore } = insights;

  const strengths = rawStrengths.length > 0 ? rawStrengths : evaluations
    .filter(e => e.techniques.some(t => t.quality === 'perfect' || t.quality === 'goed'))
    .slice(0, 5)
    .map(e => {
      const bestTech = e.techniques.find(t => t.quality === 'perfect') || e.techniques.find(t => t.quality === 'goed');
      const turn = transcript.find(t => t.idx === e.turnIdx);
      return {
        text: `${bestTech?.id} ${bestTech?.naam} – ${bestTech?.quality === 'perfect' ? 'perfect' : 'goed'} toegepast`,
        quote: (turn?.text && turn.text.length > 120 ? turn.text.substring(0, 120) + '...' : turn?.text || ''),
        turnIdx: e.turnIdx,
      };
    });

  const strengthTechIds = new Set(strengths.map(s => s.text.split(' ')[0]));

  const improvements = rawImprovements.length > 0 ? rawImprovements : [
    ...evaluations
      .filter(e => e.techniques.some(t => (t.quality === 'bijna' || t.quality === 'gemist') && !strengthTechIds.has(t.id)))
      .slice(0, 3)
      .map(e => {
        const weakTech = e.techniques.find(t => (t.quality === 'gemist' || t.quality === 'bijna') && !strengthTechIds.has(t.id)) || e.techniques.find(t => t.quality === 'gemist') || e.techniques.find(t => t.quality === 'bijna');
        const turn = transcript.find(t => t.idx === e.turnIdx);
        return {
          text: `${weakTech?.id} ${weakTech?.naam} – kan beter worden toegepast`,
          quote: (turn?.text && turn.text.length > 120 ? turn.text.substring(0, 120) + '...' : turn?.text || ''),
          turnIdx: e.turnIdx,
          betterApproach: '',
        };
      }),
    ...missedOpportunities.slice(0, 2).map(opp => ({
      text: opp.description,
      quote: (opp.sellerSaid && opp.sellerSaid.length > 120 ? opp.sellerSaid.substring(0, 120) + '...' : opp.sellerSaid || ''),
      turnIdx: opp.turnIdx,
      betterApproach: opp.betterQuestion,
    })),
  ].slice(0, 5);

  const phaseScores = [
    { phase: 1, label: 'Fase 1', sublabel: 'Opening', score: phaseCoverage?.phase1?.score ?? 0, data: phaseCoverage?.phase1 },
    { phase: 2, label: 'Fase 2', sublabel: 'EPIC', score: phaseCoverage?.phase2?.overall?.score ?? 0, data: phaseCoverage?.phase2?.overall },
    { phase: 3, label: 'Fase 3', sublabel: 'Aanbeveling', score: phaseCoverage?.phase3?.score ?? 0, data: phaseCoverage?.phase3 },
    { phase: 4, label: 'Fase 4', sublabel: 'Beslissing', score: phaseCoverage?.phase4?.score ?? 0, data: phaseCoverage?.phase4 },
  ];

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-y-auto h-[calc(100vh-4rem)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate?.(navigationData?.fromAdmin ? "admin-uploads" : "analysis")}
              className="gap-1 -ml-2"
            >
              ← Terug naar analyses
            </Button>
          </div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="mb-2 text-[32px] leading-[40px] sm:text-[40px] sm:leading-[48px] flex-shrink-0">
              {conversation.title}
            </h1>
            <div className="flex flex-nowrap gap-2 items-center pt-1">
              <div className="px-3 py-2 bg-white rounded-lg border border-[#e5e7eb] shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(30,41,59,0.12)' }}>
                  <Calendar className="w-3.5 h-3.5 text-[#1e293b]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#6b7280] leading-none">Datum</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] leading-tight">{new Date(conversation.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>

              <div className="px-3 py-2 bg-white rounded-lg border border-[#e5e7eb] shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(30,41,59,0.12)' }}>
                  <MessageSquare className="w-3.5 h-3.5 text-[#1e293b]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#6b7280] leading-none">Turns</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] leading-tight">{transcript.length}</p>
                </div>
              </div>

              {transcript.length > 0 && (
                <div className="px-3 py-2 bg-white rounded-lg border border-[#e5e7eb] shadow-sm flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(30,41,59,0.12)' }}>
                    <Clock className="w-3.5 h-3.5 text-[#1e293b]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6b7280] leading-none">Duur</p>
                    <p className="text-[14px] font-semibold text-[#1e293b] leading-tight">{formatTime(transcript[transcript.length - 1].endMs)}</p>
                  </div>
                </div>
              )}

              <div className="px-3 py-2 bg-white rounded-lg border border-[#e5e7eb] shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(61,154,110,0.12)' }}>
                  <TrendingUp className="w-3.5 h-3.5 text-[#3d9a6e]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#6b7280] leading-none">Score</p>
                  <p className={`text-[14px] font-semibold leading-tight ${getScoreColor(overallScore)}`}>{overallScore}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pb-0">
          {[
            { value: 'coach', label: 'Coach View', icon: Sparkles },
            { value: 'timeline', label: 'Transcript + Evaluatie', icon: MessageSquare },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`px-4 py-2.5 text-[14px] font-medium rounded-full transition-colors flex items-center gap-2 ${
                activeTab === tab.value
                  ? 'bg-hh-primary text-white'
                  : 'text-hh-text/60 hover:text-hh-text hover:bg-hh-ui-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Phase scores only shown in timeline tab */}

        {activeTab === 'coach' && (<div className="space-y-6">
          <Card className="p-6 rounded-[16px] shadow-hh-md border-hh-border bg-gradient-to-br from-white to-slate-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-hh-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[18px] leading-[26px] text-hh-text font-medium">
                  {insights.coachDebrief?.oneliner || `Laten we je gesprek samen doornemen.`}
                </p>
                <p className="text-[14px] leading-[20px] text-hh-muted mt-2">
                  {insights.coachDebrief?.epicMomentum || `De EPIC-flow wordt geanalyseerd.`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-hh-border">
              {phaseScores.map((ps) => (
                <div key={ps.phase} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-hh-border">
                  <span className="text-[11px] text-hh-muted">{ps.sublabel}</span>
                  <span className={`text-[13px] font-semibold ${getScoreColor(ps.score)}`}>{ps.score}%</span>
                </div>
              ))}
              <div className="ml-auto">
                <Button variant="outline" size="sm" className="gap-1.5 text-[12px]" onClick={handleExportPDF}>
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </Button>
              </div>
            </div>
          </Card>

          {(() => {
            const moments = insights.moments || [];
            const momentConfig: Record<string, { icon: any; color: string; bgColor: string; borderColor: string; accentColor: string; label: string }> = {
              'big_win': { icon: Trophy, color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', accentColor: 'bg-emerald-600', label: 'Big Win' },
              'quick_fix': { icon: Wrench, color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', accentColor: 'bg-amber-500', label: 'Quick Fix' },
              'turning_point': { icon: RotateCcw, color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', accentColor: 'bg-rose-600', label: 'Scharnierpunt' },
            };

            return moments.length > 0 ? (
              <div className="space-y-4">
                {moments.map((moment) => {
                  const config = momentConfig[moment.type] || momentConfig['quick_fix'];
                  const MomentIcon = config.icon;
                  const isExpanded = expandedMoment === moment.id;

                  return (
                    <Card key={moment.id} className={`rounded-[16px] shadow-hh-sm border overflow-hidden ${config.borderColor}`}>
                      <div className={`px-6 py-4 ${config.bgColor}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${config.accentColor} flex items-center justify-center flex-shrink-0`}>
                            <MomentIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <Badge variant="outline" className={`text-[11px] ${config.color} ${config.borderColor}`}>
                                {config.label}
                              </Badge>
                              <Badge variant="outline" className="text-[11px] text-hh-muted border-hh-border">
                                {moment.timestamp}
                              </Badge>
                              {moment.customerSignal && (
                                <Badge variant="outline" className="text-[11px] text-hh-muted border-hh-border">
                                  {moment.customerSignal}
                                </Badge>
                              )}
                            </div>
                            <p className={`text-[15px] font-semibold ${config.color}`}>{moment.label}</p>
                          </div>
                          <button
                            onClick={() => setExpandedMoment(isExpanded ? null : moment.id)}
                            className="p-2 rounded-full hover:bg-white/50 transition-colors"
                          >
                            {isExpanded ? <ChevronDown className="w-5 h-5 text-hh-muted" /> : <ChevronRight className="w-5 h-5 text-hh-muted" />}
                          </button>
                        </div>
                      </div>

                      <div className="px-6 py-4">
                        <p className="text-[14px] leading-[22px] text-hh-text">{moment.whyItMatters}</p>

                        {(moment.sellerText || moment.customerText) && (
                          <div className="mt-3 space-y-2">
                            {moment.sellerText && (
                              <ChatBubble speaker="seller" text={moment.sellerText.length > 200 ? moment.sellerText.substring(0, 200) + '...' : moment.sellerText} />
                            )}
                            {moment.customerText && (
                              <ChatBubble speaker="customer" text={moment.customerText.length > 200 ? moment.customerText.substring(0, 200) + '...' : moment.customerText} />
                            )}
                          </div>
                        )}

                        {isExpanded && moment.betterAlternative && (
                          <div className="mt-3 p-4 rounded-lg bg-hh-primary/5 border border-hh-primary/15">
                            <div className="flex gap-2 items-start">
                              <Lightbulb className="w-4 h-4 text-hh-primary flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[12px] font-medium text-hh-primary mb-1">Wat had je kunnen zeggen?</p>
                                <p className="text-[14px] leading-[20px] text-hh-text">"{moment.betterAlternative}"</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-hh-border/50">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-[12px]"
                            onClick={() => setExpandedMoment(isExpanded ? null : moment.id)}
                          >
                            {isExpanded ? (
                              <><ChevronDown className="w-3.5 h-3.5" /> Inklappen</>
                            ) : (
                              <><Lightbulb className="w-3.5 h-3.5" /> Wat had beter geweest?</>
                            )}
                          </Button>
                          {moment.type !== 'big_win' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-[12px] border-hh-primary/30 text-hh-primary hover:bg-hh-primary/5"
                              onClick={() => startReplay(moment)}
                            >
                              <Play className="w-3.5 h-3.5" /> Replay vanaf hier
                            </Button>
                          )}
                          {moment.recommendedTechniques.length > 0 && (
                            <div className="flex gap-1 ml-auto flex-wrap">
                              {moment.recommendedTechniques.map((t, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] text-hh-muted" title={t}>
                                  {getTechniekByNummer(t)?.naam || t}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {isExpanded && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-[11px] text-hh-muted"
                              disabled={actionLoading === `${moment.id}-three_options`}
                              onClick={() => runCoachAction(moment.id, 'three_options')}
                            >
                              {actionLoading === `${moment.id}-three_options` ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
                              3 antwoord-opties
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-[11px] text-hh-muted"
                              disabled={actionLoading === `${moment.id}-micro_drill`}
                              onClick={() => runCoachAction(moment.id, 'micro_drill')}
                            >
                              {actionLoading === `${moment.id}-micro_drill` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                              1 zin oefenen
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-[11px] text-hh-muted"
                              disabled={actionLoading === `${moment.id}-hugo_demo`}
                              onClick={() => runCoachAction(moment.id, 'hugo_demo')}
                            >
                              {actionLoading === `${moment.id}-hugo_demo` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                              Laat Hugo het voordoen
                            </Button>
                          </div>
                        )}

                        {actionResult && actionResult.momentId === moment.id && (
                          <div ref={actionResult?.momentId === moment.id ? actionResultRef : undefined} className="mt-3 p-4 rounded-lg bg-hh-ui-50 border border-hh-border">
                            {actionResult.type === 'three_options' && actionResult.data.options && (
                              <div className="space-y-2">
                                <p className="text-[12px] font-medium text-hh-primary mb-2">3 antwoord-opties:</p>
                                {actionResult.data.options.map((opt: any, i: number) => (
                                  <div key={i} className="p-3 rounded-lg bg-white border border-hh-border">
                                    <span className="text-[11px] font-medium text-hh-primary">{opt.style}</span>
                                    <p className="text-[13px] leading-[18px] text-hh-text mt-1">"{opt.text}"</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {actionResult.type === 'micro_drill' && actionResult.data.drill && (
                              <div className="space-y-2">
                                <p className="text-[12px] font-medium text-hh-primary">Micro-drill:</p>
                                <p className="text-[13px] leading-[18px] text-hh-text">{actionResult.data.drill.instruction}</p>
                                <div className="p-3 rounded-lg bg-white border border-hh-border mt-2">
                                  <span className="text-[11px] font-medium text-hh-muted">Voorbeeld:</span>
                                  <p className="text-[13px] leading-[18px] text-hh-text mt-1">"{actionResult.data.drill.example}"</p>
                                </div>
                              </div>
                            )}
                            {actionResult.type === 'hugo_demo' && actionResult.data.demo && (
                              <div className="space-y-2">
                                <p className="text-[12px] font-medium text-hh-primary">Hugo zou zeggen:</p>
                                <div className="p-3 rounded-lg bg-white border border-hh-primary/20">
                                  <p className="text-[14px] leading-[20px] text-hh-text">"{actionResult.data.demo.response}"</p>
                                </div>
                                <p className="text-[12px] leading-[16px] text-hh-muted">{actionResult.data.demo.reasoning}</p>
                              </div>
                            )}
                            {actionResult.data.error && (
                              <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p className="text-[13px]">{actionResult.data.error}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 rounded-[16px] shadow-hh-sm border-hh-border text-center">
                <Sparkles className="w-8 h-8 text-hh-muted mx-auto mb-3" />
                <p className="text-[14px] text-hh-muted">Coach momenten worden gegenereerd bij nieuwe analyses.</p>
              </Card>
            );
          })()}

          {insights.coachDebrief && insights.coachDebrief.messages.length > 0 && (
            <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-border">
              <h4 className="text-hh-text mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-hh-primary" />
                Hugo's Debrief
              </h4>
              <div className="space-y-3">
                {insights.coachDebrief.messages.map((msg, i) => {
                  if (msg.type === 'coach_text' && msg.text) {
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-hh-primary/10 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-hh-primary" />
                        </div>
                        <div className="bg-hh-ui-50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                          <p className="text-[14px] leading-[22px] text-hh-text">{msg.text}</p>
                        </div>
                      </div>
                    );
                  }
                  if (msg.type === 'moment_ref' && msg.momentId) {
                    const refMoment = (insights.moments || []).find(m => m.id === msg.momentId);
                    if (!refMoment) return null;
                    const typeLabels: Record<string, { label: string; color: string }> = {
                      'big_win': { label: 'Big Win', color: 'text-emerald-600' },
                      'quick_fix': { label: 'Quick Fix', color: 'text-amber-600' },
                      'turning_point': { label: 'Scharnierpunt', color: 'text-rose-600' },
                    };
                    const tl = typeLabels[refMoment.type] || typeLabels['quick_fix'];
                    return (
                      <div key={i} className="flex gap-3 ml-11">
                        <button
                          onClick={() => setExpandedMoment(expandedMoment === refMoment.id ? null : refMoment.id)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-hh-border hover:border-hh-primary/30 hover:bg-hh-primary/5 transition-colors text-left"
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-hh-primary" />
                          <span className={`text-[12px] font-medium ${tl.color}`}>{tl.label}:</span>
                          <span className="text-[13px] text-hh-text">{refMoment.label}</span>
                        </button>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-hh-border">
                <Button className="gap-2" onClick={() => navigate?.("talk-to-hugo")}>
                  Bespreek met Hugo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}
          {replayMoment && (<div ref={replayRef}>
            <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-primary/20 bg-gradient-to-b from-hh-primary/5 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-hh-text flex items-center gap-2">
                  <Play className="w-5 h-5 text-hh-primary" />
                  Replay: {replayMoment.label}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-hh-muted"
                  onClick={() => { setReplayMoment(null); setReplayHistory([]); setReplayFeedback(null); setReplayContext(null); }}
                >
                  <X className="w-4 h-4" /> Sluiten
                </Button>
              </div>

              {replayContext?.error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-[13px]">{replayContext.goal}</p>
                  </div>
                </div>
              )}

              {replayContext && !replayContext.error && (
                <div className="mb-4 p-3 rounded-lg bg-white/80 border border-hh-border">
                  <p className="text-[12px] font-medium text-hh-primary mb-1">Doel van deze oefening:</p>
                  <p className="text-[13px] leading-[18px] text-hh-text">{replayContext.goal}</p>
                  {replayContext.recommendedTechniques?.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {replayContext.recommendedTechniques.map((t: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px]" title={t}>{getTechniekByNummer(t)?.naam || t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                {replayContext?.context?.map((turn: any, i: number) => (
                  <ChatBubble
                    key={`ctx-${i}`}
                    speaker={turn.speaker === 'seller' ? 'seller' : 'customer'}
                    text={turn.text}
                    label={turn.speaker === 'seller' ? 'Jij (origineel)' : 'Klant (origineel)'}
                    variant="faded"
                  />
                ))}

                {replayHistory.map((msg, i) => (
                  <ChatBubble
                    key={`replay-${i}`}
                    speaker={msg.role === 'seller' ? 'seller' : 'customer'}
                    text={msg.content}
                    label={msg.role === 'seller' ? 'Jij (replay)' : 'Klant'}
                  />
                ))}

                {replayLoading && (
                  <div className="flex gap-2">
                    <div className="px-3 py-2 rounded-2xl bg-hh-ui-50 rounded-bl-md">
                      <Loader2 className="w-4 h-4 animate-spin text-hh-muted" />
                    </div>
                  </div>
                )}
              </div>

              {replayFeedback && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex gap-2 items-start">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] leading-[18px] text-hh-text">{replayFeedback}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={replayInput}
                  onChange={(e) => setReplayInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendReplayMessage()}
                  placeholder="Typ je antwoord als verkoper..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-hh-border bg-white text-[14px] text-hh-text placeholder:text-hh-muted/50 focus:outline-none focus:border-hh-primary/50 focus:ring-2 focus:ring-hh-primary/10"
                  disabled={replayLoading}
                />
                <Button
                  onClick={sendReplayMessage}
                  disabled={!replayInput.trim() || replayLoading}
                  className="gap-1.5"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>)}
        </div>)}

          {activeTab === 'timeline' && (<div className="mt-6">
            <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-border">
              <h3 className="text-hh-text mb-2">Transcript met EPIC Evaluatie</h3>
              <p className="text-[14px] leading-[20px] text-hh-muted mb-6">
                Gesprek als chat met gedetecteerde technieken, klantsignalen en fase-indicatie
              </p>

              <div className="space-y-3">
                {(() => {
                  let lastPhase: number | null = null;
                  return transcript.map((turn) => {
                    const evaluation = evaluations.find(e => e.turnIdx === turn.idx);
                    const signal = signals.find(s => s.turnIdx === turn.idx);
                    const currentPhase = determinePhaseForTurn(turn.idx);
                    const showPhaseDivider = currentPhase !== null && currentPhase !== lastPhase;
                    if (currentPhase !== null) lastPhase = currentPhase;

                    return (
                      <div key={turn.idx}>
                        {showPhaseDivider && currentPhase && (
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-hh-border" />
                            <span className={`text-[12px] font-semibold px-3 py-1 rounded-full border ${PHASE_LABELS[currentPhase].bgColor} ${PHASE_LABELS[currentPhase].color}`}>
                              {PHASE_LABELS[currentPhase].name}
                            </span>
                            <span className="text-[11px] text-hh-muted hidden sm:inline">{PHASE_LABELS[currentPhase].description}</span>
                            <div className="flex-1 h-px bg-hh-border" />
                          </div>
                        )}
                        <ChatBubble
                          speaker={turn.speaker === 'seller' ? 'seller' : 'customer'}
                          text={turn.text}
                          timestamp={formatTime(turn.startMs)}
                        >
                          <div className="flex flex-wrap items-center gap-1.5">
                            {turn.speaker === 'customer' && signal && signal.houding !== 'neutraal' && (
                              <Badge className={`${getSignalLabel(signal.houding).color} text-[10px] px-2 py-0.5`}>
                                {getSignalLabel(signal.houding).label}
                              </Badge>
                            )}
                            {evaluation && evaluation.techniques.length > 0 && evaluation.techniques.map((tech, i) => {
                              const badge = getQualityBadge(tech.quality);
                              return (
                                <Badge key={i} variant="outline" className={`text-[10px] px-2 py-0.5 ${badge.color}`}>
                                  {tech.quality === 'gemist' ? '✗' : '✓'} {tech.naam || tech.id}
                                </Badge>
                              );
                            })}
                          </div>
                        </ChatBubble>
                      </div>
                    );
                  });
                })()}
              </div>
            </Card>
          </div>)}

      </div>
    </Layout>
  );
}