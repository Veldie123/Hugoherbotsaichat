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
  Video,
  Play,
  Eye,
  Clock,
  TrendingUp,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
} from "lucide-react";
import { getAllTechnieken } from "../../data/technieken-service";

interface VideoLibraryProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

interface VideoItem {
  id: number;
  title: string;
  techniqueNumber: string;
  fase: string;
  niveau: string;
  duration: string;
  views: number;
  completion: number;
  status: string;
  thumbnail: string;
  watched: boolean;
}

export function VideoLibrary({ navigate, isAdmin }: VideoLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPhase, setFilterPhase] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortField, setSortField] = useState<"title" | "views" | "completion" | null>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const videos: VideoItem[] = useMemo(() => {
    const allTechnieken = getAllTechnieken().filter(t => !t.is_fase);
    const seedFromString = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs(hash);
    };

    const faseNamen: Record<string, string> = {
      "0": "Voorbereiding",
      "1": "Openingsfase",
      "2": "Ontdekkingsfase",
      "3": "Aanbevelingsfase",
      "4": "Beslissingsfase",
    };

    const niveaus = ["Beginner", "Gemiddeld", "Gevorderd"];

    return allTechnieken.map((tech, idx) => {
      const seed = seedFromString(tech.nummer + tech.naam);
      return {
        id: idx + 1,
        title: tech.naam,
        techniqueNumber: tech.nummer,
        fase: faseNamen[tech.fase] || "Algemeen",
        niveau: niveaus[seed % 3],
        duration: `${8 + (seed % 25)}:${String(seed % 60).padStart(2, '0')}`,
        views: 100 + (seed % 900),
        completion: 60 + (seed % 35),
        status: seed % 10 === 0 ? "Concept" : "Gepubliceerd",
        thumbnail: `https://via.placeholder.com/320x180/1E2A3B/FFFFFF?text=${encodeURIComponent(tech.nummer)}`,
        watched: seed % 3 === 0,
      };
    });
  }, []);

  const handleSort = (field: "title" | "views" | "completion") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
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

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = searchQuery === "" ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.techniqueNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhase = filterPhase === "all" || video.fase.toLowerCase().includes(filterPhase.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "watched" && video.watched) ||
      (filterStatus === "unwatched" && !video.watched);
    return matchesSearch && matchesPhase && matchesStatus;
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (!sortField) return 0;
    let comparison = 0;
    switch (sortField) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "views":
        comparison = a.views - b.views;
        break;
      case "completion":
        comparison = a.completion - b.completion;
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const watchedCount = videos.filter(v => v.watched).length;
  const totalDuration = videos.reduce((sum, v) => {
    const [mins] = v.duration.split(':').map(Number);
    return sum + mins;
  }, 0);
  const avgCompletion = Math.round(videos.reduce((sum, v) => sum + v.completion, 0) / videos.length);

  return (
    <AppLayout currentPage="videos" navigate={navigate} isAdmin={isAdmin}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              Video Bibliotheek
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              {videos.length} video's — leer alle technieken van Hugo
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-hh-ink" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +3
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Totaal Video's
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text font-medium">
              {videos.length}
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
                +5
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Bekeken
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text font-medium">
              {watchedCount}
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
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text font-medium">
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
                +8%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Gem. Voortgang
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text font-medium">
              {avgCompletion}%
            </p>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek video's..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={filterPhase} onValueChange={setFilterPhase}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Fases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Fases</SelectItem>
                <SelectItem value="voorbereiding">Voorbereiding</SelectItem>
                <SelectItem value="opening">Openingsfase</SelectItem>
                <SelectItem value="ontdekking">Ontdekkingsfase</SelectItem>
                <SelectItem value="aanbeveling">Aanbevelingsfase</SelectItem>
                <SelectItem value="beslissing">Beslissingsfase</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Video's" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Video's</SelectItem>
                <SelectItem value="watched">Bekeken</SelectItem>
                <SelectItem value="unwatched">Niet bekeken</SelectItem>
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
                    <th 
                      className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold cursor-pointer hover:bg-hh-ui-100 transition-colors select-none"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center gap-1.5">
                        Video
                        <SortIcon column="title" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold">
                      Techniek
                    </th>
                    <th className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold">
                      Fase
                    </th>
                    <th className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold">
                      Duur
                    </th>
                    <th 
                      className="text-right py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold cursor-pointer hover:bg-hh-ui-100 transition-colors select-none"
                      onClick={() => handleSort("completion")}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        Voortgang
                        <SortIcon column="completion" />
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
                  {sortedVideos.map((video, index) => (
                    <tr
                      key={video.id}
                      className={`border-t border-hh-border hover:bg-hh-ui-50 transition-colors cursor-pointer ${
                        index % 2 === 0 ? "bg-white" : "bg-hh-ui-50/30"
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-9 rounded bg-hh-ink/10 flex items-center justify-center flex-shrink-0">
                            <Play className="w-4 h-4 text-hh-ink" />
                          </div>
                          <p className="text-[14px] leading-[20px] text-hh-text font-medium">
                            {video.title}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-mono bg-hh-ink/10 text-hh-ink border-hh-ink/20"
                        >
                          {video.techniqueNumber}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="text-[11px] bg-hh-primary/10 text-hh-primary border-hh-primary/20"
                        >
                          {video.fase}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[14px] text-hh-muted">
                        {video.duration}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`text-[14px] leading-[20px] font-medium ${video.watched ? 'text-hh-success' : 'text-hh-muted'}`}>
                          {video.completion}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {video.watched ? (
                          <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[11px]">
                            Bekeken
                          </Badge>
                        ) : (
                          <Badge className="bg-hh-muted/10 text-hh-muted border-hh-muted/20 text-[11px]">
                            Niet bekeken
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Play className="w-4 h-4 mr-2" />
                              Bekijk video
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate?.("library")}>
                              <Eye className="w-4 h-4 mr-2" />
                              Bekijk techniek
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate?.("roleplay")}>
                              <Play className="w-4 h-4 mr-2" />
                              Start rollenspel
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
            {sortedVideos.map((video) => (
              <Card
                key={video.id}
                className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden hover:shadow-hh-md hover:border-hh-ink/30 transition-all group"
              >
                <div className="relative aspect-video bg-hh-ink/10 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-hh-primary/20 to-hh-ink flex items-center justify-center">
                    <Play className="w-10 h-10 text-white/60" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="icon" className="rounded-full w-12 h-12 bg-hh-ink hover:bg-hh-ink/90">
                      <Play className="w-6 h-6" />
                    </Button>
                  </div>
                  <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-0 text-[11px]">
                    {video.duration}
                  </Badge>
                  {video.watched && (
                    <Badge className="absolute top-2 left-2 bg-hh-success text-white border-0 text-[11px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Bekeken
                    </Badge>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant="outline"
                      className="text-[11px] font-mono bg-hh-ink/10 text-hh-ink border-hh-ink/20"
                    >
                      {video.techniqueNumber}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Play className="w-4 h-4 mr-2" />
                          Bekijk video
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate?.("library")}>
                          <Eye className="w-4 h-4 mr-2" />
                          Bekijk techniek
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate?.("roleplay")}>
                          <Play className="w-4 h-4 mr-2" />
                          Start rollenspel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="text-[16px] leading-[24px] text-hh-text font-semibold mb-2">
                    {video.title}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-hh-muted">Fase</span>
                      <Badge
                        variant="outline"
                        className="text-[11px] bg-hh-primary/10 text-hh-primary border-hh-primary/20"
                      >
                        {video.fase}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-hh-muted">Niveau</span>
                      <span className="text-hh-text">{video.niveau}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-hh-muted">Voortgang</span>
                      <span className={`font-medium ${video.watched ? 'text-hh-success' : 'text-hh-muted'}`}>
                        {video.completion}%
                      </span>
                    </div>
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
