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

// Fase progress bar component - shows completion across 5 phases
const FaseProgressBar = ({ progress }: { progress: number[] }) => {
  const faseLabels = ["0", "1", "2", "3", "4"];
  const faseColors = [
    "bg-emerald-500", // Fase 0
    "bg-emerald-500", // Fase 1  
    "bg-blue-500",    // Fase 2
    "bg-slate-300",   // Fase 3
    "bg-slate-200",   // Fase 4
  ];
  
  return (
    <div className="flex gap-1 items-end">
      {progress.map((value, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${value > 0 ? faseColors[index] : 'bg-slate-200'}`}
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-[10px] text-hh-muted">{faseLabels[index]}</span>
        </div>
      ))}
    </div>
  );
};

interface DashboardProps {
  hasData?: boolean;
  navigate?: (page: string) => void;
  isAdmin?: boolean; // Add isAdmin prop
}

export function Dashboard({ hasData = true, navigate, isAdmin = false }: DashboardProps) {
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


        {/* 4 Action Cards - Compact with Fase Progress */}
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
              <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[10px]">+3</Badge>
            </div>
            
            <div className="mb-3">
              <FaseProgressBar progress={[100, 100, 60, 20, 0]} />
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

          {/* Webinar */}
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
              <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[10px]">+1</Badge>
            </div>
            
            <div className="mb-3">
              <FaseProgressBar progress={[100, 80, 40, 0, 0]} />
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

          {/* Talk to Hugo AI */}
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
              <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[10px]">+5</Badge>
            </div>
            
            <div className="mb-3">
              <FaseProgressBar progress={[100, 100, 80, 50, 10]} />
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

          {/* Gespreksanalyse */}
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
              <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[10px]">+2</Badge>
            </div>
            
            <div className="mb-3">
              <FaseProgressBar progress={[100, 60, 30, 0, 0]} />
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