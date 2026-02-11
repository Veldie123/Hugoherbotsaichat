import { AppLayout } from "./AppLayout";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Target,
  BarChart3,
  Loader2,
  MessageSquare,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface AnalysisResultsProps {
  navigate?: (page: string, data?: any) => void;
  analysisId?: string;
  isPreview?: boolean;
  isAdmin?: boolean;
  navigationData?: { conversationId?: string };
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
}

interface EpicCoverage {
  explore: { score: number; themes: string[]; missing: string[] };
  probe: { score: number; found: boolean; examples: string[] };
  impact: { score: number; found: boolean; examples: string[] };
  commit: { score: number; found: boolean; examples: string[] };
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

interface AnalysisInsights {
  epicCoverage: EpicCoverage;
  missedOpportunities: MissedOpportunity[];
  summaryMarkdown: string;
  strengths: Array<{ text: string; quote: string; turnIdx: number }>;
  improvements: Array<{ text: string; quote: string; turnIdx: number; betterApproach: string }>;
  microExperiments: string[];
  overallScore: number;
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

export function AnalysisResults({
  navigate,
  isPreview = false,
  isAdmin = false,
  navigationData,
}: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "transcript">("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FullAnalysisResult | null>(null);

  const conversationId = navigationData?.conversationId;

  const [processingStep, setProcessingStep] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setError('Geen analyse ID gevonden');
      setLoading(false);
      return;
    }

    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/v2/analysis/results/${conversationId}`);
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
  }, [conversationId]);

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
      'neutraal': { label: 'Neutraal', color: 'bg-hh-ui-100 text-hh-muted' },
    };
    return labels[houding] || labels['neutraal'];
  };

  const handleExportMarkdown = () => {
    if (!result) return;
    const blob = new Blob([result.insights.summaryMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.conversation.title || 'analyse'}-rapport.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || processingStep) {
    return (
      <AppLayout currentPage="analysis" navigate={navigate} isAdmin={isAdmin}>
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
      </AppLayout>
    );
  }

  if (error || !result) {
    return (
      <AppLayout currentPage="analysis" navigate={navigate} isAdmin={isAdmin}>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <AlertCircle className="w-8 h-8 text-hh-destructive mx-auto" />
            <p className="text-hh-text">{error || 'Geen resultaten gevonden'}</p>
            <Button variant="outline" onClick={() => navigate?.("upload-analysis")}>
              Terug naar uploads
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { conversation, transcript, evaluations, signals, insights } = result;
  const { epicCoverage, missedOpportunities, strengths, improvements, microExperiments, overallScore } = insights;

  return (
    <AppLayout currentPage="analysis" navigate={navigate} isAdmin={isAdmin}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-y-auto h-[calc(100vh-4rem)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate?.("upload-analysis")}
              className="gap-1 -ml-2"
            >
              ← Terug naar analyses
            </Button>
          </div>
          <h1 className="mb-2 text-[32px] leading-[40px] sm:text-[40px] sm:leading-[48px]">
            {conversation.title}
          </h1>
          <div className="flex items-center gap-4 text-[14px] leading-[20px] text-hh-muted">
            <span>{new Date(conversation.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>•</span>
            <span>{transcript.length} turns</span>
            {transcript.length > 0 && (
              <>
                <span>•</span>
                <span>{formatTime(transcript[transcript.length - 1].endMs)}</span>
              </>
            )}
          </div>
        </div>

        <Card className="p-6 rounded-[16px] shadow-hh-md border-hh-border">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <p className="text-[14px] leading-[20px] text-hh-muted mb-2">Overall Score</p>
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className={`text-[40px] leading-[48px] ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </span>
                <span className="text-[24px] leading-[32px] text-hh-muted">/ 100</span>
              </div>
              <Badge variant="outline" className={getScoreBgColor(overallScore)}>
                {overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Goed" : "Verbetering nodig"}
              </Badge>
            </div>

            <div className="text-center">
              <p className="text-[14px] leading-[20px] text-hh-muted mb-2">Explore</p>
              <span className={`text-[28px] leading-[36px] ${getScoreColor(epicCoverage.explore.score)}`}>
                {epicCoverage.explore.score}%
              </span>
              <Progress value={epicCoverage.explore.score} className="h-1.5 mt-2" />
            </div>

            <div className="text-center">
              <p className="text-[14px] leading-[20px] text-hh-muted mb-2">Probe</p>
              <span className={`text-[28px] leading-[36px] ${getScoreColor(epicCoverage.probe.score)}`}>
                {epicCoverage.probe.score}%
              </span>
              <Progress value={epicCoverage.probe.score} className="h-1.5 mt-2" />
            </div>

            <div className="text-center">
              <p className="text-[14px] leading-[20px] text-hh-muted mb-2">Impact</p>
              <span className={`text-[28px] leading-[36px] ${getScoreColor(epicCoverage.impact.score)}`}>
                {epicCoverage.impact.score}%
              </span>
              <Progress value={epicCoverage.impact.score} className="h-1.5 mt-2" />
            </div>

            <div className="text-center">
              <p className="text-[14px] leading-[20px] text-hh-muted mb-2">Commit</p>
              <span className={`text-[28px] leading-[36px] ${getScoreColor(epicCoverage.commit.score)}`}>
                {epicCoverage.commit.score}%
              </span>
              <Progress value={epicCoverage.commit.score} className="h-1.5 mt-2" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-hh-border">
            <Button variant="outline" className="gap-2" onClick={handleExportMarkdown}>
              <Download className="w-4 h-4" />
              Download rapport (MD)
            </Button>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as "overview" | "timeline" | "transcript")}>
          <TabsList className="bg-hh-ui-50">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="timeline">Transcript + Evaluatie</TabsTrigger>
            <TabsTrigger value="transcript">Gemiste Kansen</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-border">
                <h4 className="text-hh-text mb-4 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-hh-success" />
                  Sterke punten ({strengths.length})
                </h4>
                <div className="space-y-3">
                  {strengths.map((s, i) => (
                    <div key={i} className="p-3 rounded-lg bg-hh-success/5 border border-hh-success/10">
                      <p className="text-[14px] leading-[20px] text-hh-text mb-1">{s.text}</p>
                      {s.quote && (
                        <p className="text-[13px] leading-[18px] text-hh-muted italic">"{s.quote}"</p>
                      )}
                    </div>
                  ))}
                  {strengths.length === 0 && (
                    <p className="text-[14px] leading-[20px] text-hh-muted">Geen sterke punten gedetecteerd</p>
                  )}
                </div>
              </Card>

