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
} from "lucide-react";

interface HugoAIOverviewProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

type SessionType = "ai-audio" | "ai-video" | "ai-chat";

interface Session {
  id: number;
  techniek: string;
  type: SessionType;
  score: number;
  quality: "excellent" | "good" | "needs-improvement";
  duration: string;
  date: string;
}

const sessions: Session[] = [
  {
    id: 1,
    techniek: "2.1.1 Feitgerichte vragen",
    type: "ai-audio",
    score: 88,
    quality: "excellent",
    duration: "18:45",
    date: "2025-01-15",
  },
  {
    id: 2,
    techniek: "4.2.4 Bezwaren behandelen",
    type: "ai-video",
    score: 76,
    quality: "good",
    duration: "24:12",
    date: "2025-01-15",
  },
  {
    id: 3,
    techniek: "1.2 Gentleman's Agreement",
    type: "ai-chat",
    score: 68,
    quality: "needs-improvement",
    duration: "12:30",
    date: "2025-01-14",
  },
];

const getTypeIcon = (type: SessionType) => {
  switch (type) {
    case "ai-audio":
      return <Mic className="w-4 h-4" />;
    case "ai-video":
      return <Video className="w-4 h-4" />;
    case "ai-chat":
      return <MessageSquare className="w-4 h-4" />;
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

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      searchQuery === "" ||
      session.techniek.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === "all" || session.type === filterType;
    const matchesQuality =
      filterQuality === "all" || session.quality === filterQuality;
    return matchesSearch && matchesType && matchesQuality;
  });

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
            className="bg-hh-ink hover:bg-hh-ink/90 text-white gap-2"
            onClick={() => navigate?.("talk-to-hugo")}
          >
            <Sparkles className="w-4 h-4" />
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
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink font-medium">
              6
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
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink font-medium">
              3
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
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink font-medium">
              80%
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
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink font-medium">
              1
            </p>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek sessies, technieken..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Alle Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Types</SelectItem>
                <SelectItem value="ai-audio">AI Audio</SelectItem>
                <SelectItem value="ai-video">AI Video</SelectItem>
                <SelectItem value="ai-chat">AI Chat</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterQuality} onValueChange={setFilterQuality}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Alle Kwaliteit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kwaliteit</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className={`h-8 w-8 ${viewMode === "list" ? "bg-hh-ink text-white hover:bg-hh-ink/90" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className={`h-8 w-8 ${viewMode === "grid" ? "bg-hh-ink text-white hover:bg-hh-ink/90" : ""}`}
                onClick={() => setViewMode("grid")}
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
                    <th className="text-left p-4 text-[13px] font-medium text-hh-muted">#</th>
                    <th className="text-left p-4 text-[13px] font-medium text-hh-muted">Techniek</th>
                    <th className="text-left p-4 text-[13px] font-medium text-hh-muted">Type</th>
                    <th className="text-left p-4 text-[13px] font-medium text-hh-muted">Score</th>
                    <th className="text-left p-4 text-[13px] font-medium text-hh-muted">Duur</th>
                    <th className="text-left p-4 text-[13px] font-medium text-hh-muted">Datum</th>
                    <th className="text-left p-4 text-[13px] font-medium text-hh-muted">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-hh-border last:border-0 hover:bg-hh-ui-50/50 transition-colors"
                    >
                      <td className="p-4 text-[14px] text-hh-text">{session.id}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-[14px] text-hh-text font-medium">
                            {session.techniek}
                          </span>
                          {getQualityBadge(session.quality)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-hh-ink/10 flex items-center justify-center">
                            {getTypeIcon(session.type)}
                          </div>
                          <span className="text-[14px] text-hh-text">
                            {getTypeLabel(session.type)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[14px] font-medium ${
                            session.score >= 80
                              ? "text-hh-success"
                              : session.score >= 70
                              ? "text-hh-ink"
                              : "text-hh-warning"
                          }`}
                        >
                          {session.score}%
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-hh-muted">
                          <Clock className="w-4 h-4" />
                          <span className="text-[14px]">{session.duration}</span>
                        </div>
                      </td>
                      <td className="p-4 text-[14px] text-hh-muted">{session.date}</td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
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
                className="p-5 rounded-[16px] shadow-hh-sm border-hh-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                    {getTypeIcon(session.type)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Bekijk details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="text-[16px] font-medium text-hh-text mb-2">
                  {session.techniek}
                </h3>

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
                        ? "text-hh-ink"
                        : "text-hh-warning"
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
    </AppLayout>
  );
}
