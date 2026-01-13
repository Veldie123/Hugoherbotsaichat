import { useState, useRef, useEffect } from "react";
import { AppLayout } from "./AppLayout";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { StopRoleplayDialog } from "./StopRoleplayDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Send,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Menu,
  ChevronLeft,
  Info,
  Lightbulb,
  Target,
  MessageSquare,
  StopCircle,
} from "lucide-react";
import { EPIC_TECHNIQUES } from "../../data/epicTechniques";
import technieken_index from "../../data/technieken_index";
import { KLANT_HOUDINGEN } from "../../data/klant_houdingen";
import { cn } from "../ui/utils";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const klantHoudingenArray = Object.values(KLANT_HOUDINGEN.houdingen);

  const getTechniqueNameByNumber = (techniqueNumber: string): string => {
    const technique = Object.values(technieken_index.technieken).find(
      (t: any) => t.nummer === techniqueNumber
    ) as any;
    return technique ? technique.naam : techniqueNumber;
  };

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
    );
    if (technique) {
      setSelectedTechniqueDetails(technique);
      setTechniqueDetailsPanelOpen(true);
    }
  };

  const startTechniqueChat = (techniqueNumber: string, techniqueName: string) => {
    const technique = Object.values(technieken_index.technieken).find(
      (t: any) => t.nummer === techniqueNumber
    ) as any;

    if (!technique) return;

    const systemMessage: Message = {
      id: Date.now().toString(),
      sender: "ai",
      text: `Laten we de techniek "${techniqueName}" (${techniqueNumber}) oefenen. Ik zal de klant spelen en ik wil dat jij deze techniek toepast. Probeer de techniek correct uit te voeren zoals beschreven in de theorie.\n\nZodra je klaar bent, stuur je bericht en ik geef feedback met een ✓ (correct) of ✗ (verbeterpunt).`,
      timestamp: new Date(),
    };

    setMessages([systemMessage]);
    setSelectedTechnique(techniqueName);
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const getFaseBadgeColor = (phase: number) => {
    return "bg-hh-ink/10 text-hh-ink border-hh-ink/30";
  };

  const getTopLevelTechniques = (phase: number) => {
    return (techniquesByPhase[phase] || []).filter((t: any) => {
      if (t.is_fase) return false;
      return !t.parent || t.parent === phase.toString() || t.parent === `${phase}`;
    });
  };

  const hasChildren = (technique: any, phase: number) => {
    return (techniquesByPhase[phase] || []).some((t: any) => t.parent === technique.nummer);
  };

  const getChildTechniques = (parentNumber: string, phase: number) => {
    return (techniquesByPhase[phase] || []).filter((t: any) => t.parent === parentNumber);
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
    setSelectedTechnique("");

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

        <Dialog open={techniqueDetailsPanelOpen} onOpenChange={setTechniqueDetailsPanelOpen}>
          <DialogContent className="max-w-[700px] max-h-[90vh] overflow-hidden p-0 flex flex-col">
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-hh-ink text-white text-[12px] px-2 py-0.5">
                      {selectedTechniqueDetails?.nummer}
                    </Badge>
                    <span className="text-[12px] text-hh-muted">
                      Fase {selectedTechniqueDetails?.fase}
                    </span>
                  </div>
                  <DialogTitle className="text-[24px] leading-[32px] font-bold text-hh-text">
                    {selectedTechniqueDetails?.naam}
                  </DialogTitle>
                  {selectedTechniqueDetails?.tags && selectedTechniqueDetails.tags.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {selectedTechniqueDetails.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-[10px] px-2 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="overflow-y-auto px-6 pb-6 space-y-4 flex-1" style={{ maxHeight: 'calc(90vh - 180px)' }}>
              {selectedTechniqueDetails?.doel && (
                <div className="bg-hh-ink/10 p-4 rounded-lg border border-hh-ink/20">
                  <div className="flex items-start gap-2 mb-2">
                    <Target className="w-4 h-4 text-hh-ink mt-0.5 flex-shrink-0" />
                    <h3 className="text-[13px] font-semibold text-hh-text">Doel</h3>
                  </div>
                  <p className="text-[13px] leading-[20px] text-hh-text">
                    {selectedTechniqueDetails.doel}
                  </p>
                </div>
              )}

              {selectedTechniqueDetails?.wat && (
                <div>
                  <h3 className="text-[14px] font-bold text-hh-text mb-2">Wat</h3>
                  <p className="text-[13px] leading-[20px] text-hh-muted">
                    {selectedTechniqueDetails.wat}
                  </p>
                </div>
              )}

              {selectedTechniqueDetails?.waarom && (
                <div>
                  <h3 className="text-[14px] font-bold text-hh-text mb-2">Waarom</h3>
                  <p className="text-[13px] leading-[20px] text-hh-muted">
                    {selectedTechniqueDetails.waarom}
                  </p>
                </div>
              )}

              {selectedTechniqueDetails?.wanneer && (
                <div>
                  <h3 className="text-[14px] font-bold text-hh-text mb-2">Wanneer</h3>
                  <p className="text-[13px] leading-[20px] text-hh-muted">
                    {selectedTechniqueDetails.wanneer}
                  </p>
                </div>
              )}

              {selectedTechniqueDetails?.hoe && (
                <div>
                  <h3 className="text-[14px] font-bold text-hh-text mb-2">Hoe</h3>
                  <p className="text-[13px] leading-[20px] text-hh-muted">
                    {selectedTechniqueDetails.hoe}
                  </p>
                </div>
              )}

              {selectedTechniqueDetails?.stappenplan && selectedTechniqueDetails.stappenplan.length > 0 && (
                <div>
                  <h3 className="text-[14px] font-bold text-hh-text mb-2">Stappenplan</h3>
                  <ol className="space-y-2">
                    {selectedTechniqueDetails.stappenplan.map((step: string, idx: number) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-hh-ink/10 text-hh-ink text-[11px] font-semibold">
                          {idx + 1}
                        </span>
                        <span className="text-[13px] leading-[20px] text-hh-muted pt-0.5">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {selectedTechniqueDetails?.voorbeeld && selectedTechniqueDetails.voorbeeld.length > 0 && (
                <div>
                  <h3 className="text-[14px] font-bold text-hh-text mb-2">Voorbeelden</h3>
                  <div className="space-y-2">
                    {selectedTechniqueDetails.voorbeeld.map((ex: string, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <p className="text-[13px] leading-[20px] text-hh-text italic">
                          "{ex}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 pt-4 border-t border-hh-border bg-white sticky bottom-0">
              <Button
                onClick={() => setTechniqueDetailsPanelOpen(false)}
                className="w-full"
                variant="outline"
              >
                Sluiten
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-hh-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[18px] leading-[24px] font-bold text-hh-text">
                  Talk to Hugo AI
                </h2>
                <p className="text-[12px] text-hh-muted">Oefen verkooptechnieken met je AI coach</p>
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
    </AppLayout>
  );
}
