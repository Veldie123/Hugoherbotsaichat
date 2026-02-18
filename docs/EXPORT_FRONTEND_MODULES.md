# HugoHerbots.ai — Frontend Modules Export Guide

> **Doel:** Dit document beschrijft alle exporteerbare frontend modules, hun afhankelijkheden, en praktische tips voor hergebruik in een ander project.

## Exportmap Structuur (178 bestanden — VOLLEDIG)

```
export/
├── App.tsx                          # Hoofd app met routing
├── main.tsx                         # Vite entry point
├── vite-env.d.ts                    # Vite type declarations
├── index.html                       # HTML entry
├── package.json                     # Dependencies
├── vite.config.ts                   # Vite configuratie
├── tsconfig.json                    # TypeScript configuratie
├── tailwind.config.ts               # Tailwind configuratie
├── postcss.config.js                # PostCSS configuratie
│
├── components/
│   ├── HH/                          # HugoHerbots custom componenten (39 bestanden)
│   │   ├── TalkToHugoAI.tsx         # Chat interface (chat/audio/video)
│   │   ├── AnalysisResults.tsx      # Gespreksanalyse resultaten (Coach + Transcript)
│   │   ├── Analysis.tsx             # Analyse lijst/overzicht
│   │   ├── AppLayout.tsx            # User layout (sidebar, header, routing)
│   │   ├── AdminLayout.tsx          # Admin layout (paarse kleurschema)
│   │   ├── AdminChatExpertMode.tsx  # Expert modus training
│   │   ├── AdminChatExpertModeSidebar.tsx # Expert modus sidebar
│   │   ├── AdminConfigReview.tsx    # Config review (correcties goedkeuren)
│   │   ├── AdminConflicts.tsx       # Admin conflict resolution
│   │   ├── AdminNotifications.tsx   # Admin notificaties
│   │   ├── AdminRAGReview.tsx       # Admin RAG document review
│   │   ├── AdminSessions.tsx        # Admin sessie overzicht
│   │   ├── AdminUploadManagement.tsx # Admin upload beheer
│   │   ├── About.tsx                # Over ons pagina
│   │   ├── AppFooter.tsx            # Footer component
│   │   ├── AuthCallback.tsx         # Auth callback handler
│   │   ├── ChatBubble.tsx           # Chat bubble component
│   │   ├── HistorySidebar.tsx       # Geschiedenis sidebar
│   │   ├── HugoAIOverview.tsx       # Hugo AI overzichtspagina
│   │   ├── Landing.tsx              # Publieke landingspagina
│   │   ├── LiveAvatarComponent.tsx  # HeyGen video avatar
│   │   ├── Login.tsx                # Login pagina
│   │   ├── Logo.tsx                 # Logo component
│   │   ├── Onboarding.tsx           # Gebruiker onboarding flow
│   │   ├── Pricing.tsx              # Pricing pagina
│   │   ├── PricingTier.tsx          # Pricing tier component
│   │   ├── ProductShowcase.tsx      # Product showcase
│   │   ├── Signup.tsx               # Registratie pagina
│   │   ├── SSOValidate.tsx          # SSO validatie
│   │   ├── StickyBottomCTA.tsx      # Sticky bottom CTA
│   │   ├── StickyHeader.tsx         # Sticky header
│   │   ├── StopRoleplayDialog.tsx   # Roleplay stop bevestiging
│   │   ├── StreakCard.tsx           # Streak/activiteit kaart
│   │   ├── TechniqueCard.tsx        # Techniek kaart component
│   │   ├── TechniqueDetailsDialog.tsx # Techniek details dialog
│   │   ├── TranscriptDialog.tsx     # Transcript weergave dialog
│   │   ├── TranscriptLine.tsx       # Individuele transcript regel
│   │   ├── UploadAnalysis.tsx       # Audio upload voor analyse
│   │   └── UserMenu.tsx             # Gebruikersmenu
│   │
│   └── ui/                          # shadcn/ui componenten (50 bestanden - COMPLEET)
│       ├── accordion, alert, alert-dialog, aspect-ratio, avatar
│       ├── badge, breadcrumb, button, calendar, card, carousel
│       ├── chart, checkbox, collapsible, command, context-menu
│       ├── custom-checkbox, data-table, dialog, drawer
│       ├── dropdown-menu, form, hover-card, input, input-otp
│       ├── label, menubar, navigation-menu, pagination, popover
│       ├── progress, radio-group, resizable, scroll-area, select
│       ├── separator, sheet, sidebar, skeleton, slider, sonner
│       ├── switch, table, tabs, textarea, toggle, toggle-group
│       ├── tooltip, use-mobile.ts, utils.ts
│       └── (alle .tsx bestanden)
│
├── contexts/                        # React Context providers
│   ├── NotificationContext.tsx       # Notificatie systeem
│   └── UserContext.tsx              # Gebruiker context + admin detectie
│
├── services/
│   ├── hugoApi.ts                   # Complete API wrapper voor Hugo Engine V2
│   └── lastActivityService.ts       # Laatste activiteit tracking
│
├── types/
│   └── crossPlatform.ts             # Gedeelde TypeScript types
│
├── utils/
│   ├── displayMappings.ts           # Display name mappings
│   ├── hiddenItems.ts               # Verborgen items configuratie
│   ├── phaseColors.ts               # EPIC fase kleuren
│   ├── storage.ts                   # Local storage helpers
│   └── supabase/                    # Supabase utilities
│
├── supabase/
│   ├── functions/                   # Supabase Edge Functions
│   └── migrations/                  # Database migraties
│
├── styles/
│   └── globals.css                  # Globale CSS met design tokens
│
├── config/
│   └── ssot/                        # Single Source of Truth JSON bestanden
│       ├── coach_overlay.json       # Coach overlay configuratie
│       ├── coach_overlay_v3.json    # Coach overlay v3
│       ├── coach_overlay_v3_1.json  # Coach overlay v3.1 (meest recent)
│       ├── evaluator_overlay.json   # Evaluator configuratie
│       ├── hugo_persona.json        # Hugo persona definitie
│       └── technieken_index.json    # EPIC technieken index
│
└── server/                          # Complete backend (40+ bestanden)
    ├── index.ts                     # Server entry point
    ├── api.ts                       # Express API setup
    ├── routes.ts                    # Route definities
    ├── db.ts                        # Database connectie
    ├── config-loader.ts             # SSOT config loader
    ├── openai.ts                    # OpenAI client
    ├── supabase-client.ts           # Supabase server client
    ├── livekit-agent.ts             # LiveKit audio agent
    ├── elevenlabs-stt.ts            # ElevenLabs STT proxy
    ├── vite.ts                      # Vite dev server integratie
    ├── storage.ts                   # Server-side storage
    ├── state-machine.ts             # Conversatie state machine
    ├── persona-engine.ts            # Persona engine
    ├── hugo-persona-loader.ts       # Hugo persona loader
    ├── prompt-factory.ts            # Prompt factory
    ├── streaming-response.ts        # Streaming response handler
    ├── mode-transitions.ts          # Chat mode transitions
    ├── commitment-detector.ts       # Commitment detectie
    ├── daily-service.ts             # Daily service
    ├── feedback-aggregator.ts       # Feedback aggregator
    ├── houding-selector.ts          # Houding selector
    ├── mux-service.ts               # Mux video service
    ├── ssot-loader.ts               # SSOT loader
    │
    └── v2/                          # Hugo Engine V2 (27 bestanden)
        ├── coach-engine.ts          # Hoofd coach engine
        ├── coach-engine-simple.ts   # Simpele coach variant
        ├── context_engine.ts        # Context engine
        ├── context-engine-simple.ts # Simpele context variant
        ├── context-layers-service.ts # Context layers
        ├── rag-service.ts           # RAG service
        ├── rag-heuristic-tagger.ts  # RAG heuristic tagger
        ├── rag-heuristic-tagger-v2.ts # RAG tagger v2
        ├── rag-techniek-tagger.ts   # RAG techniek tagger
        ├── evaluator.ts             # Gespreksanalyse evaluator
        ├── analysis-service.ts      # Analyse service
        ├── artifact-service.ts      # Artifact service
        ├── response-repair.ts       # Response validatie/reparatie
        ├── response-validator.ts    # Response validator
        ├── content-assets.ts        # Content asset library
        ├── intent-detector.ts       # Intent detectie
        ├── rich-response-builder.ts # Rich response builder
        ├── roleplay-engine.ts       # Roleplay engine
        ├── customer_engine.ts       # Klant simulatie engine
        ├── orchestrator.ts          # Request orchestrator
        ├── router.ts                # V2 API routes
        ├── brief-generator-service.ts # Brief generator
        ├── historical-context-service.ts # Historische context
        ├── methodology-export.ts    # Methodologie export
        ├── performance-tracker.ts   # Performance tracking
        ├── prompt-context.ts        # Prompt context builder
        ├── reference-answers.ts     # Referentie antwoorden
        ├── speech-humanizer.ts      # Speech humanizer
        ├── technique-sequence.ts    # Techniek sequentie
        ├── config-consistency.ts    # Config consistentie check
        └── index.ts                 # V2 entry point
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
