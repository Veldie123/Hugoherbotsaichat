import { AppLayout } from "./AppLayout";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { EmptyState } from "./EmptyState";
import {
  Play,
  Radio,
  MessageSquare,
  ArrowRight,
  Video,
  FileSearch,
} from "lucide-react";
import { getDailyQuote } from "../../data/hugoQuotes";
import { getTechniekByNummer, getFaseNaam } from "../../data/technieken-service";

// Progress bar - full width above action cards
const SalesFlowProgress = () => {
  const faseLabels = ["-1\nVoorber.", "1\nOpening", "2\nOntdekking", "3\nVoorstel", "4\nAfsluiting"];
  const progress = [100, 100, 60, 20, 0]; // Example progress values
  // Green for completed (0,1), blue for in progress (2), gray for not started (3,4)
  const faseColors = [
    "bg-emerald-500", // Fase -1: completed
    "bg-emerald-500", // Fase 1: completed  
    "bg-blue-400",    // Fase 2: in progress
    "bg-slate-200",   // Fase 3: not started
    "bg-slate-200",   // Fase 4: not started
  ];
  
  const completedCount = 4;
  const totalCount = 12;
  const percentage = Math.round((completedCount / totalCount) * 100);
  
  return (
    <Card className="p-4 rounded-[16px] border-hh-border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[18px] font-semibold text-hh-text">E.P.I.C Sales Flow</h2>
        <span className="text-[13px] text-hh-muted">{completedCount}/{totalCount} onderwerpen • {percentage}%</span>
      </div>
      <div className="flex gap-1">
        {progress.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col gap-1.5">
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${faseColors[index]}`}
                style={{ width: `${value}%` }}
              />
            </div>
            <div className="text-center">
              <span className="text-[11px] text-hh-muted whitespace-pre-line">{faseLabels[index]}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// KPI badge for card corner - larger and more readable
const CardKPI = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-end">
    <span className="text-[16px] font-semibold text-hh-text">{value}</span>
    <span className="text-[11px] text-hh-muted">{label}</span>
  </div>
);

interface DashboardProps {
  hasData?: boolean;
  navigate?: (page: string) => void;
  isAdmin?: boolean; // Add isAdmin prop
}

export function Dashboard({ hasData = true, navigate, isAdmin = false }: DashboardProps) {
  // Load current technique from SSOT for "Huidige topic"
  const currentTechnique = getTechniekByNummer("2.1.1");
  const currentFaseNaam = currentTechnique ? getFaseNaam(currentTechnique.fase) : "";

  if (!hasData) {
    return (
      <AppLayout currentPage="dashboard" navigate={navigate} isAdmin={isAdmin}>
        <div className="p-8">
          <EmptyState
            icon={Play}
            title="Klaar om te beginnen?"
            body="Je eerste role-play duurt 2 minuten. Daarna weet je direct waar je staat — en wat je volgende stap is."
            primaryCta={{
              label: "Begin role-play",
              onClick: () => navigate?.("roleplay"),
            }}
            secondaryCta={{
              label: "Bekijk bibliotheek",
              onClick: () => navigate?.("library"),
            }}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPage="dashboard" navigate={navigate} isAdmin={isAdmin}>
      <div className="p-4 sm:p-5 lg:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="mb-1 text-[28px] leading-[36px] sm:text-[32px] sm:leading-[40px] font-semibold text-hh-text">
              Welkom terug, Jan
            </h1>
            <p className="text-[14px] leading-[20px] text-hh-muted">
              will + skill + drill
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[18px]">🔥</span>
            <span className="text-[16px] font-medium text-hh-text">7 dagen streak</span>
          </div>
        </div>

        {/* Progress Card */}
        <SalesFlowProgress />

        {/* 4 Action Cards - horizontal layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Video */}
          <Card 
            className="p-3 rounded-[12px] border-hh-border hover:border-hh-primary/40 hover:shadow-lg transition-all cursor-pointer active:scale-[0.99]"
            onClick={() => navigate?.("videos")}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-hh-primary/10 flex items-center justify-center">
                  <Video className="w-4 h-4 text-hh-primary" />
                </div>
                <div>
                  <h3 className="text-[14px] leading-[18px] text-hh-text font-medium">Video</h3>
                  <p className="text-[11px] text-hh-muted">11 bekeken</p>
                </div>
              </div>
              <CardKPI value="56%" label="voltooid" />
            </div>

            <div className="mb-2 p-2 rounded-lg bg-hh-ui-50/50 border border-hh-border">
              <div className="text-[10px] text-hh-muted mb-0.5">Huidige topic</div>
              <div className="text-[13px] text-hh-text font-medium leading-tight truncate">
                {currentTechnique ? `${currentTechnique.nummer} ${currentTechnique.naam}` : "Geen techniek"}
              </div>
              <div className="text-[10px] text-hh-muted">
                {currentTechnique ? `Fase ${currentTechnique.fase} • 18 min` : ""}
              </div>
            </div>

            <Button
              className="w-full h-9 gap-1.5 text-[13px]"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate?.("videos");
              }}
            >
              <Play className="w-3 h-3" />
              Video's
              <ArrowRight className="w-3 h-3 ml-auto" />
            </Button>
          </Card>

          {/* Webinar */}
          <Card 
            className="p-3 rounded-[12px] border-hh-border hover:border-destructive/40 hover:shadow-lg transition-all cursor-pointer active:scale-[0.99]"
            onClick={() => navigate?.("live")}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Radio className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <h3 className="text-[14px] leading-[18px] text-hh-text font-medium">Webinar</h3>
                  <p className="text-[11px] text-hh-muted">4 bijgewoond</p>
                </div>
              </div>
              <CardKPI value="4/12" label="sessies" />
            </div>
            
            <div className="mb-2 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="text-[10px] text-hh-muted mb-0.5">Volgende sessie</div>
              <div className="text-[13px] text-hh-text font-medium leading-tight truncate">
                Live Q&A: Discovery
              </div>
              <div className="text-[10px] text-hh-muted">
                Wo 22 jan • 14:00
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-9 text-[13px] border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate?.("live");
              }}
            >
              Sessies
              <ArrowRight className="w-3 h-3 ml-auto" />
            </Button>
          </Card>

          {/* Hugo AI */}
          <Card 
            className="p-3 rounded-[12px] border-hh-ink/20 hover:border-hh-ink/40 hover:shadow-lg bg-gradient-to-br from-hh-ink/5 to-transparent transition-all cursor-pointer active:scale-[0.99]"
            onClick={() => navigate?.("talk-to-hugo")}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-hh-ink/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-hh-ink" />
                </div>
                <div>
                  <h3 className="text-[14px] leading-[18px] text-hh-text font-medium">Hugo AI</h3>
                  <p className="text-[11px] text-hh-muted">19 chats</p>
                </div>
              </div>
              <CardKPI value="68%" label="voltooid" />
            </div>

            <div className="mb-2 p-2 rounded-lg bg-hh-ink/5 border border-hh-ink/20">
              <div className="text-[10px] text-hh-muted mb-0.5">Huidige topic</div>
              <div className="text-[13px] text-hh-text font-medium leading-tight truncate">
                {currentTechnique ? `${currentTechnique.nummer} ${currentTechnique.naam}` : "Geen techniek"}
              </div>
              <div className="text-[10px] text-hh-muted">
                {currentTechnique ? `Fase ${currentTechnique.fase}` : ""}
              </div>
            </div>

            <Button
              className="w-full h-9 gap-1.5 text-[13px] bg-hh-ink hover:bg-hh-ink/90 text-white"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate?.("talk-to-hugo");
              }}
            >
              <MessageSquare className="w-3 h-3" />
              Hugo AI
              <ArrowRight className="w-3 h-3 ml-auto" />
            </Button>
          </Card>

          {/* Analyse */}
          <Card 
            className="p-3 rounded-[12px] border-hh-border hover:border-hh-primary/40 hover:shadow-lg transition-all cursor-pointer active:scale-[0.99]"
            onClick={() => navigate?.("analysis")}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-hh-primary/10 flex items-center justify-center">
                  <FileSearch className="w-4 h-4 text-hh-primary" />
                </div>
                <div>
                  <h3 className="text-[14px] leading-[18px] text-hh-text font-medium">Analyse</h3>
                  <p className="text-[11px] text-hh-muted">11 analyses</p>
                </div>
              </div>
              <CardKPI value="76%" label="gem. score" />
            </div>
            
            <div className="mb-2 p-2 rounded-lg bg-hh-primary/5 border border-hh-primary/20">
              <div className="text-[10px] text-hh-muted mb-0.5">Laatste analyse</div>
              <div className="text-[13px] text-hh-text font-medium leading-tight truncate">
                Discovery call - Acme
              </div>
              <div className="text-[10px] text-hh-muted">
                Score: 76% • Gisteren
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-9 gap-1.5 text-[13px] border-hh-primary/30 text-hh-primary hover:bg-hh-primary/10"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate?.("analysis");
              }}
            >
              <FileSearch className="w-3 h-3" />
              Analyses
              <ArrowRight className="w-3 h-3 ml-auto" />
            </Button>
          </Card>
        </div>

        {/* Hugo's Quote */}
        <Card className="p-3 rounded-[16px] border-hh-ink/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-hh-ink text-white flex items-center justify-center flex-shrink-0 text-[12px] font-semibold">
              HH
            </div>
            <div>
              <div className="text-[12px] text-hh-muted mb-0.5">Hugo's woord van de dag</div>
              <p className="text-[14px] text-hh-text italic">"{getDailyQuote().text}"</p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}