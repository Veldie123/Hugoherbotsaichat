# Complete Setup Checklist - Exacte Kopie

Dit is de DEFINITIEVE checklist om de andere Replit 100% identiek te maken aan deze Replit.

---

## 1. SECRETS (9 stuks)

Kopieer deze secrets naar de andere Replit:

| Secret | Doel |
|--------|------|
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Replit AI Integrations |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Replit AI Integrations |
| `OPENAI_API_KEY` | RAG embeddings (directe API) |
| `LIVEKIT_URL` | Voice AI |
| `LIVEKIT_API_KEY` | Voice AI |
| `LIVEKIT_API_SECRET` | Voice AI |
| `ELEVENLABS_API_KEY` | TTS |
| `DATABASE_URL` | PostgreSQL |
| `SESSION_SECRET` | Auth sessions |

---

## 2. SERVER FILES (kopieer alle)

### V2 Engine (`server/v2/`) - 16 files
```
coach-engine.ts
context_engine.ts
roleplay-engine.ts
customer_engine.ts
prompt-context.ts
evaluator.ts
response-validator.ts
response-repair.ts
rag-service.ts
historical-context-service.ts
config-consistency.ts
methodology-export.ts
technique-sequence.ts
reference-answers.ts
router.ts
index.ts
```

### Root server files
```
server/openai.ts          ← BELANGRIJK: moet AI_INTEGRATIONS gebruiken
server/livekit-agent.ts
server/elevenlabs-stt.ts
server/hugo-persona-loader.ts
server/ssot-loader.ts
server/config-loader.ts
server/db.ts
server/storage.ts
```

---

## 3. CONFIG FILES (kopieer alle)

### SSOT (`config/ssot/`)
```
technieken_index.json
hugo_persona.json
evaluator_overlay.json
coach_overlay.json
```

### Prompts (`config/prompts/`)
```
coach_prompt.json
context_prompt.json
roleplay_prompt.json
feedback_prompt.json
```

### Root config
```
config/detectors.json
config/klant_houdingen.json
config/persona_templates.json
config/customer_dynamics.json
config/video_mapping.json
config/global_config.json
```

---

## 4. DATABASE SETUP

### Run migrations
```bash
npm run db:push
```

### Vereiste tabellen
- `users`
- `sessions`
- `v2_sessions`
- `technique_sessions`
- `user_context`
- `turns`
- `persona_history`
- `rag_documents` (voor RAG)

---

## 5. OPENAI CONFIG

**KRITIEK:** `server/openai.ts` moet exact dit bevatten:

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export function getOpenAI(): OpenAI {
  return openai;
}
```

Dit zorgt ervoor dat gpt-5.1 werkt.

---

## 6. NPM PACKAGES

```bash
npm install livekit-client @livekit/components-react
npm install @livekit/agents @livekit/agents-plugin-silero @livekit/agents-plugin-elevenlabs
```

---

## 7. FRONTEND FIXES

### Display mappings (`src/utils/displayMappings.ts`)
```typescript
export const buyingClockToDisplay = {
  situation_as_is: "00u–06u: Huidige situatie",
  field_of_tension: "06u–08u: Spanningsveld",
  market_research: "08u–11u: Marktonderzoek",
  hesitation: "11u–12u: Twijfel",
  decision: "12u: Beslissing"
};

export const behaviorStyleToDisplay = {
  promoverend: "Promoverend",
  faciliterend: "Faciliterend",
  controlerend: "Controlerend",
  analyserend: "Analyserend"
};
```

### Vervang hardcoded waarden in AdminChatExpertMode.tsx
- Regel 251-265, 351-365: Vervang "Kleur groen" → API data
- Regel 259, 290: Vervang 50% → Conditioneel tonen

---

## 8. VERIFICATIE TESTS

### Test 1: Engine check
```bash
curl -s -X POST http://localhost:3001/api/v2/sessions \
  -H "Content-Type: application/json" \
  -d '{"mode": "COACH_CHAT", "techniqueId": "opening-vraag"}'
```
Verwacht: `engine: "V2-FULL"`, `validatorInfo` aanwezig

### Test 2: RAG check
```bash
grep -i "rag" /tmp/logs/*.log
```
Verwacht: `[RAG] Found X documents` (niet "not available")

### Test 3: Audio check
```bash
grep -i "livekit" /tmp/logs/*.log
```
Verwacht: `[LiveKit Agent] Ready`

---

## 9. SNELLE VERIFICATIE

Na alle stappen, run dit:

```bash
echo "=== SECRETS CHECK ===" && \
env | grep -E "AI_INTEGRATIONS|OPENAI|LIVEKIT|ELEVENLABS" | cut -d= -f1 | sort && \
echo "" && \
echo "=== ENGINE FILES CHECK ===" && \
ls server/v2/*.ts 2>/dev/null | wc -l && \
echo "" && \
echo "=== CONFIG FILES CHECK ===" && \
find config -name "*.json" -not -path "*/archive/*" | wc -l
```

Verwachte output:
```
=== SECRETS CHECK ===
AI_INTEGRATIONS_OPENAI_API_KEY
AI_INTEGRATIONS_OPENAI_BASE_URL
ELEVENLABS_API_KEY
LIVEKIT_API_KEY
LIVEKIT_API_SECRET
LIVEKIT_URL
OPENAI_API_KEY

=== ENGINE FILES CHECK ===
16

=== CONFIG FILES CHECK ===
14
```

---

## DONE ✅

Als alle checks groen zijn, is de andere Replit 100% identiek aan deze.
