# HugoHerbots.ai - Export Package
## Gespreksanalyse + Hugo a.i. + Config Review Modules
### v2.0 - Multi-Modal Chat & Progressive Unlocking

Dit document beschrijft welke bestanden je nodig hebt om de Gespreksanalyse, Hugo a.i. en Config Review modules te exporteren naar een andere Replit met werkende backend.

---

## 🆕 NIEUWE FEATURES (v2.0)

### Multi-Modal Chat Interface (TalkToHugoAI.tsx)
De Hugo a.i. chat ondersteunt nu 3 modi:
- **Chat Mode**: WhatsApp-stijl met dicteermicrofoon
- **Audio Mode**: Teal gradient achtergrond, waveform visualisatie, telefoon controls (Mute, Speaker, End)
- **Video Mode**: Dark slate gradient, HH avatar, PiP preview, camera controls

### Progressive Unlocking System (EPICSidebar)
- Locked techniques: Grijs + 🔒 icoon
- Completed techniques: ✅ Groen vinkje
- Current technique: Highlighted in brand colors
- Props: `completedTechniques`, `currentUnlockedPhase`

### 3-Level Technique Hierarchy
Sidebar ondersteunt nu 3 niveaus:
- Parent → Child → Grandchild
- Voorbeelden: 2.1.1.x (discovery themes), 4.2.x (afritten types), 4.3.x (closing steps)

### Session Timer
MM:SS timer die start wanneer een techniek wordt geselecteerd.

---

## 📁 BESTANDSSTRUCTUUR

### 1. ADMIN VIEW COMPONENTEN

| Bestand | Functie | Screenshot Referentie |
|---------|---------|----------------------|
| `src/components/HH/AdminSessions.tsx` | Hugo a.i. Admin overzicht met sessies tabel | image_1768493200886 |
| `src/components/HH/AdminSessionTranscripts.tsx` | Transcript details dialog met chat history | image_1768493179762 |
| `src/components/HH/AdminChatExpertMode.tsx` | Admin Chat Expert Mode interface | image_1768493282920 |
| `src/components/HH/AdminChatExpertModeSidebar.tsx` | E.P.I.C Sidebar met technieken | image_1768493282920 |
| `src/components/HH/AdminUploadManagement.tsx` | Gespreksanalyse Admin (upload beheer) | image_1768493231533 |
| `src/components/HH/AdminConfigReview.tsx` | Config Review pagina | image_1768493210170 |
| `src/components/HH/ConflictDetailDialog.tsx` | Detail dialog voor config conflicten | image_1768493219116 |
| `src/components/HH/ConfigReviewNotification.tsx` | Notificatie component voor config issues | - |
| `src/components/HH/AdminLayout.tsx` | Admin layout wrapper | - |

### 2. USER VIEW COMPONENTEN

| Bestand | Functie | Screenshot Referentie |
|---------|---------|----------------------|
| `src/components/HH/Analysis.tsx` | Gespreksanalyse User overzicht | image_1768493261361 |
| `src/components/HH/ConversationAnalysis.tsx` | Live analyse met upload en coaching | image_1768493270960 |
| `src/components/HH/AnalysisResults.tsx` | Analyse resultaten weergave | - |
| `src/components/HH/HugoAIOverview.tsx` | Hugo a.i. User landing page | - |
| `src/components/HH/TalkToHugoAI.tsx` | Hugo a.i. Chat interface (User) | image_1768493282920 |
| `src/components/HH/AppLayout.tsx` | User layout wrapper met sidebar | - |

### 3. GEDEELDE COMPONENTEN

| Bestand | Functie |
|---------|---------|
| `src/components/HH/SessionDebugPanel.tsx` | Debug panel voor chat sessies |
| `src/components/HH/TranscriptLine.tsx` | Transcript regel component |
| `src/components/HH/EPICSalesFlow.tsx` | E.P.I.C Sales Flow progress component |
| `src/components/HH/EPICProgressKPI.tsx` | Progress KPI component |
| `src/components/HH/EmptyState.tsx` | Empty state component |

### 4. UI COMPONENTEN (hele map kopiëren)

```
src/components/ui/
├── badge.tsx
├── button.tsx
├── card.tsx
├── checkbox.tsx
├── custom-checkbox.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── input.tsx
├── label.tsx
├── progress.tsx
├── scroll-area.tsx
├── select.tsx
├── separator.tsx
├── sheet.tsx
├── skeleton.tsx
├── switch.tsx
├── table.tsx
├── tabs.tsx
├── textarea.tsx
├── tooltip.tsx
└── utils.ts
```

### 5. DATA BESTANDEN (MOCK DATA - VERVANGEN DOOR BACKEND)

| Bestand | Functie | Te vervangen door |
|---------|---------|------------------|
| `src/data/technieken_index.json` | Alle verkooptechnieken data | Backend API `/api/techniques` |
| `src/data/technieken-service.ts` | Service wrapper voor technieken | Backend API calls |
| `src/data/klant_houdingen.ts` | Klant houdingen/attitudes | Backend API `/api/attitudes` |
| `src/data/hugoQuotes.ts` | Hugo AI quotes | Backend of hardcoded |

