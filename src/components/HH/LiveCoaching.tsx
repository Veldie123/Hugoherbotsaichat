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
  Radio,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MoreVertical,
  Play,
  Search,
  List,
  LayoutGrid,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  CheckCircle2,
  Video,
  Bell,
  Eye,
} from "lucide-react";
import { liveSessions } from "../../data/live-sessions-data";

interface LiveCoachingProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

type ViewMode = "list" | "grid";
type SortField = "date" | "participants" | null;
type SortDirection = "asc" | "desc";

export function LiveCoaching({ navigate, isAdmin }: LiveCoachingProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const upcomingSessions = liveSessions.filter((s) => s.status === "scheduled");
  const pastSessions = liveSessions.filter((s) => s.status === "completed");
  const avgAttendees = Math.round(
    pastSessions.reduce((sum, s) => sum + s.attendees, 0) / pastSessions.length
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-red-600 text-white border-0 text-[11px]">
            🔴 LIVE
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-hh-warn/10 text-hh-warn border-hh-warn/20 text-[11px]">
            Gepland
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[11px]">
            Afgelopen
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredSessions = liveSessions.filter((session) => {
    const matchesSearch =
      searchQuery === "" ||
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.fase.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatusFilter === "all" || session.status === selectedStatusFilter;
    const matchesFase = selectedPhaseFilter === "all" || session.fase === selectedPhaseFilter;
    return matchesSearch && matchesStatus && matchesFase;
  });

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "date":
        comparison = a.date.localeCompare(b.date);
        break;
      case "participants":
        comparison = a.attendees - b.attendees;
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-hh-muted" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3 h-3 text-hh-ink" />
    ) : (
      <ArrowDown className="w-3 h-3 text-hh-ink" />
    );
  };

  return (
    <AppLayout currentPage="live" navigate={navigate} isAdmin={isAdmin}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="max-w-[50%]">
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              Live Coaching Sessies
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              Bekijk en meld je aan voor live training sessies
            </p>
          </div>
        </div>

        {/* KPI Tiles - 4 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +12%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Totaal Sessies
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {liveSessions.length}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +2
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Aankomend
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {upcomingSessions.length}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-hh-ink" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +8%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Gem. Deelnemers
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-success">
              {avgAttendees}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                100%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Voltooide Sessies
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {pastSessions.length}
            </p>
          </Card>
        </div>

        {/* Filter Card - Uniform Structure */}
        <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search - Left Side */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek op titel, fase..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters - Middle */}
            <Select value={selectedPhaseFilter} onValueChange={setSelectedPhaseFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Fases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Fases</SelectItem>
                <SelectItem value="Voorbereiding">Voorbereiding</SelectItem>
                <SelectItem value="Openingsfase">Openingsfase</SelectItem>
                <SelectItem value="Ontdekkingsfase">Ontdekkingsfase</SelectItem>
                <SelectItem value="Aanbevelingsfase">Aanbevelingsfase</SelectItem>
                <SelectItem value="Beslissingsfase">Beslissingsfase</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="scheduled">Gepland</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="completed">Afgelopen</SelectItem>
              </SelectContent>
            </Select>
            
            {/* View Toggle - Right Side */}
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

        {/* Content - Based on View Mode */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSessions.length === 0 ? (
              <Card className="col-span-full p-8 rounded-[16px] border-hh-border text-center">
                <CalendarIcon className="w-12 h-12 text-hh-muted mx-auto mb-3" />
                <p className="text-[16px] text-hh-muted">
                  Geen sessies gevonden
                </p>
              </Card>
            ) : (
              sortedSessions.map((session) => (
                <Card
                  key={session.id}
                  className="p-4 rounded-[16px] border-hh-border hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-lg bg-hh-ink/10 text-hh-ink flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                            {session.techniqueNumber}
                          </div>
                          <h3 className="text-[16px] font-semibold text-hh-text truncate">
                            {session.title}
                          </h3>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {session.status === "scheduled" ? (
                            <>
                              <DropdownMenuItem>
                                <Bell className="w-4 h-4 mr-2" />
                                Inschrijven
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                Toevoegen aan agenda
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem>
                                <Play className="w-4 h-4 mr-2" />
                                Bekijk opname
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate?.("library")}>
                                <Eye className="w-4 h-4 mr-2" />
                                Bekijk techniek
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-[13px] text-hh-muted">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {new Date(session.date).toLocaleDateString("nl-NL", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{session.time} • {session.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 flex-shrink-0" />
                        <span>{session.platform}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {session.attendees}
                          {session.maxAttendees && ` / ${session.maxAttendees}`} deelnemers
                        </span>
                      </div>
                    </div>

                    {/* Fase Badge */}
                    <Badge
                      variant="outline"
                      className="text-[11px] bg-blue-100 text-blue-700 border-blue-300"
                    >
                      {session.fase}
                    </Badge>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {session.status === "scheduled" ? (
                        <Button
                          size="sm"
                          className="w-full gap-2 bg-hh-ink hover:bg-hh-ink/90 text-white"
                        >
                          <Bell className="w-4 h-4" />
                          Inschrijven
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full gap-2 bg-hh-ink hover:bg-hh-ink/90 text-white"
                        >
                          <Play className="w-4 h-4" />
                          Bekijk opname
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {viewMode === "list" && (
          <div className="rounded-[16px] border border-hh-border overflow-hidden bg-white">
            <table className="w-full">
              <thead className="bg-hh-ui-50 border-b border-hh-border">
                <tr>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text w-20">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Sessie
                  </th>
                  <th
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-2">
                      Datum & Tijd
                      <SortIcon field="date" />
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Fase
                  </th>
                  <th
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("participants")}
                  >
                    <div className="flex items-center gap-2">
                      Deelnemers
                      <SortIcon field="participants" />
                    </div>
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
                {sortedSessions.map((session, index) => (
                  <tr
                    key={session.id}
                    className={`border-b border-hh-border last:border-0 hover:bg-hh-ui-50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-white" : "bg-hh-ui-50/30"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg bg-hh-ink/10 text-hh-ink flex items-center justify-center text-[13px] font-semibold">
                        {session.techniqueNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[14px] text-hh-text font-medium">
                        {session.title}
                      </div>
                      <div className="text-[12px] text-hh-muted flex items-center gap-1 mt-0.5">
                        <Video className="w-3 h-3" />
                        {session.platform} • {session.duration}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[13px] text-hh-text">
                        {new Date(session.date).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[12px] text-hh-muted">
                        {session.time}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="text-[11px] bg-blue-100 text-blue-700 border-blue-300"
                      >
                        {session.fase}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[13px] text-hh-success font-medium">
                        {session.attendees}
                        {session.maxAttendees && <span className="text-hh-text font-normal"> / {session.maxAttendees}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(session.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {session.status === "scheduled" ? (
                            <>
                              <DropdownMenuItem>
                                <Bell className="w-4 h-4 mr-2" />
                                Inschrijven
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                Toevoegen aan agenda
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem>
                                <Play className="w-4 h-4 mr-2" />
                                Bekijk opname
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate?.("library")}>
                                <Eye className="w-4 h-4 mr-2" />
                                Bekijk techniek
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
