import React, { useState, useMemo } from "react";
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
  Upload,
  FileAudio,
  Clock,
  TrendingUp,
  MoreVertical,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mic,
  MessageSquare,
  BarChart2,
  Video,
} from "lucide-react";

import { getCodeBadgeColors } from "../../utils/phaseColors";
import { TranscriptDialog, TranscriptSession } from "./TranscriptDialog";

interface AnalysisProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

interface ConversationRecord {
  id: number;
  title: string;
  date: string;
  duration: string;
  type: "call" | "meeting" | "demo";
  prospect: string;
  techniquesUsed: string[];
  score: number;
  status: "analyzed" | "pending" | "processing";
}

export function Analysis({ navigate, isAdmin }: AnalysisProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<string | null>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [transcriptDialogOpen, setTranscriptDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TranscriptSession | null>(null);

  const openTranscript = (conv: ConversationRecord) => {
    const session: TranscriptSession = {
      id: conv.id,
      techniqueNumber: conv.techniquesUsed[0] || "1.1",
      techniqueName: conv.title,
      type: conv.type === "call" ? "Audio" : conv.type === "meeting" ? "Video" : "Demo",
      date: conv.date,
      duration: conv.duration,
      score: conv.score,
      quality: conv.score >= 80 ? "excellent" : conv.score >= 60 ? "good" : "needs-improvement",
      transcript: [
        { speaker: "AI Coach", time: "00:00", text: "Goedemiddag! Vandaag gaan we oefenen met verkooptechnieken. Ben je er klaar voor?" },
        { speaker: "Gebruiker", time: "00:05", text: "Ja, ik ben er klaar voor. Ik wil graag beter worden in het stellen van de juiste vragen." },
        { speaker: "AI Coach", time: "00:12", text: "Perfect! Stel je voor: je belt een prospect die interesse heeft getoond in jullie software. Begin maar met je opening." },
        { speaker: "Gebruiker", time: "00:25", text: "Goedemiddag, u spreekt met Jan. Ik bel naar aanleiding van uw interesse in onze oplossing. Heeft u even tijd?" },
        { speaker: "AI Coach", time: "00:35", text: "Goede opening! Je hebt direct de reden van je call benoemd. Probeer nu een open vraag te stellen om de situatie te verkennen." },
      ],
      strengths: ["Duidelijke opening", "Goede timing", "Actief luisteren"],
      improvements: ["Meer doorvragen", "Betere afsluiting"],
    };
    setSelectedSession(session);
    setTranscriptDialogOpen(true);
  };

  const conversations: ConversationRecord[] = useMemo(() => {
    const seedFromString = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs(hash);
    };

    const types: ("call" | "meeting" | "demo")[] = ["call", "meeting", "demo"];
    const prospects = ["Acme Corp", "TechStart BV", "Digital Solutions", "CloudFirst", "DataDrive NL", "InnovateTech"];
    const techniqueOptions = [
      ["2.1.1", "2.1.2", "2.1.6"],
      ["4.2.4", "4.1"],
      ["1.1", "2.1.1"],
      ["3.1", "3.2"],
    ];

    const conversationTemplates = [
      { title: "Discovery call met", status: "analyzed" },
      { title: "Demo presentatie voor", status: "analyzed" },
      { title: "Follow-up meeting", status: "pending" },
      { title: "Eerste contact met", status: "processing" },
      { title: "Contract bespreking", status: "analyzed" },
      { title: "Needs assessment", status: "analyzed" },
    ];

    return conversationTemplates.map((template, idx) => {
      const seed = seedFromString(template.title + idx);
      const prospect = prospects[seed % prospects.length];
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - (seed % 30));

      return {
        id: idx + 1,
        title: `${template.title} ${prospect}`,
        date: baseDate.toISOString().split('T')[0],
        duration: `${15 + (seed % 45)}:${String(seed % 60).padStart(2, '0')}`,
        type: types[seed % types.length],
        prospect,
        techniquesUsed: techniqueOptions[seed % techniqueOptions.length],
        score: 50 + (seed % 45),
        status: template.status as "analyzed" | "pending" | "processing",
      };
    });
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortField !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-hh-muted/40" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-hh-ink" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-hh-ink" />
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "analyzed":
        return (
          <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[11px]">
            Geanalyseerd
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-hh-muted/10 text-hh-muted border-hh-muted/20 text-[11px]">
            Wachtend
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-hh-warn/10 text-hh-warn border-hh-warn/20 text-[11px]">
            Verwerken...
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Mic className="w-4 h-4 text-[#4F7396]" />;
      case "meeting":
        return <Video className="w-4 h-4 text-[#4F7396]" />;
      case "demo":
        return <MessageSquare className="w-4 h-4 text-[#4F7396]" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "call":
        return "AI Audio";
      case "meeting":
        return "AI Video";
      case "demo":
        return "AI Chat";
      default:
        return type;
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = searchQuery === "" ||
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.prospect.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || conv.type === typeFilter;
    const matchesStatus = statusFilter === "all" || conv.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (!sortField) return 0;
    let comparison = 0;
    switch (sortField) {
      case "date":
        comparison = a.date.localeCompare(b.date);
        break;
      case "score":
        comparison = a.score - b.score;
        break;
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
      case "duration":
        const durationA = parseInt(a.duration.split(':')[0]) * 60 + parseInt(a.duration.split(':')[1]);
        const durationB = parseInt(b.duration.split(':')[0]) * 60 + parseInt(b.duration.split(':')[1]);
        comparison = durationA - durationB;
        break;
      case "technieken":
        comparison = (a.techniquesUsed[0] || "").localeCompare(b.techniquesUsed[0] || "");
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const analyzedCount = conversations.filter(c => c.status === "analyzed").length;
  const avgScore = Math.round(
    conversations.filter(c => c.status === "analyzed").reduce((sum, c) => sum + c.score, 0) / analyzedCount || 0
  );
  const totalDuration = conversations.reduce((sum, c) => {
    const [mins] = c.duration.split(':').map(Number);
    return sum + mins;
  }, 0);

  // Always use AppLayout for user view - this is the USER analysis page
  // Admin view has its own separate component (AdminUploadManagement)
  const Layout = AppLayout;
  const layoutProps = { currentPage: "analysis", navigate, isAdmin };

  return (
    <Layout {...layoutProps}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              Gespreksanalyse
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              Upload gesprekken voor AI-analyse en feedback
            </p>
          </div>
          <Button 
            className="gap-2 bg-hh-primary hover:bg-hh-primary/90 text-white"
            onClick={() => navigate?.("upload-analysis")}
          >
            <Upload className="w-4 h-4 text-white" />
            Analyseer gesprek
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#4F7396]/10 flex items-center justify-center">
                <FileAudio className="w-4 h-4 sm:w-5 sm:h-5 text-[#4F7396]" />
              </div>
              <Badge
                variant="outline"
                style={{ backgroundColor: 'transparent', color: '#10B981', borderColor: '#10B981' }}
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 border"
              >
                +3
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Totaal Analyses
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-emerald-600">
              {conversations.length}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
              </div>
              <Badge
                variant="outline"
                style={{ backgroundColor: 'transparent', color: '#10B981', borderColor: '#10B981' }}
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 border"
              >
                100%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Geanalyseerd
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-emerald-600">
              {analyzedCount}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Totale Duur
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-orange-600">
              {Math.floor(totalDuration / 60)}u {totalDuration % 60}m
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-sky-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500" />
              </div>
              <Badge
                variant="outline"
                style={{ backgroundColor: 'transparent', color: '#10B981', borderColor: '#10B981' }}
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 border"
              >
                +7%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Gem. Score
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-emerald-600">
              {avgScore}%
            </p>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek analyses..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Types</SelectItem>
                <SelectItem value="call">Telefoongesprek</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="demo">Demo</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="analyzed">Geanalyseerd</SelectItem>
                <SelectItem value="processing">Verwerken</SelectItem>
                <SelectItem value="pending">Wachtend</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                style={viewMode === "list" ? { backgroundColor: '#4F7396', color: 'white' } : {}}
                className={viewMode !== "list" ? "text-hh-muted hover:text-hh-text hover:bg-hh-ui-50" : "hover:opacity-90"}
              >
                <List className="w-4 h-4 text-current" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                style={viewMode === "grid" ? { backgroundColor: '#4F7396', color: 'white' } : {}}
                className={viewMode !== "grid" ? "text-hh-muted hover:text-hh-text hover:bg-hh-ui-50" : "hover:opacity-90"}
              >
                <LayoutGrid className="w-4 h-4 text-current" />
              </Button>
            </div>
          </div>
        </Card>

        {/* List View - Copied from Admin, adapted for User */}
        {viewMode === "list" && (
          <Card className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-hh-ui-50 border-b border-hh-border">
                  <tr>
                    <th 
                      className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text w-[80px] cursor-pointer hover:bg-hh-ui-100 transition-colors"
                      onClick={() => handleSort("technieken")}
                    >
                      <div className="flex items-center gap-2">
                        #
                        <SortIcon column="technieken" />
                      </div>
                    </th>
                    <th 
                      className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center gap-2">
                        Techniek
                        <SortIcon column="title" />
                      </div>
                    </th>
                    <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                      Technieken
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
                  {sortedConversations.map((conv, index) => (
                    <tr
                      key={conv.id}
                      onClick={() => openTranscript(conv)}
                      className={`border-b border-hh-border last:border-0 hover:bg-hh-ui-50 transition-colors cursor-pointer ${
                        index % 2 === 0 ? "bg-white" : "bg-hh-ui-50/30"
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span 
                          style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[12px] font-semibold">
                          {conv.techniquesUsed[0] || "1.1"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-[14px] leading-[20px] text-hh-text font-medium">
                          {conv.title}
                        </p>
                        <p className="text-[12px] leading-[16px] text-hh-muted">
                          {conv.prospect}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {conv.techniquesUsed.map((tech, idx) => (
                            <span
                              key={idx}
                              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}
                              className="inline-flex items-center justify-center min-w-[40px] h-10 px-2 rounded-full text-[11px] font-mono font-semibold"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-[14px] leading-[20px] text-hh-text">
                          {getTypeIcon(conv.type)}
                          <span className="text-[13px]">{getTypeLabel(conv.type)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[14px] leading-[20px] font-medium ${
                            conv.score >= 80
                              ? "text-hh-success"
                              : conv.score >= 70
                              ? "text-blue-600"
                              : "text-hh-warn"
                          }`}
                        >
                          {conv.score}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[14px] leading-[20px] text-hh-text">
                        {conv.duration}
                      </td>
                      <td className="py-3 px-4 text-[13px] leading-[18px] text-hh-muted">
                        {conv.date}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4 text-hh-muted" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openTranscript(conv)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Bekijk Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedConversations.length === 0 && (
              <div className="p-12 text-center">
                <FileAudio className="w-12 h-12 text-hh-muted mx-auto mb-4" />
                <p className="text-[16px] leading-[24px] text-hh-muted">
                  Geen analyses gevonden met deze filters
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedConversations.map((conv) => (
              <Card
                key={conv.id}
                className="p-5 rounded-[16px] shadow-hh-sm border-hh-border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openTranscript(conv)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(conv.type)}
                    <span className="text-[12px] text-hh-muted">{getTypeLabel(conv.type)}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <MoreVertical className="w-4 h-4 text-hh-muted" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openTranscript(conv)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Bekijk details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="text-[16px] font-medium text-hh-text mb-1">
                  {conv.title}
                </h3>
                <p className="text-[12px] text-hh-muted mb-3">
                  {conv.prospect}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {conv.techniquesUsed.map((tech, idx) => (
                    <span
                      key={idx}
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}
                              className="inline-flex items-center justify-center min-w-[40px] h-10 px-2 rounded-full text-[11px] font-mono font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[13px] text-hh-muted pt-3 border-t border-hh-border">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#4F7396]" />
                    {conv.duration}
                  </div>
                  {conv.status === "analyzed" ? (
                    <span
                      className={`font-medium ${
                        conv.score >= 80
                          ? "text-hh-success"
                          : conv.score >= 70
                          ? "text-blue-600"
                          : "text-hh-warn"
                      }`}
                    >
                      {conv.score}%
                    </span>
                  ) : (
                    <span className="text-hh-muted">—</span>
                  )}
                  <span>{conv.date}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <TranscriptDialog
        open={transcriptDialogOpen}
        onOpenChange={setTranscriptDialogOpen}
        session={selectedSession}
        isAdmin={isAdmin}
      />
    </Layout>
  );
}
