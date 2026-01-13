import { AppLayout } from "./AppLayout";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Search,
  Award,
  Video,
  Play,
  TrendingUp,
  List,
  LayoutGrid,
  MoreVertical,
  Eye,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { useState, useMemo } from "react";
import { 
  getAllTechnieken, 
  Techniek,
  getFaseNaam,
  getTechniekCount
} from "../../data/technieken-service";

interface TechniqueLibraryProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

type ViewMode = "list" | "grid";
type SortField = "code" | "name" | "videos" | "roleplays" | "score";
type SortOrder = "asc" | "desc";

interface TechniqueItem {
  id: number;
  code: string;
  name: string;
  fase: string;
  videos: number;
  roleplays: number;
  avgScore: number;
  completion: number;
  status: string;
}

export function TechniqueLibrary({ navigate, isAdmin }: TechniqueLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFase, setActiveFase] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortField, setSortField] = useState<SortField>("code");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueItem | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Memoize technique data from SSOT - prevent regeneration on every render
  const technieken = useMemo(() => {
    // Deterministic seed function based on string
    const seedFromString = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs(hash);
    };

    // Helper function to convert Techniek to TechniqueItem with deterministic values
    const toTechniqueItem = (t: Techniek, index: number): TechniqueItem => {
      const seed = seedFromString(t.nummer + t.naam);
      return {
        id: index,
        code: t.nummer,
        name: t.naam,
        fase: getFaseNaam(t.fase),
        videos: (seed % 5) + 1,
        roleplays: (seed % 400) + 100,
        avgScore: (seed % 20) + 70,
        completion: (seed % 40) + 60,
        status: "Actief",
      };
    };

    // Load all technieken from SSOT and filter by fase (excluding fase headers)
    const allTechnieken = getAllTechnieken().filter(t => !t.is_fase);
    
    const fase0Techniques = allTechnieken.filter(t => t.fase === "0");
    const fase1Techniques = allTechnieken.filter(t => t.fase === "1");
    const fase2Techniques = allTechnieken.filter(t => t.fase === "2");
    const fase3Techniques = allTechnieken.filter(t => t.fase === "3");
    const fase4Techniques = allTechnieken.filter(t => t.fase === "4");

    const result: Record<string, TechniqueItem[]> = {
      "fase-0": fase0Techniques.map((t, i) => toTechniqueItem(t, i + 1)),
      "fase-1": fase1Techniques.map((t, i) => toTechniqueItem(t, i + 10)),
      "fase-2": fase2Techniques.map((t, i) => toTechniqueItem(t, i + 20)),
      "fase-3": fase3Techniques.map((t, i) => toTechniqueItem(t, i + 50)),
      "fase-4": fase4Techniques.map((t, i) => toTechniqueItem(t, i + 70)),
    };
    return result;
  }, []);

  // Filter by fase
  const faseFilter = activeFase === "all" 
    ? Object.values(technieken).flat() 
    : technieken[activeFase] || [];

  // Filter by status
  const statusFiltered = statusFilter === "all" 
    ? faseFilter 
    : faseFilter.filter((t: TechniqueItem) => t.status.toLowerCase() === statusFilter);

  // Sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedTechnieken = [...statusFiltered].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
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

  const SortIcon = ({ column }: { column: SortField }) => {
    if (sortField !== column) {
      return <ArrowUpDown className="w-3 h-3 text-hh-muted" />;
    }
    return sortOrder === "asc" 
      ? <ArrowUp className="w-3 h-3 text-hh-primary" />
      : <ArrowDown className="w-3 h-3 text-hh-primary" />;
  };

  const viewTechniqueDetails = (tech: TechniqueItem) => {
    setSelectedTechnique(tech);
    setDetailsDialogOpen(true);
  };

  return (
    <AppLayout currentPage="library" navigate={navigate} isAdmin={isAdmin}>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header - No "Nieuwe Techniek" button for users */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] sm:text-[32px] leading-[36px] sm:leading-[40px] text-hh-text mb-2">
              E.P.I.C Technieken
            </h1>
            <p className="text-[14px] sm:text-[16px] leading-[20px] sm:leading-[24px] text-hh-muted">
              25 EPIC technieken verdeeld over 4 fases
            </p>
          </div>
        </div>

        {/* 4 KPI Cards - Steel Blue color scheme for user view */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-primary/10 flex items-center justify-center">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-hh-primary" />
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
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text">
              {Object.values(technieken).reduce((sum, arr) => sum + arr.length, 0)}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-primary/10 flex items-center justify-center">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-hh-primary" />
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
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text">
              {Object.values(technieken).reduce((sum, arr) => sum + arr.reduce((s, t) => s + t.videos, 0), 0)}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
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
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text">
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
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text">
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
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek technieken..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <Select value={activeFase} onValueChange={setActiveFase}>
              <SelectTrigger className="w-full sm:w-[200px]">
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
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="actief">Actief</SelectItem>
                <SelectItem value="concept">Concept</SelectItem>
              </SelectContent>
            </Select>
            
            {/* View Toggle - Steel Blue for user view */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`${
                  viewMode === "list" 
                    ? "bg-hh-primary text-white hover:bg-hh-primary/90" 
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
                    ? "bg-hh-primary text-white hover:bg-hh-primary/90" 
                    : "text-hh-muted hover:text-hh-text hover:bg-hh-ui-50"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* List View - Table (No checkboxes for user view) */}
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
                      onClick={() => viewTechniqueDetails(techniek)}
                    >
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-mono bg-hh-primary/10 text-hh-primary border-hh-primary/20"
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
                        <div className="flex items-center justify-end gap-1 text-hh-muted">
                          <Video className="w-3.5 h-3.5" />
                          <span className="text-[14px]">{techniek.videos}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 text-hh-muted">
                          <Play className="w-3.5 h-3.5" />
                          <span className="text-[14px]">{techniek.roleplays}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[14px] text-hh-success font-medium">
                          {techniek.avgScore}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[14px] text-hh-text">
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
                          <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              viewTechniqueDetails(techniek);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              Bekijk details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              navigate?.("videos");
                            }}>
                              <Video className="w-4 h-4 mr-2" />
                              Bekijk Video's
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              navigate?.("coaching");
                            }}>
                              <Play className="w-4 h-4 mr-2" />
                              Speel Rollenspel
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTechnieken.map((techniek) => (
              <Card
                key={`${techniek.code}-${techniek.id}`}
                className="p-4 rounded-[16px] shadow-hh-sm border-hh-border hover:border-hh-primary/40 hover:shadow-md transition-all cursor-pointer"
                onClick={() => viewTechniqueDetails(techniek)}
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    variant="outline"
                    className="text-[11px] font-mono bg-hh-primary/10 text-hh-primary border-hh-primary/20"
                  >
                    {techniek.code}
                  </Badge>
                  <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[11px]">
                    {techniek.status}
                  </Badge>
                </div>

                <h4 className="text-[16px] leading-[22px] text-hh-text font-medium mb-2">
                  {techniek.name}
                </h4>
                <p className="text-[13px] text-hh-muted mb-3">{techniek.fase}</p>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1 text-hh-muted text-[13px]">
                    <Video className="w-3.5 h-3.5" />
                    <span>{techniek.videos}</span>
                  </div>
                  <div className="flex items-center gap-1 text-hh-muted text-[13px]">
                    <Play className="w-3.5 h-3.5" />
                    <span>{techniek.roleplays}</span>
                  </div>
                </div>

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
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Technique Details Dialog - Read Only for users */}
      {selectedTechnique && (
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[11px] font-mono bg-hh-primary/10 text-hh-primary border-hh-primary/20"
                >
                  {selectedTechnique.code}
                </Badge>
                {selectedTechnique.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-hh-muted">
                  <Video className="w-4 h-4" />
                  <span className="text-[14px]">{selectedTechnique.videos} video's</span>
                </div>
                <div className="flex items-center gap-2 text-hh-muted">
                  <Play className="w-4 h-4" />
                  <span className="text-[14px]">{selectedTechnique.roleplays} role-plays</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-hh-ui-50">
                  <p className="text-[12px] text-hh-muted mb-1">Avg Score</p>
                  <p className="text-[20px] text-hh-success font-medium">{selectedTechnique.avgScore}%</p>
                </div>
                <div className="p-3 rounded-lg bg-hh-ui-50">
                  <p className="text-[12px] text-hh-muted mb-1">Completion</p>
                  <p className="text-[20px] text-hh-text font-medium">{selectedTechnique.completion}%</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-hh-border">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    navigate?.("videos");
                  }}
                >
                  <Video className="w-4 h-4" />
                  Bekijk Video's
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    navigate?.("coaching");
                  }}
                >
                  <Play className="w-4 h-4" />
                  Speel Rollenspel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
