import { useState, useMemo } from "react";
import { AppLayout } from "./AppLayout";
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
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Award,
  Clock,
  Search,
  List,
  LayoutGrid,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BarChart2,
} from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { getTechniekByNummer, getFaseNaam } from "../../data/technieken-service";

interface AnalyticsProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

interface SkillData {
  id: number;
  code: string;
  skill: string;
  fase: string;
  score: number;
  sessions: number;
  trend: number;
}

export function Analytics({ navigate, isAdmin }: AnalyticsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [timePeriod, setTimePeriod] = useState("month");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"code" | "skill" | "score" | "sessions" | "trend">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const performanceData = {
    overallScore: 82,
    scoreDelta: 8,
    sessionsCompleted: 47,
    sessionsDelta: 12,
    avgSessionTime: "8m 32s",
    timeDelta: 15,
    completionRate: 94,
    completionDelta: 3,
  };

  const skillsBreakdown: SkillData[] = useMemo(() => [
    {
      id: 1,
      code: "2.1.2",
      skill: getTechniekByNummer("2.1.2")?.naam || "Meningsgerichte vragen",
      fase: "2",
      score: 91,
      sessions: 18,
      trend: 7,
    },
    {
      id: 2,
      code: "4.2.4",
      skill: getTechniekByNummer("4.2.4")?.naam || "Bezwaren herkennen",
      fase: "4",
      score: 85,
      sessions: 22,
      trend: 12,
    },
    {
      id: 3,
      code: "3.3",
      skill: getTechniekByNummer("3.3")?.naam || "Voordeel",
      fase: "3",
      score: 78,
      sessions: 15,
      trend: -2,
    },
    {
      id: 4,
      code: "4.1",
      skill: getTechniekByNummer("4.1")?.naam || "Proefafsluiting",
      fase: "4",
      score: 74,
      sessions: 12,
      trend: 5,
    },
    {
      id: 5,
      code: "2.1.6",
      skill: getTechniekByNummer("2.1.6")?.naam || "Actief en empathisch luisteren",
      fase: "2",
      score: 88,
      sessions: 20,
      trend: 4,
    },
    {
      id: 6,
      code: "1.2",
      skill: getTechniekByNummer("1.2")?.naam || "Gentleman's agreement",
      fase: "1",
      score: 71,
      sessions: 8,
      trend: -5,
    },
  ], []);

  const scenarioPerformance = [
    { scenario: "Discovery call - SaaS", attempts: 8, avgScore: 87, bestScore: 94 },
    { scenario: "Budget bezwaar", attempts: 12, avgScore: 82, bestScore: 91 },
    { scenario: "Cold call - SMB", attempts: 6, avgScore: 79, bestScore: 86 },
    { scenario: "Closing - Finale beslissing", attempts: 5, avgScore: 74, bestScore: 83 },
  ];

  const weeklyActivity = [
    { week: "Week 1", sessions: 8, avgScore: 74 },
    { week: "Week 2", sessions: 11, avgScore: 78 },
    { week: "Week 3", sessions: 13, avgScore: 81 },
    { week: "Week 4", sessions: 15, avgScore: 82 },
  ];

  const handleSort = (column: "code" | "skill" | "score" | "sessions" | "trend") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder(column === "code" || column === "skill" ? "asc" : "desc");
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

  const filteredSkills = useMemo(() => {
    let filtered = skillsBreakdown.filter((skill) =>
      skill.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (categoryFilter !== "all") {
      filtered = filtered.filter((skill) => skill.fase === categoryFilter);
    }

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "code":
          comparison = a.code.localeCompare(b.code);
          break;
        case "skill":
          comparison = a.skill.localeCompare(b.skill);
          break;
        case "score":
          comparison = a.score - b.score;
          break;
        case "sessions":
          comparison = a.sessions - b.sessions;
          break;
        case "trend":
          comparison = a.trend - b.trend;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [skillsBreakdown, searchQuery, categoryFilter, sortBy, sortOrder]);

  const totalSessions = skillsBreakdown.reduce((sum, s) => sum + s.sessions, 0);
  const avgScore = Math.round(skillsBreakdown.reduce((sum, s) => sum + s.score, 0) / skillsBreakdown.length);

  return (
    <AppLayout currentPage="analytics" navigate={navigate} isAdmin={isAdmin}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              Analytics & Voortgang
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              Jouw salesvaardigheden in cijfers — deze maand {performanceData.sessionsCompleted} sessies
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-hh-ink" />
              </div>
              <div
                className={`flex items-center gap-0.5 text-[10px] sm:text-[11px] ${
                  performanceData.scoreDelta > 0
                    ? "text-hh-success"
                    : "text-destructive"
                }`}
              >
                {performanceData.scoreDelta > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                +{Math.abs(performanceData.scoreDelta)}%
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Overall Score
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text font-medium">
              {performanceData.overallScore}%
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-hh-primary" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +{performanceData.sessionsDelta}
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Sessies voltooid
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text font-medium">
              {performanceData.sessionsCompleted}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-hh-ink" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +{performanceData.timeDelta}%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Gemiddelde tijd
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text font-medium">
              {performanceData.avgSessionTime}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-success/10 flex items-center justify-center">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-hh-success" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +{performanceData.completionDelta}%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Completion rate
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text font-medium">
              {performanceData.completionRate}%
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

            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Deze week</SelectItem>
                <SelectItem value="month">Deze maand</SelectItem>
                <SelectItem value="quarter">Dit kwartaal</SelectItem>
                <SelectItem value="year">Dit jaar</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Alle Fases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Fases</SelectItem>
                <SelectItem value="1">{getFaseNaam("1")}</SelectItem>
                <SelectItem value="2">{getFaseNaam("2")}</SelectItem>
                <SelectItem value="3">{getFaseNaam("3")}</SelectItem>
                <SelectItem value="4">{getFaseNaam("4")}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border border-hh-border rounded-lg overflow-hidden">
              <button
                className={`p-2.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-hh-ink text-white"
                    : "bg-white text-hh-muted hover:bg-hh-ui-50"
                }`}
                onClick={() => setViewMode("list")}
                aria-label="Lijst weergave"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                className={`p-2.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-hh-ink text-white"
                    : "bg-white text-hh-muted hover:bg-hh-ui-50"
                }`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid weergave"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Skills Breakdown Table */}
        <Card className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-hh-border">
            <h2 className="text-[18px] sm:text-[20px] leading-[26px] sm:leading-[28px] text-hh-text">
              Vaardigheden analyse
            </h2>
            <p className="text-[13px] sm:text-[14px] leading-[18px] sm:leading-[20px] text-hh-muted mt-1">
              Jouw score per techniek — {filteredSkills.length} technieken gevonden
            </p>
          </div>

          {viewMode === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hh-border bg-hh-ui-50/50">
                    <th className="text-left p-3 sm:p-4">
                      <button
                        className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-hh-muted hover:text-hh-text transition-colors"
                        onClick={() => handleSort("code")}
                      >
                        Code
                        <SortIcon column="code" />
                      </button>
                    </th>
                    <th className="text-left p-3 sm:p-4">
                      <button
                        className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-hh-muted hover:text-hh-text transition-colors"
                        onClick={() => handleSort("skill")}
                      >
                        Techniek
                        <SortIcon column="skill" />
                      </button>
                    </th>
                    <th className="text-left p-3 sm:p-4 hidden md:table-cell">
                      <span className="text-[12px] sm:text-[13px] font-medium text-hh-muted">
                        Fase
                      </span>
                    </th>
                    <th className="text-left p-3 sm:p-4">
                      <button
                        className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-hh-muted hover:text-hh-text transition-colors"
                        onClick={() => handleSort("sessions")}
                      >
                        Sessies
                        <SortIcon column="sessions" />
                      </button>
                    </th>
                    <th className="text-left p-3 sm:p-4">
                      <button
                        className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-hh-muted hover:text-hh-text transition-colors"
                        onClick={() => handleSort("trend")}
                      >
                        Trend
                        <SortIcon column="trend" />
                      </button>
                    </th>
                    <th className="text-left p-3 sm:p-4 min-w-[180px]">
                      <button
                        className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-hh-muted hover:text-hh-text transition-colors"
                        onClick={() => handleSort("score")}
                      >
                        Score
                        <SortIcon column="score" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSkills.map((skill) => (
                    <tr
                      key={skill.id}
                      className="border-b border-hh-border last:border-0 hover:bg-hh-ui-50/30 transition-colors"
                    >
                      <td className="p-3 sm:p-4">
                        <Badge
                          variant="outline"
                          className="text-[11px] bg-hh-ink/10 text-hh-ink border-hh-ink/20"
                        >
                          {skill.code}
                        </Badge>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className="text-[14px] sm:text-[15px] text-hh-text">
                          {skill.skill}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className="text-[11px] bg-hh-primary/10 text-hh-primary border-hh-primary/20"
                        >
                          {getFaseNaam(skill.fase)}
                        </Badge>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className="text-[14px] text-hh-muted">
                          {skill.sessions}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div
                          className={`flex items-center gap-1 text-[13px] ${
                            skill.trend > 0
                              ? "text-hh-success"
                              : skill.trend < 0
                              ? "text-destructive"
                              : "text-hh-muted"
                          }`}
                        >
                          {skill.trend > 0 ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : skill.trend < 0 ? (
                            <TrendingDown className="w-3.5 h-3.5" />
                          ) : null}
                          {skill.trend > 0 ? "+" : ""}
                          {skill.trend}%
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <ProgressBar value={skill.score} size="sm" />
                          </div>
                          <span className="text-[14px] sm:text-[15px] text-hh-text font-medium w-12 text-right">
                            {skill.score}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map((skill) => (
                <Card
                  key={skill.id}
                  className="p-4 rounded-[12px] border-hh-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="outline"
                      className="text-[11px] bg-hh-ink/10 text-hh-ink border-hh-ink/20"
                    >
                      {skill.code}
                    </Badge>
                    <div
                      className={`flex items-center gap-1 text-[12px] ${
                        skill.trend > 0
                          ? "text-hh-success"
                          : skill.trend < 0
                          ? "text-destructive"
                          : "text-hh-muted"
                      }`}
                    >
                      {skill.trend > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : skill.trend < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : null}
                      {skill.trend > 0 ? "+" : ""}
                      {skill.trend}%
                    </div>
                  </div>
                  <h3 className="text-[15px] leading-[22px] text-hh-text mb-2">
                    {skill.skill}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-hh-primary/10 text-hh-primary border-hh-primary/20"
                    >
                      {getFaseNaam(skill.fase)}
                    </Badge>
                    <span className="text-[12px] text-hh-muted">
                      {skill.sessions} sessies
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <ProgressBar value={skill.score} size="sm" />
                    </div>
                    <span className="text-[16px] text-hh-text font-medium">
                      {skill.score}%
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Scenario Performance & Weekly Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-5 sm:p-6 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-hh-ink" />
              </div>
              <div>
                <h3 className="text-[18px] leading-[24px] text-hh-text">
                  Scenario performance
                </h3>
                <p className="text-[13px] text-hh-muted">
                  Jouw resultaten per scenario
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {scenarioPerformance.map((scenario, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-hh-ui-50"
                >
                  <div>
                    <p className="text-[14px] sm:text-[15px] leading-[22px] text-hh-text mb-0.5">
                      {scenario.scenario}
                    </p>
                    <p className="text-[12px] sm:text-[13px] leading-[18px] text-hh-muted">
                      {scenario.attempts} pogingen • Beste: {scenario.bestScore}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[20px] sm:text-[22px] leading-[28px] text-hh-text font-medium">
                      {scenario.avgScore}%
                    </p>
                    <p className="text-[11px] leading-[14px] text-hh-muted">
                      gemiddeld
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-hh-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-hh-primary" />
              </div>
              <div>
                <h3 className="text-[18px] leading-[24px] text-hh-text">
                  Weekelijkse activiteit
                </h3>
                <p className="text-[13px] text-hh-muted">
                  Jouw voortgang per week
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {weeklyActivity.map((week, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] sm:text-[15px] leading-[22px] text-hh-text">
                      {week.week}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] leading-[18px] text-hh-muted">
                        {week.sessions} sessies
                      </span>
                      <span className="text-[15px] leading-[22px] text-hh-text font-medium">
                        {week.avgScore}%
                      </span>
                    </div>
                  </div>
                  <ProgressBar value={week.avgScore} size="sm" />
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 rounded-lg bg-hh-success/5 border border-hh-success/20">
              <div className="flex gap-3">
                <TrendingUp className="w-5 h-5 text-hh-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[14px] leading-[20px] text-hh-text mb-1">
                    Mooie trend!
                  </p>
                  <p className="text-[13px] leading-[19px] text-hh-muted">
                    Je score stijgt elke week. Blijf oefenen met Hugo om deze
                    lijn vast te houden.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Hugo's Insight */}
        <Card className="p-5 sm:p-6 rounded-[16px] shadow-hh-sm border-hh-ink/20 bg-hh-ink/5">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-hh-ink/10 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-hh-ink" />
            </div>
            <div>
              <h3 className="text-[18px] sm:text-[20px] leading-[26px] sm:leading-[28px] text-hh-text mb-2">
                Hugo's analyse
              </h3>
              <p className="text-[14px] sm:text-[15px] leading-[22px] sm:leading-[24px] text-hh-muted">
                Je ontdekkingsfase (91%) is sterk — dit is je grootste wapen. Nu focus op negotiation (71%) en closing (74%). Dáár win je deals. Train deze 15 min per dag, de komende 2 weken. Je ziet resultaat binnen 10 sessies.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
