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
| DEBUG-INFO-UITBREIDEN | src/components/HH/TranscriptDialog.tsx | Pending |
| GOLDEN-STANDARD-OPSLAG | server/v2/reference-answers.ts | Pending |
| GOLDEN-STANDARD-CONFLICTS | server/v2/config-consistency.ts | Pending |
| ADMIN-CONFLICTS-PAGE | src/components/HH/AdminConflicts.tsx | Pending |
| FEW-SHOT-LEARNING | server/v2/coach-engine.ts | Pending |

**Afgeronde TODO's:**
| TODO ID | Bestand | Status |
|---------|---------|--------|
| WITTE-TEKST-FIX | src/components/HH/AdminChatExpertMode.tsx | Done (text-slate-800 toegevoegd) |
| HEYGEN-LIVEAVATAR | src/components/HH/LiveAvatarComponent.tsx | Done |
| RAG-DATABASE-FIX | server/v2/rag-service.ts | Done |
| RAG-CORPUS-VULLEN | server/v2/rag-service.ts | Done |
| ROLEPLAY-API-ENDPOINTS | server/api.ts | Done |
| HISTORICAL-CONTEXT-ACTIVEREN | server/v2/historical-context-service.ts | Done |
| DATABASE-SCHEMA-CHECK | server/db.ts | Done