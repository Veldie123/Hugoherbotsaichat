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
  ChevronDown,
  Lightbulb,
  MessageSquare,
  Phone,
  Video,
  Mic,
  MicOff,
  Volume2,
  X,
  Clock,
  Sparkles,
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

type ChatMode = "chat" | "audio" | "video";

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
  const [selectedTechniqueName, setSelectedTechniqueName] = useState<string>("");
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
  const [chatMode, setChatMode] = useState<ChatMode>("chat");
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedTechnique) {
      timerRef.current = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedTechnique]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const startTechniqueChat = (techniqueNumber: string, techniqueName: string) => {
    setSelectedTechnique(techniqueNumber);
    setSelectedTechniqueName(techniqueName);
    setSessionTimer(0);
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      sender: "ai",
      text: `Hey! Klaar om ${techniqueName} te oefenen? Ik speel de klant, jij bent de verkoper. Start maar!`,
      timestamp: new Date(),
    };
    setMessages([aiMessage]);
  };

  const getFaseBadgeColor = (fase: number) => {
    const colors: Record<number, string> = {
      0: "bg-slate-100 text-slate-600 border-slate-200",
      1: "bg-emerald-100 text-emerald-700 border-emerald-200",
      2: "bg-blue-100 text-blue-700 border-blue-200",
      3: "bg-amber-100 text-amber-700 border-amber-200",
      4: "bg-purple-100 text-purple-700 border-purple-200",
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
    setSelectedTechniqueName("");
    setSessionTimer(0);
    setChatMode("chat");
  };

  const handleDictation = () => {
    setIsRecording(!isRecording);
  };

  const getModeIcon = () => {
    switch (chatMode) {
      case "audio": return <Mic className="w-3.5 h-3.5" />;
      case "video": return <Video className="w-3.5 h-3.5" />;
      default: return <MessageSquare className="w-3.5 h-3.5" />;
    }
  };

  const getModeLabel = () => {
    switch (chatMode) {
      case "audio": return "Audio";
      case "video": return "Video";
      default: return "Chat";
    }
  };

  const renderChatInterface = () => (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Lightbulb className="w-12 h-12 text-hh-muted mx-auto mb-4" />
              <p className="text-hh-muted text-[14px]">
                Selecteer een techniek om te beginnen
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "hugo" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              message.sender === "hugo"
                ? "bg-hh-ink text-white rounded-br-md"
                : "bg-hh-ui-100 text-hh-text rounded-bl-md"
            }`}>
              <p className="text-[14px] leading-[20px]">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-hh-border bg-white">
        <div className="flex gap-2 items-end">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && selectedTechnique && handleSendMessage()}
            placeholder={selectedTechnique ? "Type je antwoord..." : "Selecteer eerst een techniek..."}
            className="flex-1"
            disabled={!selectedTechnique}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleDictation}
            disabled={!selectedTechnique}
            className={`flex-shrink-0 ${isRecording ? "bg-red-50 border-red-300 text-red-600" : ""}`}
          >
            <Mic className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!selectedTechnique || !inputText.trim()}
            className="bg-hh-ink hover:bg-hh-ink/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderAudioInterface = () => (
    <div className="h-full relative bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900">
      <div className="absolute top-12 left-0 right-0 text-center">
        <div className="mb-8">
          <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-4 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-hh-primary flex items-center justify-center">
              <span className="text-white text-[40px] leading-[48px] font-semibold">HH</span>
            </div>
          </div>
          <h3 className="text-white text-[24px] leading-[32px] font-semibold mb-2">Hugo Herbots</h3>
          <p className="text-white/70 text-[16px] leading-[24px]">{formatTime(sessionTimer)}</p>
        </div>
        
        <div className="flex items-center justify-center gap-1 h-16 px-8 mt-12">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-full bg-white/60 transition-all animate-pulse"
              style={{
                height: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-12 left-0 right-0">
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`w-16 h-16 rounded-full backdrop-blur-sm transition-colors flex items-center justify-center mb-2 ${
                isMuted ? "bg-white/40" : "bg-white/20 hover:bg-white/30"
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
            </button>
            <span className="text-white/80 text-[12px]">{isMuted ? "Unmute" : "Mute"}</span>
          </div>
          
          <div className="text-center">
            <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center mb-2">
              <Volume2 className="w-6 h-6 text-white" />
            </button>
            <span className="text-white/80 text-[12px]">Speaker</span>
          </div>
          
          <div className="text-center">
            <button 
              onClick={handleStopRoleplay}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center mb-2 shadow-xl"
            >
              <Phone className="w-6 h-6 text-white rotate-[135deg]" />
            </button>
            <span className="text-white/80 text-[12px]">End</span>
          </div>
        </div>

        {messages.length > 0 && (
          <div className="px-8">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <p className="text-white/90 text-[13px] leading-[18px] text-center">
                <strong>Hugo: </strong>{messages[messages.length - 1]?.text}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderVideoInterface = () => (
    <div className="h-full relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0">
        <div className="size-full bg-gradient-to-br from-hh-primary/20 to-slate-900 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-hh-primary flex items-center justify-center">
            <span className="text-white text-[64px] leading-[72px] font-semibold">HH</span>
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent">
        <h3 className="text-white text-[20px] leading-[28px] font-semibold mb-1">Hugo Herbots</h3>
        <p className="text-white/70 text-[14px] leading-[20px]">{formatTime(sessionTimer)}</p>
      </div>

      <div className="absolute top-6 right-6 w-32 h-40 rounded-2xl bg-slate-700 border-2 border-white/20 overflow-hidden shadow-2xl">
        <div className="size-full flex items-center justify-center bg-slate-800">
          <div className="w-16 h-16 rounded-full bg-hh-ui-100 flex items-center justify-center">
            <span className="text-hh-text text-[14px] leading-[20px] font-medium">JIJ</span>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="absolute top-1/3 left-6 right-6">
          <div className="p-4 rounded-xl bg-black/80 backdrop-blur-md border border-white/10">
            <div className="flex gap-2">
              <Sparkles className="w-4 h-4 text-hh-primary flex-shrink-0 mt-0.5" />
              <p className="text-[12px] leading-[17px] text-white">
                <strong>Tip:</strong> Focus op {selectedTechniqueName || "de techniek"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>
          
          <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center">
            <Video className="w-6 h-6 text-white" />
          </button>
          
          <button 
            onClick={handleStopRoleplay}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center shadow-xl"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-8 mt-4 text-white/80 text-[12px]">
          <span>{isMuted ? "Unmute" : "Mute"}</span>
          <span>Flip</span>
          <span>End</span>
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (chatMode) {
      case "audio": return renderAudioInterface();
      case "video": return renderVideoInterface();
      default: return renderChatInterface();
    }
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
              selectedTechnique={selectedTechniqueName}
              setSelectedTechnique={setSelectedTechniqueName}
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

        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-hh-border bg-white">
            <div className="flex items-center gap-3">
              {selectedTechnique && (
                <Badge variant="outline" className="rounded-full bg-hh-ink/10 text-hh-ink border-hh-ink/20 font-mono text-[11px]">
                  {selectedTechnique}
                </Badge>
              )}
              <h2 className="text-[18px] leading-[26px] text-hh-text font-semibold">
                {selectedTechniqueName || "Hugo AI Coach"}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Session timer when technique selected */}
              {selectedTechnique && (
                <div className="flex items-center gap-1.5 text-[13px] text-hh-muted mr-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(sessionTimer)}</span>
                </div>
              )}
              
              {/* Niveau selector - always visible when no technique selected */}
              {!selectedTechnique && (
                <div className="flex items-center gap-2 mr-3">
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
              )}
              
              {/* Mode toggle - ALWAYS visible */}
              <div className="flex items-center border border-hh-border rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatMode("chat")}
                  className={`h-8 px-3 rounded-none border-r border-hh-border ${chatMode === "chat" ? "bg-hh-ink text-white hover:bg-hh-ink/90" : "hover:bg-hh-ui-100"}`}
                  title="Chat mode"
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  <span className="text-[11px]">Chat</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatMode("audio")}
                  className={`h-8 px-3 rounded-none border-r border-hh-border ${chatMode === "audio" ? "bg-hh-ink text-white hover:bg-hh-ink/90" : "hover:bg-hh-ui-100"}`}
                  title="Audio call"
                >
                  <Phone className="w-4 h-4 mr-1.5" />
                  <span className="text-[11px]">Bellen</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatMode("video")}
                  className={`h-8 px-3 rounded-none ${chatMode === "video" ? "bg-hh-ink text-white hover:bg-hh-ink/90" : "hover:bg-hh-ui-100"}`}
                  title="Video call"
                >
                  <Video className="w-4 h-4 mr-1.5" />
                  <span className="text-[11px]">Video</span>
                </Button>
              </div>
              
              {/* Stop button when technique active */}
              {selectedTechnique && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStopRoleplay}
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 ml-1"
                  title="Stop rollenspel"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {renderMainContent()}
          </div>

          {difficultyLevel === "expert" && !selectedTechnique && (
            <div className="p-4 border-t border-hh-border">
              <label className="text-[12px] font-medium text-hh-text mb-2 block">
                Selecteer techniek die je gaat toepassen:
              </label>
              <div className="relative">
                <select
                  value={selectedTechnique}
                  onChange={(e) => {
                    const technique = Object.values(technieken_index.technieken).find(
                      (t: any) => t.nummer === e.target.value
                    ) as any;
                    if (technique) {
                      startTechniqueChat(technique.nummer, technique.naam);
                    }
                  }}
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
            </div>
          )}
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
