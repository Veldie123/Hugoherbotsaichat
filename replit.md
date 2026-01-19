# HugoHerbots.ai Sales Coach App

## Overview
The HugoHerbots.ai Sales Coach App is a React, TypeScript, and Vite-based application designed to revolutionize sales coaching. It focuses on two core capabilities: **Gespreksanalyse (Conversation Analysis)**, which allows users to upload and analyze sales conversations, and **Hugo a.i.**, an AI-powered sales coach offering personalized training and roleplay scenarios. The project aims to provide an intuitive and effective platform for sales professionals to enhance their skills, offering significant market potential for improved sales performance through AI-driven insights and interactive coaching.

## User Preferences
- The user prefers to interact with the AI in a conversational manner.
- The user expects clear and concise explanations.
- The user prefers a workflow that supports iterative development and visible progress.
- The user wants the agent to ask for confirmation before making significant architectural or feature changes.
- The user prefers detailed explanations for complex technical decisions.

## System Architecture
The application is built with React 18 and TypeScript, utilizing Vite for fast development and optimized builds. Styling is managed with Tailwind CSS v4 and custom UI components are built using Radix UI. Supabase serves as the backend-as-a-service (BaaS), handling both authentication (Supabase Auth) and database operations.

**UI/UX Decisions:**
- **Color Schemes:**
    - **Admin View:** Dominantly purple (`purple-600`) with green (`hh-success`) accents, featuring checkboxes for selection and prominent action buttons ("Nieuwe X").
    - **User View:** Primarily dark navy blue (`hh-ink: #1E2A3B`) with `hh-primary` (`#6B7A92`) as a secondary accent. Phase-specific colors are used for visual variety in E.P.I.C content (e.g., `emerald-500` for Opening phase). User views are read-only, without edit/delete functionalities.
- **Component Design:** Reusable UI components follow a `shadcn`-style approach. Custom components like `CustomCheckbox` and `TranscriptDialog` enforce consistency.
- **Navigation:** Simplified to two core features in both User and Admin views: 'Gespreksanalyse' and 'Hugo a.i.'.
- **Multi-Modal Chat Interface:** The Hugo a.i. feature supports chat, audio, and video interaction modes, each with distinct visual feedback (e.g., waveform for audio, PiP preview for video).
- **Progressive Unlocking:** In the Admin view for Hugo a.i., techniques are progressively unlocked, indicated by visual cues (🔒 for locked, ✅ for completed).
- **SSOT (Single Source of Truth) Architecture:** Core data like techniques, videos, and live sessions are managed from centralized JSON/TypeScript files and accessed via dedicated service wrappers (`technieken-service.ts`), ensuring data consistency across Admin and User views.

**Technical Implementations:**
- **Frontend Routing:** Managed by React Router within `App.tsx`.
- **State Management:** Utilizes React Context API, e.g., `UserContext`.
- **Utility Functions:** Centralized in the `src/utils/` directory, including Supabase client interactions.

## Hugo Engine V2 FULL Integration (January 2026)
The Hugo V2 FULL engine is now active with advanced AI capabilities:

**Architecture:**
- **Frontend:** Vite dev server on port 5000
- **Backend API:** Express server on port 3001
- **Proxy:** Vite forwards `/api/*` requests to the backend
- **AI Integration:** OpenAI via Replit AI Integrations (gpt-5.1 model)

**Engine Features (V2-FULL):**
- **Nested Prompts:** Multi-layer prompt architecture for nuanced responses
- **RAG Grounding:** Responses grounded in Hugo's training materials via `rag-service.ts`
- **Validation Loop:** Automatic response repair via `response-repair.ts` (max 2 attempts)
- **Hugo Persona SSOT:** Personality loaded from `hugo_persona.json`
- **Detector Patterns:** Advanced signal and technique detection

