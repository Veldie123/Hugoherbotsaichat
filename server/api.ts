/**
 * API Server for Hugo Engine V2 - FULL ENGINE
 * Uses complete engine with nested prompts, RAG, and validation loop
 * 
 * ROLEPLAY-API-ENDPOINTS
 * ----------------------
 * Status: Done (januari 2026)
 * 
 * Bron: hugo-engine_(4).zip → hugo-engine-export/server/routes.ts
 * Endpoints zijn al geëxtraheerd en werkend.
 * 
 * Beschikbare endpoints (via routes.ts - uit ZIP):
 * - POST /api/session/:id/start-roleplay - Transition to ROLEPLAY mode
 * - POST /api/session/:id/message - Process roleplay messages  
 * - POST /api/session/:id/feedback - Get mid-session feedback
 * - POST /api/session/:id/evaluate - Get evaluation scores
 * 
 * V2 endpoints (via api.ts):
 * - POST /api/v2/roleplay/start - Full V2 roleplay session
 * - POST /api/v2/roleplay/message - V2 roleplay message processing
 * - POST /api/v2/roleplay/end - End with debrief
 * 
 * Frontend koppeling: src/services/hugoApi.ts roept deze endpoints aan
 */

import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";

// FULL ENGINE IMPORTS - Replacing simplified versions
import { 
  generateCoachResponse, 
  generateCoachOpening,
  type CoachContext,
  type CoachMessage,
  type CoachResponse
} from "./v2/coach-engine";

import {
  createContextState,
  processAnswer,
  generateQuestionForSlot,
  getNextSlotKey,
  formatContextForPrompt,
  type ContextState,
  type ConversationMessage
} from "./v2/context_engine";

import { getTechnique } from "./ssot-loader";
import { AccessToken } from "livekit-server-sdk";
import { setupScribeWebSocket } from "./elevenlabs-stt";
import { pool } from "./db";

// Roleplay Engine imports
import {
  initSession as initRoleplaySession,
  getOpeningMessage,
  processInput,
  endRoleplay,
  isInRoleplay,
  getSessionSummary,
  type V2SessionState,
  type EngineResponse
} from "./v2/roleplay-engine";

import {
  saveReferenceAnswer,
  getReferenceAnswers,
  getExamplesForTechnique,
  generateMisclassificationReport,
  getAllReferenceAnswersGrouped,
  type ReferenceAnswer
} from "./v2/reference-answers";

import { indexCorpus, getDocumentCount } from "./v2/rag-service";
import { 
  saveArtifact, 
  getArtifact, 
  getSessionArtifacts, 
  getArtifactsMap,
  hasRequiredArtifacts,
  type ArtifactContent
} from "./v2/artifact-service";
import type { ArtifactType } from "./v2/orchestrator";
import {
  buildExtendedContext,
  formatExtendedContextForPrompt,
  getRequiredLayers,
  checkRoleplayUnlock,
  getSequenceRank,
  LAYER_SLOTS,
  FLOW_RULES,
  type ContextDepth,
  type ContextLayer
} from "./v2/context-layers-service";
import {
  generateDiscoveryBrief,
  generateOfferBrief,
  generateScenarioSnapshot
} from "./v2/brief-generator-service";

const app = express();

app.use(express.json({ limit: "10mb" }));

// CORS headers for development
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// ===========================================
// SESSION STORAGE (database-backed with in-memory cache)
// ===========================================

interface Session {
  id: string;
  mode: "CONTEXT_GATHERING" | "COACH_CHAT" | "ROLEPLAY";
  techniqueId: string;
  techniqueName: string;
  conversationHistory: CoachMessage[];
  contextState: ContextState;
  isExpert: boolean;
  createdAt: Date;
  userId?: string;
  userName?: string;
}

const sessions = new Map<string, Session>();