### 6. UTILITIES

| Bestand | Functie |
|---------|---------|
| `src/utils/phaseColors.ts` | Fase kleuren utility (SSOT) |
| `src/utils/storage.ts` | Local storage helpers |

### 7. STYLING

| Bestand | Functie |
|---------|---------|
| `src/index.css` | Tailwind CSS + HH Brand kleuren |

---

## 🎨 CSS VARIABELEN (kopieer naar je index.css)

```css
:root {
  /* HH Brand Colors */
  --hh-mirage: #0F1826;
  --hh-indian-ink: #464B50;
  --hh-slate-gray: #6B7280;
  --hh-french-gray: #9CA3AF;
  --hh-platinum: #D1D5DB;
  --hh-white: #FFFFFF;
  --hh-steel-blue: #4F7396;
  
  /* Design Tokens */
  --hh-primary: #4F7396;
  --hh-success: #10B981;
  --hh-ink: #1E2A3B;
  --hh-ui-50: #F8FAFC;
  --hh-ui-100: #F1F5F9;
  --hh-ui-200: #E2E8F0;
  --hh-bg: #FFFFFF;
  --hh-text: #0F1826;
  --hh-muted: #9CA3AF;
  --hh-border: #D1D5DB;
}
```

---

## 🔌 BACKEND INTEGRATIE INSTRUCTIES

### Stap 1: Data Services Aanpassen

Vervang de mock data imports in elk component met je backend API calls:

**VOOR (mock data):**
```typescript
import { getAllTechnieken } from "../../data/technieken-service";

const techniques = getAllTechnieken();
```

**NA (backend API):**
```typescript
import { useEffect, useState } from "react";

const [techniques, setTechniques] = useState([]);

useEffect(() => {
  fetch("/api/techniques")
    .then(res => res.json())
    .then(data => setTechniques(data));
}, []);
```

### Stap 2: API Endpoints die je nodig hebt

| Endpoint | Method | Beschrijving | Gebruikt door |
|----------|--------|--------------|---------------|
| `/api/techniques` | GET | Alle technieken ophalen | AdminChatExpertModeSidebar, TalkToHugoAI |
| `/api/techniques/:id` | GET | Eén techniek ophalen | TechniqueDetailsDialog |
| `/api/sessions` | GET | Alle training sessies | AdminSessions, HugoAIOverview |
| `/api/sessions/:id` | GET | Sessie details + transcript | AdminSessionTranscripts |
| `/api/sessions` | POST | Nieuwe sessie starten | TalkToHugoAI, AdminChatExpertMode |
| `/api/sessions/:id/messages` | POST | Chat bericht versturen | TalkToHugoAI, AdminChatExpertMode |
| `/api/analyses` | GET | Alle gespreksanalyses | Analysis, AdminUploadManagement |
| `/api/analyses` | POST | Upload analyse starten | ConversationAnalysis |
| `/api/analyses/:id` | GET | Analyse resultaten | AnalysisResults |
| `/api/config-reviews` | GET | Config conflicten | AdminConfigReview |
| `/api/config-reviews/:id` | PATCH | Conflict goedkeuren/afwijzen | AdminConfigReview |
| `/api/attitudes` | GET | Klant houdingen | AdminChatExpertModeSidebar |

### Stap 3: Type Interfaces

Zorg dat je backend dezelfde interfaces teruggeeft:

```typescript
// Techniek Interface
interface Techniek {
  nummer: string;      // "2.1.1"
  naam: string;        // "Feitgerichte vragen"
  fase: number;        // 2
  tags: string[];      // ["ontdekking", "vragen"]
  themas: string[];    // ["behoeften", "klantinzicht"]
  doel: string;        // Beschrijving van het doel
  hoe: string;         // Hoe toe te passen
  stappenplan: string[]; // Stappen
  voorbeeld: string;   // Voorbeelddialoog
}

// Session Interface
interface Session {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userOrganization: string;
  techniqueNumber: string;
  techniqueName: string;
  type: "AI Audio" | "AI Video" | "AI Chat" | "Rollenspel Upload";
  mode: "chat" | "audio" | "video"; // NEW: Multi-modal type
  score: number;       // 0-100
  duration: string;    // "18:45"
  quality: "Excellent" | "Good" | "Needs Work";
  createdAt: string;   // ISO date
  messages: Message[];
}

// EPICSidebar Props (v2.0)
interface EPICSidebarProps {
  // ... existing props ...
  isUserView?: boolean;              // Purple vs hh-ink color scheme
  completedTechniques?: string[];    // Array of completed technique nummers
  currentUnlockedPhase?: number;     // Highest unlocked phase (0-4)
}

// Message Interface
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;   // "00:05"
  debugInfo?: object;  // Optional debug data
}

// Analysis Interface
interface Analysis {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  techniqueNumber: string;
  techniqueName: string;
  type: "Audio" | "Video" | "Chat";
  score: number;
  duration: string;
  quality: "Excellent" | "Good" | "Needs Work";
  createdAt: string;
  transcript?: Message[];
  feedback?: AIFeedback[];
}

// Config Review Interface
interface ConfigConflict {
  id: string;
  techniqueNumber: string;
  techniqueName: string;
  type: "Missing Detector" | "Pattern Mismatch" | "Phase Error" | "Scoring Error";
  severity: "HIGH" | "MEDIUM" | "LOW";
  description: string;
  status: "pending" | "approved" | "rejected";
  detectedAt: string;
}
```

