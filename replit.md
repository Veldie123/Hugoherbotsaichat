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

## Recent Changes
- 2026-01-13: Initial Replit setup
  - Configured Vite for Replit (port 5000, allowedHosts)
  - Added TypeScript configuration
  - Created missing component stubs (Help, Coaching, RolePlayOverview, Analysis)
