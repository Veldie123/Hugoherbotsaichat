import { useState, useRef, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { StopRoleplayDialog } from "./StopRoleplayDialog";
import { TechniqueDetailsDialog } from "./TechniqueDetailsDialog";
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
  Power,
  PowerOff,
  Menu,
  ChevronLeft,
  Info,
  Lightbulb,
  Pencil,
  Target,
  MessageSquare,
  StopCircle,
  AlertCircle,
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
  debugInfo?: DebugInfo;
}

interface DebugInfo {
  // For AI Coach messages (Customer)
  chosenTechnique?: string;
  klantSignaal?: "positief" | "neutraal" | "negatief";
  expectedTechnique?: string;
  persona: {
    gedragsstijl: string;
    koopklok: string;
    moeilijkheid: string;
  };
  context: {
    fase: number;
  };
  customerDynamics: {
    rapport: number;
    valueTension: number;
    commitReadiness: number;
  };
  aiDecision: {
    epicFase: string;
    evaluatie: "positief" | "gemist" | "neutraal";
  };
  
  // For Hugo (Seller) messages
  sellerSignaal?: "positief" | "neutraal" | "negatief";
  expectedTechniqueForSeller?: string;
  detectedTechnique?: string;
  score?: number;
  chosenTechniqueForSeller?: string; // NEW: Technique Hugo chose to use
}

interface AdminChatExpertModeProps {
  sessionId: string;
  sessionTitle: string;
  navigate: (page: string) => void;
}

