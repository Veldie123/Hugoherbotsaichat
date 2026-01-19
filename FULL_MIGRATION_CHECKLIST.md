# Volledige Migratie Checklist: Hugo V2 → Andere Replit

Dit document beschrijft ALLES wat van deze Replit naar de andere moet om de complete architectuur te hebben.

---

## Status Overzicht

| Component | Aantal | Status in Andere Replit |
|-----------|--------|------------------------|
| V2 Engine files | 16 | ✅ Aanwezig (uit zip) |
| Config JSON files | 14 actief | ✅ Aanwezig (uit zip) |
| Database schema | 1 | ⚠️ Check nodig |
| Server services | 21 | ⚠️ Deels nodig |
| RAG corpus | ? | ❌ Nog niet actief |

---

## FASE 1: Core Engine (GEDAAN ✅)

Deze bestanden zijn al overgedragen via de zip:

### V2 Engine Files (server/v2/)
```
✅ coach-engine.ts           # Hoofd coaching engine
✅ context_engine.ts         # Context gathering
✅ roleplay-engine.ts        # Roleplay mode
✅ customer_engine.ts        # Klant simulatie
✅ prompt-context.ts         # Shared prompt builders
✅ evaluator.ts              # Techniek evaluatie
✅ response-validator.ts     # Validation loop
✅ response-repair.ts        # Repair bij falen
✅ rag-service.ts            # RAG (placeholder)
✅ historical-context-service.ts
✅ config-consistency.ts
✅ methodology-export.ts
✅ technique-sequence.ts
✅ reference-answers.ts
✅ router.ts
✅ index.ts
```

### Config Files (config/)
```
✅ ssot/technieken_index.json    # SSOT alle technieken
✅ ssot/hugo_persona.json        # Hugo persona
✅ ssot/evaluator_overlay.json   # Evaluatie criteria
✅ ssot/coach_overlay.json       # Coach extensies
✅ detectors.json                # Techniek detectie patterns
✅ klant_houdingen.json          # Klant attitudes
✅ persona_templates.json        # Klant persona's
✅ customer_dynamics.json        # Klant gedrag
✅ video_mapping.json            # Video referenties
✅ global_config.json            # Globale settings
✅ prompts/coach_prompt.json
✅ prompts/context_prompt.json
✅ prompts/roleplay_prompt.json
✅ prompts/feedback_prompt.json
```

---

## FASE 2: Server Services (CHECK NODIG)

Deze files ondersteunen de engine maar zijn mogelijk nog niet in de andere Replit:

### Essentieel voor volledige functionaliteit
```
server/hugo-persona-loader.ts   # Laadt hugo_persona.json
server/ssot-loader.ts           # Laadt technieken_index.json
server/config-loader.ts         # Generieke config loader
server/houding-selector.ts      # Selecteert klant houding
server/persona-engine.ts        # Persona selectie logica
server/state-machine.ts         # Session state management
server/feedback-aggregator.ts   # Feedback verzameling
server/commitment-detector.ts   # Detecteert commitment signals
server/mode-transitions.ts      # Fase transities
server/prompt-factory.ts        # Prompt constructie
server/openai.ts                # OpenAI wrapper
server/db.ts                    # Database connectie
server/storage.ts               # Storage interface
```

### Optioneel (voor extra features)
```
server/streaming-response.ts    # Streaming AI responses
server/daily-service.ts         # Video conferencing
server/livekit-agent.ts         # Voice AI
server/elevenlabs-stt.ts        # Speech-to-text
server/mux-service.ts           # Video hosting
```

---

## FASE 3: Database Schema

De andere Replit heeft mogelijk een andere database structuur nodig.

