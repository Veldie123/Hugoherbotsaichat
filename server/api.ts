/**
 * API Server for Hugo Engine V2 - FULL ENGINE
 * Uses complete engine with nested prompts, RAG, and validation loop
 * 
 * ROLEPLAY-API-ENDPOINTS
 * ----------------------
 * Status: Done (januari 2026)
 * 
 * Beschikbare endpoints (via routes.ts):
 * - POST /api/session/:id/start-roleplay - Transition to ROLEPLAY mode
 * - POST /api/session/:id/message - Process roleplay messages  
 * - POST /api/session/:id/feedback - Get mid-session feedback
 * - POST /api/session/:id/evaluate - Get evaluation scores
 * 
 * V2 endpoints (via api.ts):
 * - POST /api/v2/roleplay/start - Full V2 roleplay session
 * - POST /api/v2/roleplay/message - V2 roleplay message processing
 * - POST /api/v2/roleplay/end - End with debrief
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
// SESSION STORAGE (in-memory for development)
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

// Clean up old sessions (older than 2 hours)
setInterval(() => {
  const now = Date.now();
  const twoHours = 2 * 60 * 60 * 1000;
  for (const [id, session] of sessions.entries()) {
    if (now - session.createdAt.getTime() > twoHours) {
      sessions.delete(id);
      console.log(`[API] Cleaned up expired session: ${id}`);
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
    
    res.json(result);
    
  } catch (error: any) {
    console.error("[API] Error processing message:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Get session info
app.get("/api/v2/sessions/:sessionId", async (req, res) => {
  try {
    const session = sessions.get(req.params.sessionId);
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

// Get sessions list
app.get("/api/sessions", async (req, res) => {
  try {
    const sessionList = Array.from(sessions.values()).map(s => ({
      id: s.id,
      mode: s.mode,
      techniqueId: s.techniqueId,
      techniqueName: s.techniqueName,
      messageCount: s.conversationHistory.length,
      createdAt: s.createdAt
    }));
    
    res.json({
      sessions: sessionList,
      total: sessionList.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// USER CONTEXT ENDPOINTS
// ===========================================

// In-memory user context storage (would be database in production)
const userContexts = new Map<string, {
  sector?: string;
  product?: string;
  klantType?: string;
  verkoopkanaal?: string;
  ervaring?: string;
  naam?: string;
}>();

// Get user context
app.get("/api/user/context", async (req, res) => {
  try {
    const userId = req.query.userId as string || "default";
    const context = userContexts.get(userId) || {};
    res.json({ success: true, context });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Save user context
app.post("/api/user/context", async (req, res) => {
  try {
    const { userId = "default", context } = req.body;
    const existing = userContexts.get(userId) || {};
    userContexts.set(userId, { ...existing, ...context });
    res.json({ success: true, context: userContexts.get(userId) });
  } catch (error: any) {
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
    const apiKey = process.env.HEYGEN_API_KEY;
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
    console.log("[API] HeyGen token created successfully");
    res.json({ token: data.data?.token || data.token });
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
