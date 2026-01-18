import { useState, useRef, useEffect, useCallback } from "react";
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
  Loader2,
  MessageCircle,
  Award,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import technieken_index from "../../data/technieken_index";
import { KLANT_HOUDINGEN } from "../../data/klant_houdingen";
import { EPICSidebar } from "./AdminChatExpertModeSidebar";
import { hugoApi } from "../../services/hugoApi";
import { difficultyLevels } from "../../utils/displayMappings";
import StreamingAvatar, { AvatarQuality, StreamingEvents, TaskType } from "@heygen/streaming-avatar";
import { useConversation } from "@elevenlabs/react";

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
  const [difficultyLevel, setDifficultyLevel] = useState<string>("onbewuste_onkunde");
  const [stopRoleplayDialogOpen, setStopRoleplayDialogOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("chat");
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [useStreaming, setUseStreaming] = useState(true);
  const streamingTextRef = useRef("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // HeyGen Streaming Avatar state
  const [heygenToken, setHeygenToken] = useState<string | null>(null);
  const [avatarSession, setAvatarSession] = useState<StreamingAvatar | null>(null);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ElevenLabs Conversational AI state
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState<string | null>(null);
  const [isAudioConnecting, setIsAudioConnecting] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  // ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log("[ElevenLabs] Connected");
      setIsAudioConnecting(false);
    },
    onDisconnect: () => {
      console.log("[ElevenLabs] Disconnected");
    },
    onMessage: (data) => {
      console.log("[ElevenLabs] Message:", data);
    },
    onError: (error) => {
      console.error("[ElevenLabs] Error:", error);
      setAudioError(String(error));
      setIsAudioConnecting(false);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

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

  // Initialize HeyGen avatar session
  const initHeygenAvatar = useCallback(async () => {
    if (avatarSession) return;
    
    setIsAvatarLoading(true);
    setAvatarError(null);
    
    try {
      // Fetch token from backend
      const tokenResponse = await fetch("/api/heygen/token", { method: "POST" });
      if (!tokenResponse.ok) {
        throw new Error("Kon HeyGen token niet ophalen");
      }
      const { token } = await tokenResponse.json();
      setHeygenToken(token);
      
      // Create avatar instance
      const avatar = new StreamingAvatar({ token });
      
      // Setup event listeners
      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        setIsAvatarSpeaking(true);
      });
      
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        setIsAvatarSpeaking(false);
      });
      
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("[HeyGen] Stream disconnected");
        setAvatarSession(null);
      });
      
      avatar.on(StreamingEvents.STREAM_READY, (event: any) => {
        console.log("[HeyGen] Stream ready");
        if (videoRef.current && event.detail?.stream) {
          videoRef.current.srcObject = event.detail.stream;
        }
      });
      
      // Start avatar session with a public avatar
      await avatar.createStartAvatar({
        quality: AvatarQuality.Medium,
        avatarName: "monica_public_3", // Public HeyGen avatar
      });
      
      setAvatarSession(avatar);
      console.log("[HeyGen] Avatar session started");
    } catch (error: any) {
      console.error("[HeyGen] Error:", error);
      setAvatarError(error.message || "Kon video avatar niet starten");
    } finally {
      setIsAvatarLoading(false);
    }
  }, [avatarSession]);
  
  // Stop HeyGen avatar session
  const stopHeygenAvatar = useCallback(async () => {
    if (avatarSession) {
      try {
        await avatarSession.stopAvatar();
      } catch (error) {
        console.error("[HeyGen] Stop error:", error);
      }
      setAvatarSession(null);
    }
  }, [avatarSession]);
  
  // Make avatar speak
  const avatarSpeak = useCallback(async (text: string) => {
    if (!avatarSession) return;
    
    try {
      await avatarSession.speak({
        text,
        taskType: TaskType.REPEAT,
      });
    } catch (error) {
      console.error("[HeyGen] Speak error:", error);
    }
  }, [avatarSession]);

  // Initialize ElevenLabs audio session
  const initElevenLabsAudio = useCallback(async () => {
    if (conversation.status === "connected") return;
    
    setIsAudioConnecting(true);
    setAudioError(null);
    
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // For ElevenLabs Conversational AI, we need an agent ID
      // For now, we'll show a message that the feature requires setup
      setAudioError("ElevenLabs Agent ID niet geconfigureerd. Configureer een agent in de ElevenLabs dashboard.");
      setIsAudioConnecting(false);
      
    } catch (error: any) {
      console.error("[ElevenLabs] Error:", error);
      setAudioError(error.message || "Kon audio niet starten. Controleer microfoontoegang.");
      setIsAudioConnecting(false);
    }
  }, [conversation.status]);
  
  // Stop ElevenLabs audio session
  const stopElevenLabsAudio = useCallback(() => {
    if (conversation.status === "connected") {
      conversation.endSession();
    }
  }, [conversation]);

  // Handle chat mode change
  useEffect(() => {
    if (chatMode === "video" && !avatarSession && !isAvatarLoading) {
      initHeygenAvatar();
    } else if (chatMode === "audio" && conversation.status === "disconnected" && !isAudioConnecting) {
      initElevenLabsAudio();
    }
  }, [chatMode, avatarSession, isAvatarLoading, conversation.status, isAudioConnecting, initHeygenAvatar, initElevenLabsAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHeygenAvatar();
      stopElevenLabsAudio();
    };
  }, [stopHeygenAvatar, stopElevenLabsAudio]);

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

  const startTechniqueChat = async (techniqueNumber: string, techniqueName: string) => {
    setSelectedTechnique(techniqueNumber);
    setSelectedTechniqueName(techniqueName);
    setSessionTimer(0);
    setIsLoading(true);
    
    try {
      const session = await hugoApi.startSession({
        techniqueId: techniqueNumber,
        mode: "COACH_CHAT",
        isExpert: difficultyLevel === "onbewuste_kunde",
        modality: chatMode,
      });
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: "ai",
        text: session.initialMessage,
        timestamp: new Date(),
      };
      setMessages([aiMessage]);
    } catch (error) {
      console.error("Failed to start session:", error);
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        sender: "ai",
        text: `Hey! Klaar om ${techniqueName} te oefenen? Ik speel de klant, jij bent de verkoper. Start maar!`,
        timestamp: new Date(),
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
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

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "hugo",
      text: inputText,
      timestamp: new Date(),
    };

    const messageText = inputText;
    setMessages(prev => [...prev, userMessage]);
    setInputText("");

    if (useStreaming) {
      setIsStreaming(true);
      setStreamingText("");
      streamingTextRef.current = "";
      
      try {
        await hugoApi.sendMessageStream(
          messageText,
          difficultyLevel === "onbewuste_kunde",
          (token) => {
            streamingTextRef.current += token;
            setStreamingText(streamingTextRef.current);
          },
          () => {
            const finalText = streamingTextRef.current;
            setIsStreaming(false);
            if (finalText) {
              setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: "ai",
                text: finalText,
                timestamp: new Date(),
              }]);
            }
            setStreamingText("");
            streamingTextRef.current = "";
          }
        );
      } catch (error) {
        console.error("Streaming failed, falling back:", error);
        setIsStreaming(false);
        setStreamingText("");
        setIsLoading(true);
        try {
          const response = await hugoApi.sendMessage(messageText, difficultyLevel === "onbewuste_kunde");
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: response.response,
            timestamp: new Date(),
          }]);
        } catch (fallbackError) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: "Sorry, er ging iets mis. Probeer het opnieuw.",
            timestamp: new Date(),
          }]);
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      setIsLoading(true);
      try {
        const response = await hugoApi.sendMessage(messageText, difficultyLevel === "onbewuste_kunde");
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: response.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error("Failed to send message:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Sorry, er ging iets mis. Probeer het opnieuw.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRequestFeedback = async () => {
    if (isLoading || isStreaming) return;
    setIsLoading(true);
    
    try {
      const result = await hugoApi.requestFeedback();
      const feedbackMessage: Message = {
        id: Date.now().toString(),
        sender: "ai",
        text: result.feedback,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, feedbackMessage]);
    } catch (error) {
      console.error("Failed to get feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (isLoading || isStreaming) return;
    setIsLoading(true);
    
    try {
      const evaluation = await hugoApi.evaluate();
      const evalText = `**Evaluatie - Score: ${evaluation.overallScore}/100**

**Scores:**
- Engagement: ${evaluation.scores.engagement}%
- Technisch: ${evaluation.scores.technical}%
- Context: ${evaluation.scores.contextGathering}%

**Aanbeveling:**
${evaluation.recommendation}

**Volgende stappen:**
${evaluation.nextSteps.map(s => `- ${s}`).join('\n')}`;

      const evalMessage: Message = {
        id: Date.now().toString(),
        sender: "ai",
        text: evalText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, evalMessage]);
    } catch (error) {
      console.error("Failed to evaluate:", error);
    } finally {
      setIsLoading(false);
    }
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
    hugoApi.clearSession();
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
              
              {/* Niveau selector moved to header - show hint only */}
              <p className="text-[12px] text-hh-muted">
                Kies je niveau bovenaan en start met oefenen
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
        {isStreaming && streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-2xl bg-hh-ui-100 text-hh-text rounded-bl-md">
              <p className="text-[14px] leading-[20px]">{streamingText}<span className="animate-pulse">▌</span></p>
            </div>
          </div>
        )}
        {isLoading && !isStreaming && (
          <div className="flex justify-start">
            <div className="bg-hh-ui-100 text-hh-text rounded-2xl rounded-bl-md p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-hh-muted" />
              <span className="text-[14px] text-hh-muted">Hugo denkt na...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {selectedTechnique && messages.length > 0 && (
        <div className="px-4 py-2 border-t border-hh-border bg-hh-ui-50 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRequestFeedback}
            disabled={isLoading || isStreaming}
            className="text-[12px] gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Feedback
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEvaluate}
            disabled={isLoading || isStreaming}
            className="text-[12px] gap-1.5"
          >
            <Award className="w-3.5 h-3.5" />
            Evaluatie
          </Button>
        </div>
      )}

      <div className="p-4 border-t border-hh-border bg-white">
        <div className="flex gap-2 items-end">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && selectedTechnique && handleSendMessage()}
            placeholder={selectedTechnique ? "Type je antwoord als verkoper..." : "Selecteer eerst een techniek..."}
            className="flex-1"
            disabled={!selectedTechnique || isStreaming}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleDictation}
            disabled={!selectedTechnique || isStreaming}
            className={`flex-shrink-0 ${isRecording ? "bg-red-50 border-red-300 text-red-600" : ""}`}
          >
            <Mic className="w-4 h-4 text-[#4F7396]" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!selectedTechnique || !inputText.trim() || isLoading || isStreaming}
            className="bg-[#4F7396] hover:bg-[#4F7396]/90 gap-2"
          >
            {isLoading || isStreaming ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
            <span className="text-white">{isLoading || isStreaming ? "Bezig..." : "Verzend"}</span>
          </Button>
        </div>
      </div>
    </div>
  );

  const renderAudioInterface = () => (
    <div className="h-full w-full flex flex-col" style={{ background: 'linear-gradient(180deg, #059669 0%, #0d9488 50%, #0f766e 100%)' }}>
      {/* Error message */}
      {audioError && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-lg flex items-center gap-2 z-10">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-[14px]">{audioError}</span>
          <button onClick={() => setAudioError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Top section - caller info with large avatar */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Large HH avatar */}
        <div className="relative mb-6">
          <div 
            className="rounded-full flex items-center justify-center"
            style={{ width: '180px', height: '180px', backgroundColor: 'rgba(255,255,255,0.25)' }}
          >
            {isAudioConnecting ? (
              <Loader2 className="w-16 h-16 text-white animate-spin" />
            ) : (
              <span className="text-white font-bold" style={{ fontSize: '64px' }}>HH</span>
            )}
          </div>
          {conversation.isSpeaking && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full">
              <span className="text-teal-700 text-[12px] font-medium">Spreekt...</span>
            </div>
          )}
        </div>
        
        <h3 className="text-white text-[26px] font-bold mb-1">Hugo AI Coach</h3>
        <p className="text-[16px] mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
          {isAudioConnecting ? "Verbinden..." : conversation.status === "connected" ? "Verbonden" : "Audio modus"}
        </p>
        <p className="text-[22px] font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{formatTime(sessionTimer)}</p>
        
        {/* Waveform visualization - animate when speaking */}
        <div className="flex items-end justify-center gap-1.5 h-16 mt-8">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-150 ${conversation.isSpeaking ? 'animate-pulse' : ''}`}
              style={{
                width: '6px',
                backgroundColor: 'rgba(255,255,255,0.7)',
                height: conversation.isSpeaking ? `${Math.sin(Date.now() / 200 + i) * 20 + 35}px` : `${15 + (i % 3) * 10}px`,
              }}
            />
          ))}
        </div>
        
        {/* Status message */}
        <p className="text-white/60 text-[14px] mt-4">
          {audioError ? "Configuratie vereist" : "ElevenLabs audio - binnenkort beschikbaar"}
        </p>
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
              onClick={() => {
                stopElevenLabsAudio();
                setChatMode("chat");
              }}
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
      {/* Error message */}
      {avatarError && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-lg flex items-center gap-2 z-20">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-[14px]">{avatarError}</span>
          <button onClick={() => setAvatarError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Main video area - HeyGen avatar stream or fallback */}
      <div className="absolute inset-0 flex items-center justify-center">
        {avatarSession ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="rounded-full flex items-center justify-center"
            style={{ width: '220px', height: '220px', backgroundColor: '#6B7A92' }}
          >
            {isAvatarLoading ? (
              <Loader2 className="w-16 h-16 text-white animate-spin" />
            ) : (
              <span className="text-white font-bold" style={{ fontSize: '80px' }}>HH</span>
            )}
          </div>
        )}
      </div>

      {/* Top overlay with name and status */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
        <div className="flex items-center gap-2">
          <h3 className="text-white text-[18px] font-semibold">Hugo Herbots</h3>
          {isAvatarSpeaking && (
            <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">Spreekt</span>
          )}
        </div>
        <p className="text-white/70 text-[14px]">{formatTime(sessionTimer)}</p>
        {isAvatarLoading && (
          <p className="text-white/60 text-[12px] mt-1">Avatar laden...</p>
        )}
      </div>

      {/* PiP preview - user camera - circular */}
      <div 
        className="absolute top-4 right-4 flex items-center justify-center border-2 border-white/30 shadow-xl z-10"
        style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#475569' }}
      >
        <div 
          className="flex items-center justify-center"
          style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e2e8f0' }}
        >
          <span className="text-slate-700 text-[12px] font-medium">JIJ</span>
        </div>
      </div>

      {/* Bottom controls - circular buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
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
              onClick={() => {
                stopHeygenAvatar();
                setChatMode("chat");
              }}
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
        {difficultyLevel !== "onbewuste_kunde" && (
          <div className="w-1/3 flex-shrink-0 overflow-y-auto h-full">
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

        <div className="w-2/3 flex-1 flex flex-col bg-white overflow-hidden">
          {/* Clean header - title left, niveau + mode toggle right */}
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
                    <Clock className="w-4 h-4 text-[#4F7396]" />
                    <span className="font-mono">{formatTime(sessionTimer)}</span>
                  </div>
                </>
              )}
            </div>
            
            {/* Right: Niveau selector + Mode toggle + Stop */}
            <div className="flex items-center gap-3">
              {/* Niveau selector - always visible */}
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-hh-muted">Niveau:</span>
                <div className="flex gap-0.5 bg-hh-ui-50 rounded-lg p-0.5">
                  {difficultyLevels.map((level) => (
                    <button
                      key={level.key}
                      onClick={() => setDifficultyLevel(level.key)}
                      style={difficultyLevel === level.key ? { backgroundColor: '#4F7396', color: 'white' } : {}}
                      className={`w-7 h-7 rounded-md text-[12px] font-medium transition-all ${
                        difficultyLevel === level.key 
                          ? "shadow-sm" 
                          : "text-hh-text hover:bg-white"
                      }`}
                      title={level.label}
                    >
                      {level.short}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-5 w-px bg-hh-border" />

              {/* Mode toggle - compact icon buttons */}
              <div className="flex items-center bg-hh-ui-50 rounded-lg p-1">
                <button
                  onClick={() => setChatMode("chat")}
                  className={`p-2 rounded-md transition-all ${chatMode === "chat" ? "bg-white shadow-sm text-hh-ink" : "text-hh-muted hover:text-hh-text"}`}
                  title="Chat"
                >
                  <MessageSquare className="w-4 h-4 text-current" />
                </button>
                <button
                  onClick={() => setChatMode("audio")}
                  className={`p-2 rounded-md transition-all ${chatMode === "audio" ? "bg-white shadow-sm text-hh-ink" : "text-hh-muted hover:text-hh-text"}`}
                  title="Bellen"
                >
                  <Phone className="w-4 h-4 text-current" />
                </button>
                <button
                  onClick={() => setChatMode("video")}
                  className={`p-2 rounded-md transition-all ${chatMode === "video" ? "bg-white shadow-sm text-hh-ink" : "text-hh-muted hover:text-hh-text"}`}
                  title="Video"
                >
                  <Video className="w-4 h-4 text-current" />
                </button>
              </div>
              
              {/* Stop button when technique active */}
              {selectedTechnique && (
                <button
                  onClick={handleStopRoleplay}
                  className="h-8 px-3 rounded-md border border-hh-border bg-white hover:bg-hh-ui-50 transition-colors flex items-center gap-1.5"
                  title="Stop rollenspel"
                >
                  <X className="w-3.5 h-3.5 text-hh-muted" />
                  <span className="text-[12px] text-hh-text">Stop</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {renderMainContent()}
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
        isAdmin={false}
      />
    </AppLayout>
  );
}
