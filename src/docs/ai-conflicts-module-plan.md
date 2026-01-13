# AI Conflicts Module - Design & Implementation Plan

## Concept
Een centrale review module waar alle AI-gegenereerde configuratie conflicten terechtkomen die Hugo's AI detecteert tijdens sessies. Admins kunnen deze conflicten reviewen, details bekijken, en accepteren/afwijzen.

## Pagina Structuur

### 1. Header
- **Titel**: "Config Conflicts Review"
- **Subtitle**: "Bekijk en beheer configuratie conflicten die handmatig opgelost moeten worden"
- **Back button**: Terug naar home
- **Action buttons**: 
  - "Sync Conflicts" (paars primary) - refresh/sync met backend
  - "Export Report" (outline) - download conflict report

### 2. Info Banner (blauw)
- Icon: Info cirkel
- Text: "Klik op de groene ✓ om een patch toe te passen, of op de rode ✗ om af te wijzen."
- Dismissible

### 3. KPI Tiles (2×2 grid op desktop, 1×4 op mobile)
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  106         │  98          │  90          │  Opgelost    │
│  Totaal      │  Onopgelost  │  High        │              │
│  conflicten  │  (rood)      │  severity    │              │
│              │              │  (rood)      │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

- **Tile 1**: Totaal conflicten (zwart nummer)
- **Tile 2**: Onopgelost (rood nummer)
- **Tile 3**: High severity (rood nummer)
- **Tile 4**: Opgelost (toggle switch om te tonen/verbergen)

### 4. Filters & Sort Bar
- **Left side**: 
  - Toggle: "Toon ook opgeloste conflicten" (checkbox)
  - Filter dropdown: Severity (All, High, Medium, Low)
  - Filter dropdown: Type (All, Missing Definition, Wrong Pattern, Unknown Value, etc.)
- **Right side**:
  - Sort dropdown: "Nieuwste eerst" / "Oudste eerst" / "Severity (hoog-laag)"

### 5. Conflict Cards (Scrollable list)

