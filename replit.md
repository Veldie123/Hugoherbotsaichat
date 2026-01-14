# HugoHerbots.ai Sales Coach App

## Overview
A sales coaching application built with React, TypeScript, and Vite. The app provides AI-based sales training, coaching, and analytics features. It connects to Supabase for authentication and data management.

## Project Architecture
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6.x
- **Styling**: Tailwind CSS v4 (pre-compiled CSS)
- **UI Components**: Radix UI components with custom styling
- **Authentication**: Supabase Auth
- **Backend**: Supabase (BaaS)

## Project Structure
```
src/
├── assets/           # Static assets (images)
├── components/
│   ├── figma/        # Figma-generated components
│   ├── HH/           # Main application components
│   └── ui/           # Reusable UI components (shadcn-style)
├── contexts/         # React contexts (UserContext)
├── utils/            # Utility functions
│   └── supabase/     # Supabase client and API functions
├── App.tsx           # Main app component with routing
├── main.tsx          # Entry point
└── index.css         # Global styles (Tailwind CSS)
```

## Key Components
- **Landing**: Public landing page
- **Dashboard**: User dashboard after login
- **Admin***: Admin panel components
- **RolePlay**: Sales roleplay training
- **DigitalCoaching**: AI coaching features
- **VideoLibrary**: Video-based learning

