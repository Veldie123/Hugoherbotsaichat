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
  Pencil,
  Save,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
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
  const conversationStorageKey = `viewedCoachMoments_${navigationData?.conversationId || sessionStorage.getItem('analysisId') || 'default'}`;
  const [viewedMoments, setViewedMoments] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(conversationStorageKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const markMomentViewed = (momentId: string) => {
    setViewedMoments(prev => {
      const next = new Set(prev);
      next.add(momentId);
      try { localStorage.setItem(conversationStorageKey, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const [replayMoment, setReplayMoment] = useState<CoachMoment | null>(null);
  const [replayContext, setReplayContext] = useState<any>(null);
  const [replayHistory, setReplayHistory] = useState<Array<{ role: 'seller' | 'customer'; content: string }>>([]);
  const [replayInput, setReplayInput] = useState('');
  const [replayLoading, setReplayLoading] = useState(false);
  const [replayFeedback, setReplayFeedback] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ momentId: string; type: string; data: any } | null>(null);
  const [debriefExpanded, setDebriefExpanded] = useState(false);
  const [editingDebrief, setEditingDebrief] = useState(false);
  const [editedOneliner, setEditedOneliner] = useState('');
  const [editedEpicMomentum, setEditedEpicMomentum] = useState('');
  const [editingMomentId, setEditingMomentId] = useState<string | null>(null);
  const [editedMomentLabel, setEditedMomentLabel] = useState('');
  const [editedMomentWhy, setEditedMomentWhy] = useState('');
  const [editedMomentAlt, setEditedMomentAlt] = useState('');
  const [submittingCorrection, setSubmittingCorrection] = useState(false);

  const [resolvedConversationId, setResolvedConversationId] = useState<string | null>(
    navigationData?.conversationId || sessionStorage.getItem('analysisId') || null
  );

  const [processingStep, setProcessingStep] = useState<string | null>(null);

  const replayRef = useRef<HTMLDivElement>(null);
  const actionResultRef = useRef<HTMLDivElement>(null);

  const conversationId = resolvedConversationId;

  const submitCorrection = async (type: string, field: string, originalValue: string, newValue: string, context?: string) => {
    if (originalValue === newValue) return;
    setSubmittingCorrection(true);
    try {
      const response = await fetch('/api/v2/admin/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: result?.conversation?.id || conversationId,
          type,
          field,
          originalValue,
          newValue,
          context: context || `Analysis: ${result?.conversation?.title}`,
          submittedBy: 'admin',
        }),
      });
      if (response.ok) {
        toast?.('Correctie ingediend voor review', { description: 'Verschijnt in Config Review' });
      } else {
        toast?.('Fout bij indienen correctie');
      }
    } catch (err) {
      console.error('Correction submit error:', err);
      toast?.('Fout bij indienen correctie');
    } finally {
      setSubmittingCorrection(false);
      setEditingDebrief(false);
      setEditingMomentId(null);
    }
  };

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

  const wrapLayout = (children: React.ReactNode) => {
    if (useAdminLayout) {
      return <AdminLayout currentPage="admin-uploads" navigate={navigate as (page: string) => void}>{children}</AdminLayout>;
    }
    return <AppLayout currentPage="analysis" navigate={navigate} isAdmin={isAdmin}>{children}</AppLayout>;
  };

  if (loading || processingStep) {
    return wrapLayout(
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <Loader2 className={`w-8 h-8 ${isAdmin ? 'text-purple-600' : 'text-hh-primary'} animate-spin mx-auto`} />
          <p className="text-hh-text font-medium">{processingStep || 'Resultaten laden...'}</p>
          {processingStep && (
            <p className="text-[14px] leading-[20px] text-hh-muted">
              Dit kan enkele minuten duren afhankelijk van de lengte van het gesprek.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error || !result) {
    return wrapLayout(
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-hh-destructive mx-auto" />
          <p className="text-hh-text">{error || 'Geen resultaten gevonden'}</p>
          <Button variant="outline" onClick={() => navigate?.("upload-analysis")}>
            Terug naar uploads
          </Button>
        </div>
      </div>
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

  return wrapLayout(
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
            <div>
              <h1 className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[40px]">
                {conversation.title}
              </h1>
              <p className="text-[13px] text-hh-muted mt-1 flex items-center gap-1.5 flex-wrap">
                <span>{new Date(conversation.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="text-hh-border">·</span>
                <span>{transcript.length} turns</span>
                {transcript.length > 0 && (
                  <>
                    <span className="text-hh-border">·</span>
                    <span>{formatTime(transcript[transcript.length - 1].endMs)}</span>
                  </>
                )}
                <span className="text-hh-border">·</span>
                <span className={`font-semibold ${getScoreColor(overallScore)}`}>{overallScore}%</span>
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-[12px] flex-shrink-0" onClick={handleExportPDF}>
              <Download className="w-3.5 h-3.5" />
              PDF
            </Button>
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
                  ? isAdmin ? 'bg-purple-600 text-white' : 'bg-hh-primary text-white'
                  : 'text-hh-text/60 hover:text-hh-text hover:bg-hh-ui-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Phase scores only shown in timeline tab */}

        {activeTab === 'coach' && (<div className="space-y-5 max-w-[720px]">

          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full ${isAdmin ? 'bg-purple-600' : 'bg-hh-primary'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              {isAdmin && editingDebrief ? (
                <div className="space-y-2">
                  <textarea
                    value={editedOneliner}
                    onChange={(e) => setEditedOneliner(e.target.value)}
                    className="w-full px-3 py-2 text-[15px] leading-[22px] border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                    rows={2}
                  />
                  <textarea
                    value={editedEpicMomentum}
                    onChange={(e) => setEditedEpicMomentum(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] leading-[20px] border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="gap-1.5 text-[12px] bg-purple-600 hover:bg-purple-700"
                      disabled={submittingCorrection}
                      onClick={() => {
                        submitCorrection('coach_debrief', 'oneliner', insights.coachDebrief?.oneliner || '', editedOneliner, 'Coach oneliner correctie');
                        if (editedEpicMomentum !== (insights.coachDebrief?.epicMomentum || '')) {
                          submitCorrection('coach_debrief', 'epicMomentum', insights.coachDebrief?.epicMomentum || '', editedEpicMomentum, 'EPIC momentum correctie');
                        }
                      }}
                    >
                      <Save className="w-3.5 h-3.5" /> Indienen voor review
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[12px]"
                      onClick={() => setEditingDebrief(false)}
                    >
                      Annuleren
                    </Button>
                  </div>
                  <p className="text-[11px] text-purple-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Correcties gaan eerst naar Config Review
                  </p>
                </div>
              ) : (
                <div className="relative group">
                  <p className="text-[15px] sm:text-[16px] leading-[24px] text-hh-text font-medium" style={{ overflowWrap: 'break-word' }}>
                    {insights.coachDebrief?.oneliner || `Laten we je gesprek samen doornemen.`}
                  </p>
                  <p className="text-[13px] sm:text-[14px] leading-[20px] text-hh-muted mt-1.5" style={{ overflowWrap: 'break-word' }}>
                    {insights.coachDebrief?.epicMomentum || `De EPIC-flow wordt geanalyseerd.`}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setEditedOneliner(insights.coachDebrief?.oneliner || '');
                        setEditedEpicMomentum(insights.coachDebrief?.epicMomentum || '');
                        setEditingDebrief(true);
                      }}
                      className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600"
                      title="Correctie indienen"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 sm:mt-4">
                {phaseScores.map((ps, idx) => (
                  <span key={ps.phase} className="text-[11px] sm:text-[12px] text-hh-muted whitespace-nowrap">
                    {ps.sublabel} <span className={`font-semibold ${getScoreColor(ps.score)}`}>{ps.score}%</span>
                  </span>
                ))}
              </div>

              {insights.coachDebrief && insights.coachDebrief.messages.length > 0 && (() => {
                const allMessages = insights.coachDebrief.messages;
                const visibleMessages = debriefExpanded ? allMessages : allMessages.slice(0, 1);
                const hasMore = allMessages.length > 1;

                const renderMessage = (msg: CoachDebriefMessage, i: number) => {
                  if (msg.type === 'coach_text' && msg.text) {
                    return (
                      <p key={i} className="text-[13px] sm:text-[14px] leading-[20px] sm:leading-[22px] text-hh-text/80" style={{ overflowWrap: 'break-word' }}>{msg.text}</p>
                    );
                  }
                  if (msg.type === 'moment_ref' && msg.momentId) {
                    const refMoment = (insights.moments || []).find(m => m.id === msg.momentId);
                    if (!refMoment) return null;
                    const typeLabels: Record<string, { label: string; color: string; bg: string; border: string }> = {
                      'big_win': { label: 'Big Win', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                      'quick_fix': { label: 'Quick Fix', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
                      'turning_point': { label: 'Scharnierpunt', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
                    };
                    const tl = typeLabels[refMoment.type] || typeLabels['quick_fix'];
                    return (
                      <button
                        key={i}
                        onClick={() => { setExpandedMoment(expandedMoment === refMoment.id ? null : refMoment.id); markMomentViewed(refMoment.id); }}
                        className={`flex items-start gap-2 w-full text-left px-3 py-2 rounded-lg ${tl.bg} border ${tl.border} hover:opacity-80 transition-opacity`}
                      >
                        <ArrowRight className={`w-3.5 h-3.5 ${tl.color} flex-shrink-0 mt-0.5`} />
                        <div className="min-w-0">
                          <span className={`text-[11px] font-semibold uppercase tracking-wider ${tl.color}`}>{tl.label}</span>
                          <p className="text-[13px] leading-[18px] text-hh-text mt-0.5">{refMoment.label}</p>
                        </div>
                      </button>
                    );
                  }
                  return null;
                };

                return (
                  <div className="mt-4 pt-4 border-t border-hh-border/50 space-y-2.5">
                    {visibleMessages.map((msg, i) => renderMessage(msg, i))}

                    {hasMore && (
                      <button
                        onClick={() => setDebriefExpanded(!debriefExpanded)}
                        className={`flex items-center gap-1 text-[13px] font-medium ${isAdmin ? 'text-purple-600' : 'text-hh-primary'} hover:underline mt-1`}
                      >
                        {debriefExpanded ? (
                          <><ChevronDown className="w-3.5 h-3.5" /> Minder tonen</>
                        ) : (
                          <><ChevronRight className="w-3.5 h-3.5" /> Lees meer</>
                        )}
                      </button>
                    )}

                    <div className="pt-4 mt-2">
                      <Button size="sm" className="gap-1.5 text-[13px] bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate?.("talk-to-hugo")}>
                        Bespreek met Hugo <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="h-px bg-hh-border/60" />

          {(() => {
            const moments = insights.moments || [];
            const momentConfig: Record<string, { icon: any; accentBorder: string; color: string; label: string }> = {
              'big_win': { icon: Trophy, accentBorder: 'border-l-emerald-500', color: 'text-emerald-600', label: 'Big Win' },
              'quick_fix': { icon: Wrench, accentBorder: 'border-l-amber-500', color: 'text-amber-600', label: 'Quick Fix' },
              'turning_point': { icon: RotateCcw, accentBorder: 'border-l-rose-500', color: 'text-rose-600', label: 'Scharnierpunt' },
            };

            return moments.length > 0 ? (
              <div className="space-y-3">
                {moments.map((moment) => {
                  const config = momentConfig[moment.type] || momentConfig['quick_fix'];
                  const MomentIcon = config.icon;
                  const isExpanded = expandedMoment === moment.id;
                  const isNew = !viewedMoments.has(moment.id);

                  return (
                    <div key={moment.id} className={`rounded-xl border border-hh-border/60 border-l-[3px] ${config.accentBorder} bg-white overflow-hidden shadow-sm`}>
                      <button
                        onClick={() => { setExpandedMoment(isExpanded ? null : moment.id); markMomentViewed(moment.id); }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-hh-ui-50/30 transition-colors"
                      >
                        <MomentIcon className={`w-4 h-4 ${config.color} flex-shrink-0`} strokeWidth={1.75} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${config.color}`}>{config.label}</span>
                            <span className="text-[11px] text-hh-muted font-normal">{moment.timestamp}</span>
                            {isNew && <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-purple-600' : 'bg-hh-primary'} flex-shrink-0`} />}
                          </div>
                          <p className="text-[13px] sm:text-[14px] font-normal text-hh-text mt-0.5 truncate">{moment.label}</p>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 text-hh-muted/60 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-hh-border/30 space-y-4">
                          <p className="text-[13px] sm:text-[14px] leading-[22px] text-hh-text/70 font-normal mt-2">{moment.whyItMatters}</p>

                          {(moment.sellerText || moment.customerText) && (
                            <div className="p-3 rounded-lg bg-hh-ui-50/60 border border-hh-border/20 space-y-2">
                              {moment.sellerText && (
                                <ChatBubble compact speaker="seller" text={moment.sellerText.length > 200 ? moment.sellerText.substring(0, 200) + '...' : moment.sellerText} />
                              )}
                              {moment.customerText && (
                                <ChatBubble compact speaker="customer" text={moment.customerText.length > 200 ? moment.customerText.substring(0, 200) + '...' : moment.customerText} />
                              )}
                            </div>
                          )}

                          {moment.betterAlternative && moment.type !== 'big_win' && (
                            <div className={`p-3 rounded-lg ${isAdmin ? 'bg-purple-600/5 border-purple-600/10' : 'bg-hh-primary/5 border-hh-primary/10'} border`}>
                              <div className="flex gap-2 items-start">
                                <Lightbulb className={`w-4 h-4 ${isAdmin ? 'text-purple-600' : 'text-hh-primary'} flex-shrink-0 mt-0.5`} />
                                <div>
                                  <p className={`text-[11px] font-medium ${isAdmin ? 'text-purple-600' : 'text-hh-primary'} mb-0.5`}>Wat had je kunnen zeggen?</p>
                                  <p className="text-[13px] leading-[19px] text-hh-text">"{moment.betterAlternative}"</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {moment.recommendedTechniques.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap">
                              {moment.recommendedTechniques.map((t, i) => (
                                <Badge key={i} variant="outline" className={`text-[10px] px-2 py-0.5 ${isAdmin ? 'text-purple-600 border-purple-600/20 bg-purple-600/5' : 'text-hh-primary border-hh-primary/20 bg-hh-primary/5'}`} title={t}>
                                  {getTechniekByNummer(t)?.naam || t}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {isAdmin && (
                            <div className="pt-3 border-t border-purple-200/60">
                              {editingMomentId === moment.id ? (
                                <div className="space-y-2">
                                  <div>
                                    <label className="text-[11px] font-medium text-purple-600 mb-1 block">Moment label</label>
                                    <input
                                      value={editedMomentLabel}
                                      onChange={(e) => setEditedMomentLabel(e.target.value)}
                                      className="w-full px-3 py-1.5 text-[13px] border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-medium text-purple-600 mb-1 block">Waarom belangrijk</label>
                                    <textarea
                                      value={editedMomentWhy}
                                      onChange={(e) => setEditedMomentWhy(e.target.value)}
                                      className="w-full px-3 py-1.5 text-[13px] border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                                      rows={2}
                                    />
                                  </div>
                                  {moment.betterAlternative && (
                                    <div>
                                      <label className="text-[11px] font-medium text-purple-600 mb-1 block">Beter alternatief</label>
                                      <textarea
                                        value={editedMomentAlt}
                                        onChange={(e) => setEditedMomentAlt(e.target.value)}
                                        className="w-full px-3 py-1.5 text-[13px] border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                                        rows={2}
                                      />
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      className="gap-1.5 text-[12px] bg-purple-600 hover:bg-purple-700"
                                      disabled={submittingCorrection}
                                      onClick={() => {
                                        if (editedMomentLabel !== moment.label) submitCorrection('moment', 'label', moment.label, editedMomentLabel, `Moment: ${moment.id}`);
                                        if (editedMomentWhy !== moment.whyItMatters) submitCorrection('moment', 'whyItMatters', moment.whyItMatters, editedMomentWhy, `Moment: ${moment.id}`);
                                        if (editedMomentAlt !== (moment.betterAlternative || '')) submitCorrection('moment', 'betterAlternative', moment.betterAlternative || '', editedMomentAlt, `Moment: ${moment.id}`);
                                      }}
                                    >
                                      <Save className="w-3.5 h-3.5" /> Indienen voor review
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-[12px]" onClick={() => setEditingMomentId(null)}>
                                      Annuleren
                                    </Button>
                                  </div>
                                  <p className="text-[11px] text-purple-500 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Correcties gaan eerst naar Config Review
                                  </p>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingMomentId(moment.id);
                                    setEditedMomentLabel(moment.label);
                                    setEditedMomentWhy(moment.whyItMatters);
                                    setEditedMomentAlt(moment.betterAlternative || '');
                                  }}
                                  className="flex items-center gap-1.5 text-[12px] text-purple-600 hover:text-purple-700 font-medium"
                                >
                                  <Pencil className="w-3 h-3" /> Correctie indienen
                                </button>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-3 border-t border-hh-border/30">
                            {moment.type !== 'big_win' && (
                              <Button
                                size="sm"
                                className="gap-1 sm:gap-1.5 text-[11px] sm:text-[12px] h-8 px-2.5 sm:px-3 bg-hh-ink hover:bg-hh-ink/90 text-white"
                                onClick={() => startReplay(moment)}
                              >
                                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Replay
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 sm:gap-1.5 text-[11px] sm:text-[12px] h-8 px-2.5 sm:px-3 border-hh-border text-hh-text hover:bg-hh-ui-50"
                              disabled={actionLoading === `${moment.id}-three_options`}
                              onClick={() => runCoachAction(moment.id, 'three_options')}
                            >
                              {actionLoading === `${moment.id}-three_options` ? <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" /> : <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-hh-muted" />}
                              3 opties
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 sm:gap-1.5 text-[11px] sm:text-[12px] h-8 px-2.5 sm:px-3 border-hh-border text-hh-text hover:bg-hh-ui-50"
                              disabled={actionLoading === `${moment.id}-micro_drill`}
                              onClick={() => runCoachAction(moment.id, 'micro_drill')}
                            >
                              {actionLoading === `${moment.id}-micro_drill` ? <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" /> : <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-hh-muted" />}
                              Drill
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 sm:gap-1.5 text-[11px] sm:text-[12px] h-8 px-2.5 sm:px-3 border-hh-border text-hh-text hover:bg-hh-ui-50"
                              disabled={actionLoading === `${moment.id}-hugo_demo`}
                              onClick={() => runCoachAction(moment.id, 'hugo_demo')}
                            >
                              {actionLoading === `${moment.id}-hugo_demo` ? <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" /> : <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-hh-muted" />}
                              Hugo demo
                            </Button>
                          </div>

                          {actionResult && actionResult.momentId === moment.id && (
                            <div ref={actionResult?.momentId === moment.id ? actionResultRef : undefined} className="mt-3 p-4 rounded-lg bg-hh-ui-50 border border-hh-border">
                              {actionResult.type === 'three_options' && actionResult.data.options && (
                                <div className="space-y-2">
                                  <p className={`text-[12px] font-medium ${isAdmin ? 'text-purple-600' : 'text-hh-primary'} mb-2`}>3 antwoord-opties:</p>
                                  {actionResult.data.options.map((opt: any, i: number) => (
                                    <div key={i} className="p-3 rounded-lg bg-white border border-hh-border">
                                      <span className={`text-[11px] font-medium ${isAdmin ? 'text-purple-600' : 'text-hh-primary'}`}>{opt.style}</span>
                                      <p className="text-[13px] leading-[18px] text-hh-text mt-1">"{opt.text}"</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {actionResult.type === 'micro_drill' && actionResult.data.drill && (
                                <div className="space-y-2">
                                  <p className={`text-[12px] font-medium ${isAdmin ? 'text-purple-600' : 'text-hh-primary'}`}>Micro-drill:</p>
                                  <p className="text-[13px] leading-[18px] text-hh-text">{actionResult.data.drill.instruction}</p>
                                  <div className="p-3 rounded-lg bg-white border border-hh-border mt-2">
                                    <span className="text-[11px] font-medium text-hh-muted">Voorbeeld:</span>
                                    <p className="text-[13px] leading-[18px] text-hh-text mt-1">"{actionResult.data.drill.example}"</p>
                                  </div>
                                </div>
                              )}
                              {actionResult.type === 'hugo_demo' && actionResult.data.demo && (
                                <div className="space-y-2">
                                  <p className={`text-[12px] font-medium ${isAdmin ? 'text-purple-600' : 'text-hh-primary'}`}>Hugo zou zeggen:</p>
                                  <div className={`p-3 rounded-lg bg-white border ${isAdmin ? 'border-purple-600/20' : 'border-hh-primary/20'}`}>
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
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Sparkles className="w-6 h-6 text-hh-muted mx-auto mb-2" />
                <p className="text-[14px] text-hh-muted">Coach momenten worden gegenereerd bij nieuwe analyses.</p>
              </div>
            );
          })()}
          {replayMoment && (<div ref={replayRef}>
            <Card className={`p-6 rounded-[16px] shadow-hh-sm ${isAdmin ? 'border-purple-600/20 bg-gradient-to-b from-purple-600/5 to-transparent' : 'border-hh-primary/20 bg-gradient-to-b from-hh-primary/5 to-transparent'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-hh-text flex items-center gap-2">
                  <Play className={`w-5 h-5 ${isAdmin ? 'text-purple-600' : 'text-hh-primary'}`} />
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
                  <p className={`text-[12px] font-medium ${isAdmin ? 'text-purple-600' : 'text-hh-primary'} mb-1`}>Doel van deze oefening:</p>
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
                  className={`flex-1 px-4 py-2.5 rounded-xl border border-hh-border bg-white text-[14px] text-hh-text placeholder:text-hh-muted/50 focus:outline-none ${isAdmin ? 'focus:border-purple-600/50 focus:ring-2 focus:ring-purple-600/10' : 'focus:border-hh-primary/50 focus:ring-2 focus:ring-hh-primary/10'}`}
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
            <Card className="p-4 sm:p-6 rounded-[16px] shadow-hh-sm border-hh-border max-w-[780px]">
              <h3 className="text-hh-text mb-2">Transcript met EPIC Evaluatie</h3>
              <p className="text-[13px] sm:text-[14px] leading-[20px] text-hh-muted mb-6">
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
  );
}