**Card Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [High] [Missing Definition] [2.1]    🕐 12-01-2026, 00:26   │
│                                       📄 detectors.json      │
│                                                               │
│ Technique 2.1 has no detector configuration                  │
│                                                               │
│ Voorgestelde aanpassing:                                     │
│ Add detector entry for 2.1 in detectors.json with           │
│ appropriate patterns                                          │
│                                                               │
│ 👁️ Bekijk    [Accepteer patch?]  [✓ Groen]  [✗ Rood]       │
└─────────────────────────────────────────────────────────────┘
```

**Card Elements:**
1. **Header row**:
   - Severity badge (High=red, Medium=orange, Low=gray)
   - Type badge (outline)
   - Technique number badge (paars)
   - Timestamp (klein, rechts)
   - Bestandsnaam (klein, rechts met file icon)

2. **Title**: Bold, conflict beschrijving

3. **Expert Comment Section** (expandable als lang):
   - Hugo's AI expert comment
   - "Lees meer" link als > 200 chars
   - Bij expand: volledige tekst met scroll

4. **Voorgestelde aanpassing**:
   - Label: "Voorgestelde aanpassing:"
   - Code block met JSON/config snippet
   - Syntax highlighting (light gray background)

5. **Expandable: "Bekijk rollenspel gesprek"** (optional):
   - Chevron down/up icon
   - Bij expand: transcript van relevante deel van gesprek

6. **Action bar**:
   - "Bekijk" button (eye icon, outline) - opent detail dialog
   - Text: "Accepteer patch?"
   - Groene ✓ button (success color, round)
   - Rode ✗ button (destructive color, round)

### 6. Empty State (als geen conflicten)
- Icon: CheckCircle (groen)
- Title: "Geen onopgeloste conflicten"
- Subtitle: "Alle configuratie conflicten zijn opgelost of afgewezen"
- CTA: "Ververs" button

## Componenten Breakdown

### AdminConfigConflicts.tsx
- Main pagina component
- State management voor filters, sort, selection
- KPI tiles
- Conflict list rendering

### ConflictCard.tsx
```tsx
interface ConflictCardProps {
  conflict: {
    id: string;
    severity: "high" | "medium" | "low";
    type: string;
    techniqueNumber: string;
    title: string;
    expertComment: string;
    suggestedFix: string;
    timestamp: Date;
    fileName: string;
    transcriptAvailable: boolean;
    status: "open" | "accepted" | "rejected";
  };
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (id: string) => void;
}
```

### ConflictDetailDialog.tsx
- Full-screen overlay (grijs background)
- Toont alle details
- Transcript sectie (als beschikbaar)
- Diff viewer voor config changes
- Accept/Reject buttons

### AcceptRejectButtons.tsx
- Groene ✓ button met confirmation tooltip
- Rode ✗ button met confirmation tooltip
- Loading states tijdens patch toepassing

## Navigatie Positie

**Optie 1: Admin Management sectie** (BESTE KEUZE)
```
Admin Management:
├── Gebruikers
├── Analytics
├── AI Review ← NIEUWE ITEM
├── Content
├── Help Center
├── Resources
└── Instellingen
```

**Optie 2: Main navigation met badge**
```
Main Navigation:
├── Dashboard
├── E.P.I.C technieken
├── Video's
├── Webinars
├── Uploads
├── Hugo a.i.
└── AI Review (98) ← Badge met aantal onopgelost
```

**Optie 3: Als notification center item**
- Icon in topbar naast notificaties
- Badge met aantal onopgeloste conflicten
- Dropdown met laatste 5 conflicten
- "Bekijk alle" link naar volledige pagina

## Interaction Flow

1. **User navigeert naar AI Review**
   → Ziet KPI overview + conflict lijst

2. **User klikt "Bekijk" op conflict**
   → ConflictDetailDialog opent met volledige info

3. **User klikt groene ✓ (Accept)**
   → Confirmation tooltip: "Patch toepassen?"
   → Bij confirm: Loading state → Success toast → Card verdwijnt/grijs uit
   → Backend: Config file wordt automatisch geüpdatet

4. **User klikt rode ✗ (Reject)**
   → Confirmation tooltip: "Conflict afwijzen?"
   → Bij confirm: Card verdwijnt/grijs uit
   → Backend: Conflict wordt gemarkeerd als "rejected"

5. **User klikt "Bekijk rollenspel gesprek"**
   → Expandable sectie toont transcript
   → Highlight relevante delen (waar conflict ontstond)

## Styling Guidelines

### Colors
- **High severity**: `text-red-600 bg-red-50 border-red-200`
- **Medium severity**: `text-orange-600 bg-orange-50 border-orange-200`
- **Low severity**: `text-slate-600 bg-slate-50 border-slate-200`
- **Accept button**: `bg-green-600 hover:bg-green-700`
- **Reject button**: `bg-red-600 hover:bg-red-700`
- **Info banner**: `bg-blue-50 border-blue-200 text-blue-900`

### Typography
- **Card title**: 16px, semibold
- **Expert comment**: 14px, regular, line-height 22px
- **Code blocks**: 13px, mono font, slate-800
- **Timestamps**: 12px, slate-500

### Spacing
- **Card padding**: 20px
- **Card gap**: 16px tussen cards
- **Section gap**: 12px binnen card
- **KPI grid gap**: 16px

## Data Structure

```typescript
interface ConfigConflict {
  id: string;
  severity: "high" | "medium" | "low";
  type: "missing_definition" | "wrong_pattern" | "unknown_value" | "invalid_config";
  techniqueNumber?: string;
  title: string;
  description: string;
  expertComment: string;
  suggestedFix: {
    type: "json" | "code" | "text";
    content: string;
  };
  affectedFile: string;
  timestamp: Date;
  sessionId?: string; // Link naar rollenspel sessie
  transcriptExcerpt?: string; // Relevant deel van gesprek
  status: "open" | "accepted" | "rejected";
  resolvedAt?: Date;
  resolvedBy?: string; // Admin user ID
}
```

## Implementation Priority

**Phase 1: Core UI** (Nu)
1. ✅ AdminConfigConflicts.tsx - Main pagina layout
2. ✅ ConflictCard.tsx - Card component
3. ✅ Mock data - 10-15 sample conflicts
4. ✅ Filters & sorting logic
5. ✅ KPI tiles

**Phase 2: Interactions**
6. ConflictDetailDialog.tsx - Detail view
7. Accept/Reject functionaliteit (frontend only)
8. Expandable sections (expert comment, transcript)
9. Toast notifications

**Phase 3: Backend Integration** (Later)
10. API endpoints voor conflicts CRUD
11. Patch toepassing logic
12. Config file updates
13. Real-time sync met Hugo AI

## Vragen voor Beslissing

1. **Navigatie positie**: Admin Management sectie OF Main navigation?
   → Voorstel: **Admin Management** (minder prominent, admins only)

2. **Badge notification**: Aantal onopgeloste conflicten in sidebar icon?
   → Voorstel: **Ja**, kleine rode badge zoals bij notificaties

3. **Bulk actions**: Selecteer meerdere conflicten en accept/reject tegelijk?
   → Voorstel: **Ja**, checkboxes + bulk action bar onderaan

4. **Auto-refresh**: Poll backend elke X minuten voor nieuwe conflicten?
   → Voorstel: **Ja**, elke 5 minuten + manual "Sync" button

5. **Conflict categorieën**: Groeperen per type (Missing Definitions, Wrong Patterns, etc.)?
   → Voorstel: **Optioneel**, toggle tussen "List view" en "Grouped view"

