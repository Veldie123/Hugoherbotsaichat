# Hugo Engine Integration Guide

Dit document beschrijft hoe de Hugo AI Engine te integreren in een bestaande frontend.

---

## 1. BENODIGDE BESTANDEN

Unzip `hugo-engine.zip` in je project root. Je krijgt:

```
config/                          # Alle configuratie (SSOT)
├── ssot/
│   ├── technieken_index.json   # Master: alle technieken + velden
│   ├── evaluator_overlay.json  # Scoring criteria
│   ├── coach_overlay.json      # Coach mode extensions
│   └── hugo_persona.json       # Hugo's persoonlijkheid
├── prompts/
│   ├── coach_prompt.json       # COACH_CHAT richtlijnen
│   ├── roleplay_prompt.json    # ROLEPLAY richtlijnen
│   ├── context_prompt.json     # Context gathering
│   └── feedback_prompt.json    # Debrief/feedback
├── detectors.json              # Techniek herkenning patterns
├── klant_houdingen.json        # Klant attitudes
├── persona_templates.json      # Persona gedragsstijlen
├── customer_dynamics.json      # Klant dynamiek
└── video_mapping.json          # Video's per techniek

server/                          # Backend logica
├── v2/                         # V2 Engine (gebruik dit)
│   ├── coach-engine.ts         # COACH_CHAT mode
│   ├── roleplay-engine.ts      # ROLEPLAY mode
│   ├── context_engine.ts       # Context gathering
│   ├── customer_engine.ts      # AI klant simulatie
│   ├── prompt-context.ts       # Config loaders
│   ├── response-validator.ts   # Validatie loop
│   ├── response-repair.ts      # Repair loop
│   ├── evaluator.ts            # Techniek evaluatie
│   ├── rag-service.ts          # RAG search
│   ├── historical-context-service.ts
│   └── router.ts               # API endpoints
├── openai.ts                   # OpenAI client
├── storage.ts                  # Database interface
├── db.ts                       # Drizzle connection
└── routes.ts                   # Express routes

shared/
└── schema.ts                   # Database types (Drizzle)
```

---

## 2. NPM DEPENDENCIES

```bash
npm install express drizzle-orm @neondatabase/serverless openai zod tsx
npm install @types/express @types/node typescript --save-dev
```

Optioneel (voor audio/video):
```bash
npm install livekit-server-sdk @livekit/rtc-node    # Audio
npm install @elevenlabs/client                       # TTS
npm install @heygen/streaming-avatar                 # Video avatar
```

---

## 3. ENVIRONMENT VARIABLES

```env
# Required
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
SESSION_SECRET=random-string

# Optional: Audio
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=wss://...
ELEVENLABS_API_KEY=...

# Optional: Video
HEYGEN_API_KEY=...

# Optional: Video hosting
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...
```

---

## 4. DATABASE SETUP

Run in je project:
```bash
npx drizzle-kit push
```

Tabellen die de engine nodig heeft (zie `shared/schema.ts`):
- `v2_sessions` - Sessie state
- `users` - Gebruikers
- `session_corrections` - Correcties voor config review

---

## 5. EXPRESS SERVER SETUP

```typescript
import express from "express";
import { router as v2Router } from "./server/v2/router";

const app = express();
app.use(express.json());

// Mount V2 engine routes
app.use("/api/v2", v2Router);

// Technieken endpoint (voor sidebar)
app.get("/api/technieken", async (req, res) => {
  const index = await import("./config/ssot/technieken_index.json");
  const techniques = [];
  for (const [faseId, fase] of Object.entries(index.fases)) {
    for (const [techId, tech] of Object.entries(fase.technieken)) {
      techniques.push({
        nummer: techId,
        naam: tech.naam,
        fase: faseId,
        ...tech
      });
    }
  }
  res.json(techniques);
});

app.listen(5000);
```

---

## 6. API ENDPOINTS

### 6.1 Technieken Ophalen (voor sidebar)

**Request:**
```
GET /api/technieken
```

