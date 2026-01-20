# HugoHerbots.ai Sales Coach App - Compressed

## Overview
The HugoHerbots.ai Sales Coach App is a React, TypeScript, and Vite-based application designed to revolutionize sales coaching. Its core capabilities include **Gespreksanalyse (Conversation Analysis)** for uploading and analyzing sales conversations, and **Hugo a.i.**, an AI-powered sales coach offering personalized training and roleplay scenarios. The project aims to provide an intuitive platform for sales professionals to enhance their skills through AI-driven insights and interactive coaching.

## User Preferences
- The user prefers to interact with the AI in a conversational manner.
- The user expects clear and concise explanations.
- The user prefers a workflow that supports iterative development and visible progress.
- The user wants the agent to ask for confirmation before making significant architectural or feature changes.
- The user prefers detailed explanations for complex technical decisions.

## System Architecture
The application is built with React 18, TypeScript, and Vite. Styling uses Tailwind CSS v4, and custom UI components are built with Radix UI. Supabase serves as the Backend-as-a-Service (BaaS) for authentication and database operations. The application integrates the Hugo Engine V2 FULL for advanced AI capabilities.

**UI/UX Decisions:**
- **Color Schemes:** Admin view uses purple (`purple-600`) with green (`hh-success`) accents. User view uses dark navy blue (`hh-ink: #1E2A3B`) with `hh-primary` (`#6B7A92`) accents and phase-specific colors for E.P.I.C content.
- **Component Design:** Reusable UI components follow a `shadcn`-style approach, ensuring consistency.
- **Navigation:** Simplified to 'Gespreksanalyse' and 'Hugo a.i.'.
- **Multi-Modal Chat Interface:** Supports chat, audio, and video interactions with distinct visual feedback.
- **Progressive Unlocking:** Techniques in the Admin view for Hugo a.i. are progressively unlocked with visual cues.
- **SSOT (Single Source of Truth) Architecture:** Core data is managed from centralized JSON/TypeScript files and accessed via service wrappers.

**Technical Implementations:**
- **Frontend Routing:** Managed by React Router.
- **State Management:** Utilizes React Context API.
- **Utility Functions:** Centralized in `src/utils/`.
- **Hugo Engine V2 FULL:**
    - **Architecture:** Frontend (Vite on port 5000), Backend API (Express on port 3001), with Vite proxying `/api/*` requests.
    - **AI Integration:** OpenAI (gpt-5.1 model) via Replit AI Integrations.
    - **Engine Features:** Nested prompts, RAG grounding, validation loop for response repair, Hugo persona loaded from `hugo_persona.json`, and advanced signal/technique detection.
    - **API Endpoints:** Comprehensive set for health checks, sales techniques, session management (create, message, retrieve, delete), user context, roleplay control, feedback, evaluation, session reset, conversation history, and streaming messages.
    - **Session Persistence:** V2 sessions and user context are saved to PostgreSQL tables (`v2_sessions`, `user_context`).
    - **Engine Components:** `coach-engine.ts` (full coach engine), `context_engine.ts` (slot-based context gathering), `rag-service.ts` (RAG for grounding), `response-repair.ts` (validation and repair).
    - **Session Flow:** Starts with CONTEXT_GATHERING, progresses through slot collection, then to COACH_CHAT, with an "Expert mode" option providing debug information.
- **4-Level Competence Model:** Integrated for difficulty selection in coaching, mapping to `onbewuste_onkunde`, `bewuste_onkunde`, `bewuste_kunde`, `onbewuste_kunde`. Level 4 activates "Expert mode" without sidebar assistance.
- **Multi-modal Integration (Audio/Video):**
    - **Audio Mode:** Uses LiveKit Cloud for WebRTC, Deepgram Nova 3 for STT (Dutch), and ElevenLabs for TTS. Backend includes `livekit-agent.ts` and `elevenlabs-stt.ts` (WebSocket proxy).
    - **Video Mode:** Uses HeyGen Streaming Avatar SDK for WebRTC video, with custom or fallback avatars.
    - **Chat Mode Switcher:** Allows dynamic switching between chat, audio, and video modes.

**Feature Specifications:**
- **Hugo a.i.:** AI coaching, chat interface, roleplay training, multi-modal interaction, and Epic Sales Flow progress.
- **Gespreksanalyse:** Audio upload for conversation analysis with a unified `TranscriptDialog`.
- **Public Pages:** Landing, Pricing, About, Login, Signup, Onboarding pages for user acquisition.

## External Dependencies
- **Supabase:** User authentication and database (BaaS).
- **Tailwind CSS:** Utility-first CSS framework.
- **Radix UI:** Unstyled, accessible UI components.
- **OpenAI:** AI model (gpt-5.1) for Hugo Engine V2.
- **LiveKit Cloud:** WebRTC transport for audio mode.
- **Deepgram Nova 3:** Speech-to-Text (STT) for audio mode.
- **ElevenLabs:** Text-to-Speech (TTS) and STT proxy for audio mode.
- **HeyGen:** Streaming Avatar SDK for video mode.