**API Endpoints (Core):**
- `GET /api/health` - Health check (shows V2-FULL engine status with features)
- `GET /api/technieken` - Returns all sales techniques from SSOT config
- `POST /api/v2/sessions` - Creates a new coach/roleplay session with AI opening message
- `POST /api/v2/message` - Sends a message and receives AI response
- `GET /api/v2/sessions/:id` - Retrieves session state
- `DELETE /api/v2/sessions/:id` - Ends a session

**API Endpoints (Fase 2 - Session Control & Streaming):**
- `GET /api/user/context` - Get user context (sector, product, etc.)
- `POST /api/user/context` - Save/update user context
- `POST /api/session/:id/start-roleplay` - Transition session to ROLEPLAY mode
- `POST /api/session/:id/feedback` - Request mid-session feedback/debrief
- `POST /api/session/:id/evaluate` - Get evaluation scores and recommendations
- `POST /api/session/:id/reset-context` - Reset session to CONTEXT_GATHERING
- `GET /api/session/:id/turns` - Get all conversation turns/history
- `POST /api/session/:id/message/stream` - SSE streaming message endpoint

**V2 FULL Engine Components:**
- `server/v2/coach-engine.ts` - Full coach engine (1071 lines) with nested prompts, RAG, validation
- `server/v2/context_engine.ts` - Slot-based progressive context gathering with BASE_SLOTS and LENS_SLOTS
- `server/v2/rag-service.ts` - RAG service for grounding responses in training materials
- `server/v2/response-repair.ts` - Validation and automatic repair loop
- `server/api.ts` - Express API server with in-memory session storage (2-hour auto-cleanup)

**Session Flow:**
1. Session creation starts in CONTEXT_GATHERING phase
2. Engine uses generateQuestionForSlot() for BASE_SLOTS (sector, product, verkoopkanaal, klant_type, ervaring)
3. After base slots collected, optional LENS_SLOTS may be gathered
4. When isComplete=true, transitions to COACH_CHAT phase
5. Coaching uses generateCoachResponse() with RAG grounding and validation loop
6. Expert mode (isExpert: true) returns debug info: ragDocsFound, wasRepaired, repairAttempts, validatorInfo

**Key Files:**
- `server/api.ts` - Express API server with V2 endpoints
- `server/v2/coach-engine.ts` - Full coaching engine with nested prompts
- `server/v2/context_engine.ts` - Context gathering with slot management
- `src/services/hugoApi.ts` - Frontend API service layer
- `src/utils/displayMappings.ts` - SSOT display translations (backend keys → Dutch labels)
- `config/ssot/technieken_index.json` - Single Source of Truth for techniques
- `config/ssot/coach_overlay.json` - Coach personality overlay
- `config/ssot/evaluator_overlay.json` - Evaluation criteria
- `config/ssot/hugo_persona.json` - Hugo AI persona configuration

**Display Mappings (SSOT):**
The `src/utils/displayMappings.ts` file centralizes all backend-to-frontend translations:
- `buyingClockToDisplay` - Koopklok fases naar Nederlandse labels
- `behaviorStyleToDisplay` - Gedragsstijlen (promoverend, faciliterend, etc.)
- `difficultyLevels` - 4-level competentie model array (see below)
- `buildDebugInfoFromResponse()` - Helper functie voor expert panel debug info

**4-Level Competence Model (January 2026):**
The difficulty selection now uses a 4-level competence model based on learning psychology:
| Key | Short | Label | Description |
|-----|-------|-------|-------------|
| `onbewuste_onkunde` | 1/4 | Onbewust Onbekwaam | Beginner - unaware of gaps |
| `bewuste_onkunde` | 2/4 | Bewust Onbekwaam | Aware of learning needs |
| `bewuste_kunde` | 3/4 | Bewust Bekwaam | Competent with conscious effort |
| `onbewuste_kunde` | 4/4 | Onbewust Bekwaam | Expert - unconscious competence |

- Level 4 (`onbewuste_kunde`) triggers "Expert mode" - no sidebar assistance
- Used in both AdminChatExpertMode and TalkToHugoAI components