**Response:**
```json
[
  {
    "nummer": "1.1",
    "naam": "Koopklimaat creëren",
    "fase": "1",
    "doel": "Vertrouwen en sympathie opbouwen...",
    "wat": "Gedrag, onderwerpkeuze en presentatie...",
    "waarom": "Om vertrouwen en comfort te creëren...",
    "wanneer": "Direct bij aanvang van gesprek",
    "hoe": "Gebruik observaties (omgeving, kledingstijl)...",
    "tags": ["vertrouwen", "aanvang", "klantgericht"]
  }
]
```

**Frontend gebruik:** Sidebar techniek lijst + (i) info modal

---

### 6.2 Sessie Starten

**Request:**
```
POST /api/v2/sessions
Content-Type: application/json

{
  "techniqueId": "1.1",
  "mode": "COACH_CHAT",
  "isExpert": false,
  "modality": "chat"
}
```

**Response:**
```json
{
  "sessionId": "uuid-here",
  "phase": "CONTEXT_GATHERING",
  "initialMessage": "Goedemiddag! Ik ben Hugo..."
}
```

---

### 6.3 Bericht Sturen

**Request:**
```
POST /api/v2/message
Content-Type: application/json

{
  "sessionId": "uuid-here",
  "content": "Ik wil beter worden in ontdekkingsvragen",
  "isExpert": false
}
```

**Response:**
```json
{
  "response": "Mooi dat je daaraan wilt werken! Vertel eens...",
  "phase": "COACH_CHAT",
  "debug": {
    "signal": "positief",
    "persona": {
      "name": "Jan de Vries",
      "behavior_style": "analytisch",
      "buying_clock_stage": "oriëntatie"
    },
    "context": {
      "sector": "IT",
      "product": "CRM software"
    },
    "aiDecisions": {
      "epicPhase": 1,
      "evaluation": "neutraal"
    },
    "validator": {
      "label": "VALID",
      "confidence": 0.92
    }
  }
}
```

**Frontend gebruik:** 
- `response` → Chat bubble
- `debug` → Debug panel (alleen in admin view)

---

### 6.4 Sessie Stats (Dashboard KPIs)

**Request:**
```
GET /api/sessions/stats
```

**Response:**
```json
{
  "total": 6,
  "excellentQuality": 3,
  "averageScore": 80,
  "needsImprovement": 1
}
```

---

### 6.5 Sessie Lijst (Admin tabel)

**Request:**
```
GET /api/sessions?limit=20&offset=0
```

**Response:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "techniqueId": "2.1.1",
      "techniqueName": "Feitgerichte vragen",
      "userName": "Jan de Vries",
      "userCompany": "TechCorp BV",
      "type": "AI Audio",
      "score": 88,
      "duration": 1845,
      "createdAt": "2025-01-15T14:23:00Z",
      "conversationHistory": [...],
      "evaluation": {...}
    }
  ],
  "total": 6
}
```

---

### 6.6 Correctie Indienen (Flag for Review)

**Request:**
```
POST /api/v2/corrections
Content-Type: application/json

{
  "sessionId": "uuid",
  "turnNumber": 3,
  "correctionType": "wrong_technique",
  "expectedTechnique": "2.1.1",
  "detectedTechnique": "2.1.2",
  "expertComment": "Dit was duidelijk een feitgerichte vraag, geen gevoelsvraag"
}
```

**Response:**
```json
{
  "id": "correction-uuid",
  "status": "pending"
}
```

---

### 6.7 Config Conflicts (Config Review pagina)

**Request:**
```
GET /api/v2/config-conflicts
```

**Response:**
```json
{
  "conflicts": [
    {
      "id": "conflict-uuid",
      "correctionId": "correction-uuid",
      "severity": "high",
      "configFile": "detectors.json",
      "techniqueId": "2.1",
      "conflictType": "missing_definition",
      "description": "No detector configuration found for techniek 2.1",
      "status": "pending",
      "createdAt": "2025-01-15T12:00:00Z",
      "sessionContext": {
        "customerMessage": "...",
        "expertComment": "..."
      }
    }
  ],
  "stats": {
    "pending": 3,
    "approved": 1,
    "rejected": 1,
    "total": 5
  }
}
```

---

### 6.8 Conflict Resolven

**Request:**
```
POST /api/v2/config-conflicts/:id/resolve
Content-Type: application/json

