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
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-hh-ink/5 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-hh-ink" />
              </div>
              <h3 className="text-[18px] font-semibold text-hh-text mb-2">
                Welkom bij Hugo AI Coach
              </h3>
              <p className="text-hh-muted text-[14px] mb-6">
                Selecteer een techniek in de sidebar om te beginnen met oefenen
              </p>
              
              {/* Niveau selector */}
              <div className="inline-flex flex-col items-center gap-2">
                <span className="text-[12px] text-hh-muted">Kies je niveau:</span>
                <div className="flex gap-1 bg-hh-ui-50 rounded-lg p-1">
                  {(["beginner", "gemiddeld", "expert"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficultyLevel(level)}
                      className={`px-4 py-2 rounded-md text-[13px] font-medium transition-all ${
                        difficultyLevel === level 
                          ? "bg-white shadow-sm text-hh-ink" 
                          : "text-hh-muted hover:text-hh-text"
                      }`}
                    >
                      {level === "beginner" ? "Beginner" : level === "gemiddeld" ? "Gemiddeld" : "Expert"}
                    </button>
                  ))}
                </div>
                {difficultyLevel === "expert" && (
                  <p className="text-[11px] text-hh-muted mt-1">
                    Expert modus: geen sidebar hulp
                  </p>
                )}
              </div>
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
    <div className="h-full w-full flex flex-col" style={{ background: 'linear-gradient(180deg, #059669 0%, #0d9488 50%, #0f766e 100%)' }}>
      {/* Top section - caller info with large avatar */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Large HH avatar */}
        <div className="relative mb-6">
          <div 
            className="rounded-full flex items-center justify-center"
            style={{ width: '180px', height: '180px', backgroundColor: 'rgba(255,255,255,0.25)' }}
          >
            <span className="text-white font-bold" style={{ fontSize: '64px' }}>HH</span>
          </div>
        </div>
        
        <h3 className="text-white text-[26px] font-bold mb-1">Hugo AI Coach</h3>
        <p className="text-[16px] mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>Bellen...</p>
        <p className="text-[22px] font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{formatTime(sessionTimer)}</p>
        
        {/* Waveform visualization */}
        <div className="flex items-end justify-center gap-1.5 h-16 mt-8">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: '6px',
                backgroundColor: 'rgba(255,255,255,0.7)',
                height: `${Math.random() * 40 + 15}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom controls - circular buttons with labels below */}
      <div className="pb-8 pt-4">
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="flex items-center justify-center transition-colors"
              style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%',
                backgroundColor: isMuted ? 'white' : 'rgba(255,255,255,0.2)' 
              }}
            >
              {isMuted ? <MicOff className="w-5 h-5 text-teal-700" /> : <Mic className="w-5 h-5 text-white" />}
            </button>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{isMuted ? "Unmute" : "Mute"}</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={handleStopRoleplay}
              className="flex items-center justify-center shadow-xl"
              style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%',
                backgroundColor: '#ef4444' 
              }}
            >
              <Phone className="w-6 h-6 text-white" style={{ transform: 'rotate(135deg)' }} />
            </button>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>Ophangen</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <button 
              className="flex items-center justify-center"
              style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)' 
              }}
            >
              <Volume2 className="w-5 h-5 text-white" />
            </button>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>Speaker</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVideoInterface = () => (
    <div className="h-full w-full relative" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)' }}>
      {/* Main video area with large HH avatar */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="rounded-full flex items-center justify-center"
          style={{ width: '220px', height: '220px', backgroundColor: '#6B7A92' }}
        >
          <span className="text-white font-bold" style={{ fontSize: '80px' }}>HH</span>
        </div>
      </div>

      {/* Top overlay with name */}
      <div className="absolute top-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
        <h3 className="text-white text-[18px] font-semibold">Hugo Herbots</h3>
        <p className="text-white/70 text-[14px]">{formatTime(sessionTimer)}</p>
      </div>

      {/* PiP preview - user camera */}
      <div className="absolute top-4 right-4 w-28 h-36 rounded-xl overflow-hidden border-2 border-white/30 shadow-xl" style={{ backgroundColor: '#475569' }}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e2e8f0' }}>
            <span className="text-slate-700 text-[12px] font-medium">JIJ</span>
          </div>
        </div>
      </div>

      {/* Bottom controls - circular buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="flex items-center justify-center transition-colors"
              style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%',
                backgroundColor: isMuted ? 'white' : 'rgba(255,255,255,0.2)' 
              }}
            >
              {isMuted ? <MicOff className="w-5 h-5 text-slate-800" /> : <Mic className="w-5 h-5 text-white" />}
            </button>
            <span className="text-white/70 text-[11px]">{isMuted ? "Unmute" : "Mute"}</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <button 
              className="flex items-center justify-center"
              style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)' 
              }}
            >
              <Video className="w-5 h-5 text-white" />
            </button>
            <span className="text-white/70 text-[11px]">Camera</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={handleStopRoleplay}
              className="flex items-center justify-center shadow-xl"
              style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%',
                backgroundColor: '#ef4444' 
              }}
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <span className="text-white/70 text-[11px]">Ophangen</span>
          </div>
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
          {/* Clean header - title left, mode toggle right */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-hh-border bg-white">
            {/* Left: Title + Timer */}
            <div className="flex items-center gap-4">
              <h2 className="text-[20px] leading-[28px] text-hh-text font-semibold">
                Hugo AI Coach
              </h2>
              {selectedTechnique && (
                <>
                  <div className="h-5 w-px bg-hh-border" />
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full bg-hh-ink/10 text-hh-ink border-hh-ink/20 font-mono text-[12px] px-2.5 py-0.5">
                      {selectedTechnique}
                    </Badge>
                    <span className="text-[14px] text-hh-text">{selectedTechniqueName}</span>
                  </div>
                  <div className="h-5 w-px bg-hh-border" />
                  <div className="flex items-center gap-1.5 text-[14px] text-hh-muted">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono">{formatTime(sessionTimer)}</span>
                  </div>
                </>
              )}
            </div>
            
            {/* Right: Mode toggle + Stop */}
            <div className="flex items-center gap-3">
              {/* Mode toggle - compact icon buttons */}
              <div className="flex items-center bg-hh-ui-50 rounded-lg p-1">
                <button
                  onClick={() => setChatMode("chat")}
                  className={`p-2 rounded-md transition-all ${chatMode === "chat" ? "bg-white shadow-sm text-hh-ink" : "text-hh-muted hover:text-hh-text"}`}
                  title="Chat"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChatMode("audio")}
                  className={`p-2 rounded-md transition-all ${chatMode === "audio" ? "bg-white shadow-sm text-hh-ink" : "text-hh-muted hover:text-hh-text"}`}
                  title="Bellen"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChatMode("video")}
                  className={`p-2 rounded-md transition-all ${chatMode === "video" ? "bg-white shadow-sm text-hh-ink" : "text-hh-muted hover:text-hh-text"}`}
                  title="Video"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
              
              {/* Stop button when technique active */}
              {selectedTechnique && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStopRoleplay}
                  className="h-8 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
                  title="Stop rollenspel"
                >
                  <X className="w-4 h-4" />
                  <span className="text-[12px]">Stop</span>
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