**Fase 3 Frontend Integration (January 2026):**
- **Streaming Responses:** SSE-based token-by-token response display in TalkToHugoAI.tsx
- **Session Controls:** Feedback and Evaluate buttons appear during active sessions
- **Auto-scroll:** Scrolls to latest message during streaming
- **Fallback:** Graceful fallback to non-streaming if SSE fails

**Fase 3 Audio/Video Integration (January 2026):**
Multi-modal interaction modes for immersive roleplay training:

*Audio Mode (LiveKit + Deepgram + ElevenLabs):*
- **Architecture:** LiveKit Cloud (WebRTC transport) + Deepgram Nova 3 (STT, Nederlands) + ElevenLabs (TTS only)
- **Backend Endpoints:**
  - `POST /api/livekit/token` - Generates LiveKit room token for voice sessions
  - `WebSocket /ws/scribe` - ElevenLabs Scribe STT proxy (server-side, API key never exposed)
- **LiveKit Agent:** `server/livekit-agent.ts` - Handles voice sessions, routes to V2 Engine for conversation logic
- **STT Service:** `server/elevenlabs-stt.ts` - WebSocket proxy for ElevenLabs Scribe realtime STT
- **Session Flow:** 
  1. Frontend requests token from `/api/livekit/token`
  2. Frontend connects to LiveKit room with token
  3. LiveKit dispatches job to agent
  4. Agent starts V2 session (conversation logic)
  5. Deepgram transcribes user speech → V2 Engine → ElevenLabs TTS
- **ElevenLabs TTS Voice:** `wqDY19Brqhu7UCoLadPh` (Dutch male)
- **Packages:** `livekit-client`, `@livekit/components-react`, `livekit-server-sdk`, `@livekit/agents`, `@livekit/rtc-node`

*Video Mode (HeyGen):*
- **SDK:** `@heygen/streaming-avatar` - StreamingAvatar class for WebRTC video
- **Backend:** `POST /api/heygen/token` - Creates short-lived session tokens from HeyGen API
- **Avatar:** Uses `monica_public_3` (public HeyGen avatar) with AvatarQuality.Medium
- **Events:** AVATAR_START_TALKING, AVATAR_STOP_TALKING, STREAM_READY, STREAM_DISCONNECTED
- **Speaking:** AI responses automatically trigger avatar speech (max 500 chars per utterance)
- **Cleanup:** Proper MediaStream track cleanup on mode switch/unmount

*Chat Mode Switcher:*
- Located in header with icons: MessageCircle (chat), Mic (audio), Video (video)
- Active mode highlighted with visual indicator
- Mode switch triggers initialization of respective SDK session

*Required Secrets:*
- `LIVEKIT_URL` - LiveKit Cloud WebRTC server URL
- `LIVEKIT_API_KEY` - LiveKit API authentication
- `LIVEKIT_API_SECRET` - LiveKit token signing secret
- `ELEVENLABS_API_KEY` - ElevenLabs API key for STT + TTS
- `HEYGEN_API_KEY` - HeyGen API key for avatar streaming

**Workflow:**
- `npm run dev:full` starts both servers concurrently via `concurrently`

**Feature Specifications:**
- **Hugo a.i.:** Provides AI coaching sessions, a chat interface, and roleplay training. Includes multi-modal interaction (chat, audio, video) and an Epic Sales Flow progress bar.
- **Gespreksanalyse:** Allows uploading audio for conversation analysis, with a unified `TranscriptDialog` for displaying analyzed content and AI feedback.
- **Public Pages:** Essential marketing and authentication pages (Landing, Pricing, About, Login, Signup, Onboarding) are maintained for user acquisition and registration.

## External Dependencies
- **Supabase:** Used for user authentication (Supabase Auth) and as a Backend-as-a-Service (BaaS) for database functionalities.
- **Tailwind CSS:** A utility-first CSS framework for styling.
- **Radix UI:** Provides unstyled, accessible components for building high-quality UIs.