# V2 Engine Activatie - Instructies voor Frontend Replit

De placeholder responses vervangen door echte V2 engine logica.

---

## STAP 1: Dependencies Check

Zorg dat deze imports werken in je message endpoint file:

```typescript
import { processCoachMessage } from "./server/v2/coach-engine";
import { processRoleplayMessage } from "./server/v2/roleplay-engine";
import { gatherContext } from "./server/v2/context_engine";
```

Als imports falen, check of de files correct zijn gekopieerd uit de zip.

---

## STAP 2: Session Storage

Je hebt een in-memory of database storage nodig voor sessies:

```typescript
// Simpele in-memory storage (voor development)
const sessions = new Map<string, {
  id: string;
  mode: "COACH_CHAT" | "ROLEPLAY" | "CONTEXT_GATHERING";
  techniqueId: string;
  conversationHistory: Array<{ role: string; content: string }>;
  contextData: any;
  isExpert: boolean;
  createdAt: Date;
}>();
```

---

## STAP 3: POST /api/v2/sessions

Vervang de placeholder:

```typescript
import { v4 as uuidv4 } from "uuid";
import { buildNestedOpeningPrompt } from "./server/v2/coach-engine";

app.post("/api/v2/sessions", async (req, res) => {
  try {
    const { techniqueId, mode = "COACH_CHAT", isExpert = false } = req.body;
    
    const sessionId = uuidv4();
    
    // Maak sessie aan
    const session = {
      id: sessionId,
      mode: "CONTEXT_GATHERING", // Start altijd met context gathering
      techniqueId,
      conversationHistory: [],
      contextData: {},
      isExpert,
      createdAt: new Date()
    };
    
    sessions.set(sessionId, session);
    
    // Genereer opening message
    const openingPrompt = await buildNestedOpeningPrompt(techniqueId);
    
    // Call OpenAI voor initiële boodschap
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: openingPrompt },
        { role: "user", content: "Start het gesprek." }
      ],
      max_tokens: 500
    });
    
    const initialMessage = completion.choices[0].message.content;
    
    // Voeg toe aan history
    session.conversationHistory.push({
      role: "assistant",
      content: initialMessage
    });
    
    res.json({
      sessionId,
      phase: session.mode,
      initialMessage
    });
    
  } catch (error) {
    console.error("Session creation error:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});
```

---

## STAP 4: POST /api/v2/message (De Kern)

Dit is waar de echte engine logica zit:

```typescript
import { processCoachMessage, buildCoachSystemPrompt } from "./server/v2/coach-engine";
import { processRoleplayTurn } from "./server/v2/roleplay-engine";
import { processContextGathering, isContextComplete } from "./server/v2/context_engine";

app.post("/api/v2/message", async (req, res) => {
  try {
    const { sessionId, content, isExpert = false } = req.body;
    
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    // Voeg user message toe aan history
    session.conversationHistory.push({
      role: "user",
      content
    });
    
    let response: string;
    let debug: any = {};
    
    // Route naar juiste engine op basis van mode
    switch (session.mode) {
      case "CONTEXT_GATHERING":
        const contextResult = await processContextGathering(
          session.conversationHistory,
          session.contextData
        );
        
        response = contextResult.response;
        session.contextData = contextResult.updatedContext;
        
        // Check of context compleet is
        if (isContextComplete(session.contextData)) {
          session.mode = "COACH_CHAT"; // Transition naar coaching
        }
        
        debug = {
          phase: "CONTEXT_GATHERING",
          contextComplete: isContextComplete(session.contextData),
          gatheredFields: Object.keys(session.contextData)
        };
        break;
        
      case "COACH_CHAT":
        const coachResult = await processCoachMessage({
          sessionId,
          techniqueId: session.techniqueId,
          userMessage: content,
          conversationHistory: session.conversationHistory,
          contextData: session.contextData,
          isExpert
        });
        
        response = coachResult.response;
        debug = {
          phase: "COACH_CHAT",
          signal: coachResult.signal || "neutraal",
          detectedTechniques: coachResult.detectedTechniques || [],
          evaluation: coachResult.evaluation || "neutraal",
          validator: coachResult.validatorResult || null
        };
        break;
        
      case "ROLEPLAY":
        const roleplayResult = await processRoleplayTurn({
          sessionId,
          techniqueId: session.techniqueId,
          userMessage: content,
          conversationHistory: session.conversationHistory,
          contextData: session.contextData,
          persona: session.persona
        });
        
        response = roleplayResult.customerResponse;
        debug = {
          phase: "ROLEPLAY",
          signal: roleplayResult.signal,
          persona: roleplayResult.persona,
          customerDynamics: roleplayResult.dynamics
        };
        break;
        
      default:
        response = "Onbekende sessie modus.";
    }
    
    // Voeg assistant response toe aan history
    session.conversationHistory.push({
      role: "assistant",
      content: response
    });
    
    // Return response met optionele debug info
    const result: any = { response, phase: session.mode };
    
    if (isExpert) {
      result.debug = debug;
    }
    
    res.json(result);
    
  } catch (error) {
    console.error("Message processing error:", error);
    res.status(500).json({ error: "Failed to process message" });
  }
});
```

---

## STAP 5: Vereenvoudigde processCoachMessage

Als de volledige engine te complex is, hier een vereenvoudigde versie:

```typescript
// server/v2/coach-engine-simple.ts

import OpenAI from "openai";
import { loadTechniquesIndex, buildMethodologyContext } from "./prompt-context";

const openai = new OpenAI();

export async function processCoachMessage({
  sessionId,
  techniqueId,
  userMessage,
  conversationHistory,
  contextData,
  isExpert
}: {
  sessionId: string;
  techniqueId: string;
  userMessage: string;
  conversationHistory: Array<{ role: string; content: string }>;
  contextData: any;
  isExpert: boolean;
}) {
  
  // Laad techniek info
  const techniques = await loadTechniquesIndex();
  const technique = findTechnique(techniques, techniqueId);
  
  // Bouw system prompt
  const systemPrompt = `
Je bent Hugo, een ervaren sales coach. Je helpt verkopers de techniek "${technique.naam}" te oefenen.

=== TECHNIEK INFO ===
Doel: ${technique.doel}
Wat: ${technique.wat}
Waarom: ${technique.waarom}
Wanneer: ${technique.wanneer}
Hoe: ${technique.hoe}

=== CONTEXT ===
${JSON.stringify(contextData, null, 2)}

=== COACHING RICHTLIJN ===
- Stel ÉÉN vraag per beurt
- Luister, vat samen, vraag door (LSD methode)
- Geef concrete feedback gebaseerd op de techniek
- Wees bemoedigend maar eerlijk
`;

  // Format conversation voor OpenAI
  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...conversationHistory.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content
    }))
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 500,
    temperature: 0.7
  });

  const response = completion.choices[0].message.content || "";

  // Basis signal detectie
  const signal = detectSignal(userMessage);

  return {
    response,
    signal,
    detectedTechniques: [techniqueId],
    evaluation: "neutraal"
  };
}

function findTechnique(index: any, techniqueId: string) {
  for (const fase of Object.values(index.fases) as any[]) {
    if (fase.technieken && fase.technieken[techniqueId]) {
      return fase.technieken[techniqueId];
    }
  }
  return { naam: "Onbekend", doel: "", wat: "", waarom: "", wanneer: "", hoe: "" };
}

function detectSignal(message: string): "positief" | "neutraal" | "negatief" {
  const positive = ["ja", "zeker", "goed", "mooi", "interessant", "graag"];
  const negative = ["nee", "niet", "moeilijk", "lastig", "probleem"];
  
  const lower = message.toLowerCase();
  
  if (positive.some(w => lower.includes(w))) return "positief";
  if (negative.some(w => lower.includes(w))) return "negatief";
  return "neutraal";
}
```

---

## STAP 6: Vereenvoudigde Context Gathering

```typescript
// server/v2/context_engine-simple.ts

import OpenAI from "openai";

const openai = new OpenAI();

const REQUIRED_FIELDS = ["sector", "product", "klant_type"];

export async function processContextGathering(
  conversationHistory: Array<{ role: string; content: string }>,
  currentContext: any
) {
  const systemPrompt = `
Je bent Hugo, een sales coach. Je verzamelt context voordat je begint met coachen.

Je moet weten:
- Sector: In welke branche werkt de gebruiker?
- Product: Wat verkoopt de gebruiker?  
- Klant type: B2B of B2C?

Wat je al weet:
${JSON.stringify(currentContext, null, 2)}

Stel ÉÉN vraag om ontbrekende info te verzamelen. Als alles compleet is, zeg dat je klaar bent om te beginnen.
`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...conversationHistory.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content
    }))
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 300
  });

  const response = completion.choices[0].message.content || "";

  // Extract context uit laatste user message
  const lastUserMessage = conversationHistory
    .filter(m => m.role === "user")
    .pop()?.content || "";

  const updatedContext = {
    ...currentContext,
    ...extractContextFromMessage(lastUserMessage)
  };

  return { response, updatedContext };
}

function extractContextFromMessage(message: string): any {
  const context: any = {};
  const lower = message.toLowerCase();

  // Simpele keyword extraction
  if (lower.includes("it") || lower.includes("software") || lower.includes("tech")) {
    context.sector = "IT";
  }
  if (lower.includes("b2b") || lower.includes("bedrijven")) {
    context.klant_type = "B2B";
  }
  if (lower.includes("b2c") || lower.includes("consumenten")) {
    context.klant_type = "B2C";
  }

  return context;
}

export function isContextComplete(context: any): boolean {
  return REQUIRED_FIELDS.every(field => context[field]);
}
```

---

## STAP 7: Test de Integratie

```bash
# Health check
curl http://localhost:3001/api/health

# Start sessie
curl -X POST http://localhost:3001/api/v2/sessions \
  -H "Content-Type: application/json" \
  -d '{"techniqueId": "1.1", "mode": "COACH_CHAT"}'

# Stuur bericht (gebruik sessionId van response)
curl -X POST http://localhost:3001/api/v2/message \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "uuid-hier", "content": "Ik werk in IT en verkoop CRM software"}'
```

---

## Troubleshooting

**"Cannot find module './v2/coach-engine'"**
→ Check of de server/ folder correct is gekopieerd

**"OPENAI_API_KEY not set"**
→ Voeg toe aan environment variables

**"Session not found"**
→ Sessions worden in-memory opgeslagen, herstart verliest ze

**OpenAI rate limit**
→ Voeg retry logic toe of gebruik lagere temperature

---

*Dit document beschrijft de minimale implementatie. De volledige engine heeft meer features (RAG, validator, historical context) maar dit is genoeg om te starten.*