{
  "resolution": "Updated detector pattern",
  "resolvedBy": "Hugo Herbots"
}
```

---

## 7. FRONTEND PAGINA'S

### 7.1 Admin Dashboard

```
┌────────────────────────────────────────────────────────┐
│  HUGO HERBOTS [ADMIN]                    🔔 Hugo H.    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Hugo a.i.        [Export Data] [Config Review] [Chat] │
│                                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ Total  │ │Quality │ │ Score  │ │ Needs  │          │
│  │   6    │ │   3    │ │  80%   │ │   1    │          │
│  └────────┘ └────────┘ └────────┘ └────────┘          │
│                                                        │
│  [Search...] [Alle Types ▼] [Alle Kwaliteit ▼]        │
│                                                        │
│  # | Techniek      | Gebruiker  | Type    | Score | ⋮ │
│  ──────────────────────────────────────────────────── │
│  2.1.1 Feitgerichte | Jan de V. | Audio  | 88%   | ⋮ │
│  4.2.4 Bezwaren     | Sarah vD  | Video  | 76%   | ⋮ │
│                                                        │
│  [👁 User View]                                        │
└────────────────────────────────────────────────────────┘
```

**API calls:**
- `GET /api/sessions/stats` → KPI tiles
- `GET /api/sessions` → Tabel data
- ⋮ menu → Bekijk Details, Download, Flag for Review, Verwijder

---

### 7.2 Sessie Detail Modal

```
┌─────────────────────────────────────────────────┐
│  Jan de Vries  [2.1.1 - Feitgerichte vragen] ✓  │
│  TechCorp BV • AI Audio • 2025-01-15 14:23      │
├─────────────────────────────────────────────────┤
│  Transcript                                      │
│                                                  │
│  [00:00] AI Coach:                              │
│  Goedemiddag! Vandaag gaan we oefenen met...    │
│  > Debug Info                                    │
│    ┌──────────────────────────────────────┐     │
│    │ Signaal: [positief]                  │     │
│    │ Persona: Jan, analytisch             │     │
│    │ EPIC Fase: 2                         │     │
│    └──────────────────────────────────────┘     │
│                                                  │
│  [00:05] Jan:                                   │
│  Ja, ik ben er klaar voor...                    │
│  > Debug Info                                    │
│                                                  │
│  AI Feedback                                     │
│  ─────────────────────────────────────────       │
│  Score: 88% | Sterke punten: ...                │
└─────────────────────────────────────────────────┘
```

**Data source:** `session.conversationHistory` + `session.evaluation`

---

### 7.3 Config Review

```
┌────────────────────────────────────────────────────────┐
│  Config Review                                         │
│  Review en goedkeur AI configuratie conflicten         │
│                                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │Pending │ │Approved│ │Rejected│ │ Total  │          │
│  │   3    │ │   1    │ │   1    │ │   5    │          │
│  └────────┘ └────────┘ └────────┘ └────────┘          │
│                                                        │
│  [Search] [Alle Severity ▼] [Alle Status ▼]           │
│                                                        │
│  Techniek | Type           | Severity | Beschrijving  │
│  ────────────────────────────────────────────────────  │
│  2.1 Feitgerichte | Missing Detector | HIGH | No...   │
│  3.2 Oplossing    | Pattern Mismatch | MED  | Cur...  │
│  4.1 Proefafsluit | Phase Error      | HIGH | AI...   │
│                                                        │
│  [✓] [✗] per rij                                       │
└────────────────────────────────────────────────────────┘
```

**API calls:**
- `GET /api/v2/config-conflicts` → Lijst + stats
- `POST /api/v2/config-conflicts/:id/resolve` → ✓ button
- `POST /api/v2/config-conflicts/:id/reject` → ✗ button

---

### 7.4 Chat Expert Mode

```
┌──────────────────────────────────────────────────────────────────┐
│  Chat Expert Mode              [Start Opname] [Stop] [Opnieuw]   │
├─────────────────────────┬────────────────────────────────────────┤
│  Epic Sales Flow        │  V2 Roleplay - Explore                 │
│  7/25 • 28%            │                                         │
│                        │  Niveau: [Beginner] [Gemiddeld] [Expert]│
│  ▼ Fases & technieken  │                                         │
│                        │  ┌────────────────────────────────────┐ │
│  ▼ Openingsfase [2/4]  │  │ Tip: Bekijk aanbevolen techniek    │ │
│    1.1 Koopklimaat 💬 ⓘ│  │                                    │ │
│    1.2 Gentleman's 💬 ⓘ│  │ [Debug ▼]                          │ │
│    1.3 Firmavoors. 💬 ⓘ│  │ ┌──────────────────────────────┐   │ │
│    1.4 Instapvraag 💬 ⓘ│  │ │ Klant Signaal: [neutraal]    │   │ │
│                        │  │ │ > Persona                     │   │ │
│  > Ontdekkingsfase 0/10│  │ │ > Context                     │   │ │
│  > Aanbevelingsfase 0/5│  │ │ > Customer Dynamics           │   │ │
│  > Beslissingsfase 0/6 │  │ │                               │   │ │
│                        │  │ │ AI Beslissingen               │   │ │
│                        │  │ │ EPIC Fase: Fase 1             │   │ │
│                        │  │ │ Evaluatie: [neutraal]         │   │ │
│                        │  │ └──────────────────────────────┘   │ │
│                        │  │                                    │ │
│                        │  └────────────────────────────────────┘ │
│                        │                                         │
│  [👁 User View]        │  [Geselecteerd: Koopklimaat] [Wijzig]   │
│                        │  [Type je antwoord als verkoper...] 🎤  │
└─────────────────────────┴────────────────────────────────────────┘
```

**Sidebar data:** `GET /api/technieken` → Groepeer per fase

**ⓘ button → Techniek Info Modal:**
```
┌─────────────────────────────────────────┐
│  1.1  Fase 1                        ✕   │
│  Koopklimaat creëren                    │
│  [vertrouwen] [aanvang] [klantgericht]  │
│                                         │
│  ⊙ Doel                                 │
│  Vertrouwen en sympathie opbouwen       │
│  zodat de klant openstaat voor het      │
│  gesprek.                               │
│                                         │
│  Wat                                    │
│  Gedrag, onderwerpkeuze en presentatie  │
│  aanpassen aan interesses en sfeer...   │
│                                         │
│  Waarom                                 │
│  Om vertrouwen en comfort te creëren... │
│                                         │
│  Wanneer                                │
│  Direct bij aanvang van gesprek         │
│                                         │
│  Hoe                                    │
│  Gebruik observaties (omgeving,         │
│  kledingstijl) en persoonlijke          │
│  aanpassingen om aansluiting...         │
│                                         │
│         [✏️ Bewerken] [Sluiten]          │
└─────────────────────────────────────────┘
```

**Data source:** `technieken_index.json` velden: doel, wat, waarom, wanneer, hoe, tags

---

### 7.5 User View

Identiek aan Admin view MAAR:
- ❌ Geen Debug panel
- ❌ Geen "Start Opname" button
- ❌ Geen "Config Review" button
- ❌ Geen "Bewerken" in techniek modal
- ❌ Geen validator info

---

## 8. AUDIO FLOW (LiveKit + ElevenLabs)

### 8.1 Architectuur

```
User spreekt → Browser mic → LiveKit Room → livekit-agent.ts
                                                   ↓
                                           Whisper (STT)
                                                   ↓
                                           coach-engine.ts
                                                   ↓
                                           Hugo response
                                                   ↓
                                           ElevenLabs (TTS)
                                                   ↓
