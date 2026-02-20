export type ActivityType =
  | 'video_view'
  | 'video_complete'
  | 'webinar_join'
  | 'webinar_complete'
  | 'chat_session'
  | 'chat_message'
  | 'technique_practice'
  | 'technique_mastered'
  | 'roleplay_start'
  | 'roleplay_complete'
  | 'quiz_attempt'
  | 'quiz_pass'
  | 'login'
  | 'page_view'
  | 'onboarding_complete';

export interface ActivityPayload {
  userId: string;
  type: ActivityType;
  sourceApp: 'com' | 'ai';
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

export interface ActivitySummary {
  totalSessions: number;
  totalMessages: number;
  videosWatched: number;
  webinarsAttended: number;
  techniquesStarted: number;
  techniquesMastered: number;
  lastActive?: string;
  streakDays: number;
  welcomeMessage?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  userId: string;
  sourceApp: 'com' | 'ai';
  sessionId?: string;
  conversationHistory?: ChatMessage[];
  techniqueContext?: {
    techniqueId: string;
    techniqueName: string;
    phase: string;
  };
}

export interface ChatResponse {
  response: string;
  message?: string;
  sessionId?: string | null;
  mode: string;
  technique?: string | null;
  sources?: RagSource[];
  suggestions?: string[];
  richContent?: RichContent[];
  intent?: {
    primary: 'chat' | 'learn' | 'practice' | 'review' | 'explore';
    confidence: number;
  };
}

export interface RagSource {
  type: 'technique' | 'video' | 'webinar' | 'slide';
  title: string;
  snippet: string;
  relevance: number;
  metadata?: Record<string, unknown>;
}

export interface AnalysisResultEmbed {
  conversationId: string;
  title: string;
  overallScore: number;
  status: 'transcribing' | 'analyzing' | 'evaluating' | 'generating_report' | 'completed' | 'failed';
  phaseCoverage?: {
    phase1: { score: number };
    phase2: { overall: { score: number } };
    phase3: { score: number };
    phase4: { score: number };
  };
  moments?: Array<{
    type: 'big_win' | 'quick_fix' | 'turning_point';
    label: string;
    whyItMatters: string;
    betterAlternative: string;
  }>;
  strengths?: Array<{ text: string }>;
  improvements?: Array<{ text: string }>;
  coachOneliner?: string;
}

export interface RichContent {
  type: 'card' | 'video' | 'slide' | 'webinar' | 'action' | 'roleplay' | 'epic_slide' | 'analysis_result' | 'analysis_progress';
  data: CardContent | VideoEmbed | SlideContent | WebinarLink | ActionButton | RoleplayProposal | EpicSlideContent | AnalysisResultEmbed;
}

export interface CardContent {
  title: string;
  description: string;
  image?: string;
  techniqueId?: string;
  phase?: string;
  link?: string;
}

export interface VideoEmbed {
  title: string;
  muxPlaybackId?: string;
  videoId?: string;
  thumbnailUrl?: string;
  duration?: number;
  techniqueId?: string;
}

export interface SlideContent {
  title: string;
  slideUrl?: string;
  thumbnailUrl?: string;
  techniqueId?: string;
  slideIndex?: number;
  totalSlides?: number;
}

export interface EpicSlideContent {
  id: string;
  titel: string;
  kernboodschap: string;
  bulletpoints: string[];
  phase: string;
  techniqueId: string;
  visual_type: 'diagram' | 'lijst' | 'matrix' | 'quote';
  personalized_context?: Record<string, string>;
}

export interface WebinarLink {
  title: string;
  description?: string;
  url: string;
  date?: string;
  isLive?: boolean;
  techniqueId?: string;
}

export interface ActionButton {
  label: string;
  action: 'start_roleplay' | 'watch_video' | 'view_slide' | 'join_webinar' | 'practice_technique' | 'open_link';
  payload?: Record<string, unknown>;
}

export interface RoleplayProposal {
  title: string;
  description: string;
  scenario: string;
  techniqueId: string;
  difficulty: 'onbewuste_onkunde' | 'bewuste_onkunde' | 'bewuste_kunde' | 'onbewuste_kunde';
  estimatedMinutes?: number;
}

export interface SessionCreateRequest {
  userId: string;
  techniqueId?: string;
  techniqueName?: string;
  isExpert?: boolean;
}

export interface SessionCreateResponse {
  sessionId: string;
  greeting: string;
  mode: string;
}

export interface HugoContext {
  welcomeMessage: string;
  userProfile?: {
    name?: string;
    role?: string;
    company?: string;
    level?: string;
  };
  recentActivity?: {
    lastSession?: string;
    lastTechnique?: string;
    sessionsThisWeek?: number;
  };
  mastery?: Record<string, {
    techniqueId: string;
    techniqueName: string;
    level: number;
    lastPracticed?: string;
  }>;
  suggestedTopics?: string[];
}

export interface HandoffResult {
  success: boolean;
  userId?: string;
  redirect?: string;
  error?: string;
}

export interface SyncMessage {
  id: string;
  sourcePlatform: 'com' | 'ai';
  targetPlatform: 'com' | 'ai' | 'both';
  messageType: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'processed' | 'failed';
  createdAt: string;
  processedAt?: string;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  engine: string;
  timestamp: string;
}
