# HugoHerbots.ai Sales Coach App

## Overview
The HugoHerbots.ai Sales Coach App is a React, TypeScript, and Vite-based application designed to revolutionize sales coaching. It offers **Gespreksanalyse (Conversation Analysis)** for uploading and analyzing sales conversations, and **Hugo a.i.**, an AI-powered sales coach providing personalized training and roleplay scenarios. The project aims to provide an intuitive platform for sales professionals to enhance their skills through AI-driven insights and interactive coaching.

## User Preferences
- The user prefers to interact with the AI in a conversational manner.
- The user expects clear and concise explanations.
- The user prefers a workflow that supports iterative development and visible progress.
- The user wants the agent to ask for confirmation before making significant architectural or feature changes.
- The user prefers detailed explanations for complex technical decisions.
- **CRITICAL: NEVER change SSOT JSON files** (`config/ssot/*.json`) without FIRST showing the user exactly: (1) what the current value is, (2) what the proposed new value is, and (3) why the change is needed. Wait for explicit approval before making any SSOT changes. This applies to `evaluator_overlay.json`, `technieken_index.json`, `coach_overlay.json`, `coach_overlay_v3.json`, `coach_overlay_v3_1.json`, and `hugo_persona.json`.
- **CRITICAL: VISUELE KWALITEITSCONTROLE — 5-STAPPEN PROCES (VERPLICHT VOOR ELKE WIJZIGING):**
    - **STAP 1: IMPACT ANALYSE** — Voordat je werk oplevert, maak een lijst van ALLE pagina's en states die mogelijk beïnvloed zijn door je wijzigingen. Denk breed: als je een component wijzigt, welke pagina's gebruiken die component? Als je styling aanpast, waar is die styling nog meer zichtbaar?
    - **STAP 2: SCREENSHOT ELKE GETROFFEN PAGINA** — Screenshot ELKE pagina/state uit stap 1. Niet alleen de "hoofd" pagina. Als een pagina alleen bereikbaar is via interactie (klik, modal, dialog), dan MOET je een directe dev URL maken (query param, route) zodat je die state kunt screenshotten. Geen excuses als "ik kan niet klikken via screenshots" — maak de state toegankelijk.
    - **STAP 3: KRITISCHE ANALYSE** — Bekijk elke screenshot alsof je een klant bent die €500/maand betaalt. Check: (a) Spacing en alignment — is alles netjes uitgelijnd? Geen tekst die in elkaar loopt? (b) Typografie — zijn titels, labels, body text consistent en leesbaar? (c) Kleuren en contrast — past alles bij het HugoHerbots design system? (d) Responsiveness — ziet het er professioneel uit? (e) Data presentatie — geen vreemde formatting, afgekapte tekst, lege states? (f) Interactie hints — zijn knoppen, links, hover states duidelijk?
    - **STAP 4: FIX EN HERHAAL** — Als IETS niet aan de €500/maand standaard voldoet, FIX het. Screenshot opnieuw. Herhaal tot je trots zou zijn om dit aan een klant te laten zien.
    - **STAP 5: PAS DAN HANDOFF** — Alleen als ALLE pagina's door stap 3 komen, lever je op. De gebruiker is GEEN screenshot-dienst en GEEN QA-tester.
- **DEV TOEGANG ALTIJD BESCHIKBAAR** — Er is ALTIJD dev toegang via `/_dev/{pagina-naam}` (bijv. `/_dev/analysis`, `/_dev/talk-to-hugo`, `/_dev/analysis-results`). Dit bypass de login. NOOIT zeggen "ik heb geen toegang want er is een login" — gebruik gewoon de dev URL! Voor pagina's die interactie vereisen (bijv. modals, dialogs), voeg query params toe zodat die states direct bereikbaar zijn voor visuele verificatie.

## CRITICAL: Developer Preview Routes for Screenshots
**NEVER screenshot `/` (root URL) - it shows the landing page which requires no auth and is useless for validation.**

The app has built-in developer preview routes that bypass authentication. Use these ALWAYS when taking screenshots to validate UI changes:

**Route pattern:** `/_dev/<page-name>`

