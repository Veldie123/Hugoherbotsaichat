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
- 2026-01-13: User View Color Scheme Refinement
  - Established hh-ink (dark navy #1E2A3B) as dominant color for all User Views
  - hh-primary (#6B7A92) as secondary color for accents
  - Updated TechniqueLibrary: view toggle, code badges, sort icons, table icons
  - Updated VideoLibrary: main action button
  - Updated LiveCoaching: tabs, raise hand button, poll interactions
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
- **User View**: Dark navy blue (hh-ink: #1E2A3B) as dominant + steel blue (hh-primary: #6B7A92) as secondary
  - Dominant actions (view toggle, code badges, active sort icons): hh-ink
  - Secondary accents (icons, subtle backgrounds): hh-primary
  - No checkboxes, read-only detail dialogs, action buttons for viewing/playing content

## Color Tokens (User View)
- **hh-ink** (#1E2A3B): Dominant - buttons, active states, badges, main icons
- **hh-primary** (#6B7A92): Secondary - supporting icons, subtle backgrounds, secondary info
- **hh-success**: Positive metrics, active status
- **hh-muted**: Secondary text, descriptions
- **hh-text**: Primary text content

## Technieken SSOT (Single Source of Truth)
- **Source File**: `src/data/technieken_index.json` - Contains all Hugo's verkooptechnieken
- **Service**: `src/data/technieken-service.ts` - TypeScript wrapper with typed helpers
- **Usage**: All technique references across the app must load from this SSOT:
  - E.P.I.C Technieken (TechniqueLibrary.tsx)
  - Videos
  - Webinars  
  - Gespreksanalyse
  - Hugo a.i. chat
  - Dashboard action cards
- **Key Functions**:
  - `getAllTechnieken()` - Get all techniques
  - `getTechniekByNummer(nummer)` - Get by nummer (e.g., "2.1.1")
  - `getTechniekenByFase(fase)` - Get techniques for a specific fase
  - `getFaseNaam(fase)` - Get Dutch fase name
  - `searchTechnieken(query)` - Search by naam, nummer, tags, themas