// Helper: Save session to database
async function saveSessionToDb(session: Session): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO v2_sessions (
        id, user_id, technique_id, mode, current_mode, phase, epic_phase, epic_milestones,
        context, dialogue_state, persona, turn_number, conversation_history, 
        customer_dynamics, events, total_score, expert_mode, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW())
      ON CONFLICT (id) DO UPDATE SET
        current_mode = $5,
        phase = $6,
        context = $9,
        dialogue_state = $10,
        turn_number = $12,
        conversation_history = $13,
        total_score = $16,
        is_active = $18,
        updated_at = NOW()`,
      [
        session.id,
        session.userId || 'anonymous',
        session.techniqueId,
        session.mode,
        session.mode,
        session.contextState.isComplete ? 2 : 1, // phase: 1=gathering, 2=coaching
        'OPENING', // epic_phase
        JSON.stringify({}), // epic_milestones
        JSON.stringify(session.contextState.gathered), // context
        JSON.stringify({ questionsAsked: session.contextState.questionsAsked, questionsAnswered: session.contextState.questionsAnswered }), // dialogue_state
        JSON.stringify({ name: session.userName }), // persona
        session.conversationHistory.length, // turn_number
        JSON.stringify(session.conversationHistory), // conversation_history
        JSON.stringify({}), // customer_dynamics
        JSON.stringify([]), // events
        0, // total_score
        session.isExpert ? 1 : 0, // expert_mode
        1, // is_active
        session.createdAt
      ]
    );
  } catch (error: any) {
    console.error("[API] Error saving session to DB:", error.message);
  }
}

// Helper: Load session from database
async function loadSessionFromDb(sessionId: string): Promise<Session | null> {
  try {
    const result = await pool.query(
      `SELECT * FROM v2_sessions WHERE id = $1`,
      [sessionId]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    const conversationHistory = row.conversation_history || [];
    const context = row.context || {};
    const dialogueState = row.dialogue_state || {};
    
    return {
      id: row.id,
      mode: row.current_mode as Session['mode'],
      techniqueId: row.technique_id,
      techniqueName: getTechnique(row.technique_id)?.naam || row.technique_id,
      conversationHistory,
      contextState: {
        userId: row.user_id,
        sessionId: row.id,
        techniqueId: row.technique_id,
        gathered: context,
        questionsAsked: dialogueState.questionsAsked || [],
        questionsAnswered: dialogueState.questionsAnswered || [],
        isComplete: row.phase >= 2,
        currentQuestionKey: null,
        lensPhase: false,
        lensQuestionsAsked: []
      },
      isExpert: row.expert_mode === 1,
      createdAt: new Date(row.created_at),
      userId: row.user_id,
      userName: row.persona?.name
    };
  } catch (error: any) {
    console.error("[API] Error loading session from DB:", error.message);
    return null;
  }
}

// Clean up old sessions from memory (older than 2 hours)
// Database sessions persist and can be loaded on demand
setInterval(() => {
  const now = Date.now();
  const twoHours = 2 * 60 * 60 * 1000;
  for (const [id, session] of sessions.entries()) {
    if (now - session.createdAt.getTime() > twoHours) {
      sessions.delete(id);
      console.log(`[API] Cleaned up expired in-memory session: ${id}`);
    }
  }
}, 30 * 60 * 1000); // Run every 30 minutes

// ===========================================
// TECHNIEKEN ENDPOINT (for sidebar)
// ===========================================
app.get("/api/technieken", async (req, res) => {
  try {
    const indexPath = path.join(process.cwd(), "config/ssot/technieken_index.json");
    const indexData = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    
    const techniques: any[] = [];
    for (const [techId, tech] of Object.entries(indexData.technieken || {})) {
      const techData = tech as any;
      techniques.push({
        nummer: techData.nummer || techId,
        naam: techData.naam,
        fase: techData.fase,
        doel: techData.doel,
        is_fase: techData.is_fase,
        tags: techData.tags,
        ...techData
      });
    }
    res.json(techniques);
  } catch (error: any) {
    console.error("[API] Error loading technieken:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// V2 SESSION ENDPOINTS - FULL ENGINE
// ===========================================

// Start a new session with FULL engine
app.post("/api/v2/sessions", async (req, res) => {
  try {
    const { techniqueId, mode = "COACH_CHAT", isExpert = false, userId, userName } = req.body;
    
    if (!techniqueId) {
      return res.status(400).json({ error: "techniqueId is required" });
    }
    
    const sessionId = `session-${nanoid(12)}`;
    
    // Get technique info from SSOT
    const technique = getTechnique(techniqueId);
    const techniqueName = technique?.naam || techniqueId;
    
    // Create context state for context gathering
    const contextState = createContextState(userId || 'anonymous', sessionId, techniqueId);
    
    // Load existing user context from database and pre-fill gathered slots
    const userIdForContext = userId || 'anonymous';
    try {
      const existingContextResult = await pool.query(
        `SELECT sector, product, klant_type, setting, additional_context 
         FROM user_context WHERE user_id = $1`,
        [userIdForContext]
      );
      
      if (existingContextResult.rows.length > 0) {
        const row = existingContextResult.rows[0];
        // Pre-fill context state with existing values
        if (row.sector) {
          contextState.gathered.sector = row.sector;
          contextState.questionsAnswered.push('sector');
        }
        if (row.product) {
          contextState.gathered.product = row.product;
          contextState.questionsAnswered.push('product');
        }
        if (row.klant_type) {
          contextState.gathered.klant_type = row.klant_type;
          contextState.questionsAnswered.push('klant_type');
        }
        // Check additional_context for verkoopkanaal and ervaring
        const additional = row.additional_context || {};
        if (additional.verkoopkanaal) {
          contextState.gathered.verkoopkanaal = additional.verkoopkanaal;
          contextState.questionsAnswered.push('verkoopkanaal');
        }
        if (additional.ervaring) {
          contextState.gathered.ervaring = additional.ervaring;
          contextState.questionsAnswered.push('ervaring');
        }
        
        console.log(`[API] Pre-filled context for user ${userIdForContext}:`, Object.keys(contextState.gathered).join(', '));
      }
    } catch (contextError: any) {
      console.warn("[API] Could not load existing context:", contextError.message);
    }
    
    // Create session - always start with context gathering
    const session: Session = {
      id: sessionId,
      mode: "CONTEXT_GATHERING",
      techniqueId,
      techniqueName,
      conversationHistory: [],
      contextState,
      isExpert,
      createdAt: new Date(),
      userId,
      userName
    };
    
    sessions.set(sessionId, session);
    
    // Generate opening message using FULL engine
    const coachContext: CoachContext = {
      userId,
      techniqueId,
      techniqueName,
      userName
    };
    
    // For context gathering, generate first question
    const nextSlot = getNextSlotKey(contextState);
    let initialMessage: string;
    
    if (nextSlot) {
      const questionResult = await generateQuestionForSlot(
        nextSlot,
        contextState.gathered,
        techniqueId,
        []
      );
      initialMessage = questionResult.message;
      session.contextState.currentQuestionKey = nextSlot;
    } else {
      // No context gathering needed, go straight to coaching
      session.mode = "COACH_CHAT";
      const openingResult = await generateCoachOpening(coachContext);
      initialMessage = openingResult.message;
    }
    
    // Add to conversation history
    session.conversationHistory.push({
      role: "assistant",
      content: initialMessage
    });
    
    // Save session to database for persistence
    await saveSessionToDb(session);
    
    console.log(`[API] Created FULL session ${sessionId} for technique ${techniqueId} (${techniqueName})`);
    console.log(`[API] Mode: ${session.mode}, Next slot: ${nextSlot || 'N/A'}`);
    
    res.json({
      sessionId,
      phase: session.mode,
      initialMessage,
      debug: isExpert ? {
        engine: "V2-FULL",
        technique: techniqueName,
        contextState: {
          nextSlot,
          questionsAnswered: contextState.questionsAnswered,
          gathered: contextState.gathered
        }
      } : undefined
    });
    
  } catch (error: any) {
    console.error("[API] Error creating session:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Send a message - FULL ENGINE with validation loop
app.post("/api/v2/message", async (req, res) => {
  try {
    const { sessionId, content, isExpert = false } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }
    
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found. Please start a new session." });
    }
    
    // Add user message to history
    session.conversationHistory.push({
      role: "user",
      content
    });
    
    let response: string;
    let debug: any = {};
    let validatorInfo: any = null;
    
    // Route to the correct engine based on mode
    switch (session.mode) {
      case "CONTEXT_GATHERING": {
        // Process the answer for current slot
        const currentSlot = session.contextState.currentQuestionKey;
        
        if (currentSlot) {
          // Update context state with the answer
          session.contextState = processAnswer(
            session.contextState,
            currentSlot,
            content,
            session.isExpert ? 2 : undefined // Expert mode: limit to 2 slots
          );
          
          // Save updated context to database for persistence
          const userIdToSave = session.userId || 'anonymous';
          const gathered = session.contextState.gathered;
          try {
            await pool.query(
              `INSERT INTO user_context (id, user_id, sector, product, klant_type, additional_context, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, NOW())
               ON CONFLICT (user_id) DO UPDATE SET
                 sector = COALESCE($3, user_context.sector),
                 product = COALESCE($4, user_context.product),
                 klant_type = COALESCE($5, user_context.klant_type),
                 additional_context = COALESCE($6, user_context.additional_context),
                 updated_at = NOW()`,
              [
                nanoid(), 
                userIdToSave, 
                gathered.sector || null, 
                gathered.product || null, 
                gathered.klant_type || null,
                gathered.verkoopkanaal || gathered.ervaring 
                  ? { verkoopkanaal: gathered.verkoopkanaal, ervaring: gathered.ervaring }
                  : null
              ]
            );
            console.log(`[API] Saved context for user ${userIdToSave}: ${currentSlot}=${gathered[currentSlot]}`);
          } catch (saveError: any) {
            console.warn("[API] Could not save context:", saveError.message);
          }
        }
        
        // Check if context gathering is complete
        if (session.contextState.isComplete) {
          // Transition to COACH_CHAT
          session.mode = "COACH_CHAT";
          console.log(`[API] Session ${sessionId} transitioning to COACH_CHAT`);
          
          // Generate coach opening with gathered context
          const coachContext: CoachContext = {
            userId: session.userId,
            techniqueId: session.techniqueId,
            techniqueName: session.techniqueName,
            userName: session.userName,
            sector: session.contextState.gathered.sector,
            product: session.contextState.gathered.product,
            klantType: session.contextState.gathered.klant_type,
            sessionContext: session.contextState.gathered,
            contextGatheringHistory: session.conversationHistory.map(m => ({
              role: m.role === 'user' ? 'seller' as const : 'customer' as const,
              content: m.content
            }))
          };
          
          const openingResult = await generateCoachOpening(coachContext);
          response = openingResult.message;
          validatorInfo = openingResult.validatorInfo;
          
          debug = {
            phase: "COACH_CHAT",
            transitionedFrom: "CONTEXT_GATHERING",
            gatheredContext: session.contextState.gathered,
            ragDocsFound: openingResult.debug?.documentsFound || 0,
            wasRepaired: openingResult.debug?.wasRepaired || false
          };
        } else {
          // Continue context gathering - ask next question
          const nextSlot = getNextSlotKey(session.contextState);
          
          if (nextSlot) {
            session.contextState.currentQuestionKey = nextSlot;
            
            const conversationHistory: ConversationMessage[] = session.conversationHistory.map(m => ({
              role: m.role as 'user' | 'assistant',
              content: m.content
            }));
            
            const questionResult = await generateQuestionForSlot(
              nextSlot,
              session.contextState.gathered,
              session.techniqueId,
              conversationHistory
            );
            
            response = questionResult.message;
            validatorInfo = questionResult.validatorInfo;
          } else {
            // No more slots but not complete - edge case
            response = "Bedankt voor de informatie! Laten we nu verder gaan met de training.";
            session.mode = "COACH_CHAT";
          }
          
          debug = {
            phase: "CONTEXT_GATHERING",
            contextComplete: session.contextState.isComplete,
            gatheredFields: Object.keys(session.contextState.gathered).filter(k => session.contextState.gathered[k]),
            nextSlot: session.contextState.currentQuestionKey,
            questionsAnswered: session.contextState.questionsAnswered
          };
        }
        break;
      }
        
      case "COACH_CHAT": {
        // Use FULL coach engine with RAG and validation
        const coachContext: CoachContext = {
          userId: session.userId,
          techniqueId: session.techniqueId,
          techniqueName: session.techniqueName,
          userName: session.userName,
          sector: session.contextState.gathered.sector,
          product: session.contextState.gathered.product,
          klantType: session.contextState.gathered.klant_type,
          sessionContext: session.contextState.gathered
        };
        
        const coachResult = await generateCoachResponse(
          content,
          session.conversationHistory,
          coachContext
        );
        
        response = coachResult.message;
        validatorInfo = coachResult.validatorInfo;
        
        debug = {
          phase: "COACH_CHAT",
          ragQuery: coachResult.debug?.ragQuery,
          ragDocsFound: coachResult.debug?.documentsFound || 0,
          searchTimeMs: coachResult.debug?.searchTimeMs || 0,
          wasRepaired: coachResult.debug?.wasRepaired || false,
          repairAttempts: coachResult.debug?.repairAttempts || 0,
          context: {
            sector: coachContext.sector,
            product: coachContext.product,
            klantType: coachContext.klantType
          }
        };
        break;
      }
        
      case "ROLEPLAY": {
        // Roleplay mode - similar to coach but with different persona
        const coachContext: CoachContext = {
          userId: session.userId,
          techniqueId: session.techniqueId,
          techniqueName: session.techniqueName,
          userName: session.userName,
          sector: session.contextState.gathered.sector,
          product: session.contextState.gathered.product,
          klantType: session.contextState.gathered.klant_type,
          sessionContext: session.contextState.gathered
        };
        
        const roleplayResult = await generateCoachResponse(
          content,
          session.conversationHistory,
          coachContext
        );
        
        response = roleplayResult.message;
        validatorInfo = roleplayResult.validatorInfo;
        
        debug = {
          phase: "ROLEPLAY",
          ragDocsFound: roleplayResult.debug?.documentsFound || 0,
          wasRepaired: roleplayResult.debug?.wasRepaired || false
        };
        break;
      }
        
      default:
        response = "Onbekende sessie modus. Start een nieuwe sessie.";
    }
    
    // Add assistant response to history
    session.conversationHistory.push({
      role: "assistant",
      content: response
    });
    
    // Return response with optional debug info
    const result: any = { 
      response, 
      phase: session.mode,
      contextData: session.contextState.gathered
    };
    
    if (isExpert || session.isExpert) {
      result.debug = {
        ...debug,
        engine: "V2-FULL",
        persona: {
          behavior_style: "analyserend",
          buying_clock_stage: "market_research",
          difficulty_level: session.isExpert ? "bewuste_kunde" : "onbewuste_onkunde"
        },
        dynamics: session.mode === "ROLEPLAY" ? {
          rapport: 0.5,
          valueTension: 0.5,
          commitReadiness: 0.5
        } : null,
        context: {
          fase: parseInt(session.techniqueId?.split('.')[0]) || 1,
          sector: session.contextState.gathered.sector,
          product: session.contextState.gathered.product
        },
        validatorInfo: validatorInfo ? {
          mode: validatorInfo.mode,
          wasRepaired: validatorInfo.wasRepaired,
          validationLabel: validatorInfo.validationLabel,
          repairAttempts: validatorInfo.repairAttempts
        } : null
      };
    }
    
    // Save updated session to database
    await saveSessionToDb(session);
    
    res.json(result);
    
  } catch (error: any) {
    console.error("[API] Error processing message:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v2/session/message - Frontend-compatible message endpoint
// Maps frontend field names and includes full debug info with customerDynamics
app.post("/api/v2/session/message", async (req, res) => {
  try {
    const { sessionId, message, debug: enableDebug = false, expertMode = false } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }
    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }
    
    // Try to get session from memory, fallback to database
    let session = sessions.get(sessionId);
    if (!session) {
      session = await loadSessionFromDb(sessionId) ?? undefined;
      if (session) {
        sessions.set(session.id, session);
      }
    }
    
    if (!session) {
      return res.status(404).json({ error: "Session not found. Please start a new session." });
    }
    
    // Add user message to history
    session.conversationHistory.push({
      role: "user",
      content: message
    });
    
    let responseText: string;
    let promptsUsed: { systemPrompt: string; userPrompt?: string } | undefined;
    let ragDocuments: any[] = [];
    let validatorInfo: any = null;
    
    // Calculate dynamic customerDynamics based on conversation
    const turnCount = session.conversationHistory.filter(m => m.role === 'user').length;
    const baseRapport = 50;
    const rapportGrowth = Math.min(turnCount * 5, 30); // Max +30% growth
    const customerDynamics = {
      rapport: Math.min(baseRapport + rapportGrowth, 85),
      valueTension: 50 + Math.floor(Math.random() * 20) - 10, // Slight variation
      commitReadiness: Math.min(30 + turnCount * 8, 70)
    };
    
    // Route to the correct engine based on mode
    switch (session.mode) {
      case "CONTEXT_GATHERING": {
        const currentSlot = session.contextState.currentQuestionKey;
        
        if (currentSlot) {
          session.contextState = processAnswer(
            session.contextState,
            currentSlot,
            message,
            session.isExpert ? 2 : undefined
          );
        }
        
        if (session.contextState.isComplete) {
          session.mode = "COACH_CHAT";
          
          const coachContext: CoachContext = {
            userId: session.userId,
            techniqueId: session.techniqueId,
            techniqueName: session.techniqueName,
            userName: session.userName,
            sector: session.contextState.gathered.sector,
            product: session.contextState.gathered.product,
            klantType: session.contextState.gathered.klant_type,
            sessionContext: session.contextState.gathered,
            contextGatheringHistory: session.conversationHistory.map(m => ({
              role: m.role === 'user' ? 'seller' as const : 'customer' as const,
              content: m.content
            }))
          };
          
          const openingResult = await generateCoachOpening(coachContext);
          responseText = openingResult.message;
          validatorInfo = openingResult.validatorInfo;
          promptsUsed = openingResult.promptsUsed;
          ragDocuments = openingResult.ragContext || [];
        } else {
          const nextSlot = getNextSlotKey(session.contextState);
          
          if (nextSlot) {
            session.contextState.currentQuestionKey = nextSlot;
            
            const conversationHistory: ConversationMessage[] = session.conversationHistory.map(m => ({
              role: m.role as 'user' | 'assistant',
              content: m.content
            }));
            
            const questionResult = await generateQuestionForSlot(
              nextSlot,
              session.contextState.gathered,
              session.techniqueId,
              conversationHistory
            );
            
            responseText = questionResult.message;
            promptsUsed = questionResult.promptsUsed;
            ragDocuments = [];
          } else {
            responseText = "Ik heb alle benodigde context. Laten we beginnen met de coaching.";
            session.mode = "COACH_CHAT";
          }
        }
        break;
      }
      
      case "COACH_CHAT":
      case "ROLEPLAY": {
        const coachContext: CoachContext = {
          userId: session.userId,
          techniqueId: session.techniqueId,
          techniqueName: session.techniqueName,
          userName: session.userName,
          sector: session.contextState.gathered.sector,
          product: session.contextState.gathered.product,
          klantType: session.contextState.gathered.klant_type,
          sessionContext: session.contextState.gathered,
          contextGatheringHistory: session.conversationHistory.map(m => ({
            role: m.role === 'user' ? 'seller' as const : 'customer' as const,
            content: m.content
          }))
        };
        
        const coachHistory: CoachMessage[] = session.conversationHistory.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }));
        
        const coachResult = await generateCoachResponse(message, coachHistory, coachContext);
        responseText = coachResult.message;
        validatorInfo = coachResult.validatorInfo;
        promptsUsed = coachResult.promptsUsed;
        ragDocuments = coachResult.ragContext || [];
        break;
      }
      
      default:
        responseText = "Onbekende sessiemodus.";
    }
    
    // Add assistant response to history
    session.conversationHistory.push({
      role: "assistant",
      content: responseText
    });
    
    // Save updated session
    await saveSessionToDb(session);
    
    // Build response matching frontend expectations (SendMessageResponse interface)
    const currentPhase = parseInt(session.techniqueId?.split('.')[0]) || 1;
    const response: any = {
      response: responseText,  // Frontend expects 'response', not 'message'
      phase: session.mode,
      contextData: {
        sector: session.contextState.gathered.sector,
        product: session.contextState.gathered.product,
        klant_type: session.contextState.gathered.klant_type,
        verkoopkanaal: session.contextState.gathered.verkoopkanaal
      },
      debug: {
        phase: session.mode,
        signal: "neutraal",
        detectedTechniques: [],
        evaluation: "neutraal",
        contextComplete: session.contextState.isComplete,
        gatheredFields: Object.keys(session.contextState.gathered).filter(k => session.contextState.gathered[k]),
        persona: {
          behavior_style: "analyserend",
          buying_clock_stage: "market_research",
          difficulty_level: session.isExpert ? "bewuste_kunde" : "onbewuste_onkunde"
        },
        context: {
          fase: currentPhase,
          gathered: session.contextState.gathered
        },
        customerDynamics: customerDynamics,
        aiDecision: {
          epicFase: `Fase ${currentPhase}`,
          evaluatie: "neutraal"
        },
        ragDocuments: ragDocuments,
        promptsUsed: promptsUsed || { systemPrompt: "Geen prompt beschikbaar", userPrompt: "" },
        validatorInfo: validatorInfo ? {
          mode: validatorInfo.mode,
          wasRepaired: validatorInfo.wasRepaired,
          validationLabel: validatorInfo.validationLabel
        } : null
      },
      promptsUsed: promptsUsed || { systemPrompt: "Geen prompt beschikbaar", userPrompt: "" }
    };
    
    res.json(response);
    
  } catch (error: any) {
    console.error("[API] Error in session/message:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Get session info
app.get("/api/v2/sessions/:sessionId", async (req, res) => {
  try {
    let session = sessions.get(req.params.sessionId);
    
    // Try to load from database if not in memory
    if (!session) {
      session = await loadSessionFromDb(req.params.sessionId) ?? undefined;
      if (session) {
        sessions.set(session.id, session);
      }
    }
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    res.json({
      id: session.id,
      mode: session.mode,
      techniqueId: session.techniqueId,
      techniqueName: session.techniqueName,
      contextData: session.contextState.gathered,
      contextComplete: session.contextState.isComplete,
      messageCount: session.conversationHistory.length,
      createdAt: session.createdAt
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete session
app.delete("/api/v2/sessions/:sessionId", async (req, res) => {
  try {
    const deleted = sessions.delete(req.params.sessionId);
    if (!deleted) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get session stats
app.get("/api/sessions/stats", async (req, res) => {
  try {
    const activeSessions = sessions.size;
    res.json({
      total: activeSessions,
      active: activeSessions,
      excellentQuality: 0,
      averageScore: 0,
      needsImprovement: 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all sessions list (from database)
app.get("/api/sessions", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    
    // Query database for sessions - include events and customer_dynamics for debug info
    let query = `
      SELECT id, user_id, technique_id, current_mode, phase, turn_number, 
             conversation_history, context, total_score, expert_mode, 
             events, customer_dynamics, epic_phase,
             created_at, updated_at, is_active
      FROM v2_sessions 
      WHERE is_active = 1
    `;
    const params: any[] = [];
    
    if (userId) {
      query += ` AND user_id = $1`;
      params.push(userId);
    }
    
    query += ` ORDER BY created_at DESC LIMIT 100`;
    
    const result = await pool.query(query, params);
    
    const sessionList = result.rows.map(row => {
      const conversationHistory = row.conversation_history || [];
      const context = row.context || {};
      const events = row.events || [];
      const customerDynamics = row.customer_dynamics || {};
      const epicPhase = row.epic_phase || 'explore';
      const technique = getTechnique(row.technique_id);
      
      // Calculate duration from first to last message if available
      const duration = conversationHistory.length > 0 
        ? `${Math.ceil(conversationHistory.length * 0.5)}:00`
        : "0:00";
      
      // Calculate score (0-100 based on turn count and phase)
      const score = Math.min(100, Math.round(50 + row.turn_number * 5 + (row.phase >= 2 ? 20 : 0)));
      
      // Build debug info per message by matching with events
      const transcript = conversationHistory.map((msg: any, idx: number) => {
        // Find matching event for this message index (seller messages are odd indices in roleplay)
        const turnNumber = Math.floor(idx / 2) + 1;
        const matchingEvent = events.find((e: any) => e.turnNumber === turnNumber);
        
        // Determine signal based on evaluation or default
        let signal: "positief" | "neutraal" | "negatief" = "neutraal";
        if (matchingEvent) {
          if (matchingEvent.moveRating === 'positive' || matchingEvent.correct) signal = "positief";
          else if (matchingEvent.moveRating === 'negative' || matchingEvent.incorrect) signal = "negatief";
        }
        
        // Build debug info
        const debugInfo: any = {
          signal,
          expectedTechnique: technique?.nummer || row.technique_id,
          detectedTechnique: matchingEvent?.moveId || matchingEvent?.techniqueId || null,
          context: {
            fase: row.phase,
            gathered: context.gathered || {}
          },
          customerDynamics: {
            rapport: customerDynamics.rapport || 50,
            valueTension: customerDynamics.valueTension || 50,
            commitReadiness: customerDynamics.commitReadiness || 0
          },
          aiDecision: {
            epicFase: epicPhase,
            evaluatie: matchingEvent?.feedback || matchingEvent?.evaluation || null
          }
        };
        
        return {
          speaker: msg.role === 'assistant' || msg.role === 'customer' ? 'AI Coach' : 'Verkoper',
          time: `${Math.floor(idx * 5 / 60)}:${String(idx * 5 % 60).padStart(2, '0')}`,
          text: msg.content,
          debugInfo
        };
      });
      
      // Extract feedback from events
      const strengths: string[] = [];
      const improvements: string[] = [];
      events.forEach((e: any) => {
        if (e.feedback && e.correct) strengths.push(e.feedback);
        if (e.feedback && !e.correct) improvements.push(e.feedback);
      });
      
      return {
        id: row.id,
        mode: row.current_mode,
        techniqueId: row.technique_id,
        techniqueName: technique?.naam || row.technique_id,
        techniqueNummer: technique?.nummer || row.technique_id.split('.').slice(0, 2).join('.'),
        fase: technique?.fase || parseInt(row.technique_id?.split('.')[0]) || 1,
        messageCount: conversationHistory.length,
        turnNumber: row.turn_number,
        context: context,
        score,
        duration,
        quality: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs-improvement',
        isExpert: row.expert_mode === 1,
        isActive: row.is_active === 1,
        userId: row.user_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        transcript,
        feedback: {
          strengths: strengths.slice(0, 5),
          improvements: improvements.slice(0, 5)
        }
      };
    });
    
    res.json({
      sessions: sessionList,
      total: sessionList.length
    });
  } catch (error: any) {
    console.error("[API] Error fetching sessions:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get sessions for a specific user (user view)
app.get("/api/user/sessions", async (req, res) => {
  try {
    const userId = req.query.userId as string || 'anonymous';
    
    const result = await pool.query(`
      SELECT id, technique_id, current_mode, phase, turn_number, 
             conversation_history, context, total_score, created_at, updated_at
      FROM v2_sessions 
      WHERE user_id = $1 AND is_active = 1
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId]);
    
    const sessionList = result.rows.map(row => {
      const conversationHistory = row.conversation_history || [];
      const context = row.context || {};
      const technique = getTechnique(row.technique_id);
      
      const duration = conversationHistory.length > 0 
        ? `${Math.ceil(conversationHistory.length * 0.5)}:00`
        : "0:00";
      
      const score = Math.min(100, Math.round(50 + row.turn_number * 5 + (row.phase >= 2 ? 20 : 0)));
      
      return {
        id: row.id,
        nummer: technique?.nummer || row.technique_id,
        naam: technique?.naam || row.technique_id,
        fase: technique?.fase || parseInt(row.technique_id?.split('.')[0]) || 1,
        type: 'ai-chat' as const, // TODO: detect from session metadata
        score,
        quality: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs-improvement',
        duration,
        date: new Date(row.created_at).toISOString().split('T')[0],
        time: new Date(row.created_at).toTimeString().split(' ')[0].substring(0, 5),
        transcript: conversationHistory.map((msg: any, idx: number) => ({
          speaker: msg.role === 'assistant' ? 'AI Coach' : 'Verkoper',
          time: `${Math.floor(idx * 5 / 60)}:${String(idx * 5 % 60).padStart(2, '0')}`,
          text: msg.content
        }))
      };
    });
    
    res.json({
      sessions: sessionList,
      total: sessionList.length
    });
  } catch (error: any) {
    console.error("[API] Error fetching user sessions:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// USER CONTEXT ENDPOINTS - DATABASE BACKED
// ===========================================

// Get user context from database
app.get("/api/user/context", async (req, res) => {
  try {
    const userId = req.query.userId as string || "default";
    
    const result = await pool.query(
      `SELECT sector, product, klant_type, setting, additional_context 
       FROM user_context WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.json({ success: true, context: {} });
    }
    
    const row = result.rows[0];
    const context = {
      sector: row.sector,
      product: row.product,
      klantType: row.klant_type,
      setting: row.setting,
      ...(row.additional_context || {})
    };
    
    console.log("[API] Loaded user context for", userId, ":", Object.keys(context).filter(k => context[k as keyof typeof context]).join(", "));
    res.json({ success: true, context });
  } catch (error: any) {
    console.error("[API] Error loading user context:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Save user context to database
app.post("/api/user/context", async (req, res) => {
  try {
    const { userId = "default", context } = req.body;
    
    // Extract known fields and additional context
    const { sector, product, klantType, setting, ...additional } = context;
    
    // Upsert the context
    await pool.query(
      `INSERT INTO user_context (id, user_id, sector, product, klant_type, setting, additional_context, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         sector = COALESCE($3, user_context.sector),
         product = COALESCE($4, user_context.product),
         klant_type = COALESCE($5, user_context.klant_type),
         setting = COALESCE($6, user_context.setting),
         additional_context = COALESCE($7, user_context.additional_context),
         updated_at = NOW()`,
      [nanoid(), userId, sector, product, klantType, setting, Object.keys(additional).length > 0 ? additional : null]
    );
    
    // Fetch updated context
    const result = await pool.query(
      `SELECT sector, product, klant_type, setting, additional_context 
       FROM user_context WHERE user_id = $1`,
      [userId]
    );
    
    const row = result.rows[0] || {};
    const updatedContext = {
      sector: row.sector,
      product: row.product,
      klantType: row.klant_type,
      setting: row.setting,
      ...(row.additional_context || {})
    };
    
    console.log("[API] Saved user context for", userId);
    res.json({ success: true, context: updatedContext });
  } catch (error: any) {
    console.error("[API] Error saving user context:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// SESSION CONTROL ENDPOINTS
// ===========================================

// Start roleplay mode for existing session
app.post("/api/session/:sessionId/start-roleplay", async (req, res) => {
  try {
    const session = sessions.get(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    // Transition to ROLEPLAY mode
    session.mode = "ROLEPLAY";
    
    // Generate roleplay opening
    const roleplayOpening = `Ik speel nu de rol van een klant. Je kunt de techniek "${session.techniqueName}" oefenen. Begin maar wanneer je klaar bent!`;
    
    session.conversationHistory.push({
      role: "assistant",
      content: roleplayOpening
    });
    
    res.json({
      success: true,
      phase: "ROLEPLAY",
      message: roleplayOpening
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Request feedback/debrief
app.post("/api/session/:sessionId/feedback", async (req, res) => {
  try {
    const session = sessions.get(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    const turnCount = session.conversationHistory.filter(m => m.role === "user").length;
    
    const feedbackMessage = `
**Tussentijdse Feedback**

Je hebt ${turnCount} berichten gestuurd in deze sessie over "${session.techniqueName}".

**Sterke punten:**
- Je bent actief bezig met de techniek
- Je stelt vragen en zoekt naar verdieping

**Aandachtspunten:**
- Probeer de techniek concreet toe te passen
- Gebruik voorbeelden uit je eigen praktijk

Wil je doorgaan met oefenen of heb je een specifieke vraag?
`;
    
    session.conversationHistory.push({
      role: "assistant",
      content: feedbackMessage
    });
    
    res.json({
      success: true,
      phase: session.mode,
      feedback: feedbackMessage,
      stats: {
        turnCount,
        technique: session.techniqueName,
        contextComplete: session.contextState.isComplete
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get evaluation/score
app.post("/api/session/:sessionId/evaluate", async (req, res) => {
  try {
    const session = sessions.get(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    const turnCount = session.conversationHistory.filter(m => m.role === "user").length;
    const contextFields = Object.keys(session.contextState.gathered).filter(
      k => session.contextState.gathered[k]
    ).length;
    
    // Simple scoring based on engagement
    const engagementScore = Math.min(100, turnCount * 15 + contextFields * 10);
    const technicalScore = Math.min(100, 60 + Math.random() * 30);
    const overallScore = Math.round((engagementScore + technicalScore) / 2);
    
    const evaluation = {
      overallScore,
      scores: {
        engagement: Math.round(engagementScore),
        technical: Math.round(technicalScore),
        contextGathering: session.contextState.isComplete ? 100 : contextFields * 20
      },
      technique: session.techniqueName,
      recommendation: overallScore >= 70 
        ? "Goed gedaan! Je beheerst deze techniek redelijk goed."
        : "Blijf oefenen. Focus op het toepassen van de kernprincipes.",
      nextSteps: [
        "Oefen deze techniek in een echte verkoopsituatie",
        "Probeer de volgende techniek in de E.P.I.C. flow"
      ]
    };
    
    res.json({
      success: true,
      evaluation
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reset session context (go back to CONTEXT_GATHERING)
app.post("/api/session/:sessionId/reset-context", async (req, res) => {
  try {
    const session = sessions.get(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    // Reset context state
    session.contextState = createContextState(
      session.userId || "anonymous",
      session.id,
      session.techniqueId
    );
    session.mode = "CONTEXT_GATHERING";
    session.conversationHistory = [];
    
    // Generate new opening question
    const nextSlot = getNextSlotKey(session.contextState);
    let openingMessage = "Laten we opnieuw beginnen. ";
    
    if (nextSlot) {
      const questionResult = await generateQuestionForSlot(
        nextSlot,
        session.contextState.gathered,
        session.techniqueId,
        []
      );
      openingMessage += questionResult.message;
      session.contextState.currentQuestionKey = nextSlot;
    }
    
    session.conversationHistory.push({
      role: "assistant",
      content: openingMessage
    });
    
    res.json({
      success: true,
      phase: "CONTEXT_GATHERING",
      message: openingMessage
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get session turns/history
app.get("/api/session/:sessionId/turns", async (req, res) => {
  try {
    const session = sessions.get(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    const turns = session.conversationHistory.map((msg, idx) => ({
      id: idx,
      role: msg.role,
      content: msg.content,
      timestamp: session.createdAt
    }));
    
    res.json({
      success: true,
      turns,
      total: turns.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// STREAMING ENDPOINT
// ===========================================

// Streaming message endpoint using Server-Sent Events
app.post("/api/session/:sessionId/message/stream", async (req, res) => {
  try {
    const { content, isExpert = false } = req.body;
    const session = sessions.get(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }
    
    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    
    // Add user message to history
    session.conversationHistory.push({
      role: "user",
      content
    });
    
    // Generate response (non-streaming for now, but chunked for SSE)
    const coachContext: CoachContext = {
      userId: session.userId,
      techniqueId: session.techniqueId,
      techniqueName: session.techniqueName,
      userName: session.userName,
      sector: session.contextState.gathered.sector,
      product: session.contextState.gathered.product,
      klantType: session.contextState.gathered.klant_type,
      sessionContext: session.contextState.gathered
    };
    
    const coachResult = await generateCoachResponse(
      content,
      session.conversationHistory,
      coachContext
    );
    
    const responseText = coachResult.message;
    
    // Add to history
    session.conversationHistory.push({
      role: "assistant",
      content: responseText
    });
    
    // Stream response in chunks (simulate streaming)
    const words = responseText.split(" ");
    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i < words.length - 1 ? " " : "");
      res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
      
      // Small delay to simulate streaming
      await new Promise(r => setTimeout(r, 30));
    }
    
    // Send final event with debug info
    res.write(`data: ${JSON.stringify({ 
      done: true,
      phase: session.mode,
      debug: isExpert ? {
        ragDocsFound: coachResult.debug?.documentsFound || 0,
        wasRepaired: coachResult.debug?.wasRepaired || false
      } : undefined
    })}\n\n`);
    
    res.end();
    
  } catch (error: any) {
    console.error("[API] Streaming error:", error.message);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// ===========================================
// HEYGEN STREAMING AVATAR TOKEN
// ===========================================
app.post("/api/heygen/token", async (req, res) => {
  try {
    // Use the dedicated streaming avatar API key for proper avatar access
    const streamingApiKey = process.env.API_Heygen_streaming_interactive_avatar_ID;
    const streamingAvatarId = process.env.Heygen_streaming_interactive_avatar_ID;
    
    // Fallback to generic HEYGEN_API_KEY if streaming key not available
    const apiKey = streamingApiKey || process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "HEYGEN_API_KEY not configured" });
    }

    const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: {
        "x-api-key": apiKey
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[API] HeyGen token error:", errorData);
      return res.status(response.status).json({ error: "Failed to create HeyGen token" });
    }

    const data = await response.json();
    const token = data.data?.token || data.token;
    
    console.log("[API] HeyGen token created successfully, avatarId:", streamingAvatarId || "using default");
    
    // Return both token and avatarId for the frontend
    res.json({ 
      token, 
      avatarId: streamingAvatarId || null 
    });
  } catch (error: any) {
    console.error("[API] HeyGen token error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// LIVEKIT TOKEN ENDPOINT (for voice sessions)
// ===========================================
app.post("/api/livekit/token", async (req, res) => {
  try {
    const { techniqueId } = req.body;
    
    const livekitUrl = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    
    if (!livekitUrl || !apiKey || !apiSecret) {
      return res.status(500).json({ 
        error: "LiveKit not configured",
        message: "Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET"
      });
    }
    
    const roomName = `hugo-${techniqueId || 'general'}-${Date.now()}`;
    const identity = `user-${Date.now()}`;
    
    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      name: 'Trainee'
    });
    
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true
    });
    
    const jwt = await token.toJwt();
    
    console.log(`[API] LiveKit token created for room: ${roomName}`);
    res.json({
      token: jwt,
      url: livekitUrl,
      roomName,
      identity
    });
  } catch (error: any) {
    console.error("[API] LiveKit token error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// ROLEPLAY ENGINE ENDPOINTS (V2 Full)
// ===========================================

// Roleplay session with metadata wrapper
interface RoleplaySessionEntry {
  state: V2SessionState;
  createdAt: Date;
  isActive: boolean;
}

// Roleplay session storage (separate from coach sessions)
const roleplaySessions = new Map<string, RoleplaySessionEntry>();

// Clean up old roleplay sessions
setInterval(() => {
  const now = Date.now();
  const twoHours = 2 * 60 * 60 * 1000;
  for (const [id, entry] of roleplaySessions.entries()) {
    if (!entry.isActive || (now - entry.createdAt.getTime() > twoHours)) {
      roleplaySessions.delete(id);
      console.log(`[API] Cleaned up roleplay session: ${id}`);
    }
  }
}, 30 * 60 * 1000);

// Start a new roleplay session
app.post("/api/v2/roleplay/start", async (req, res) => {
  try {
    const { techniqueId, userId = "demo-user", existingContext } = req.body;
    
    if (!techniqueId) {
      return res.status(400).json({ error: "techniqueId is required" });
    }
    
    // Get technique info
    const technique = getTechnique(techniqueId);
    if (!technique) {
      return res.status(404).json({ error: `Technique ${techniqueId} not found` });
    }
    
    // Generate session ID
    const sessionId = `rp-${Date.now()}-${nanoid(6)}`;
    
    // Initialize roleplay session
    const sessionState = initRoleplaySession(userId, sessionId, techniqueId, existingContext);
    
    // Store session with metadata
    const entry: RoleplaySessionEntry = {
      state: sessionState,
      createdAt: new Date(),
      isActive: true
    };
    roleplaySessions.set(sessionId, entry);
    
    // Get opening message (context question or roleplay intro)
    const openingResponse = await getOpeningMessage(sessionState, userId);
    
    // Update stored session with any state changes
    entry.state = openingResponse.sessionState;
    roleplaySessions.set(sessionId, entry);
    
    console.log(`[API] Created roleplay session ${sessionId} for technique ${techniqueId}`);
    console.log(`[API] Mode: ${openingResponse.sessionState.currentMode}, Type: ${openingResponse.type}`);
    
    res.json({
      sessionId,
      phase: openingResponse.sessionState.currentMode,
      message: openingResponse.message,
      type: openingResponse.type,
      debug: openingResponse.debug
    });
    
  } catch (error: any) {
    console.error("[API] Error starting roleplay:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Send message in roleplay session
app.post("/api/v2/roleplay/message", async (req, res) => {
  try {
    const { sessionId, content, isExpert = false } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }
    
    const entry = roleplaySessions.get(sessionId);
    if (!entry) {
      return res.status(404).json({ error: "Roleplay session not found. Please start a new session." });
    }
    
    // Set expert mode if requested
    if (isExpert) {
      entry.state.expertMode = true;
    }
    
    // Process input through roleplay engine
    const response = await processInput(entry.state, content);
    
    // Update stored session
    entry.state = response.sessionState;
    roleplaySessions.set(sessionId, entry);
    
    console.log(`[API] Roleplay message processed - Mode: ${response.sessionState.currentMode}, Turn: ${response.sessionState.turnNumber}`);
    
    res.json({
      message: response.message,
      type: response.type,
      phase: response.sessionState.currentMode,
      signal: response.signal,
      evaluation: response.evaluation,
      epicPhase: response.sessionState.epicPhase,
      epicMilestones: response.sessionState.epicMilestones,
      turnNumber: response.sessionState.turnNumber,
      debug: isExpert ? response.debug : undefined
    });
    
  } catch (error: any) {
    console.error("[API] Error processing roleplay message:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// End roleplay session with debrief
app.post("/api/v2/roleplay/end", async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }
    
    const entry = roleplaySessions.get(sessionId);
    if (!entry) {
      return res.status(404).json({ error: "Roleplay session not found" });
    }
    
    // End roleplay and get debrief
    const debriefResponse = await endRoleplay(entry.state);
    
    // Get session summary
    const summary = getSessionSummary(entry.state);
    
    // Mark session as ended
    entry.isActive = false;
    roleplaySessions.set(sessionId, entry);
    
    console.log(`[API] Roleplay session ${sessionId} ended - Score: ${summary.score}`);
    
    res.json({
      message: debriefResponse.message,
      type: "debrief",
      summary: {
        score: summary.score,
        turns: summary.turns
      }
    });
    
  } catch (error: any) {
    console.error("[API] Error ending roleplay:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Get roleplay session status
app.get("/api/v2/roleplay/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  
  const entry = roleplaySessions.get(sessionId);
  if (!entry) {
    return res.status(404).json({ error: "Session not found" });
  }
  
  const summary = getSessionSummary(entry.state);
  
  res.json({
    sessionId,
    phase: entry.state.currentMode,
    isActive: entry.isActive,
    techniqueId: entry.state.techniqueId,
    epicPhase: entry.state.epicPhase,
    epicMilestones: entry.state.epicMilestones,
    turnNumber: entry.state.turnNumber,
    summary
  });
});

// ============================================
// GOLDEN STANDARD ENDPOINTS
// ============================================

// POST /api/v2/session/save-reference - Save seller message as reference answer
app.post("/api/v2/session/save-reference", async (req, res) => {
  try {
    const { 
      sessionId, 
      techniqueId, 
      message, 
      context, 
      matchStatus, 
      signal, 
      detectedTechnique 
    } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }
    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }
    
    // Save as reference answer
    const referenceAnswer = saveReferenceAnswer({
      techniqueId: techniqueId || "unknown",
      customerSignal: signal || "neutraal",
      customerMessage: context?.customerMessage || "",
      sellerResponse: message,
      context: {
        sector: context?.sector,
        product: context?.product,
        klantType: context?.klantType
      },
      recordedBy: context?.recordedBy || "admin",
      detectedTechnique: detectedTechnique,
      isCorrection: matchStatus === "incorrect" || (detectedTechnique && detectedTechnique !== techniqueId),
      correctionNote: matchStatus === "incorrect" ? `Expert disagreed: detected ${detectedTechnique}, should be ${techniqueId}` : undefined
    });
    
    console.log(`[save-reference] Saved reference for session ${sessionId}, technique ${techniqueId}`);
    
    res.json({ 
      success: true, 
      referenceId: referenceAnswer.id,
      isCorrection: referenceAnswer.isCorrection
    });
    
  } catch (error: any) {
    console.error("[save-reference] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v2/session/flag-customer-response - Flag a customer response as incorrect
app.post("/api/v2/session/flag-customer-response", async (req, res) => {
  try {
    const { 
      sessionId, 
      messageId, 
      feedback, 
      expectedBehavior, 
      context 
    } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }
    if (!feedback) {
      return res.status(400).json({ error: "feedback is required" });
    }
    
    // Log the flag for config consistency analysis
    console.log(`[flag-response] Session ${sessionId}, Message ${messageId}: ${feedback}`);
    
    // Could integrate with config-consistency.ts here if needed
    
    res.json({ 
      success: true,
      message: "Feedback recorded for analysis"
    });
    
  } catch (error: any) {
    console.error("[flag-response] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v2/golden-standard/examples/:techniqueId - Get examples for few-shot learning
app.get("/api/v2/golden-standard/examples/:techniqueId", (req, res) => {
  try {
    const { techniqueId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;
    
    const examples = getExamplesForTechnique(techniqueId, limit);
    
    res.json({ 
      techniqueId,
      count: examples.length,
      examples
    });
    
  } catch (error: any) {
    console.error("[golden-standard/examples] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v2/golden-standard/report - Get misclassification report
app.get("/api/v2/golden-standard/report", (req, res) => {
  try {
    const report = generateMisclassificationReport();
    res.json(report);
  } catch (error: any) {
    console.error("[golden-standard/report] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v2/golden-standard/all - Get all reference answers grouped
app.get("/api/v2/golden-standard/all", (req, res) => {
  try {
    const grouped = getAllReferenceAnswersGrouped();
    const allAnswers = getReferenceAnswers();
    
    res.json({
      total: allAnswers.length,
      grouped
    });
  } catch (error: any) {
    console.error("[golden-standard/all] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// V3 ARTIFACT ENDPOINTS
// ============================================================================

// POST /api/v2/artifacts - Save an artifact
app.post("/api/v2/artifacts", async (req, res) => {
  try {
    const { sessionId, userId, artifactType, techniqueId, content, epicPhase } = req.body;
    
    if (!sessionId || !userId || !artifactType || !techniqueId || !content) {
      return res.status(400).json({ 
        error: "Missing required fields: sessionId, userId, artifactType, techniqueId, content" 
      });
    }
    
    const artifact = await saveArtifact(
      sessionId,
      userId,
      artifactType as ArtifactType,
      techniqueId,
      content as ArtifactContent,
      epicPhase
    );
    
    res.json({ success: true, artifact });
    
  } catch (error: any) {
    console.error("[artifacts] Save error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v2/artifacts/:sessionId/check - Check if required artifacts exist
// NOTE: Specific routes must come BEFORE generic :artifactType route
app.get("/api/v2/artifacts/:sessionId/check", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const required = (req.query.required as string)?.split(',') as ArtifactType[] || [];
    
    if (required.length === 0) {
      return res.status(400).json({ error: "required query param is needed (comma-separated artifact types)" });
    }
    
    const result = await hasRequiredArtifacts(sessionId, required);
    
    res.json({
      sessionId,
      required,
      ...result
    });
    
  } catch (error: any) {
    console.error("[artifacts] Check error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v2/artifacts/:sessionId/map - Get artifacts as a map for gate checking
app.get("/api/v2/artifacts/:sessionId/map", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const map = await getArtifactsMap(sessionId);
    
    res.json({
      sessionId,
      artifacts: map
    });
    
  } catch (error: any) {
    console.error("[artifacts] Map error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v2/artifacts/:sessionId - Get all artifacts for a session
app.get("/api/v2/artifacts/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const artifacts = await getSessionArtifacts(sessionId);
    
    res.json({ 
      sessionId, 
      count: artifacts.length, 
      artifacts 
    });
    
  } catch (error: any) {
    console.error("[artifacts] Get error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v2/artifacts/:sessionId/:artifactType - Get specific artifact
// NOTE: This generic route must come AFTER specific routes like /check and /map
app.get("/api/v2/artifacts/:sessionId/:artifactType", async (req, res) => {
  try {
    const { sessionId, artifactType } = req.params;
    const artifact = await getArtifact(sessionId, artifactType as ArtifactType);
    
    if (!artifact) {
      return res.status(404).json({ 
        error: `Artifact '${artifactType}' not found for session ${sessionId}` 
      });
    }
    
    res.json(artifact);
    
  } catch (error: any) {
    console.error("[artifacts] Get specific error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// V3.2-V3.5: BRIEF GENERATION ENDPOINTS
// ===========================================

// POST /api/v2/briefs/discovery - Generate discovery brief from conversation
app.post("/api/v2/briefs/discovery", async (req, res) => {
  try {
    const { sessionId, userId, techniqueId, conversationHistory } = req.body;
    
    if (!sessionId || !userId || !conversationHistory) {
      return res.status(400).json({ error: "sessionId, userId, and conversationHistory are required" });
    }
    
    console.log(`[briefs] Generating discovery brief for session ${sessionId}`);
    const brief = await generateDiscoveryBrief(
      sessionId,
      userId,
      techniqueId || "2",
      conversationHistory
    );
    
    res.json({ success: true, brief });
    
  } catch (error: any) {
    console.error("[briefs] Discovery brief error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v2/briefs/offer - Generate offer brief from conversation
app.post("/api/v2/briefs/offer", async (req, res) => {
  try {
    const { sessionId, userId, techniqueId, conversationHistory, discoveryBrief } = req.body;
    
    if (!sessionId || !userId || !conversationHistory) {
      return res.status(400).json({ error: "sessionId, userId, and conversationHistory are required" });
    }
    
    console.log(`[briefs] Generating offer brief for session ${sessionId}`);
    const brief = await generateOfferBrief(
      sessionId,
      userId,
      techniqueId || "3",
      conversationHistory,
      discoveryBrief
    );
    
    res.json({ success: true, brief });
    
  } catch (error: any) {
    console.error("[briefs] Offer brief error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v2/context/build - Build extended context layers
app.post("/api/v2/context/build", async (req, res) => {
  try {
    const { baseContext, contextDepth, requiredLayers: explicitLayers } = req.body;
    
    if (!baseContext) {
      return res.status(400).json({ error: "baseContext is required" });
    }
    
    // Allow explicit layers OR depth-based layers
    const depth = (contextDepth || 'STANDARD') as ContextDepth;
    const requiredLayers = explicitLayers || getRequiredLayers(depth);
    
    console.log(`[context] Building extended context with layers:`, requiredLayers);
    const layers = await buildExtendedContext(baseContext, requiredLayers);
    const formatted = formatExtendedContextForPrompt(layers);
    
    res.json({ 
      success: true, 
      layers,
      formatted,
      depth,
      requiredLayers
    });
    
  } catch (error: any) {
    console.error("[context] Build error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v2/roleplay/unlock-check - Check if roleplay is unlocked for a technique
app.post("/api/v2/roleplay/unlock-check", async (req, res) => {
  try {
    const { techniqueId, userAttempts } = req.body;
    
    if (!techniqueId) {
      return res.status(400).json({ error: "techniqueId is required" });
    }
    
    const overlayPath = path.join(process.cwd(), 'config/ssot/coach_overlay_v3_1.json');
    let overlayConfig: any = {};
    try {
      overlayConfig = JSON.parse(fs.readFileSync(overlayPath, 'utf-8'));
    } catch (e) {
      console.warn('[roleplay] Could not load coach_overlay_v3_1.json, falling back to v3');
      const fallbackPath = path.join(process.cwd(), 'config/ssot/coach_overlay_v3.json');
      overlayConfig = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
    }
    
    const result = checkRoleplayUnlock(techniqueId, userAttempts || {}, overlayConfig);
    const sequenceRank = getSequenceRank(techniqueId, overlayConfig);
    
    res.json({ 
      ...result, 
      sequenceRank,
      techniqueId 
    });
    
  } catch (error: any) {
    console.error("[roleplay] Unlock check error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v2/context/flow-rules - Get context flow rules
app.get("/api/v2/context/flow-rules", async (req, res) => {
  try {
    res.json({ 
      success: true, 
      flowRules: FLOW_RULES,
      layerSlots: LAYER_SLOTS
    });
  } catch (error: any) {
    console.error("[context] Flow rules error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v2/context/snapshot - Save scenario snapshot as artifact
app.post("/api/v2/context/snapshot", async (req, res) => {
  try {
    const { sessionId, userId, techniqueId, contextLayers } = req.body;
    
    if (!sessionId || !userId || !contextLayers) {
      return res.status(400).json({ error: "sessionId, userId, and contextLayers are required" });
    }
    
    console.log(`[context] Saving scenario snapshot for session ${sessionId}`);
    await generateScenarioSnapshot(sessionId, userId, techniqueId || "1", contextLayers);
    
    res.json({ success: true, message: "Scenario snapshot saved" });
    
  } catch (error: any) {
    console.error("[context] Snapshot error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v2/rag/index - Index the RAG corpus (admin only)
app.post("/api/v2/rag/index", async (req, res) => {
  try {
    console.log("[RAG] Starting corpus indexing...");
    const result = await indexCorpus();
    console.log("[RAG] Indexing complete:", result);
    res.json(result);
  } catch (error: any) {
    console.error("[RAG] Index error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v2/rag/status - Get RAG corpus status
app.get("/api/v2/rag/status", async (req, res) => {
  try {
    const count = await getDocumentCount();
    res.json({ 
      documentCount: count,
      status: count > 0 ? "indexed" : "empty"
    });
  } catch (error: any) {
    console.error("[RAG] Status error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// =====================
// RAG TECHNIEK TAGGING ENDPOINTS
// =====================
import { 
  bulkTagFromVideoMapping, 
  getTaggingStats, 
  getUntaggedChunks,
  tagChunksForVideo 
} from "./v2/rag-techniek-tagger";

// POST /api/v2/rag/tag-bulk - Bulk tag all chunks from video mapping
app.post("/api/v2/rag/tag-bulk", async (req, res) => {
  try {
    console.log("[RAG-TAGGER] Starting bulk tagging from video_mapping.json");
    const result = await bulkTagFromVideoMapping();
    res.json(result);
  } catch (error: any) {
    console.error("[RAG-TAGGER] Bulk tag error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v2/rag/tag-stats - Get tagging statistics
app.get("/api/v2/rag/tag-stats", async (req, res) => {
  try {
    const stats = await getTaggingStats();
    res.json(stats);
  } catch (error: any) {
    console.error("[RAG-TAGGER] Stats error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v2/rag/untagged - Get untagged chunks for review
app.get("/api/v2/rag/untagged", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const chunks = await getUntaggedChunks(limit);
    res.json({ chunks, count: chunks.length });
  } catch (error: any) {
    console.error("[RAG-TAGGER] Untagged error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v2/rag/tag-video - Tag all chunks for a specific video
app.post("/api/v2/rag/tag-video", async (req, res) => {
  try {
    const { sourceId, technikId } = req.body;
    if (!sourceId || !technikId) {
      return res.status(400).json({ error: "sourceId and technikId required" });
    }
    const updated = await tagChunksForVideo(sourceId, technikId);
    res.json({ success: true, updated });
  } catch (error: any) {
    console.error("[RAG-TAGGER] Tag video error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// =====================
// RAG HEURISTIC TAGGING ENDPOINTS (P1)
// =====================
import { 
  bulkSuggestTechniques,
  getChunksForReview,
  approveChunk,
  rejectChunk,
  bulkApproveByTechnique,
  getReviewStats,
  resetHeuristicSuggestions
} from "./v2/rag-heuristic-tagger";

// POST /api/v2/rag/suggest-bulk - Run heuristic tagging on untagged chunks
app.post("/api/v2/rag/suggest-bulk", async (req, res) => {
  try {
    console.log("[HEURISTIC] Starting bulk suggestion");
    const result = await bulkSuggestTechniques();
    res.json(result);
  } catch (error: any) {
    console.error("[HEURISTIC] Suggest error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v2/rag/review - Get chunks needing review
app.get("/api/v2/rag/review", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const chunks = await getChunksForReview(limit);
    res.json({ chunks, count: chunks.length });
  } catch (error: any) {
    console.error("[HEURISTIC] Review list error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v2/rag/review-stats - Get review statistics
app.get("/api/v2/rag/review-stats", async (req, res) => {
  try {
    const stats = await getReviewStats();
    res.json(stats);
  } catch (error: any) {
    console.error("[HEURISTIC] Stats error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v2/rag/approve/:id - Approve a chunk's suggested technique
app.post("/api/v2/rag/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const success = await approveChunk(id);
    res.json({ success });
  } catch (error: any) {
    console.error("[HEURISTIC] Approve error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v2/rag/reject/:id - Reject a suggestion with optional correction
app.post("/api/v2/rag/reject/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { newTechniqueId } = req.body;
    const success = await rejectChunk(id, newTechniqueId);
    res.json({ success });
  } catch (error: any) {
    console.error("[HEURISTIC] Reject error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v2/rag/approve-bulk - Bulk approve all suggestions for a technique
app.post("/api/v2/rag/approve-bulk", async (req, res) => {
  try {
    const { techniqueId } = req.body;
    if (!techniqueId) {
      return res.status(400).json({ error: "techniqueId required" });
    }
    const count = await bulkApproveByTechnique(techniqueId);
    res.json({ success: true, approved: count });
  } catch (error: any) {
    console.error("[HEURISTIC] Bulk approve error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v2/rag/reset-suggestions - Reset all heuristic suggestions
app.post("/api/v2/rag/reset-suggestions", async (req, res) => {
  try {
    const result = await resetHeuristicSuggestions();
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[HEURISTIC] Reset error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// =====================
// PERFORMANCE TRACKER ENDPOINTS
// =====================
import { performanceTracker } from "./v2/performance-tracker";

// GET /api/v2/user/level - Get current competence level
app.get("/api/v2/user/level", async (req, res) => {
  try {
    const userId = (req.query.userId as string) || "demo-user";
    const level = await performanceTracker.getCurrentLevel(userId);
    const levelName = performanceTracker.getLevelName(level);
    const assistanceConfig = performanceTracker.getAssistanceConfig(level);
    
    res.json({
      userId,
      level,
      levelName,
      assistance: assistanceConfig
    });
  } catch (error: any) {
    console.error("[Performance] Get level error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v2/user/performance - Record performance and check for level transition
app.post("/api/v2/user/performance", async (req, res) => {
  try {
    const { userId = "demo-user", techniqueId, techniqueName, score, struggleSignals } = req.body;
    
    if (!techniqueId || score === undefined) {
      return res.status(400).json({ error: "techniqueId and score are required" });
    }
    
    const outcome = score >= 70 ? "success" : score >= 50 ? "partial" : "struggle";
    
    const transition = await performanceTracker.recordPerformance(userId, {
      techniqueId,
      techniqueName: techniqueName || techniqueId,
      score,
      outcome,
      struggleSignals
    });
    
    // Get updated level info
    const newLevel = await performanceTracker.getCurrentLevel(userId);
    const assistanceConfig = performanceTracker.getAssistanceConfig(newLevel);
    
    res.json({
      recorded: true,
      currentLevel: newLevel,
      levelName: performanceTracker.getLevelName(newLevel),
      assistance: assistanceConfig,
      transition: transition ? {
        ...transition,
        congratulationMessage: transition.shouldCongratulate 
          ? performanceTracker.getCongratulationMessage(transition)
          : null
      } : null
    });
  } catch (error: any) {
    console.error("[Performance] Record error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v2/user/mastery - Get technique mastery summary
app.get("/api/v2/user/mastery", async (req, res) => {
  try {
    const userId = (req.query.userId as string) || "demo-user";
    const mastery = await performanceTracker.getTechniqueMasterySummary(userId);
    const level = await performanceTracker.getCurrentLevel(userId);
    
    res.json({
      userId,
      currentLevel: level,
      levelName: performanceTracker.getLevelName(level),
      techniques: mastery
    });
  } catch (error: any) {
    console.error("[Performance] Get mastery error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check - now shows FULL engine
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    activeSessions: sessions.size,
    engine: "V2-FULL",
    features: [
      "nested-prompts",
      "rag-grounding",
      "validation-loop",
      "hugo-persona-ssot",
      "detector-patterns",
      "livekit-audio",
      "heygen-video"
    ]
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[API] Error:", err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// Start server on port 3001 (backend API)
const PORT = parseInt(process.env.API_PORT || "3001", 10);

const server = createServer(app);

// Setup ElevenLabs Scribe WebSocket for STT
setupScribeWebSocket(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[API] Hugo Engine V2 FULL API running on port ${PORT}`);
  console.log(`[API] Features: nested-prompts, rag-grounding, validation-loop, livekit-audio`);
});

export { app, server };
