import { AppLayout } from "./AppLayout";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { EPICProgressKPI } from "./EPICProgressKPI";
import { EmptyState } from "./EmptyState";
import {
  Play,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  Award,
  Target,
  Lightbulb,
  Radio,
  MessageSquare,
  ChevronRight,
  Sparkles,
  BarChart3,
  Calendar,
  Flame,
  ArrowRight,
  Video,
  FileSearch,
} from "lucide-react";
import { getDailyQuote } from "../../data/hugoQuotes";

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

        {/* EPIC Flow Progress - KPI Cards */}
        <EPICProgressKPI
          phases={[
            {
              phaseNumber: 0,
              phaseName: "Voorbereiding",
              completion: 85,
              videosWatched: 4,
              totalVideos: 4,
              liveSessions: 2,
              analyses: 3,
              aiChats: 5,
              trend: "up",
            },
            {
              phaseNumber: 1,
              phaseName: "Openingsfase",
              completion: 75,
              videosWatched: 3,
              totalVideos: 4,
              liveSessions: 1,
              analyses: 5,
              aiChats: 8,
              trend: "up",
            },
            {
              phaseNumber: 2,
              phaseName: "Ontdekkingsfase",
              completion: 42,
              videosWatched: 3,
              totalVideos: 8,
              liveSessions: 1,
              analyses: 2,
              aiChats: 4,
              trend: "up",
            },
            {
              phaseNumber: 3,
              phaseName: "Aanbevelingsfase",
              completion: 15,
              videosWatched: 1,
              totalVideos: 5,
              liveSessions: 0,
              analyses: 1,
              aiChats: 2,
              trend: "neutral",
            },
            {
              phaseNumber: 4,
              phaseName: "Beslissingsfase",
              completion: 0,
              videosWatched: 0,
              totalVideos: 7,
              liveSessions: 0,
              analyses: 0,
              aiChats: 0,
              trend: "neutral",
            },
          ]}
        />

        {/* 4 KPI Cards - User Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 sm:p-5 rounded-[16px] border-hh-border">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-hh-primary/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-hh-primary" />
              </div>
              <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[11px]">
                +3
              </Badge>
            </div>
            <p className="text-[13px] text-hh-muted mb-1">Video's bekeken</p>
            <p className="text-[28px] leading-[32px] text-hh-text font-medium">11</p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] border-hh-border">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Radio className="w-5 h-5 text-red-500" />
              </div>
              <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[11px]">
                +1
              </Badge>
            </div>
            <p className="text-[13px] text-hh-muted mb-1">Live sessies</p>
            <p className="text-[28px] leading-[32px] text-hh-text font-medium">4</p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] border-hh-border">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <FileSearch className="w-5 h-5 text-blue-500" />
              </div>
              <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[11px]">
                +2
              </Badge>
            </div>
            <p className="text-[13px] text-hh-muted mb-1">Analyses</p>
            <p className="text-[28px] leading-[32px] text-hh-text font-medium">11</p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] border-hh-border">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-500" />
              </div>
              <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[11px]">
                +5
              </Badge>
            </div>
            <p className="text-[13px] text-hh-muted mb-1">AI Chats</p>
            <p className="text-[28px] leading-[32px] text-hh-text font-medium">19</p>
          </Card>
        </div>

        {/* 4 Main Action Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Video */}
          <Card 
            className="p-5 sm:p-6 rounded-[16px] border-hh-border hover:border-hh-primary/40 hover:shadow-lg hover:bg-hh-ui-50/30 transition-all group cursor-pointer active:scale-[0.98]"
            onClick={() => navigate?.("videos")}
          >
            <div className="mb-4 sm:mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-5 h-5 text-hh-primary" />
                <h3 className="text-[18px] leading-[24px] text-hh-text">
                  Video
                </h3>
              </div>
              <p className="text-[13px] leading-[18px] sm:text-[14px] sm:leading-[20px] text-hh-muted">
                Epic Sales Flow • Video trainingen
              </p>
            </div>

            <div className="mb-5 sm:mb-6 p-4 rounded-lg bg-hh-ui-50/50 border border-hh-border">
              <div className="text-[12px] leading-[16px] sm:text-[13px] sm:leading-[18px] text-hh-muted mb-1.5">
                Huidige topic
              </div>
              <div className="text-[17px] leading-[23px] sm:text-[18px] sm:leading-[24px] text-hh-text font-medium mb-1">
                2.1.1 Feitgerichte vragen
              </div>
              <div className="text-[12px] leading-[16px] sm:text-[13px] sm:leading-[18px] text-hh-muted">
                Fase 2 • Ontdekkingsfase • 18 min
              </div>
            </div>

            <Button
              className="w-full h-12 sm:h-11 gap-2 text-[15px] sm:text-[16px]"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate?.("videos");
              }}
            >
              <Play className="w-4 h-4" />
              Bekijk video's
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </Card>

          {/* Webinar */}
          <Card 
            className="p-5 sm:p-6 rounded-[16px] border-hh-border hover:border-hh-primary/40 hover:shadow-lg hover:bg-hh-ui-50/30 transition-all cursor-pointer group active:scale-[0.98]"
            onClick={() => navigate?.("live")}
          >
            <div className="mb-4 sm:mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-5 h-5 text-destructive animate-pulse" />
                <h3 className="text-[18px] leading-[24px] text-hh-text">
                  Webinar
                </h3>
              </div>
              <p className="text-[13px] leading-[18px] sm:text-[14px] sm:leading-[20px] text-hh-muted">
                Elke woensdag live met Hugo
              </p>
            </div>

            <div className="mb-5 sm:mb-6 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="text-[12px] leading-[16px] sm:text-[13px] sm:leading-[18px] text-hh-muted mb-1.5">
                Eerstvolgende sessie
              </div>
              <div className="text-[17px] leading-[23px] sm:text-[18px] sm:leading-[24px] text-hh-text font-medium mb-1">
                Live Q&A: Discovery Technieken
              </div>
              <div className="text-[12px] leading-[16px] sm:text-[13px] sm:leading-[18px] text-hh-muted">
                Woensdag 22 jan • 14:00 - 15:00
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 sm:h-11 text-[15px] sm:text-[16px] border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate?.("live");
              }}
            >
              Bekijk live sessie
            </Button>
          </Card>

          {/* Chat met Hugo a.i. */}
          <Card 
            className="p-5 sm:p-6 rounded-[16px] border-hh-border hover:border-green-500/40 hover:shadow-lg hover:bg-hh-ui-50/30 transition-all cursor-pointer group active:scale-[0.98]"
            onClick={() => navigate?.("coaching")}
          >
            <div className="mb-4 sm:mb-5">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
                <h3 className="text-[18px] leading-[24px] text-hh-text">
                  Chat met Hugo a.i.
                </h3>
              </div>
              <p className="text-[13px] leading-[18px] sm:text-[14px] sm:leading-[20px] text-hh-muted">
                AI-gestuurde sales coaching & rollenspel
              </p>
            </div>

            <div className="mb-5 sm:mb-6 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="text-[12px] leading-[16px] sm:text-[13px] sm:leading-[18px] text-hh-muted mb-1.5">
                Laatste sessie
              </div>
              <div className="text-[17px] leading-[23px] sm:text-[18px] sm:leading-[24px] text-hh-text font-medium mb-1">
                Bezwaren behandelen
              </div>
              <div className="text-[12px] leading-[16px] sm:text-[13px] sm:leading-[18px] text-hh-muted">
                Score: 82% • 15 min geleden
              </div>
            </div>

            <Button
              className="w-full h-12 sm:h-11 gap-2 text-[15px] sm:text-[16px] bg-green-500 hover:bg-green-600"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate?.("coaching");
              }}
            >
              <MessageSquare className="w-4 h-4" />
              Start chat
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </Card>

          {/* Gespreksanalyse */}
          <Card 
            className="p-5 sm:p-6 rounded-[16px] border-hh-border hover:border-blue-500/40 hover:shadow-lg hover:bg-hh-ui-50/30 transition-all cursor-pointer group active:scale-[0.98]"
            onClick={() => navigate?.("analysis")}
          >
            <div className="mb-4 sm:mb-5">
              <div className="flex items-center gap-2 mb-2">
                <FileSearch className="w-5 h-5 text-blue-500" />
                <h3 className="text-[18px] leading-[24px] text-hh-text">
                  Gespreksanalyse
                </h3>
              </div>
              <p className="text-[13px] leading-[18px] sm:text-[14px] sm:leading-[20px] text-hh-muted">
                Upload en analyseer je gesprekken
              </p>
            </div>

            <div className="mb-5 sm:mb-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <div className="text-[12px] leading-[16px] sm:text-[13px] sm:leading-[18px] text-hh-muted mb-1.5">
                Laatste analyse
              </div>
              <div className="text-[17px] leading-[23px] sm:text-[18px] sm:leading-[24px] text-hh-text font-medium mb-1">
                Discovery call - Acme Inc
              </div>
              <div className="text-[12px] leading-[16px] sm:text-[13px] sm:leading-[18px] text-hh-muted">
                Score: 76% • Gisteren
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 sm:h-11 gap-2 text-[15px] sm:text-[16px] border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate?.("analysis");
              }}
            >
              <FileSearch className="w-4 h-4" />
              Bekijk analyses
              <ArrowRight className="w-4 h-4 ml-auto" />
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