**Available pages:**
- `/_dev/analysis-results` - Analysis results page (most common for validation)
- `/_dev/analysis` - Analysis list page
- `/_dev/upload-analysis` - Upload analysis page
- `/_dev/talk-to-hugo` - Hugo AI chat interface
- `/_dev/hugo-overview` - Hugo overview page
- `/_dev/admin-uploads` - Admin upload management
- `/_dev/admin-sessions` - Admin sessions view
- `/_dev/admin-chat-expert` - Admin expert chat mode
- `/_dev/admin-config-review` - Admin config review
- `/_dev/admin-notifications` - Admin notifications
- `/_dev/admin-rag-review` - Admin RAG review
- `/_dev/landing` - Landing page (only if specifically testing landing)
- `/_dev/login` - Login page
- `/_dev/signup` - Signup page
- `/_dev/pricing` - Pricing page
- `/_dev/about` - About page
- `/_dev/onboarding` - Onboarding page

**Implementation:** Defined in `src/App.tsx` in the `DEV_PREVIEW_PAGES` map. The `getDevPreviewPage()` function reads the URL path and bypasses auth when a `/_dev/` prefix is detected.

**Rule:** When validating UI changes, ALWAYS use the appropriate `/_dev/<page>` path. For analysis work, use `/_dev/analysis-results`. For Hugo chat, use `/_dev/talk-to-hugo`. NEVER use `/` unless specifically testing the landing page.

## System Architecture
The application is built with React 18, TypeScript, and Vite, utilizing Tailwind CSS v4 and Radix UI for custom components. Supabase serves as the Backend-as-a-Service (BaaS) for authentication and database operations. The application integrates the Hugo Engine V2 FULL for advanced AI capabilities.

**UI/UX Decisions:**
- **Design Charter:** Comprehensive design guidelines, color codes, and component styling are documented in `docs/DESIGN_CHARTER.md`.
- **Color Schemes:** Admin view uses purple with green accents; user view uses dark navy blue with primary accents and phase-specific colors for E.P.I.C content.
- **Component Design:** Reusable UI components follow a `shadcn`-style approach for consistency.
- **Navigation:** Single unified sidebar (Grok/ChatGPT-style) with main nav items (Hugo AI, Gespreksanalyse) and contextual sub-items (recent history) that appear when a section is active. Replaces the old two-sidebar pattern. HistorySidebar component is deprecated; history is now integrated into AppLayout.
- **Multi-Modal Chat Interface:** Supports chat, audio, and video interactions with distinct visual feedback.
- **Piano Concept (ChatGPT-style UX):** Features a blank slate on first visit, personalized greetings, and an EPIC sidebar hidden by default. The chat interface (`talk-to-hugo`) is the central hub post-login/onboarding.
- **Cross-Platform Activity Tracking:** An API endpoint (`/api/v2/user/activity-summary`) fetches user activity from Supabase, with a local storage fallback.
- **Cross-Platform API Endpoints:** Standardized `POST /api/v2/chat` for RAG and AI coaching, and `GET /api/v2/user/activity-summary` for activity tracking, with CORS enabled for all origins.
- **Platform Sync System:** Utilizes a `platform_sync` Supabase table for bidirectional synchronization between the `.com` and `.ai` platforms, managed via dedicated API endpoints.
- **SSO Handoff Tokens:** Implements `sso_handoff_tokens` in Supabase for secure cross-platform authentication, with API endpoints for token generation, validation, and cleanup.
- **HistorySidebar Component:** A floating overlay panel triggered by an icon, displaying recent items and KPI stats.
- **Progressive Unlocking:** Techniques in the Admin view are progressively unlocked with visual cues.
- **SSOT (Single Source of Truth) Architecture:** Core data is managed from centralized JSON/TypeScript files and accessed via service wrappers.

**Technical Implementations:**
- **Frontend Routing:** Managed by React Router.
- **State Management:** Utilizes React Context API.
- **Hugo Engine V2 FULL:**
    - **Architecture:** Frontend (Vite) and Backend API (Express) with Vite proxying.
    - **AI Integration:** OpenAI (gpt-5.1 model) via Replit AI Integrations.
    - **Engine Features:** Nested prompts, RAG grounding, validation loop for response repair, Hugo persona loading, and advanced signal/technique detection.
    - **Session Persistence:** V2 sessions (`v2_sessions`), session artifacts (`session_artifacts`), and user context (`user_context`) are stored in **Supabase** (shared with .com platform).
    - **Database Architecture:** Supabase is the **single source of truth** for all cross-platform data: sessions, user context, RAG documents, SSO tokens. Local PostgreSQL only used for legacy/platform-specific data.
    - **Engine Components:** Includes `coach-engine.ts`, `context_engine.ts`, `rag-service.ts`, `response-repair.ts`, `content-assets.ts`, `intent-detector.ts`, and `rich-response-builder.ts`.
    - **Session Flow:** Progresses from CONTEXT_GATHERING to COACH_CHAT, with an "Expert mode" option.