              <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-border">
                <h4 className="text-hh-text mb-4 flex items-center gap-2">
                  <ThumbsDown className="w-5 h-5 text-hh-destructive" />
                  Verbeterpunten ({improvements.length})
                </h4>
                <div className="space-y-3">
                  {improvements.map((imp, i) => (
                    <div key={i} className="p-3 rounded-lg bg-hh-destructive/5 border border-hh-destructive/10">
                      <p className="text-[14px] leading-[20px] text-hh-text mb-1">{imp.text}</p>
                      {imp.quote && (
                        <p className="text-[13px] leading-[18px] text-hh-muted italic mb-1">"{imp.quote}"</p>
                      )}
                      {imp.betterApproach && (
                        <div className="mt-2 p-2 rounded bg-hh-primary/5 border border-hh-primary/10">
                          <p className="text-[12px] leading-[17px] text-hh-primary">
                            <strong>Beter:</strong> {imp.betterApproach}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  {improvements.length === 0 && (
                    <p className="text-[14px] leading-[20px] text-hh-muted">Geen verbeterpunten gedetecteerd</p>
                  )}
                </div>
              </Card>
            </div>

            {microExperiments.length > 0 && (
              <Card className="p-6 rounded-[16px] shadow-hh-md border-hh-primary bg-gradient-to-br from-hh-primary/5 to-transparent">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-hh-primary flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-hh-text mb-3">Micro-experimenten van Hugo</h3>
                    <p className="text-[14px] leading-[20px] text-hh-muted mb-4">
                      Probeer deze concrete oefeningen in je volgende gesprek:
                    </p>
                    <ol className="space-y-2 text-hh-text list-decimal list-inside">
                      {microExperiments.map((exp, i) => (
                        <li key={i} className="text-[14px] leading-[22px]">{exp}</li>
                      ))}
                    </ol>
                    <div className="mt-4 pt-4 border-t border-hh-primary/20">
                      <Button className="gap-2" onClick={() => navigate?.("talk-to-hugo")}>
                        Oefen met Hugo
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {epicCoverage.explore.themes.length > 0 && (
              <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-border">
                <h4 className="text-hh-text mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-hh-primary" />
                  EPIC Coverage Details
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[13px] leading-[18px] text-hh-muted mb-2">Explore - Thema's besproken:</p>
                    <div className="flex flex-wrap gap-1">
                      {epicCoverage.explore.themes.map((t, i) => (
                        <Badge key={i} variant="outline" className="text-[12px]">{t}</Badge>
                      ))}
                    </div>
                    {epicCoverage.explore.missing.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[13px] leading-[18px] text-hh-destructive mb-1">Gemist:</p>
                        <div className="flex flex-wrap gap-1">
                          {epicCoverage.explore.missing.map((m, i) => (
                            <Badge key={i} variant="outline" className="text-[12px] border-hh-destructive/30 text-hh-destructive">{m}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {epicCoverage.probe.examples.length > 0 && (
                      <div>
                        <p className="text-[13px] leading-[18px] text-hh-muted mb-1">Probe voorbeelden:</p>
                        {epicCoverage.probe.examples.map((ex, i) => (
                          <p key={i} className="text-[12px] leading-[17px] text-hh-text italic">"{ex}"</p>
                        ))}
                      </div>
                    )}
                    {epicCoverage.impact.examples.length > 0 && (
                      <div>
                        <p className="text-[13px] leading-[18px] text-hh-muted mb-1">Impact voorbeelden:</p>
                        {epicCoverage.impact.examples.map((ex, i) => (
                          <p key={i} className="text-[12px] leading-[17px] text-hh-text italic">"{ex}"</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-border">
              <h3 className="text-hh-text mb-2">Transcript met EPIC Evaluatie</h3>
              <p className="text-[14px] leading-[20px] text-hh-muted mb-6">
                Turn-by-turn transcript met gedetecteerde technieken en klantsignalen
              </p>

              <div className="space-y-4">
                {transcript.map((turn) => {
                  const evaluation = evaluations.find(e => e.turnIdx === turn.idx);
                  const signal = signals.find(s => s.turnIdx === turn.idx);

                  return (
                    <div key={turn.idx} className={`p-4 rounded-lg border ${
                      turn.speaker === 'seller' ? 'bg-hh-ui-50 border-hh-border' : 'bg-white border-hh-ui-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px] leading-[18px] text-hh-muted">
                          {formatTime(turn.startMs)}
                        </span>
                        <Badge variant="outline" className={turn.speaker === 'seller' ? 'border-hh-primary text-hh-primary' : ''}>
                          {turn.speaker === 'seller' ? 'Verkoper' : 'Klant'}
                        </Badge>
                        {signal && (
                          <Badge className={`${getSignalLabel(signal.houding).color} text-[11px]`}>
                            {getSignalLabel(signal.houding).label}
                          </Badge>
                        )}
                      </div>

                      <p className="text-[14px] leading-[22px] text-hh-text mb-2">{turn.text}</p>

                      {evaluation && evaluation.techniques.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {evaluation.techniques.map((tech, i) => {
                            const badge = getQualityBadge(tech.quality);
                            return (
                              <Badge key={i} variant="outline" className={`${badge.color} text-[11px]`}>
                                {tech.quality === 'gemist' ? '✗' : '✓'} {tech.naam} ({tech.score}%)
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="transcript" className="mt-6 space-y-6">
            <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-border">
              <h3 className="text-hh-text mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-hh-destructive" />
                Gemiste Kansen ({missedOpportunities.length})
              </h3>
              <p className="text-[14px] leading-[20px] text-hh-muted mb-6">
                Momenten waar een betere reactie mogelijk was
              </p>

              {missedOpportunities.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 text-hh-success mx-auto mb-2" />
                  <p className="text-hh-text">Geen grote gemiste kansen gedetecteerd</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {missedOpportunities.map((opp, i) => {
                    const turn = transcript.find(t => t.idx === opp.turnIdx);
                    return (
                      <div key={i} className="p-4 rounded-lg border border-hh-destructive/20 bg-hh-destructive/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="border-hh-destructive/30 text-hh-destructive text-[11px]">
                            {turn ? formatTime(turn.startMs) : `Turn ${opp.turnIdx}`}
                          </Badge>
                          <span className="text-[13px] leading-[18px] text-hh-destructive font-medium">
                            {opp.description}
                          </span>
                        </div>

                        <div className="space-y-2 mb-3">
                          {opp.sellerSaid && (
                            <div className="flex gap-2">
                              <MessageSquare className="w-4 h-4 text-hh-primary flex-shrink-0 mt-0.5" />
                              <p className="text-[13px] leading-[18px] text-hh-text">
                                <strong>Verkoper:</strong> "{opp.sellerSaid}"
                              </p>
                            </div>
                          )}
                          {opp.customerSaid && (
                            <div className="flex gap-2">
                              <MessageSquare className="w-4 h-4 text-hh-muted flex-shrink-0 mt-0.5" />
                              <p className="text-[13px] leading-[18px] text-hh-text">
                                <strong>Klant:</strong> "{opp.customerSaid}"
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="p-3 rounded bg-hh-primary/5 border border-hh-primary/10">
                          <div className="flex gap-2">
                            <Lightbulb className="w-4 h-4 text-hh-primary flex-shrink-0 mt-0.5" />
                            <p className="text-[13px] leading-[18px] text-hh-primary">
                              <strong>Beter:</strong> "{opp.betterQuestion}"
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
