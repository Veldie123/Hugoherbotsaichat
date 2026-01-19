/**
 * TODO[DEBUG-INFO-UITBREIDEN]: TranscriptDialog debug info uitbreiding
 * Status: Partial (Frontend UI klaar, backend koppeling pending)
 * Issue: Debug info was hardcoded placeholder - nu dynamisch maar backend levert nog geen data
 * Bron: hugo-engine_(4).zip → debug velden komen uit coach-engine.ts response
 * Oplossing Frontend (Done):
 *   1. TranscriptDebugInfo interface toegevoegd met alle engine debug velden
 *   2. TranscriptMessage interface uitgebreid met optionele debugInfo
 *   3. Collapsible debug sectie rendert nu echte data wanneer beschikbaar
 *   4. Fallback naar "neutraal" / "Geen debug data" wanneer data ontbreekt
 * Backend koppeling (Pending):
 *   - API /api/sessions moet debug data includeren per transcript message
 *   - AdminSessions.tsx mapping moet debugInfo veld doorgeven
 * Frontend koppeling: AdminSessions.tsx, HugoAIOverview.tsx transcript dialogs
 */

import { useState } from "react";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { getCodeBadgeColors } from "../../utils/phaseColors";

export interface TranscriptDebugInfo {
  signal?: "positief" | "neutraal" | "negatief";
  detectedTechnique?: string;
  expectedTechnique?: string;
  persona?: {
    gedragsstijl?: string;
    koopklok?: string;
    moeilijkheid?: string;
  };
  context?: {
    fase?: number;
    gathered?: {
      sector?: string | null;
      product?: string | null;
      klantType?: string | null;
      verkoopkanaal?: string | null;
    };
  };
  customerDynamics?: {
    rapport?: number;
    valueTension?: number;
    commitReadiness?: number;
  };
  aiDecision?: {
    epicFase?: string;
    evaluatie?: string;
  };
}

export interface TranscriptMessage {
  speaker: string;
  time: string;
  text: string;
  debugInfo?: TranscriptDebugInfo;
}

export interface TranscriptSession {
  id: number;
  userName?: string;
  userWorkspace?: string;
  techniqueNumber: string;
  techniqueName: string;
  type: string;
  date: string;
  time?: string;
  duration?: string;
  score?: number;
  quality: "excellent" | "good" | "needs-improvement" | "Excellent" | "Good" | "Needs Work";
  transcript: TranscriptMessage[];
  strengths?: string[];
  improvements?: string[];
}

interface TranscriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: TranscriptSession | null;
  isAdmin?: boolean;
}

const getQualityBadge = (quality: string) => {
  const lowerQuality = quality.toLowerCase().replace(" ", "-");
  switch (lowerQuality) {
    case "excellent":
      return (
        <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 hover:bg-hh-success/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Excellent
        </Badge>
      );
    case "good":
      return (
        <Badge className="bg-hh-ink/10 text-hh-ink border-hh-ink/20 hover:bg-hh-ink/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Good
        </Badge>
      );
    case "needs-improvement":
    case "needs-work":
      return (
        <Badge className="bg-hh-warning/10 text-hh-warning border-hh-warning/20 hover:bg-hh-warning/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Needs Improvement
        </Badge>
      );
    default:
      return null;
  }
};

