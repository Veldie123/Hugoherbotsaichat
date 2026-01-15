import { useState } from "react";
import { AppLayout } from "./AppLayout";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Search,
  List,
  LayoutGrid,
  Mic,
  Video,
  MessageSquare,
  Clock,
  TrendingUp,
  MoreVertical,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Upload,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { getFaseNaam } from "../../data/technieken-service";
import { getCodeBadgeColors } from "../../utils/phaseColors";
import { TranscriptDialog, TranscriptSession } from "./TranscriptDialog";

interface HugoAIOverviewProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

type SessionType = "ai-audio" | "ai-video" | "ai-chat" | "upload-audio";

interface Session {
  id: number;
  nummer: string;
  naam: string;
  fase: string;
  type: SessionType;
  score: number;
  quality: "excellent" | "good" | "needs-improvement";
  duration: string;
  date: string;
  time?: string;
  transcript: Array<{ speaker: string; time: string; text: string }>;
}

const sessions: Session[] = [
  {
    id: 1,
    nummer: "2.1.1",
    naam: "Feitgerichte vragen",
    fase: "2",
    type: "ai-audio",
    score: 88,
    quality: "excellent",
    duration: "18:45",
    date: "2025-01-15",
    time: "14:23",
    transcript: [
      { speaker: "AI Coach", time: "00:00", text: "Goedemiddag! Vandaag gaan we oefenen met feitgerichte vragen. Ben je er klaar voor?" },
      { speaker: "Jan", time: "00:05", text: "Ja, ik ben er klaar voor. Ik wil graag beter worden in het stellen van de juiste vragen." },
      { speaker: "AI Coach", time: "00:12", text: "Perfect! Stel je voor: je belt een prospect die interesse heeft getoond in jullie software. Begin maar met je opening." },
      { speaker: "Jan", time: "00:20", text: "Goedemiddag, met Jan van TechCorp. Ik bel naar aanleiding van uw interesse in onze CRM oplossing. Klopt het dat jullie momenteel uitdagingen ervaren met klantendata?" },
      { speaker: "AI Coach", time: "00:35", text: "Goede opening! Je gaat direct in op hun situatie. Ja, dat klopt. We hebben inderdaad moeite met het centraliseren van klantinformatie." },
    ],
  },
  {
    id: 2,
    nummer: "4.2.4",
    naam: "Bezwaren behandelen",
    fase: "4",
    type: "ai-video",
    score: 76,
    quality: "good",
    duration: "24:12",
    date: "2025-01-15",
    time: "10:45",
    transcript: [
      { speaker: "AI Coach", time: "00:00", text: "Vandaag oefenen we met bezwaar afhandeling. Ik zal de rol spelen van een sceptische klant. Klaar?" },
      { speaker: "Sarah", time: "00:06", text: "Ja, laten we beginnen." },
      { speaker: "AI Coach", time: "00:08", text: "Jullie prijs is veel te hoog vergeleken met de concurrent. Waarom zou ik voor jullie kiezen?" },
      { speaker: "Sarah", time: "00:15", text: "Ik begrijp uw bezorgdheid over de prijs. Mag ik vragen met welke concurrent u ons vergelijkt?" },
    ],
  },
  {
    id: 3,
    nummer: "1.2",
    naam: "Gentleman's Agreement",
    fase: "1",
    type: "ai-chat",
    score: 68,
    quality: "needs-improvement",
    duration: "12:30",
    date: "2025-01-14",
    time: "16:20",
    transcript: [
      { speaker: "AI Coach", time: "00:00", text: "Laten we oefenen met het openen van een gesprek en het gentleman's agreement. Begin maar!" },
      { speaker: "Mark", time: "00:05", text: "Hoi, ik ben Mark. Kan ik u iets vertellen over ons product?" },
      { speaker: "AI Coach", time: "00:10", text: "Dat klopt niet helemaal. Probeer eerst een gentleman's agreement te maken voordat je begint met pitchen." },
    ],
  },
  {
    id: 4,
    nummer: "2.1.2",
    naam: "Meningsgerichte vragen",
    fase: "2",
    type: "upload-audio",
    score: 82,
    quality: "excellent",
    duration: "32:15",
    date: "2025-01-15",
    time: "14:23",
    transcript: [
      { speaker: "AI Coach", time: "00:00", text: "Vandaag analyseren we je gesprek over meningsgerichte vragen." },
      { speaker: "Lisa", time: "00:08", text: "Wat vindt u van de huidige manier waarop jullie team leads opvolgt?" },
      { speaker: "AI Coach", time: "00:15", text: "Goede meningsgerichte vraag! Je vraagt naar hun mening, niet alleen naar feiten." },
    ],
  },
];

