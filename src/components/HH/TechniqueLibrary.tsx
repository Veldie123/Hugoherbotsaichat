import { useState, useMemo } from "react";
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
  MessageCircle,
  Radio,
} from "lucide-react";
import { TechniqueDetailsDialog } from "./TechniqueDetailsDialog";
import { 
  getAllTechnieken, 
  getFaseNaam,
  Techniek 
} from "../../data/technieken-service";

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

  const technieken = useMemo(() => {
    const seedFromString = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs(hash);
    };

    const allTechnieken = getAllTechnieken().filter(t => !t.is_fase);
    
    const toTechniqueItem = (t: Techniek, baseId: number, index: number) => {
      const seed = seedFromString(t.nummer + t.naam);
      return {
        id: baseId + index,
        code: t.nummer,
        name: t.naam,
        fase: t.fase,
        videos: (seed % 5) + 1,
        roleplays: (seed % 400) + 100,
        avgScore: (seed % 20) + 70,
        completion: (seed % 40) + 60,
        status: "Actief" as const,
      };
    };

    return {
      "fase-0": allTechnieken.filter(t => t.fase === "0").map((t, i) => toTechniqueItem(t, 1, i)),
      "fase-1": allTechnieken.filter(t => t.fase === "1").map((t, i) => toTechniqueItem(t, 10, i)),
      "fase-2": allTechnieken.filter(t => t.fase === "2").map((t, i) => toTechniqueItem(t, 20, i)),
      "fase-3": allTechnieken.filter(t => t.fase === "3").map((t, i) => toTechniqueItem(t, 50, i)),
      "fase-4": allTechnieken.filter(t => t.fase === "4").map((t, i) => toTechniqueItem(t, 70, i)),
    };
  }, []);

  const currentTechnieken = activeFase === "all" 
    ? Object.values(technieken).flat() 
    : technieken[activeFase as keyof typeof technieken] || [];

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

  const totalCount = Object.values(technieken).reduce((sum, arr) => sum + arr.length, 0);
  const totalVideos = Object.values(technieken).reduce((sum, arr) => sum + arr.reduce((s, t) => s + t.videos, 0), 0);
  const totalRoleplays = Object.values(technieken).reduce((sum, arr) => sum + arr.reduce((s, t) => s + t.roleplays, 0), 0);
  const avgScore = Math.round(
    Object.values(technieken).reduce((sum, arr) => sum + arr.reduce((s, t) => s + t.avgScore, 0), 0) / totalCount
  );

  return (
    <AppLayout currentPage="library" navigate={navigate} isAdmin={isAdmin}>
      <div className="p-6 space-y-6">
        {/* Header - No button for User View */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              E.P.I.C Technieken
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              25 verkooptechnieken verdeeld over 4 fases
            </p>
          </div>
        </div>

        {/* KPI Cards - User View colors (hh-ink/hh-primary) */}
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
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text">
              {totalCount}
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
              {totalVideos}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-hh-ink" />
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
              {totalRoleplays}
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
              Jouw Gem. Score
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text">
              {avgScore}%
            </p>
          </Card>
        </div>

        {/* Search, View Toggle & Filters Card */}
        <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek technieken..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={activeFase} onValueChange={setActiveFase}>
              <SelectTrigger className="w-full lg:w-[220px]">
                <SelectValue placeholder="Alle Fases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Fases</SelectItem>
                <SelectItem value="fase-0">Fase 0 - Voorbereiding</SelectItem>
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
              </SelectContent>
            </Select>
            
            {/* View Toggle - hh-ink colors */}
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

        {/* List View - Table (No checkboxes for User View) */}
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
                        Jouw Score
                        <SortIcon column="score" />
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold">
                      Voortgang
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
                          <Video className="w-3.5 h-3.5 text-hh-primary" />
                          {techniek.videos}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 text-[14px] leading-[20px] text-hh-text">
                          <Play className="w-3.5 h-3.5 text-hh-ink" />
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
                            <DropdownMenuItem
                              onClick={() => {
                                const allTech = getAllTechnieken();
                                const fullTech = allTech.find(t => t.nummer === techniek.code);
                                if (fullTech) {
                                  setSelectedTechnique({
                                    nummer: fullTech.nummer,
                                    naam: fullTech.naam,
                                    fase: fullTech.fase,
                                  });
                                  setDetailsDialogOpen(true);
                                }
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Bekijk details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate?.("videos")}>
                              <Video className="w-4 h-4 mr-2" />
                              Bekijk Video's
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate?.("roleplay")}>
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

        {/* Card View - Grid */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTechnieken.map((techniek) => (
              <Card key={`${techniek.code}-${techniek.id}`} className="p-4 rounded-[16px] shadow-hh-sm border-hh-border hover:shadow-hh-md hover:border-hh-ink/30 transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <Badge
                      variant="outline"
                      className="text-[11px] font-mono bg-hh-ink/10 text-hh-ink border-hh-ink/20"
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
                        <DropdownMenuItem
                          onClick={() => {
                            const allTech = getAllTechnieken();
                            const fullTech = allTech.find(t => t.nummer === techniek.code);
                            if (fullTech) {
                              setSelectedTechnique({
                                nummer: fullTech.nummer,
                                naam: fullTech.naam,
                                fase: fullTech.fase,
                              });
                              setDetailsDialogOpen(true);
                            }
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Bekijk details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate?.("videos")}>
                          <Video className="w-4 h-4 mr-2" />
                          Bekijk Video's
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate?.("roleplay")}>
                          <Play className="w-4 h-4 mr-2" />
                          Speel Rollenspel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="text-[14px] leading-[20px] text-hh-text font-medium">
                    {techniek.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 text-[13px] text-hh-muted">
                      <Video className="w-3.5 h-3.5 text-hh-primary" />
                      <span>{techniek.videos} video's</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] text-hh-muted">
                      <Play className="w-3.5 h-3.5 text-hh-ink" />
                      <span>{techniek.roleplays}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-hh-border">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-hh-muted">Jouw Score</span>
                      <span className="text-hh-success font-medium">{techniek.avgScore}%</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-hh-muted">Voortgang</span>
                      <span className="text-hh-text">{techniek.completion}%</span>
                    </div>
                  </div>

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
                      className="flex-1 gap-1.5 text-[11px] h-8 bg-hh-primary/5 text-hh-primary border-hh-primary/20 hover:bg-hh-primary hover:text-white"
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
                      className="flex-1 gap-1.5 text-[11px] h-8 bg-hh-primary/5 text-hh-primary border-hh-primary/20 hover:bg-hh-primary hover:text-white"
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

      {/* Technique Details Dialog - Read Only */}
      {selectedTechnique && (
        <TechniqueDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          technique={{
            id: selectedTechnique.nummer,
            number: selectedTechnique.nummer,
            naam: selectedTechnique.naam,
            fase: selectedTechnique.fase || "1",
          }}
          isEditable={false}
        />
      )}
    </AppLayout>
  );
}
