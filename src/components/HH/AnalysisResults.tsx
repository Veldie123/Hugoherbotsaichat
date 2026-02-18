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

  const [transcriptReplay, setTranscriptReplay] = useState<{
    active: boolean;
    fromTurnIdx: number;
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    loading: boolean;
    feedback: string | null;
    turnCount: number;
  }>({ active: false, fromTurnIdx: -1, messages: [], loading: false, feedback: null, turnCount: 0 });
  const [transcriptReplayInput, setTranscriptReplayInput] = useState('');
  const transcriptReplayRef = useRef<HTMLDivElement>(null);
  const transcriptReplayInputRef = useRef<HTMLTextAreaElement>(null);

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
    if (score >= 70) return "text-hh-success";
    if (score >= 50) return "text-hh-warn";
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

  const startTranscriptReplay = (turnIdx: number) => {
    if (!result) return;

    const turnsUpTo = result.transcript.filter(t => t.idx < turnIdx);
    const lastCustomerTurn = [...turnsUpTo].reverse().find(t => t.speaker === 'customer');
    const customerText = lastCustomerTurn?.text || 'Ga verder...';

    setTranscriptReplay({
      active: true,
      fromTurnIdx: turnIdx,
      messages: [{ role: 'assistant', content: customerText }],
      loading: false,
      feedback: null,
      turnCount: 0,
    });
    setTranscriptReplayInput('');

    setTimeout(() => {
      transcriptReplayInputRef.current?.focus();
      transcriptReplayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const sendTranscriptReplayMessage = () => {
    const msg = transcriptReplayInput.trim();
    if (!msg || transcriptReplay.loading || !result) return;

    const newMessages = [...transcriptReplay.messages, { role: 'user' as const, content: msg }];
    const newTurnCount = transcriptReplay.turnCount + 1;
    setTranscriptReplayInput('');
    setTranscriptReplay(prev => ({ ...prev, messages: newMessages, loading: true, turnCount: newTurnCount }));

    const turnsUpTo = result.transcript.filter(t => t.idx < transcriptReplay.fromTurnIdx);
    const contextSummary = turnsUpTo.slice(-8).map(t => `${t.speaker === 'seller' ? 'Verkoper' : 'Klant'}: ${t.text}`).join('\n');
    const originalSellerText = result.transcript.find(t => t.idx === transcriptReplay.fromTurnIdx)?.text || '';

    const shouldGiveFeedback = newTurnCount >= 3;

    const conversationHistory = newMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    const message = shouldGiveFeedback
      ? `[SYSTEM] Je bent nu Hugo, de sales coach. De verkoper heeft dit deel van het gesprek opnieuw gespeeld. Geef korte, constructieve feedback vergeleken met het origineel. Wees bemoedigend maar eerlijk. Max 4 zinnen. Spreek Nederlands.

Origineel antwoord verkoper: "${originalSellerText}"

Replay gesprek:
${newMessages.map(m => `${m.role === 'user' ? 'Verkoper' : 'Klant'}: ${m.content}`).join('\n')}`
      : `[SYSTEM] Je bent een klant in een verkoopgesprek. Speel de klant op basis van dit eerdere gesprek:
${contextSummary}

De verkoper probeert dit moment opnieuw. Blijf in karakter. Antwoord kort en natuurlijk (1-3 zinnen). Spreek Nederlands.

${msg}`;

    fetch('/api/v2/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        conversationHistory: shouldGiveFeedback ? [] : conversationHistory.slice(0, -1),
        sourceApp: 'transcript-replay',
      }),
    })
      .then(r => r.json())
      .then(data => {
        const response = data.response || data.message || '';
        if (shouldGiveFeedback) {
          setTranscriptReplay(prev => ({ ...prev, loading: false, feedback: response }));
        } else {
          setTranscriptReplay(prev => ({
            ...prev,
            loading: false,
            messages: [...prev.messages, { role: 'assistant', content: response }],
          }));
        }
        setTimeout(() => {
          transcriptReplayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
          transcriptReplayInputRef.current?.focus();
        }, 100);
      })
      .catch(() => {
        setTranscriptReplay(prev => ({ ...prev, loading: false }));
        toast.error('Fout bij replay');
      });
  };

  const exitTranscriptReplay = () => {
    setTranscriptReplay({ active: false, fromTurnIdx: -1, messages: [], loading: false, feedback: null, turnCount: 0 });
    setTranscriptReplayInput('');
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
  const adminColors = useAdminLayout;

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
          <Loader2 className={`w-8 h-8 ${adminColors ? 'text-purple-600' : 'text-hh-primary'} animate-spin mx-auto`} />
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
                activeTab !== tab.value ? 'hover:bg-hh-ui-100' : ''
              }`}
              style={activeTab === tab.value
                ? { backgroundColor: adminColors ? '#9910FA' : '#3C9A6E', color: 'white' }
                : { color: '#4B5563' }
              }
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Phase scores only shown in timeline tab */}

        {activeTab === 'coach' && (<div className="max-w-[860px]">

          {/* SECTION 1: Score — Apple Health "big number" style */}
          <div className="flex items-center gap-8 mb-12">
            <div className="relative flex-shrink-0">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="7" />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke={adminColors ? '#9910FA' : '#3C9A6E'}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - overallScore / 100)}`}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[28px] font-bold text-hh-text leading-none">{overallScore}</span>
                <span className="text-[11px] text-hh-muted mt-0.5">%</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="relative group">
                {useAdminLayout && editingDebrief ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedOneliner}
                      onChange={(e) => setEditedOneliner(e.target.value)}
                      className="w-full px-3 py-2 text-[15px] leading-[22px] border rounded-lg focus:outline-none focus:ring-2 resize-none"
                      style={{ borderColor: '#9910FA40', outlineColor: '#9910FA' }}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1.5 text-[12px] text-white" style={{ backgroundColor: '#9910FA' }} disabled={submittingCorrection}
                        onClick={() => {
                          submitCorrection('coach_debrief', 'oneliner', insights.coachDebrief?.oneliner || '', editedOneliner, 'Coach oneliner correctie');
                          if (editedEpicMomentum !== (insights.coachDebrief?.epicMomentum || '')) {
                            submitCorrection('coach_debrief', 'epicMomentum', insights.coachDebrief?.epicMomentum || '', editedEpicMomentum, 'EPIC momentum correctie');
                          }
                        }}
                      >
                        <Save className="w-3.5 h-3.5" /> Indienen voor review
                      </Button>
                      <Button variant="outline" size="sm" className="text-[12px]" onClick={() => setEditingDebrief(false)}>Annuleren</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-[17px] sm:text-[18px] leading-[26px] text-hh-text font-semibold" style={{ overflowWrap: 'break-word' }}>
                      {insights.coachDebrief?.oneliner || `Laten we je gesprek samen doornemen.`}
                    </p>
                    {useAdminLayout && (
                      <button
                        onClick={() => {
                          setEditedOneliner(insights.coachDebrief?.oneliner || '');
                          setEditedEpicMomentum(insights.coachDebrief?.epicMomentum || '');
                          setEditingDebrief(true);
                        }}
                        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                        style={{ backgroundColor: '#9910FA15', color: '#9910FA' }}
                        title="Correctie indienen"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                {phaseScores.map((ps) => (
                  <div key={ps.phase} className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-hh-muted font-medium">{ps.sublabel}</span>
                      <span className={`text-[11px] font-semibold ${getScoreColor(ps.score)}`}>{ps.score}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${ps.score}%`,
                          backgroundColor: ps.score >= 60 ? (adminColors ? '#9910FA' : '#3C9A6E') : ps.score >= 30 ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: Three Moment Cards — horizontal 3-column grid */}
          {(() => {
            const moments = insights.moments || [];
            const momentConfig: Record<string, { icon: any; color: string; bg: string; iconBg: string; label: string }> = {
              'big_win': { icon: Trophy, color: '#047857', bg: '#ECFDF5', iconBg: '#D1FAE5', label: 'Big Win' },
              'quick_fix': { icon: Wrench, color: '#B45309', bg: '#FFFBEB', iconBg: '#FEF3C7', label: 'Quick Fix' },
              'turning_point': { icon: RotateCcw, color: '#BE123C', bg: '#FFF1F2', iconBg: '#FFE4E6', label: 'Scharnierpunt' },
            };

            return moments.length > 0 ? (
              <div className="grid grid-cols-3 gap-4 mb-12">
                {moments.slice(0, 3).map((moment) => {
                  const config = momentConfig[moment.type] || momentConfig['quick_fix'];
                  const MomentIcon = config.icon;
                  const isExpanded = expandedMoment === moment.id;

                  return (
                    <button
                      key={moment.id}
                      onClick={() => { setExpandedMoment(isExpanded ? null : moment.id); markMomentViewed(moment.id); }}
                      className="text-left rounded-2xl p-5 transition-all hover:shadow-md group"
                      style={{ backgroundColor: config.bg, border: isExpanded ? `2px solid ${config.color}30` : '2px solid transparent' }}
                    >
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: config.iconBg }}>
                          <MomentIcon className="w-4 h-4" style={{ color: config.color }} strokeWidth={1.75} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: config.color }}>{config.label}</span>
                      </div>
                      <p className="text-[14px] leading-[20px] text-hh-text font-medium" style={{ overflowWrap: 'break-word' }}>
                        {moment.label}
                      </p>
                      <span className="text-[11px] text-hh-muted mt-2 block">{moment.timestamp}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center mb-12">
                <Sparkles className="w-6 h-6 text-hh-muted mx-auto mb-2" />
                <p className="text-[14px] text-hh-muted">Coach momenten worden gegenereerd bij nieuwe analyses.</p>
              </div>
            );
          })()}

          {/* Expanded Detail Panel — appears below 3-column grid */}
          {expandedMoment && (() => {
            const moments = insights.moments || [];
            const moment = moments.find(m => m.id === expandedMoment);
            if (!moment) return null;
            const momentConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
              'big_win': { icon: Trophy, color: '#047857', bg: '#ECFDF5', label: 'Big Win' },
              'quick_fix': { icon: Wrench, color: '#B45309', bg: '#FFFBEB', label: 'Quick Fix' },
              'turning_point': { icon: RotateCcw, color: '#BE123C', bg: '#FFF1F2', label: 'Scharnierpunt' },
            };
            const config = momentConfig[moment.type] || momentConfig['quick_fix'];
            const MomentIcon = config.icon;

            return (
              <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-4 shadow-sm mb-12 -mt-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <MomentIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: config.color }} strokeWidth={1.75} />
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: config.color }}>{config.label}</span>
                      <p className="text-[15px] leading-[22px] text-hh-text font-medium mt-0.5" style={{ overflowWrap: 'break-word' }}>{moment.label}</p>
                    </div>
                  </div>
                  <button onClick={() => setExpandedMoment(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[14px] leading-[22px] text-hh-text/75" style={{ overflowWrap: 'break-word' }}>{moment.whyItMatters}</p>

                {(moment.sellerText || moment.customerText) && (
                  <div className="p-3 rounded-xl bg-gray-50 space-y-2">
                    {moment.sellerText && (
                      <ChatBubble compact speaker="seller" adminColors={adminColors} text={moment.sellerText.length > 200 ? moment.sellerText.substring(0, 200) + '...' : moment.sellerText} />
                    )}
                    {moment.customerText && (
                      <ChatBubble compact speaker="customer" adminColors={adminColors} text={moment.customerText.length > 200 ? moment.customerText.substring(0, 200) + '...' : moment.customerText} />
                    )}
                  </div>
                )}

                {moment.betterAlternative && moment.type !== 'big_win' && (
                  <div className="p-3 rounded-xl border" style={{ backgroundColor: adminColors ? '#9910FA08' : '#3C9A6E08', borderColor: adminColors ? '#9910FA15' : '#3C9A6E15' }}>
                    <div className="flex gap-2 items-start">
                      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: adminColors ? '#9910FA' : '#3C9A6E' }} />
                      <div>
                        <p className="text-[11px] font-medium mb-0.5" style={{ color: adminColors ? '#9910FA' : '#3C9A6E' }}>Wat had je kunnen zeggen?</p>
                        <p className="text-[13px] leading-[19px] text-hh-text">"{moment.betterAlternative}"</p>
                      </div>
                    </div>
                  </div>
                )}

                {moment.recommendedTechniques.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {moment.recommendedTechniques.map((t, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                        style={{ color: adminColors ? '#9910FA' : '#4F7396', borderColor: adminColors ? '#9910FA20' : '#4F739620', backgroundColor: adminColors ? '#9910FA08' : '#4F739608' }}
                        title={t}
                      >
                        {getTechniekByNummer(t)?.naam || t}
                      </span>
                    ))}
                  </div>
                )}

                {moment.type !== 'big_win' && (
                  <div className="pt-3 border-t border-gray-100">
                    <button
                      className="inline-flex items-center justify-center gap-2 text-[13px] h-10 px-5 text-white rounded-lg font-medium transition-all"
                      style={{ backgroundColor: adminColors ? '#9910FA' : '#3C9A6E' }}
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = adminColors ? '#7C3AED' : '#2D7F57')}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = adminColors ? '#9910FA' : '#3C9A6E')}
                      onClick={() => startReplay(moment)}
                    >
                      <Play className="w-4 h-4" /> Opnieuw oefenen
                    </button>
                  </div>
                )}

                {useAdminLayout && (
                  <div className="pt-3 border-t border-gray-100">
                    {editingMomentId === moment.id ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[11px] font-medium mb-1 block" style={{ color: '#9910FA' }}>Moment label</label>
                          <input value={editedMomentLabel} onChange={(e) => setEditedMomentLabel(e.target.value)} className="w-full px-3 py-1.5 text-[13px] border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#9910FA40' }} />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium mb-1 block" style={{ color: '#9910FA' }}>Waarom belangrijk</label>
                          <textarea value={editedMomentWhy} onChange={(e) => setEditedMomentWhy(e.target.value)} className="w-full px-3 py-1.5 text-[13px] border rounded-lg focus:outline-none focus:ring-2 resize-none" style={{ borderColor: '#9910FA40' }} rows={2} />
                        </div>
                        {moment.betterAlternative && (
                          <div>
                            <label className="text-[11px] font-medium mb-1 block" style={{ color: '#9910FA' }}>Beter alternatief</label>
                            <textarea value={editedMomentAlt} onChange={(e) => setEditedMomentAlt(e.target.value)} className="w-full px-3 py-1.5 text-[13px] border rounded-lg focus:outline-none focus:ring-2 resize-none" style={{ borderColor: '#9910FA40' }} rows={2} />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" className="gap-1.5 text-[12px] text-white" style={{ backgroundColor: '#9910FA' }} disabled={submittingCorrection}
                            onClick={() => {
                              if (editedMomentLabel !== moment.label) submitCorrection('moment', 'label', moment.label, editedMomentLabel, `Moment: ${moment.id}`);
                              if (editedMomentWhy !== moment.whyItMatters) submitCorrection('moment', 'whyItMatters', moment.whyItMatters, editedMomentWhy, `Moment: ${moment.id}`);
                              if (editedMomentAlt !== (moment.betterAlternative || '')) submitCorrection('moment', 'betterAlternative', moment.betterAlternative || '', editedMomentAlt, `Moment: ${moment.id}`);
                            }}
                          >
                            <Save className="w-3.5 h-3.5" /> Indienen voor review
                          </Button>
                          <Button variant="outline" size="sm" className="text-[12px]" onClick={() => setEditingMomentId(null)}>Annuleren</Button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingMomentId(moment.id); setEditedMomentLabel(moment.label); setEditedMomentWhy(moment.whyItMatters); setEditedMomentAlt(moment.betterAlternative || ''); }}
                        className="flex items-center gap-1.5 text-[12px] font-medium"
                        style={{ color: '#9910FA' }}
                      >
                        <Pencil className="w-3 h-3" /> Correctie indienen
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* SECTION 3: Single primary action */}
          <div className="text-center">
            <button
              className="inline-flex items-center justify-center gap-2 text-[14px] h-11 px-6 text-white rounded-xl font-medium transition-all shadow-sm"
              style={{ backgroundColor: adminColors ? '#9910FA' : '#3C9A6E' }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = adminColors ? '#7C3AED' : '#2D7F57')}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = adminColors ? '#9910FA' : '#3C9A6E')}
              onClick={() => navigate?.("talk-to-hugo")}
            >
              <Sparkles className="w-4 h-4" /> Bespreek met Hugo <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Replay Section */}
          {replayMoment && (<div ref={replayRef}>
            <Card className={`p-6 rounded-[16px] shadow-hh-sm ${adminColors ? 'border-purple-600/20 bg-gradient-to-b from-purple-600/5 to-transparent' : 'border-hh-primary/20 bg-gradient-to-b from-hh-primary/5 to-transparent'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-hh-text flex items-center gap-2">
                  <Play className={`w-5 h-5 ${adminColors ? 'text-purple-600' : 'text-hh-primary'}`} />
                  Replay: {replayMoment.label}
                </h4>
                <Button variant="ghost" size="sm" className="text-hh-muted"
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
                  <p className={`text-[12px] font-medium ${adminColors ? 'text-purple-600' : 'text-hh-primary'} mb-1`}>Doel van deze oefening:</p>
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
                  <ChatBubble key={`ctx-${i}`} speaker={turn.speaker === 'seller' ? 'seller' : 'customer'} text={turn.text} label={turn.speaker === 'seller' ? 'Jij (origineel)' : 'Klant (origineel)'} variant="faded" adminColors={adminColors} />
                ))}
                {replayHistory.map((msg, i) => (
                  <ChatBubble key={`replay-${i}`} speaker={msg.role === 'seller' ? 'seller' : 'customer'} text={msg.content} label={msg.role === 'seller' ? 'Jij (replay)' : 'Klant'} adminColors={adminColors} />
                ))}
                {replayLoading && (
                  <div className="flex gap-2"><div className="px-3 py-2 rounded-2xl bg-hh-ui-50 rounded-bl-md"><Loader2 className="w-4 h-4 animate-spin text-hh-muted" /></div></div>
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
                <input type="text" value={replayInput} onChange={(e) => setReplayInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReplayMessage()}
                  placeholder="Typ je antwoord als verkoper..."
                  className={`flex-1 px-4 py-2.5 rounded-xl border border-hh-border bg-white text-[14px] text-hh-text placeholder:text-hh-muted/50 focus:outline-none ${adminColors ? 'focus:border-purple-600/50 focus:ring-2 focus:ring-purple-600/10' : 'focus:border-hh-primary/50 focus:ring-2 focus:ring-hh-primary/10'}`}
                  disabled={replayLoading}
                />
                <Button onClick={sendReplayMessage} disabled={!replayInput.trim() || replayLoading} className="gap-1.5"><Send className="w-4 h-4" /></Button>
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
                  const isReplayActive = transcriptReplay.active;
                  const replayIdx = transcriptReplay.fromTurnIdx;

                  return transcript.map((turn) => {
                    const evaluation = evaluations.find(e => e.turnIdx === turn.idx);
                    const signal = signals.find(s => s.turnIdx === turn.idx);
                    const currentPhase = determinePhaseForTurn(turn.idx);
                    const showPhaseDivider = currentPhase !== null && currentPhase !== lastPhase;
                    if (currentPhase !== null) lastPhase = currentPhase;

                    const isFadedByReplay = isReplayActive && turn.idx >= replayIdx;
                    const isReplayPoint = isReplayActive && turn.idx === replayIdx;

                    if (isFadedByReplay && !isReplayPoint) return null;

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
                          adminColors={adminColors}
                          variant={isReplayPoint ? 'faded' : 'default'}
                          onReplay={turn.speaker === 'seller' && !isReplayActive ? () => startTranscriptReplay(turn.idx) : undefined}
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

                        {isReplayPoint && (
                          <div ref={transcriptReplayRef} className="mt-4 mb-2">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex-1 h-px bg-emerald-300" />
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
                                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[12px] font-medium text-emerald-700">
                                  Replay vanaf {formatTime(turn.startMs)}
                                </span>
                                <span className="text-[11px] text-emerald-500">Hugo speelt de klant</span>
                              </div>
                              <button onClick={exitTranscriptReplay} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <X className="w-4 h-4 text-hh-muted" />
                              </button>
                              <div className="flex-1 h-px bg-emerald-300" />
                            </div>

                            <div className="space-y-3">
                              {transcriptReplay.messages.map((msg, i) => (
                                <ChatBubble
                                  key={`replay-${i}`}
                                  speaker={msg.role === 'user' ? 'seller' : 'customer'}
                                  text={msg.content}
                                  label={msg.role === 'user' ? 'Jij (replay)' : 'Klant (Hugo)'}
                                  isReplayMessage
                                />
                              ))}

                              {transcriptReplay.loading && (
                                <div className="flex justify-end">
                                  <div className="flex items-center gap-2 px-4 py-3 bg-hh-ink/10 rounded-2xl rounded-br-md">
                                    <div className="flex gap-1">
                                      <span className="w-2 h-2 bg-hh-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                      <span className="w-2 h-2 bg-hh-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                      <span className="w-2 h-2 bg-hh-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {transcriptReplay.feedback && (
                                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                                  <div className="flex gap-2.5 items-start">
                                    <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[12px] font-semibold text-emerald-700 mb-1">Hugo's feedback</p>
                                      <p className="text-[13px] leading-[20px] text-hh-text">{transcriptReplay.feedback}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <Button size="sm" variant="outline" onClick={exitTranscriptReplay} className="text-[12px] h-8">
                                      Terug naar transcript
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => {
                                      setTranscriptReplay(prev => ({ ...prev, feedback: null, turnCount: 0 }));
                                    }} className="text-[12px] h-8">
                                      <RotateCcw className="w-3 h-3 mr-1" /> Nog een keer
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {!transcriptReplay.feedback && (
                              <div className="flex gap-2 mt-4">
                                <textarea
                                  ref={transcriptReplayInputRef}
                                  value={transcriptReplayInput}
                                  onChange={(e) => setTranscriptReplayInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      sendTranscriptReplayMessage();
                                    }
                                  }}
                                  placeholder="Typ je alternatieve antwoord..."
                                  rows={1}
                                  className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-200 bg-white text-[14px] text-hh-text placeholder:text-hh-muted/50 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none"
                                  disabled={transcriptReplay.loading}
                                />
                                <Button
                                  onClick={sendTranscriptReplayMessage}
                                  disabled={!transcriptReplayInput.trim() || transcriptReplay.loading}
                                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white h-auto"
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
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