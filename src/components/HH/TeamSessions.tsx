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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  BarChart3,
  Play,
  List,
  LayoutGrid,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Award,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  sessionsThisWeek: number;
  avgScore: number;
  delta: number;
  lastSession: string;
  topTechnique: string;
  status: "active" | "inactive" | "new";
}

interface TeamSessionsProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

export function TeamSessions({ navigate, isAdmin }: TeamSessionsProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "sessions" | "score" | "lastSession">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Sarah van Dijk",
      initials: "SV",
      role: "Senior Sales Rep",
      sessionsThisWeek: 8,
      avgScore: 87,
      delta: 5,
      lastSession: "2 uur geleden",
      topTechnique: "E.P.I.C",
      status: "active",
    },
    {
      id: "2",
      name: "Mark Peters",
      initials: "MP",
      role: "Account Executive",
      sessionsThisWeek: 12,
      avgScore: 82,
      delta: 8,
      lastSession: "5 uur geleden",
      topTechnique: "Objection Handling",
      status: "active",
    },
    {
      id: "3",
      name: "Lisa de Jong",
      initials: "LJ",
      role: "SDR",
      sessionsThisWeek: 15,
      avgScore: 79,
      delta: 12,
      lastSession: "1 dag geleden",
      topTechnique: "Discovery",
      status: "active",
    },
    {
      id: "4",
      name: "Tom Bakker",
      initials: "TB",
      role: "SDR",
      sessionsThisWeek: 6,
      avgScore: 74,
      delta: -3,
      lastSession: "3 dagen geleden",
      topTechnique: "Active Listening",
      status: "inactive",
    },
    {
      id: "5",
      name: "Emma Visser",
      initials: "EV",
      role: "Junior Sales Rep",
      sessionsThisWeek: 10,
      avgScore: 71,
      delta: 15,
      lastSession: "4 uur geleden",
      topTechnique: "Value Selling",
      status: "new",
    },
  ];

  const teamStats = useMemo(() => {
    const totalSessions = teamMembers.reduce((sum, m) => sum + m.sessionsThisWeek, 0);
    const avgScore = Math.round(teamMembers.reduce((sum, m) => sum + m.avgScore, 0) / teamMembers.length);
    const activeMembers = teamMembers.filter(m => m.status === "active").length;
    return {
      totalMembers: teamMembers.length,
      totalSessions,
      avgScore,
      activeMembers,
    };
  }, []);

  const handleSort = (column: "name" | "sessions" | "score" | "lastSession") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder(column === "name" ? "asc" : "desc");
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

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      const matchesSearch = searchQuery === "" ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || member.role.toLowerCase().includes(roleFilter.toLowerCase());
      const matchesStatus = statusFilter === "all" || member.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchQuery, roleFilter, statusFilter]);

  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "sessions":
          comparison = a.sessionsThisWeek - b.sessionsThisWeek;
          break;
        case "score":
          comparison = a.avgScore - b.avgScore;
          break;
        case "lastSession":
          comparison = a.lastSession.localeCompare(b.lastSession);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredMembers, sortBy, sortOrder]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-hh-ink/10 text-hh-ink border-hh-ink/20 text-[11px]">
            Actief
          </Badge>
        );
      case "new":
        return (
          <Badge className="bg-hh-warn/10 text-hh-warn border-hh-warn/20 text-[11px]">
            Nieuw
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-hh-muted/10 text-hh-muted border-hh-muted/20 text-[11px]">
            Inactief
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout currentPage="team" navigate={navigate} isAdmin={isAdmin}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              Team Overzicht
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              Bekijk de prestaties en voortgang van je teamleden
            </p>
          </div>
        </div>

        {/* KPI Cards - User View colors (hh-ink/hh-primary) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-hh-ink" />
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Teamleden
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {teamStats.totalMembers}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-primary/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-hh-primary" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +4%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Gem. Score
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {teamStats.avgScore}%
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
                +12%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Totaal Sessies
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {teamStats.totalSessions}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-primary/10 flex items-center justify-center">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-hh-primary" />
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Actieve Leden
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {teamStats.activeMembers}
            </p>
          </Card>
        </div>

        {/* Search, View Toggle & Filters Card */}
        <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek teamleden..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Rollen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Rollen</SelectItem>
                <SelectItem value="sdr">SDR</SelectItem>
                <SelectItem value="account">Account Executive</SelectItem>
                <SelectItem value="senior">Senior Sales Rep</SelectItem>
                <SelectItem value="junior">Junior Sales Rep</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[160px]">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Actief</SelectItem>
                <SelectItem value="inactive">Inactief</SelectItem>
                <SelectItem value="new">Nieuw</SelectItem>
              </SelectContent>
            </Select>
            
            {/* View Toggle - hh-ink colors */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`px-2.5 ${viewMode === "list" ? "bg-hh-ink/10 text-hh-ink" : "text-hh-muted hover:text-hh-ink"}`}
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`px-2.5 ${viewMode === "grid" ? "bg-hh-ink/10 text-hh-ink" : "text-hh-muted hover:text-hh-ink"}`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* List View: Data Table */}
        {viewMode === "list" && (
          <Card className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden">
            {/* Mobile: Card List */}
            <div className="block lg:hidden divide-y divide-hh-border">
              {sortedMembers.map((member) => (
                <div key={member.id} className="p-5 space-y-4 hover:bg-hh-ui-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarFallback className="bg-hh-ink text-white text-[16px]">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-[18px] leading-[26px] text-hh-text font-[700]">
                          {member.name}
                        </h4>
                        {getStatusBadge(member.status)}
                      </div>
                      <p className="text-[14px] leading-[20px] text-hh-muted">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-[12px] leading-[16px] text-hh-muted uppercase tracking-wide">
                        Sessies
                      </p>
                      <p className="text-[24px] leading-[32px] text-hh-text font-[700]">
                        {member.sessionsThisWeek}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[12px] leading-[16px] text-hh-muted uppercase tracking-wide">
                        Score
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[24px] leading-[32px] text-hh-text font-[700]">
                          {member.avgScore}%
                        </span>
                        <div
                          className={`flex items-center gap-0.5 text-[13px] font-[600] ${
                            member.delta > 0
                              ? "text-hh-success"
                              : "text-destructive"
                          }`}
                        >
                          {member.delta > 0 ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                          )}
                          {Math.abs(member.delta)}%
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 space-y-1.5 pt-2 border-t border-hh-border">
                      <p className="text-[12px] leading-[16px] text-hh-muted uppercase tracking-wide">
                        Top techniek
                      </p>
                      <Badge variant="outline" className="text-[13px] px-3 py-1">
                        {member.topTechnique}
                      </Badge>
                    </div>

                    <div className="col-span-2 space-y-1">
                      <p className="text-[12px] leading-[16px] text-hh-muted uppercase tracking-wide">
                        Laatst actief
                      </p>
                      <div className="flex items-center gap-1.5 text-[14px] leading-[20px] text-hh-text">
                        <Clock className="w-3.5 h-3.5 text-hh-muted" />
                        {member.lastSession}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1.5">
                        Teamlid
                        <SortIcon column="name" />
                      </div>
                    </TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("sessions")}
                    >
                      <div className="flex items-center gap-1.5">
                        Sessies
                        <SortIcon column="sessions" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("score")}
                    >
                      <div className="flex items-center gap-1.5">
                        Score
                        <SortIcon column="score" />
                      </div>
                    </TableHead>
                    <TableHead>Top techniek</TableHead>
                    <TableHead>Laatste sessie</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-hh-ui-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-hh-ink text-white">
                              {member.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[16px] leading-[24px] text-hh-text">
                            {member.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[14px] leading-[20px] text-hh-muted">
                          {member.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-[16px] leading-[24px] text-hh-text">
                          {member.sessionsThisWeek}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-[16px] leading-[24px] text-hh-text">
                            {member.avgScore}%
                          </span>
                          <div
                            className={`flex items-center gap-1 text-[12px] ${
                              member.delta > 0
                                ? "text-hh-success"
                                : "text-destructive"
                            }`}
                          >
                            {member.delta > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {Math.abs(member.delta)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[12px]">
                          {member.topTechnique}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-[14px] leading-[20px] text-hh-muted">
                          <Clock className="w-3 h-3" />
                          {member.lastSession}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(member.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Grid View: Member Cards */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedMembers.map((member) => (
              <Card key={member.id} className="p-5 rounded-[16px] shadow-hh-sm border-hh-border hover:shadow-hh-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="bg-hh-ink text-white text-[18px]">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-[18px] leading-[26px] text-hh-text font-[600] truncate">
                        {member.name}
                      </h3>
                      {getStatusBadge(member.status)}
                    </div>
                    <p className="text-[14px] leading-[20px] text-hh-muted">
                      {member.role}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[12px] leading-[16px] text-hh-muted uppercase tracking-wide mb-1">
                      Sessies
                    </p>
                    <p className="text-[24px] leading-[32px] text-hh-text font-[700]">
                      {member.sessionsThisWeek}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] leading-[16px] text-hh-muted uppercase tracking-wide mb-1">
                      Score
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[24px] leading-[32px] text-hh-text font-[700]">
                        {member.avgScore}%
                      </span>
                      <div
                        className={`flex items-center gap-0.5 text-[13px] font-[600] ${
                          member.delta > 0
                            ? "text-hh-success"
                            : "text-destructive"
                        }`}
                      >
                        {member.delta > 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {Math.abs(member.delta)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-hh-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-hh-muted">Top techniek</span>
                    <Badge variant="outline" className="text-[12px]">
                      {member.topTechnique}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-hh-muted">Laatst actief</span>
                    <div className="flex items-center gap-1.5 text-[13px] text-hh-text">
                      <Clock className="w-3.5 h-3.5 text-hh-muted" />
                      {member.lastSession}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Hugo's Team Tip */}
        <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-primary/20 bg-hh-primary/5">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-hh-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-hh-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-[20px] leading-[28px] text-hh-text mb-2">
                Hugo's team tip
              </h3>
              <p className="text-[16px] leading-[24px] text-hh-muted">
                Je team laat geweldige vooruitgang zien deze week. Blijf samen oefenen — consistent trainen is de sleutel tot langdurige groei.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