## Development
- **Dev Server**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build` (outputs to /build)

## Configuration
- Vite is configured to allow all hosts for Replit proxy compatibility
- Uses path aliases (@/ maps to src/)

## UI Consistency Standards
- **CustomCheckbox**: Shared component at `src/components/ui/custom-checkbox.tsx` with border-2 styling, purple-600 when checked
- **Table headers**: Use `text-hh-text font-semibold` for consistent styling
- **KPI values**: Use `text-hh-text` (black) instead of green
- **Badge patterns**: Semantic coloring (success/error/warning/info) with bg-color/10 text-color border-color/20

## Recent Changes
- 2026-01-14: Hugo a.i. User View Flow Redesign
  - Created HugoAIOverview.tsx as landing page for Hugo a.i. in User View
    - 4 KPI cards: Total Sessies, Excellent Quality, Gem. Score, Needs Improvement
    - Search & filter bar with Type/Quality dropdowns and List/Grid toggle
    - Sessions table with user's chat history (read-only, no admin features)
    - "Talk to Hugo a.i." button navigates to chat interface
  - Updated EPICSidebar (AdminChatExpertModeSidebar.tsx) for User View colors
    - isUserView prop controls purple vs hh-ink color scheme
    - Replaced "Totale voortgang" with "Epic Sales Flow" progress bar (5 fases)
  - Fixed Admin View link disappearing when Hugo a.i. page opened
  - Navigation flow: Sidebar "Hugo a.i." → hugo-overview → "Talk to Hugo" → talk-to-hugo (collapsed sidebar)
- 2026-01-14: Removed "Fase" section and "Geselecteerde techniek" indicator from chat interface
- 2026-01-13: E.P.I.C Card Click to Open Details Dialog
  - Cards in grid view are now clickable to open TechniqueDetailsDialog
  - Dialog shows ALL data from technieken_index.json (nummer, naam, fase, tags, doel, hoe, stappenplan, voorbeeld)
  - Added "Voorbeelden" section with green styling to TechniqueDetailsDialog
  - Admin view: dialog is editable (isEditable=true)
  - User view: dialog is read-only (isEditable=false)
  - Applied to both TechniqueLibrary.tsx and AdminTechniqueManagement.tsx
- 2026-01-13: Content Data Consolidation + E.P.I.C Grid Navigation
  - Created `src/data/content-items.ts` as shared data source for all content (videos, scenarios, live, documents)
  - Library.tsx and AdminContentLibrary.tsx now import from same source
  - Replaced "Actief" badge in E.P.I.C grid view with 3 navigation buttons:
    - Chat (navigates to Hugo a.i. with technique context)
    - Video (navigates to Videos with technique filter)
    - Webinar (navigates to Webinars with technique filter)
  - Uses localStorage to pass technique context between pages
  - Applied to both TechniqueLibrary.tsx (User) and AdminTechniqueManagement.tsx (Admin)
- 2026-01-13: User View Data Consistency Update
  - Removed "Aanbevolen door Hugo" section from Library.tsx and RolePlayOverview.tsx
  - Replaced "Start" button with dropdown menu (Bekijk details, Start oefening)
  - User View now mirrors Admin View data structure exactly
  - Principle: User View = Admin View data with read-only UI (no edit/delete/create)
- 2026-01-13: TalkToHugoAI Chat Interface Redesign
  - Created new TalkToHugoAI.tsx based on AdminChatExpertMode but for User View
  - Archived original as TalkToHugoAI_V0.tsx
  - Removed admin-only features:
    - "Start Opname" / "Stop Opname" recording buttons
    - "V2 Roleplay - Explore" title and "Training AI Model" subtitle
    - Debug panel (Klant Signaal, Persona, Context, Customer Dynamics, AI Beslissingen)
    - Yellow warning "Selecteer eerst een techniek uit de sidebar..."
    - "Bewerken" button in technique details dialog
  - Changed colors from purple to hh-ink/hh-primary
  - Uses AppLayout with currentPage="talk-to-hugo"
  - Added isUserView prop to EPICSidebar to hide admin header
- 2026-01-13: COMPLETE User View Redesign (Admin Layout Pattern) - Phase 2
  - Redesigned remaining sidebar pages to match Admin layout structure
  - Components redesigned in Phase 2:
    - **TeamSessions.tsx**: Team overview with member stats, avg score, sessions (currentPage="team")
    - **Analytics.tsx**: Analytics & voortgang with skills breakdown, scenario performance, weekly trends
    - **Library.tsx**: Scenario bibliotheek with sortable table, Start button actions
    - **Help.tsx**: Comprehensive Help Center with 12 FAQs, categories, contact support
    - **Resources.tsx**: Downloads page with 4 KPI cards, sortable table, type filters
  - All archived to *_V0.tsx versions
  - Fixed Library.tsx: removed admin dropdown menus, replaced with simple Start button
- 2026-01-13: MAJOR User View Redesign (Admin Layout Pattern) - Phase 1
  - Complete redesign of main User View pages to match Admin layout structure
  - Archived original components as *_V0.tsx (TechniqueLibrary_V0, VideoLibrary_V0, etc.)
  - New components follow Admin pattern: 4 KPI cards → Search/Filter bar → List/Grid toggle → Data table/cards
  - All use SSOT (technieken-service) for data consistency
  - Components redesigned:
    - **TechniqueLibrary.tsx**: E.P.I.C Technieken with sortable table, grid view, technique details dialog
    - **VideoLibrary.tsx**: Video library with watch status, progress tracking, duration stats
    - **LiveCoaching.tsx**: Webinar overview with registration, attendance stats (currentPage="live")
    - **RolePlayOverview.tsx**: Scenario bibliotheek with favorites, difficulty levels, category filters
    - **Analysis.tsx**: Gespreksanalyse with upload CTA, conversation records, technique usage tracking
  - Color scheme: hh-ink (#1E2A3B) dominant, hh-primary (#6B7A92) secondary
  - Admin features removed: no checkboxes, no edit/delete, no "Nieuwe X" buttons
- 2026-01-13: User View Color Scheme Refinement
  - Established hh-ink (dark navy #1E2A3B) as dominant color for all User Views
  - hh-primary (#6B7A92) as secondary color for accents
- 2026-01-13: Dashboard Refactor
  - Added 4 KPI cards (Video's bekeken, Live sessies, Analyses, AI Chats)
  - Renamed Digital Coaching → Video, Live Coaching → Webinar
  - Added Chat met Hugo a.i. and Gespreksanalyse action cards
  - Now has 4 main action cards in 2x2 grid layout
- 2026-01-13: Created TechniqueLibrary.tsx
  - New User View component for E.P.I.C Technieken
  - Follows Admin layout pattern (4 KPI cards, search, filters, list/grid toggle)
  - Read-only: no checkboxes, no edit/delete buttons, no "Nieuwe Techniek" button
  - Uses hh-primary (steel blue) color scheme instead of purple
  - Actions: Bekijk details, Bekijk Video's, Speel Rollenspel
- 2026-01-13: UI Consistency Updates
  - Standardized table header styling across AdminTechniqueManagement, AdminDashboard, AdminBilling, AdminOrganizationManagement
  - Fixed TechniqueDetailsDialog type interface (naam instead of name property)
  - Unified CustomCheckbox usage across all admin pages
  - Standardized KPI value colors and badge patterns
- 2026-01-13: Initial Replit setup
  - Configured Vite for Replit (port 5000, allowedHosts)
  - Added TypeScript configuration
  - Created missing component stubs (Help, Coaching, RolePlayOverview, Analysis)

## User View vs Admin View Design Pattern
- **Admin View**: Purple (purple-600) as dominant + green (hh-success) as accent, checkboxes for selection, edit/delete buttons, "Nieuwe X" buttons
- **User View**: Dark navy blue (hh-ink: #1E2A3B) as dominant + phase-colored accents for visual variety
  - Dominant actions (view toggle, code badges, active sort icons): hh-ink
  - Phase-specific colors for visual hierarchy in E.P.I.C content
  - No checkboxes, read-only detail dialogs, action buttons for viewing/playing content

## Color Tokens (User View)
- **hh-ink** (#1E2A3B): Dominant - buttons, active states, badges, main icons
- **hh-primary** (#6B7A92): Secondary - supporting icons, subtle backgrounds, secondary info
- **hh-success**: Positive metrics, active status
- **hh-muted**: Secondary text, descriptions
- **hh-text**: Primary text content

## Phase Colors (Shared between Admin and User View)
Used for E.P.I.C Sales Flow phases to add visual variety:
- **Phase 0 (Voorbereiding)**: slate-500/100 - Preparation phase
- **Phase 1 (Opening)**: emerald-500/100 - Opening phase  
- **Phase 2 (Ontdekking)**: blue-500/100 - Discovery phase
- **Phase 3 (Voorstel)**: amber-500/100 - Proposal phase
- **Phase 4 (Afsluiting)**: purple-500/100 - Closing phase

This creates consistent visual hierarchy in:
- Epic Sales Flow progress bars
- Phase number badges in sidebar
- Technique badges in tables
- Calendar session indicators

## SSOT Architecture (Single Source of Truth)

### Technieken SSOT
- **Source File**: `src/data/technieken_index.json` - Contains all Hugo's verkooptechnieken
- **Service**: `src/data/technieken-service.ts` - TypeScript wrapper with typed helpers
- **Used by**: AdminTechniqueManagement.tsx, TechniqueLibrary.tsx
- **Key Functions**:
  - `getAllTechnieken()` - Get all techniques
  - `getTechniekByNummer(nummer)` - Get by nummer (e.g., "2.1.1")
  - `getTechniekenByFase(fase)` - Get techniques for a specific fase
  - `getFaseNaam(fase)` - Get Dutch fase name
  - `searchTechnieken(query)` - Search by naam, nummer, tags, themas

### Videos SSOT
- **Source File**: `src/data/videos-data.ts` - Contains all video content
- **Exports**: `videos` array and `VideoItem` interface
- **Used by**: AdminVideoManagement.tsx, VideoLibrary.tsx
- **Fields**: id, title, techniqueNumber, fase, niveau, duration, views, completion, status, thumbnail, uploadDate

### Live Sessions (Webinars) SSOT
- **Source File**: `src/data/live-sessions-data.ts` - Contains all webinar/live session data
- **Exports**: `liveSessions` array and `LiveSession` interface
- **Used by**: AdminLiveSessions.tsx, LiveCoaching.tsx
- **Fields**: id, techniqueNumber, title, fase, date, time, duration, status, attendees, maxAttendees, platform, recording, description

### SSOT Principle
- Admin View and User View MUST import from the SAME data source
- When data changes in the shared source, both views update automatically
- Never hardcode data arrays directly in component files
