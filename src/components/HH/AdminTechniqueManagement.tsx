import { useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { CustomCheckbox } from "../ui/custom-checkbox";
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
  Plus,
  List,
  LayoutGrid,
  Video,
  Play,
  Award,
  TrendingUp,
  MoreVertical,
  Edit,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  CheckCircle2,
  MessageCircle,
  Radio,
} from "lucide-react";
import { TechniqueDetailsDialog } from "./TechniqueDetailsDialog";
import { getTechniekenByFase, getAllTechnieken } from "../../data/technieken-service";

interface AdminTechniqueManagementProps {
  navigate?: (page: string) => void;
}

export function AdminTechniqueManagement({ navigate }: AdminTechniqueManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFase, setActiveFase] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"code" | "name" | "videos" | "roleplays" | "score">("code");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedTechnique, setSelectedTechnique] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const selectionMode = selectedIds.length > 0;

  // Handle column click for sorting
  const handleSort = (column: "code" | "name" | "videos" | "roleplays" | "score") => {
    if (sortBy === column) {
      // Toggle order if same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // New column - default to desc for numbers, asc for text
      setSortBy(column);
      setSortOrder(column === "code" || column === "name" ? "asc" : "desc");
    }
  };

  const toggleSelectId = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTechnieken.length && filteredTechnieken.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTechnieken.map((t) => t.id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Weet je zeker dat je ${selectedIds.length} technieken wilt verwijderen?`)) {
      console.log("Delete techniques:", selectedIds);
      setSelectedIds([]);
    }
  };

  // Render sort icon
  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-hh-muted/40" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-hh-accent" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-hh-accent" />
    );
  };

  // Generate mock statistics for each technique
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

  // Convert EPIC techniques to admin format
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

  // Sort logic
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

  // Filter by search
  const filteredTechnieken = sortedTechnieken.filter((tech) =>
    tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tech.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout currentPage="admin-techniques" navigate={navigate}>
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
          <Button
            size="sm"
            className="gap-2 bg-red-600 hover:bg-red-700"
            onClick={() => {
              // TODO: Open create technique modal
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden lg:inline">Nieuwe Techniek</span>
            <span className="lg:hidden">Nieuw</span>
          </Button>
        </div>

        {/* Overall Stats - Exact zoals AdminDashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600/10 flex items-center justify-center">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600/10 flex items-center justify-center">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
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

        {/* Search, View Toggle & Filters Card */}
        <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search - Left Side */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek technieken..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters - Middle */}
            <Select value={activeFase} onValueChange={setActiveFase}>
              <SelectTrigger className="w-full lg:w-[220px]">
                <SelectValue placeholder="Alle Fases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Fases</SelectItem>
                <SelectItem value="fase-0">Fase 0 - Pre-contactfase</SelectItem>
                <SelectItem value="fase-1">Fase 1 - Openingsfase</SelectItem>
                <SelectItem value="fase-2">Fase 2 - Ontdekkingsfase</SelectItem>
                <SelectItem value="fase-3">Fase 3 - Aanbevelingsfase</SelectItem>
                <SelectItem value="fase-4">Fase 4 - Beslissingsfase</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="actief">Actief</SelectItem>
                <SelectItem value="concept">Concept</SelectItem>
                <SelectItem value="archief">Archief</SelectItem>
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

        {/* List View - Table */}
        {viewMode === "list" && (
          <Card className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-hh-ui-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold w-12">
                      {selectionMode && (
                        <CustomCheckbox
                          checked={selectedIds.length === filteredTechnieken.length && filteredTechnieken.length > 0}
                          onChange={toggleSelectAll}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold cursor-pointer hover:bg-hh-ui-100 transition-colors select-none"
                      onClick={() => handleSort("code")}
                    >
                      <div className="flex items-center gap-1.5">
                        #
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
                      onMouseEnter={() => setHoveredRow(techniek.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`border-t border-hh-border hover:bg-hh-ui-50 transition-colors cursor-pointer ${
                        index % 2 === 0 ? "bg-white" : "bg-hh-ui-50/30"
                      }`}
                    >
                      <td className="py-3 px-4 w-12">
                        {(selectionMode || hoveredRow === techniek.id) ? (
                          <CustomCheckbox
                            checked={selectedIds.includes(techniek.id)}
                            onChange={() => toggleSelectId(techniek.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : <div className="w-4 h-4" />}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-mono bg-purple-600/10 text-purple-600 border-purple-600/20"
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
                          <Video className="w-3.5 h-3.5 text-purple-600" />
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
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate?.("admin-videos")}>
                              <Video className="w-4 h-4 mr-2" />
                              Bekijk Video's
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate?.("admin-transcripts")}>
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
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Info
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
                      className="text-[11px] font-mono bg-purple-600/10 text-purple-600 border-purple-600/20"
                    >
                      {techniek.code}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate?.("admin-videos")}>
                          <Video className="w-4 h-4 mr-2" />
                          Bekijk Video's
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate?.("admin-transcripts")}>
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
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Info
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Title */}
                  <h3 className="text-[14px] leading-[20px] text-hh-text font-medium">
                    {techniek.name}
                  </h3>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 text-[13px] text-hh-muted">
                      <Video className="w-3.5 h-3.5 text-purple-600" />
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
                      className="flex-1 gap-1.5 text-[11px] h-8 bg-purple-600/5 text-purple-600 border-purple-600/20 hover:bg-purple-600 hover:text-white"
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
                      className="flex-1 gap-1.5 text-[11px] h-8 bg-purple-600/5 text-purple-600 border-purple-600/20 hover:bg-purple-600 hover:text-white"
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
                      className="flex-1 gap-1.5 text-[11px] h-8 bg-purple-600/5 text-purple-600 border-purple-600/20 hover:bg-purple-600 hover:text-white"
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
            wat: selectedTechnique.wat,
            waarom: selectedTechnique.waarom,
            wanneer: selectedTechnique.wanneer,
            verkoper_intentie: selectedTechnique.verkoper_intentie,
            context_requirements: selectedTechnique.context_requirements,
            stappenplan: selectedTechnique.stappenplan,
            voorbeeld: selectedTechnique.voorbeeld,
          }}
          isEditable={true}
          onSave={(updatedTechnique) => {
            console.log("Technique updated:", updatedTechnique);
            // TODO: Save to backend
            setDetailsDialogOpen(false);
          }}
        />
      )}
    </AdminLayout>
  );
}