export function AdminChatExpertMode({
  sessionId,
  sessionTitle,
  navigate,
}: AdminChatExpertModeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedTechnique, setSelectedTechnique] = useState<string>("");
  const [expandedDebug, setExpandedDebug] = useState<string | null>(null); // Track which message debug is expanded
  const [expandedDebugSections, setExpandedDebugSections] = useState<Record<string, string[]>>({}); // Track expanded sections per message
  const [currentPhase, setCurrentPhase] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<number[]>([1]); // Phase 1 open by default
  const [expandedParents, setExpandedParents] = useState<string[]>([]); // Track expanded parent techniques
  const [expandedHoudingen, setExpandedHoudingen] = useState<string[]>([]); // Track expanded klant houdingen
  const [techniqueValidation, setTechniqueValidation] = useState<Record<string, boolean | null>>({});
  const [showFeedbackInput, setShowFeedbackInput] = useState<Record<string, boolean>>({});
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});
  const [techniqueDetailsPanelOpen, setTechniqueDetailsPanelOpen] = useState(false);
  const [selectedTechniqueDetails, setSelectedTechniqueDetails] = useState<any | null>(null);
  const [isEditingTechnique, setIsEditingTechnique] = useState(false); // NEW: Edit mode state
  const [editedTechniqueData, setEditedTechniqueData] = useState<any>(null); // NEW: Editable technique data
  const [fasesAccordionOpen, setFasesAccordionOpen] = useState(true); // NEW: Accordion state for Fases section
  const [houdingenAccordionOpen, setHoudingenAccordionOpen] = useState(false); // NEW: Accordion state for Houdingen section
  const [activeHouding, setActiveHouding] = useState<string | null>(null); // NEW: Currently active houding from AI
  const [recommendedTechnique, setRecommendedTechnique] = useState<string | null>(null); // NEW: Recommended technique to highlight
  const [difficultyLevel, setDifficultyLevel] = useState<"beginner" | "gemiddeld" | "expert">("beginner"); // NEW: Difficulty level
  const [stopRoleplayDialogOpen, setStopRoleplayDialogOpen] = useState(false); // NEW: Stop roleplay confirmation dialog
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Parse techniques by phase from technieken_index
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

  // Convert KLANT_HOUDINGEN object to array for rendering
  const klantHoudingenArray = Object.values(KLANT_HOUDINGEN.houdingen);

  // Helper function to get technique name from number
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
    // Find full technique details
    const technique = Object.values(technieken_index.technieken).find(
      (t: any) => t.nummer === techniqueNumber
    ) as any;

    if (!technique) return;

    // Create an initial Hugo (system) message explaining the training mode
    const systemMessage: Message = {
      id: Date.now().toString(),
      sender: "ai",
      text: `Laten we de techniek "${techniqueName}" (${techniqueNumber}) oefenen. Ik zal de klant spelen en ik wil dat jij deze techniek toepast. Probeer de techniek correct uit te voeren zoals beschreven in de theorie.\n\nZodra je klaar bent, stuur je bericht en ik geef feedback met een ✓ (correct) of ✗ (verbeterpunt).`,
      timestamp: new Date(),
      debugInfo: {
        persona: {
          gedragsstijl: "Analytisch",
          koopklok: "Kleur groen",
          moeilijkheid: difficultyLevel
        },
        context: {
          fase: parseInt(technique.fase) || currentPhase
        },
        customerDynamics: {
          rapport: 50,
          valueTension: 50,
          commitReadiness: 50
        },
        aiDecision: {
          epicFase: `Fase ${technique.fase}`,
          evaluatie: "neutraal"
        }
      }
    };

    setMessages([systemMessage]);
    setSelectedTechnique(techniqueName);
    
    // Auto-scroll to chat
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const getFaseBadgeColor = (phase: number) => {
    // Admin view uses purple palette for all phases
    return "bg-purple-100 text-purple-700 border-purple-300";
  };

  // Get top-level techniques (those without parent or whose parent is the phase itself)
  // EXCLUDE the phase itself (e.g., "1", "2") - only show numbered sub-techniques (e.g., "1.1", "2.1")
  const getTopLevelTechniques = (phase: number) => {
    return (techniquesByPhase[phase] || []).filter((t: any) => {
      // Exclude phase headers (is_fase === true)
      if (t.is_fase) return false;
      // Include only techniques that are direct children of the phase
      return !t.parent || t.parent === phase.toString() || t.parent === `${phase}`;
    });
  };

  // Check if a technique has children
  const hasChildren = (technique: any, phase: number) => {
    return (techniquesByPhase[phase] || []).some((t: any) => t.parent === technique.nummer);
  };

  // Get child techniques
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
      debugInfo: {
        chosenTechniqueForSeller: selectedTechnique ? getTechniqueNameByNumber(selectedTechnique) : "Geen",
        sellerSignaal: "neutraal",
        expectedTechniqueForSeller: getTechniqueNameByNumber("2.1.2"), // Convert to name
        detectedTechnique: selectedTechnique ? getTechniqueNameByNumber(selectedTechnique) : "Onbekend",
        score: 75,
        persona: {
          gedragsstijl: "Analytisch",
          koopklok: "Kleur groen",
          moeilijkheid: difficultyLevel
        },
        context: {
          fase: currentPhase
        },
        customerDynamics: {
          rapport: 70,
          valueTension: 60,
          commitReadiness: 50
        },
        aiDecision: {
          epicFase: `Fase ${currentPhase}`,
          evaluatie: "positief"
        }
      }
    };

    setMessages([...messages, newMessage]);
    setInputText("");
    setSelectedTechnique("");

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Goede vraag! Laat me daar eens over nadenken...",
        timestamp: new Date(),
        debugInfo: {
          klantSignaal: "positief",
          expectedTechnique: "2.1.5",
          persona: {
            gedragsstijl: "Analytisch",
            koopklok: "Kleur groen",
            moeilijkheid: difficultyLevel
          },
          context: {
            fase: currentPhase
          },
          customerDynamics: {
            rapport: 75,
            valueTension: 55,
            commitReadiness: 60
          },
          aiDecision: {
            epicFase: `Fase ${currentPhase}`,
            evaluatie: "positief"
          }
        }
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleStopRoleplay = () => {
    setStopRoleplayDialogOpen(true);
  };

  const confirmStopRoleplay = () => {
    setIsRecording(false);
    setMessages([]);
    setInputText("");
    setSelectedTechnique("");
  };
  
  // Toggle section visibility in debug info
  const toggleDebugSection = (messageId: string, section: string) => {
    setExpandedDebugSections((prev) => {
      const messageSections = prev[messageId] || [];
      const isExpanded = messageSections.includes(section);
      
      return {
        ...prev,
        [messageId]: isExpanded
          ? messageSections.filter((s) => s !== section)
          : [...messageSections, section],
      };
    });
  };
  
  const isDebugSectionExpanded = (messageId: string, section: string) => {
    return (expandedDebugSections[messageId] || []).includes(section);
  };

  return (
    <AdminLayout currentPage="admin-chat-expert" navigate={navigate}>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - EPIC Techniques (HIDDEN in Expert mode) */}
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
            />
          </div>
        )}

        {/* Technique Details Modal Dialog */}
        <Dialog open={techniqueDetailsPanelOpen} onOpenChange={setTechniqueDetailsPanelOpen}>
          <DialogContent className="max-w-[700px] max-h-[90vh] overflow-hidden p-0 flex flex-col">
            {/* Header */}
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-purple-600 text-white text-[12px] px-2 py-0.5">
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

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-6 pb-6 space-y-4 flex-1" style={{ maxHeight: 'calc(90vh - 180px)' }}>
              {/* Doel */}
              {selectedTechniqueDetails?.doel && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <div className="flex items-start gap-2 mb-2">
                    <Target className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <h3 className="text-[13px] font-semibold text-hh-text">Doel</h3>
                  </div>
                  <p className="text-[13px] leading-[20px] text-hh-text">
                    {selectedTechniqueDetails.doel}
                  </p>
                </div>
              )}

              {/* Wat */}
              {selectedTechniqueDetails?.wat && (
                <div>
                  <h3 className="text-[14px] font-bold text-hh-text mb-2">Wat</h3>
                  {!isEditingTechnique ? (
                    <p className="text-[13px] leading-[20px] text-hh-muted">
                      {selectedTechniqueDetails.wat}
                    </p>
                  ) : (
                    <Textarea
                      value={editedTechniqueData?.wat || ""}
                      onChange={(e) =>
                        setEditedTechniqueData({ ...editedTechniqueData, wat: e.target.value })
                      }
                      className="text-[13px] min-h-[80px]"
                    />
                  )}
                </div>
              )}

              {/* Waarom */}
              {selectedTechniqueDetails?.waarom && (
                <div>
                  <h3 className="text-[14px] font-bold text-hh-text mb-2">Waarom</h3>
                  {!isEditingTechnique ? (
                    <p className="text-[13px] leading-[20px] text-hh-muted">
                      {selectedTechniqueDetails.waarom}
                    </p>
                  ) : (
                    <Textarea
                      value={editedTechniqueData?.waarom || ""}
                      onChange={(e) =>
                        setEditedTechniqueData({ ...editedTechniqueData, waarom: e.target.value })
                      }
                      className="text-[13px] min-h-[80px]"
                    />
                  )}
                </div>
              )}

              {/* Wanneer */}
              {selectedTechniqueDetails?.wanneer && (
                <div>
                  <h3 className="text-[14px] font-bold text-hh-text mb-2">Wanneer</h3>
                  {!isEditingTechnique ? (
                    <p className="text-[13px] leading-[20px] text-hh-muted">
                      {selectedTechniqueDetails.wanneer}
                    </p>
                  ) : (
                    <Textarea
                      value={editedTechniqueData?.wanneer || ""}
                      onChange={(e) =>
                        setEditedTechniqueData({ ...editedTechniqueData, wanneer: e.target.value })
                      }
                      className="text-[13px] min-h-[80px]"
                    />
                  )}
                </div>
              )}

              {/* Hoe */}
              {selectedTechniqueDetails?.hoe && (
                <div>
                  <h3 className="text-[14px] font-bold text-hh-text mb-2">Hoe</h3>
                  {!isEditingTechnique ? (
                    <p className="text-[13px] leading-[20px] text-hh-muted">
                      {selectedTechniqueDetails.hoe}
                    </p>
                  ) : (
                    <Textarea
                      value={editedTechniqueData?.hoe || ""}
                      onChange={(e) =>
                        setEditedTechniqueData({ ...editedTechniqueData, hoe: e.target.value })
                      }
                      className="text-[13px] min-h-[80px]"
                    />
                  )}
                </div>
              )}

              {/* Stappenplan */}
              {selectedTechniqueDetails?.stappenplan && selectedTechniqueDetails.stappenplan.length > 0 && (
                <div>
                  <h3 className="text-[14px] font-bold text-hh-text mb-2">Stappenplan</h3>
                  <ol className="space-y-2">
                    {selectedTechniqueDetails.stappenplan.map((step: string, idx: number) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-[11px] font-semibold">
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

              {/* Voorbeelden */}
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

            {/* Footer met Bewerken, Opslaan en Sluiten buttons */}
            <div className="px-6 pb-6 pt-4 border-t border-hh-border bg-white sticky bottom-0">
              <div className="flex gap-2">
                {!isEditingTechnique ? (
                  <>
                    <Button
                      onClick={() => {
                        setIsEditingTechnique(true);
                        setEditedTechniqueData({ ...selectedTechniqueDetails });
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Bewerken
                    </Button>
                    <Button
                      onClick={() => setTechniqueDetailsPanelOpen(false)}
                      className="flex-1"
                      variant="outline"
                    >
                      Sluiten
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        // Save changes
                        console.log("Saving technique:", editedTechniqueData);
                        setSelectedTechniqueDetails(editedTechniqueData);
                        setIsEditingTechnique(false);
                        // TODO: Send to backend
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Opslaan
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditingTechnique(false);
                        setEditedTechniqueData(null);
                      }}
                      className="flex-1"
                      variant="outline"
                    >
                      Annuleren
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Right Panel - Chat */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-hh-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[18px] leading-[24px] font-bold text-hh-text">
                  {sessionTitle}
                </h2>
                <p className="text-[12px] text-hh-muted">Training AI Model</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  size="sm"
                  onClick={() => setIsRecording(!isRecording)}
                  className={`gap-2 ${!isRecording ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                >
                  {isRecording ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  {isRecording ? "Stop Opname" : "Start Opname"}
                </Button>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMessages([])}
                >
                  Opnieuw
                </Button>
              </div>
            </div>

            {/* Difficulty Level Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-hh-muted">Niveau:</span>
              <div className="flex gap-1">
                {(["beginner", "gemiddeld", "expert"] as const).map((level) => (
                  <Button
                    key={level}
                    variant={difficultyLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDifficultyLevel(level)}
                    className={`h-7 text-[11px] px-3 ${difficultyLevel === level ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                  >
                    {level === "beginner" ? "Beginner" : level === "gemiddeld" ? "Gemiddeld" : "Expert"}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Messages */}
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
                {/* Message Bubble */}
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
                            ? "bg-purple-600 text-white"
                            : "bg-hh-ui-50 text-hh-text border border-hh-border"
                        }`}
                      >
                        <p className="text-[13px] leading-[19px]">{message.text}</p>
                        
                        {/* Tip Button - INSIDE bubble for AI messages */}
                        {message.sender === "ai" && message.debugInfo && (
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
                          
                          {/* Debug Info Button - RECHTS ONDERAAN */}
                          {message.debugInfo && (
                            <button
                              onClick={() =>
                                setExpandedDebug(expandedDebug === message.id ? null : message.id)
                              }
                              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                                message.sender === "hugo"
                                  ? "bg-purple-700 hover:bg-purple-800 text-white"
                                  : "bg-gray-200 hover:bg-gray-300 text-hh-text"
                              }`}
                              title="Toggle debug info"
                            >
                              <Info className="w-3 h-3" />
                              <span className="text-[10px]">Debug</span>
                              {expandedDebug === message.id ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Debug Info (collapsible) - SMALLER WIDTH */}
                {message.debugInfo && expandedDebug === message.id && (
                  <div className={`${message.sender === "hugo" ? "flex justify-end" : "ml-10"}`}>
                    <Card className={`p-4 mt-2 border-2 border-dashed max-w-[280px] ${
                        message.sender === "ai" 
                          ? "border-purple-200 bg-purple-50/30" 
                          : "border-purple-200 bg-purple-50/30"
                      }`}>
                        <div className="space-y-3 text-[13px] leading-[18px]">
                          {/* For Hugo/Seller messages */}
                          {message.sender === "hugo" && (
                            <div className="space-y-3">
                              {/* Gekozen techniek (MOVED HERE from AI) */}
                              {message.debugInfo.chosenTechniqueForSeller && (
                                <div className="pb-3 border-b border-purple-200">
                                  <p className="text-[12px] text-hh-muted mb-1">Gekozen techniek:</p>
                                  <Badge 
                                    variant="outline" 
                                    className="text-[11px] cursor-pointer hover:bg-purple-100"
                                    onClick={() => openTechniqueDetails(message.debugInfo.chosenTechniqueForSeller || "")}
                                  >
                                    {message.debugInfo.chosenTechniqueForSeller}
                                  </Badge>
                                </div>
                              )}

                              {/* Verwachte techniek (ABOVE Gedetecteerde) */}
                              <div>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <p className="text-[12px] text-hh-muted mb-1">Verwachte techniek:</p>
                                    <p className="text-hh-text font-medium">
                                      {message.debugInfo.expectedTechniqueForSeller || "N/A"}
                                    </p>
                                  </div>
                                  {/* Validation buttons ✓/✗ */}
                                  {!showFeedbackInput[message.id] && (
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className={`h-7 w-7 transition-all ${
                                          techniqueValidation[message.id] === true
                                            ? "bg-green-500 text-white hover:bg-green-600"
                                            : "hover:bg-green-100 hover:text-green-700 border border-green-300"
                                        }`}
                                        onClick={() => {
                                          setTechniqueValidation((prev) => ({ ...prev, [message.id]: true }));
                                          setShowFeedbackInput((prev) => ({ ...prev, [message.id]: false }));
                                        }}
                                      >
                                        <Check className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className={`h-7 w-7 transition-all ${
                                          techniqueValidation[message.id] === false
                                            ? "bg-red-500 text-white hover:bg-red-600"
                                            : "hover:bg-red-100 hover:text-red-700 border border-red-300"
                                        }`}
                                        onClick={() => {
                                          setTechniqueValidation((prev) => ({ ...prev, [message.id]: false }));
                                          setShowFeedbackInput((prev) => ({ ...prev, [message.id]: true }));
                                        }}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                {showFeedbackInput[message.id] && (
                                  <div className="space-y-2 mt-3">
                                    <Input
                                      placeholder="Waarom is de verwachte techniek incorrect?"
                                      value={feedbackText[message.id] || ""}
                                      onChange={(e) =>
                                        setFeedbackText((prev) => ({ ...prev, [message.id]: e.target.value }))
                                      }
                                      className="text-[13px] border-hh-border"
                                    />
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-hh-muted hover:text-hh-text"
                                        onClick={() => {
                                          setShowFeedbackInput((prev) => ({ ...prev, [message.id]: false }));
                                          setTechniqueValidation((prev) => ({ ...prev, [message.id]: null }));
                                          setFeedbackText((prev) => ({ ...prev, [message.id]: "" }));
                                        }}
                                      >
                                        Annuleer
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                                        onClick={() => {
                                          console.log("Feedback submitted:", feedbackText[message.id]);
                                          setShowFeedbackInput((prev) => ({ ...prev, [message.id]: false }));
                                        }}
                                        disabled={!feedbackText[message.id]?.trim()}
                                      >
                                        Verzend
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Gedetecteerde techniek - WITH VALIDATION BUTTONS */}
                              <div>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <p className="text-[11px] text-hh-muted mb-1.5">Gedetecteerde techniek:</p>
                                    <p className="text-hh-text font-medium text-[13px]">
                                      {message.debugInfo.detectedTechnique || "N/A"}
                                      {message.debugInfo.score && (
                                        <span className="ml-2 text-green-600 font-semibold">
                                          (+{message.debugInfo.score})
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  {/* Validation buttons ✓/✗ for detected technique */}
                                  {!showFeedbackInput[message.id + "_detected"] && (
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className={`h-7 w-7 transition-all ${
                                          techniqueValidation[message.id + "_detected"] === true
                                            ? "bg-green-500 text-white hover:bg-green-600"
                                            : "hover:bg-green-100 hover:text-green-700 border border-green-300"
                                        }`}
                                        onClick={() => {
                                          setTechniqueValidation((prev) => ({ ...prev, [message.id + "_detected"]: true }));
                                          setShowFeedbackInput((prev) => ({ ...prev, [message.id + "_detected"]: false }));
                                        }}
                                      >
                                        <Check className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className={`h-7 w-7 transition-all ${
                                          techniqueValidation[message.id + "_detected"] === false
                                            ? "bg-red-500 text-white hover:bg-red-600"
                                            : "hover:bg-red-100 hover:text-red-700 border border-red-300"
                                        }`}
                                        onClick={() => {
                                          setTechniqueValidation((prev) => ({ ...prev, [message.id + "_detected"]: false }));
                                          setShowFeedbackInput((prev) => ({ ...prev, [message.id + "_detected"]: true }));
                                        }}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                {showFeedbackInput[message.id + "_detected"] && (
                                  <div className="space-y-2 mt-3">
                                    <Input
                                      placeholder="Waarom is de gedetecteerde techniek incorrect?"
                                      value={feedbackText[message.id + "_detected"] || ""}
                                      onChange={(e) =>
                                        setFeedbackText((prev) => ({ ...prev, [message.id + "_detected"]: e.target.value }))
                                      }
                                      className="text-[13px] border-hh-border"
                                    />
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-hh-muted hover:text-hh-text"
                                        onClick={() => {
                                          setShowFeedbackInput((prev) => ({ ...prev, [message.id + "_detected"]: false }));
                                          setTechniqueValidation((prev) => ({ ...prev, [message.id + "_detected"]: null }));
                                          setFeedbackText((prev) => ({ ...prev, [message.id + "_detected"]: "" }));
                                        }}
                                      >
                                        Annuleer
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                                        onClick={() => {
                                          console.log("Feedback submitted:", feedbackText[message.id + "_detected"]);
                                          setShowFeedbackInput((prev) => ({ ...prev, [message.id + "_detected"]: false }));
                                        }}
                                        disabled={!feedbackText[message.id + "_detected"]?.trim()}
                                      >
                                        Verzend
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Collapsible sections for Hugo */}
                              {/* Persona */}
                              <div className="pt-4 border-t border-purple-200/50">
                                <button
                                  onClick={() => toggleDebugSection(message.id, "persona")}
                                  className="flex items-center gap-2 text-[12px] font-semibold text-hh-text hover:text-hh-primary w-full"
                                >
                                  {isDebugSectionExpanded(message.id, "persona") ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                  Persona
                                </button>
                                {isDebugSectionExpanded(message.id, "persona") && (
                                  <div className="mt-2 ml-5 space-y-1 text-[12px]">
                                    <div className="flex justify-between">
                                      <span className="text-hh-muted">Gedragsstijl:</span>
                                      <p className="text-hh-text font-medium">{message.debugInfo.persona.gedragsstijl}</p>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-hh-muted">Koopklok:</span>
                                      <p className="text-hh-text font-medium">{message.debugInfo.persona.koopklok}</p>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-hh-muted">Moeilijkheid:</span>
                                      <p className="text-hh-text font-medium">{message.debugInfo.persona.moeilijkheid}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Context */}
                              <div>
                                <button
                                  onClick={() => toggleDebugSection(message.id, "context")}
                                  className="flex items-center gap-2 text-[12px] font-semibold text-hh-text hover:text-hh-primary w-full"
                                >
                                  {isDebugSectionExpanded(message.id, "context") ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                  Context
                                </button>
                                {isDebugSectionExpanded(message.id, "context") && message.debugInfo.context && (
                                  <div className="mt-2 ml-5 text-[12px]">
                                    <div className="flex justify-between">
                                      <span className="text-hh-muted">Fase:</span>
                                      <p className="text-hh-text font-medium">{message.debugInfo.context.fase}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Customer Dynamics */}
                              <div>
                                <button
                                  onClick={() => toggleDebugSection(message.id, "dynamics")}
                                  className="flex items-center gap-2 text-[12px] font-semibold text-hh-text hover:text-hh-primary w-full"
                                >
                                  {isDebugSectionExpanded(message.id, "dynamics") ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                  Customer Dynamics
                                </button>
                                {isDebugSectionExpanded(message.id, "dynamics") && (
                                  <div className="mt-2 ml-5 space-y-1 text-[12px]">
                                    <div className="flex justify-between">
                                      <span className="text-hh-muted">Rapport:</span>
                                      <span className="text-hh-text font-medium">
                                        {message.debugInfo.customerDynamics.rapport}%
                                        <span className="text-hh-muted ml-1">
                                          ({message.debugInfo.customerDynamics.rapport >= 60 ? "hoog" : message.debugInfo.customerDynamics.rapport >= 40 ? "midden" : "laag"})
                                        </span>
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-hh-muted">Value Tension:</span>
                                      <span className="text-hh-text font-medium">
                                        {message.debugInfo.customerDynamics.valueTension}%
                                        <span className="text-hh-muted ml-1">
                                          ({message.debugInfo.customerDynamics.valueTension >= 60 ? "hoog" : message.debugInfo.customerDynamics.valueTension >= 40 ? "midden" : "laag"})
                                        </span>
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-hh-muted">Commit Readiness:</span>
                                      <span className="text-hh-text font-medium">
                                        {message.debugInfo.customerDynamics.commitReadiness}%
                                        <span className="text-hh-muted ml-1">
                                          ({message.debugInfo.customerDynamics.commitReadiness >= 60 ? "hoog" : message.debugInfo.customerDynamics.commitReadiness >= 40 ? "midden" : "laag"})
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* For AI/Customer messages */}
                          {message.sender === "ai" && (
                            <div className="space-y-4">
                              {/* Klant Signaal */}
                              <div>
                                <p className="text-[11px] text-hh-muted mb-1.5">Klant Signaal:</p>
                                <Badge className={`text-[11px] ${
                                  message.debugInfo.klantSignaal === "positief" 
                                    ? "bg-green-100 text-green-700 border-green-300"
                                    : message.debugInfo.klantSignaal === "negatief"
                                    ? "bg-red-100 text-red-700 border-red-300"
                                    : "bg-gray-100 text-gray-700 border-gray-300"
                                }`}>
                                  {message.debugInfo.klantSignaal || "neutraal"}
                                </Badge>
                              </div>

                              {/* Verwachte techniek (for AI messages) */}
                              {message.debugInfo.expectedTechnique && (
                                <div>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 pb-3 border-b border-purple-200">
                                      <p className="text-[12px] text-hh-muted mb-1">Verwachte techniek:</p>
                                      <p className="text-hh-text font-medium text-[13px]">
                                        {message.debugInfo.expectedTechnique}
                                      </p>
                                    </div>
                                    {/* Validation buttons ✓/✗ for AI messages too */}
                                    {!showFeedbackInput[message.id] && (
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className={`h-7 w-7 transition-all ${
                                            techniqueValidation[message.id] === true
                                              ? "bg-green-500 text-white hover:bg-green-600"
                                              : "hover:bg-green-100 hover:text-green-700 border border-green-300"
                                          }`}
                                          onClick={() => {
                                            setTechniqueValidation((prev) => ({ ...prev, [message.id]: true }));
                                            setShowFeedbackInput((prev) => ({ ...prev, [message.id]: false }));
                                          }}
                                        >
                                          <Check className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className={`h-7 w-7 transition-all ${
                                            techniqueValidation[message.id] === false
                                              ? "bg-red-500 text-white hover:bg-red-600"
                                              : "hover:bg-red-100 hover:text-red-700 border border-red-300"
                                          }`}
                                          onClick={() => {
                                            setTechniqueValidation((prev) => ({ ...prev, [message.id]: false }));
                                            setShowFeedbackInput((prev) => ({ ...prev, [message.id]: true }));
                                          }}
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                  {showFeedbackInput[message.id] && (
                                    <div className="space-y-2 mt-3">
                                      <Input
                                        placeholder="Waarom is de verwachte techniek incorrect?"
                                        value={feedbackText[message.id] || ""}
                                        onChange={(e) =>
                                          setFeedbackText((prev) => ({ ...prev, [message.id]: e.target.value }))
                                        }
                                        className="text-[13px] border-hh-border"
                                      />
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1 text-hh-muted hover:text-hh-text"
                                          onClick={() => {
                                            setShowFeedbackInput((prev) => ({ ...prev, [message.id]: false }));
                                            setTechniqueValidation((prev) => ({ ...prev, [message.id]: null }));
                                            setFeedbackText((prev) => ({ ...prev, [message.id]: "" }));
                                          }}
                                        >
                                          Annuleer
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                                          onClick={() => {
                                            console.log("Feedback submitted:", feedbackText[message.id]);
                                            setShowFeedbackInput((prev) => ({ ...prev, [message.id]: false }));
                                          }}
                                          disabled={!feedbackText[message.id]?.trim()}
                                        >
                                          Verzend
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Gedetecteerde techniek (for AI messages) */}
                              {message.debugInfo.expectedTechnique && (
                                <div className="pb-3 border-b border-purple-200">
                                  <p className="text-[12px] text-hh-muted mb-1">Gedetecteerde techniek:</p>
                                  <p className="text-hh-text font-medium text-[13px]">
                                    {message.debugInfo.expectedTechnique}
                                    <span className="ml-2 text-green-600 font-semibold">
                                      (+10)
                                    </span>
                                  </p>
                                </div>
                              )}

                              {/* Collapsible sections for AI */}
                              {/* Persona */}
                              <div>
                                <button
                                  onClick={() => toggleDebugSection(message.id, "persona")}
                                  className="flex items-center gap-2 text-[12px] font-semibold text-hh-text hover:text-hh-primary w-full"
                                >
                                  {isDebugSectionExpanded(message.id, "persona") ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                  Persona
                                </button>
                                {isDebugSectionExpanded(message.id, "persona") && (
                                  <div className="mt-2 ml-5 space-y-1 text-[12px]">
                                    <div className="flex justify-between">
                                      <span className="text-hh-muted">Gedragsstijl:</span>
                                      <p className="text-hh-text font-medium">{message.debugInfo.persona.gedragsstijl}</p>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-hh-muted">Koopklok:</span>
                                      <p className="text-hh-text font-medium">{message.debugInfo.persona.koopklok}</p>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-hh-muted">Moeilijkheid:</span>
                                      <p className="text-hh-text font-medium">{message.debugInfo.persona.moeilijkheid}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Context */}
                              <div>
                                <button
                                  onClick={() => toggleDebugSection(message.id, "context")}
                                  className="flex items-center gap-2 text-[12px] font-semibold text-hh-text hover:text-hh-primary w-full"
                                >
                                  {isDebugSectionExpanded(message.id, "context") ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                  Context
                                </button>
                                {isDebugSectionExpanded(message.id, "context") && message.debugInfo.context && (
                                  <div className="mt-2 ml-5 text-[12px]">
                                    <div className="flex justify-between">
                                      <span className="text-hh-muted">Fase:</span>
                                      <p className="text-hh-text font-medium">{message.debugInfo.context.fase}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Customer Dynamics */}
                              <div>
                                <button
                                  onClick={() => toggleDebugSection(message.id, "dynamics")}
                                  className="flex items-center gap-2 text-[12px] font-semibold text-hh-text hover:text-hh-primary w-full"
                                >
                                  {isDebugSectionExpanded(message.id, "dynamics") ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                  Customer Dynamics
                                </button>
                                {isDebugSectionExpanded(message.id, "dynamics") && (
                                  <div className="mt-2 ml-5 space-y-1 text-[12px]">
                                    <div className="flex justify-between">
                                      <span className="text-hh-muted">Rapport:</span>
                                      <span className="text-hh-text font-medium">
                                        {message.debugInfo.customerDynamics.rapport}%
                                        <span className="text-hh-muted ml-1">
                                          ({message.debugInfo.customerDynamics.rapport >= 60 ? "hoog" : message.debugInfo.customerDynamics.rapport >= 40 ? "midden" : "laag"})
                                        </span>
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-hh-muted">Value Tension:</span>
                                      <span className="text-hh-text font-medium">
                                        {message.debugInfo.customerDynamics.valueTension}%
                                        <span className="text-hh-muted ml-1">
                                          ({message.debugInfo.customerDynamics.valueTension >= 60 ? "hoog" : message.debugInfo.customerDynamics.valueTension >= 40 ? "midden" : "laag"})
                                        </span>
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-hh-muted">Commit Readiness:</span>
                                      <span className="text-hh-text font-medium">
                                        {message.debugInfo.customerDynamics.commitReadiness}%
                                        <span className="text-hh-muted ml-1">
                                          ({message.debugInfo.customerDynamics.commitReadiness >= 60 ? "hoog" : message.debugInfo.customerDynamics.commitReadiness >= 40 ? "midden" : "laag"})
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* AI Beslissingen */}
                              <div className="pt-4 border-t border-purple-200/50">
                                <h4 className="text-[11px] font-semibold text-hh-text mb-3">AI Beslissingen</h4>
                                <div className="space-y-2 text-[12px]">
                                  <div className="flex justify-between">
                                    <span className="text-hh-muted">EPIC Fase:</span>
                                    <p className="text-hh-text font-medium">{message.debugInfo.aiDecision.epicFase}</p>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-hh-muted">Evaluatie:</span>
                                    <Badge variant="outline" className={`text-[10px] ${
                                      message.debugInfo.aiDecision.evaluatie === "positief" || message.debugInfo.aiDecision.evaluatie === "perfect"
                                        ? "bg-green-100 text-green-700 border-green-300"
                                        : message.debugInfo.aiDecision.evaluatie === "gemist"
                                        ? "bg-red-100 text-red-700 border-red-300"
                                        : "bg-gray-100 text-gray-700 border-gray-300"
                                    }`}>
                                      {message.debugInfo.aiDecision.evaluatie}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-hh-border">
            {/* Expert Mode: Technique Selector ABOVE input - CUSTOM STYLED */}
            {difficultyLevel === "expert" && (
              <div className="mb-3">
                <label className="text-[12px] font-medium text-hh-text mb-2 block">
                  Selecteer techniek die je gaat toepassen:
                </label>
                <div className="relative">
                  <select
                    value={selectedTechnique}
                    onChange={(e) => setSelectedTechnique(e.target.value)}
                    className="w-full px-4 py-3 text-[13px] border-2 border-purple-200 rounded-lg bg-white text-hh-text focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer hover:border-purple-300 transition-colors font-medium shadow-sm"
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
                  <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-[11px] text-purple-700 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" />
                      Je gaat techniek {selectedTechnique} toepassen
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Beginner/Gemiddeld: Reminder to select from sidebar */}
            {difficultyLevel !== "expert" && !selectedTechnique && (
              <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-[12px] text-amber-700 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Selecteer eerst een techniek uit de sidebar door op het{" "}
                  <MessageSquare className="w-3.5 h-3.5 inline" /> icoon te klikken
                </p>
              </div>
            )}

            {/* Selected technique indicator for non-expert modes */}
            {difficultyLevel !== "expert" && selectedTechnique && (
              <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-[12px] text-purple-700 flex items-center justify-between">
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
                className="gap-2 bg-purple-600 hover:bg-purple-700"
                disabled={!selectedTechnique || !inputText.trim()}
              >
                <Send className="w-4 h-4" />
                Verzend
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stop Roleplay Confirmation Dialog */}
      <StopRoleplayDialog
        open={stopRoleplayDialogOpen}
        onOpenChange={setStopRoleplayDialogOpen}
        onConfirm={confirmStopRoleplay}
      />

      {/* Technique Details Dialog */}
      <TechniqueDetailsDialog
        open={techniqueDetailsPanelOpen}
        onOpenChange={setTechniqueDetailsPanelOpen}
        technique={selectedTechniqueDetails}
        isEditable={true}
        onSave={(updatedTechnique) => {
          console.log("Technique updated:", updatedTechnique);
          // TODO: Save to backend
        }}
      />
    </AdminLayout>
  );
}
