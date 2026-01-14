import { AppLayout } from "./AppLayout";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { EmptyState } from "./EmptyState";
import {
  Play,
  Video,
  MessageSquare,
  Radio,
  ArrowRight,
  Check,
} from "lucide-react";
import { getDailyQuote } from "../../data/hugoQuotes";
import { getTechniekByNummer } from "../../data/technieken-service";
import { liveSessions } from "../../data/live-sessions-data";
import { getProgressBarColor } from "../../utils/phaseColors";

interface DashboardProps {
  hasData?: boolean;
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

export function Dashboard({ hasData = true, navigate, isAdmin = false }: DashboardProps) {
  // TODO: Replace with real user progress from context/API
  const currentTechnique = getTechniekByNummer("2.1.1");
  
  // SSOT: Get next scheduled webinar from live-sessions-data
  const nextWebinar = liveSessions
    .filter(s => s.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  
  // TODO: Replace with real user registration status from context/API
  const isRegistered = true;
  
  // TODO: Replace with real user progress from context/API
  const completedCount = 4;
  const totalCount = 12;
  const percentage = Math.round((completedCount / totalCount) * 100);
  
  // Progress data using SSOT phase structure
  const progressData = [
    { fase: 0, label: "Voorber.", progress: 100, isCompleted: true, isInProgress: false },
    { fase: 1, label: "Opening", progress: 100, isCompleted: true, isInProgress: false },
    { fase: 2, label: "Ontdekking", progress: 60, isCompleted: false, isInProgress: true },
    { fase: 3, label: "Voorstel", progress: 20, isCompleted: false, isInProgress: false },
    { fase: 4, label: "Afsluiting", progress: 0, isCompleted: false, isInProgress: false },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Goedemorgen";
    if (hour < 18) return "Goedemiddag";
    return "Goedenavond";
  };

  const formatWebinarDate = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    const days = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
    const months = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} • ${timeStr}`;
  };

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
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        
        {/* Header met streak */}
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] sm:text-[28px] font-semibold text-hh-text">
            Welkom terug, Jan
          </h1>
          <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full">
            <span className="text-[18px]">🔥</span>
            <span className="text-[14px] font-medium text-orange-600">7 dagen</span>
          </div>
        </div>

        {/* Hugo Coach Card - Het hart van de pagina */}
        <Card className="p-6 rounded-[20px] border-hh-ink/10 bg-gradient-to-br from-hh-ink/[0.02] to-transparent">
          <div className="flex gap-4">
            {/* Hugo Avatar */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-hh-ink text-white flex items-center justify-center text-[18px] font-bold shadow-lg">
                HH
              </div>
            </div>
            
            {/* Hugo's bericht */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <p className="text-[16px] leading-relaxed text-hh-text">
                  <span className="font-medium">{getGreeting()} Jan!</span> Je werkte laatst aan{" "}
                  <span className="font-medium text-hh-ink">
                    {currentTechnique ? currentTechnique.naam : "Discovery vragen"}
                  </span>
                  . Zullen we verder gaan met de video of direct oefenen?
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 h-12 gap-2 text-[15px] bg-hh-ink hover:bg-hh-ink/90 text-white rounded-xl"
                  onClick={() => navigate?.("videos")}
                >
                  <Video className="w-5 h-5" />
                  Bekijk Video
                  <ArrowRight className="w-4 h-4 ml-auto opacity-60" />
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12 gap-2 text-[15px] border-hh-ink/20 text-hh-ink hover:bg-hh-ink/5 rounded-xl"
                  onClick={() => navigate?.("talk-to-hugo")}
                >
                  <MessageSquare className="w-5 h-5" />
                  Chat met Hugo
                  <ArrowRight className="w-4 h-4 ml-auto opacity-60" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Webinar Spotlight */}
        {nextWebinar && (
          <Card className="p-4 rounded-[16px] border-destructive/20 bg-destructive/[0.02]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-hh-muted font-medium">
                    Volgende Webinar
                  </p>
                  <p className="text-[15px] font-medium text-hh-text">
                    {nextWebinar.title}
                  </p>
                  <p className="text-[13px] text-hh-muted">
                    {formatWebinarDate(nextWebinar.date, nextWebinar.time)}
                  </p>
                </div>
              </div>
              
              {isRegistered ? (
                <div className="flex items-center gap-1.5 text-hh-success bg-hh-success/10 px-3 py-1.5 rounded-full">
                  <Check className="w-4 h-4" />
                  <span className="text-[13px] font-medium">Ingeschreven</span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => navigate?.("live")}
                >
                  Schrijf in
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* E.P.I.C Progress - Compact */}
        <Card className="p-4 rounded-[16px] border-hh-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-medium text-hh-text">E.P.I.C Sales Flow</h3>
            <span className="text-[13px] text-hh-muted">{completedCount}/{totalCount} onderwerpen • {percentage}%</span>
          </div>
          
          {/* Progress segments - using SSOT phase colors */}
          <div className="flex gap-1">
            {progressData.map((fase) => (
              <div key={fase.fase} className="flex-1">
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${getProgressBarColor(fase.fase, fase.isCompleted, fase.isInProgress)}`}
                    style={{ width: `${fase.progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-hh-muted text-center mt-1.5">{fase.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Hugo's Quote */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-hh-ink/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[12px] font-semibold text-hh-ink">HH</span>
          </div>
          <p className="text-[14px] text-hh-muted italic">
            "{getDailyQuote().text}"
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