### Tabellen nodig voor V2
```sql
-- Users
users (id, username, password)

-- V2 Sessions (BELANGRIJK!)
v2_sessions (
  id,
  user_id,
  technique_id,
  mode,                    -- CONTEXT_GATHERING | COACH_CHAT | ROLEPLAY | DEBRIEF
  phase,
  context_data,            -- JSON: sector, product, klant_type
  roleplay_state,          -- JSON: customer profile, attitude
  conversation_history,    -- JSON: array of messages
  evaluation_data,         -- JSON: scores, detected techniques
  context_gathering_history,
  created_at,
  updated_at
)

-- Technique Sessions (context per techniek)
technique_sessions (id, user_id, technique_id, context, created_at, last_used)

-- User Context (globale user context)
user_context (id, user_id, product, klant_type, sector, setting, additional_context)

-- Conversation Turns
turns (id, session_id, role, mode, text, technique_id, meta, created_at)

-- Persona History (welke persona's gespeeld)
persona_history (id, user_id, session_id, customer_profile, outcome, technique_id, ...)
```

---

## FASE 4: RAG Service Activatie

De RAG service gebruikt een corpus van Hugo's trainingsmaterialen.

### Stappen:
1. Maak `rag/corpus/` directory
2. Voeg trainingsmateriaal toe (txt/md files)
3. Activeer in `rag-service.ts`:
   ```typescript
   const RAG_ENABLED = true;
   const CORPUS_PATH = './rag/corpus';
   ```
4. RAG fragmenten worden automatisch geïnjecteerd in prompts

---

## FASE 5: Roleplay Mode Activatie

### Roleplay Engine (`roleplay-engine.ts`)
- Simuleert klant gesprekken
- Gebruikt `customer_engine.ts` voor klant responses
- Laadt persona's uit `persona_templates.json`
- Evalueert techniek gebruik via `evaluator.ts`

### API Endpoints nodig:
```
POST /api/v2/roleplay/start    # Start roleplay sessie
POST /api/v2/roleplay/message  # Stuur bericht in roleplay
POST /api/v2/roleplay/end      # Beëindig met debrief
```

---

## FASE 6: Historical Context Service

Haalt eerdere sessie data op voor personalisatie.

### Wat het doet:
- Technique mastery per user
- Struggle patterns (waar heeft user moeite mee)
- Previous session outcomes
- Injecteert in "HISTORISCHE CONTEXT" prompt sectie

### Vereist:
- Database met sessie historie
- `historical-context-service.ts` actief

---

## Verificatie Commando's

### Check welke engine actief is:
```bash
curl -s -X POST http://localhost:3001/api/v2/sessions \
  -H "Content-Type: application/json" \
  -d '{"mode": "COACH_CHAT", "techniqueId": "opening-vraag"}'
```

**Volledige engine:**
- `engine: "V2-FULL"` in response
- `validatorInfo` aanwezig
- `repairAttempts` aanwezig

### Check roleplay:
```bash
curl -s -X POST http://localhost:3001/api/v2/roleplay/start \
  -H "Content-Type: application/json" \
  -d '{"techniqueId": "opening-vraag"}'
```

### Check RAG:
```bash
# Als RAG actief, zie je "ragFragments" in debug:
curl -s -X POST http://localhost:3001/api/v2/message \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "xxx", "content": "test", "isExpert": true}'
```

---

## Instructie voor Andere Replit

### Stap 1: Check huidige status
```bash
# Welke V2 files zijn aanwezig?
ls server/v2/*.ts | wc -l

# Welke config files?
find config -name "*.json" | wc -l
```

### Stap 2: Vergelijk met referentie
```
Verwacht:
- 16 files in server/v2/
- 14 actieve config files (excl. archive)
```

### Stap 3: Ontbrekende files toevoegen
Kopieer uit `hugo-engine.zip` alle files die ontbreken.

### Stap 4: API refactoren
Zorg dat de API de volledige engine aanroept:
```typescript
// Niet: coach-engine-simple.ts
// Wel: coach-engine.ts
import { generateCoachResponse, generateCoachOpening } from './v2/coach-engine';
```

### Stap 5: Test met verificatie commando's (zie boven)

---

## Volgende Features om te Activeren

| Feature | Prioriteit | Complexiteit | Vereist |
|---------|------------|--------------|---------|
| RAG corpus | Hoog | Medium | Trainingsmateriaal |
| Roleplay mode | Hoog | Medium | Customer engine |
| Historical context | Medium | Low | Database met historie |
| Voice AI | Low | High | LiveKit setup |
| Video coaching | Low | High | Daily.co setup |
