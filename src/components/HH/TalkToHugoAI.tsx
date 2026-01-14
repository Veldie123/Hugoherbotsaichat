import { useState, useRef, useEffect } from "react";
import { AppLayout } from "./AppLayout";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { StopRoleplayDialog } from "./StopRoleplayDialog";
import { TechniqueDetailsDialog } from "./TechniqueDetailsDialog";
import {
  Send,
  ChevronRight,
  ChevronDown,
  Check,
  Lightbulb,
  MessageSquare,
  StopCircle,
} from "lucide-react";
import technieken_index from "../../data/technieken_index";
import { KLANT_HOUDINGEN } from "../../data/klant_houdingen";
import { EPICSidebar } from "./AdminChatExpertModeSidebar";

interface Message {
  id: string;
  sender: "hugo" | "ai";
  text: string;
  timestamp: Date;
  technique?: string;
}

interface TalkToHugoAIProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

export function TalkToHugoAI({
  navigate,
  isAdmin,
}: TalkToHugoAIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedTechnique, setSelectedTechnique] = useState<string>("");
  const [currentPhase, setCurrentPhase] = useState(1);
  const [expandedPhases, setExpandedPhases] = useState<number[]>([1]);
  const [expandedParents, setExpandedParents] = useState<string[]>([]);
  const [expandedHoudingen, setExpandedHoudingen] = useState<string[]>([]);
  const [techniqueDetailsPanelOpen, setTechniqueDetailsPanelOpen] = useState(false);
  const [selectedTechniqueDetails, setSelectedTechniqueDetails] = useState<any | null>(null);
  const [fasesAccordionOpen, setFasesAccordionOpen] = useState(true);
  const [houdingenAccordionOpen, setHoudingenAccordionOpen] = useState(false);
  const [activeHouding, setActiveHouding] = useState<string | null>(null);
  const [recommendedTechnique, setRecommendedTechnique] = useState<string | null>(null);
  const [difficultyLevel, setDifficultyLevel] = useState<"beginner" | "gemiddeld" | "expert">("beginner");
  const [stopRoleplayDialogOpen, setStopRoleplayDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const techniquesByPhase: Record<number, any[]> = {};
  Object.values(technieken_index.technieken).forEach((technique: any) => {
    const phase = parseInt(technique.fase);
    if (!techniquesByPhase[phase]) {
      techniquesByPhase[phase] = [];
    }
    techniquesByPhase[phase].push(technique);
  });

  const phaseNames: Record<number, string> = {
    0: "Pre-contactfase",
    1: "Openingsfase",
    2: "Ontdekkingsfase",
    3: "Aanbevelingsfase",
    4: "Beslissingsfase"
  };

  const klantHoudingenArray = Object.entries(KLANT_HOUDINGEN.houdingen).map(([key, houding]) => ({
    id: houding.id,
    key: key,
    naam: houding.naam,
    beschrijving: houding.houding_beschrijving,
    technieken: [...(houding.recommended_technique_ids || [])],
    recommended_technique_ids: [...(houding.recommended_technique_ids || [])],
  }));

  const togglePhase = (phase: number) => {
    setExpandedPhases(prev =>
      prev.includes(phase) ? prev.filter(p => p !== phase) : [...prev, phase]
    );
  };

  const toggleParentTechnique = (id: string) => {
    setExpandedParents(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleHouding = (id: string) => {
    setExpandedHoudingen(prev =>
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    );
  };

  const openTechniqueDetails = (techniqueNumber: string) => {
    const technique = Object.values(technieken_index.technieken).find(
      (t: any) => t.nummer === techniqueNumber
    ) as any;
    if (technique) {
      setSelectedTechniqueDetails(technique);
      setTechniqueDetailsPanelOpen(true);
    }
  };

  const startTechniqueChat = (techniqueNumber: string) => {
    setSelectedTechnique(techniqueNumber);
  };

  const getFaseBadgeColor = (fase: number) => {
    const colors: Record<number, string> = {
      0: "bg-slate-100 text-slate-700 border-slate-200",
      1: "bg-blue-100 text-blue-700 border-blue-200",
      2: "bg-emerald-100 text-emerald-700 border-emerald-200",
      3: "bg-amber-100 text-amber-700 border-amber-200",
      4: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[fase] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getTopLevelTechniques = (phase: number) => {
    const techniques = techniquesByPhase[phase] || [];
    return techniques.filter((t: any) => {
      const parts = t.nummer.split('.');
      return parts.length === 2;
    });
  };

  const hasChildren = (technique: any, phase: number) => {
    const techniques = techniquesByPhase[phase] || [];
    return techniques.some((t: any) => {
      const parts = t.nummer.split('.');
      return parts.length === 3 && t.nummer.startsWith(technique.nummer + '.');
    });
  };

  const getChildTechniques = (parentNumber: string, phase: number) => {
    const techniques = techniquesByPhase[phase] || [];
    return techniques.filter((t: any) => {
      const parts = t.nummer.split('.');
      return parts.length === 3 && t.nummer.startsWith(parentNumber + '.');
    });
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "hugo",
      text: inputText,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Goede vraag! Laat me daar eens over nadenken...",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleStopRoleplay = () => {
    setStopRoleplayDialogOpen(true);
  };

  const confirmStopRoleplay = () => {
    setMessages([]);
    setInputText("");
    setSelectedTechnique("");
  };

  return (
    <AppLayout currentPage="talk-to-hugo" navigate={navigate} isAdmin={isAdmin}>
      <div className="flex h-[calc(100vh-4rem)]">
        {difficultyLevel !== "expert" && (
          <div className="w-[320px] flex-shrink-0 overflow-y-auto h-full">
            <EPICSidebar
              fasesAccordionOpen={fasesAccordionOpen}
              setFasesAccordionOpen={setFasesAccordionOpen}
              houdingenAccordionOpen={houdingenAccordionOpen}
              setHoudingenAccordionOpen={setHoudingenAccordionOpen}
              expandedPhases={expandedPhases}
              togglePhase={togglePhase}
              setCurrentPhase={setCurrentPhase}
              expandedParents={expandedParents}
              toggleParentTechnique={toggleParentTechnique}
              expandedHoudingen={expandedHoudingen}
              toggleHouding={toggleHouding}
              selectedTechnique={selectedTechnique}
              setSelectedTechnique={setSelectedTechnique}
              activeHouding={activeHouding}
              recommendedTechnique={recommendedTechnique}
              openTechniqueDetails={openTechniqueDetails}
              startTechniqueChat={startTechniqueChat}
              techniquesByPhase={techniquesByPhase}
              phaseNames={phaseNames}
              getFaseBadgeColor={getFaseBadgeColor}
              getTopLevelTechniques={getTopLevelTechniques}
              hasChildren={hasChildren}
              getChildTechniques={getChildTechniques}
              klantHoudingen={klantHoudingenArray}
              difficultyLevel={difficultyLevel}
              isUserView={true}
            />
          </div>
        )}

        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-hh-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[18px] leading-[24px] font-bold text-hh-text">
                  Hugo AI Coach
                </h2>
                <p className="text-[12px] text-hh-muted">Oefen je verkooptechnieken met AI</p>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStopRoleplay}
                    className="gap-2"
                  >
                    <StopCircle className="w-4 h-4" />
                    Stop Rollenspel
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[12px] text-hh-muted">Niveau:</span>
              <div className="flex gap-1">
                {(["beginner", "gemiddeld", "expert"] as const).map((level) => (
                  <Button
                    key={level}
                    variant={difficultyLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDifficultyLevel(level)}
                    className={`h-7 text-[11px] px-3 ${difficultyLevel === level ? "bg-hh-ink hover:bg-hh-ink/90" : ""}`}
                  >
                    {level === "beginner" ? "Beginner" : level === "gemiddeld" ? "Gemiddeld" : "Expert"}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Lightbulb className="w-12 h-12 text-hh-muted mx-auto mb-4" />
                  <p className="text-hh-muted text-[14px]">
                    Begin een gesprek met de AI klant
                  </p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className={`flex ${message.sender === "hugo" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] ${message.sender === "hugo" ? "" : "flex gap-2"}`}>
                    {message.sender === "ai" && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-hh-primary text-white text-[12px]">
                          AI
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div
                        className={`p-3 rounded-lg relative ${
                          message.sender === "hugo"
                            ? "bg-hh-ink text-white"
                            : "bg-hh-ui-50 text-hh-text border border-hh-border"
                        }`}
                      >
                        <p className="text-[13px] leading-[19px]">{message.text}</p>
                        
                        {message.sender === "ai" && (
                          <button
                            className="flex items-center gap-1 mt-2 text-[11px] text-hh-muted hover:text-hh-primary transition-colors"
                            onClick={() => {}}
                          >
                            <Lightbulb className="w-3 h-3" />
                            Tip: Bekijk aanbevolen techniek
                          </button>
                        )}
                        
                        <div className="flex items-center justify-between gap-2 mt-2 text-[10px] opacity-70">
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-hh-border">
            {difficultyLevel === "expert" && (
              <div className="mb-3">
                <label className="text-[12px] font-medium text-hh-text mb-2 block">
                  Selecteer techniek die je gaat toepassen:
                </label>
                <div className="relative">
                  <select
                    value={selectedTechnique}
                    onChange={(e) => setSelectedTechnique(e.target.value)}
                    className="w-full px-4 py-3 text-[13px] border-2 border-hh-ink/20 rounded-lg bg-white text-hh-text focus:outline-none focus:ring-2 focus:ring-hh-ink focus:border-hh-ink appearance-none cursor-pointer hover:border-hh-ink/30 transition-colors font-medium shadow-sm"
                  >
                    <option value="" className="text-hh-muted">-- Kies een techniek uit de lijst --</option>
                    {[0, 1, 2, 3, 4].map(phase => {
                      const phaseTechniques = (techniquesByPhase[phase] || [])
                        .filter((t: any) => !t.is_fase)
                        .sort((a: any, b: any) => {
                          const aNum = a.nummer.split('.').map((n: string) => parseInt(n) || 0);
                          const bNum = b.nummer.split('.').map((n: string) => parseInt(n) || 0);
                          for (let i = 0; i < Math.max(aNum.length, bNum.length); i++) {
                            if ((aNum[i] || 0) !== (bNum[i] || 0)) {
                              return (aNum[i] || 0) - (bNum[i] || 0);
                            }
                          }
                          return 0;
                        });
                      
                      if (phaseTechniques.length === 0) return null;
                      
                      return (
                        <optgroup key={phase} label={`── ${phaseNames[phase]} ──`}>
                          {phaseTechniques.map((t: any) => (
                            <option key={t.nummer} value={t.nummer} className="py-2 font-normal">
                              {t.nummer} • {t.naam}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted pointer-events-none" />
                </div>
                {selectedTechnique && (
                  <div className="mt-2 p-2 bg-hh-ink/10 rounded-lg border border-hh-ink/20">
                    <p className="text-[11px] text-hh-ink flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" />
                      Je gaat techniek {selectedTechnique} toepassen
                    </p>
                  </div>
                )}
              </div>
            )}


            {difficultyLevel !== "expert" && selectedTechnique && (
              <div className="mb-3 p-3 bg-hh-ink/10 rounded-lg border border-hh-ink/20">
                <p className="text-[12px] text-hh-ink flex items-center justify-between">
                  <span>✓ Geselecteerde techniek: {selectedTechnique}</span>
                  <button
                    onClick={() => setSelectedTechnique("")}
                    className="text-[11px] text-hh-muted hover:text-hh-text underline"
                  >
                    Wijzig
                  </button>
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && selectedTechnique && handleSendMessage()}
                placeholder={
                  selectedTechnique 
                    ? "Type je antwoord als verkoper..." 
                    : "Selecteer eerst een techniek..."
                }
                className="flex-1"
                disabled={!selectedTechnique}
              />
              <Button 
                onClick={handleSendMessage} 
                className="gap-2 bg-hh-ink hover:bg-hh-ink/90"
                disabled={!selectedTechnique || !inputText.trim()}
              >
                <Send className="w-4 h-4" />
                Verzend
              </Button>
            </div>
          </div>
        </div>
      </div>

      <StopRoleplayDialog
        open={stopRoleplayDialogOpen}
        onOpenChange={setStopRoleplayDialogOpen}
        onConfirm={confirmStopRoleplay}
      />

      <TechniqueDetailsDialog
        open={techniqueDetailsPanelOpen}
        onOpenChange={setTechniqueDetailsPanelOpen}
        technique={selectedTechniqueDetails}
        isEditable={false}
      />
    </AppLayout>
  );
}
