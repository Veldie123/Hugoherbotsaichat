import { AppLayout } from "./AppLayout";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Sheet, SheetContent } from "../ui/sheet";
import { EPICSalesFlow } from "./EPICSalesFlow";
import {
  Radio,
  Calendar,
  Clock,
  Users,
  Send,
  ThumbsUp,
  MessageCircle,
  TrendingUp,
  Bell,
  Video,
  Eye,
  Hand,
  ChevronDown,
  ChevronUp,
  Flame,
  Heart,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import hugoLivePhoto from "figma:asset/9f21bc9eaae81b79a083fcd342b14f53acdad581.png";

interface ChatMessage {
  id: string;
  user: string;
  initials: string;
  message: string;
  time: string;
  isHost?: boolean;
}

interface Poll {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
  totalVotes: number;
  userVoted: boolean;
}

interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  topic: string;
  status: "upcoming" | "live" | "ended";
  viewers?: number;
}

interface LiveCoachingProps {
  navigate?: (page: string) => void;
  isPreview?: boolean;
  isAdmin?: boolean;
}

export function LiveCoaching({
  navigate,
  isPreview = false,
  isAdmin = false,
}: LiveCoachingProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "polls">("chat");
  const [sessionInfoOpen, setSessionInfoOpen] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [questionsInQueue] = useState(4);
  const [flowDrawerOpen, setFlowDrawerOpen] = useState(false);
  const [recordingModalOpen, setRecordingModalOpen] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<Session | null>(null);

  const chatMessages: ChatMessage[] = [
    {
      id: "1",
      user: "Hugo Herbots",
      initials: "HH",
      message:
        "Welkom allemaal! Vandaag gaan we het hebben over bezwaarhandeling in fase 4.",
      time: "14:02",
      isHost: true,
    },
    {
      id: "2",
      user: "Sarah van Dijk",
      initials: "SV",
      message: "Dank je Hugo! Ik heb hier echt moeite mee.",
      time: "14:03",
    },
    {
      id: "3",
      user: "Mark Peters",
      initials: "MP",
      message: "Hoe ga je om met prijsbezwaren bij enterprise deals?",
      time: "14:04",
    },
    {
      id: "4",
      user: "Hugo Herbots",
      initials: "HH",
      message:
        "Goede vraag Mark! Ik kom daar zo op terug met een concreet voorbeeld.",
      time: "14:05",
      isHost: true,
    },
    {
      id: "5",
      user: "Lisa de Jong",
      initials: "LJ",
      message: "Kunnen we een voorbeeld zien van lock questioning?",
      time: "14:06",
    },
  ];

  const currentPoll: Poll = {
    id: "1",
    question: "Wat vind je het moeilijkste onderdeel van bezwaarhandeling?",
    options: [
      { text: "Prijsbezwaren", votes: 12 },
      { text: "Timing bezwaren (uitstel)", votes: 8 },
      { text: "Technische bezwaren", votes: 5 },
      { text: "Budgetbezwaren", votes: 15 },
    ],
    totalVotes: 40,
    userVoted: false,
  };

  const upcomingSessions: Session[] = [
    {
      id: "1",
      title: "Live Coaching: Bezwaarhandeling",
      date: "Woensdag 15 jan",
      time: "14:00 - 15:00",
      duration: "60 min",
      topic: "Fase 4 • Beslissingsfase",
      status: "live",
      viewers: 127,
    },
    {
      id: "2",
      title: "Live Q&A: Discovery Technieken",
      date: "Woensdag 22 jan",
      time: "14:00 - 15:00",
      duration: "60 min",
      topic: "Fase 2 • Ontdekkingsfase",
      status: "upcoming",
    },
    {
      id: "3",
      title: "Live Coaching: Closing Mastery",
      date: "Woensdag 29 jan",
      time: "14:00 - 15:00",
      duration: "60 min",
      topic: "Fase 4 • Afsluittechnieken",
      status: "upcoming",
    },
  ];

  const pastSessions: Session[] = [
    {
      id: "4",
      title: "Opening & Koopklimaat",
      date: "Woensdag 8 jan",
      time: "14:00 - 15:00",
      duration: "60 min",
      topic: "Fase 1 • Openingsfase",
      status: "ended",
    },
    {
      id: "5",
      title: "SPIN & Lock Questioning",
      date: "Woensdag 18 dec",
      time: "14:00 - 15:00",
      duration: "60 min",
      topic: "Fase 2 • Ontdekkingsfase",
      status: "ended",
    },
  ];

  const liveSession = upcomingSessions.find((s) => s.status === "live");

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      console.log("Send:", chatMessage);
      setChatMessage("");
    }
  };

  const handleReaction = (emoji: string) => {
    console.log("Reaction:", emoji);
  };

  const handleRaiseHand = () => {
    setHandRaised(!handRaised);
    console.log("Hand raised:", !handRaised);
  };

  return (
    <AppLayout
      currentPage="live"
      navigate={navigate}
      onOpenFlowDrawer={() => setFlowDrawerOpen(true)}
      isAdmin={isAdmin}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-[32px] leading-[40px] sm:text-[40px] sm:leading-[48px] lg:text-[48px] lg:leading-[56px] font-normal">
              Live Coaching
            </h1>
            <p className="text-[14px] leading-[22px] sm:text-[16px] sm:leading-[24px] text-hh-muted">
              Elke week live met Hugo — stel vragen, oefen samen en leer van
              andere verkopers.
            </p>
          </div>
          {liveSession && (
            <Badge className="bg-destructive text-white border-destructive flex items-center gap-2 px-3 py-1.5 animate-pulse">
              <Radio className="w-4 h-4" />
              <span>LIVE NU</span>
            </Badge>
          )}
        </div>

        {/* Live Session - Split Layout */}
        {liveSession && (
          <div className="space-y-4">
            {/* Video + Chat/Polls Container */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Left: Video (60% on desktop, 40vh on mobile) */}
              <div className="w-full lg:w-[60%] space-y-4">
                <Card className="rounded-[16px] shadow-hh-md border-hh-border overflow-hidden">
                  {/* Video Player */}
                  <div
                    className="w-full bg-hh-ink flex items-center justify-center relative overflow-hidden"
                    style={{ aspectRatio: "16/9" }}
                  >
                    {/* Hugo Live Photo Background */}
                    <img
                      src={hugoLivePhoto}
                      alt="Hugo Herbots Live Coaching"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Subtle overlay for badges visibility */}
                    <div className="absolute inset-0 bg-black/10" />

                    {/* Live Badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <Badge className="bg-destructive text-white border-none flex items-center gap-2 px-3 py-1.5">
                        <Radio className="w-4 h-4 animate-pulse" />
                        <span>LIVE</span>
                      </Badge>
                    </div>

                    {/* Viewers Count */}
                    <div className="absolute top-4 right-4 z-20">
                      <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-white" />
                        <span className="text-white text-[14px] leading-[20px]">
                          {liveSession.viewers} kijkers
                        </span>
                      </div>
                    </div>

                    {/* Questions Queue Counter */}
                    {questionsInQueue > 0 && (
                      <div className="absolute bottom-4 left-4 z-20">
                        <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-white" />
                          <span className="text-white text-[14px] leading-[20px]">
                            {questionsInQueue} vragen in wachtrij
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Reactions Bar */}
                    <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                      <button
                        onClick={() => handleReaction("🔥")}
                        className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        title="Vuur"
                      >
                        <span className="text-[20px]">🔥</span>
                      </button>
                      <button
                        onClick={() => handleReaction("👏")}
                        className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        title="Applaus"
                      >
                        <span className="text-[20px]">👏</span>
                      </button>
                      <button
                        onClick={() => handleReaction("💯")}
                        className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        title="100%"
                      >
                        <span className="text-[20px]">💯</span>
                      </button>
                      <button
                        onClick={() => handleReaction("❤️")}
                        className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        title="Love"
                      >
                        <span className="text-[20px]">❤️</span>
                      </button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right: Chat/Polls Sidebar (40% on desktop, 60vh on mobile) */}
              <div className="w-full lg:w-[40%] h-[60vh] lg:h-auto lg:min-h-[500px]">
                <Card className="rounded-[16px] shadow-hh-md border-hh-border overflow-hidden flex flex-col h-full">
                  <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as "chat" | "polls")}
                    className="flex flex-col h-full"
                  >
                    {/* Tabs Header */}
                    <div className="border-b border-hh-border px-4 pt-4 flex-shrink-0">
                      <TabsList className="w-full bg-hh-ui-50">
                        <TabsTrigger
                          value="chat"
                          className="flex-1 data-[state=active]:bg-hh-primary data-[state=active]:text-white"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </TabsTrigger>
                        <TabsTrigger
                          value="polls"
                          className="flex-1 data-[state=active]:bg-hh-primary data-[state=active]:text-white"
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Polls
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Chat Tab */}
                    <TabsContent
                      value="chat"
                      className="flex-1 flex flex-col mt-0 overflow-hidden"
                    >
                      {/* Raise Hand Button */}
                      <div className="p-3 border-b border-hh-border flex-shrink-0">
                        <Button
                          onClick={handleRaiseHand}
                          variant={handRaised ? "default" : "outline"}
                          className={`w-full gap-2 ${
                            handRaised
                              ? "bg-hh-primary text-white"
                              : "border-hh-border"
                          }`}
                        >
                          <Hand
                            className={`w-4 h-4 ${
                              handRaised ? "animate-bounce" : ""
                            }`}
                          />
                          {handRaised
                            ? "Hand omlaag — je staat in de wachtrij"
                            : "Steek je hand op voor een vraag"}
                        </Button>
                      </div>

                      {/* Messages */}
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {chatMessages.map((msg) => (
                            <div key={msg.id} className="flex gap-3">
                              <Avatar className="flex-shrink-0 w-8 h-8">
                                <AvatarFallback
                                  className={
                                    msg.isHost
                                      ? "bg-hh-primary text-white text-[12px]"
                                      : "bg-hh-ui-200 text-hh-text text-[12px]"
                                  }
                                >
                                  {msg.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                  <span
                                    className={`text-[14px] leading-[20px] ${
                                      msg.isHost
                                        ? "text-hh-primary"
                                        : "text-hh-text"
                                    }`}
                                  >
                                    {msg.user}
                                  </span>
                                  {msg.isHost && (
                                    <Badge className="bg-hh-primary/10 text-hh-primary border-hh-primary/20 text-[10px] px-1.5 py-0">
                                      HOST
                                    </Badge>
                                  )}
                                  <span className="text-[12px] leading-[16px] text-hh-muted">
                                    {msg.time}
                                  </span>
                                </div>
                                <p className="text-[14px] leading-[20px] text-hh-text">
                                  {msg.message}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      {/* Input */}
                      <div className="p-4 border-t border-hh-border flex-shrink-0">
                        <div className="flex gap-2">
                          <Input
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            placeholder="Stel een vraag..."
                            className="flex-1"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!chatMessage.trim()}
                            size="icon"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-[12px] leading-[16px] text-hh-muted mt-2">
                          Wees respectvol — Hugo beantwoordt vragen live
                        </p>
                      </div>
                    </TabsContent>

                    {/* Polls Tab */}
                    <TabsContent
                      value="polls"
                      className="flex-1 p-4 mt-0 overflow-auto"
                    >
                      <div className="space-y-6">
                        {/* Active Poll */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <ThumbsUp className="w-5 h-5 text-hh-primary" />
                            <h3 className="text-hh-text">Live Poll</h3>
                          </div>
                          <p className="text-hh-text mb-4">
                            {currentPoll.question}
                          </p>
                          <div className="space-y-2">
                            {currentPoll.options.map((option, idx) => {
                              const percentage = currentPoll.totalVotes
                                ? Math.round(
                                    (option.votes / currentPoll.totalVotes) *
                                      100
                                  )
                                : 0;
                              return (
                                <button
                                  key={idx}
                                  className="w-full text-left p-3 rounded-lg border border-hh-border hover:border-hh-primary transition-colors relative overflow-hidden"
                                >
                                  <div
                                    className="absolute inset-0 bg-hh-primary/5"
                                    style={{ width: `${percentage}%` }}
                                  />
                                  <div className="relative flex items-center justify-between">
                                    <span className="text-hh-text">
                                      {option.text}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-hh-muted text-[14px] leading-[20px]">
                                        {option.votes}
                                      </span>
                                      <span className="text-hh-primary">
                                        {percentage}%
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-[12px] leading-[16px] text-hh-muted mt-3">
                            {currentPoll.totalVotes} stemmen
                          </p>
                        </div>

                        {/* Poll Results Info */}
                        <Card className="p-4 rounded-[12px] bg-hh-primary/5 border-hh-primary/20">
                          <p className="text-[14px] leading-[20px] text-hh-text">
                            💡 <strong>Hugo gebruikt deze poll</strong> om de
                            sessie aan te passen aan wat het meeste speelt bij
                            de groep.
                          </p>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>
            </div>

            {/* Session Info - Collapsible (below video + chat) */}
            <Collapsible
              open={sessionInfoOpen}
              onOpenChange={setSessionInfoOpen}
            >
              <Card className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-hh-ui-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{liveSession.topic}</Badge>
                      <h3 className="text-hh-text">{liveSession.title}</h3>
                    </div>
                  </div>
                  {sessionInfoOpen ? (
                    <ChevronUp className="w-5 h-5 text-hh-muted" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-hh-muted" />
                  )}
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-6 border-t border-hh-border">
                    <h4 className="text-hh-text mb-3">Over deze sessie</h4>
                    <p className="text-hh-muted mb-4">
                      In deze live sessie gaat Hugo dieper in op
                      bezwaarhandeling in de beslissingsfase. We behandelen de
                      5 verschillende types bezwaren en hoe je daar effectief
                      mee omgaat. Inclusief live Q&A en praktijkvoorbeelden.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-hh-primary/10 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-hh-primary" />
                        </div>
                        <div>
                          <p className="text-[14px] leading-[20px] text-hh-muted">
                            Niveau
                          </p>
                          <p className="text-hh-text">Gevorderd</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-hh-success/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-hh-success" />
                        </div>
                        <div>
                          <p className="text-[14px] leading-[20px] text-hh-muted">
                            Datum
                          </p>
                          <p className="text-hh-text">{liveSession.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-hh-warn/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-hh-warn" />
                        </div>
                        <div>
                          <p className="text-[14px] leading-[20px] text-hh-muted">
                            Duur
                          </p>
                          <p className="text-hh-text">
                            {liveSession.duration}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        )}

        {/* Upcoming Sessions */}
        <div>
          <h2 className="text-hh-text mb-4">Aankomende sessies</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingSessions
              .filter((s) => s.status === "upcoming")
              .map((session) => (
                <Card
                  key={session.id}
                  className="p-6 rounded-[16px] shadow-hh-sm border-hh-border hover:shadow-hh-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline">{session.topic}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Bell className="w-4 h-4" />
                    </Button>
                  </div>
                  <h3 className="text-hh-text mb-3">{session.title}</h3>
                  <div className="space-y-2 text-[14px] leading-[20px]">
                    <div className="flex items-center gap-2 text-hh-muted">
                      <Calendar className="w-4 h-4" />
                      {session.date}
                    </div>
                    <div className="flex items-center gap-2 text-hh-muted">
                      <Clock className="w-4 h-4" />
                      {session.time}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Herinnering instellen
                  </Button>
                </Card>
              ))}
          </div>
        </div>

        {/* Past Sessions */}
        <div>
          <h2 className="text-hh-text mb-4">Terugkijken</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastSessions.map((session) => (
              <Card
                key={session.id}
                className="p-6 rounded-[16px] shadow-hh-sm border-hh-border hover:shadow-hh-md transition-shadow cursor-pointer"
              >
                <Badge variant="outline" className="mb-3">
                  {session.topic}
                </Badge>
                <h3 className="text-hh-text mb-3">{session.title}</h3>
                <div className="space-y-2 text-[14px] leading-[20px] mb-4">
                  <div className="flex items-center gap-2 text-hh-muted">
                    <Calendar className="w-4 h-4" />
                    {session.date}
                  </div>
                  <div className="flex items-center gap-2 text-hh-muted">
                    <Clock className="w-4 h-4" />
                    {session.duration}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => {
                    setSelectedRecording(session);
                    setRecordingModalOpen(true);
                  }}
                >
                  <Video className="w-4 h-4" /> Bekijk opname
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Epic Sales Flow Sheet - Mobile Drawer */}
      <Sheet open={flowDrawerOpen} onOpenChange={setFlowDrawerOpen}>
        <SheetContent
          side="left"
          className="w-full sm:max-w-md p-0 overflow-y-auto"
        >
          <EPICSalesFlow
            currentPhase="fase4"
            currentStep="objection-handling"
            onClose={() => setFlowDrawerOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Recording Playback Modal */}
      <Dialog open={recordingModalOpen} onOpenChange={setRecordingModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[24px] leading-[32px]">
              {selectedRecording?.title}
            </DialogTitle>
            <DialogDescription className="text-[14px] leading-[20px] text-hh-muted">
              {selectedRecording?.date} • {selectedRecording?.duration}
            </DialogDescription>
          </DialogHeader>
          {selectedRecording && (
            <div className="space-y-6">
              {/* Video Player */}
              <div className="w-full bg-hh-ink rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-white text-[16px] leading-[24px]">
                    Video Player Placeholder - {selectedRecording.duration}
                  </p>
                </div>
              </div>

              {/* Key Takeaways */}
              <div>
                <h3 className="text-[18px] leading-[24px] text-hh-text mb-3">
                  Key Takeaways
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-hh-primary flex-shrink-0 mt-1" />
                    <span className="text-[14px] leading-[20px] text-hh-muted">
                      Onderscheid tussen echte bezwaren en pseudo-bezwaren
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-hh-primary flex-shrink-0 mt-1" />
                    <span className="text-[14px] leading-[20px] text-hh-muted">
                      3-stappen methode voor bezwaarhandeling
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-hh-primary flex-shrink-0 mt-1" />
                    <span className="text-[14px] leading-[20px] text-hh-muted">
                      Hoe om te gaan met prijsbezwaren in B2B
                    </span>
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <Button onClick={() => navigate?.("coaching")} className="w-full">
                Oefen deze technieken
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}