export function TranscriptDialog({ open, onOpenChange, session, isAdmin = false }: TranscriptDialogProps) {
  const [expandedDebug, setExpandedDebug] = useState<string | null>(null);

  const toggleDebug = (lineId: string) => {
    setExpandedDebug(expandedDebug === lineId ? null : lineId);
  };

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 flex-wrap">
            <span>{session.userName || session.techniqueName}</span>
            <Badge variant="outline" className={`${getCodeBadgeColors(session.techniqueNumber)} text-[11px]`}>
              {session.techniqueNumber} - {session.techniqueName}
            </Badge>
            {getQualityBadge(session.quality)}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Bekijk de volledige transcript en details van de sessie
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Info */}
          <div className="flex items-center gap-4 text-[14px] leading-[20px] text-hh-muted flex-wrap">
            {session.userName && (
              <>
                <span>{session.userName}</span>
                <span>•</span>
              </>
            )}
            {session.userWorkspace && (
              <>
                <span>{session.userWorkspace}</span>
                <span>•</span>
              </>
            )}
            <span>{session.type}</span>
            <span>•</span>
            <span>{session.date} {session.time}</span>
          </div>

          {/* Transcript */}
          <Card className="p-4 rounded-[16px] border-hh-border">
            <h3 className="text-[16px] leading-[22px] text-hh-text font-medium mb-3">
              Transcript
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {session.transcript.map((line, index) => {
                const isAICoach = line.speaker === "AI Coach" || line.speaker.includes("Coach");
                const lineId = `${session.id}-${index}`;
                
                return (
                  <div key={index} className="space-y-2">
                    <div
                      className={`flex gap-3 p-3 rounded-lg ${
                        isAICoach 
                          ? "bg-cyan-50 border border-cyan-200" 
                          : "bg-fuchsia-50 border border-fuchsia-200"
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <Badge
                          className={`text-[10px] font-mono ${
                            isAdmin
                              ? "bg-purple-600 text-white border-purple-600"
                              : "bg-[#4F7396] text-white border-[#4F7396]"
                          }`}
                        >
                          {line.time}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] leading-[18px] font-medium text-hh-text mb-1">
                          {line.speaker}:
                        </p>
                        <p className="text-[14px] leading-[20px] text-hh-text">
                          {line.text}
                        </p>
                      </div>
                    </div>

                    {/* Debug toggle */}
                    <div className="ml-11">
                      <button
                        onClick={() => toggleDebug(lineId)}
                        className="flex items-center gap-2 text-[12px] leading-[16px] text-hh-muted hover:text-hh-text transition-colors"
                      >
                        {expandedDebug === lineId ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                        Debug Info
                      </button>

                      {expandedDebug === lineId && (
                        <Card className="mt-2 p-4 border-2 border-dashed border-hh-ink/20 bg-hh-ui-50/30 text-slate-800">
                          <div className="space-y-3 text-[13px] leading-[18px]">
                            {/* Signaal */}
                            <div className="flex items-center gap-2">
                              <span className="text-hh-muted">Signaal:</span>
                              <Badge className={`${
                                line.debugInfo?.signal === "positief" 
                                  ? "bg-green-100 text-green-700 border-green-300"
                                  : line.debugInfo?.signal === "negatief"
                                  ? "bg-red-100 text-red-700 border-red-300"
                                  : "bg-gray-100 text-gray-700 border-gray-300"
                              }`}>
                                {line.debugInfo?.signal || "neutraal"}
                              </Badge>
                            </div>
                            
                            {/* Gedetecteerde techniek */}
                            {line.debugInfo?.detectedTechnique && (
                              <div className="flex items-center gap-2">
                                <span className="text-hh-muted">Gedetecteerde techniek:</span>
                                <span className="font-medium">{line.debugInfo.detectedTechnique}</span>
                              </div>
                            )}
                            
                            {/* Verwachte techniek */}
                            {line.debugInfo?.expectedTechnique && (
                              <div className="flex items-center gap-2">
                                <span className="text-hh-muted">Verwachte techniek:</span>
                                <span className="font-medium">{line.debugInfo.expectedTechnique}</span>
                              </div>
                            )}
                            
                            {/* Persona info */}
                            {line.debugInfo?.persona && (
                              <div className="pt-2 border-t border-hh-border">
                                <p className="text-[11px] text-hh-muted mb-2">Persona</p>
                                <div className="grid grid-cols-3 gap-2 text-[12px]">
                                  {line.debugInfo.persona.gedragsstijl && (
                                    <div>
                                      <span className="text-hh-muted">Stijl:</span>
                                      <p className="font-medium">{line.debugInfo.persona.gedragsstijl}</p>
                                    </div>
                                  )}
                                  {line.debugInfo.persona.koopklok && (
                                    <div>
                                      <span className="text-hh-muted">Koopklok:</span>
                                      <p className="font-medium">{line.debugInfo.persona.koopklok}</p>
                                    </div>
                                  )}
                                  {line.debugInfo.persona.moeilijkheid && (
                                    <div>
                                      <span className="text-hh-muted">Niveau:</span>
                                      <p className="font-medium">{line.debugInfo.persona.moeilijkheid}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Customer Dynamics */}
                            {line.debugInfo?.customerDynamics && (
                              <div className="pt-2 border-t border-hh-border">
                                <p className="text-[11px] text-hh-muted mb-2">Klant Dynamiek</p>
                                <div className="grid grid-cols-3 gap-2 text-[12px]">
                                  <div>
                                    <span className="text-hh-muted">Rapport:</span>
                                    <p className="font-medium">{line.debugInfo.customerDynamics.rapport ?? "-"}</p>
                                  </div>
                                  <div>
                                    <span className="text-hh-muted">Waarde:</span>
                                    <p className="font-medium">{line.debugInfo.customerDynamics.valueTension ?? "-"}</p>
                                  </div>
                                  <div>
                                    <span className="text-hh-muted">Commit:</span>
                                    <p className="font-medium">{line.debugInfo.customerDynamics.commitReadiness ?? "-"}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* AI Decision */}
                            {line.debugInfo?.aiDecision && (
                              <div className="pt-2 border-t border-hh-border">
                                <p className="text-[11px] text-hh-muted mb-2">AI Beslissing</p>
                                <div className="flex items-center gap-4 text-[12px]">
                                  {line.debugInfo.aiDecision.epicFase && (
                                    <div>
                                      <span className="text-hh-muted">EPIC Fase:</span>
                                      <span className="font-medium ml-1">{line.debugInfo.aiDecision.epicFase}</span>
                                    </div>
                                  )}
                                  {line.debugInfo.aiDecision.evaluatie && (
                                    <div>
                                      <span className="text-hh-muted">Evaluatie:</span>
                                      <Badge className={`ml-1 text-[10px] ${
                                        line.debugInfo.aiDecision.evaluatie === "positief" || line.debugInfo.aiDecision.evaluatie === "perfect"
                                          ? "bg-green-100 text-green-700 border-green-300"
                                          : line.debugInfo.aiDecision.evaluatie === "gemist"
                                          ? "bg-red-100 text-red-700 border-red-300"
                                          : "bg-gray-100 text-gray-700 border-gray-300"
                                      }`}>
                                        {line.debugInfo.aiDecision.evaluatie}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Geen debug data */}
                            {!line.debugInfo && (
                              <p className="text-hh-muted italic">Geen debug data beschikbaar</p>
                            )}
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* AI Feedback */}
          <Card className="p-4 rounded-[16px] border-hh-border bg-hh-ui-50/50">
            <h3 className="text-[16px] leading-[22px] text-hh-text font-medium mb-3">
              AI Feedback
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-[13px] font-medium text-hh-success mb-2">Sterke punten</h4>
                <ul className="space-y-1">
                  {(session.strengths || ["Goede opening", "Sterke feitgerichte vragen"]).map((strength, idx) => (
                    <li key={idx} className="text-[13px] text-hh-text flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-hh-success flex-shrink-0 mt-0.5" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[13px] font-medium text-hh-warning mb-2">Verbeterpunten</h4>
                <ul className="space-y-1">
                  {(session.improvements || ["Meer doorvragen na antwoord", "Pauzes inbouwen"]).map((improvement, idx) => (
                    <li key={idx} className="text-[13px] text-hh-text flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-hh-warning flex-shrink-0 mt-0.5" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
