# Complete Migratie Checklist - HugoHerbots.ai

## KRITIEKE BESTANDEN DIE CORRECT MOETEN STAAN

### 1. CSS/Styling (MEEST WAARSCHIJNLIJKE OORZAAK)
De kleuren werken niet omdat de CSS variabelen niet geladen worden.

**Check in main.tsx:**
```tsx
import "./index.css";  // OF
import "./styles/globals.css";
```

**Beide CSS bestanden moeten aanwezig zijn:**
- `src/index.css` - Tailwind compiled CSS + kleur variabelen
- `src/styles/globals.css` - HH brand kleuren

### 2. Kleur Variabelen (kopieer naar je CSS)
```css
:root {
  --hh-mirage: #0F1826;
  --hh-steel-blue: #4F7396;
  --hh-steel-blue-hover: #5D8AB0;
  --hh-ink: var(--hh-mirage);
  --hh-primary: var(--hh-steel-blue);
  --hh-purple: #8B5CF6;
}
```

### 3. Navigatie Problemen
**App.tsx moet deze pages hebben:**
- `talk-to-hugo` → TalkToHugoAI component
- `analysis` → Analysis component
- `admin-sessions` → AdminSessions component
- `admin-chat-expert` → AdminChatExpertMode component

**Navigate functie moet werken:**
```tsx
const navigate = (page: Page | string) => {
  setCurrentPage(page as Page);
};
```

### 4. Ontbrekende Componenten
Controleer of deze bestaan in `src/components/HH/`:
- [ ] AppLayout.tsx (bevat sidebar + navigatie)
- [ ] TalkToHugoAI.tsx
- [ ] TranscriptDialog.tsx
- [ ] AdminChatExpertMode.tsx
- [ ] AdminChatExpertModeSidebar.tsx (EPICSidebar)
- [ ] AnalysisResults.tsx
- [ ] AdminSessions.tsx

### 5. Data Bestanden
Controleer of deze bestaan in `src/data/`:
- [ ] technieken_index.ts (sidebar data)
- [ ] technieken_index.json
- [ ] klant_houdingen.ts

### 6. Utils
Controleer of deze bestaan:
- [ ] src/utils/phaseColors.ts
- [ ] src/utils/supabase/client.ts
- [ ] src/contexts/UserContext.tsx

## SNELLE FIX: VOEG DIT TOE AAN JE MAIN.TSX

```tsx
import "./styles/globals.css";  // Voeg deze import toe!
```

## ADMIN VS USER VIEW KLEUREN

**User View:** Steel Blue (#4F7396) voor actieve states
**Admin View:** Purple (#8B5CF6) voor actieve states

Dit wordt bepaald door de `isAdmin` prop die doorgegeven wordt aan componenten.

## STEEL BLUE ACTIEVE SIDEBAR

In AppLayout.tsx of vergelijkbare sidebar, zoek naar:
```tsx
className={`... ${isActive ? "bg-hh-steel-blue text-white" : ""}`}
```

Of inline style:
```tsx
style={isActive ? { backgroundColor: '#4F7396', color: 'white' } : {}}
```