---

## 📋 KOPIEREN COMMANDO'S

### Optie A: Handmatig kopiëren (via terminal)

```bash
# In je NIEUWE Replit, clone dit project tijdelijk
git clone https://replit.com/@[username]/HugoHerbots-Design temp-design

# Kopieer Admin components
cp temp-design/src/components/HH/AdminSessions.tsx ./src/components/HH/
cp temp-design/src/components/HH/AdminSessionTranscripts.tsx ./src/components/HH/
cp temp-design/src/components/HH/AdminChatExpertMode.tsx ./src/components/HH/
cp temp-design/src/components/HH/AdminChatExpertModeSidebar.tsx ./src/components/HH/
cp temp-design/src/components/HH/AdminUploadManagement.tsx ./src/components/HH/
cp temp-design/src/components/HH/AdminConfigReview.tsx ./src/components/HH/
cp temp-design/src/components/HH/ConflictDetailDialog.tsx ./src/components/HH/
cp temp-design/src/components/HH/ConfigReviewNotification.tsx ./src/components/HH/
cp temp-design/src/components/HH/AdminLayout.tsx ./src/components/HH/

# Kopieer User components
cp temp-design/src/components/HH/Analysis.tsx ./src/components/HH/
cp temp-design/src/components/HH/ConversationAnalysis.tsx ./src/components/HH/
cp temp-design/src/components/HH/AnalysisResults.tsx ./src/components/HH/
cp temp-design/src/components/HH/HugoAIOverview.tsx ./src/components/HH/
cp temp-design/src/components/HH/TalkToHugoAI.tsx ./src/components/HH/
cp temp-design/src/components/HH/AppLayout.tsx ./src/components/HH/

# Kopieer gedeelde components
cp temp-design/src/components/HH/SessionDebugPanel.tsx ./src/components/HH/
cp temp-design/src/components/HH/TranscriptLine.tsx ./src/components/HH/
cp temp-design/src/components/HH/EPICSalesFlow.tsx ./src/components/HH/
cp temp-design/src/components/HH/EPICProgressKPI.tsx ./src/components/HH/
cp temp-design/src/components/HH/EmptyState.tsx ./src/components/HH/

# Kopieer UI components (hele map)
cp -r temp-design/src/components/ui/* ./src/components/ui/

# Kopieer data files (TIJDELIJK - vervang later met backend)
cp -r temp-design/src/data/* ./src/data/

# Kopieer utilities
cp temp-design/src/utils/phaseColors.ts ./src/utils/

# Verwijder temp folder
rm -rf temp-design
```

### Optie B: Specifieke bestanden downloaden

Download deze bestanden individueel via Replit's bestandsbrowser (rechtermuisklik → Download).

---

## 🔄 NAVIGATIE ROUTES

Voeg deze routes toe aan je App.tsx of router:

```typescript
// Admin Routes
{ path: "admin/sessions", component: AdminSessions }
{ path: "admin/config-review", component: AdminConfigReview }
{ path: "admin/uploads", component: AdminUploadManagement }
{ path: "admin/chat-expert", component: AdminChatExpertMode }

// User Routes
{ path: "analysis", component: Analysis }
{ path: "conversation-analysis", component: ConversationAnalysis }
{ path: "hugo-overview", component: HugoAIOverview }
{ path: "talk-to-hugo", component: TalkToHugoAI }
```

---

## ⚠️ BELANGRIJKE OPMERKINGEN

1. **SSOT Principe**: Alle data komt uit één bron. Vervang `src/data/*` imports met je backend API.

2. **Fase Kleuren**: Gebruik `src/utils/phaseColors.ts` voor consistente kleuren per fase.

3. **Admin vs User View**:
   - Admin: Purple accent kleur, checkboxes, edit/delete buttons
   - User: hh-ink/hh-primary kleuren, read-only, geen checkboxes

4. **Tailwind CSS v4**: Sommige utilities bestaan niet in v3.x. Check `index.css` voor custom CSS.

5. **Dependencies**: Zorg dat je deze npm packages hebt:
   - `lucide-react` (icons)
   - `@radix-ui/react-*` (UI primitives)
   - `class-variance-authority` (styling)
   - `clsx` (classnames)
   - `tailwind-merge` (Tailwind utilities)

---

## 📞 SUPPORT

Als je vragen hebt over de integratie, check de component code voor inline comments die de dataflow uitleggen.
