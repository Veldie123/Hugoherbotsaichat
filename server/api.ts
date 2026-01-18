/**
 * Simplified API Server for Hugo Engine V2
 * This provides the essential API endpoints for the chat engine
 */

import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";

const app = express();

app.use(express.json());

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
// TECHNIEKEN ENDPOINT (for sidebar)
// ===========================================
app.get("/api/technieken", async (req, res) => {
  try {
    const indexPath = path.join(process.cwd(), "config/ssot/technieken_index.json");
    const indexData = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    
    const techniques: any[] = [];
    for (const [faseId, fase] of Object.entries(indexData.fases || {})) {
      const faseData = fase as any;
      for (const [techId, tech] of Object.entries(faseData.technieken || {})) {
        techniques.push({
          nummer: techId,
          naam: (tech as any).naam,
          fase: faseId,
          ...(tech as any)
        });
      }
    }
    res.json(techniques);
  } catch (error: any) {
    console.error("[API] Error loading technieken:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// V2 SESSION ENDPOINTS (placeholder - implement with V2 engine)
// ===========================================

// Start a new session
app.post("/api/v2/sessions", async (req, res) => {
  try {
    const { techniqueId, mode = "COACH_CHAT", isExpert = false, modality = "chat" } = req.body;
    
    // Generate session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // TODO: Implement with actual V2 engine
    // For now, return a placeholder response
    res.json({
      sessionId,
      phase: "CONTEXT_GATHERING",
      initialMessage: `Goedemiddag! Ik ben Hugo, je persoonlijke sales coach. Vandaag gaan we werken aan techniek ${techniqueId}. Vertel me eerst iets over je situatie - wat voor product of dienst verkoop je?`
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
    
    // TODO: Implement with actual V2 coach-engine
    // For now, return a placeholder response
    res.json({
      response: `Dat is interessant! Vertel me meer over je aanpak. Hoe benader je typisch een klant?`,
      phase: "COACH_CHAT",
      debug: isExpert ? {
        signal: "neutraal",
        persona: {
          name: "Jan de Vries",
          behavior_style: "analytisch",
          buying_clock_stage: "oriëntatie"
        },
        context: {
          sector: "IT",
          product: "Software"
        },
        aiDecisions: {
          epicPhase: 1,
          evaluation: "neutraal"
        }
      } : undefined
    });
  } catch (error: any) {
    console.error("[API] Error processing message:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get session stats
app.get("/api/sessions/stats", async (req, res) => {
  try {
    // TODO: Implement with actual database
    res.json({
      total: 0,
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
    // TODO: Implement with actual database
    res.json({
      sessions: [],
      total: 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
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
  console.log(`[API] Hugo Engine API running on port ${PORT}`);
});

export { app, server };