const getTypeIcon = (type: SessionType) => {
  switch (type) {
    case "ai-audio":
      return <Mic className="w-4 h-4 text-[#5B7B9A]" />;
    case "ai-video":
      return <Video className="w-4 h-4 text-[#5B7B9A]" />;
    case "ai-chat":
      return <MessageSquare className="w-4 h-4 text-[#5B7B9A]" />;
    case "upload-audio":
      return <Upload className="w-4 h-4 text-[#5B7B9A]" />;
  }
};

const getTypeLabel = (type: SessionType) => {
  switch (type) {
    case "ai-audio":
      return "AI Audio";
    case "ai-video":
      return "AI Video";
    case "ai-chat":
      return "AI Chat";
    case "upload-audio":
      return "Rollenspel Upload (Audio)";
  }
};

const getQualityBadge = (quality: "excellent" | "good" | "needs-improvement") => {
  switch (quality) {
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
      return (
        <Badge className="bg-hh-warning/10 text-hh-warning border-hh-warning/20 hover:bg-hh-warning/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Needs Improvement
        </Badge>
      );
  }
};

export function HugoAIOverview({ navigate, isAdmin }: HugoAIOverviewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterQuality, setFilterQuality] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [transcriptSession, setTranscriptSession] = useState<TranscriptSession | null>(null);
  const [transcriptDialogOpen, setTranscriptDialogOpen] = useState(false);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const openTranscript = (session: Session) => {
    const transcriptData: TranscriptSession = {
      id: session.id,
      techniqueNumber: session.nummer,
      techniqueName: session.naam,
      type: getTypeLabel(session.type),
      date: session.date,
      time: session.time,
      duration: session.duration,
      score: session.score,
      quality: session.quality,
      transcript: session.transcript,
    };
    setTranscriptSession(transcriptData);
    setTranscriptDialogOpen(true);
  };

  const filteredSessions = sessions
    .filter((session) => {
      const matchesSearch =
        searchQuery === "" ||
        session.naam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.nummer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        filterType === "all" || session.type === filterType;
      const matchesQuality =
        filterQuality === "all" || session.quality === filterQuality;
      return matchesSearch && matchesType && matchesQuality;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      
      if (sortField === "score") {
        return sortDirection === "asc" ? a.score - b.score : b.score - a.score;
      }
      if (sortField === "date") {
        const dateA = new Date(`${a.date} ${a.time || "00:00"}`).getTime();
        const dateB = new Date(`${b.date} ${b.time || "00:00"}`).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      if (sortField === "duration") {
        const durA = parseInt(a.duration.replace(":", "")) || 0;
        const durB = parseInt(b.duration.replace(":", "")) || 0;
        return sortDirection === "asc" ? durA - durB : durB - durA;
      }
      const valA = String((a as any)[sortField] || "").toLowerCase();
      const valB = String((b as any)[sortField] || "").toLowerCase();
      const cmp = valA.localeCompare(valB);
      return sortDirection === "asc" ? cmp : -cmp;
    });

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 text-hh-muted" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="w-3 h-3 ml-1 text-hh-ink" />
      : <ArrowDown className="w-3 h-3 ml-1 text-hh-ink" />;
  };

  return (
    <AppLayout currentPage="hugo-overview" navigate={navigate} isAdmin={isAdmin}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              Hugo a.i.
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              Alle training sessies: AI roleplay, uploads en live analyses
            </p>
          </div>
          <Button
            className="bg-[#5B7B9A] hover:bg-[#4A6A89] text-white gap-2"
            onClick={() => navigate?.("talk-to-hugo")}
          >
            <MessageSquare className="w-4 h-4" />
            Talk to Hugo a.i.
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-hh-ink" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +15%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Total Sessies
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {sessions.length}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-hh-success" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +8%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Excellent Quality
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {sessions.filter(s => s.quality === "excellent").length}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-hh-ink" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +2.3%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Gem. Score
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length)}%
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-hh-warning" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-warning/10 text-hh-warning border-hh-warning/20"
              >
                -5%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Needs Improvement
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {sessions.filter(s => s.quality === "needs-improvement").length}
            </p>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="p-4 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek sessies, technieken..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Types</SelectItem>
                <SelectItem value="ai-audio">AI Audio</SelectItem>
                <SelectItem value="ai-video">AI Video</SelectItem>
                <SelectItem value="ai-chat">AI Chat</SelectItem>
                <SelectItem value="upload-audio">Upload Audio</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterQuality} onValueChange={setFilterQuality}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Kwaliteit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kwaliteit</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-[#5B7B9A] hover:bg-[#4A6A89]" : ""}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-[#5B7B9A] hover:bg-[#4A6A89]" : ""}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Sessions Table */}
        {viewMode === "list" ? (
          <Card className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hh-border bg-hh-ui-50">
                    <th 
                      className="text-left py-3 px-4 text-[13px] font-semibold text-hh-text w-[70px] cursor-pointer hover:bg-hh-ui-100 transition-colors"
                      onClick={() => handleSort("nummer")}
                    >
                      <div className="flex items-center">
                        #
                        <SortIcon field="nummer" />
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                      onClick={() => handleSort("naam")}
                    >
                      <div className="flex items-center">
                        Techniek
                        <SortIcon field="naam" />
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-[13px] font-semibold text-hh-text w-[120px] cursor-pointer hover:bg-hh-ui-100 transition-colors"
                      onClick={() => handleSort("type")}
                    >
                      <div className="flex items-center">
                        Type
                        <SortIcon field="type" />
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-[13px] font-semibold text-hh-text w-[80px] cursor-pointer hover:bg-hh-ui-100 transition-colors"
                      onClick={() => handleSort("score")}
                    >
                      <div className="flex items-center">
                        Score
                        <SortIcon field="score" />
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-[13px] font-semibold text-hh-text w-[80px] cursor-pointer hover:bg-hh-ui-100 transition-colors"
                      onClick={() => handleSort("duration")}
                    >
                      <div className="flex items-center">
                        Duur
                        <SortIcon field="duration" />
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-[13px] font-semibold text-hh-text w-[110px] cursor-pointer hover:bg-hh-ui-100 transition-colors"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center">
                        Datum
                        <SortIcon field="date" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-[13px] font-semibold text-hh-text w-[60px]">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-hh-border last:border-0 hover:bg-hh-ui-50/50 transition-colors cursor-pointer"
                      onClick={() => openTranscript(session)}
                    >
                      {/* Technique Number Badge - colored by phase */}
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`${getCodeBadgeColors(session.nummer)} text-[11px] font-mono font-semibold px-2.5 py-1`}>
                          {session.nummer}
                        </Badge>
                      </td>
                      
                      {/* Technique Name + Fase */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[14px] text-hh-text font-medium truncate">
                            {session.naam}
                          </span>
                          <span className="text-[12px] text-hh-muted">
                            {getFaseNaam(session.fase)}
                          </span>
                        </div>
                      </td>
                      
                      {/* Type with Icon */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(session.type)}
                          <span className="text-[14px] text-hh-text">
                            {getTypeLabel(session.type)}
                          </span>
                        </div>
                      </td>
                      
                      {/* Score - colored */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[14px] font-medium ${
                            session.score >= 80
                              ? "text-hh-success"
                              : session.score >= 70
                              ? "text-blue-600"
                              : "text-hh-warn"
                          }`}
                        >
                          {session.score}%
                        </span>
                      </td>
                      
                      {/* Duration */}
                      <td className="py-3 px-4">
                        <span className="text-[14px] text-hh-text">{session.duration}</span>
                      </td>
                      
                      {/* Date */}
                      <td className="py-3 px-4 text-[13px] text-hh-muted">
                        {session.date}
                      </td>
                      
                      {/* Actions */}
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openTranscript(session)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Bekijk details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => (
              <Card
                key={session.id}
                className="p-5 rounded-[16px] shadow-hh-sm border-hh-border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openTranscript(session)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`${getCodeBadgeColors(session.nummer)} text-[11px] font-mono font-semibold px-2.5 py-1`}>
                      {session.nummer}
                    </Badge>
                    <div className="w-10 h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                      {getTypeIcon(session.type)}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e: Event) => { e.stopPropagation(); openTranscript(session); }}>
                        <Eye className="w-4 h-4 mr-2" />
                        Bekijk details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="text-[16px] font-medium text-hh-text mb-1">
                  {session.naam}
                </h3>
                <p className="text-[12px] text-hh-muted mb-3">
                  {getFaseNaam(session.fase)}
                </p>

                <div className="flex items-center gap-2 mb-4">
                  {getQualityBadge(session.quality)}
                  <Badge variant="outline" className="text-[11px]">
                    {getTypeLabel(session.type)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[13px] text-hh-muted">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {session.duration}
                  </div>
                  <span
                    className={`font-medium ${
                      session.score >= 80
                        ? "text-hh-success"
                        : session.score >= 70
                        ? "text-blue-600"
                        : "text-hh-warn"
                    }`}
                  >
                    {session.score}%
                  </span>
                  <span>{session.date}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Shared Transcript Dialog */}
      <TranscriptDialog
        open={transcriptDialogOpen}
        onOpenChange={setTranscriptDialogOpen}
        session={transcriptSession}
        isAdmin={isAdmin}
      />
    </AppLayout>
  );
}
