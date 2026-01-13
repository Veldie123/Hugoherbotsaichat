import { useState } from "react";
import { AppLayout } from "./AppLayout";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
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
  Video,
  Play,
  Award,
  TrendingUp,
  MoreVertical,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  MessageCircle,
  Radio,
} from "lucide-react";
import { TechniqueDetailsDialog } from "./TechniqueDetailsDialog";
import { getAllTechnieken, getTechniekenByFase } from "../../data/technieken-service";

interface TechniqueLibraryProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

export function TechniqueLibrary({ navigate, isAdmin }: TechniqueLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFase, setActiveFase] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"code" | "name" | "videos" | "roleplays" | "score">("code");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedTechnique, setSelectedTechnique] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleSort = (column: "code" | "name" | "videos" | "roleplays" | "score") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder(column === "code" || column === "name" ? "asc" : "desc");
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-hh-muted/40" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-hh-ink" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-hh-ink" />
    );
  };

  const generateMockStats = (techniqueNumber: string) => {
    const hash = techniqueNumber.split('.').reduce((acc, num) => acc + parseInt(num || '0', 10), 0);
    return {
      videos: 2 + (hash % 4),
      roleplays: 150 + (hash * 50),
      avgScore: 74 + (hash % 15),
      completion: 79 + (hash % 13),
      status: "Actief" as const,
    };
  };

  const technieken = {
    "fase-0": getTechniekenByFase("0").map((tech, idx) => ({
      id: idx + 1,
      code: tech.nummer,
      name: tech.naam,
      ...generateMockStats(tech.nummer),
    })),
    "fase-1": getTechniekenByFase("1").map((tech, idx) => ({
      id: idx + 10,
      code: tech.nummer,
      name: tech.naam,
      ...generateMockStats(tech.nummer),
    })),
    "fase-2": getTechniekenByFase("2").map((tech, idx) => ({
      id: idx + 20,
      code: tech.nummer,
      name: tech.naam,
      ...generateMockStats(tech.nummer),
    })),
    "fase-3": getTechniekenByFase("3").map((tech, idx) => ({
      id: idx + 40,
      code: tech.nummer,
      name: tech.naam,
      ...generateMockStats(tech.nummer),
    })),
    "fase-4": getTechniekenByFase("4").map((tech, idx) => ({
      id: idx + 50,
      code: tech.nummer,
      name: tech.naam,
      ...generateMockStats(tech.nummer),
    })),
  };

  const getFaseLabel = (fase: string) => {
    switch (fase) {
      case "fase-0":
        return "Fase 0 - Pre-contactfase";
      case "fase-1":
        return "Fase 1 - Openingsfase";
      case "fase-2":
        return "Fase 2 - Ontdekkingsfase";
      case "fase-3":
        return "Fase 3 - Aanbevelingsfase";
      case "fase-4":
        return "Fase 4 - Beslissingsfase";
      default:
        return fase;
    }
  };

  const currentTechnieken = activeFase === "all" ? Object.values(technieken).flat() : technieken[activeFase as keyof typeof technieken];

  const sortedTechnieken = [...currentTechnieken].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "code":
        comparison = a.code.localeCompare(b.code);
        break;
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "videos":
        comparison = a.videos - b.videos;
        break;
      case "roleplays":
        comparison = a.roleplays - b.roleplays;
        break;
      case "score":
        comparison = a.avgScore - b.avgScore;
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const filteredTechnieken = sortedTechnieken.filter((tech) =>
    tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tech.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout currentPage="techniques" navigate={navigate} isAdmin={isAdmin}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              Technieken & Role-Plays
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              25 EPIC technieken verdeeld over 4 fases
            </p>
          </div>
        </div>

        {/* Overall Stats - Exact zoals AdminDashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-hh-ink" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +5%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Totaal Technieken
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {Object.values(technieken).reduce((sum, arr) => sum + arr.length, 0)}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-hh-ink" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +12%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Totaal Video's
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {Object.values(technieken).reduce((sum, arr) => sum + arr.reduce((s, t) => s + t.videos, 0), 0)}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600/10 flex items-center justify-center">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +18%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Totaal Role-Plays
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {Object.values(technieken).reduce((sum, arr) => sum + arr.reduce((s, t) => s + t.roleplays, 0), 0)}
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
                +4.2%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Gem. Score
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {Math.round(
                Object.values(technieken).reduce((sum, arr) =>
                  sum + arr.reduce((s, t) => s + t.avgScore, 0), 0
                ) / Object.values(technieken).reduce((sum, arr) => sum + arr.length, 0)
              )}%
            </p>
          </Card>
        </div>

        {/* Search & Filters Card */}
        <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col gap-4">
            {/* Top Row: Search + View Toggle */}
            <div className="flex gap-3 items-center">
              {/* Search - Full width */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
                <Input
                  placeholder="Zoek technieken..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* View Toggle - Right Side */}
              <div className="flex gap-1 flex-shrink-0">
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

            {/* Fase Tabs + Type Filter Row */}
            <div className="flex gap-2 items-center overflow-x-auto pb-1">
              {/* Fase 1 & 2 buttons */}
              <button
                onClick={() => setActiveFase(activeFase === "fase-1" ? "all" : "fase-1")}
                className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-full text-[14px] font-medium transition-all ${
                  activeFase === "fase-1"
                    ? "bg-hh-ink text-white"
                    : "bg-hh-ui-50 text-hh-text hover:bg-hh-ui-100"
                }`}
              >
                Fase 1 ({technieken["fase-1"].length})
              </button>
              <button
                onClick={() => setActiveFase(activeFase === "fase-2" ? "all" : "fase-2")}
                className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-full text-[14px] font-medium transition-all ${
                  activeFase === "fase-2"
                    ? "bg-hh-ink text-white"
                    : "bg-hh-ui-50 text-hh-text hover:bg-hh-ui-100"
                }`}
              >
                Fase 2 ({technieken["fase-2"].length})
              </button>
              
              {/* Divider */}
              <div className="w-px h-8 bg-hh-border flex-shrink-0" />
              
              {/* Fase 3 & 4 + Type Filter */}
              <button
                onClick={() => setActiveFase(activeFase === "fase-3" ? "all" : "fase-3")}
                className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-full text-[14px] font-medium transition-all ${
                  activeFase === "fase-3"
                    ? "bg-hh-ink text-white"
                    : "bg-hh-ui-50 text-hh-text hover:bg-hh-ui-100"
                }`}
              >
                Fase 3 ({technieken["fase-3"].length})
              </button>
              <button
                onClick={() => setActiveFase(activeFase === "fase-4" ? "all" : "fase-4")}
                className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-full text-[14px] font-medium transition-all ${
                  activeFase === "fase-4"
                    ? "bg-hh-ink text-white"
                    : "bg-hh-ui-50 text-hh-text hover:bg-hh-ui-100"
                }`}
              >
                Fase 4 ({technieken["fase-4"].length})
              </button>
              
              {/* Type Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] flex-shrink-0">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="hugo-ai">Hugo AI Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* List View - Table */}
        {viewMode === "list" && (
          <Card className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-hh-ui-50">
                  <tr>
                    <th 
                      className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold cursor-pointer hover:bg-hh-ui-100 transition-colors select-none"
                      onClick={() => handleSort("code")}
                    >
                      <div className="flex items-center gap-1.5">
                        Code
                        <SortIcon column="code" />
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold cursor-pointer hover:bg-hh-ui-100 transition-colors select-none"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1.5">
                        Techniek
                        <SortIcon column="name" />
                      </div>
                    </th>
                    <th 
                      className="text-right py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold cursor-pointer hover:bg-hh-ui-100 transition-colors select-none"
                      onClick={() => handleSort("videos")}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        Video's
                        <SortIcon column="videos" />
                      </div>
                    </th>
                    <th 
                      className="text-right py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold cursor-pointer hover:bg-hh-ui-100 transition-colors select-none"
                      onClick={() => handleSort("roleplays")}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        Role-Plays
                        <SortIcon column="roleplays" />
                      </div>
                    </th>
                    <th 
                      className="text-right py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold cursor-pointer hover:bg-hh-ui-100 transition-colors select-none"
                      onClick={() => handleSort("score")}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        Avg Score
                        <SortIcon column="score" />
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold">
                      Completion
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
                  {filteredTechnieken.map((techniek, index) => (
                    <tr
                      key={`${techniek.code}-${techniek.id}`}
                      className={`border-t border-hh-border hover:bg-hh-ui-50 transition-colors cursor-pointer ${
                        index % 2 === 0 ? "bg-white" : "bg-hh-ui-50/30"
                      }`}
                      onClick={() => {
                        const allTech = getAllTechnieken();
                        const fullTech = allTech.find(t => t.nummer === techniek.code);
                        if (fullTech) {
                          setSelectedTechnique({
                            nummer: fullTech.nummer,
                            naam: fullTech.naam,
                            fase: fullTech.fase,
                            tags: fullTech.tags,
                            doel: fullTech.doel,
                            hoe: fullTech.hoe,
                            stappenplan: fullTech.stappenplan,
                            voorbeeld: fullTech.voorbeeld,
                          });
                          setIsEditMode(false);
                          setDetailsDialogOpen(true);
                        }
                      }}
                    >
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-mono bg-hh-ink/10 text-hh-ink border-hh-ink/20"
                        >
                          {techniek.code}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-[14px] leading-[20px] text-hh-text font-medium">
                          {techniek.name}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 text-[14px] leading-[20px] text-hh-text">
                          <Video className="w-3.5 h-3.5 text-hh-ink" />
                          {techniek.videos}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 text-[14px] leading-[20px] text-hh-text">
                          <Play className="w-3.5 h-3.5 text-blue-600" />
                          {techniek.roleplays}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[14px] leading-[20px] text-hh-success font-medium">
                          {techniek.avgScore}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[14px] leading-[20px] text-hh-text">
                          {techniek.completion}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[11px]">
                          {techniek.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate?.("videos")}>
                              <Video className="w-4 h-4 mr-2" />
                              Bekijk Video's
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate?.("roleplay")}>
                              <Play className="w-4 h-4 mr-2" />
                              Bekijk Role-Plays
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const allTech = getAllTechnieken();
                                const fullTech = allTech.find(t => t.nummer === techniek.code);
                                if (fullTech) {
                                  setSelectedTechnique({
                                    nummer: fullTech.nummer,
                                    naam: fullTech.naam,
                                    fase: fullTech.fase,
                                    tags: fullTech.tags,
                                    doel: fullTech.doel,
                                    hoe: fullTech.hoe,
                                    stappenplan: fullTech.stappenplan,
                                    voorbeeld: fullTech.voorbeeld,
                                  });
                                  setIsEditMode(false);
                                  setDetailsDialogOpen(true);
                                }
                              }}
                            >
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
        )}

        {/* Card View - Grid */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTechnieken.map((techniek) => (
              <Card 
                key={`${techniek.code}-${techniek.id}`} 
                className="p-4 rounded-[16px] shadow-hh-sm border-hh-border hover:shadow-hh-md transition-shadow cursor-pointer"
                onClick={() => {
                  const allTech = getAllTechnieken();
                  const fullTech = allTech.find(t => t.nummer === techniek.code);
                  if (fullTech) {
                    setSelectedTechnique({
                      nummer: fullTech.nummer,
                      naam: fullTech.naam,
                      fase: fullTech.fase,
                      tags: fullTech.tags,
                      doel: fullTech.doel,
                      hoe: fullTech.hoe,
                      stappenplan: fullTech.stappenplan,
                      voorbeeld: fullTech.voorbeeld,
                    });
                    setDetailsDialogOpen(true);
                  }
                }}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <Badge
                      variant="outline"
                      className="text-[11px] font-mono bg-hh-ink/10 text-hh-ink border-hh-ink/20"
                    >
                      {techniek.code}
                    </Badge>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate?.("videos")}>
                            <Video className="w-4 h-4 mr-2" />
                            Bekijk Video's
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate?.("roleplay")}>
                            <Play className="w-4 h-4 mr-2" />
                            Bekijk Role-Plays
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const allTech = getAllTechnieken();
                              const fullTech = allTech.find(t => t.nummer === techniek.code);
                              if (fullTech) {
                                setSelectedTechnique(fullTech);
                                setIsEditMode(false);
                                setDetailsDialogOpen(true);
                              }
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Bekijk details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-[14px] leading-[20px] text-hh-text font-medium">
                    {techniek.name}
                  </h3>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 text-[13px] text-hh-muted">
                      <Video className="w-3.5 h-3.5 text-hh-ink" />
                      <span>{techniek.videos} video's</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] text-hh-muted">
                      <Play className="w-3.5 h-3.5 text-blue-600" />
                      <span>{techniek.roleplays}</span>
                    </div>
                  </div>

                  {/* Progress & Score */}
                  <div className="space-y-2 pt-2 border-t border-hh-border">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-hh-muted">Avg Score</span>
                      <span className="text-hh-success font-medium">{techniek.avgScore}%</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-hh-muted">Completion</span>
                      <span className="text-hh-text">{techniek.completion}%</span>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-[11px] h-8 bg-hh-ink/5 text-hh-ink border-hh-ink/20 hover:bg-hh-ink hover:text-white"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        localStorage.setItem('selectedTechniek', techniek.code);
                        navigate?.("talk-to-hugo");
                      }}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-[11px] h-8 bg-hh-ink/5 text-hh-ink border-hh-ink/20 hover:bg-hh-ink hover:text-white"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        localStorage.setItem('filterTechniek', techniek.code);
                        navigate?.("videos");
                      }}
                    >
                      <Video className="w-3.5 h-3.5" />
                      Video
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-[11px] h-8 bg-hh-ink/5 text-hh-ink border-hh-ink/20 hover:bg-hh-ink hover:text-white"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        localStorage.setItem('filterTechniek', techniek.code);
                        navigate?.("live");
                      }}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      Webinar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Technique Details Dialog */}
      {selectedTechnique && (
        <TechniqueDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          technique={{
            id: selectedTechnique.nummer,
            number: selectedTechnique.nummer,
            naam: selectedTechnique.naam,
            fase: selectedTechnique.fase || "1",
            tags: selectedTechnique.tags,
            doel: selectedTechnique.doel,
            hoe: selectedTechnique.hoe,
            stappenplan: selectedTechnique.stappenplan,
            voorbeeld: selectedTechnique.voorbeeld,
          }}
          isEditable={false}
          onSave={() => {
            setDetailsDialogOpen(false);
          }}
        />
      )}
    </AppLayout>
  );
}
