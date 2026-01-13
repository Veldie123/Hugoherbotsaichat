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
  Eye,
  Bell,
} from "lucide-react";
import { getAllTechnieken } from "../../data/technieken-service";

interface LiveCoachingProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

interface WebinarSession {
  id: number;
  techniqueNumber: string;
  title: string;
  fase: string;
  date: string;
  time: string;
  duration: string;
  status: "live" | "scheduled" | "completed";
  attendees: number;
  maxAttendees: number | null;
  platform: string;
  registered: boolean;
}

export function LiveCoaching({ navigate, isAdmin }: LiveCoachingProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "attendees" | null>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const webinars: WebinarSession[] = useMemo(() => {
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

    const durations = ["45 min", "60 min", "90 min", "120 min"];
    const platforms = ["Zoom", "Microsoft Teams", "Google Meet"];
    const statuses: ("scheduled" | "completed")[] = ["scheduled", "completed"];

    return allTechnieken.slice(0, 12).map((tech, idx) => {
      const seed = seedFromString(tech.nummer + tech.naam);
      const isCompleted = seed % 3 === 0;
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + (isCompleted ? -seed % 30 : seed % 60));
      
      return {
        id: idx + 1,
        techniqueNumber: tech.nummer,
        title: tech.naam,
        fase: faseNamen[tech.fase] || "Algemeen",
        date: baseDate.toISOString().split('T')[0],
        time: `${10 + (seed % 8)}:00`,
        duration: durations[seed % durations.length],
        status: statuses[isCompleted ? 1 : 0],
        attendees: isCompleted ? 20 + (seed % 40) : 0,
        maxAttendees: 50,
        platform: platforms[seed % platforms.length],
        registered: seed % 2 === 0,
      };
    });
  }, []);

  const handleSort = (field: "date" | "attendees") => {
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

  const filteredWebinars = webinars.filter((session) => {
    const matchesSearch = searchQuery === "" ||
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.fase.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatusFilter === "all" || session.status === selectedStatusFilter;
    const matchesFase = selectedPhaseFilter === "all" || session.fase.toLowerCase().includes(selectedPhaseFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesFase;
  });

  const sortedWebinars = [...filteredWebinars].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "date":
        comparison = a.date.localeCompare(b.date);
        break;
      case "attendees":
        comparison = a.attendees - b.attendees;
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const upcomingSessions = webinars.filter((s) => s.status === "scheduled");
  const completedSessions = webinars.filter((s) => s.status === "completed");
  const registeredSessions = webinars.filter((s) => s.registered);
  const avgAttendees = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + s.attendees, 0) / completedSessions.length)
    : 0;

  return (
    <AppLayout currentPage="coaching" navigate={navigate} isAdmin={isAdmin}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              Live Webinars
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              Live coaching sessies met Hugo — vraag & antwoord
            </p>
          </div>
        </div>

        {/* KPI Cards */}
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
                +2
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Gepland
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text">
              {upcomingSessions.length}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-hh-ink" />
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Ingeschreven
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text">
              {registeredSessions.length}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-success/10 flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-hh-success" />
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Gem. Deelnemers
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text">
              {avgAttendees}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-hh-primary" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +3
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Bijgewoond
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text">
              {completedSessions.length}
            </p>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek webinars..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={selectedPhaseFilter} onValueChange={setSelectedPhaseFilter}>
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
            
            <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="scheduled">Gepland</SelectItem>
                <SelectItem value="completed">Afgelopen</SelectItem>
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
                      Webinar
                    </th>
                    <th className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold">
                      Techniek
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
                      Tijd
                    </th>
                    <th className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold">
                      Duur
                    </th>
                    <th 
                      className="text-right py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold cursor-pointer hover:bg-hh-ui-100 transition-colors select-none"
                      onClick={() => handleSort("attendees")}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        Deelnemers
                        <SortIcon column="attendees" />
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
                  {sortedWebinars.map((session, index) => (
                    <tr
                      key={session.id}
                      className={`border-t border-hh-border hover:bg-hh-ui-50 transition-colors cursor-pointer ${
                        index % 2 === 0 ? "bg-white" : "bg-hh-ui-50/30"
                      }`}
                    >
                      <td className="py-3 px-4">
                        <p className="text-[14px] leading-[20px] text-hh-text font-medium">
                          {session.title}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-mono bg-hh-ink/10 text-hh-ink border-hh-ink/20"
                        >
                          {session.techniqueNumber}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-[14px] text-hh-text">
                          <CalendarIcon className="w-3.5 h-3.5 text-hh-primary" />
                          {new Date(session.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-[14px] text-hh-muted">
                          <Clock className="w-3.5 h-3.5" />
                          {session.time}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[14px] text-hh-muted">
                        {session.duration}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-[14px] text-hh-text">
                          <Users className="w-3.5 h-3.5 text-hh-primary" />
                          {session.attendees}/{session.maxAttendees || '∞'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(session.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
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
                                  {session.registered ? "Uitschrijven" : "Inschrijven"}
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
          </Card>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedWebinars.map((session) => (
              <Card
                key={session.id}
                className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden hover:shadow-hh-md hover:border-hh-ink/30 transition-all"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <Badge
                      variant="outline"
                      className="text-[11px] font-mono bg-hh-ink/10 text-hh-ink border-hh-ink/20"
                    >
                      {session.techniqueNumber}
                    </Badge>
                    {getStatusBadge(session.status)}
                  </div>

                  <h3 className="text-[16px] leading-[24px] text-hh-text font-semibold">
                    {session.title}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[13px]">
                      <CalendarIcon className="w-4 h-4 text-hh-primary" />
                      <span className="text-hh-text">
                        {new Date(session.date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px]">
                      <Clock className="w-4 h-4 text-hh-muted" />
                      <span className="text-hh-muted">{session.time} • {session.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px]">
                      <Users className="w-4 h-4 text-hh-muted" />
                      <span className="text-hh-muted">{session.attendees}/{session.maxAttendees || '∞'} deelnemers</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-hh-border">
                    {session.status === "scheduled" ? (
                      <Button 
                        className={`w-full ${session.registered ? 'bg-hh-muted hover:bg-hh-muted/90' : 'bg-hh-ink hover:bg-hh-ink/90'}`}
                        size="sm"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        {session.registered ? "Ingeschreven" : "Inschrijven"}
                      </Button>
                    ) : (
                      <Button className="w-full bg-hh-ink hover:bg-hh-ink/90" size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Bekijk opname
                      </Button>
                    )}
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
