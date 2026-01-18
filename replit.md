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

## Hugo Engine V2 Integration (January 2026)
The Hugo V2 engine has been integrated with a dual-server architecture:

**Architecture:**
- **Frontend:** Vite dev server on port 5000
- **Backend API:** Express server on port 3001
- **Proxy:** Vite forwards `/api/*` requests to the backend

**API Endpoints:**
- `GET /api/health` - Health check
- `GET /api/technieken` - Returns all sales techniques from SSOT config
- `POST /api/v2/sessions` - Creates a new coach/roleplay session
- `POST /api/v2/message` - Sends a message and receives AI response

**Key Files:**
- `server/api.ts` - Express API server with V2 endpoints
- `src/services/hugoApi.ts` - Frontend API service layer
- `config/ssot/technieken_index.json` - Single Source of Truth for techniques
- `config/ssot/coach_overlay.json` - Coach personality overlay
- `config/ssot/evaluator_overlay.json` - Evaluation criteria
- `config/ssot/hugo_persona.json` - Hugo AI persona configuration

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