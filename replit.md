# HugoHerbots.ai Sales Coach App

## Overview
The HugoHerbots.ai Sales Coach App is a React, TypeScript, and Vite-based application designed to revolutionize sales coaching. It offers **Gespreksanalyse (Conversation Analysis)** for uploading and analyzing sales conversations, and **Hugo a.i.**, an AI-powered sales coach providing personalized training and roleplay scenarios. The project aims to provide an intuitive platform for sales professionals to enhance their skills through AI-driven insights and interactive coaching.

## User Preferences
- The user prefers to interact with the AI in a conversational manner.
- The user expects clear and concise explanations.
- The user prefers a workflow that supports iterative development and visible progress.
- The user wants the agent to ask for confirmation before making significant architectural or feature changes.
- The user prefers detailed explanations for complex technical decisions.

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
    - **Engine Components:** Includes `coach-engine.ts`, `context_engine.ts`, `rag-service.ts`, and `response-repair.ts`.
    - **Session Flow:** Progresses from CONTEXT_GATHERING to COACH_CHAT, with an "Expert mode" option.
- **4-Level Competence Model:** Integrated for difficulty selection in coaching, mapping to `onbewuste_onkunde`, `bewuste_onkunde`, `bewuste_kunde`, `onbewuste_kunde`.
- **Multi-modal Integration (Audio/Video):**
    - **Audio Mode:** Uses LiveKit Cloud for WebRTC, Deepgram Nova 3 for STT (Dutch), and ElevenLabs for TTS. Includes a `speech-humanizer.ts` for natural speech output.
    - **Video Mode:** Uses HeyGen Streaming Avatar SDK for WebRTC video.
    - **Chat Mode Switcher:** Allows dynamic switching between chat, audio, and video modes.

**Cross-Platform API Architecture:**
- **API Documentation:** Full endpoint reference in `docs/API_ENDPOINTS_FOR_COM.md`.
- **Cross-Platform Activity Tracking:** An API endpoint (`/api/v2/user/activity`) logs user activity from both platforms, and (`/api/v2/user/activity-summary`) fetches user stats for personalized Hugo greetings.
- **Cross-Platform API Endpoints:** Standardized `POST /api/v2/chat` for RAG and AI coaching, and `GET /api/v2/user/activity-summary` for activity tracking, with CORS enabled for all origins.
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