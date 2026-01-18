/**
 * API Server for Hugo Engine V2 - FULL ENGINE
 * Uses complete engine with nested prompts, RAG, and validation loop
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
      "detector-patterns"
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

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[API] Hugo Engine V2 FULL API running on port ${PORT}`);
  console.log(`[API] Features: nested-prompts, rag-grounding, validation-loop`);
});

export { app, server };