- **4-Level Competence Model:** Integrated for difficulty selection in coaching, mapping to `onbewuste_onkunde`, `bewuste_onkunde`, `bewuste_kunde`, `onbewuste_kunde`.
- **Analysis System (Phase 1-4 Scoring):**
    - **Phase Coverage:** Replaced E/P/I/C-only scoring with comprehensive Phase 1-4 scoring: Phase 1 Opening (15%), Phase 2 EPIC Discovery (40%), Phase 3 Recommendation (25%), Phase 4 Decision (20%).
    - **RAG-Enhanced Evaluation:** Seller turns are batch-processed (6 turns) with semantic RAG search (8 documents, threshold 0.25) for improved technique recognition.
    - **Phase-Aware Signals:** Customer signal detection (`twijfel`, `bezwaar`, `uitstel`) is constrained to contextually appropriate phases - filtered out in Phase 1 to prevent false positives.
    - **AI Model:** All analysis uses gpt-5.1 for quality (diarization, evaluation, signal detection, report generation).
    - **Phase Tracking:** `determineCurrentPhase()` helper analyzes detected techniques to determine conversation phase. Phase badges and dividers shown in transcript view.
    - **Local PostgreSQL Persistence:** Analysis results persist to `conversation_analyses` table in local Replit PostgreSQL (id, user_id, title, status, error, result JSONB, created_at, completed_at). Status updates at each pipeline stage. In-memory Maps kept as cache, local PG as persistent store. Table auto-created on startup if missing.
    - **API Endpoints:** `POST /api/v2/analysis/upload` (upload + start), `GET /api/v2/analysis/status/:id`, `GET /api/v2/analysis/results/:id`, `GET /api/v2/analysis/list?userId=` (list all with summary data).
    - **Frontend:** Analysis.tsx (user) and AdminUploadManagement.tsx (admin) fetch real data from `/api/v2/analysis/list` with 10s polling. Empty state with upload CTA when no analyses exist.
- **Multi-modal Integration (Audio/Video):**
    - **Audio Mode:** Uses LiveKit Cloud for WebRTC, Deepgram Nova 3 for STT (Dutch), and ElevenLabs for TTS. Includes a `speech-humanizer.ts` for natural speech output.
    - **Video Mode:** Uses HeyGen Streaming Avatar SDK for WebRTC video.
    - **Chat Mode Switcher:** Allows dynamic switching between chat, audio, and video modes.

**AI Agent-First Rich Responses:**
- **Rich Content Types:** The `/api/v2/chat` endpoint returns rich content alongside text: video embeds (Mux playback IDs), slide references, webinar links, action buttons, and roleplay proposals.
- **Content Asset Library:** `server/v2/content-assets.ts` maps EPIC techniques to available content assets (videos, slides, webinars). Loads from Supabase `videos` table + static technique mappings.
- **Intent Detection:** `server/v2/intent-detector.ts` uses keyword/pattern matching (Dutch) to detect user intent: learn, practice, review, explore. Triggers content suggestions based on context.
- **Rich Response Builder:** `server/v2/rich-response-builder.ts` enriches Hugo's text responses with matched content items, action buttons, and suggestion chips.
- **Shared Types:** `src/types/crossPlatform.ts` contains all shared TypeScript types for cross-platform communication.

**Cross-Platform API Architecture:**
- **API Documentation:** Full endpoint reference in `docs/API_ENDPOINTS_FOR_COM.md`. Cross-platform stavaza in `docs/ai-platform-stavaza.md`.
- **Cross-Platform Activity Tracking:** An API endpoint (`/api/v2/user/activity`) logs user activity from both platforms, and (`/api/v2/user/activity-summary`) fetches user stats for personalized Hugo greetings.
- **Cross-Platform API Endpoints:** Standardized `POST /api/v2/chat` for RAG and AI coaching with rich content, and `GET /api/v2/user/activity-summary` for activity tracking, with CORS enabled for all origins.
- **Platform Sync System:** Utilizes a `platform_sync` Supabase table for bidirectional synchronization between the `.com` and `.ai` platforms, managed via dedicated API endpoints.
- **SSO Handoff Tokens:** Implements `sso_handoff_tokens` in Supabase for secure cross-platform authentication, with API endpoints for token generation, validation, and cleanup.

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