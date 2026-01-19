import { AdminLayout } from "./AdminLayout";
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Flag,
  Trash2,
  PlayCircle,
  Users,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
  Mic,
  Video,
  FileAudio,
  Play,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Code,
  ChevronRight,
  ChevronDown,
  List,
  LayoutGrid,
  Settings,
} from "lucide-react";
import { SessionDebugPanel } from "./SessionDebugPanel";
import { CustomCheckbox } from "../ui/custom-checkbox";

interface AdminSessionsProps {
  navigate?: (page: string) => void;
}

type SessionType = "ai-audio" | "ai-video" | "ai-chat" | "upload-audio" | "upload-video" | "live-analysis";

interface Session {
  id: string;
  user: string;
  userEmail: string;
  workspace?: string;
  title?: string;
  techniek: string;
  fase: string;
  type: SessionType;
  duration: string;
  score: number;
  quality: "excellent" | "good" | "needs-improvement";
  date: string;
  flagged: boolean;
  fileSize?: string;
  uploadDate?: string;
  transcript: Array<{ speaker: string; time: string; text: string }>;
  feedback: {
    strengths: string[];
    improvements: string[];
  };
  techniqueScores?: Array<{ technique: string; name: string; score: number; count: number }>;
  insights?: {
    strengths: string[];
    improvements: string[];
  };
}

