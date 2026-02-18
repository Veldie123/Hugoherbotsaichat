# Frontend Export: Gespreksanalyse & Talk to Hugo

Gegenereerd op: 18 februari 2026
Bron: HugoHerbots.ai Sales Coach App (Replit)

---

## Overzicht bestanden per module

### Module 1: Gespreksanalyse (Conversation Analysis)

| Bestand | Regels | Beschrijving |
|---------|--------|-------------|
| `src/components/HH/Analysis.tsx` | 767 | Analyse-overzicht: lijst, upload trigger, zoek/filter, statistieken |
| `src/components/HH/AnalysisResults.tsx` | 1475 | Analyse-resultaten: Coach View (2x2 card grid), Transcript + Evaluatie tab, Replay, PDF export |
| `src/components/HH/ChatBubble.tsx` | 87 | Herbruikbare chat-bubble (seller/customer) met replay-hover |
| `src/components/HH/UploadAnalysis.tsx` | 945 | Upload-dialog: drag & drop audio, bestandsvalidatie, upload progress |
| `src/components/HH/TranscriptDialog.tsx` | 757 | Transcript-weergave als dialog (legacy, nu inline in AnalysisResults) |

### Module 2: Talk to Hugo (AI Chat)

| Bestand | Regels | Beschrijving |
|---------|--------|-------------|
| `src/components/HH/TalkToHugoAI.tsx` | 1845 | Hoofd chat-interface: text/audio/video modes, roleplay, EPIC sidebar, streaming |
| `src/components/HH/StopRoleplayDialog.tsx` | 63 | Bevestigingsdialog voor roleplay stoppen |
| `src/components/HH/TechniqueDetailsDialog.tsx` | 340 | Techniek-detail sheet (naam, doel, hoe, wat, waarom) met edit-modus |
| `src/components/HH/LiveAvatarComponent.tsx` | 343 | HeyGen video avatar component |
| `src/services/hugoApi.ts` | 431 | API service class: session management, chat, streaming, performance tracking |

### Gedeelde bestanden (beide modules)

| Bestand | Regels | Beschrijving |
|---------|--------|-------------|
| `src/components/HH/AppLayout.tsx` | 508 | Layout wrapper: sidebar, header, navigatie |
| `src/components/HH/AdminLayout.tsx` | ~100 | Admin layout variant (purple theme) |
| `src/components/HH/HistorySidebar.tsx` | 199 | Sidebar met recente sessies/analyses |
| `src/types/crossPlatform.ts` | 194 | Alle gedeelde TypeScript types |
| `src/utils/phaseColors.ts` | ~30 | Badge kleuren per EPIC fase |
| `src/utils/hiddenItems.ts` | ~35 | LocalStorage hide/unhide helper |
| `src/data/technieken-service.ts` | ~80 | Technieken data loader (leest uit JSON) |
| `src/contexts/UserContext.tsx` | ~100 | React Context voor user/session state |

---

## Design System (CSS Custom Properties)

Kopieer deze naar je `globals.css` of Tailwind config:

```css
:root {
  /* Core Navy Palette */
  --hh-mirage: #0F1826;            /* Darkest - navy charcoal */
  --hh-indian-ink: #464B50;        /* Dark slate */
  --hh-slate-gray: #6B7280;        /* Medium slate */
  --hh-french-gray: #9CA3AF;       /* Light slate */
  --hh-platinum: #D1D5DB;          /* Very light slate */
  --hh-white: #FFFFFF;

  /* Accent Colors */
  --hh-steel-blue: #4F7396;        /* Informational blue */
  --hh-steel-blue-hover: #5D8AB0;
  --hh-success: #3C9A6E;           /* Forest green - CTAs, positive */
  --hh-warning: #F59E0B;           /* Amber */
  --hh-error: #EF4444;             /* Red */

  /* Semantic Aliases */
  --hh-ink: var(--hh-mirage);
  --hh-primary: var(--hh-steel-blue);
  --hh-primary-hover: var(--hh-steel-blue-hover);
  --hh-bg: var(--hh-white);
  --hh-text: var(--hh-mirage);
  --hh-muted: var(--hh-french-gray);
  --hh-border: var(--hh-platinum);
  --hh-ui-50: #F8FAFC;
  --hh-ui-100: #F1F5F9;
  --hh-ui-200: #E2E8F0;
}
```

### Kleurgebruik per view:

| Element | User View | Admin View |
|---------|-----------|------------|
| CTA buttons | `#3C9A6E` (inline style) | `bg-purple-600` |
| CTA hover | `#2D7F57` (inline style) | `hover:bg-purple-700` |
| Active tabs | `#3C9A6E` | `bg-purple-600` |
| Score >=70% | `text-emerald-600` | `text-emerald-600` |
| Score 50-69% | `text-amber-600` | `text-amber-600` |
| Score <50% | `text-red-500` | `text-red-500` |
| Card backgrounds | `bg-white` | `bg-purple-50` gradients |

