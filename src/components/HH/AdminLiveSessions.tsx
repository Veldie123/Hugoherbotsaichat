import {
  Radio,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Copy,
  Search,
  Download,
  List,
  LayoutGrid,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Video,
  Check,
} from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface AdminLiveSessionsProps {
  navigate?: (page: string) => void;
}

type ViewMode = "list" | "calendar" | "grid";
type SortField = "date" | "participants" | null;
type SortDirection = "asc" | "desc";

export function AdminLiveSessions({ navigate }: AdminLiveSessionsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<typeof liveSessions[0] | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  
  const liveSessions = [
    {
      id: 1,
      techniqueNumber: "2.1.2",
      title: "Meningsgerichte vragen (open vragen)",
      fase: "Ontdekkingsfase",
      date: "2026-01-22",
      time: "14:00",
      duration: "60 min",
      status: "scheduled",
      attendees: 0,
      maxAttendees: null,
      platform: "Zoom",
    },
    {
      id: 2,
      techniqueNumber: "2.1.1",
      title: "Feitgerichte vragen",
      fase: "Ontdekkingsfase",
      date: "2026-01-25",
      time: "10:00",
      duration: "90 min",
      status: "scheduled",
      attendees: 0,
      maxAttendees: 50,
      platform: "Zoom",
    },
    {
      id: 3,
      techniqueNumber: "4.2.4",
      title: "Bezwaren behandelen",
      fase: "Beslissingsfase",
      date: "2026-01-15",
      time: "16:00",
      duration: "120 min",
      status: "completed",
      attendees: 42,
      maxAttendees: 50,
      platform: "Microsoft Teams",
    },
    {
      id: 4,
      techniqueNumber: "1.1",
      title: "Koopklimaat creëren",
      fase: "Openingsfase",
      date: "2026-01-08",
      time: "11:00",
      duration: "45 min",
      status: "completed",
      attendees: 28,
      maxAttendees: 30,
      platform: "Google Meet",
    },
    {
      id: 5,
      techniqueNumber: "4.1",
      title: "Proefafsluiting",
      fase: "Beslissingsfase",
      date: "2026-01-29",
      time: "13:00",
      duration: "90 min",
      status: "scheduled",
      attendees: 0,
      maxAttendees: 40,
      platform: "Zoom",
    },
  ];

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

  const toggleSelection = (id: number) => {
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
    if (window.confirm(`Weet je zeker dat je ${selectedIds.length} webinars wilt verwijderen?`)) {
      console.log("Delete sessions:", selectedIds);
      setSelectedIds([]);
      setSelectionMode(false);
    }
  };

  // Filter logic
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

  // Sort logic
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
      <ArrowUp className="w-3 h-3 text-hh-primary" />
    ) : (
      <ArrowDown className="w-3 h-3 text-hh-primary" />
    );
  };

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getSessionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return liveSessions.filter((s) => s.date === dateStr);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <AdminLayout currentPage="admin-live" navigate={navigate}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="max-w-[50%]">
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              Live Coaching Sessies
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              Beheer en plan live training sessies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowCalendarModal(true)}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Kalender</span>
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-red-600 hover:bg-red-700"
              onClick={() => setShowPlanModal(true)}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden lg:inline">Plan Nieuwe Sessie</span>
              <span className="lg:hidden">Nieuw</span>
            </Button>
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
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
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSession(session);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Bewerk
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Dupliceer
                          </DropdownMenuItem>
                          {session.recording && (
                            <DropdownMenuItem>
                              <Play className="w-4 h-4 mr-2" />
                              Bekijk opname
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Verwijder
                          </DropdownMenuItem>
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
                      {session.status === "scheduled" && (
                        <Button
                          size="sm"
                          className="flex-1 gap-2 bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => {
                            console.log("Start session:", session.id);
                            // TODO: Navigate to live session interface
                          }}
                        >
                          <Play className="w-4 h-4" />
                          Start Sessie
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className={session.status === "scheduled" ? "flex-1 gap-2" : "w-full gap-2"}
                        onClick={() => {
                          setSelectedSession(session);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        Bewerk
                      </Button>
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
                  {selectionMode && (
                    <th className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-muted font-medium w-[40px]">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-2 border-hh-border/40 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer bg-transparent checked:bg-purple-600 checked:border-purple-600"
                        checked={selectedIds.length === filteredSessions.length && filteredSessions.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                  )}
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text w-20">
                    #
                  </th>
                  <th
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-2">
                      Sessie
                      <SortIcon field="title" />
                    </div>
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
                  <th
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <SortIcon field="status" />
                    </div>
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
                    onClick={() => viewSessionDetail(session)}
                    className={`border-b border-hh-border last:border-0 hover:bg-hh-ui-50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-white" : "bg-hh-ui-50/30"
                    }`}
                  >
                    {selectionMode && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-2 border-hh-border/40 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer bg-transparent checked:bg-purple-600 checked:border-purple-600"
                          checked={selectedIds.includes(session.id)}
                          onChange={() => toggleSelection(session.id)}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-[13px] font-semibold">
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
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Bewerk
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Dupliceer
                          </DropdownMenuItem>
                          {session.recording && (
                            <DropdownMenuItem>
                              <Play className="w-4 h-4 mr-2" />
                              Bekijk opname
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
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
        )}

        {viewMode === "calendar" && (
          <div>
            {/* Calendar Header */}
            <Card className="p-4 rounded-[16px] border-hh-border shadow-hh-sm mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-semibold text-hh-text capitalize">
                  {monthName}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date())}
                    className="h-8 px-3 text-[13px]"
                  >
                    Vandaag
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Calendar Grid */}
            <Card className="p-2 sm:p-4 rounded-[16px] border-hh-border shadow-hh-sm overflow-x-auto">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-2 mb-2 min-w-[280px]">
                {["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-[10px] sm:text-[12px] font-semibold text-hh-muted py-1 sm:py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-2 min-w-[280px]">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-12 sm:h-20 lg:h-24" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    day
                  );
                  const sessionsOnDay = getSessionsForDate(date);
                  const isToday =
                    date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={day}
                      onClick={() => {
                        if (sessionsOnDay.length > 0) {
                          setSelectedSession(sessionsOnDay[0]);
                          setIsEditDialogOpen(true);
                        }
                      }}
                      className={`h-12 sm:h-20 lg:h-24 border rounded-md sm:rounded-lg p-1 sm:p-2 flex flex-col ${
                        isToday
                          ? "border-hh-primary bg-hh-primary/5 ring-1 sm:ring-2 ring-hh-primary/20"
                          : "border-hh-border bg-white hover:bg-hh-ui-50"
                      } ${sessionsOnDay.length > 0 ? "cursor-pointer" : ""} transition-all group`}
                    >
                      {/* Day number */}
                      <div
                        className={`text-[11px] sm:text-[15px] lg:text-[16px] font-semibold mb-0.5 sm:mb-1 ${
                          isToday ? "text-hh-primary" : "text-hh-text"
                        }`}
                      >
                        {day}
                      </div>
                      
                      {/* Sessions - Mobile: dots only, Desktop: text badges */}
                      <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                        {sessionsOnDay.length > 0 && (
                          <>
                            {/* Mobile: Show dots only - clickable */}
                            <div className="sm:hidden flex items-center gap-1 mt-1">
                              {sessionsOnDay.slice(0, 3).map((session) => (
                                <div
                                  key={session.id}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    session.status === "scheduled"
                                      ? "bg-hh-warn"
                                      : session.status === "live"
                                      ? "bg-red-500"
                                      : "bg-hh-success"
                                  }`}
                                  title={`${session.time} - ${session.title}`}
                                />
                              ))}
                              {sessionsOnDay.length > 3 && (
                                <div className="w-1.5 h-1.5 rounded-full bg-hh-muted" />
                              )}
                            </div>

                            {/* Desktop: Show text badges */}
                            <div className="hidden sm:flex flex-col gap-0.5">
                              {sessionsOnDay.slice(0, 2).map((session) => (
                                <div
                                  key={session.id}
                                  className={`text-[9px] sm:text-[10px] leading-[14px] px-1 sm:px-1.5 py-0.5 rounded truncate ${
                                    session.status === "scheduled"
                                      ? "bg-hh-warn/20 text-hh-warn"
                                      : session.status === "live"
                                      ? "bg-red-500/20 text-red-600"
                                      : "bg-hh-success/20 text-hh-success"
                                  }`}
                                  title={`${session.time} - ${session.title}`}
                                >
                                  <span className="font-medium">{session.time}</span>
                                </div>
                              ))}
                              {sessionsOnDay.length > 2 && (
                                <div className="text-[9px] text-hh-muted px-1">
                                  +{sessionsOnDay.length - 2} meer
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Sessions list below calendar */}
            <div className="mt-4 space-y-2">
              <h3 className="text-[16px] font-semibold text-hh-text">
                Sessies deze maand ({filteredSessions.length})
              </h3>
              <div className="space-y-2">
                {filteredSessions.map((session) => (
                  <Card
                    key={session.id}
                    className="p-3 rounded-lg border-hh-border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-center flex-shrink-0">
                          <div className="text-[11px] text-hh-muted uppercase">
                            {new Date(session.date).toLocaleDateString("nl-NL", {
                              month: "short",
                            })}
                          </div>
                          <div className="text-[20px] font-semibold text-hh-text">
                            {new Date(session.date).getDate()}
                          </div>
                        </div>
                        <div className="h-10 w-px bg-hh-border flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="text-[14px] font-medium text-hh-text truncate">
                              {session.title}
                            </h4>
                            {getStatusBadge(session.status)}
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-hh-muted flex-wrap">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span>{session.time} ({session.duration})</span>
                            <span className="hidden sm:inline">•</span>
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-hh-primary/10 text-hh-primary border-hh-primary/20"
                            >
                              {session.fase}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Start Session Button - Only for scheduled sessions */}
                        {session.status === "scheduled" && (
                          <Button
                            size="sm"
                            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => {
                              console.log("Start session:", session.id);
                              // TODO: Navigate to live session interface
                            }}
                          >
                            <Play className="w-4 h-4" />
                            <span className="hidden lg:inline">Start Sessie</span>
                          </Button>
                        )}
                        
                        {/* More Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSession(session);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Bewerk
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Dupliceer
                            </DropdownMenuItem>
                            {session.recording && (
                              <DropdownMenuItem>
                                <Play className="w-4 h-4 mr-2" />
                                Bekijk opname
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Verwijder
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plan New Session Modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Plan Nieuwe Live Sessie</DialogTitle>
            <DialogDescription>
              Plan een nieuwe live coaching sessie voor je team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Sessie Titel</Label>
              <Input
                id="title"
                placeholder="2.1.2 Meningsgerichte vragen"
                className="bg-hh-ui-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Datum</Label>
                <Input
                  id="date"
                  type="date"
                  className="bg-hh-ui-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Tijd</Label>
                <Input
                  id="time"
                  type="time"
                  placeholder="14:00"
                  className="bg-hh-ui-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duur (minuten)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="60"
                  className="bg-hh-ui-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fase">Fase</Label>
                <Select>
                  <SelectTrigger className="bg-hh-ui-100">
                    <SelectValue placeholder="Selecteer fase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voorbereiding">Voorbereiding</SelectItem>
                    <SelectItem value="opening">Openingsfase</SelectItem>
                    <SelectItem value="ontdekking">Ontdekkingsfase</SelectItem>
                    <SelectItem value="aanbeveling">Aanbevelingsfase</SelectItem>
                    <SelectItem value="beslissing">Beslissingsfase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                placeholder="Wat gaan we behandelen in deze sessie?"
                className="bg-hh-ui-100 min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select defaultValue="zoom">
                  <SelectTrigger className="bg-hh-ui-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="meet">Google Meet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max">Max. Deelnemers (optioneel)</Label>
                <Input
                  id="max"
                  type="number"
                  placeholder="50"
                  className="bg-hh-ui-100"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPlanModal(false)}
            >
              Annuleer
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              Plan Sessie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Session Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bewerk Live Sessie</DialogTitle>
            <DialogDescription>
              Pas de details van deze live coaching sessie aan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Sessie Titel</Label>
              <Input
                id="title"
                placeholder="2.1.2 Meningsgerichte vragen"
                className="bg-hh-ui-100"
                value={selectedSession?.title}
                onChange={(e) => {
                  if (selectedSession) {
                    setSelectedSession({ ...selectedSession, title: e.target.value });
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Datum</Label>
                <Input
                  id="date"
                  type="date"
                  className="bg-hh-ui-100"
                  value={selectedSession?.date}
                  onChange={(e) => {
                    if (selectedSession) {
                      setSelectedSession({ ...selectedSession, date: e.target.value });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Tijd</Label>
                <Input
                  id="time"
                  type="time"
                  placeholder="14:00"
                  className="bg-hh-ui-100"
                  value={selectedSession?.time}
                  onChange={(e) => {
                    if (selectedSession) {
                      setSelectedSession({ ...selectedSession, time: e.target.value });
                    }
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duur (minuten)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="60"
                  className="bg-hh-ui-100"
                  value={selectedSession?.duration}
                  onChange={(e) => {
                    if (selectedSession) {
                      setSelectedSession({ ...selectedSession, duration: e.target.value });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fase">Fase</Label>
                <Select
                  value={selectedSession?.fase}
                  onValueChange={(value) => {
                    if (selectedSession) {
                      setSelectedSession({ ...selectedSession, fase: value });
                    }
                  }}
                >
                  <SelectTrigger className="bg-hh-ui-100">
                    <SelectValue placeholder="Selecteer fase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voorbereiding">Voorbereiding</SelectItem>
                    <SelectItem value="opening">Openingsfase</SelectItem>
                    <SelectItem value="ontdekking">Ontdekkingsfase</SelectItem>
                    <SelectItem value="aanbeveling">Aanbevelingsfase</SelectItem>
                    <SelectItem value="beslissing">Beslissingsfase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                placeholder="Wat gaan we behandelen in deze sessie?"
                className="bg-hh-ui-100 min-h-[100px]"
                value={selectedSession?.description}
                onChange={(e) => {
                  if (selectedSession) {
                    setSelectedSession({ ...selectedSession, description: e.target.value });
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  defaultValue={selectedSession?.platform}
                  onValueChange={(value) => {
                    if (selectedSession) {
                      setSelectedSession({ ...selectedSession, platform: value });
                    }
                  }}
                >
                  <SelectTrigger className="bg-hh-ui-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="meet">Google Meet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max">Max. Deelnemers (optioneel)</Label>
                <Input
                  id="max"
                  type="number"
                  placeholder="50"
                  className="bg-hh-ui-100"
                  value={selectedSession?.maxAttendees}
                  onChange={(e) => {
                    if (selectedSession) {
                      setSelectedSession({ ...selectedSession, maxAttendees: e.target.value });
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Annuleer
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              Sessie Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calendar Modal */}
      <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[900px] lg:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[18px] sm:text-[24px]">Kalender Overzicht</DialogTitle>
            <DialogDescription className="text-[13px] sm:text-[14px]">
              Bekijk alle live sessies in kalender formaat
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            {/* Calendar Header */}
            <Card className="p-3 sm:p-4 rounded-[16px] border-hh-border">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] sm:text-[18px] font-semibold text-hh-text capitalize">
                  {monthName}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date())}
                    className="h-8 px-3 text-[13px]"
                  >
                    Vandaag
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Calendar Grid - Scrollable wrapper for mobile */}
            <div className="overflow-x-auto">
              <Card className="p-3 sm:p-6 rounded-[16px] border-hh-border min-w-[340px]">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-2 sm:mb-3">
                {["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"].map((day, index) => {
                  const fullDay = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"][index];
                  return (
                    <div
                      key={day}
                      className="text-center text-[11px] sm:text-[14px] font-semibold text-hh-text py-2 sm:py-3"
                    >
                      <span className="sm:hidden">{day}</span>
                      <span className="hidden sm:inline">{fullDay}</span>
                    </div>
                  );
                })}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1 sm:gap-3">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-16 sm:h-32" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    day
                  );
                  const sessionsOnDay = getSessionsForDate(date);
                  const isToday =
                    date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={day}
                      onClick={() => {
                        if (sessionsOnDay.length > 0) {
                          setSelectedSession(sessionsOnDay[0]);
                          setShowCalendarModal(false);
                          setIsEditDialogOpen(true);
                        }
                      }}
                      className={`h-16 sm:h-32 border rounded-lg sm:rounded-xl p-1.5 sm:p-3 flex flex-col ${
                        isToday
                          ? "border-hh-primary bg-hh-primary/5 ring-1 sm:ring-2 ring-hh-primary/20"
                          : "border-hh-border bg-white hover:bg-hh-ui-50"
                      } ${sessionsOnDay.length > 0 ? "cursor-pointer" : ""} transition-all`}
                    >
                      {/* Day number */}
                      <div
                        className={`text-[13px] sm:text-[18px] font-semibold mb-0.5 sm:mb-2 ${
                          isToday ? "text-hh-primary" : "text-hh-text"
                        }`}
                      >
                        {day}
                      </div>
                      
                      {/* Sessions */}
                      <div className="flex-1 flex flex-col gap-0.5 sm:gap-1 overflow-hidden">
                        {/* Mobile: Show dots only */}
                        <div className="sm:hidden flex items-center gap-0.5 flex-wrap">
                          {sessionsOnDay.slice(0, 4).map((session) => (
                            <div
                              key={session.id}
                              className={`w-1.5 h-1.5 rounded-full ${
                                session.status === "scheduled"
                                  ? "bg-hh-warn"
                                  : session.status === "live"
                                  ? "bg-red-500"
                                  : "bg-hh-success"
                              }`}
                              title={`${session.time} - ${session.title}`}
                            />
                          ))}
                        </div>
                        
                        {/* Desktop: Show time badges */}
                        <div className="hidden sm:flex flex-col gap-1">
                          {sessionsOnDay.slice(0, 3).map((session) => (
                            <div
                              key={session.id}
                              className={`text-[11px] leading-[16px] px-2 py-1 rounded truncate ${
                                session.status === "scheduled"
                                  ? "bg-hh-warn/20 text-hh-warn"
                                  : session.status === "live"
                                  ? "bg-red-500/20 text-red-600"
                                  : "bg-hh-success/20 text-hh-success"
                              }`}
                              title={`${session.time} - ${session.title}`}
                            >
                              <span className="font-semibold">{session.time}</span>
                            </div>
                          ))}
                          {sessionsOnDay.length > 3 && (
                            <div className="text-[10px] text-hh-muted px-2 font-medium">
                              +{sessionsOnDay.length - 3} meer
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              </Card>
            </div>

            {/* Sessions list for selected month */}
            <div>
              <h3 className="text-[16px] font-semibold text-hh-text mb-3">
                Sessies {monthName} ({filteredSessions.length})
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {filteredSessions.map((session) => (
                  <Card
                    key={session.id}
                    className="p-3 rounded-lg border-hh-border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedSession(session);
                      setShowCalendarModal(false);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-center flex-shrink-0">
                          <div className="text-[11px] text-hh-muted uppercase">
                            {new Date(session.date).toLocaleDateString("nl-NL", {
                              month: "short",
                            })}
                          </div>
                          <div className="text-[20px] font-semibold text-hh-text">
                            {new Date(session.date).getDate()}
                          </div>
                        </div>
                        <div className="h-10 w-px bg-hh-border flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-[14px] font-medium text-hh-text truncate">
                              {session.title}
                            </h4>
                            {getStatusBadge(session.status)}
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-hh-muted">
                            <Clock className="w-3 h-3" />
                            {session.time} • {session.duration}
                            <span>•</span>
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-hh-primary/10 text-hh-primary border-hh-primary/20"
                            >
                              {session.fase}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}