import { Check, Lock, ChevronDown, ChevronRight, Clock, Circle, CheckCircle2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "../ui/utils";
import { useState } from "react";

interface FlowStep {
  id: string;
  name: string;
  status: "completed" | "current" | "upcoming" | "locked";
  duration?: string;
  nummer?: string;
  isVerplicht?: boolean;
}

interface FlowPhase {
  id: number;
  name: string;
  color: string;
  steps: FlowStep[];
  themas?: string[];
  uitleg?: string;
}

interface EPICSalesFlowProps {
  phases?: FlowPhase[];
  currentPhaseId?: number;
  currentStepId?: string;
  compact?: boolean;
  // Legacy props for backward compatibility
  currentPhase?: string;
  currentStep?: string;
  onClose?: () => void;
}

// Technique details from JSON
const TECHNIQUE_DETAILS: Record<string, {
  wat: string;
  wanneer?: string;
  doel?: string;
}> = {
  "1.1": {
    wat: "Gedrag/onderwerp afstemmen op klant om vertrouwen te winnen (gunfactor).",
    wanneer: "start gesprek"
  },
  "1.2": {
    wat: "Agenda en akkoord vragen om gespreksleiding te nemen.",
    wanneer: "na 1.1"
  },
  "1.3": {
    wat: "Kort bedrijf + herkenbare referentie.",
    wanneer: "na 1.2"
  },
  "1.4": {
    wat: "Open vraag om klant aan het praten te krijgen.",
    wanneer: "na 1.3"
  },
  "2.1.1": {
    wat: "Vraag naar feiten/cijfers/details.",
    doel: "voordeel en onderliggende baat detecteren (stap 1: feit)"
  },
  "2.1.2": {
    wat: "Open vragen naar mening/motivatie.",
    doel: "reden/waarde kaderen (stap 2: mening)"
  },
  "2.1.3": {
    wat: "Kiesvraag om standpunt te forceren.",
    doel: "twijfel scherpstellen"
  },
  "2.1.4": {
    wat: "Premature nadelen parkeren, vriendelijk erkennen.",
    doel: "regie houden"
  },
  "2.1.5": {
    wat: "Korte verduidelijkende doorvraag.",
    doel: "diepte"
  },
  "2.1.6": {
    wat: "Samenvatten/empathie tonen.",
    doel: "vertrouwen"
  },
  "2.1.7": {
    wat: "Korte hypothetische spiegel via verhaal.",
    doel: "inzicht zonder discussie"
  },
  "2.1.8": {
    wat: "Bevestigen wat klant belangrijk vindt.",
    doel: "groen licht voor fase 3"
  },
  "3.1": {
    wat: "Erken belang klant kort."
  },
  "3.2": {
    wat: "USP noemen die past bij gelockte wens."
  },
  "3.3": {
    wat: "Algemeen voordeel uitleggen."
  },
  "3.4": {
    wat: "Persoonlijke impact voor klant concreet maken."
  },
  "3.5": {
    wat: "Peilen naar draagvlak."
  },
  "4.1": {
    wat: "Zachte test op bereidheid."
  },
  "4.2.1": {
    wat: "Antwoord → Mening/Lock → Proefafsluiting."
  },
  "4.2.2": {
    wat: "Ask → Lock → Bewijs → Afsluiten."
  },
  "4.2.3": {
    wat: "Empathie → Ask → Lock → Actieplan."
  },
  "4.2.4": {
    wat: "Analyseren → Isoleren → Neutraliseren → Keuze → Afsluiten."
  },
  "4.2.5": {
    wat: "Empathie → Oplossen → Helpen beslissen → Proefafsluiting."
  }
};

export function EPICSalesFlow(props: EPICSalesFlowProps) {
  // Provide default mock data for backward compatibility
  const defaultPhases: FlowPhase[] = [
    {
      id: 1,
      name: "Openingsfase",
      color: "blue",
      steps: [
        { id: "1.1", name: "Rapport bouwen", status: "completed", nummer: "1.1", duration: "2-3 min" },
        { id: "1.2", name: "Agenda delen", status: "completed", nummer: "1.2" },
        { id: "1.3", name: "Bedrijfsintro", status: "current", nummer: "1.3" },
        { id: "1.4", name: "Open vraag stellen", status: "upcoming", nummer: "1.4" },
      ],
    },
    {
      id: 2,
      name: "Ontdekkingsfase",
      color: "green",
      steps: [
        { id: "2.1.1", name: "SPIN - Situation", status: "upcoming", nummer: "2.1.1" },
        { id: "2.1.2", name: "SPIN - Problem", status: "upcoming", nummer: "2.1.2" },
        { id: "2.1.3", name: "SPIN - Implication", status: "upcoming", nummer: "2.1.3" },
        { id: "2.1.4", name: "SPIN - Need-payoff", status: "locked", nummer: "2.1.4" },
      ],
    },
    {
      id: 3,
      name: "Aanbevelingsfase",
      color: "purple",
      steps: [
        { id: "3.1", name: "Erkennen behoefte", status: "locked", nummer: "3.1" },
        { id: "3.2", name: "USP presenteren", status: "locked", nummer: "3.2" },
        { id: "3.3", name: "Voordelen uitleggen", status: "locked", nummer: "3.3" },
      ],
    },
    {
      id: 4,
      name: "Beslissingsfase",
      color: "red",
      steps: [
        { id: "4.1", name: "Trial close", status: "locked", nummer: "4.1" },
        { id: "4.2.1", name: "Bezwaarhandeling", status: "locked", nummer: "4.2.1" },
        { id: "4.2.2", name: "Closing", status: "locked", nummer: "4.2.2" },
      ],
    },
  ];

  const {
    phases = defaultPhases,
    currentPhaseId = 1,
    currentStepId = "1.3",
    compact = false,
  } = props;

  const [expandedPhases, setExpandedPhases] = useState<number[]>([currentPhaseId]);
  const [expandedTechniques, setExpandedTechniques] = useState<string[]>([]);

  const togglePhase = (phaseId: number) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId) ? prev.filter(id => id !== phaseId) : [...prev, phaseId]
    );
  };

  const toggleTechnique = (stepId: string) => {
    setExpandedTechniques(prev =>
      prev.includes(stepId) ? prev.filter(id => id !== stepId) : [...prev, stepId]
    );
  };

  const calculateProgress = (phase: FlowPhase) => {
    const completed = phase.steps.filter((s) => s.status === "completed").length;
    return Math.round((completed / phase.steps.length) * 100);
  };

  // Calculate completion stats
  const totalSteps = phases.flatMap(p => p.steps).length;
  const completedSteps = phases.flatMap(p => p.steps).filter(s => s.status === "completed").length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="h-full flex flex-col bg-hh-ui-50 border-l border-hh-border">
      {/* Header - Exact copy from RolePlayChat */}
      <div className="p-4 border-b border-hh-border bg-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-hh-primary/10 flex items-center justify-center">
            <Circle className="w-5 h-5 text-hh-primary" />
          </div>
          <div>
            <h2 className="text-[18px] leading-[26px] text-hh-text">E.P.I.C sales flow</h2>
            <p className="text-[12px] leading-[16px] text-hh-muted">
              {completedSteps} / {totalSteps} voltooid
            </p>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[12px] leading-[16px] mb-1">
            <span className="text-hh-muted">Totale voortgang</span>
            <span className="text-hh-text">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </div>

      {/* Flow Phases - Exact copy from RolePlayChat */}
      <div className="flex-1 overflow-y-auto">
        {phases.map((phase) => {
          const isCurrentPhase = phase.id === currentPhaseId;
          const progress = calculateProgress(phase);
          const isCompletedPhase = progress === 100;
          const isUpcomingPhase = phase.id > currentPhaseId;
          const isExpanded = expandedPhases.includes(phase.id);
          const completedInPhase = phase.steps.filter(s => s.status === "completed").length;

          return (
            <div key={phase.id} className="border-b border-hh-border">
              {/* Phase Header - Exact styling from RolePlayChat */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full p-4 hover:bg-white transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      progress === 100
                        ? "bg-hh-success/10"
                        : phase.id === currentPhaseId
                        ? "bg-hh-primary/10"
                        : "bg-hh-ui-100"
                    }`}
                  >
                    {progress === 100 ? (
                      <CheckCircle2 className="w-4 h-4 text-hh-success" />
                    ) : (
                      <span className={`text-[14px] ${phase.id === currentPhaseId ? "text-hh-primary" : "text-hh-muted"}`}>
                        {phase.id}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[14px] leading-[20px] text-hh-text truncate">
                        {phase.name}
                      </p>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-hh-muted flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-hh-muted flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[12px] leading-[16px] text-hh-muted">
                      <span>
                        {completedInPhase}/{phase.steps.length}
                      </span>
                      <div className="flex-1 h-1 bg-hh-ui-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            progress === 100
                              ? "bg-hh-success"
                              : "bg-hh-primary"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Phase Content - Expandable */}
              {isExpanded && (
                <div className="bg-white">
                  {/* Phase explanation */}
                  {phase.uitleg && (
                    <div className="px-4 py-2 bg-hh-ui-50/30 border-y border-hh-border">
                      <p className="text-[11px] leading-[16px] text-hh-muted italic">
                        {phase.uitleg}
                      </p>
                    </div>
                  )}

                  {/* Thema's om te bespreken - Now formatted as clickable row like techniques */}
                  {phase.themas && phase.themas.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleTechnique(`themas-${phase.id}`)}
                        className="w-full p-3 pl-4 text-left transition-colors hover:bg-hh-ui-50"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-hh-success" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-[13px] leading-[18px] text-hh-text">
                                  Thema's om te bespreken
                                </p>
                              </div>
                              {expandedTechniques.includes(`themas-${phase.id}`) ? (
                                <ChevronDown className="w-3 h-3 text-hh-muted flex-shrink-0 mt-0.5" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-hh-muted flex-shrink-0 mt-0.5" />
                              )}
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Expanded themas - as sub-items like technique details */}
                      {expandedTechniques.includes(`themas-${phase.id}`) && (
                        <div className="px-4 py-3 pl-10 bg-hh-ui-50/30 border-l border-hh-border ml-2">
                          <div className="space-y-2 text-[12px] leading-[17px]">
                            {phase.themas.map((thema) => (
                              <div key={thema}>
                                <span className="text-hh-text font-medium">{thema}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Techniques list - Exact styling from RolePlayChat */}
                  <div>
                    {phase.steps.map((step) => {
                      const isCurrent = step.id === currentStepId;
                      const isCompleted = step.status === "completed";
                      const isLocked = step.status === "locked";
                      const isExpanded = expandedTechniques.includes(step.id);
                      const details = step.nummer ? TECHNIQUE_DETAILS[step.nummer] : null;
                      const hasDetails = details && (details.wat || details.wanneer || details.doel);

                      return (
                        <div key={step.id}>
                          {/* Technique row - Reduced padding from pl-16 to pl-4 */}
                          <button
                            onClick={() => hasDetails && !isLocked && toggleTechnique(step.id)}
                            disabled={isLocked}
                            className={`w-full p-3 pl-4 text-left transition-colors ${
                              step.id === currentStepId
                                ? "bg-hh-primary/5 border-l-2 border-hh-primary pl-[14px]"
                                : step.status === "locked"
                                ? "opacity-60 cursor-not-allowed"
                                : hasDetails 
                                ? "hover:bg-hh-ui-50"
                                : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {/* Status icon - Exact from RolePlayChat */}
                              <div className="flex-shrink-0 mt-0.5">
                                {step.status === "completed" ? (
                                  <CheckCircle2 className="w-4 h-4 text-hh-success" />
                                ) : step.status === "current" ? (
                                  <Circle className="w-4 h-4 text-hh-primary fill-hh-primary" />
                                ) : step.status === "locked" ? (
                                  <Lock className="w-4 h-4 text-hh-muted" />
                                ) : (
                                  <Circle className="w-4 h-4 text-hh-muted" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className={`text-[13px] leading-[18px] truncate ${
                                      step.id === currentStepId ? "text-hh-text font-medium" : "text-hh-text"
                                    }`}>
                                      {step.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {step.nummer && (
                                        <span className="text-[11px] leading-[14px] text-hh-muted">
                                          {step.nummer}
                                        </span>
                                      )}
                                      {step.duration && (
                                        <>
                                          <span className="text-[11px] leading-[14px] text-hh-muted">•</span>
                                          <div className="flex items-center gap-1 text-[11px] leading-[14px] text-hh-muted">
                                            <Clock className="w-3 h-3" />
                                            {step.duration}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Expand chevron if details available */}
                                  {hasDetails && !isLocked && (
                                    <div className="flex-shrink-0">
                                      {isExpanded ? (
                                        <ChevronDown className="w-3 h-3 text-hh-muted" />
                                      ) : (
                                        <ChevronRight className="w-3 h-3 text-hh-muted" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>

                          {/* Technique Details - Third Level - Reduced indentation */}
                          {isExpanded && details && (
                            <div className="px-4 py-3 pl-10 bg-hh-ui-50/30 border-l border-hh-border ml-2">
                              <div className="space-y-2 text-[12px] leading-[17px]">
                                {details.wat && (
                                  <div>
                                    <span className="text-hh-text font-medium">Wat: </span>
                                    <span className="text-hh-muted">{details.wat}</span>
                                  </div>
                                )}
                                {details.wanneer && (
                                  <div>
                                    <span className="text-hh-text font-medium">Wanneer: </span>
                                    <span className="text-hh-muted">{details.wanneer}</span>
                                  </div>
                                )}
                                {details.doel && (
                                  <div>
                                    <span className="text-hh-text font-medium">Doel: </span>
                                    <span className="text-hh-muted">{details.doel}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}