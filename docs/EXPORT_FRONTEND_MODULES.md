# HugoHerbots.ai — Frontend Modules Export Guide

> **Doel:** Dit document beschrijft alle exporteerbare frontend modules, hun afhankelijkheden, en praktische tips voor hergebruik in een ander project.

## Exportmap Structuur

```
export/
├── App.tsx                          # Hoofd app met routing
├── components/
│   ├── HH/                          # HugoHerbots custom componenten
│   │   ├── TalkToHugoAI.tsx         # Chat interface (chat/audio/video)
│   │   ├── AnalysisResults.tsx      # Gespreksanalyse resultaten (Coach + Transcript)
│   │   ├── AppLayout.tsx            # User layout (sidebar, header, routing)
│   │   ├── AdminLayout.tsx          # Admin layout (paarse kleurschema)
│   │   ├── ChatBubble.tsx           # Chat bubble component
│   │   ├── HugoAIOverview.tsx       # Hugo AI overzichtspagina
│   │   ├── TranscriptDialog.tsx     # Transcript weergave dialog
│   │   ├── UploadAnalysis.tsx       # Audio upload voor analyse
│   │   ├── Analysis.tsx             # Analyse lijst/overzicht
│   │   ├── Login.tsx                # Login pagina
│   │   ├── Onboarding.tsx           # Gebruiker onboarding flow
│   │   ├── Landing.tsx              # Publieke landingspagina
│   │   ├── AdminSessions.tsx        # Admin sessie overzicht
│   │   ├── AdminChatExpertMode.tsx  # Expert modus training
│   │   ├── AdminConfigReview.tsx    # Config review (correcties goedkeuren)
│   │   ├── StopRoleplayDialog.tsx   # Roleplay stop bevestiging
│   │   ├── TechniqueDetailsDialog.tsx # Techniek details
│   │   ├── TechniqueCard.tsx        # Techniek kaart component
│   │   ├── Logo.tsx                 # Logo component
│   │   └── UserMenu.tsx             # Gebruikersmenu
│   └── ui/                          # shadcn/ui basis componenten
│       ├── badge.tsx, button.tsx, card.tsx, dialog.tsx
│       ├── drawer.tsx, dropdown-menu.tsx, input.tsx
│       ├── label.tsx, popover.tsx, accordion.tsx
│       ├── avatar.tsx, checkbox.tsx
│       └── ...
├── services/
│   ├── hugoApi.ts                   # Complete API wrapper voor Hugo Engine V2
│   └── lastActivityService.ts       # Laatste activiteit tracking
├── types/
│   └── crossPlatform.ts             # Gedeelde TypeScript types
├── styles/
│   └── globals.css                  # Globale CSS met design tokens
├── config/
│   └── ssot/                        # Single Source of Truth JSON bestanden
│       ├── coach_overlay.json       # Coach overlay configuratie
│       ├── coach_overlay_v3.json    # Coach overlay v3
│       ├── coach_overlay_v3_1.json  # Coach overlay v3.1 (meest recent)
│       ├── evaluator_overlay.json   # Evaluator configuratie
│       ├── hugo_persona.json        # Hugo persona definitie
│       └── technieken_index.json    # EPIC technieken index
└── server/
    ├── v2/                          # Hugo Engine V2 backend
    │   ├── coach-engine.ts          # Hoofd coach engine
    │   ├── context_engine.ts        # Context engine
    │   ├── rag-service.ts           # RAG service
    │   ├── evaluator.ts             # Gespreksanalyse evaluator
    │   ├── analysis-service.ts      # Analyse service
    │   ├── response-repair.ts       # Response validatie/reparatie
    │   ├── content-assets.ts        # Content asset library
    │   ├── intent-detector.ts       # Intent detectie
    │   ├── rich-response-builder.ts # Rich response builder
    │   ├── roleplay-engine.ts       # Roleplay engine
    │   ├── customer_engine.ts       # Klant simulatie engine
    │   └── router.ts                # API routes
    ├── api.ts                       # Express API setup
    ├── db.ts                        # Database connectie
    ├── config-loader.ts             # SSOT config loader
    └── livekit-agent.ts             # LiveKit audio agent
```

---

## Belangrijke Tips voor Hergebruik

### 1. Groene CTA kleur (#3C9A6E) — Inline Styles Verplicht

De groene CTA kleur gebruikt **altijd** `style={{}}` in plaats van Tailwind classes. Dit is bewust vanwege **Tailwind CSS v4 JIT issues** — arbitrary values zoals `bg-[#3C9A6E]` worden niet betrouwbaar gecompileerd.

```tsx
// GOED — werkt altijd
<button
  style={{ backgroundColor: '#3C9A6E', color: 'white' }}
  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#348A5F'}
  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3C9A6E'}
>
  Start coaching
</button>

// FOUT — Tailwind v4 JIT compileert dit niet betrouwbaar
<button className="bg-[#3C9A6E] hover:bg-[#348A5F] text-white">
  Start coaching
</button>
```

### 2. shadcn/ui Button Override

De shadcn/ui `Button` component past standaard `bg-primary` toe, wat inline styles overschrijft. Gebruik native `<button>` elementen wanneer je inline style control nodig hebt.