User hoort ← Browser speaker ← LiveKit Room ←────┘
```

### 8.2 API Calls

**1. Get Room Token:**
```
POST /api/livekit/token
{ "sessionId": "uuid", "userName": "Jan" }

Response:
{ "token": "eyJ...", "roomName": "session-uuid" }
```

**2. Frontend WebRTC Connect:**
```typescript
import { Room } from "livekit-client";

const room = new Room();
await room.connect(LIVEKIT_URL, token);

// Start microphone
await room.localParticipant.setMicrophoneEnabled(true);

// Listen for AI audio
room.on("trackSubscribed", (track) => {
  if (track.kind === "audio") {
    track.attach(audioElement);
  }
});
```

**3. Server-side Agent (`livekit-agent.ts`):**
- Listens to room
- Transcribes with Whisper
- Calls `processMessage()` from coach-engine
- Synthesizes with ElevenLabs
- Publishes audio track back

---

## 9. VIDEO FLOW (HeyGen)

### 9.1 Architectuur

```
User spreekt → Browser mic → Whisper STT → coach-engine.ts
                                                   ↓
                                           Hugo response
                                                   ↓
                                           HeyGen Avatar API
                                                   ↓
User ziet ← Browser video ← HeyGen Stream ←──────┘
```

### 9.2 API Calls

**1. Start Avatar Session:**
```
POST /api/heygen/session
{ "avatarId": "hugo-avatar-id" }

