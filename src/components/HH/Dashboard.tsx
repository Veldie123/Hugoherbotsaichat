import { AppLayout } from "./AppLayout";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { EmptyState } from "./EmptyState";
import {
  Play,
  ChevronRight,
  Clock,
  Calendar,
  MessageSquare,
  Radio,
} from "lucide-react";
import { getDailyQuote } from "../../data/hugoQuotes";
import { getTechniekByNummer } from "../../data/technieken-service";
import { videos } from "../../data/videos-data";
import { liveSessions } from "../../data/live-sessions-data";
import { getFaseBadgeColors } from "../../utils/phaseColors";

interface DashboardProps {
  hasData?: boolean;
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

// Netflix-style content row with horizontal scroll
const ContentRow = ({ 
  title, 
  icon: Icon,
  children,
  onSeeAll
}: { 
  title: string; 
  icon?: React.ElementType;
  children: React.ReactNode;
  onSeeAll?: () => void;
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-hh-muted" />}
        <h2 className="text-[18px] font-semibold text-hh-text">{title}</h2>
      </div>
      {onSeeAll && (
        <button 
          onClick={onSeeAll}
          className="flex items-center gap-1 text-[13px] text-hh-primary hover:text-hh-ink transition-colors"
        >
          Alles bekijken
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {children}
    </div>
  </div>
);

// Video thumbnail card with progress
const VideoCard = ({ 
  title, 
  techniqueNumber,
  fase,
  duration,
  progress,
  thumbnail,
  onClick
}: {
  title: string;
  techniqueNumber: string;
  fase: string | number;
  duration: string;
  progress: number;
  thumbnail?: string;
  onClick?: () => void;
}) => (
  <div 
    className="flex-shrink-0 w-[200px] group cursor-pointer"
    onClick={onClick}
  >
    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-hh-ink to-hh-primary/80 aspect-video mb-2">
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Play className="w-10 h-10 text-white/60" />
        </div>
      )}
      {/* Progress bar */}
      {progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <div 
            className="h-full bg-hh-success" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
          <Play className="w-6 h-6 text-hh-ink ml-0.5" />
        </div>
      </div>
      {/* User View: Emerald pill badge for technique number */}
      <Badge className="absolute top-2 left-2 bg-emerald-100 text-emerald-600 rounded-full px-2 py-0.5 text-[10px] font-mono font-medium">
        {techniqueNumber}
      </Badge>
    </div>
    <h3 className="text-[13px] font-medium text-hh-text leading-tight line-clamp-2 group-hover:text-hh-primary transition-colors">
      {title}
    </h3>
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[11px] text-hh-muted">Fase {fase}</span>
      <span className="text-[11px] text-hh-muted">•</span>
      <span className="text-[11px] text-hh-muted flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {duration}
      </span>
    </div>
  </div>
);

// Webinar card with placeholder thumbnail
const WebinarCard = ({ 
  title, 
  techniqueNumber,
  date,
  time,
  isLive,
  isRegistered,
  isReplay,
  onClick
}: {
  title: string;
  techniqueNumber?: string;
  date: string;
  time: string;
  isLive?: boolean;
  isRegistered?: boolean;
  isReplay?: boolean;
  onClick?: () => void;
}) => (
  <div 
    className="flex-shrink-0 w-[200px] group cursor-pointer"
    onClick={onClick}
  >
    <div className="relative rounded-lg overflow-hidden aspect-video mb-2">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-600/80 to-slate-800/90" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white/30 text-[11px] font-medium tracking-wide">{title.substring(0, 20)}...</span>
      </div>
      {/* Technique badge */}
      {techniqueNumber && (
        <Badge className="absolute top-2 left-2 bg-emerald-100 text-emerald-600 rounded-full px-2 py-0.5 text-[10px] font-mono font-medium">
          {techniqueNumber}
        </Badge>
      )}
      {/* Live indicator */}
      {isLive && (
        <Badge className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 animate-pulse">
          LIVE
        </Badge>
      )}
      {/* Replay indicator */}
      {isReplay && (
        <Badge className="absolute top-2 right-2 bg-hh-ink/80 text-white text-[10px] px-1.5 py-0.5">
          Opname
        </Badge>
      )}
      {/* Registered badge */}
      {isRegistered && !isLive && !isReplay && (
        <Badge className="absolute top-2 right-2 bg-hh-success text-white text-[10px] px-1.5 py-0.5">
          ✓
        </Badge>
      )}
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
          <Play className="w-6 h-6 text-hh-ink ml-0.5" />
        </div>
      </div>
    </div>
    <h3 className="text-[13px] font-medium text-hh-text leading-tight line-clamp-2 group-hover:text-hh-primary transition-colors">
      {title}
    </h3>
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[11px] text-hh-muted flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {isReplay ? "Opgenomen" : date} • {time}
      </span>
    </div>
  </div>
);

// Hugo AI Training card
const HugoTrainingCard = ({ 
  title, 
  techniqueNumber,
  fase,
  sessions,
  onClick
}: {
  title: string;
  techniqueNumber: string;
  fase: number;
  sessions: number;
  onClick?: () => void;
}) => {
  // Use SSOT phase colors for background
  const faseColors = getFaseBadgeColors(String(fase));
  
  return (
    <div 
      className="flex-shrink-0 w-[200px] group cursor-pointer"
      onClick={onClick}
    >
      <div className={`relative rounded-lg overflow-hidden bg-gradient-to-br from-hh-ink to-hh-primary/80 aspect-video mb-2`}>
        <div className="w-full h-full flex items-center justify-center">
          <MessageSquare className="w-10 h-10 text-white/60" />
        </div>
        {/* User View: Emerald pill badge for technique number */}
        <Badge className="absolute top-2 left-2 bg-emerald-100 text-emerald-600 rounded-full px-2 py-0.5 text-[10px] font-mono font-medium">
          {techniqueNumber}
        </Badge>
        {/* Fase indicator */}
        <Badge className={`absolute top-2 right-2 ${faseColors.bg} ${faseColors.text} text-[10px] px-1.5 py-0.5`}>
          Fase {fase}
        </Badge>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-hh-ink" />
          </div>
        </div>
      </div>
      <h3 className="text-[13px] font-medium text-hh-text leading-tight line-clamp-2 group-hover:text-hh-primary transition-colors">
        {title}
      </h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[11px] text-hh-muted">{sessions} sessies</span>
      </div>
    </div>
  );
};

export function Dashboard({ hasData = true, navigate, isAdmin = false }: DashboardProps) {
  const currentTechnique = getTechniekByNummer("2.1.1");
  
  // Get upcoming/live webinars
  const upcomingWebinars = liveSessions
    .filter(s => s.status === "upcoming" || s.status === "live" || s.status === "scheduled")
    .slice(0, 5);
  
  // Get completed webinars for "terugkijken"
  const completedWebinars = liveSessions
    .filter(s => s.status === "completed")
    .slice(0, 5);
  
  // Get videos for "verder kijken" - simulate some in-progress
  const continueWatching = videos.slice(0, 5).map((v, i) => ({
    ...v,
    progress: i === 0 ? 68 : i === 1 ? 45 : i === 2 ? 12 : 0
  }));

  // Get techniques for Hugo AI training - one per fase
  const hugoTrainings = [
    { nummer: "1.1", naam: "Eerste Indruk", fase: 1, sessions: 5 },
    { nummer: "2.1.1", naam: "Feitgerichte vragen", fase: 2, sessions: 12 },
    { nummer: "2.3.1", naam: "Actief Luisteren", fase: 2, sessions: 8 },
    { nummer: "3.1", naam: "Waarde Presentatie", fase: 3, sessions: 3 },
    { nummer: "4.1", naam: "Closing Techniques", fase: 4, sessions: 2 },
  ];

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
        {/* Header with streak */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="mb-1 text-[28px] leading-[36px] sm:text-[32px] sm:leading-[40px] font-semibold text-hh-text">
              Welkom terug, Jan
            </h1>
            <p className="text-[14px] leading-[20px] text-hh-muted">
              {getDailyQuote().text}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-full border border-amber-200">
            <span className="text-[18px]">🔥</span>
            <span className="text-[14px] font-medium text-amber-700">7 dagen streak</span>
          </div>
        </div>

        {/* Epic Sales Flow Progress */}
        <Card className="p-5 rounded-xl border border-hh-border bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold text-hh-text">Epic Sales Flow</h2>
            <span className="text-[13px] text-hh-muted">4/12 onderwerpen • 33%</span>
          </div>
          <div className="flex items-center gap-1">
            {/* Fase -1: Voorbereiding - Completed */}
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-1.5 bg-hh-success rounded-full" />
              <div className="flex flex-col items-center">
                <div className="text-[11px] leading-[14px] text-hh-success font-semibold">-1</div>
                <div className="text-[10px] leading-[12px] text-hh-muted text-center">Voorber.</div>
              </div>
            </div>
            {/* Fase 1: Opening - Completed */}
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-1.5 bg-hh-success rounded-full" />
              <div className="flex flex-col items-center">
                <div className="text-[11px] leading-[14px] text-hh-success font-semibold">1</div>
                <div className="text-[10px] leading-[12px] text-hh-muted text-center">Opening</div>
              </div>
            </div>
            {/* Fase 2: Ontdekking - Current */}
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-1.5 bg-hh-primary rounded-full" />
              <div className="flex flex-col items-center">
                <div className="text-[11px] leading-[14px] text-hh-primary font-semibold">2</div>
                <div className="text-[10px] leading-[12px] text-hh-muted text-center">Ontdekking</div>
              </div>
            </div>
            {/* Fase 3: Voorstel - Upcoming */}
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-1.5 bg-hh-ui-200 rounded-full" />
              <div className="flex flex-col items-center">
                <div className="text-[11px] leading-[14px] text-hh-muted font-semibold">3</div>
                <div className="text-[10px] leading-[12px] text-hh-muted text-center">Voorstel</div>
              </div>
            </div>
            {/* Fase 4: Afsluiting - Locked */}
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-1.5 bg-hh-ui-100 rounded-full" />
              <div className="flex flex-col items-center">
                <div className="text-[11px] leading-[14px] text-hh-muted font-semibold">4</div>
                <div className="text-[10px] leading-[12px] text-hh-muted text-center">Afsluiting</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Hero Banner - Featured Content */}
        <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-hh-ink via-hh-ink/95 to-hh-primary/80 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Text content */}
            <div className="flex-1 text-white space-y-4">
              <Badge className="bg-hh-success text-white border-0">
                Aanbevolen voor jou
              </Badge>
              <h2 className="text-[24px] sm:text-[28px] font-bold leading-tight">
                {currentTechnique ? currentTechnique.naam : "Feitgerichte vragen"}
              </h2>
              <p className="text-white/70 text-[14px] leading-relaxed max-w-md">
                Leer hoe je gerichte vragen stelt om de echte behoeften van je klant te ontdekken. 
                Dit is de basis van elke succesvolle sale.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                  className="bg-white text-hh-ink hover:bg-white/90 gap-2"
                  onClick={() => navigate?.("videos")}
                >
                  <Play className="w-4 h-4" />
                  Bekijk Video
                </Button>
                <Button 
                  className="bg-white/20 border-2 border-white/50 text-white hover:bg-white/30 gap-2"
                  onClick={() => navigate?.("talk-to-hugo")}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat met Hugo
                </Button>
              </div>
            </div>
            {/* Visual element */}
            <div className="hidden sm:flex w-48 h-32 rounded-xl bg-white/10 backdrop-blur items-center justify-center">
              <div className="text-center">
                <div className="text-[48px] font-bold text-white/20">2.1.1</div>
                <div className="text-[12px] text-white/40">Fase 2 • Ontdekking</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Verder kijken - Videos */}
        <ContentRow 
          title="Verder kijken" 
          icon={Play}
          onSeeAll={() => navigate?.("videos")}
        >
          {continueWatching.map((video, index) => (
            <VideoCard
              key={video.id || index}
              title={video.title}
              techniqueNumber={video.techniqueNumber}
              fase={video.fase}
              duration={video.duration}
              progress={video.progress || 0}
              thumbnail={video.thumbnail}
              onClick={() => navigate?.("videos")}
            />
          ))}
        </ContentRow>

        {/* Live Webinars */}
        <ContentRow 
          title="Live Webinars" 
          icon={Radio}
          onSeeAll={() => navigate?.("live")}
        >
          {upcomingWebinars.map((webinar, index) => (
            <WebinarCard
              key={webinar.id || index}
              title={webinar.title}
              techniqueNumber={webinar.techniqueNumber}
              date={webinar.date}
              time={webinar.time}
              isLive={webinar.status === "live"}
              isRegistered={index < 2}
              onClick={() => navigate?.("live")}
            />
          ))}
        </ContentRow>

        {/* Terugkijken - Completed Webinars */}
        {completedWebinars.length > 0 && (
          <ContentRow 
            title="Terugkijken" 
            icon={Play}
            onSeeAll={() => navigate?.("live")}
          >
            {completedWebinars.map((webinar, index) => (
              <WebinarCard
                key={webinar.id || index}
                title={webinar.title}
                techniqueNumber={webinar.techniqueNumber}
                date={webinar.date}
                time={webinar.time}
                isReplay={true}
                onClick={() => navigate?.("live")}
              />
            ))}
          </ContentRow>
        )}

        {/* Train met Hugo AI */}
        <ContentRow 
          title="Train met Hugo AI" 
          icon={MessageSquare}
          onSeeAll={() => navigate?.("hugo-overview")}
        >
          {hugoTrainings.map((training, index) => (
            <HugoTrainingCard
              key={index}
              title={training.naam}
              techniqueNumber={training.nummer}
              fase={training.fase}
              sessions={training.sessions}
              onClick={() => navigate?.("talk-to-hugo")}
            />
          ))}
        </ContentRow>

        {/* Compact Progress Footer */}
        <Card className="p-4 rounded-xl border-hh-border bg-hh-ui-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-[14px] font-medium text-hh-text">E.P.I.C Sales Flow</div>
              <span className="text-[13px] text-hh-muted">4/12 onderwerpen • 33%</span>
            </div>
            <div className="flex gap-1 flex-1 max-w-md">
              {[100, 100, 60, 20, 0].map((progress, index) => (
                <div key={index} className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      progress === 100 ? "bg-emerald-500" : 
                      progress > 0 ? "bg-blue-400" : "bg-slate-200"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
