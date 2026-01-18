import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Technique sessions table - tracks technique-specific context
export const techniqueSessions = pgTable("technique_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().default("demo-user"),
  techniqueId: varchar("technique_id").notNull(), // e.g. "1.1", "2.1.8"
  context: jsonb("context").notNull(), // Store Q&A answers
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used").defaultNow(),
});

// User context table - global user context for roleplay sessions
export const userContext = pgTable("user_context", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  product: text("product"), // What they sell
  klantType: text("klant_type"), // Customer type
  sector: text("sector"), // Industry sector
  setting: text("setting"), // Where conversation takes place
  additionalContext: jsonb("additional_context"), // Extra flexibility
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Customer Profile type for persona engine (hidden from user)
export interface CustomerProfile {
  behavior_style: "controlerend" | "faciliterend" | "analyserend" | "promoverend";
  buying_clock: "00-06" | "06-08" | "08-11" | "11-12";
  experience_level: 0 | 1; // 0 = novice, 1 = experienced
  difficulty: 1 | 2 | 3 | 4; // internal only, no labels shown
}

// Sessions table - tracks conversation sessions with state machine
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  scenarioId: varchar("scenario_id").notNull(),
  fase: integer("fase").notNull().default(1), // 1, 2, 3, or 4
  mode: text("mode").notNull().default("COACH_INTRO"), // COACH_INTRO | CONTEXT_GATHERING | ROLEPLAY | COACH_FEEDBACK
  houding: text("houding").notNull().default("klant stelt vragen"), // customer attitude for scenario
  techniqueId: text("technique_id"), // Current technique being practiced
  techniqueContext: jsonb("technique_context"), // Context from Q&A
  contextQuestionIndex: integer("context_question_index").notNull().default(0), // Current context question index
  stapStack: jsonb("stap_stack").$type<string[]>().notNull().default(sql`'["1.1","1.2","1.3","1.4"]'::jsonb`),
  lockedThemes: jsonb("locked_themes").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  usedTechniques: jsonb("used_techniques").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  pendingObjections: jsonb("pending_objections").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  lastCustomerAttitude: text("last_customer_attitude"),
  scoreTotal: integer("score_total").notNull().default(0),
  customerProfile: jsonb("customer_profile").$type<CustomerProfile>(), // Hidden persona engine selection
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Turns table - individual conversation messages
export const turns = pgTable("turns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  role: text("role").notNull(), // "user" | "assistant"
  mode: text("mode"), // "COACH_INTRO" | "ROLEPLAY" | "COACH_FEEDBACK" (null for user messages)
  text: text("text").notNull(),
  techniqueId: text("technique_id"), // e.g., "2.1.6"
  meta: jsonb("meta"), // JSON: customer_attitude, lock_event, eval_points, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Lock events - when themes are locked via 2.1.8
export const lockEvents = pgTable("lock_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  theme: text("theme").notNull(), // e.g., "Budget", "Timing"
  turnId: varchar("turn_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================
// PERSONA ENGINE TABLES (hidden from user)
// =====================

// Persona history - tracks which personas were played and outcomes
export const personaHistory = pgTable("persona_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  sessionId: varchar("session_id").notNull(),
  customerProfile: jsonb("customer_profile").$type<CustomerProfile>().notNull(),
  outcome: text("outcome"), // "success" | "partial" | "struggle" | null (ongoing)
  techniqueId: text("technique_id"), // which technique was practiced
  successSignals: integer("success_signals").notNull().default(0), // count of positive signals
  struggleSignals: jsonb("struggle_signals").$type<string[]>().notNull().default(sql`'[]'::jsonb`), // e.g., ["te snel vertellen", "geen commitment"]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User training profile - aggregated struggle patterns per user (hidden)
export const userTrainingProfile = pgTable("user_training_profile", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  currentDifficulty: integer("current_difficulty").notNull().default(1), // 1-4, starts at 1
  successStreak: integer("success_streak").notNull().default(0), // consecutive successes
  totalSessions: integer("total_sessions").notNull().default(0),
  totalSuccesses: integer("total_successes").notNull().default(0),
  strugglePatterns: jsonb("struggle_patterns").$type<Record<string, number>>().notNull().default(sql`'{}'::jsonb`), // {"te snel vertellen": 3, "geen commitment": 2}
  recentPersonas: jsonb("recent_personas").$type<string[]>().notNull().default(sql`'[]'::jsonb`), // last N persona hashes for cooldown
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Video courses table
export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  muxAssetId: text("mux_asset_id"),
  muxPlaybackId: text("mux_playback_id"),
  muxUploadId: text("mux_upload_id"),
  status: text("status").notNull().default("pending"), // pending | processing | ready | error
  duration: integer("duration"), // in seconds
  courseModule: text("course_module"), // e.g., "Fase 1", "Fase 2"
  techniqueId: text("technique_id"), // Link to specific technique
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Video progress tracking
export const videoProgress = pgTable("video_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  videoId: varchar("video_id").notNull(),
  watchedSeconds: integer("watched_seconds").notNull().default(0),
  completed: integer("completed").notNull().default(0), // 0 = not completed, 1 = completed
  lastPosition: integer("last_position").notNull().default(0), // Last playback position
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const sessionsRelations = relations(sessions, ({ many }) => ({
  turns: many(turns),
  lockEvents: many(lockEvents),
}));

export const turnsRelations = relations(turns, ({ one }) => ({
  session: one(sessions, {
    fields: [turns.sessionId],
    references: [sessions.id],
  }),
}));

export const lockEventsRelations = relations(lockEvents, ({ one }) => ({
  session: one(sessions, {
    fields: [lockEvents.sessionId],
    references: [sessions.id],
  }),
}));

export const videosRelations = relations(videos, ({ many }) => ({
  progress: many(videoProgress),
}));

export const videoProgressRelations = relations(videoProgress, ({ one }) => ({
  video: one(videos, {
    fields: [videoProgress.videoId],
    references: [videos.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTechniqueSessionSchema = createInsertSchema(techniqueSessions).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
});

export const insertUserContextSchema = createInsertSchema(userContext).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  scenarioId: true,
  fase: true,
  mode: true,
  houding: true,
  techniqueId: true,
  techniqueContext: true,
  contextQuestionIndex: true,
  customerProfile: true,
});

export const insertTurnSchema = createInsertSchema(turns).omit({
  id: true,
  createdAt: true,
});

export const insertLockEventSchema = createInsertSchema(lockEvents).omit({
  id: true,
  createdAt: true,
});

export const insertPersonaHistorySchema = createInsertSchema(personaHistory).omit({
  id: true,
  createdAt: true,
});

export const insertUserTrainingProfileSchema = createInsertSchema(userTrainingProfile).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVideoProgressSchema = createInsertSchema(videoProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTechniqueSession = z.infer<typeof insertTechniqueSessionSchema>;
export type TechniqueSession = typeof techniqueSessions.$inferSelect;
export type InsertUserContext = z.infer<typeof insertUserContextSchema>;
export type UserContext = typeof userContext.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertTurn = z.infer<typeof insertTurnSchema>;
export type Turn = typeof turns.$inferSelect;
export type InsertLockEvent = z.infer<typeof insertLockEventSchema>;
export type LockEvent = typeof lockEvents.$inferSelect;
export type InsertPersonaHistory = z.infer<typeof insertPersonaHistorySchema>;
export type PersonaHistory = typeof personaHistory.$inferSelect;
export type InsertUserTrainingProfile = z.infer<typeof insertUserTrainingProfileSchema>;
export type UserTrainingProfile = typeof userTrainingProfile.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideoProgress = z.infer<typeof insertVideoProgressSchema>;
export type VideoProgress = typeof videoProgress.$inferSelect;

// =====================
// LIVE COACHING TABLES
// =====================

// Live coaching sessions (webinars)
export const liveSessions = pgTable("live_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  topic: text("topic"), // e.g., "Fase 4 • Beslissingsfase"
  level: text("level").default("Alle niveaus"), // difficulty level
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").notNull().default(60), // in minutes
  status: text("status").notNull().default("upcoming"), // upcoming | live | ended
  viewersCount: integer("viewers_count").notNull().default(0),
  // Daily.co video conferencing
  dailyRoomName: text("daily_room_name"),
  dailyRoomUrl: text("daily_room_url"),
  // Daily.co recording
  dailyRecordingId: text("daily_recording_id"),
  dailyRecordingUrl: text("daily_recording_url"),
  recordingReady: integer("recording_ready").notNull().default(0), // 0 = not ready/processing, 1 = ready, 2 = no recording
  // Legacy Mux fields (no longer used - keeping for data migration)
  muxLiveStreamId: text("mux_live_stream_id"),
  muxStreamKey: text("mux_stream_key"),
  muxPlaybackId: text("mux_playback_id"),
  muxAssetId: text("mux_asset_id"),
  muxRecordingPlaybackId: text("mux_recording_playback_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Live session attendees
export const liveSessionAttendees = pgTable("live_session_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  userId: varchar("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  reminderSet: integer("reminder_set").notNull().default(0), // 0 = no, 1 = yes
});

// Live chat messages
export const liveChatMessages = pgTable("live_chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  userId: varchar("user_id").notNull(),
  userName: text("user_name").notNull(),
  userInitials: text("user_initials").notNull(),
  message: text("message").notNull(),
  isHost: integer("is_host").notNull().default(0), // 0 = no, 1 = yes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Live polls
export const livePolls = pgTable("live_polls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  question: text("question").notNull(),
  active: integer("active").notNull().default(1), // 0 = closed, 1 = active
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Poll options
export const livePollOptions = pgTable("live_poll_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull(),
  text: text("text").notNull(),
  votes: integer("votes").notNull().default(0),
});

// Poll votes (track who voted)
export const livePollVotes = pgTable("live_poll_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull(),
  optionId: varchar("option_id").notNull(),
  userId: varchar("user_id").notNull(),
  votedAt: timestamp("voted_at").defaultNow().notNull(),
});

// Relations for live coaching
export const liveSessionsRelations = relations(liveSessions, ({ many }) => ({
  attendees: many(liveSessionAttendees),
  chatMessages: many(liveChatMessages),
  polls: many(livePolls),
}));

export const liveSessionAttendeesRelations = relations(liveSessionAttendees, ({ one }) => ({
  session: one(liveSessions, {
    fields: [liveSessionAttendees.sessionId],
    references: [liveSessions.id],
  }),
}));

export const liveChatMessagesRelations = relations(liveChatMessages, ({ one }) => ({
  session: one(liveSessions, {
    fields: [liveChatMessages.sessionId],
    references: [liveSessions.id],
  }),
}));

export const livePollsRelations = relations(livePolls, ({ one, many }) => ({
  session: one(liveSessions, {
    fields: [livePolls.sessionId],
    references: [liveSessions.id],
  }),
  options: many(livePollOptions),
  votes: many(livePollVotes),
}));

export const livePollOptionsRelations = relations(livePollOptions, ({ one }) => ({
  poll: one(livePolls, {
    fields: [livePollOptions.pollId],
    references: [livePolls.id],
  }),
}));

export const livePollVotesRelations = relations(livePollVotes, ({ one }) => ({
  poll: one(livePolls, {
    fields: [livePollVotes.pollId],
    references: [livePolls.id],
  }),
}));

// Insert schemas for live coaching
export const insertLiveSessionSchema = createInsertSchema(liveSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  dailyRecordingId: true,
  dailyRecordingUrl: true,
  recordingReady: true,
  viewersCount: true,
  // Legacy Mux fields
  muxLiveStreamId: true,
  muxStreamKey: true,
  muxPlaybackId: true,
  muxAssetId: true,
  muxRecordingPlaybackId: true,
});

export const insertLiveChatMessageSchema = createInsertSchema(liveChatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertLivePollSchema = createInsertSchema(livePolls).omit({
  id: true,
  createdAt: true,
});

export const insertLivePollOptionSchema = createInsertSchema(livePollOptions).omit({
  id: true,
});

// Types for live coaching
export type InsertLiveSession = z.infer<typeof insertLiveSessionSchema>;
export type LiveSession = typeof liveSessions.$inferSelect;
export type InsertLiveChatMessage = z.infer<typeof insertLiveChatMessageSchema>;
export type LiveChatMessage = typeof liveChatMessages.$inferSelect;
export type InsertLivePoll = z.infer<typeof insertLivePollSchema>;
export type LivePoll = typeof livePolls.$inferSelect;
export type InsertLivePollOption = z.infer<typeof insertLivePollOptionSchema>;
export type LivePollOption = typeof livePollOptions.$inferSelect;
export type LiveSessionAttendee = typeof liveSessionAttendees.$inferSelect;
export type LivePollVote = typeof livePollVotes.$inferSelect;

// =====================
// V2 SESSION PERSISTENCE
// =====================

// V2 roleplay sessions - persisted state for recovery
export const v2Sessions = pgTable("v2_sessions", {
  id: varchar("id").primaryKey(), // Session ID (v2-timestamp-random)
  userId: varchar("user_id").notNull(),
  techniqueId: varchar("technique_id").notNull(),
  
  // Mode & Phase
  mode: text("mode").notNull(), // HugoMode: ROLEPLAY, COACH_CHAT, etc.
  currentMode: text("current_mode").notNull(), // CONTEXT_GATHERING | ROLEPLAY | COACH_CHAT | DEBRIEF
  phase: integer("phase").notNull(),
  epicPhase: text("epic_phase").notNull().default("explore"), // explore | probe | impact | commit
  epicMilestones: jsonb("epic_milestones").$type<{
    probeUsed: boolean;
    impactAsked: boolean;
    commitReady: boolean;
  }>().notNull().default(sql`'{"probeUsed":false,"impactAsked":false,"commitReady":false}'::jsonb`),
  
  // Context & Dialogue
  context: jsonb("context").notNull(), // ContextState object
  dialogueState: jsonb("dialogue_state").notNull(), // DialogueState object
  
  // Roleplay state
  persona: jsonb("persona").notNull(), // Persona object
  currentAttitude: text("current_attitude"), // CustomerSignal or null
  turnNumber: integer("turn_number").notNull().default(0),
  conversationHistory: jsonb("conversation_history").$type<Array<{ role: 'seller' | 'customer'; content: string }>>().notNull().default(sql`'[]'::jsonb`),
  
  // Customer Dynamics
  customerDynamics: jsonb("customer_dynamics").notNull(), // CustomerDynamics object
  
  // Evaluation
  events: jsonb("events").$type<any[]>().notNull().default(sql`'[]'::jsonb`), // EvaluationEvent[]
  totalScore: integer("total_score").notNull().default(0),
  
  // Flags
  expertMode: integer("expert_mode").notNull().default(0), // 0 = false, 1 = true
  isActive: integer("is_active").notNull().default(1), // 0 = ended, 1 = active
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =====================
// USER ANALYTICS TABLES
// =====================

// Aggregated user statistics
export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  totalSessions: integer("total_sessions").notNull().default(0),
  totalTimeSeconds: integer("total_time_seconds").notNull().default(0),
  totalVideoTimeSeconds: integer("total_video_time_seconds").notNull().default(0),
  averageScore: integer("average_score").notNull().default(0), // 0-100
  currentStreak: integer("current_streak").notNull().default(0), // days
  longestStreak: integer("longest_streak").notNull().default(0), // days
  lastActiveDate: text("last_active_date"), // YYYY-MM-DD format for streak calculation
  weeklySessionCounts: jsonb("weekly_session_counts").$type<number[]>().notNull().default(sql`'[]'::jsonb`), // last 8 weeks
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Technique mastery per user per technique
export const techniqueMastery = pgTable("technique_mastery", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  techniqueId: varchar("technique_id").notNull(), // e.g., "1.1", "2.1.8"
  techniqueName: text("technique_name"), // e.g., "Agenda"
  attemptCount: integer("attempt_count").notNull().default(0),
  successCount: integer("success_count").notNull().default(0),
  totalScore: integer("total_score").notNull().default(0), // sum of all scores
  averageScore: integer("average_score").notNull().default(0), // 0-100
  masteryLevel: text("mastery_level").notNull().default("beginner"), // beginner | intermediate | advanced | master
  lastPracticed: timestamp("last_practiced"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Detailed activity log for analytics
export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  eventType: text("event_type").notNull(), // session_start | session_end | video_play | video_complete | technique_attempt | login
  entityType: text("entity_type"), // session | video | technique
  entityId: varchar("entity_id"), // ID of the related entity
  durationSeconds: integer("duration_seconds"), // time spent (for session_end, video_complete)
  score: integer("score"), // score achieved (for technique_attempt, session_end)
  metadata: jsonb("metadata"), // extra context
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations for analytics
export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

export const techniqueMasteryRelations = relations(techniqueMastery, ({ one }) => ({
  user: one(users, {
    fields: [techniqueMastery.userId],
    references: [users.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));

// Insert schema for V2 sessions
export const insertV2SessionSchema = createInsertSchema(v2Sessions).omit({
  createdAt: true,
  updatedAt: true,
});

// Type for V2 sessions
export type InsertV2Session = z.infer<typeof insertV2SessionSchema>;
export type V2Session = typeof v2Sessions.$inferSelect;

// Insert schemas for analytics
export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTechniqueMasterySchema = createInsertSchema(techniqueMastery).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  createdAt: true,
});

// Types for analytics
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type InsertTechniqueMastery = z.infer<typeof insertTechniqueMasterySchema>;
export type TechniqueMastery = typeof techniqueMastery.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;

// API Response types
export type SessionState = {
  sessionId: string;
  scenarioId: string;
  fase: 1 | 2 | 3 | 4;
  mode: "COACH_INTRO" | "CONTEXT_GATHERING" | "ROLEPLAY_READY" | "ROLEPLAY" | "COACH_FEEDBACK";
  houding: string;
  techniqueId?: string | null;
  techniqueContext?: any;
  stapStack: string[];
  lockedThemes: string[];
  usedTechniques: string[];
  pendingObjections: string[];
  lastCustomerAttitude: string | null;
  scoreTotal: number;
};

export type MessageResponse = {
  assistant: string;
  speechText: string; // Clean text for TTS - guaranteed no telemetry (evaluation, score, etc)
  fase: 1 | 2 | 3 | 4;
  applied_technique: string;
  locks: string[];
  score: {
    delta: number;
    total: number;
  };
  next_allowed: string[];
  warnings: string[];
  mistakes_detected: string[]; // Top-level guardrail violations for consumers
  feedback: string[];
  metadata?: any; // Optional telemetry data that must NEVER be spoken
  debug?: any; // Optional debug info for transparency panel (RoleplayDebugInfo or CoachDebugInfo)
};

export type Scenario = {
  id: string;
  naam: string;
  categorie: string;
  niveau: string;
  duur: string;
  score: number;
  tries: number;
  beschrijving: string;
};
