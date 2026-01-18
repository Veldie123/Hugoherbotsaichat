/**
 * API Server for Hugo Engine V2
 * Uses simplified engine versions with real OpenAI calls
 */

import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { processCoachMessage, buildOpeningMessage } from "./v2/coach-engine-simple";
import { processContextGathering, isContextComplete, type ContextData } from "./v2/context-engine-simple";

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
  conversationHistory: Array<{ role: string; content: string }>;
  contextData: ContextData;
  isExpert: boolean;
  createdAt: Date;
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
// V2 SESSION ENDPOINTS - Real Engine Integration
// ===========================================

// Start a new session
app.post("/api/v2/sessions", async (req, res) => {
  try {
    const { techniqueId, mode = "COACH_CHAT", isExpert = false } = req.body;
    
    if (!techniqueId) {
      return res.status(400).json({ error: "techniqueId is required" });
    }
    
    const sessionId = `session-${nanoid(12)}`;
    
    // Create session - always start with context gathering
    const session: Session = {
      id: sessionId,
      mode: "CONTEXT_GATHERING",
      techniqueId,
      conversationHistory: [],
      contextData: {},
      isExpert,
      createdAt: new Date()
    };
    
    sessions.set(sessionId, session);
    
    // Generate opening message
    const initialMessage = await buildOpeningMessage(techniqueId);
    
    // Add to conversation history
    session.conversationHistory.push({
      role: "assistant",
      content: initialMessage
    });
    
    console.log(`[API] Created session ${sessionId} for technique ${techniqueId}`);
    
    res.json({
      sessionId,
      phase: session.mode,
      initialMessage
    });
    
  } catch (error: any) {
    console.error("[API] Error creating session:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Send a message
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
    
    // Route to the correct engine based on mode
    switch (session.mode) {
      case "CONTEXT_GATHERING":
        const contextResult = await processContextGathering(
          session.conversationHistory,
          session.contextData
        );
        
        response = contextResult.response;
        session.contextData = contextResult.updatedContext;
        
        // Check if context is complete - transition to coaching
        if (contextResult.isComplete) {
          session.mode = "COACH_CHAT";
          console.log(`[API] Session ${sessionId} transitioning to COACH_CHAT`);
        }
        
        debug = {
          phase: "CONTEXT_GATHERING",
          contextComplete: contextResult.isComplete,
          gatheredFields: Object.keys(session.contextData).filter(k => session.contextData[k])
        };
        break;
        
      case "COACH_CHAT":
        const coachResult = await processCoachMessage({
          sessionId,
          techniqueId: session.techniqueId,
          userMessage: content,
          conversationHistory: session.conversationHistory,
          contextData: session.contextData,
          isExpert: session.isExpert || isExpert
        });
        
        response = coachResult.response;
        debug = {
          phase: "COACH_CHAT",
          signal: coachResult.signal,
          detectedTechniques: coachResult.detectedTechniques,
          evaluation: coachResult.evaluation
        };
        break;
        
      case "ROLEPLAY":
        // Roleplay uses coach engine for now (simplified version)
        const roleplayResult = await processCoachMessage({
          sessionId,
          techniqueId: session.techniqueId,
          userMessage: content,
          conversationHistory: session.conversationHistory,
          contextData: session.contextData,
          isExpert: session.isExpert || isExpert
        });
        
        response = roleplayResult.response;
        debug = {
          phase: "ROLEPLAY",
          signal: roleplayResult.signal
        };
        break;
        
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
      contextData: session.contextData
    };
    
    if (isExpert || session.isExpert) {
      result.debug = debug;
    }
    
    res.json(result);
    
  } catch (error: any) {
    console.error("[API] Error processing message:", error.message);
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
      contextData: session.contextData,
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

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    activeSessions: sessions.size,
    engine: "V2-simplified"
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
  console.log(`[API] Hugo Engine V2 API running on port ${PORT}`);
  console.log(`[API] Using simplified engine with OpenAI integration`);
});

export { app, server };
