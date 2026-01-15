import { AppLayout } from "./AppLayout";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Sheet, SheetContent } from "../ui/sheet";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Play,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Target,
  Award,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

interface PhaseScore {
  phase: string;
  phaseKey: string;
  score: number;
  techniques: {
    name: string;
    used: boolean;
    score?: number;
    timestamp?: string;
  }[];
  plusPoints: string[];
  minPoints: string[];
  hugoFeedback: string;
}

interface TimelineItem {
  timestamp: string;
  phase: string;
  technique: string;
  score: number;
  type: "strong" | "weak" | "missed";
  quote: string;
}

interface AnalysisResultsProps {
  navigate?: (page: string, data?: any) => void;
  analysisId?: string;
  isPreview?: boolean;
  isAdmin?: boolean;
}

export function AnalysisResults({
  navigate,
  analysisId = "1",
  isPreview = false,
  isAdmin = false,
}: AnalysisResultsProps) {
  const [flowDrawerOpen, setFlowDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "transcript">("overview");

  // Mock data
  const analysisData = {
    id: analysisId,
    title: "Discovery call - Acme Inc",
    uploadDate: "12 jan 2025",
    duration: "24:18",
    overallScore: 78,
    benchmark: 72, // Average of user
    topPerformer: 88,
  };

  const phaseScores: PhaseScore[] = [
    {
      phase: "Voorbereiding",
      phaseKey: "fase0",
      score: 85,
      techniques: [
        { name: "Onderzoek prospect", used: true, score: 90, timestamp: "00:00" },
        { name: "Doel bepalen", used: true, score: 80, timestamp: "00:00" },
        { name: "Agenda voorbereiden", used: false },
      ],
      plusPoints: [
        "Sterk onderzoek gedaan naar bedrijf en persoon",
        "Duidelijk doel geformuleerd voor het gesprek",
      ],
      minPoints: ["Geen agenda gedeeld vooraf met prospect"],
      hugoFeedback:
        "Je voorbereiding is sterk. Je hebt je huiswerk gedaan en dat zie je terug in het gesprek. Volgende keer: deel een korte agenda vooraf, dat geeft structuur en professionaliteit.",
    },
    {
      phase: "Openingsfase",
      phaseKey: "fase1",
      score: 72,
      techniques: [
        { name: "Rapport bouwen", used: true, score: 75, timestamp: "02:15" },
        { name: "Koopklimaat creëren", used: true, score: 70, timestamp: "03:30" },
        { name: "Agenda bevestigen", used: false },
      ],
      plusPoints: [
        "Goede small talk, natuurlijk en authentiek",
        "Duidelijke waardepropositie vroeg in gesprek",
      ],
      minPoints: [
        "Overgang naar business wat abrupt",
        "Geen wederzijdse agenda bevestigd",
      ],
      hugoFeedback:
        "De opening is goed maar kan beter. Je rapport is sterk, maar de overgang van small talk naar business mag vloeiender. Gebruik de agenda als brug: 'Zullen we even kijken wat we vandaag gaan bespreken?'",
    },
    {
      phase: "Ontdekkingsfase",
      phaseKey: "fase2",
      score: 82,
      techniques: [
        { name: "SPIN Questioning", used: true, score: 88, timestamp: "05:45" },
        { name: "Actief luisteren", used: true, score: 85, timestamp: "08:20" },
        { name: "Behoeftebepaling", used: true, score: 75, timestamp: "11:30" },
        { name: "Lock questioning", used: false },
      ],
      plusPoints: [
        "Uitstekende SPIN vragen, vooral de implicatie vragen zijn top",
        "Goede doorvraag momenten, laat prospect uitpraten",
        "Duidelijk beeld gekregen van pijnpunten",
      ],
      minPoints: [
        "Lock questioning gemist - geen commitment gevraagd op bevindingen",
        "Enkele vragen te suggestief gesteld",
      ],
      hugoFeedback:
        "Dit is je sterkste fase! Je SPIN techniek is excellent. Maar let op: na zo'n goede discovery moet je 'locken' wat je hebt gehoord. Vraag: 'Als ik het goed begrijp, zijn dit de 3 kernproblemen. Klopt dat?' Dat geeft commitment.",
    },
    {
      phase: "Aanbevelingsfase",
      phaseKey: "fase3",
      score: 75,
      techniques: [
        { name: "Value selling", used: true, score: 78, timestamp: "15:20" },
        { name: "ROI berekening", used: true, score: 70, timestamp: "17:45" },
        { name: "Business case", used: false },
      ],
      plusPoints: [
        "Koppeling naar pijnpunten uit discovery",
        "Concrete ROI berekening gepresenteerd",
      ],
      minPoints: [
        "Te veel feature focus, te weinig value focus",
        "Geen volledige business case met timeline",
      ],
      hugoFeedback:
        "Je verbindt goed terug naar de discovery, dat is goed. Maar je glijdt af naar features. Blijf bij de waarde: niet 'Wij hebben feature X', maar 'Dit lost probleem Y op dat je noemde, dat bespaart €Z'.",
    },
    {
      phase: "Beslissingsfase",
      phaseKey: "fase4",
      score: 68,
      techniques: [
        { name: "Bezwaarhandeling", used: true, score: 65, timestamp: "20:30" },
        { name: "Closing technieken", used: true, score: 70, timestamp: "22:45" },
        { name: "Urgentie creatie", used: false },
        { name: "Next steps", used: true, score: 75, timestamp: "23:30" },
      ],
      plusPoints: [
        "Prijsbezwaar redelijk goed gehandeld",
        "Duidelijke next steps afgesproken",
      ],
      minPoints: [
        "Te snel toegegeven op korting",
        "Geen urgentie gecreëerd - geen reden waarom nu",
        "Trial close gemist voor commitment check",
      ],
      hugoFeedback:
        "Dit is je zwakste punt. Bij het prijsbezwaar ga je te snel mee in korting. Eerst: onderzoek het bezwaar ('Wat maakt dat dit voor jou te duur is?'). En creëer urgentie: waarom is dit nu belangrijk? Zonder urgentie gaat deze deal slapen.",
    },
  ];

  const timeline: TimelineItem[] = [
    {
      timestamp: "05:45",
      phase: "Ontdekkingsfase",
      technique: "SPIN - Situation",
      score: 90,
      type: "strong",
      quote: "Hoe ziet jullie huidige proces er nu uit?",
    },
    {
      timestamp: "08:20",
      phase: "Ontdekkingsfase",
      technique: "SPIN - Problem",
      score: 88,
      type: "strong",
      quote: "Wat zijn de grootste knelpunten die je tegenkomt?",
    },
    {
      timestamp: "11:30",
      phase: "Ontdekkingsfase",
      technique: "SPIN - Implication",
      score: 92,
      type: "strong",
      quote: "Als dit probleem blijft, wat betekent dat voor je team?",
    },
    {
      timestamp: "13:15",
      phase: "Ontdekkingsfase",
      technique: "Lock questioning",
      score: 0,
      type: "missed",
      quote: "❌ Gemiste kans: Geen lock vraag na discovery",
    },
    {
      timestamp: "17:45",
      phase: "Aanbevelingsfase",
      technique: "Feature dumping",
      score: 45,
      type: "weak",
      quote: "We hebben ook nog deze feature en die feature...",
    },
    {
      timestamp: "20:30",
      phase: "Beslissingsfase",
      technique: "Bezwaarhandeling",
      score: 65,
      type: "weak",
      quote: "Ik begrijp je prijsconcern. Laten we kijken...",
    },
    {
      timestamp: "23:30",
      phase: "Beslissingsfase",
      technique: "Next steps",
      score: 75,
      type: "strong",
      quote: "Zullen we volgende week dinsdag een vervolggesprek plannen?",
    },
  ];

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

  return (
    <AppLayout
      currentPage="analysis"
      navigate={navigate}
      onOpenFlowDrawer={() => setFlowDrawerOpen(true)}
      isAdmin={isAdmin}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate?.("analysis")}
              className="gap-1 -ml-2"
            >
              ← Terug naar analyses
            </Button>
          </div>
          <h1 className="mb-2 text-[32px] leading-[40px] sm:text-[40px] sm:leading-[48px] lg:text-[48px] lg:leading-[56px]">
            {analysisData.title}
          </h1>
          <div className="flex items-center gap-4 text-[14px] leading-[20px] text-hh-muted">
            <span>{analysisData.uploadDate}</span>
            <span>•</span>
            <span>{analysisData.duration}</span>
          </div>
        </div>

        {/* Overall Score Card */}
        <Card className="p-6 rounded-[16px] shadow-hh-md border-hh-border">
          <div className="grid sm:grid-cols-3 gap-6">
            {/* Overall Score */}
            <div className="text-center sm:border-r border-hh-border">
              <p className="text-[14px] leading-[20px] text-hh-muted mb-2">
                Overall EPIC Score
              </p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span
                  className={`text-[40px] leading-[48px] ${getScoreColor(
                    analysisData.overallScore
                  )}`}
                >
                  {analysisData.overallScore}
                </span>
                <span className="text-[24px] leading-[32px] text-hh-muted">
                  / 100
                </span>
              </div>
              <Badge
                variant="outline"
                className={getScoreBgColor(analysisData.overallScore)}
              >
                {analysisData.overallScore >= 80
                  ? "Excellent"
                  : analysisData.overallScore >= 60
                  ? "Goed"
                  : "Verbetering nodig"}
              </Badge>
            </div>

            {/* Benchmark */}
            <div className="text-center sm:border-r border-hh-border">
              <p className="text-[14px] leading-[20px] text-hh-muted mb-2">
                Jouw gemiddelde
              </p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-[40px] leading-[48px] text-hh-text">
                  {analysisData.benchmark}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[14px] leading-[20px]">
                {analysisData.overallScore > analysisData.benchmark ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-hh-success" />
                    <span className="text-hh-success">
                      +{analysisData.overallScore - analysisData.benchmark}{" "}
                      boven gemiddelde
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-hh-destructive" />
                    <span className="text-hh-destructive">
                      {analysisData.benchmark - analysisData.overallScore}{" "}
                      onder gemiddelde
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Top Performer */}
            <div className="text-center">
              <p className="text-[14px] leading-[20px] text-hh-muted mb-2">
                Top performer
              </p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-[40px] leading-[48px] text-hh-text">
                  {analysisData.topPerformer}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[14px] leading-[20px]">
                <Award className="w-4 h-4 text-hh-primary" />
                <span className="text-hh-muted">
                  {analysisData.topPerformer - analysisData.overallScore} punten
                  verschil
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-hh-border">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setFlowDrawerOpen(true)}
            >
              <BarChart3 className="w-4 h-4" />
              Bekijk EPIC Flow
            </Button>
            <Button variant="outline" className="gap-2">
              <Play className="w-4 h-4" />
              Beluister opname
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download rapport (PDF)
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-hh-ui-50">
            <TabsTrigger value="overview">Fase breakdown</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Phase Breakdown */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {phaseScores.map((phase, idx) => (
              <Card
                key={idx}
                className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden"
              >
                {/* Phase Header */}
                <div className="p-4 sm:p-6 bg-hh-ui-50 border-b border-hh-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{phase.phase}</Badge>
                      <h3 className="text-hh-text">Score: {phase.score}%</h3>
                    </div>
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${getScoreBgColor(
                        phase.score
                      )}`}
                    >
                      <span
                        className={`text-[20px] leading-[28px] ${getScoreColor(
                          phase.score
                        )}`}
                      >
                        {phase.score}
                      </span>
                    </div>
                  </div>
                  <Progress value={phase.score} className="h-2" />
                </div>

                {/* Phase Content */}
                <div className="p-4 sm:p-6">
                  {/* Techniques */}
                  <div className="mb-6">
                    <h4 className="text-hh-text mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Technieken
                    </h4>
                    <div className="space-y-2">
                      {phase.techniques.map((tech, techIdx) => (
                        <div
                          key={techIdx}
                          className="flex items-center justify-between p-3 rounded-lg bg-hh-ui-50"
                        >
                          <div className="flex items-center gap-3">
                            {tech.used ? (
                              <CheckCircle2 className="w-5 h-5 text-hh-success flex-shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-hh-muted flex-shrink-0" />
                            )}
                            <span className="text-hh-text">{tech.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {tech.timestamp && (
                              <span className="text-[14px] leading-[20px] text-hh-muted">
                                {tech.timestamp}
                              </span>
                            )}
                            {tech.score !== undefined && (
                              <Badge
                                variant="outline"
                                className={getScoreBgColor(tech.score)}
                              >
                                {tech.score}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plus/Min Points */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {/* Plus Points */}
                    <div>
                      <h4 className="text-hh-text mb-3 flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-hh-success" />
                        Goed gedaan
                      </h4>
                      <div className="space-y-2">
                        {phase.plusPoints.map((point, pointIdx) => (
                          <div
                            key={pointIdx}
                            className="flex gap-2 text-[14px] leading-[20px] text-hh-text"
                          >
                            <CheckCircle2 className="w-4 h-4 text-hh-success flex-shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Min Points */}
                    <div>
                      <h4 className="text-hh-text mb-3 flex items-center gap-2">
                        <ThumbsDown className="w-4 h-4 text-hh-destructive" />
                        Verbeterpunten
                      </h4>
                      <div className="space-y-2">
                        {phase.minPoints.map((point, pointIdx) => (
                          <div
                            key={pointIdx}
                            className="flex gap-2 text-[14px] leading-[20px] text-hh-text"
                          >
                            <AlertCircle className="w-4 h-4 text-hh-destructive flex-shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hugo's Feedback */}
                  <div className="p-4 rounded-[12px] bg-hh-primary/5 border border-hh-primary/20">
                    <div className="flex gap-3">
                      <Lightbulb className="w-5 h-5 text-hh-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[14px] leading-[20px] text-hh-text mb-1">
                          <strong>Hugo's feedback</strong>
                        </p>
                        <p className="text-[14px] leading-[20px] text-hh-muted">
                          {phase.hugoFeedback}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Overall Hugo Feedback */}
            <Card className="p-6 rounded-[16px] shadow-hh-md border-hh-primary bg-gradient-to-br from-hh-primary/5 to-transparent">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-hh-primary flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-hh-text mb-3">
                    Hugo's overall advies voor jou
                  </h3>
                  <p className="text-hh-text mb-4">
                    Je hebt een sterke basis. Je discovery fase is excellent —
                    dat is de fundering van elk goed gesprek. Maar je laat kansen
                    liggen in de afsluiting. Focus je training de komende weken
                    op:
                  </p>
                  <ol className="space-y-2 text-hh-text list-decimal list-inside">
                    <li>
                      <strong>Lock questioning</strong> - Na elke discovery,
                      krijg commitment op bevindingen
                    </li>
                    <li>
                      <strong>Bezwaarhandeling</strong> - Onderzoek eerst,
                      geef niet meteen toe
                    </li>
                    <li>
                      <strong>Urgentie creatie</strong> - Geef prospect een
                      reden waarom dit nu belangrijk is
                    </li>
                  </ol>
                  <div className="mt-4 pt-4 border-t border-hh-primary/20">
                    <Button className="gap-2">
                      Oefen deze technieken in rollenspel
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-6">
            <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-border">
              <h3 className="text-hh-text mb-4">Techniek timeline</h3>
              <p className="text-[14px] leading-[20px] text-hh-muted mb-6">
                Chronologisch overzicht van technieken gebruikt tijdens het
                gesprek
              </p>

              <div className="space-y-4">
                {timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    {/* Timestamp */}
                    <div className="flex-shrink-0 w-16 text-right">
                      <span className="text-[14px] leading-[20px] text-hh-muted">
                        {item.timestamp}
                      </span>
                    </div>

                    {/* Timeline line */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          item.type === "strong"
                            ? "bg-hh-success"
                            : item.type === "weak"
                            ? "bg-hh-warn"
                            : "bg-hh-muted"
                        }`}
                      />
                      {idx < timeline.length - 1 && (
                        <div className="w-0.5 flex-1 bg-hh-border min-h-[60px]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <Badge variant="outline" className="mb-2">
                            {item.phase}
                          </Badge>
                          <h4 className="text-hh-text">{item.technique}</h4>
                        </div>
                        {item.type !== "missed" && (
                          <Badge
                            variant="outline"
                            className={getScoreBgColor(item.score)}
                          >
                            {item.score}%
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-[14px] leading-[20px] ${
                          item.type === "missed"
                            ? "text-hh-muted italic"
                            : "text-hh-text"
                        }`}
                      >
                        "{item.quote}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Transcript Tab */}
          <TabsContent value="transcript" className="mt-6">
            <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-border">
              <h3 className="text-hh-text mb-4">Volledige transcript</h3>
              <p className="text-[14px] leading-[20px] text-hh-muted mb-6">
                Automatisch gegenereerd met AI - technieken gemarkeerd
              </p>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[14px] leading-[20px] text-hh-muted">
                      00:15
                    </span>
                    <Badge variant="outline">Jij</Badge>
                  </div>
                  <p className="text-hh-text">
                    Goedemorgen! Fijn dat je tijd hebt gemaakt. Hoe gaat het met
                    je?
                  </p>
                  <div className="mt-2">
                    <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20">
                      ✓ Rapport bouwen
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[14px] leading-[20px] text-hh-muted">
                      00:32
                    </span>
                    <Badge variant="outline">Klant</Badge>
                  </div>
                  <p className="text-hh-text">
                    Goed hoor, druk zoals altijd. Maar ik ben benieuwd naar wat
                    jullie te bieden hebben.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[14px] leading-[20px] text-hh-muted">
                      05:45
                    </span>
                    <Badge variant="outline">Jij</Badge>
                  </div>
                  <p className="text-hh-text">
                    Hoe ziet jullie huidige proces er nu uit voor lead generation?
                  </p>
                  <div className="mt-2">
                    <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20">
                      ✓ SPIN - Situation (Score: 90%)
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[14px] leading-[20px] text-hh-muted">
                      08:20
                    </span>
                    <Badge variant="outline">Jij</Badge>
                  </div>
                  <p className="text-hh-text">
                    Wat zijn de grootste knelpunten die je tegenkomt in dat proces?
                  </p>
                  <div className="mt-2">
                    <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20">
                      ✓ SPIN - Problem (Score: 88%)
                    </Badge>
                  </div>
                </div>

                <div className="p-4 rounded-[12px] bg-hh-muted/10 border border-hh-border">
                  <p className="text-[14px] leading-[20px] text-hh-muted text-center">
                    ... en nog 47 lijnen transcript ...
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    </AppLayout>
  );
}
