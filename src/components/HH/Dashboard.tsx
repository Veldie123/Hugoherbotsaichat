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

// Epic Sales Flow progress bar - full width above action cards
const EpicSalesFlowProgress = () => {
  const faseLabels = ["-1\nVoorber.", "1\nOpening", "2\nOntdekking", "3\nVoorstel", "4\nAfsluiting"];
  const progress = [100, 100, 60, 20, 0]; // Example progress values
  const faseColors = [
    "bg-emerald-500", // Fase 0
    "bg-emerald-500", // Fase 1  
    "bg-blue-500",    // Fase 2
    "bg-slate-300",   // Fase 3
    "bg-slate-200",   // Fase 4
  ];
  
  const completedCount = 4;
  const totalCount = 12;
  const percentage = Math.round((completedCount / totalCount) * 100);
  
  return (
    <Card className="p-4 sm:p-5 rounded-[16px] border-hh-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] sm:text-[20px] font-semibold text-hh-text">Epic Sales Flow</h2>
        <span className="text-[13px] text-hh-muted">{completedCount}/{totalCount} onderwerpen • {percentage}%</span>
      </div>
      <div className="flex gap-1">
        {progress.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col gap-2">
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${value > 0 ? faseColors[index] : 'bg-slate-200'}`}
                style={{ width: `${value}%` }}
              />
            </div>
            <div className="text-center">
              <span className="text-[12px] text-hh-muted whitespace-pre-line">{faseLabels[index]}</span>
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
      <div className="p-4 sm:p-5 lg:p-6 space-y-6">
        {/* Header - Clean & Minimal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="mb-1 text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] font-normal">
              E.P.I.C sales flow progressie
            </h1>
            <p className="text-[14px] leading-[20px] text-hh-muted">
              Weer een dag om te groeien — laten we werk maken van je sales skills.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[20px]">🔥</span>
            <div>
              <div className="text-[20px] leading-[24px] font-medium text-hh-text">
                7 dagen streak
              </div>
            </div>
          </div>
        </div>

        {/* Epic Sales Flow Progress Card */}
        <EpicSalesFlowProgress />

        {/* 4 Action Cards - uniform height */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Video */}
          <Card 
            className="p-4 rounded-[16px] border-hh-border hover:border-hh-primary/40 hover:shadow-lg transition-all cursor-pointer active:scale-[0.99]"
            onClick={() => navigate?.("videos")}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-hh-primary/10 flex items-center justify-center">
                  <Video className="w-4 h-4 text-hh-primary" />
                </div>
                <div>
                  <h3 className="text-[16px] leading-[20px] text-hh-text font-medium">Video</h3>
                  <p className="text-[12px] text-hh-muted">11 bekeken</p>
                </div>
              </div>
              <CardKPI value="56%" label="voltooid" />
            </div>

            {/* Huidige topic */}
            <div className="mb-3 p-3 rounded-lg bg-hh-ui-50/50 border border-hh-border">
              <div className="text-[11px] text-hh-muted mb-1">Huidige topic</div>
              <div className="text-[15px] text-hh-text font-medium mb-0.5">
                {currentTechnique ? `${currentTechnique.nummer} ${currentTechnique.naam}` : "Geen techniek"}
              </div>
              <div className="text-[11px] text-hh-muted">
                {currentTechnique ? `Fase ${currentTechnique.fase} • ${currentFaseNaam} • 18 min` : ""}
              </div>
            </div>

            <Button
              className="w-full h-10 gap-2 text-[14px]"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate?.("videos");
              }}
            >
              <Play className="w-3.5 h-3.5" />
              Bekijk video's
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </Button>
          </Card>

          {/* Webinar - simple KPI */}
          <Card 
            className="p-4 rounded-[16px] border-hh-border hover:border-destructive/40 hover:shadow-lg transition-all cursor-pointer active:scale-[0.99]"
            onClick={() => navigate?.("live")}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Radio className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <h3 className="text-[16px] leading-[20px] text-hh-text font-medium">Webinar</h3>
                  <p className="text-[12px] text-hh-muted">4 bijgewoond</p>
                </div>
              </div>
              <CardKPI value="4/12" label="sessies" />
            </div>
            
            {/* Eerstvolgende sessie */}
            <div className="mb-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="text-[11px] text-hh-muted mb-1">Eerstvolgende sessie</div>
              <div className="text-[15px] text-hh-text font-medium mb-0.5">
                Live Q&A: Discovery Technieken
              </div>
              <div className="text-[11px] text-hh-muted">
                Woensdag 22 jan • 14:00 - 15:00
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-10 text-[14px] border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate?.("live");
              }}
            >
              Bekijk live sessies
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </Button>
          </Card>

          {/* Talk to Hugo AI - with mini progress KPI */}
          <Card 
            className="p-4 rounded-[16px] border-hh-ink/20 hover:border-hh-ink/40 hover:shadow-lg bg-gradient-to-br from-hh-ink/5 to-transparent transition-all cursor-pointer active:scale-[0.99]"
            onClick={() => navigate?.("talk-to-hugo")}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-hh-ink/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-hh-ink" />
                </div>
                <div>
                  <h3 className="text-[16px] leading-[20px] text-hh-text font-medium">Hugo AI</h3>
                  <p className="text-[12px] text-hh-muted">19 chats</p>
                </div>
              </div>
              <CardKPI value="68%" label="voltooid" />
            </div>

            {/* Huidige topic */}
            <div className="mb-3 p-3 rounded-lg bg-hh-ink/5 border border-hh-ink/20">
              <div className="text-[11px] text-hh-muted mb-1">Huidige topic</div>
              <div className="text-[15px] text-hh-text font-medium mb-0.5">
                {currentTechnique ? `${currentTechnique.nummer} ${currentTechnique.naam}` : "Geen techniek"}
              </div>
              <div className="text-[11px] text-hh-muted">
                {currentTechnique ? `Fase ${currentTechnique.fase} • ${currentFaseNaam}` : ""}
              </div>
            </div>

            <Button
              className="w-full h-10 gap-2 text-[14px] bg-hh-ink hover:bg-hh-ink/90 text-white"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate?.("talk-to-hugo");
              }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Talk to Hugo AI
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </Button>
          </Card>

          {/* Gespreksanalyse - simple KPI */}
          <Card 
            className="p-4 rounded-[16px] border-hh-border hover:border-hh-primary/40 hover:shadow-lg transition-all cursor-pointer active:scale-[0.99]"
            onClick={() => navigate?.("analysis")}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-hh-primary/10 flex items-center justify-center">
                  <FileSearch className="w-4 h-4 text-hh-primary" />
                </div>
                <div>
                  <h3 className="text-[16px] leading-[20px] text-hh-text font-medium">Analyse</h3>
                  <p className="text-[12px] text-hh-muted">11 analyses</p>
                </div>
              </div>
              <CardKPI value="76%" label="gem. score" />
            </div>
            
            {/* Laatste analyse */}
            <div className="mb-3 p-3 rounded-lg bg-hh-primary/5 border border-hh-primary/20">
              <div className="text-[11px] text-hh-muted mb-1">Laatste analyse</div>
              <div className="text-[15px] text-hh-text font-medium mb-0.5">
                Discovery call - Acme Inc
              </div>
              <div className="text-[11px] text-hh-muted">
                Score: 76% • Gisteren
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-10 gap-2 text-[14px] border-hh-primary/30 text-hh-primary hover:bg-hh-primary/10"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate?.("analysis");
              }}
            >
              <FileSearch className="w-3.5 h-3.5" />
              Bekijk analyses
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </Button>
          </Card>
        </div>

        {/* Hugo's Tip - Minimal */}
        <Card className="p-5 rounded-[16px] border-hh-primary/20 bg-hh-primary/5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-hh-primary text-white flex items-center justify-center flex-shrink-0 text-[13px] font-semibold">
              HH
            </div>
            <div>
              <div className="text-[14px] leading-[18px] text-hh-text font-medium mb-1.5">
                Hugo's woord van de dag
              </div>
              <p className="text-[16px] leading-[24px] text-hh-text italic font-normal">
                "{getDailyQuote().text}"
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}