```tsx
// Gebruik NIET Button van shadcn als je inline kleuren nodig hebt
import { Button } from "@/components/ui/button";
<Button style={{ backgroundColor: '#3C9A6E' }}>...</Button>  // bg-primary wint!

// Gebruik WEL native <button>
<button style={{ backgroundColor: '#3C9A6E' }} className="px-6 py-2 rounded-xl text-white font-medium">
  ...
</button>
```

### 3. hugoApi.ts — Complete API Wrapper

`src/services/hugoApi.ts` is een complete API wrapper die je direct kan hergebruiken. Alle endpoints zitten erin:

- **Chat:** `hugoApi.chat()`, `hugoApi.getSession()`, `hugoApi.listSessions()`
- **Analyse:** `hugoApi.uploadAnalysis()`, `hugoApi.getAnalysisResults()`, `hugoApi.listAnalyses()`
- **User:** `hugoApi.getUserActivity()`, `hugoApi.logActivity()`
- **Admin:** `hugoApi.getConfigReviewQueue()`, `hugoApi.submitCorrection()`

### 4. Admin Detectie — Twee Niveaus

Admin detectie werkt op twee niveaus die je apart moet begrijpen:

| Variabele | Doel | Gebruik |
|-----------|------|---------|
| `isAdmin` | Account permissie check | Bepaalt of een gebruiker admin functies MAG zien |
| `useAdminLayout` | Kleurenschema switch | Bepaalt of de UI paars (#9910FA) of groen (#3C9A6E) toont |

```tsx
// In componenten die admin-aware zijn:
const { isAdmin, useAdminLayout } = useAdminContext();

// Kleur conditie
const ctaColor = useAdminLayout ? '#9910FA' : '#3C9A6E';
const ctaHover = useAdminLayout ? '#7B0DD4' : '#348A5F';
```

### 5. Kleurcodes — STRIKT Gescheiden

| Context | CTA kleur | Hover | Gebruik |
|---------|-----------|-------|---------|
| **User View** | `#3C9A6E` (groen) | `#348A5F` | Alle user-facing knoppen |
| **Admin View** | `#9910FA` (paars) | `#7B0DD4` | Alle admin interactieve elementen |
| **Neutraal** | `#4F7396` (steel blue) | `#3D5F80` | Secundaire/neutrale acties |
| **Ink (tekst)** | `#1F2937` | — | Primaire tekst |
| **Muted** | `#6B7280` | — | Secundaire tekst |
| **Background** | `#F8F9FA` | — | Pagina achtergrond |
| **Surface** | `#FFFFFF` | — | Kaart/card achtergrond |

**CRITICAL:** User groen en Admin paars mogen NOOIT gemixed worden op dezelfde pagina.

### 6. SSOT JSON Bestanden — NOOIT Direct Wijzigen

De JSON bestanden in `config/ssot/` zijn de Single Source of Truth voor de hele applicatie. Wijzigingen moeten via de **Config Review** flow gaan:

1. Admin maakt correctie via UI (pencil buttons)
2. Correctie komt in de review queue
3. Super Admin keurt goed/af
4. Pas NA goedkeuring wordt de SSOT bijgewerkt

### 7. Design Tokens in globals.css

Alle design tokens staan in `src/styles/globals.css` als CSS custom properties:

```css
--hh-bg: #F8F9FA;
--hh-surface: #FFFFFF;
--hh-ink: #1F2937;
--hh-muted: #6B7280;
--hh-border: #E5E7EB;
--hh-purple: #9910FA;     /* Admin alleen */
--hh-green: #3C9A6E;      /* User CTA */
--hh-steel: #4F7396;      /* Neutraal */
```

### 8. Supabase Integratie

De app gebruikt Supabase voor:
- **Auth:** Login, signup, sessie management
- **Database:** Sessions, user context, RAG documents, platform sync
- **SSO:** Handoff tokens voor cross-platform auth

De Supabase client wordt geïnitialiseerd in de frontend en environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) moeten beschikbaar zijn.

### 9. Multi-Modal Chat (Audio/Video)

De `TalkToHugoAI.tsx` component ondersteunt drie modi:
- **Chat:** Standaard text chat
- **Audio:** LiveKit WebRTC + Deepgram STT + ElevenLabs TTS
- **Video:** HeyGen Streaming Avatar

Elke modus heeft eigen API keys nodig (zie environment variables).

### 10. OpenAI Model

Alle AI calls gebruiken **gpt-5.1** via de Replit AI Integrations wrapper. Het model wordt geconfigureerd in de server-side engine files.

---

## Benodigde Environment Variables

```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI (via Replit AI Integrations)
# Automatisch beschikbaar als AI_INTEGRATIONS_OPENAI_API_KEY

# Audio mode
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
LIVEKIT_URL=
DEEPGRAM_API_KEY=
ELEVENLABS_API_KEY=

# Video mode
HEYGEN_API_KEY=

# Database
DATABASE_URL=  # PostgreSQL voor lokale analyses
```

---

## Quick Start voor Ander Project

1. Kopieer de `export/` map naar je nieuwe project
2. Installeer dependencies: `npm install react react-router-dom @radix-ui/react-* lucide-react tailwindcss`
3. Configureer Tailwind CSS v4 met de design tokens uit `globals.css`
4. Zet de environment variables op
5. Import `hugoApi.ts` als je API wrapper
6. Gebruik `AppLayout.tsx` als basis layout (of `AdminLayout.tsx` voor admin)