export function AdminSessions({ navigate }: AdminSessionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterQuality, setFilterQuality] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [transcriptDialogOpen, setTranscriptDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const selectionMode = selectedIds.length > 0;
  const [expandedDebug, setExpandedDebug] = useState<string | null>(null);
  const [techniqueValidation, setTechniqueValidation] = useState<Record<string, boolean | null>>({});
  const [showFeedbackInput, setShowFeedbackInput] = useState<Record<string, boolean>>({});
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchSessions() {
      try {
        setLoading(true);
        const response = await fetch('/api/sessions');
        if (!response.ok) throw new Error('Failed to fetch sessions');
        const data = await response.json();
        
        const mappedSessions: Session[] = data.sessions.map((s: any) => {
          const createdDate = s.createdAt ? new Date(s.createdAt) : new Date();
          return {
            id: s.id,
            user: s.userId || 'Onbekend',
            userEmail: `${s.userId || 'user'}@example.com`,
            workspace: 'HugoHerbots',
            techniek: `${s.techniqueNummer || s.techniqueId} - ${s.techniqueName || 'Techniek'}`,
            fase: getFaseLabel(s.fase),
            type: 'ai-chat' as SessionType,
            duration: s.duration || '0:00',
            score: s.score || 0,
            quality: s.quality || 'needs-improvement',
            date: createdDate.toLocaleString('nl-NL'),
            flagged: false,
            transcript: s.transcript || [],
            feedback: {
              strengths: [],
              improvements: []
            }
          };
        });
        
        setSessions(mappedSessions);
      } catch (err: any) {
        console.error('Error fetching sessions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSessions();
  }, []);
  
  function getFaseLabel(fase: number | string): string {
    const faseNum = typeof fase === 'string' ? parseInt(fase) : fase;
    switch (faseNum) {
      case 1: return 'Openingsfase';
      case 2: return 'Ontdekkingsfase';
      case 3: return 'Presentatiefase';
      case 4: return 'Beslissingsfase';
      default: return 'Onbekend';
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortField !== column) {
      return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    );
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSessions.length && filteredSessions.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSessions.map((s) => s.id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Weet je zeker dat je ${selectedIds.length} sessies wilt verwijderen?`)) {
      console.log("Delete sessions:", selectedIds);
      setSelectedIds([]);
    }
  };

  // Statistics
  const stats = {
    totalSessions: sessions.length,
    avgScore: sessions.length > 0 ? Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length) : 0,
    excellentCount: sessions.filter(s => s.quality === "excellent").length,
    needsWorkCount: sessions.filter(s => s.quality === "needs-improvement").length,
  };

  const getTypeIcon = (type: SessionType) => {
    switch (type) {
      case "ai-audio":
        return <Mic className="w-4 h-4 text-purple-600" />;
      case "ai-video":
        return <Video className="w-4 h-4 text-purple-600" />;
      case "ai-chat":
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case "upload-audio":
        return <FileAudio className="w-4 h-4 text-blue-600" />;
      case "upload-video":
        return <Video className="w-4 h-4 text-blue-600" />;
      case "live-analysis":
        return <Sparkles className="w-4 h-4 text-hh-ocean-blue animate-pulse" />;
      default:
        return <Play className="w-4 h-4" />;
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
      case "upload-video":
        return "Rollenspel Upload (Video)";
      case "live-analysis":
        return "Live Analyse";
      default:
        return type;
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case "excellent":
        return (
          <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[11px]">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Excellent
          </Badge>
        );
      case "good":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[11px]">
            <ThumbsUp className="w-3 h-3 mr-1" />
            Good
          </Badge>
        );
      case "needs-improvement":
        return (
          <Badge className="bg-hh-warn/10 text-hh-warn border-hh-warn/20 text-[11px]">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Needs Work
          </Badge>
        );
      default:
        return null;
    }
  };

  const viewTranscript = (session: Session) => {
    setSelectedSession(session);
    setTranscriptDialogOpen(true);
    // Reset debug states when opening new transcript
    setExpandedDebug(null);
    setTechniqueValidation({});
    setShowFeedbackInput({});
    setFeedbackText({});
  };

  const toggleDebug = (lineId: string) => {
    setExpandedDebug(expandedDebug === lineId ? null : lineId);
  };

  const handleValidateTechnique = (lineId: string, isValid: boolean) => {
    setTechniqueValidation((prev) => ({ ...prev, [lineId]: isValid }));
    if (isValid) {
      setShowFeedbackInput((prev) => ({ ...prev, [lineId]: false }));
      setFeedbackText((prev) => ({ ...prev, [lineId]: "" }));
    } else {
      setShowFeedbackInput((prev) => ({ ...prev, [lineId]: true }));
    }
  };

  const handleSubmitFeedback = (lineId: string) => {
    const feedback = feedbackText[lineId];
    if (feedback?.trim()) {
      console.log(`Feedback for line ${lineId}:`, feedback);
      setShowFeedbackInput((prev) => ({ ...prev, [lineId]: false }));
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.techniek.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.fase.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.title && session.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || session.type === filterType;
    const matchesQuality = filterQuality === "all" || session.quality === filterQuality;
    return matchesSearch && matchesType && matchesQuality;
  }).sort((a, b) => {
    if (!sortField) return 0;
    let comparison = 0;
    switch (sortField) {
      case "user":
        comparison = a.user.localeCompare(b.user);
        break;
      case "score":
        comparison = a.score - b.score;
        break;
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case "techniek":
        comparison = a.techniek.localeCompare(b.techniek);
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
      case "duration":
        const durationA = parseInt(a.duration.split(':')[0]) * 60 + parseInt(a.duration.split(':')[1]);
        const durationB = parseInt(b.duration.split(':')[0]) * 60 + parseInt(b.duration.split(':')[1]);
        comparison = durationA - durationB;
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  if (loading) {
    return (
      <AdminLayout currentPage="admin-sessions" navigate={navigate}>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-hh-muted">Sessies laden...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout currentPage="admin-sessions" navigate={navigate}>
        <div className="p-6">
          <Card className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-hh-warn mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Fout bij laden</h2>
            <p className="text-hh-muted">{error}</p>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="admin-sessions" navigate={navigate}>
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
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => navigate?.("admin-config-review")}
            >
              <Settings className="w-4 h-4" />
              Config Review
            </Button>
            <Button 
              className="gap-2 bg-red-600 hover:bg-red-700"
              onClick={() => navigate?.("admin-chat-expert")}
            >
              <Sparkles className="w-4 h-4" />
              Chat Expert Mode
            </Button>
          </div>
        </div>

        {/* Statistics Cards - Exact zoals AdminDashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600/10 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
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
              {stats.totalSessions}
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
              {stats.excellentCount}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
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
              {stats.avgScore}%
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-warn/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-hh-warn" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-error/10 text-hh-error border-hh-error/20"
              >
                -5%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Needs Improvement
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {stats.needsWorkCount}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek sessies, gebruikers, technieken..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full lg:w-[220px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Types</SelectItem>
                <SelectItem value="ai-audio">AI Audio</SelectItem>
                <SelectItem value="ai-video">AI Video</SelectItem>
                <SelectItem value="ai-chat">AI Chat</SelectItem>
                <SelectItem value="upload-audio">Rollenspel Upload (Audio)</SelectItem>
                <SelectItem value="upload-video">Rollenspel Upload (Video)</SelectItem>
                <SelectItem value="live-analysis">Live Analyse</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterQuality} onValueChange={setFilterQuality}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Kwaliteit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kwaliteit</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="needs-improvement">Needs Work</SelectItem>
              </SelectContent>
            </Select>
            
            {/* View Toggle - Right Side */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`${
                  viewMode === "list" 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "text-hh-muted hover:text-hh-text hover:bg-hh-ui-50"
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${
                  viewMode === "grid" 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "text-hh-muted hover:text-hh-text hover:bg-hh-ui-50"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectionMode && selectedIds.length > 0 && (
          <Card className="p-4 rounded-[16px] shadow-hh-sm border-hh-border bg-purple-50 border-purple-200">
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-hh-text">
                <span className="font-semibold">{selectedIds.length}</span> sessies geselecteerd
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                >
                  Annuleer
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Verwijder
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Sessions List/Grid */}
        {viewMode === "list" ? (
          <Card className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-hh-ui-50 border-b border-hh-border">
                <tr>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text w-[40px]">
                    {selectionMode && (
                      <CustomCheckbox
                        checked={selectedIds.length === filteredSessions.length && filteredSessions.length > 0}
                        onChange={toggleSelectAll}
                      />
                    )}
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text w-[80px] cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("techniek")}
                  >
                    <div className="flex items-center gap-2">
                      #
                      <SortIcon column="techniek" />
                    </div>
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("techniek")}
                  >
                    <div className="flex items-center gap-2">
                      Techniek
                      <SortIcon column="techniek" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("user")}
                  >
                    <div className="flex items-center gap-2">
                      Gebruiker
                      <SortIcon column="user" />
                    </div>
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center gap-2">
                      Type
                      <SortIcon column="type" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("score")}
                  >
                    <div className="flex items-center gap-2">
                      Score
                      <SortIcon column="score" />
                    </div>
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("duration")}
                  >
                    <div className="flex items-center gap-2">
                      Duur
                      <SortIcon column="duration" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-2">
                      Datum
                      <SortIcon column="date" />
                    </div>
                  </th>
                  <th className="text-right px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session, index) => (
                  <tr
                    key={session.id}
                    onClick={() => viewTranscript(session)}
                    onMouseEnter={() => setHoveredRow(session.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={`border-b border-hh-border last:border-0 hover:bg-hh-ui-50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-white" : "bg-hh-ui-50/30"
                    }`}
                  >
                    <td className="py-3 px-4 w-[40px]" onClick={(e) => e.stopPropagation()}>
                      {(selectionMode || hoveredRow === session.id) ? (
                        <CustomCheckbox
                          checked={selectedIds.includes(session.id)}
                          onChange={() => toggleSelection(session.id)}
                        />
                      ) : <div className="w-4 h-4" />}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-purple-600/10 text-purple-600 border-purple-600/20 text-[11px] font-mono">
                        {session.techniek.split(' - ')[0]}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-[14px] leading-[20px] text-hh-text font-medium">
                        {session.techniek.split(' - ')[1] || session.techniek}
                      </p>
                      <p className="text-[12px] leading-[16px] text-hh-muted">
                        {session.fase}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-purple-600/10 text-purple-600 text-[11px]">
                            {session.user
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-[14px] leading-[20px] text-hh-text font-medium flex items-center gap-2">
                            {session.title || session.user}
                            {session.flagged && (
                              <Flag className="w-3.5 h-3.5 text-red-600" />
                            )}
                          </p>
                          <p className="text-[12px] leading-[16px] text-hh-muted">
                            {session.user} • {session.workspace}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-[14px] leading-[20px] text-hh-text">
                        {getTypeIcon(session.type)}
                        <span className="text-[13px]">{getTypeLabel(session.type)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[14px] leading-[20px] font-medium ${
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
                    <td className="py-3 px-4 text-[14px] leading-[20px] text-hh-text">
                      {session.duration}
                    </td>
                    <td className="py-3 px-4 text-[13px] leading-[18px] text-hh-muted">
                      {session.date}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewTranscript(session)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Bekijk Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={session.flagged ? "text-hh-success" : "text-red-600"}
                          >
                            <Flag className="w-4 h-4 mr-2" />
                            {session.flagged ? "Unflag" : "Flag for Review"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-hh-error">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Verwijder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSessions.length === 0 && (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-hh-muted mx-auto mb-4" />
              <p className="text-[16px] leading-[24px] text-hh-muted">
                Geen sessies gevonden met deze filters
              </p>
            </div>
          )}
        </Card>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => {
              const scoreColor = session.score >= 80
                ? "bg-hh-success/10 text-hh-success border-hh-success/20"
                : session.score >= 70
                ? "bg-blue-600/10 text-blue-600 border-blue-600/20"
                : "bg-hh-warn/10 text-hh-warn border-hh-warn/20";

              return (
                <Card
                  key={session.id}
                  className="p-5 rounded-[16px] shadow-hh-sm border-hh-border hover:shadow-hh-md transition-shadow cursor-pointer"
                  onClick={() => viewTranscript(session)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-purple-600/10 text-purple-600 font-semibold text-[12px]">
                          {session.user.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-hh-text truncate flex items-center gap-2">
                          {session.title || session.user}
                          {session.flagged && <Flag className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />}
                        </p>
                        <p className="text-[12px] text-hh-muted truncate">
                          {session.workspace}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Technique & Phase */}
                  <div className="space-y-2 mb-4">
                    <p className="text-[13px] font-medium text-hh-text truncate">
                      {session.techniek}
                    </p>
                    <p className="text-[12px] text-hh-muted">
                      {session.fase}
                    </p>
                  </div>

                  {/* Type */}
                  <div className="flex items-center gap-2 mb-4 text-[13px]">
                    {getTypeIcon(session.type)}
                    <span className="text-hh-muted">{getTypeLabel(session.type)}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-hh-border">
                    <div>
                      <p className="text-[11px] text-hh-muted mb-1">Score</p>
                      <Badge variant="outline" className={`text-[12px] font-semibold ${scoreColor}`}>
                        {session.score}%
                      </Badge>
                    </div>
                    <div>
                      <p className="text-[11px] text-hh-muted mb-1">Duur</p>
                      <p className="text-[13px] text-hh-text font-medium">{session.duration}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-hh-muted">{session.date}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); viewTranscript(session); }}>
                          <Eye className="w-4 h-4 mr-2" />
                          Bekijk Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => e.stopPropagation()}
                          className={session.flagged ? "text-hh-success" : "text-red-600"}
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          {session.flagged ? "Unflag" : "Flag for Review"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => e.stopPropagation()}
                          className="text-hh-error"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Verwijder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              );
            })}
            {filteredSessions.length === 0 && (
              <div className="col-span-full p-12 text-center">
                <MessageSquare className="w-12 h-12 text-hh-muted mx-auto mb-4" />
                <p className="text-[16px] leading-[24px] text-hh-muted">
                  Geen sessies gevonden met deze filters
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transcript Modal */}
      <Dialog open={transcriptDialogOpen} onOpenChange={setTranscriptDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedSession?.title || selectedSession?.user || "Session Details"}</span>
              {selectedSession && (
                <>
                  <Badge variant="outline" className="text-[11px]">
                    {selectedSession.techniek}
                  </Badge>
                  {getQualityBadge(selectedSession.quality)}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Bekijk de volledige transcript en details van de sessie
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-6">
              {/* Session Info */}
              <div className="flex items-center gap-4 text-[14px] leading-[20px] text-hh-muted">
                <span>{selectedSession.user}</span>
                <span>•</span>
                <span>{selectedSession.workspace}</span>
                <span>•</span>
                <span>{getTypeLabel(selectedSession.type)}</span>
                <span>•</span>
                <span>{selectedSession.date}</span>
              </div>

              {/* Overall Score (for uploads with detailed scores) */}
              {selectedSession.techniqueScores && (
                <Card className="p-6 border-red-600/20 bg-red-50/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[16px] leading-[24px] text-hh-text">
                      Overall Score
                    </h4>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-[48px] leading-[56px] text-red-600">
                      {selectedSession.score}
                    </span>
                    <span className="text-[24px] leading-[32px] text-hh-muted">
                      /100
                    </span>
                  </div>
                  <p className="text-[14px] leading-[20px] text-hh-muted">
                    {selectedSession.fase}
                  </p>
                </Card>
              )}

              {/* Technique Scores (for uploads) */}
              {selectedSession.techniqueScores && (
                <div>
                  <h4 className="text-[16px] leading-[24px] text-hh-text mb-3">
                    Techniek Scores
                  </h4>
                  <div className="space-y-3">
                    {selectedSession.techniqueScores.map((tech, idx) => (
                      <Card key={idx} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-[14px] leading-[20px] text-hh-text">
                              {tech.technique} - {tech.name}
                            </p>
                            <p className="text-[12px] leading-[16px] text-hh-muted">
                              {tech.count}x gebruikt
                            </p>
                          </div>
                          <div className="text-[18px] leading-[26px] text-purple-600">
                            {tech.score}%
                          </div>
                        </div>
                        <div className="w-full bg-hh-ui-100 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${tech.score}%` }}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Transcript */}
              <Card className="p-4 rounded-[16px] border-hh-border">
                <h3 className="text-[16px] leading-[22px] text-hh-text font-medium mb-3">
                  Transcript
                </h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {selectedSession.transcript.map((line, index) => {
                    const isAICoach = line.speaker === "AI Coach" || line.speaker.includes("Coach");
                    const lineId = `${selectedSession.id}-${index}`;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div
                          className={`flex gap-3 p-3 rounded-lg ${
                            isAICoach ? "bg-purple-50" : "bg-blue-50"
                          }`}
                        >
                          <div className="flex-shrink-0">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                isAICoach
                                  ? "bg-purple-600/10 text-purple-600 border-purple-600/20"
                                  : "bg-blue-600/10 text-blue-600 border-blue-600/20"
                              }`}
                            >
                              {line.time}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <p className="text-[13px] leading-[18px] font-medium text-hh-text mb-1">
                              {line.speaker}:
                            </p>
                            <p className="text-[14px] leading-[20px] text-hh-text">
                              {line.text}
                            </p>
                          </div>
                        </div>

                        {/* Debug toggle - only for AI Coach messages */}
                        {isAICoach && (
                          <div className="ml-11">
                            <button
                              onClick={() => toggleDebug(lineId)}
                              className="flex items-center gap-2 text-[12px] leading-[16px] text-hh-muted hover:text-hh-text transition-colors"
                            >
                              {expandedDebug === lineId ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                              Debug Info
                            </button>

                            {expandedDebug === lineId && (
                              <Card className="mt-2 p-4 border-2 border-dashed border-purple-200 bg-purple-50/30">
                                <div className="space-y-3 text-[13px] leading-[18px]">
                                  {/* Signaal - alleen voor AI Coach */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-hh-muted">Signaal:</span>
                                    <Badge className="bg-green-100 text-green-700 border-green-300">
                                      positief
                                    </Badge>
                                  </div>
                                </div>
                              </Card>
                            )}
                          </div>
                        )}

                        {/* Debug toggle - only for User/Verkoper messages */}
                        {!isAICoach && (
                          <div className="ml-11">
                            <button
                              onClick={() => toggleDebug(lineId)}
                              className="flex items-center gap-2 text-[12px] leading-[16px] text-hh-muted hover:text-hh-text transition-colors"
                            >
                              {expandedDebug === lineId ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                              Debug Info
                            </button>

                            {expandedDebug === lineId && (
                              <Card className="mt-2 p-4 border-2 border-dashed border-blue-200 bg-blue-50/30">
                                <div className="space-y-3 text-[13px] leading-[18px]">
                                  {/* Verwachte techniek met validation */}
                                  <div>
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <p className="text-[12px] text-hh-muted mb-1">Verwachte techniek:</p>
                                        <p className="text-hh-text font-medium">
                                          2.1.2 - Meningsgerichte vragen
                                        </p>
                                      </div>
                                      {!showFeedbackInput[lineId] && (
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className={`h-6 w-6 transition-all ${
                                              techniqueValidation[lineId] === true
                                                ? "bg-green-500 text-white hover:bg-green-600"
                                                : "hover:bg-green-100 hover:text-green-700"
                                            }`}
                                            onClick={() => handleValidateTechnique(lineId, true)}
                                          >
                                            <Check className="w-3.5 h-3.5" />
                                          </Button>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className={`h-6 w-6 transition-all ${
                                              techniqueValidation[lineId] === false
                                                ? "bg-red-500 text-white hover:bg-red-600"
                                                : "hover:bg-red-100 hover:text-red-700"
                                            }`}
                                            onClick={() => handleValidateTechnique(lineId, false)}
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                    {showFeedbackInput[lineId] && (
                                      <div className="space-y-2 mt-3">
                                        <Input
                                          placeholder="Waarom is de verwachte techniek incorrect?"
                                          value={feedbackText[lineId] || ""}
                                          onChange={(e) =>
                                            setFeedbackText((prev) => ({ ...prev, [lineId]: e.target.value }))
                                          }
                                          className="text-[13px] border-hh-border"
                                        />
                                        <div className="flex items-center gap-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 text-hh-muted hover:text-hh-text"
                                            onClick={() => {
                                              setShowFeedbackInput((prev) => ({ ...prev, [lineId]: false }));
                                              setTechniqueValidation((prev) => ({ ...prev, [lineId]: null }));
                                              setFeedbackText((prev) => ({ ...prev, [lineId]: "" }));
                                            }}
                                          >
                                            Annuleer
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                                            onClick={() => handleSubmitFeedback(lineId)}
                                            disabled={!feedbackText[lineId]?.trim()}
                                          >
                                            Verzend
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Gedetecteerde techniek met score */}
                                  <div className="pt-3 border-t border-blue-200">
                                    <p className="text-[12px] text-hh-muted mb-1">Gedetecteerde techniek:</p>
                                    <p className="text-hh-text font-medium">
                                      2.1.1 - Feitgerichte vragen
                                      <span className="ml-2 text-green-600 font-semibold">
                                        (+8)
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* AI Feedback */}
              <Card className="p-4 rounded-[16px] border-hh-border">
                <h3 className="text-[16px] leading-[22px] text-hh-text font-medium mb-3">
                  AI Feedback
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-[13px] leading-[18px] text-hh-success font-medium mb-2 flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4" />
                      Strengths:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedSession.feedback.strengths.map((item, i) => (
                        <li key={i} className="text-[14px] leading-[20px] text-hh-text">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[13px] leading-[18px] text-hh-warn font-medium mb-2 flex items-center gap-2">
                      <ThumbsDown className="w-4 h-4" />
                      Areas for Improvement:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedSession.feedback.improvements.map((item, i) => (
                        <li key={i} className="text-[14px] leading-[20px] text-hh-text">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2">
                  <Download className="w-4 h-4" />
                  Download Transcript
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 gap-2 ${
                    selectedSession.flagged
                      ? "text-hh-success border-hh-success"
                      : "text-red-600 border-red-600"
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  {selectedSession.flagged ? "Unflag Session" : "Flag for Review"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}