**Let op:** Kritische kleuren (#3C9A6E green) gebruiken inline `style={{}}` in plaats van Tailwind classes om JIT compilatie issues te voorkomen.

---

## UI Component Dependencies (shadcn/Radix)

De volgende `src/components/ui/` bestanden zijn nodig:

```
button.tsx, card.tsx, badge.tsx, input.tsx, textarea.tsx,
progress.tsx, avatar.tsx, dialog.tsx, sheet.tsx, popover.tsx,
select.tsx, dropdown-menu.tsx, accordion.tsx
```

Plus `lucide-react` icons (al geinstalleerd bij standaard shadcn setup).

---

## API Endpoints Overzicht

### Gespreksanalyse endpoints

| Endpoint | Method | Beschrijving | Request | Response |
|----------|--------|-------------|---------|----------|
| `/api/v2/analysis/list` | GET | Lijst van alle analyses | - | `{ analyses: [{ id, title, date, status, score, duration, ... }] }` |
| `/api/v2/analysis/upload` | POST | Audio uploaden voor analyse | `FormData: file (audio), title?, userId?` | `{ id: string, status: "processing" }` |
| `/api/v2/analysis/results/:id` | GET | Resultaten ophalen | - | `{ conversation: {...}, transcript: TranscriptTurn[], evaluations: [], signals: [], insights: { phaseScores, moments, coachDebrief }, overallScore }` of `202` als nog bezig |
| `/api/v2/analysis/replay` | POST | Replay starten of bericht sturen | `{ analysisId, startTurnIndex, userMessage?, replayHistory? }` | Start: `{ goal, context: Turn[], recommendedTechniques }` / Reply: `{ customerReply, feedback? }` |
| `/api/v2/analysis/coach-action` | POST | Coach actie (3 opties/drill/demo) | `{ analysisId, momentId, actionType: "three_options" \| "micro_drill" \| "hugo_demo" }` | Type-specifiek: `{ options }`, `{ drill }`, of `{ demo }` |
| `/api/v2/admin/corrections` | POST | Admin correctie indienen | `{ analysisId, type, field, originalValue, newValue, context, submittedBy }` | `{ success: true }` |

### Talk to Hugo endpoints

| Endpoint | Method | Beschrijving | Request | Response |
|----------|--------|-------------|---------|----------|
| `/api/v2/sessions` | POST | Nieuwe sessie starten | `{ techniqueId, mode?, isExpert?, modality? }` | `{ sessionId, phase, message, debug? }` |
| `/api/v2/session/message` | POST | Bericht sturen (non-streaming) | `{ sessionId, message, debug?, expertMode? }` | `{ response, phase, contextData?, levelTransition?, debug? }` |
| `/api/session/:sessionId/message/stream` | POST | Bericht sturen (SSE streaming) | `{ content, isExpert? }` | SSE events: `data: { token }` ... `data: { done: true, debug? }` |
| `/api/session/:sessionId/start-roleplay` | POST | Roleplay starten in sessie | - | `{ message, phase }` |
| `/api/session/:sessionId/feedback` | POST | Feedback opvragen | - | `{ feedback, stats }` |
| `/api/session/:sessionId/evaluate` | POST | Evaluatie uitvoeren | - | `{ evaluation: { overallScore, scores, technique, recommendation, nextSteps } }` |
| `/api/session/:sessionId/reset-context` | POST | Context resetten | - | `{ message }` |
| `/api/session/:sessionId/turns` | GET | Turns ophalen | - | `{ turns: [], total: number }` |
| `/api/v2/chat` | POST | Generieke chat (ook replay) | `{ message, conversationHistory?, sourceApp? }` | `{ response, message?, sessionId?, mode, sources?, suggestions?, richContent? }` |
| `/api/v2/chat/feedback` | POST | Thumbs up/down feedback | `{ messageId, sessionId?, userId?, feedback, messageText, debugInfo?, timestamp }` | `{ success: true }` |
| `/api/technieken` | GET | Alle technieken ophalen | - | `Technique[]` |
| `/api/user/context` | GET/POST | User context ophalen/opslaan | GET: `?userId=` / POST: `{ userId, context }` | `{ context: UserContext }` |

### Audio/Video mode endpoints

| Endpoint | Method | Beschrijving | Request | Response |
|----------|--------|-------------|---------|----------|
| `/api/livekit/token` | POST | LiveKit audio token | `{ techniqueId }` | `{ token, livekitUrl }` |
| `/api/heygen/token` | POST | HeyGen video token | - | `{ token, avatarId }` |

### Performance Tracking endpoints

| Endpoint | Method | Beschrijving | Request | Response |
|----------|--------|-------------|---------|----------|
| `/api/v2/user/level` | GET | Huidig competentieniveau | `?userId=` | `{ userId, level, levelName, assistance: AssistanceConfig }` |
| `/api/v2/user/performance` | POST | Performance opslaan | `{ userId?, techniqueId, techniqueName?, score, struggleSignals? }` | `{ recorded, currentLevel, levelName, assistance, transition? }` |
| `/api/v2/user/mastery` | GET | Techniek-mastery overzicht | `?userId=` | `{ userId, currentLevel, levelName, techniques: TechniqueMasterySummary[] }` |

---

## TypeScript Types (key interfaces)

### AnalysisResults types (inline in component)

```typescript
interface TranscriptTurn {
  idx: number;
  speaker: 'seller' | 'customer';
  text: string;
  timestamp?: string;
}

interface TurnEvaluation {
  turnIdx: number;
  detectedTechniques: string[];
  score: number;
  reasoning: string;
  phase?: number;
}

interface CustomerSignal {
  turnIdx: number;
  type: string;
  signalText: string;
  significance: string;
}

interface PhaseScore {
  phase: number;
  label: string;
  sublabel: string;
  score: number;
  weight: number;
}

interface CoachMoment {
  id: string;
  type: 'big_win' | 'quick_fix' | 'turning_point';
  label: string;
  whyItMatters: string;
  turnIndex: number;
  timestamp: string;
  sellerText?: string;
  customerText?: string;
  betterAlternative?: string;
  recommendedTechniques: string[];
}

interface CoachDebriefMessage {
  type: 'coach_text' | 'moment_ref';
  text?: string;
  momentId?: string;
}

interface CoachDebrief {
  oneliner: string;
  epicMomentum?: string;
  messages: CoachDebriefMessage[];
}
```

### Chat types (uit crossPlatform.ts)

```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface ChatResponse {
  response: string;
  message?: string;
  sessionId?: string | null;
  mode: string;
  technique?: string | null;
  sources?: RagSource[];
  suggestions?: string[];
  richContent?: RichContent[];
}

interface RichContent {
  type: 'card' | 'video' | 'slide' | 'webinar' | 'action' | 'roleplay';
  data: CardContent | VideoEmbed | SlideContent | WebinarLink | ActionButton | RoleplayProposal;
}
```

Volledige types staan in `src/types/crossPlatform.ts` en `src/services/hugoApi.ts`.

---

## Integratie-instructies

### 1. Kopieer bestanden
Kopieer alle `.tsx` bestanden naar `src/components/HH/` in je project.

### 2. Importpaden aanpassen
De componenten importeren uit:
- `../ui/*` → shadcn components
- `../../utils/phaseColors` → kopieer `phaseColors.ts`
- `../../utils/hiddenItems` → kopieer `hiddenItems.ts`
- `../../data/technieken-service` → kopieer service + JSON
- `../../services/hugoApi` → kopieer `hugoApi.ts`
- `../../contexts/UserContext` → kopieer of map naar je eigen user context

### 3. Admin vs User detection
De componenten gebruiken twee aparte concepten:
- `isAdmin` prop → bepaalt of admin-functionaliteit (edit/correctie) beschikbaar is
- `useAdminLayout` (uit `AdminLayout` context) → bepaalt kleurenschema (purple vs blue/green)

Check via Supabase: `user.email === 'stephane@hugoherbots.com'` voor superadmin.

### 4. API wrapper
Maak in je project wrappers die dezelfde endpoints aanroepen. De basis-URL is relatief (`/api/...`), dus als je een andere backend host, vervang deze.

### 5. Tailwind v4 notities
- Sommige Tailwind v3 utilities zijn deprecated in v4
- Kritische kleuren gebruiken inline `style={{}}` voor betrouwbaarheid
- `ring-*`, `shadow-hh-sm` zijn custom utilities — definieer ze in je CSS of vervang door standaard

---

## Bestanden om te kopiëren (alle paden)

```
src/components/HH/Analysis.tsx
src/components/HH/AnalysisResults.tsx
src/components/HH/TalkToHugoAI.tsx
src/components/HH/ChatBubble.tsx
src/components/HH/StopRoleplayDialog.tsx
src/components/HH/TechniqueDetailsDialog.tsx
src/components/HH/LiveAvatarComponent.tsx
src/components/HH/UploadAnalysis.tsx
src/components/HH/TranscriptDialog.tsx
src/components/HH/HistorySidebar.tsx
src/components/HH/AppLayout.tsx
src/components/HH/AdminLayout.tsx
src/services/hugoApi.ts
src/types/crossPlatform.ts
src/utils/phaseColors.ts
src/utils/hiddenItems.ts
src/data/technieken-service.ts
src/contexts/UserContext.tsx
src/styles/globals.css (design tokens sectie)
```
