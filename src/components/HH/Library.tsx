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
  Search,
  List,
  LayoutGrid,
  Play,
  Star,
  Clock,
  Users,
  TrendingUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BookOpen,
} from "lucide-react";

type ScenarioCategory = "all" | "discovery" | "objections" | "closing" | "custom";
type ScenarioLevel = "all" | "beginner" | "intermediate" | "advanced";
type ViewMode = "grid" | "list";
type SortField = "title" | "category" | "level" | "completions" | "avgScore";
type SortDirection = "asc" | "desc";

interface Scenario {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  description: string;
  techniques: string[];
  completions: number;
  avgScore: number;
  isCustom?: boolean;
  isFavorite?: boolean;
}

interface LibraryProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

export function Library({ navigate, isAdmin }: LibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<ScenarioCategory>("all");
  const [level, setLevel] = useState<ScenarioLevel>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("completions");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const scenarios: Scenario[] = [
    {
      id: "1",
      title: "Discovery call - SaaS enterprise",
      category: "Discovery",
      level: "Intermediate",
      duration: "8-10 min",
      description: "Oefen E.P.I.C vragen met een CTO van een enterprise SaaS bedrijf. Focus op technische en businesswaarde.",
      techniques: ["E.P.I.C", "Discovery", "Active Listening"],
      completions: 1247,
      avgScore: 78,
      isFavorite: true,
    },
    {
      id: "2",
      title: "Budget bezwaar - Prijsonderhandeling",
      category: "Objections",
      level: "Advanced",
      duration: "6-8 min",
      description: '"Het budget is op voor dit kwartaal" — leer waarde te tonen en urgentie te creëren zonder discount.',
      techniques: ["Objection Handling", "Value Selling", "Urgency"],
      completions: 892,
      avgScore: 72,
      isFavorite: true,
    },
    {
      id: "3",
      title: "Cold call - SMB owner",
      category: "Discovery",
      level: "Beginner",
      duration: "5-7 min",
      description: "Eerste contact met een drukke eigenaar van een klein bedrijf. Krijg binnen 2 minuten interesse.",
      techniques: ["Discovery", "Value Proposition", "Next Steps"],
      completions: 2134,
      avgScore: 81,
      isFavorite: false,
    },
    {
      id: "4",
      title: "Closing - Finale beslissing",
      category: "Closing",
      level: "Advanced",
      duration: "10-12 min",
      description: "Help de prospect de knoop doorhakken. Ze twijfelen tussen jou en concurrent — maak het verschil.",
      techniques: ["Closing", "Decision Making", "Next Steps"],
      completions: 564,
      avgScore: 69,
      isFavorite: false,
    },
    {
      id: "5",
      title: "Concurrentiebezwaar - We hebben al X",
      category: "Objections",
      level: "Intermediate",
      duration: "7-9 min",
      description: '"We werken al met concurrent X en zijn tevreden" — leer switchen mogelijk te maken zonder afkraken.',
      techniques: ["Objection Handling", "Challenger", "Differentiation"],
      completions: 1056,
      avgScore: 75,
      isFavorite: true,
    },
    {
      id: "6",
      title: "Multi-stakeholder meeting",
      category: "Discovery",
      level: "Advanced",
      duration: "12-15 min",
      description: "Gesprek met CFO, CTO en Head of Sales tegelijk. Elke stakeholder heeft andere prioriteiten.",
      techniques: ["Discovery", "Stakeholder Management", "E.P.I.C"],
      completions: 412,
      avgScore: 67,
      isFavorite: false,
    },
  ];

  const filteredScenarios = scenarios.filter((scenario) => {
    const matchesSearch =
      searchQuery === "" ||
      scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.techniques.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory =
      category === "all" || scenario.category.toLowerCase() === category;
    
    const matchesLevel =
      level === "all" || scenario.level.toLowerCase() === level;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const sortedScenarios = [...filteredScenarios].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "category":
        comparison = a.category.localeCompare(b.category);
        break;
      case "level":
        comparison = a.level.localeCompare(b.level);
        break;
      case "completions":
        comparison = a.completions - b.completions;
        break;
      case "avgScore":
        comparison = a.avgScore - b.avgScore;
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "title" || field === "category" || field === "level" ? "asc" : "desc");
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

  const totalScenarios = scenarios.length;
  const yourCompletions = scenarios.reduce((sum, s) => sum + Math.floor(s.completions / 100), 0);
  const avgScore = Math.round(scenarios.reduce((sum, s) => sum + s.avgScore, 0) / scenarios.length);
  const favoritesCount = scenarios.filter(s => s.isFavorite).length;

  return (
    <AppLayout currentPage="library" navigate={navigate} isAdmin={isAdmin}>
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              Scenario Bibliotheek
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              {filteredScenarios.length} scenario's — van discovery tot closing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-ink/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-hh-ink" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +3
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Totaal Scenario's
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text">
              {totalScenarios}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-primary/10 flex items-center justify-center">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-hh-primary" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-hh-success/10 text-hh-success border-hh-success/20"
              >
                +8
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Jouw Voltooiingen
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text">
              {yourCompletions}
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
                +4%
              </Badge>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Gem. Score
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text">
              {avgScore}%
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Favorieten
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text">
              {favoritesCount}
            </p>
          </Card>
        </div>

        <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek scenario's..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={category} onValueChange={(v) => setCategory(v as ScenarioCategory)}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle categorieën" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle categorieën</SelectItem>
                <SelectItem value="discovery">Discovery</SelectItem>
                <SelectItem value="objections">Objections</SelectItem>
                <SelectItem value="closing">Closing</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={level} onValueChange={(v) => setLevel(v as ScenarioLevel)}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle niveaus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle niveaus</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
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

        {sortedScenarios.filter(s => s.isFavorite).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-[18px] leading-[24px] text-hh-text font-semibold">
                Aanbevolen door Hugo
              </h2>
            </div>
          </div>
        )}

        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedScenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden hover:shadow-hh-md hover:border-hh-ink/30 transition-all cursor-pointer"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <Badge
                      variant="outline"
                      className="text-[11px] bg-hh-ink/10 text-hh-ink border-hh-ink/20"
                    >
                      {scenario.category}
                    </Badge>
                    {scenario.isFavorite && (
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-[18px] leading-[24px] text-hh-text font-semibold mb-2">
                      {scenario.title}
                    </h3>
                    <p className="text-[14px] leading-[20px] text-hh-muted line-clamp-2">
                      {scenario.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {scenario.techniques.map((tech, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-[11px] bg-hh-ui-50 text-hh-muted border-hh-border"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[13px] text-hh-muted pt-3 border-t border-hh-border">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{scenario.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{scenario.completions.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      <span>{scenario.avgScore}% avg</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-hh-ink hover:bg-hh-ink/90 text-white"
                    onClick={() => navigate?.("roleplay")}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Scenario
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

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
                        Scenario
                        <SortIcon column="title" />
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold cursor-pointer hover:bg-hh-ui-100 transition-colors select-none"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center gap-1.5">
                        Categorie
                        <SortIcon column="category" />
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold cursor-pointer hover:bg-hh-ui-100 transition-colors select-none"
                      onClick={() => handleSort("level")}
                    >
                      <div className="flex items-center gap-1.5">
                        Niveau
                        <SortIcon column="level" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold">
                      Duur
                    </th>
                    <th 
                      className="text-right py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold cursor-pointer hover:bg-hh-ui-100 transition-colors select-none"
                      onClick={() => handleSort("completions")}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        Gespeeld
                        <SortIcon column="completions" />
                      </div>
                    </th>
                    <th 
                      className="text-right py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold cursor-pointer hover:bg-hh-ui-100 transition-colors select-none"
                      onClick={() => handleSort("avgScore")}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        Gem. Score
                        <SortIcon column="avgScore" />
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 text-[13px] leading-[18px] text-hh-text font-semibold">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedScenarios.map((scenario, index) => (
                    <tr
                      key={scenario.id}
                      className={`border-t border-hh-border hover:bg-hh-ui-50 transition-colors cursor-pointer ${
                        index % 2 === 0 ? "bg-white" : "bg-hh-ui-50/30"
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {scenario.isFavorite && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                          <p className="text-[14px] leading-[20px] text-hh-text font-medium">
                            {scenario.title}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="text-[11px] bg-hh-ink/10 text-hh-ink border-hh-ink/20"
                        >
                          {scenario.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="text-[11px] bg-hh-primary/10 text-hh-primary border-hh-primary/20"
                        >
                          {scenario.level}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[14px] text-hh-muted">
                        {scenario.duration}
                      </td>
                      <td className="py-3 px-4 text-right text-[14px] text-hh-text">
                        {scenario.completions.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[14px] leading-[20px] text-hh-success font-medium">
                          {scenario.avgScore}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          className="bg-hh-ink hover:bg-hh-ink/90 text-white gap-1.5"
                          onClick={() => navigate?.("roleplay")}
                        >
                          <Play className="w-3.5 h-3.5" />
                          Start
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {filteredScenarios.length === 0 && (
          <Card className="p-12 rounded-[16px] shadow-hh-sm border-hh-border text-center">
            <Search className="w-12 h-12 text-hh-muted mx-auto mb-4" />
            <h3 className="text-[20px] leading-[28px] text-hh-text mb-2">
              Geen matches
            </h3>
            <p className="text-[16px] leading-[24px] text-hh-muted mb-6">
              Probeer andere zoektermen of pas de filters aan
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setCategory("all");
                setLevel("all");
                setSearchQuery("");
              }}
            >
              Reset filters
            </Button>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
