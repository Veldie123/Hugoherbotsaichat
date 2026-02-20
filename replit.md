# HugoHerbots.ai Sales Coach App

## Overview
The HugoHerbots.ai Sales Coach App is a React, TypeScript, and Vite-based application designed to revolutionize sales coaching. It offers **Gespreksanalyse (Conversation Analysis)** for uploading and analyzing sales conversations, and **Hugo a.i.**, an AI-powered sales coach providing personalized training and roleplay scenarios. The project aims to provide an intuitive platform for sales professionals to enhance their skills through AI-driven insights and interactive coaching, contributing to business growth and market leadership in AI-driven sales enablement.

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

## System Architecture
The application is built with React 18, TypeScript, and Vite, utilizing Tailwind CSS v4 and Radix UI for custom components. Supabase serves as the Backend-as-a-Service (BaaS) for authentication and database operations. The application integrates the Hugo Engine V2 FULL for advanced AI capabilities.

**UI/UX Decisions:**
- **Design Charter:** Comprehensive design guidelines, color codes, and component styling are documented in `docs/DESIGN_CHARTER.md`.
- **Color Schemes:** Admin view uses purple with green accents; user view uses dark navy blue with primary accents and phase-specific colors for E.P.I.C content.
- **Component Design:** Reusable UI components follow a `shadcn`-style approach for consistency.
- **Navigation:** Single unified sidebar (Grok/ChatGPT-style) with main nav items (Hugo AI, Gespreksanalyse) and contextual sub-items (recent history).
- **Multi-Modal Chat Interface:** Supports chat, audio, and video interactions with distinct visual feedback.
- **Piano Concept (ChatGPT-style UX):** Features a blank slate on first visit, personalized greetings, and an EPIC sidebar hidden by default. The chat interface (`talk-to-hugo`) is the central hub post-login/onboarding.
- **Progressive Unlocking:** Techniques in the Admin view are progressively unlocked with visual cues.
- **SSOT (Single Source of Truth) Architecture:** Core data is managed from centralized JSON/TypeScript files and accessed via service wrappers.

**Technical Implementations:**
- **Frontend Routing:** Managed by React Router.
- **State Management:** Utilizes React Context API.
- **Hugo Engine V2 FULL:**
    - **Architecture:** Frontend (Vite) and Backend API (Express) with Vite proxying.
    - **AI Integration:** OpenAI (gpt-5.1 model) via Replit AI Integrations.
    - **Engine Features:** Nested prompts, RAG grounding, validation loop for response repair, Hugo persona loading, and advanced signal/technique detection.
    - **Session Persistence:** V2 sessions, session artifacts, and user context are stored in **Supabase**.
    - **Database Architecture:** Supabase is the **single source of truth** for all cross-platform data: sessions, user context, RAG documents, SSO tokens.
    - **Engine Components:** Includes `coach-engine.ts`, `context_engine.ts`, `rag-service.ts`, `response-repair.ts`, `content-assets.ts`, `intent-detector.ts`, and `rich-response-builder.ts`.
    - **Session Flow:** Progresses from CONTEXT_GATHERING to COACH_CHAT, with an "Expert mode" option.
- **4-Level Competence Model:** Integrated for difficulty selection in coaching.
- **Analysis System (Phase 1-4 Scoring):**
    - **Phase Coverage:** Comprehensive Phase 1-4 scoring: Phase 1 Opening (15%), Phase 2 EPIC Discovery (40%), Phase 3 Recommendation (25%), Phase 4 Decision (20%).
    - **RAG-Enhanced Evaluation:** Seller turns are batch-processed with semantic RAG search for improved technique recognition. Coach report and debrief prompts are enriched with RAG grounding from Supabase corpus.
    - **SSOT Context Builder:** `server/v2/ssot-context-builder.ts` loads ALL config files (technieken_index, klant_houdingen, customer_dynamics, detectors, persona_templates, video_mapping, coach_overlay_v3_1, rag_heuristics) and injects relevant context into evaluation prompts for Hugo Herbots methodology grounding.
    - **Minimum Turn Threshold:** Chats with < 4 seller turns return a simplified "Oefen verder" view instead of full analysis, with friendly CTA to continue practicing.
    - **Video Recommendations:** Coaching moments (Big Win, Quick Fix, Scharnierpunt) include training video recommendations from `config/video_mapping.json`, matched by recommended technique IDs.
    - **Phase-Aware Signals:** Customer signal detection is constrained to contextually appropriate phases.
    - **AI Model:** All analysis uses gpt-5.1.
    - **Phase Tracking:** `determineCurrentPhase()` helper analyzes detected techniques to determine conversation phase.
    - **Local PostgreSQL Persistence:** Analysis results persist to `conversation_analyses` table in local Replit PostgreSQL.
    - **API Endpoints:** `POST /api/v2/analysis/upload`, `POST /api/v2/analysis/chat-session`, `GET /api/v2/analysis/status/:id`, `GET /api/v2/analysis/results/:id`, `GET /api/v2/analysis/list?userId=`.
    - **Chat Analysis Pipeline:** AI chat sessions (from Supabase v2_sessions) can be analyzed with the same evaluation pipeline as uploaded transcripts via `runChatAnalysis()`. Converts CoachMessage[] (user→seller, assistant→customer) to TranscriptTurn[] format, skipping transcription. Available via "Analyseer Sessie" in session dropdown menus (both admin and user views).
    - **Unified Analysis Navigation:** Clicking any session in Talk to Hugo AI (sidebar history or overview table) navigates to the full AnalysisResults report (same as Gespreksanalyse). Uses `analysisFromHugo` sessionStorage flag to show "Talk to Hugo" context in layout and back navigation. If no analysis exists, auto-triggers one.
    - **Transcript Replay:** Users can hover over any seller bubble in the Transcript tab to see a replay icon, initiating an inline replay with Hugo roleplaying the customer.
- **Multi-modal Integration (Audio/Video):**
    - **Audio Mode:** Uses LiveKit Cloud for WebRTC, Deepgram Nova 3 for STT (Dutch), and ElevenLabs for TTS.
    - **Video Mode:** Uses HeyGen Streaming Avatar SDK for WebRTC video.
    - **Chat Mode Switcher:** Allows dynamic switching between chat, audio, and video modes.

**AI Agent-First Rich Responses:**
- **Rich Content Types:** The `/api/v2/chat` endpoint returns rich content alongside text: video embeds, slide references, webinar links, action buttons, and roleplay proposals.
- **Content Asset Library:** `server/v2/content-assets.ts` maps EPIC techniques to available content assets.
- **Intent Detection:** `server/v2/intent-detector.ts` uses keyword/pattern matching to detect user intent.
- **Rich Response Builder:** `server/v2/rich-response-builder.ts` enriches Hugo's text responses with matched content items, action buttons, and suggestion chips.
- **Shared Types:** `src/types/crossPlatform.ts` contains all shared TypeScript types for cross-platform communication.

**Cross-Platform API Architecture:**
- **API Documentation:** Full endpoint reference in `docs/API_ENDPOINTS_FOR_COM.md` and `docs/ai-platform-stavaza.md`.
- **Cross-Platform Activity Tracking:** `POST /api/v2/user/activity` logs activity; `GET /api/v2/user/activity-summary` fetches user stats.
- **Platform Sync System:** Utilizes a `platform_sync` Supabase table for bidirectional synchronization.
- **SSO Handoff Tokens:** Implements `sso_handoff_tokens` in Supabase for secure cross-platform authentication.

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