Response:
{ 
  "sessionId": "heygen-session-id",
  "streamUrl": "wss://..."
}
```

**2. Send Text to Avatar:**
```
POST /api/heygen/speak
{ 
  "sessionId": "heygen-session-id",
  "text": "Goedemiddag! Welkom bij de training."
}
```

**3. Frontend WebSocket:**
```typescript
const ws = new WebSocket(streamUrl);
ws.onmessage = (event) => {
  // Video frames
  videoElement.srcObject = event.data;
};
```

---

## 10. SESSION LIFECYCLE

```
1. CREATE SESSION
   POST /api/v2/sessions
   → Returns sessionId + initial message

2. CONTEXT GATHERING (3-5 turns)
   POST /api/v2/message (phase: CONTEXT_GATHERING)
   → Hugo vraagt naar sector, product, situatie
   
3. COACHING / ROLEPLAY
   POST /api/v2/message (phase: COACH_CHAT of ROLEPLAY)
   → Actieve training sessie
   
4. EVALUATION
   POST /api/v2/message (phase: FEEDBACK)
   → Hugo geeft feedback + score
   
5. END SESSION
   POST /api/v2/sessions/:id/end
   → Saves final state + evaluation
```

---

## 11. DEBUG INFO STRUCTUUR

Elk bericht van de engine bevat optioneel:

```json
{
  "response": "Hugo's tekst",
  "debug": {
    "signal": "positief" | "neutraal" | "negatief",
    "persona": {
      "name": "Jan de Vries",
      "behavior_style": "analytisch",
      "buying_clock_stage": "oriëntatie",
      "experience_level": "ervaren",
      "difficulty_level": "gemiddeld"
    },
    "context": {
      "sector": "IT",
      "product": "CRM software",
      "klant_type": "B2B",
      "verkoopkanaal": "inside sales",
      "isComplete": true,
      "turnNumber": 5,
      "phase": 2,
      "techniqueId": "2.1.1"
    },
    "customerDynamics": {
      "attitude": "sceptisch",
      "temperature": 0.6
    },
    "aiDecisions": {
      "epicPhase": 2,
      "evaluation": "positief",
      "detectedTechniques": ["2.1.1"],
      "suggestedNextTechnique": "2.1.2"
    },
    "validator": {
      "label": "VALID",
      "confidence": 0.92,
      "violations": [],
      "wasRepaired": false,
      "repairAttempts": 0
    }
  }
}
```

---

## 12. CONFIG FILES UITLEG

| File | Doel | Frontend Gebruik |
|------|------|------------------|
| `technieken_index.json` | Master voor alle technieken | Sidebar, info modals |
| `detectors.json` | Patterns om technieken te herkennen | Backend only |
| `klant_houdingen.json` | Klant attitudes (sceptisch, enthousiast) | Debug panel |
| `persona_templates.json` | Gedragsstijlen, buying clock | Debug panel |
| `hugo_persona.json` | Hugo's persoonlijkheid | Backend only |
| `evaluator_overlay.json` | Scoring criteria per techniek | Evaluation display |
| `coach_prompt.json` | Coaching richtlijnen | Backend only |
| `video_mapping.json` | Video's gekoppeld aan technieken | Video player |

---

## 13. ADMIN VS USER VIEW

| Feature | Admin View | User View |
|---------|------------|-----------|
| Debug panel | ✅ | ❌ |
| Start Opname | ✅ | ❌ |
| Config Review | ✅ | ❌ |
| Flag for Review | ✅ | ❌ |
| Bewerken techniek | ✅ | ❌ |
| Validator info | ✅ | ❌ |
| Chat/Audio/Video | ✅ | ✅ |
| Sessie historie | ✅ | ✅ (eigen) |
| Techniek info (i) | ✅ | ✅ |

Toggle via `isExpert` flag in session + UI state.

---

*Gegenereerd voor Hugo Platform V2 Engine integratie*
