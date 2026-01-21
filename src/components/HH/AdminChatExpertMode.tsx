/**
 * AdminChatExpertMode - Expert training interface for Talk to Hugo AI
 * 
 * Features:
 * - AI roleplay with customer simulation
 * - Multi-modal: chat, audio (LiveKit), video (HeyGen)
 * - Debug panel with prompt visibility
 * - Golden Standard save functionality
 */

import { useState, useRef, useEffect, useCallback } from "react";
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
import { Room, RoomEvent, ConnectionState, Track, RemoteTrack, RemoteTrackPublication, RemoteParticipant } from "livekit-client";
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
  Phone,
  Video,
  Mic,
  MicOff,
  Volume2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { getAllTechnieken } from "../../data/technieken-service";
import technieken_index from "../../data/technieken_index";
import { KLANT_HOUDINGEN } from "../../data/klant_houdingen";
import { cn } from "../ui/utils";
import { 
  buyingClockToDisplay, 
  behaviorStyleToDisplay, 
  difficultyToDisplay,
  difficultyLevels,
  translate,
  buildDebugInfoFromResponse 
} from "../../utils/displayMappings";
import { EPICSidebar } from "./AdminChatExpertModeSidebar";
import { hugoApi, type AssistanceConfig } from "../../services/hugoApi";
import { Loader2 } from "lucide-react";
import { LiveAvatarComponent } from "./LiveAvatarComponent";

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
    gathered?: {
      sector?: string | null;
      product?: string | null;
      klantType?: string | null;
      verkoopkanaal?: string | null;
      ervaring?: string | null;
    };
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
  promptsUsed?: {
    systemPrompt?: string;
    userPrompt?: string;
  };
  ragDocuments?: Array<{
    title?: string;
    content?: string;
    score?: number;
  }>;
  
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
  const [selectedTechnique, setSelectedTechnique] = useState<string>(""); // Display name
  const [selectedTechniqueNumber, setSelectedTechniqueNumber] = useState<string>(""); // Actual technique ID
  const [hasActiveSession, setHasActiveSession] = useState(false); // Track if session is active
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
  const [difficultyLevel, setDifficultyLevel] = useState<string>("onbewuste_onkunde"); // Competentie niveau (4 levels)
  const [assistanceConfig, setAssistanceConfig] = useState<AssistanceConfig>({
    showHouding: true,
    showExpectedTechnique: true,
    showStepIndicators: true,
    showTipButton: true,
    showExamples: true,
    blindPlay: false,
  });
  const [levelTransitionMessage, setLevelTransitionMessage] = useState<string | null>(null);
  const [stopRoleplayDialogOpen, setStopRoleplayDialogOpen] = useState(false); // NEW: Stop roleplay confirmation dialog
  const [chatMode, setChatMode] = useState<"chat" | "audio" | "video">("chat"); // Multi-modal chat mode
  const [isMuted, setIsMuted] = useState(false); // Audio/video mute state
  const [sessionTimer, setSessionTimer] = useState(0); // Session timer
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls
  
  // LiveKit Audio State
  const [liveKitRoom, setLiveKitRoom] = useState<Room | null>(null);
  const [audioConnectionState, setAudioConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [isAudioConnecting, setIsAudioConnecting] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load user's current competence level on mount (auto-adaptive system)
  useEffect(() => {
    const loadUserLevel = async () => {
      try {
        const levelData = await hugoApi.getUserLevel();
        setDifficultyLevel(levelData.levelName);
        setAssistanceConfig(levelData.assistance);
        console.log("[Performance] Loaded user level:", levelData.level, levelData.levelName);
      } catch (error) {
        console.error("[Performance] Failed to load user level:", error);
        // Keep defaults on error
      }
    };
    loadUserLevel();
  }, []);

  // Session timer effect
  useEffect(() => {
    if (hasActiveSession) {
      timerRef.current = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasActiveSession]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Golden Standard API Functions
  const saveAsGoldenStandard = async (message: Message, isForSeller: boolean = true): Promise<boolean> => {
    try {
      const expectedTechnique = isForSeller 
        ? message.debugInfo?.expectedTechniqueForSeller || selectedTechniqueNumber
        : message.debugInfo?.expectedTechnique || selectedTechniqueNumber;
      
      const detectedTechnique = message.debugInfo?.detectedTechnique;
      const isCorrection = detectedTechnique && detectedTechnique !== expectedTechnique;
      
      const prevCustomerMessage = messages
        .slice(0, messages.findIndex(m => m.id === message.id))
        .reverse()
        .find(m => m.sender === 'ai');
      
      const response = await fetch('/api/v2/session/save-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          techniqueId: expectedTechnique,
          message: message.text,
          context: message.debugInfo?.context?.gathered || {},
          matchStatus: isCorrection ? 'mismatch' : 'match',
          signal: prevCustomerMessage?.debugInfo?.klantSignaal || 'neutraal',
          detectedTechnique: isCorrection ? detectedTechnique : undefined
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save reference');
      }
      
      const result = await response.json();
      console.log('[Golden Standard] Saved:', result.message, isCorrection ? '(CORRECTION)' : '');
      toast.success(isCorrection ? 'Correctie opgeslagen als Golden Standard' : 'Opgeslagen als Golden Standard');
      return true;
    } catch (error) {
      console.error('[Golden Standard] Error saving reference:', error);
      toast.error('Opslaan mislukt');
      return false;
    }
  };

  const flagAsIncorrect = async (message: Message, expertComment: string, isForSeller: boolean = true): Promise<boolean> => {
    try {
      const techniqueId = isForSeller 
        ? message.debugInfo?.expectedTechniqueForSeller || selectedTechniqueNumber
        : message.debugInfo?.expectedTechnique || selectedTechniqueNumber;
      
      const prevCustomerMessage = messages
        .slice(0, messages.findIndex(m => m.id === message.id))
        .reverse()
        .find(m => m.sender === 'ai');
      
      const response = await fetch('/api/v2/session/flag-customer-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          turnNumber: messages.findIndex(m => m.id === message.id),
          customerMessage: isForSeller ? (prevCustomerMessage?.text || '') : message.text,
          customerSignal: isForSeller 
            ? (prevCustomerMessage?.debugInfo?.klantSignaal || 'neutraal')
            : (message.debugInfo?.klantSignaal || 'neutraal'),
          currentPhase: message.debugInfo?.context?.fase || currentPhase,
          techniqueId,
          expertComment,
          context: message.debugInfo?.context?.gathered || {},
          conversationHistory: messages.map(m => ({
            role: m.sender === 'hugo' ? 'seller' : 'customer',
            content: m.text
          }))
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to flag response');
      }
      
      const result = await response.json();
      console.log('[Golden Standard] Flagged:', result.message);
      toast.success(`Feedback opgeslagen (${result.conflictsFound || 0} conflicts)`);
      return true;
    } catch (error) {
      console.error('[Golden Standard] Error flagging response:', error);
      toast.error('Feedback opslaan mislukt');
      return false;
    }
  };

  // LiveKit Audio Functions
  const initLiveKitAudio = useCallback(async () => {
    if (isAudioConnecting || audioConnectionState === ConnectionState.Connected) return;
    
    setIsAudioConnecting(true);
    setAudioError(null);
    
    try {
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: `hugo-admin-${Date.now()}` })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get LiveKit token');
      }
      
      const { token, url } = await response.json();
      
      const room = new Room();
      
      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        console.log('[LiveKit] Connection state:', state);
        setAudioConnectionState(state);
        if (state === ConnectionState.Connected) {
          console.log('[LiveKit] Connected to room');
        } else if (state === ConnectionState.Disconnected) {
          console.log('[LiveKit] Disconnected');
        }
      });
      
      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        if (track.kind === Track.Kind.Audio) {
          console.log('[LiveKit] Track subscribed:', track.kind);
          const audioElement = track.attach();
          audioElementRef.current = audioElement;
          document.body.appendChild(audioElement);
        }
      });
      
      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          track.detach().forEach(el => el.remove());
        }
      });
      
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const agentSpeaking = speakers.some(s => s.identity.startsWith('agent'));
        setIsAgentSpeaking(agentSpeaking);
      });
      
      await room.connect(url, token);
      await room.localParticipant.setMicrophoneEnabled(true);
      console.log('[LiveKit] Microphone enabled');
      
      setLiveKitRoom(room);
    } catch (error) {
      console.error('[LiveKit] Error:', error);
      setAudioError(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setIsAudioConnecting(false);
    }
  }, [isAudioConnecting, audioConnectionState]);
  
  const stopLiveKitAudio = useCallback(() => {
    if (liveKitRoom) {
      liveKitRoom.disconnect();
      setLiveKitRoom(null);
      setAudioConnectionState(ConnectionState.Disconnected);
    }
  }, [liveKitRoom]);
  
  // Handle chat mode change for audio
  useEffect(() => {
    if (chatMode === "audio" && audioConnectionState === ConnectionState.Disconnected && !isAudioConnecting) {
      initLiveKitAudio();
    }
  }, [chatMode, audioConnectionState, isAudioConnecting, initLiveKitAudio]);
  
  // Cleanup LiveKit on unmount
  useEffect(() => {
    return () => {
      stopLiveKitAudio();
    };
  }, [stopLiveKitAudio]);
  
  // Handle mute toggle for LiveKit
  useEffect(() => {
    if (liveKitRoom && liveKitRoom.state === ConnectionState.Connected) {
      liveKitRoom.localParticipant.setMicrophoneEnabled(!isMuted);
    }
  }, [isMuted, liveKitRoom]);

  // Build debugInfo using centralized SSOT mapper with component-specific defaults
  const buildDebugInfo = (phase: number, apiResponse?: any): DebugInfo => {
    const ssotResult = buildDebugInfoFromResponse(apiResponse, difficultyLevel);
    const evalValue = ssotResult.aiDecision?.evaluatie;
    const typedEval: "positief" | "gemist" | "neutraal" = 
      evalValue === "positief" || evalValue === "gemist" ? evalValue : "neutraal";
    
    return {
      ...ssotResult,
      context: {
        fase: ssotResult.context?.fase || phase,
        gathered: ssotResult.context?.gathered || {}
      },
      customerDynamics: ssotResult.customerDynamics || { 
        rapport: 50, 
        valueTension: 50, 
        commitReadiness: 50 
      },
      aiDecision: {
        epicFase: ssotResult.aiDecision?.epicFase || `Fase ${phase}`,
        evaluatie: typedEval
      },
      promptsUsed: apiResponse?.debug?.promptsUsed || apiResponse?.promptsUsed,
      ragDocuments: apiResponse?.ragDocuments || apiResponse?.debug?.ragDocuments
    };
  };

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
  const klantHoudingenArray = Object.entries(KLANT_HOUDINGEN.houdingen).map(([key, houding]) => ({
    id: houding.id,
    key: key,
    naam: houding.naam,
    beschrijving: houding.houding_beschrijving,
    technieken: [...(houding.recommended_technique_ids || [])],
    recommended_technique_ids: [...(houding.recommended_technique_ids || [])],
  }));

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

  const startTechniqueChat = async (techniqueNumber: string, techniqueName: string) => {
    const technique = Object.values(technieken_index.technieken).find(
      (t: any) => t.nummer === techniqueNumber
    ) as any;

    if (!technique) return;

    setSelectedTechnique(techniqueName);
    setSelectedTechniqueNumber(techniqueNumber);
    setSessionTimer(0);
    setIsLoading(true);

    try {
      const session = await hugoApi.startSession({
        techniqueId: techniqueNumber,
        mode: "COACH_CHAT",
        isExpert: true,
        modality: chatMode,
      });
      
      setHasActiveSession(true);

      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: "ai",
        text: session.message || session.initialMessage || "",
        timestamp: new Date(),
        debugInfo: buildDebugInfo(parseInt(technique.fase) || currentPhase, session)
      };
      setMessages([aiMessage]);
    } catch (error) {
      console.error("Failed to start session:", error);
      setSelectedTechnique("");
      setSelectedTechniqueNumber("");
      setHasActiveSession(false);
      const errorMessage: Message = {
        id: Date.now().toString(),
        sender: "ai",
        text: `Er ging iets mis bij het starten van de sessie voor "${techniqueName}". Probeer het opnieuw.`,
        timestamp: new Date(),
        debugInfo: buildDebugInfo(parseInt(technique.fase) || currentPhase)
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }

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

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !hasActiveSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "hugo",
      text: inputText,
      timestamp: new Date(),
      debugInfo: {
        chosenTechniqueForSeller: selectedTechnique || "Geen",
        sellerSignaal: "neutraal",
        expectedTechniqueForSeller: selectedTechniqueNumber || "N/A",
        detectedTechnique: selectedTechniqueNumber ? getTechniqueNameByNumber(selectedTechniqueNumber) : "Onbekend",
        score: 0,
        ...buildDebugInfo(currentPhase)
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await hugoApi.sendMessage(inputText, true);
      
      const signalMap: Record<string, "positief" | "neutraal" | "negatief"> = {
        positief: "positief",
        neutral: "neutraal",
        neutraal: "neutraal",
        negatief: "negatief"
      };
      
      const evalMap: Record<string, "positief" | "gemist" | "neutraal"> = {
        goed: "positief",
        positief: "positief",
        gemist: "gemist",
        neutraal: "neutraal"
      };
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: response.response,
        timestamp: new Date(),
        debugInfo: {
          klantSignaal: signalMap[response.debug?.signal || "neutraal"] || "neutraal",
          expectedTechnique: response.debug?.detectedTechniques?.[0] || "N/A",
          ...buildDebugInfo(currentPhase, response)
        }
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Handle level transition (invisible auto-adaptive system)
      if (response.levelTransition) {
        const { previousLevel, newLevel, shouldCongratulate } = response.levelTransition;
        const levelNames = ["onbewuste_onkunde", "bewuste_onkunde", "bewuste_kunde", "onbewuste_kunde"];
        setDifficultyLevel(levelNames[newLevel - 1] || "onbewuste_onkunde");
        try {
          const levelData = await hugoApi.getUserLevel();
          setAssistanceConfig(levelData.assistance);
        } catch (e) {
          console.error("[Performance] Failed to reload assistance config:", e);
        }
        if (shouldCongratulate) {
          setLevelTransitionMessage(`🎉 Niveau ${previousLevel} → ${newLevel}. Gefeliciteerd!`);
        } else {
          setLevelTransitionMessage(`💪 Niveau ${previousLevel} → ${newLevel}. Aangepast voor betere oefening.`);
        }
        setTimeout(() => setLevelTransitionMessage(null), 5000);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Sorry, er ging iets mis met de verbinding. Probeer het opnieuw.",
        timestamp: new Date(),
        debugInfo: {
          klantSignaal: "neutraal",
          ...buildDebugInfo(currentPhase)
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopRoleplay = () => {
    // Admin/Expert mode: skip the feedback dialog, just reset directly
    confirmStopRoleplay();
  };

  const confirmStopRoleplay = () => {
    setIsRecording(false);
    setMessages([]);
    setInputText("");
    setSelectedTechnique("");
    setSelectedTechniqueNumber("");
    setSessionTimer(0);
    setHasActiveSession(false);
    hugoApi.clearSession();
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
        {difficultyLevel !== "onbewuste_kunde" && (
          <div className="w-[280px] flex-shrink-0 overflow-y-auto h-full">
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

        {/* Right Panel - Chat */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-hh-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[18px] leading-[24px] font-bold text-hh-text">
                  {sessionTitle}
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-[12px] text-hh-muted">Training AI Model</p>
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded-full">
                    Lvl {difficultyLevel === "onbewuste_onkunde" ? "1" : 
                         difficultyLevel === "bewuste_onkunde" ? "2" : 
                         difficultyLevel === "bewuste_kunde" ? "3" : "4"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setIsRecording(!isRecording)}
                  className={`gap-2 ${!isRecording ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50" : ""}`}
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

            {/* Mode Selector - Niveau is now auto-adaptive (hidden) */}
            <div className="flex items-center justify-end">
              {/* Mode Toggle - Chat/Bellen/Video (same as User View) */}
              <div className="flex items-center gap-3">
                {selectedTechnique && (
                  <div className="flex items-center gap-1.5 text-[13px] text-hh-muted">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono">{formatTime(sessionTimer)}</span>
                  </div>
                )}
                <div className="flex items-center bg-hh-ui-50 rounded-lg p-1">
                  <button
                    onClick={() => setChatMode("chat")}
                    className={`p-2 rounded-md transition-all ${chatMode === "chat" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                    title="Chat"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setChatMode("audio")}
                    className={`p-2 rounded-md transition-all ${chatMode === "audio" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                    title="Bellen"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setChatMode("video")}
                    className={`p-2 rounded-md transition-all ${chatMode === "video" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                    title="Video"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Level transition notification banner */}
          {levelTransitionMessage && (
            <div className="px-6 py-3 bg-gradient-to-r from-purple-500/10 to-purple-500/5 border-b border-purple-500/20">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-hh-ink font-medium">{levelTransitionMessage}</span>
                <button 
                  onClick={() => setLevelTransitionMessage(null)}
                  className="text-hh-muted hover:text-hh-ink transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Audio Mode Interface */}
          {chatMode === "audio" && (
            <div className="flex-1 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #0d9488 100%)' }}>
              <div className="relative">
                <div 
                  className="rounded-full flex items-center justify-center shadow-2xl mb-6"
                  style={{ width: '180px', height: '180px', backgroundColor: '#6B7A92' }}
                >
                  <span className="text-white font-bold" style={{ fontSize: '64px' }}>HH</span>
                </div>
                {isAgentSpeaking && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full">
                    <span className="text-teal-700 text-[12px] font-medium">Spreekt...</span>
                  </div>
                )}
              </div>
              <h3 className="text-white text-[20px] font-semibold mb-1">Hugo Herbots</h3>
              <p className="text-[16px] mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {isAudioConnecting ? "Verbinden..." : audioConnectionState === ConnectionState.Connected ? "Verbonden" : "Audio modus"}
              </p>
              <p className="text-[22px] font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{formatTime(sessionTimer)}</p>
              
              {/* Waveform visualization - animate when speaking */}
              <div className="flex items-end justify-center gap-1.5 h-16 mt-8">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-150 ${isAgentSpeaking ? 'animate-pulse' : ''}`}
                    style={{
                      width: '6px',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      height: isAgentSpeaking ? `${Math.sin(Date.now() / 200 + i) * 20 + 35}px` : `${15 + (i % 3) * 10}px`,
                    }}
                  />
                ))}
              </div>
              
              {/* Status message */}
              <p className="text-white/60 text-[14px] mt-4">
                {audioError ? "Configuratie vereist" : audioConnectionState === ConnectionState.Connected ? "Spraakcoaching actief" : "LiveKit audio verbinding"}
              </p>
              
              {/* Audio controls */}
              <div className="mt-auto pb-8 pt-4">
                <div className="flex items-center justify-center gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="flex items-center justify-center transition-colors"
                      style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: isMuted ? 'white' : 'rgba(255,255,255,0.2)' }}
                    >
                      {isMuted ? <MicOff className="w-5 h-5 text-teal-700" /> : <Mic className="w-5 h-5 text-white" />}
                    </button>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{isMuted ? "Unmute" : "Mute"}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <button 
                      onClick={() => {
                        stopLiveKitAudio();
                        setChatMode("chat");
                      }}
                      className="flex items-center justify-center shadow-xl"
                      style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ef4444' }}
                    >
                      <Phone className="w-6 h-6 text-white" style={{ transform: 'rotate(135deg)' }} />
                    </button>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>Ophangen</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <button 
                      className="flex items-center justify-center"
                      style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' }}
                    >
                      <Volume2 className="w-5 h-5 text-white" />
                    </button>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>Speaker</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Video Mode Interface - HeyGen LiveAvatar */}
          {chatMode === "video" && (
            <div className="flex-1 relative flex flex-col" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)' }}>
              {/* Top overlay with name and timer */}
              <div className="absolute top-0 left-0 right-0 p-4 z-10" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
                <h3 className="text-white text-[18px] font-semibold">Hugo Herbots</h3>
                <p className="text-white/70 text-[14px]">{formatTime(sessionTimer)}</p>
              </div>

              {/* LiveAvatar Component - fills the main area */}
              <div className="flex-1 flex items-center justify-center p-4 pt-16">
                <LiveAvatarComponent
                  v2SessionId={sessionId}
                  onAvatarSpeech={(text) => {
                    setMessages(prev => [...prev, {
                      id: Date.now().toString(),
                      sender: "ai",
                      text,
                      timestamp: new Date()
                    }]);
                  }}
                  onUserSpeech={(text) => {
                    setMessages(prev => [...prev, {
                      id: Date.now().toString(),
                      sender: "hugo",
                      text,
                      timestamp: new Date()
                    }]);
                  }}
                  language="nl"
                />
              </div>

              {/* Bottom controls - back to chat button */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <button 
                      onClick={() => setChatMode("chat")}
                      className="flex items-center justify-center shadow-xl"
                      style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#6B7A92' }}
                    >
                      <MessageSquare className="w-5 h-5 text-white" />
                    </button>
                    <span className="text-white/70 text-[11px]">Terug naar chat</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Mode - Messages */}
          {chatMode === "chat" && (
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
                        <AvatarFallback className="bg-purple-600 text-white text-[12px]">
                          AI
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div
                        className={`p-3 rounded-lg relative ${
                          message.sender === "hugo"
                            ? "bg-[#1E2A3B] text-white"
                            : "bg-white border border-slate-200 text-slate-800"
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
                        
                        <div className="flex items-center justify-between gap-2 mt-2 text-[10px]">
                          <span style={{ color: message.sender === "hugo" ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' }}>{message.timestamp.toLocaleTimeString()}</span>
                          
                          {/* Debug Info Button - RECHTS ONDERAAN */}
                          {message.debugInfo && (
                            <button
                              onClick={() =>
                                setExpandedDebug(expandedDebug === message.id ? null : message.id)
                              }
                              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                                message.sender === "hugo"
                                  ? "bg-slate-700 hover:bg-slate-600 text-white"
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
                    <Card className="p-4 mt-2 border-2 border-dashed max-w-[280px] border-slate-200 bg-slate-50/50 text-slate-800">
                        <div className="space-y-3 text-[13px] leading-[18px]">
                          {/* For Hugo/Seller messages */}
                          {message.sender === "hugo" && (
                            <div className="space-y-3">
                              {/* Gekozen techniek (MOVED HERE from AI) */}
                              {message.debugInfo.chosenTechniqueForSeller && (
                                <div className="pb-3 border-b border-slate-200">
                                  <p className="text-[12px] text-hh-muted mb-1">Gekozen techniek:</p>
                                  <Badge 
                                    variant="outline" 
                                    className="text-[11px] cursor-pointer hover:bg-slate-100"
                                    onClick={() => openTechniqueDetails(message.debugInfo?.chosenTechniqueForSeller || "")}
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
                                        onClick={async () => {
                                          const success = await saveAsGoldenStandard(message, true);
                                          if (success) {
                                            setTechniqueValidation((prev) => ({ ...prev, [message.id]: true }));
                                            setShowFeedbackInput((prev) => ({ ...prev, [message.id]: false }));
                                          }
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
                                        className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                                        onClick={async () => {
                                          const success = await flagAsIncorrect(message, feedbackText[message.id], true);
                                          if (success) {
                                            setShowFeedbackInput((prev) => ({ ...prev, [message.id]: false }));
                                            setFeedbackText((prev) => ({ ...prev, [message.id]: "" }));
                                          }
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
                                    <p className="text-[12px] text-slate-600 font-medium mb-1">Gedetecteerde techniek:</p>
                                    <p className="text-slate-800 text-[12px]">
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
                                        onClick={async () => {
                                          const success = await saveAsGoldenStandard(message, true);
                                          if (success) {
                                            setTechniqueValidation((prev) => ({ ...prev, [message.id + "_detected"]: true }));
                                            setShowFeedbackInput((prev) => ({ ...prev, [message.id + "_detected"]: false }));
                                          }
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
                                        className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                                        onClick={async () => {
                                          const success = await flagAsIncorrect(message, feedbackText[message.id + "_detected"], true);
                                          if (success) {
                                            setShowFeedbackInput((prev) => ({ ...prev, [message.id + "_detected"]: false }));
                                            setFeedbackText((prev) => ({ ...prev, [message.id + "_detected"]: "" }));
                                          }
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
                              <div className="pt-4 border-t border-slate-200/50">
                                <button
                                  onClick={() => toggleDebugSection(message.id, "persona")}
                                  className="flex items-center gap-2 text-[13px] font-bold text-slate-800 hover:text-purple-600 w-full"
                                >
                                  {isDebugSectionExpanded(message.id, "persona") ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                  Persona
                                </button>
                                {isDebugSectionExpanded(message.id, "persona") && (
                                  <div className="mt-3 ml-6 grid grid-cols-[120px_1fr] gap-y-2 gap-x-3 text-[12px]">
                                    <span className="text-slate-600 font-medium">Gedragsstijl:</span>
                                    <span className="text-slate-800">{message.debugInfo.persona.gedragsstijl}</span>
                                    <span className="text-slate-600 font-medium">Buying Clock:</span>
                                    <span className="text-slate-800">{message.debugInfo.persona.koopklok}</span>
                                    <span className="text-slate-600 font-medium">Difficulty:</span>
                                    <span className="text-slate-800">{message.debugInfo.persona.moeilijkheid}</span>
                                  </div>
                                )}
                              </div>

                              {/* Verzamelde Context */}
                              <div>
                                <button
                                  onClick={() => toggleDebugSection(message.id, "context")}
                                  className="flex items-center gap-2 text-[13px] font-bold text-slate-800 hover:text-purple-600 w-full"
                                >
                                  {isDebugSectionExpanded(message.id, "context") ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                  Verzamelde Context
                                </button>
                                {isDebugSectionExpanded(message.id, "context") && message.debugInfo.context && (
                                  <div className="mt-3 ml-6 grid grid-cols-[120px_1fr] gap-y-2 gap-x-3 text-[12px]">
                                    {message.debugInfo.context.gathered?.sector && (
                                      <>
                                        <span className="text-slate-600 font-medium">Sector:</span>
                                        <span className="text-slate-800">{message.debugInfo.context.gathered.sector}</span>
                                      </>
                                    )}
                                    {message.debugInfo.context.gathered?.product && (
                                      <>
                                        <span className="text-slate-600 font-medium">Product:</span>
                                        <span className="text-slate-800">{message.debugInfo.context.gathered.product}</span>
                                      </>
                                    )}
                                    {message.debugInfo.context.gathered?.klantType && (
                                      <>
                                        <span className="text-slate-600 font-medium">Klant Type:</span>
                                        <span className="text-slate-800">{message.debugInfo.context.gathered.klantType}</span>
                                      </>
                                    )}
                                    {message.debugInfo.context.gathered?.verkoopkanaal && (
                                      <>
                                        <span className="text-slate-600 font-medium">Verkoopkanaal:</span>
                                        <span className="text-slate-800">{message.debugInfo.context.gathered.verkoopkanaal}</span>
                                      </>
                                    )}
                                    {!message.debugInfo.context.gathered?.sector && 
                                     !message.debugInfo.context.gathered?.product && 
                                     !message.debugInfo.context.gathered?.klantType && (
                                      <span className="col-span-2 text-slate-500 italic">Nog geen context verzameld</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Customer Dynamics */}
                              <div>
                                <button
                                  onClick={() => toggleDebugSection(message.id, "dynamics")}
                                  className="flex items-center gap-2 text-[13px] font-bold text-slate-800 hover:text-purple-600 w-full"
                                >
                                  {isDebugSectionExpanded(message.id, "dynamics") ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                  Customer Dynamics
                                </button>
                                {isDebugSectionExpanded(message.id, "dynamics") && (
                                  <div className="mt-3 ml-6 grid grid-cols-[120px_1fr] gap-y-2 gap-x-3 text-[12px]">
                                    <span className="text-slate-600 font-medium">Rapport:</span>
                                    <span className="text-slate-800">
                                      {message.debugInfo.customerDynamics.rapport}%
                                      <span className="text-slate-500 ml-1">
                                        ({message.debugInfo.customerDynamics.rapport >= 60 ? "hoog" : message.debugInfo.customerDynamics.rapport >= 40 ? "midden" : "laag"})
                                      </span>
                                    </span>
                                    <span className="text-slate-600 font-medium">Value Tension:</span>
                                    <span className="text-slate-800">
                                      {message.debugInfo.customerDynamics.valueTension}%
                                      <span className="text-slate-500 ml-1">
                                        ({message.debugInfo.customerDynamics.valueTension >= 60 ? "hoog" : message.debugInfo.customerDynamics.valueTension >= 40 ? "midden" : "laag"})
                                      </span>
                                    </span>
                                    <span className="text-slate-600 font-medium">Commit Readiness:</span>
                                    <span className="text-slate-800">
                                      {message.debugInfo.customerDynamics.commitReadiness}%
                                      <span className="text-slate-500 ml-1">
                                        ({message.debugInfo.customerDynamics.commitReadiness >= 60 ? "hoog" : message.debugInfo.customerDynamics.commitReadiness >= 40 ? "midden" : "laag"})
                                      </span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* For AI/Customer messages */}
                          {message.sender === "ai" && (
                            <div className="space-y-4">
                              {/* Klant Signaal + EPIC Fase + Evaluatie */}
                              <div className="space-y-2 text-[12px]">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-600 font-medium">Klant Signaal:</span>
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
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-600 font-medium">EPIC Fase:</span>
                                  <Badge variant="outline" className="text-[11px] bg-slate-100 text-slate-700 border-slate-300">
                                    {message.debugInfo.aiDecision?.epicFase || "onbekend"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-600 font-medium">Evaluatie:</span>
                                  <Badge variant="outline" className={`text-[11px] ${
                                    (message.debugInfo.aiDecision?.evaluatie as string) === "positief" || (message.debugInfo.aiDecision?.evaluatie as string) === "perfect"
                                      ? "bg-green-100 text-green-700 border-green-300"
                                      : message.debugInfo.aiDecision?.evaluatie === "gemist"
                                      ? "bg-red-100 text-red-700 border-red-300"
                                      : "bg-gray-100 text-gray-700 border-gray-300"
                                  }`}>
                                    {message.debugInfo.aiDecision?.evaluatie || "neutraal"}
                                  </Badge>
                                </div>
                              </div>

                              {/* Verwachte techniek (for AI messages) */}
                              {message.debugInfo.expectedTechnique && (
                                <div>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 pb-3 border-b border-purple-200">
                                      <p className="text-[12px] text-slate-600 font-medium mb-1">Verwachte techniek:</p>
                                      <p className="text-slate-800 text-[12px]">
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
                                          onClick={async () => {
                                            const success = await saveAsGoldenStandard(message, false);
                                            if (success) {
                                              setTechniqueValidation((prev) => ({ ...prev, [message.id]: true }));
                                              setShowFeedbackInput((prev) => ({ ...prev, [message.id]: false }));
                                            }
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
                                          className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                                          onClick={async () => {
                                            const success = await flagAsIncorrect(message, feedbackText[message.id], false);
                                            if (success) {
                                              setShowFeedbackInput((prev) => ({ ...prev, [message.id]: false }));
                                              setFeedbackText((prev) => ({ ...prev, [message.id]: "" }));
                                            }
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
                                <div className="grid grid-cols-[120px_1fr] gap-x-3 text-[12px] pb-3 border-b border-slate-200">
                                  <span className="text-slate-600 font-medium">Gedetecteerde techniek:</span>
                                  <span className="text-slate-800">
                                    {message.debugInfo.expectedTechnique}
                                    <span className="ml-2 text-green-600 font-semibold">
                                      (+10)
                                    </span>
                                  </span>
                                </div>
                              )}

                              {/* Collapsible sections for AI */}
                              {/* Persona */}
                              <div>
                                <button
                                  onClick={() => toggleDebugSection(message.id, "persona")}
                                  className="flex items-center gap-2 text-[13px] font-bold text-slate-800 hover:text-purple-600 w-full"
                                >
                                  {isDebugSectionExpanded(message.id, "persona") ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                  Persona
                                </button>
                                {isDebugSectionExpanded(message.id, "persona") && (
                                  <div className="mt-3 ml-6 grid grid-cols-[120px_1fr] gap-y-2 gap-x-3 text-[12px]">
                                    <span className="text-slate-600 font-medium">Gedragsstijl:</span>
                                    <span className="text-slate-800">{message.debugInfo.persona.gedragsstijl}</span>
                                    <span className="text-slate-600 font-medium">Buying Clock:</span>
                                    <span className="text-slate-800">{message.debugInfo.persona.koopklok}</span>
                                    <span className="text-slate-600 font-medium">Difficulty:</span>
                                    <span className="text-slate-800">{message.debugInfo.persona.moeilijkheid}</span>
                                  </div>
                                )}
                              </div>

                              {/* Verzamelde Context */}
                              <div>
                                <button
                                  onClick={() => toggleDebugSection(message.id, "context")}
                                  className="flex items-center gap-2 text-[13px] font-bold text-slate-800 hover:text-purple-600 w-full"
                                >
                                  {isDebugSectionExpanded(message.id, "context") ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                  Verzamelde Context
                                </button>
                                {isDebugSectionExpanded(message.id, "context") && message.debugInfo.context && (
                                  <div className="mt-3 ml-6 grid grid-cols-[120px_1fr] gap-y-2 gap-x-3 text-[12px]">
                                    {message.debugInfo.context.gathered?.sector && (
                                      <>
                                        <span className="text-slate-600 font-medium">Sector:</span>
                                        <span className="text-slate-800">{message.debugInfo.context.gathered.sector}</span>
                                      </>
                                    )}
                                    {message.debugInfo.context.gathered?.product && (
                                      <>
                                        <span className="text-slate-600 font-medium">Product:</span>
                                        <span className="text-slate-800">{message.debugInfo.context.gathered.product}</span>
                                      </>
                                    )}
                                    {message.debugInfo.context.gathered?.klantType && (
                                      <>
                                        <span className="text-slate-600 font-medium">Klant Type:</span>
                                        <span className="text-slate-800">{message.debugInfo.context.gathered.klantType}</span>
                                      </>
                                    )}
                                    {message.debugInfo.context.gathered?.verkoopkanaal && (
                                      <>
                                        <span className="text-slate-600 font-medium">Verkoopkanaal:</span>
                                        <span className="text-slate-800">{message.debugInfo.context.gathered.verkoopkanaal}</span>
                                      </>
                                    )}
                                    {!message.debugInfo.context.gathered?.sector && 
                                     !message.debugInfo.context.gathered?.product && 
                                     !message.debugInfo.context.gathered?.klantType && (
                                      <span className="col-span-2 text-slate-500 italic">Nog geen context verzameld</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Customer Dynamics */}
                              <div>
                                <button
                                  onClick={() => toggleDebugSection(message.id, "dynamics")}
                                  className="flex items-center gap-2 text-[13px] font-bold text-slate-800 hover:text-purple-600 w-full"
                                >
                                  {isDebugSectionExpanded(message.id, "dynamics") ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                  Customer Dynamics
                                </button>
                                {isDebugSectionExpanded(message.id, "dynamics") && (
                                  <div className="mt-3 ml-6 grid grid-cols-[120px_1fr] gap-y-2 gap-x-3 text-[12px]">
                                    <span className="text-slate-600 font-medium">Rapport:</span>
                                    <span className="text-slate-800">
                                      {message.debugInfo.customerDynamics.rapport}%
                                      <span className="text-slate-500 ml-1">
                                        ({message.debugInfo.customerDynamics.rapport >= 60 ? "hoog" : message.debugInfo.customerDynamics.rapport >= 40 ? "midden" : "laag"})
                                      </span>
                                    </span>
                                    <span className="text-slate-600 font-medium">Value Tension:</span>
                                    <span className="text-slate-800">
                                      {message.debugInfo.customerDynamics.valueTension}%
                                      <span className="text-slate-500 ml-1">
                                        ({message.debugInfo.customerDynamics.valueTension >= 60 ? "hoog" : message.debugInfo.customerDynamics.valueTension >= 40 ? "midden" : "laag"})
                                      </span>
                                    </span>
                                    <span className="text-slate-600 font-medium">Commit Readiness:</span>
                                    <span className="text-slate-800">
                                      {message.debugInfo.customerDynamics.commitReadiness}%
                                      <span className="text-slate-500 ml-1">
                                        ({message.debugInfo.customerDynamics.commitReadiness >= 60 ? "hoog" : message.debugInfo.customerDynamics.commitReadiness >= 40 ? "midden" : "laag"})
                                      </span>
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* AI Prompt & Grounding */}
                              <div>
                                <button
                                  onClick={() => toggleDebugSection(message.id, "aiPrompt")}
                                  className="flex items-center gap-2 text-[13px] font-bold text-slate-800 hover:text-purple-600 w-full"
                                >
                                  {isDebugSectionExpanded(message.id, "aiPrompt") ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                  AI Prompt & Grounding
                                </button>
                                {isDebugSectionExpanded(message.id, "aiPrompt") && (
                                  <div className="mt-3 ml-6 space-y-3 text-[12px]">
                                    {message.debugInfo.promptsUsed?.systemPrompt ? (
                                      <>
                                        <div>
                                          <p className="text-slate-600 font-medium mb-1">System Prompt:</p>
                                          <pre className="bg-slate-100 p-2 rounded text-[11px] max-h-[200px] overflow-auto whitespace-pre-wrap break-words text-slate-700">
                                            {message.debugInfo.promptsUsed.systemPrompt.slice(0, 2000)}
                                            {message.debugInfo.promptsUsed.systemPrompt.length > 2000 && "... [truncated]"}
                                          </pre>
                                        </div>
                                        {message.debugInfo.promptsUsed.userPrompt && (
                                          <div>
                                            <p className="text-slate-600 font-medium mb-1">User Prompt:</p>
                                            <pre className="bg-slate-100 p-2 rounded text-[11px] max-h-[100px] overflow-auto whitespace-pre-wrap break-words text-slate-700">
                                              {message.debugInfo.promptsUsed.userPrompt}
                                            </pre>
                                          </div>
                                        )}
                                        {message.debugInfo.ragDocuments && message.debugInfo.ragDocuments.length > 0 && (
                                          <div>
                                            <p className="text-slate-600 font-medium mb-1">RAG Documents ({message.debugInfo.ragDocuments.length}):</p>
                                            <div className="space-y-1">
                                              {message.debugInfo.ragDocuments.map((doc, idx) => (
                                                <div key={idx} className="bg-blue-50 p-2 rounded border border-blue-200">
                                                  <p className="font-medium text-blue-800 text-[11px]">{doc.title || `Document ${idx + 1}`}</p>
                                                  <p className="text-blue-600 text-[10px]">{doc.content?.slice(0, 200)}...</p>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-[11px] text-slate-500 italic">Geen prompt data beschikbaar</p>
                                    )}
                                  </div>
                                )}
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
          )}

          {/* Input - only show in chat mode */}
          {chatMode === "chat" && (
          <div className="p-4 border-t border-hh-border">
            {/* Expert Mode: Technique Selector ABOVE input - CUSTOM STYLED */}
            {difficultyLevel === "onbewuste_kunde" && (
              <div className="mb-3">
                <label className="text-[12px] font-medium text-hh-text mb-2 block">
                  Selecteer techniek die je gaat toepassen:
                </label>
                <div className="relative">
                  <select
                    value={selectedTechnique}
                    onChange={(e) => setSelectedTechnique(e.target.value)}
                    className="w-full px-4 py-3 text-[13px] border-2 border-slate-200 rounded-lg bg-white text-hh-text focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 appearance-none cursor-pointer hover:border-slate-300 transition-colors font-medium shadow-sm"
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
                  <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" />
                      Je gaat techniek {selectedTechnique} toepassen
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Non-expert modes: Reminder to select from sidebar */}
            {difficultyLevel !== "onbewuste_kunde" && !hasActiveSession && (
              <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-[12px] text-amber-700 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Selecteer eerst een techniek uit de sidebar door op het{" "}
                  <MessageSquare className="w-3.5 h-3.5 inline" /> icoon te klikken
                </p>
              </div>
            )}

            {/* Selected technique indicator for non-expert modes */}
            {difficultyLevel !== "onbewuste_kunde" && hasActiveSession && (
              <div className="mb-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-[12px] text-emerald-700 flex items-center justify-between">
                  <span>Geselecteerde techniek: {selectedTechnique} ({selectedTechniqueNumber})</span>
                  <button
                    onClick={confirmStopRoleplay}
                    className="text-[11px] text-hh-muted hover:text-hh-text underline"
                  >
                    Stop sessie
                  </button>
                </p>
              </div>
            )}
            
            <div className="flex gap-2 items-center">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && hasActiveSession && !isLoading && handleSendMessage()}
                placeholder={
                  hasActiveSession 
                    ? (isLoading ? "Hugo denkt na..." : "Type je antwoord als verkoper...")
                    : "Selecteer eerst een techniek..."
                }
                className="flex-1 min-w-0 text-slate-800 bg-white"
                disabled={!hasActiveSession || isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                size="icon"
                className="flex-shrink-0 bg-[#4F7396] hover:bg-[#4F7396]/90 text-white"
                disabled={!hasActiveSession || !inputText.trim() || isLoading}
                title="Verzend"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          )}
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
        isAdmin={true}
        onSave={(updatedTechnique) => {
          console.log("Technique updated:", updatedTechnique);
          // TODO: Save to backend
        }}
      />
    </AdminLayout>
  );
}
