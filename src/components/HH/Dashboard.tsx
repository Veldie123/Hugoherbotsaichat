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

        {/* 2 Main Action Blocks - PROMINENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Digital Coaching */}
          <Card 
            className="p-5 sm:p-6 rounded-[16px] border-hh-border hover:border-hh-primary/40 hover:shadow-lg hover:bg-hh-ui-50/30 transition-all group cursor-pointer active:scale-[0.98]"
            onClick={() => navigate?.("coaching")}
          >
            <div className="mb-4 sm:mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-5 h-5 text-hh-primary" />
                <h3 className="text-[18px] leading-[24px] text-hh-text">
                  Digital Coaching
                </h3>
              </div>
              <p className="text-[13px] leading-[18px] sm:text-[14px] sm:leading-[20px] text-hh-muted">
                Epic Sales Flow • Video + Rollenspel
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

            {/* CTA Button */}
            <Button
              className="w-full h-12 sm:h-11 gap-2 text-[15px] sm:text-[16px]"
              onClick={(e) => {
                e.stopPropagation();
                navigate?.("coaching");
              }}
            >
              <Play className="w-4 h-4" />
              Vervolg training
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </Card>

          {/* Live Coaching */}
          <Card 
            className="p-5 sm:p-6 rounded-[16px] border-hh-border hover:border-hh-primary/40 hover:shadow-lg hover:bg-hh-ui-50/30 transition-all cursor-pointer group active:scale-[0.98]"
            onClick={() => {
              console.log("Navigating to live coaching...");
              navigate?.("live");
            }}
          >
            <div className="mb-4 sm:mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-5 h-5 text-destructive animate-pulse" />
                <h3 className="text-[18px] leading-[24px] text-hh-text">
                  Live Coaching
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
              onClick={(e) => {
                e.stopPropagation();
                console.log("Button clicked - navigating to live...");
                navigate?.("live");
              }}
            >
              Bekijk live sessie
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