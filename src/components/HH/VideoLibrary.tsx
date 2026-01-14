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
  VideoIcon,
  Download,
} from "lucide-react";
import { videos } from "../../data/videos-data";
import { getCodeBadgeColors } from "../../utils/phaseColors";

interface VideoLibraryProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

export function VideoLibrary({ navigate, isAdmin }: VideoLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPhase, setFilterPhase] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortField, setSortField] = useState<"title" | "views" | "date" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: "title" | "views" | "date") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = searchQuery === "" ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.techniqueNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhase = filterPhase === "all" || video.fase.toLowerCase().includes(filterPhase.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "published" && video.status === "Gepubliceerd") ||
      (filterStatus === "concept" && video.status === "Concept");
    return matchesSearch && matchesPhase && matchesStatus;
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (!sortField) return 0;
    if (sortField === "title") {
      return sortDirection === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    if (sortField === "views") {
      return sortDirection === "asc" ? a.views - b.views : b.views - a.views;
    }
    if (sortField === "date") {
      return sortDirection === "asc"
        ? new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
        : new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    }
    return 0;
  });

  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
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
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-hh-success" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +12%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Totale Views
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text font-medium">
              {totalViews.toLocaleString()}
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
              Gem. Completion
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
                <SelectItem value="opening">Openingsfase</SelectItem>
                <SelectItem value="ontdekking">Ontdekkingsfase</SelectItem>
                <SelectItem value="aanbeveling">Aanbevelingsfase</SelectItem>
                <SelectItem value="beslissing">Beslissingsfase</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="published">Gepubliceerd</SelectItem>
                <SelectItem value="concept">Concept</SelectItem>
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
          <div className="rounded-[16px] border border-hh-border overflow-hidden bg-white">
            <table className="w-full">
              <thead className="bg-hh-ui-50 border-b border-hh-border">
                <tr>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-muted">
                    #
                  </th>
                  <th
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-2">
                      Video
                      {sortField === "title" &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        ))}
                      {sortField !== "title" && (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Fase
                  </th>
                  <th className="text-right px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Duur
                  </th>
                  <th
                    className="text-right px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("views")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Views
                      {sortField === "views" &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        ))}
                      {sortField !== "views" && (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th className="text-right px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Completion
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedVideos.map((video, index) => (
                  <tr
                    key={video.id}
                    className={`border-b border-hh-border last:border-0 hover:bg-hh-ui-50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-white" : "bg-hh-ui-50/30"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[11px] font-mono font-semibold ${getCodeBadgeColors(video.techniqueNumber)}`}>
                        {video.techniqueNumber}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[14px] text-hh-text font-medium">
                        {video.title}
                      </div>
                      <div className="text-[12px] text-hh-muted">
                        Upload: {video.uploadDate}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="text-[11px] bg-blue-600/10 text-blue-600 border-blue-600/20"
                      >
                        {video.fase}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5 text-[13px] text-hh-text">
                        <VideoIcon className="w-3.5 h-3.5 text-hh-ink" />
                        <span>{video.duration}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5 text-[13px] text-hh-text">
                        <Play className="w-3.5 h-3.5 text-hh-ink" />
                        <span>{video.views}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] text-hh-success font-semibold">{video.completion}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${
                          video.status === "Gepubliceerd"
                            ? "bg-hh-success/10 text-hh-success border-hh-success/20"
                            : "bg-hh-warn/10 text-hh-warn border-hh-warn/20"
                        }`}
                      >
                        {video.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
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
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVideos.map((video) => (
              <Card
                key={video.id}
                className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden hover:shadow-hh-md transition-all group"
              >
                <div className="relative aspect-video bg-hh-ui-200 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="icon" className="rounded-full w-12 h-12 bg-hh-ink hover:bg-hh-ink/90">
                      <Play className="w-6 h-6" />
                    </Button>
                  </div>
                  <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-0 text-[11px]">
                    {video.duration}
                  </Badge>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant="outline"
                      className={`text-[11px] ${
                        video.status === "Gepubliceerd"
                          ? "border-hh-success/20 text-hh-success"
                          : "border-hh-warn/20 text-hh-warn"
                      }`}
                    >
                      {video.status}
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
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download
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
                      <span className="text-hh-muted">Views</span>
                      <span className="text-hh-text font-medium">{video.views}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-hh-muted">Completion</span>
                      <span className="text-hh-text font-medium">
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
