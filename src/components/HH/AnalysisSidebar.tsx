import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  FileAudio,
  FileVideo,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../ui/utils";

interface Analysis {
  id: string;
  title: string;
  type: "audio" | "video";
  uploadDate: string;
  duration: string;
  status: "processing" | "completed" | "failed";
  overallScore?: number;
  scoreDelta?: "up" | "down" | "neutral";
  topTechnique?: string;
  phase?: string;
}

interface AnalysisSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewAnalysis: () => void;
  onSelectAnalysis: (analysisId: string) => void;
  currentAnalysisId?: string;
  userId?: string;
}

function groupAnalysesByDate(analyses: Analysis[]): Record<string, Analysis[]> {
  const groups: Record<string, Analysis[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  analyses.forEach((analysis) => {
    const analysisDate = new Date(analysis.uploadDate);
    const analysisDay = new Date(analysisDate.getFullYear(), analysisDate.getMonth(), analysisDate.getDate());
    
    let groupName: string;
    if (analysisDay >= today) {
      groupName = "Vandaag";
    } else if (analysisDay >= yesterday) {
      groupName = "Gisteren";
    } else if (analysisDay >= thisWeek) {
      groupName = "Deze week";
    } else {
      groupName = "Ouder";
    }

    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(analysis);
  });

  return groups;
}

export function AnalysisSidebar({
  isCollapsed,
  onToggleCollapse,
  onNewAnalysis,
  onSelectAnalysis,
  currentAnalysisId,
  userId,
}: AnalysisSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const mockAnalyses: Analysis[] = [
    {
      id: "1",
      title: "Klantgesprek NL Bakkerij",
      type: "audio",
      uploadDate: new Date().toISOString(),
      duration: "12:34",
      status: "completed",
      overallScore: 78,
      scoreDelta: "up",
      topTechnique: "Wedervraag",
      phase: "2.1",
    },
    {
      id: "2",
      title: "Demo call Acme Corp",
      type: "video",
      uploadDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      duration: "45:12",
      status: "completed",
      overallScore: 65,
      scoreDelta: "neutral",
      topTechnique: "Lock-in",
      phase: "3.2",
    },
    {
      id: "3",
      title: "Sales pitch TechStart",
      type: "audio",
      uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      duration: "08:45",
      status: "completed",
      overallScore: 82,
      scoreDelta: "up",
      topTechnique: "Impact Question",
      phase: "2.3",
    },
    {
      id: "4",
      title: "Follow-up gesprek",
      type: "audio",
      uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      duration: "22:10",
      status: "completed",
      overallScore: 71,
      scoreDelta: "down",
      topTechnique: "Commitment",
      phase: "2.4",
    },
    {
      id: "5",
      title: "Nieuw gesprek",
      type: "audio",
      uploadDate: new Date().toISOString(),
      duration: "05:30",
      status: "processing",
    },
  ];

  const filteredAnalyses = useMemo(() => {
    if (!searchQuery.trim()) return mockAnalyses;
    const query = searchQuery.toLowerCase();
    return mockAnalyses.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.topTechnique?.toLowerCase().includes(query) ||
        a.phase?.includes(query)
    );
  }, [searchQuery, mockAnalyses]);

  const groupedAnalyses = useMemo(
    () => groupAnalysesByDate(filteredAnalyses),
    [filteredAnalyses]
  );

  const groupOrder = ["Vandaag", "Gisteren", "Deze week", "Ouder"];

  const getStatusIcon = (status: Analysis["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case "processing":
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-3 h-3 text-red-500" />;
    }
  };

  const getDeltaIcon = (delta?: Analysis["scoreDelta"]) => {
    switch (delta) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case "down":
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-slate-900 border-r border-slate-700 flex flex-col items-center py-3 gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewAnalysis}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
          title="Nieuwe analyse"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-72 h-full bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="p-3 flex items-center justify-between border-b border-slate-700">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          onClick={onNewAnalysis}
          size="sm"
          className="bg-hh-primary hover:bg-hh-primary/90 text-white gap-1"
        >
          <Plus className="w-4 h-4" />
          Nieuwe analyse
        </Button>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Zoek analyses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {groupOrder.map((groupName) => {
          const analyses = groupedAnalyses[groupName];
          if (!analyses || analyses.length === 0) return null;

          return (
            <div key={groupName} className="mb-4">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 mb-2">
                {groupName}
              </h3>
              <div className="space-y-1">
                {analyses.map((analysis) => (
                  <button
                    key={analysis.id}
                    onClick={() => onSelectAnalysis(analysis.id)}
                    className={cn(
                      "w-full p-2 rounded-lg text-left transition-colors",
                      "hover:bg-slate-800",
                      currentAnalysisId === analysis.id
                        ? "bg-slate-800 border border-slate-600"
                        : "bg-transparent"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {analysis.type === "audio" ? (
                        <FileAudio className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <FileVideo className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-white truncate font-medium">
                            {analysis.title}
                          </span>
                          {getStatusIcon(analysis.status)}
                        </div>
                        {analysis.status === "completed" && (
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            {analysis.phase && (
                              <span className="text-hh-primary font-medium">
                                {analysis.phase}
                              </span>
                            )}
                            {analysis.overallScore !== undefined && (
                              <span className="flex items-center gap-0.5">
                                {analysis.overallScore}%
                                {getDeltaIcon(analysis.scoreDelta)}
                              </span>
                            )}
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {analysis.duration}
                            </span>
                          </div>
                        )}
                        {analysis.status === "processing" && (
                          <span className="text-xs text-blue-400">
                            Analyseren...
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {filteredAnalyses.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <FileAudio className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Geen analyses gevonden</p>
          </div>
        )}
      </div>
    </div>
  );
}