## TODO Tracking

Gebruik `./scripts/list-todos.sh` om alle TODO's in de codebase te vinden.

**Huidige TODO's (januari 2026):**
| TODO ID | Bestand | Status |
|---------|---------|--------|
| (geen actieve TODO's) | - | - |

**V3 Orchestration Model (januari 2026):**
- **V3.0 Gate System**: 4 gate types control roleplay access (technique, context, artifact, phase)
- **V3.1 Artifacts Storage**: `session_artifacts` table with 3 types (scenario_snapshot, discovery_brief, offer_brief)
  - CRUD service: `server/v2/artifact-service.ts`
  - API endpoints: POST/GET /api/v2/artifacts/*
  - Config: `config/ssot/coach_overlay_v3_1.json` (met roleplay_unlock en sequence_policy)
- **V3.2 Extended Context Layers**: `server/v2/context-layers-service.ts`
  - 6 layer types: base, scenario, value_map, objection_bank, positioning_map, offer_map
  - Thin-slice approach: elke layer heeft minimum vs nice-to-have slots
  - positioning_map: sterktes, zwaktes, afhaakredenen (terecht/onterecht), concurrenten, differentiators
  - offer_map: oplossing_kern, voordelen, bewijsvoering, prijsrange, next_step_menu
- **V3.3-V3.5 Brief Generation**: `server/v2/brief-generator-service.ts`
  - discovery_brief: Summary after phase 2 (Explore/Probe/Impact)
  - offer_brief: Summary after phase 3 (Recommend)
  - API endpoints: POST /api/v2/briefs/discovery, /api/v2/briefs/offer
  - Context endpoints: POST /api/v2/context/build, /api/v2/context/snapshot
- **V3.6 Flow Rules & Roleplay Unlock**:
  - FLOW_RULES: max 2 opeenvolgende vragen, context budget 5 per sessie
  - roleplay_unlock: capstones pas na prerequisites (bijv. fase 2 pas na 2.1-2.4)
  - sequence_policy: ranking micro → drill → integrated
  - API endpoints: POST /api/v2/roleplay/unlock-check, GET /api/v2/context/flow-rules

**Recent Toegevoegd (januari 2026):**
- **TranscriptDialog Golden Standard Integratie**: Uitgebreid debug paneel met bewerkfunctionaliteit
  - ✓ Validatieknoppen (✓/✗) per transcript bericht voor admin review
  - ✓ Bewerkknop opent edit mode met dropdowns voor signaal, verwachte techniek, gedetecteerde techniek
  - ✓ Feedback input formulier voor het flaggen van incorrecte responses
  - ✓ Koppeling naar save-reference en flag-customer-response APIs
  - ✓ Toast notificaties voor succes/fout feedback
  - ✓ Visuele indicators (ring borders) voor gevalideerde/geflagde berichten
- **Golden Standard Frontend Koppeling**: AdminChatExpertMode.tsx nu gekoppeld aan backend APIs
  - ✓ knop roept `/api/v2/session/save-reference` aan om antwoord als golden standard op te slaan
  - ✗ + feedback roept `/api/v2/session/flag-customer-response` aan voor conflict analyse
  - Beide seller (Hugo) en AI (klant) berichten ondersteunen validatie

**Afgeronde TODO's:**
| TODO ID | Bestand | Status |
|---------|---------|--------|
| DEBUG-INFO-UITBREIDEN | src/components/HH/TranscriptDialog.tsx | Done (complete met Golden Standard integratie) |
| GOLDEN-STANDARD-OPSLAG | server/v2/reference-answers.ts | Done (complete opslag + learning) |
| GOLDEN-STANDARD-CONFLICTS | server/v2/config-consistency.ts | Done (834 regels conflict analyse) |
| ADMIN-CONFLICTS-PAGE | client/src/pages/admin-conflicts.tsx | Done (patch review UI) |
| FEW-SHOT-LEARNING | server/v2/reference-answers.ts | Done (getExamplesForTechnique()) |
| WITTE-TEKST-FIX | src/components/HH/AdminChatExpertMode.tsx | Done (text-slate-800 toegevoegd) |
| HEYGEN-LIVEAVATAR | src/components/HH/LiveAvatarComponent.tsx | Done |
| RAG-DATABASE-FIX | server/v2/rag-service.ts | Done |
| RAG-CORPUS-VULLEN | server/v2/rag-service.ts | Done (559 documenten geïndexeerd) |
| ROLEPLAY-API-ENDPOINTS | server/api.ts | Done |
| HISTORICAL-CONTEXT-ACTIVEREN | server/v2/historical-context-service.ts | Done |
| DATABASE-SCHEMA-CHECK | server/db.ts | Done