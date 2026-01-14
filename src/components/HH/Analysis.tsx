import { useState, useMemo } from "react";
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
} from "lucide-react";

import { getCodeBadgeColors } from "../../utils/phaseColors";

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
  const [sortField, setSortField] = useState<"date" | "score" | null>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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

  const handleSort = (field: "date" | "score") => {
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "call":
        return (
          <Badge variant="outline" className="text-[11px] bg-hh-ink/10 text-hh-ink border-hh-ink/20">
            Telefoongesprek
          </Badge>
        );
      case "meeting":
        return (
          <Badge variant="outline" className="text-[11px] bg-hh-primary/10 text-hh-primary border-hh-primary/20">
            Meeting
          </Badge>
        );
      case "demo":
        return (
          <Badge variant="outline" className="text-[11px] bg-purple-500/10 text-purple-500 border-purple-500/20">
            Demo
          </Badge>
        );
      default:
        return null;
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

  return (
    <AppLayout currentPage="analysis" navigate={navigate} isAdmin={isAdmin}>
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
            <Upload className="w-4 h-4" />
            Analyseer gesprek
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                <FileAudio className="w-4 h-4 sm:w-5 sm:h-5 text-hh-ink" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +3
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Totaal Analyses
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {conversations.length}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-success/10 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-hh-success" />
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Geanalyseerd
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {analyzedCount}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-hh-primary" />
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Totale Duur
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {Math.floor(totalDuration / 60)}u {totalDuration % 60}m
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-success/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-hh-success" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +7%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Gem. Score
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
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
                className={`${
                  viewMode === "list" 
                    ? "bg-hh-ink text-white hover:bg-hh-ink/90" 
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
                    ? "bg-hh-ink text-white hover:bg-hh-ink/90" 
                    : "text-hh-muted hover:text-hh-text hover:bg-hh-ui-50"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* List View */}
        {viewMode === "list" && (
          <Card className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-hh-ui-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold">
                      Gesprek
                    </th>
                    <th className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold">
                      Type
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold cursor-pointer hover:bg-hh-ui-100 transition-colors select-none"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center gap-1.5">
                        Datum
                        <SortIcon column="date" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold">
                      Duur
                    </th>
                    <th className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold">
                      Technieken
                    </th>
                    <th 
                      className="text-right py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold cursor-pointer hover:bg-hh-ui-100 transition-colors select-none"
                      onClick={() => handleSort("score")}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        Score
                        <SortIcon column="score" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedConversations.map((conv, index) => (
                    <tr
                      key={conv.id}
                      className={`border-t border-hh-border hover:bg-hh-ui-50 transition-colors cursor-pointer ${
                        index % 2 === 0 ? "bg-white" : "bg-hh-ui-50/30"
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-hh-ink/10 flex items-center justify-center flex-shrink-0">
                            {conv.type === "call" ? (
                              <Mic className="w-4 h-4 text-hh-ink" />
                            ) : (
                              <MessageSquare className="w-4 h-4 text-hh-ink" />
                            )}
                          </div>
                          <p className="text-[14px] leading-[20px] text-hh-text font-medium">
                            {conv.title}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getTypeBadge(conv.type)}
                      </td>
                      <td className="py-3 px-4 text-[14px] text-hh-muted">
                        {new Date(conv.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-3 px-4 text-[14px] text-hh-muted">
                        {conv.duration}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {conv.techniquesUsed.slice(0, 2).map((tech, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className={`text-[10px] font-mono ${getCodeBadgeColors(tech)}`}
                            >
                              {tech}
                            </Badge>
                          ))}
                          {conv.techniquesUsed.length > 2 && (
                            <Badge variant="outline" className="text-[10px] bg-hh-ui-50 text-hh-muted border-hh-border">
                              +{conv.techniquesUsed.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {conv.status === "analyzed" ? (
                          <span className="text-[14px] leading-[20px] text-hh-success font-medium">
                            {conv.score}%
                          </span>
                        ) : (
                          <span className="text-[14px] text-hh-muted">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(conv.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate?.("analysis-results")}>
                              <Eye className="w-4 h-4 mr-2" />
                              Bekijk analyse
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate?.("library")}>
                              <BarChart2 className="w-4 h-4 mr-2" />
                              Bekijk technieken
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
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedConversations.map((conv) => (
              <Card
                key={conv.id}
                className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden hover:shadow-hh-md hover:border-hh-ink/30 transition-all"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    {getTypeBadge(conv.type)}
                    {getStatusBadge(conv.status)}
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-hh-ink/10 flex items-center justify-center flex-shrink-0">
                      {conv.type === "call" ? (
                        <Mic className="w-5 h-5 text-hh-ink" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-hh-ink" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-[16px] leading-[24px] text-hh-text font-semibold">
                        {conv.title}
                      </h3>
                      <p className="text-[13px] text-hh-muted">
                        {new Date(conv.date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[13px] text-hh-muted">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{conv.duration}</span>
                    </div>
                    {conv.status === "analyzed" && (
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-hh-success" />
                        <span className="text-hh-success font-medium">{conv.score}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {conv.techniquesUsed.map((tech, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className={`text-[10px] font-mono ${getCodeBadgeColors(tech)}`}
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-hh-border">
                    <Button 
                      className="w-full bg-hh-ink hover:bg-hh-ink/90" 
                      size="sm"
                      onClick={() => navigate?.("analysis-results")}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Bekijk analyse
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
