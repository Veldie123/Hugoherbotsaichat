# HugoHerbots.ai API Specificatie

Dit document beschrijft welke API endpoints het .ai platform moet implementeren om naadloos te integreren met het .com platform.

## Base URL
```
https://hugoherbots-ai-chat.replit.app
```

## Endpoints

### 1. POST /api/v2/chat (of /api/chat)

Stuurt een chatbericht naar de AI coach en krijgt een gepersonaliseerd antwoord terug.

**Request Body:**
```json
{
  "message": "string - het bericht van de gebruiker",
  "userId": "string - UUID van de gebruiker (optioneel)",
  "conversationHistory": [
    {
      "role": "user" | "assistant",
      "content": "string"
    }
  ],
  "techniqueContext": "string - bijv. 'Gebruiker oefent met techniek: 2.4 - Gentleman's Agreement'",
  "sourceApp": "com" | "ai"
}
```

**Response:**
```json
{
  "message": "string - het antwoord van Hugo",
  "technique": "string - techniek nummer (optioneel, bijv. '2.4')",
  "sources": [
    {
      "title": "string - video titel",
      "videoId": "string - Mux video ID",
      "chunk": "string - relevante tekst fragment"
    }
  ]
}
```

**Voorbeeld Request:**
```bash
curl -X POST https://hugoherbots-ai-chat.replit.app/api/v2/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hoe sluit ik een gentleman agreement?",
    "userId": "b01529ff-0b15-4976-a846-12aa508efdfa",
    "conversationHistory": [],
    "sourceApp": "com"
  }'
```

---

### 2. GET /api/v2/user/activity-summary

Haalt de activiteitssamenvatting van een gebruiker op voor gepersonaliseerde responses.

**Query Parameters:**
- `userId`: UUID van de gebruiker (verplicht)

**Response:**
```json
{
  "summary": {
    "videos_watched": 12,
    "videos_completed": 8,
    "webinars_attended": 3,
    "chat_sessions": 25,
    "total_activities": 48,
    "last_activity": "2026-02-02T14:30:00Z",
    "welcomeMessage": "Welkom terug! Je hebt al 12 video's bekeken en 3 webinars bijgewoond. Waar kan ik je vandaag mee helpen?"
  }
}
```

**Voorbeeld Request:**
```bash
curl "https://hugoherbots-ai-chat.replit.app/api/v2/user/activity-summary?userId=b01529ff-0b15-4976-a846-12aa508efdfa"
```

---

### 3. GET /api/health (optioneel)

Health check endpoint om de status van de API te controleren.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-02T14:30:00Z"
}
```

---

## Supabase Query voor Activity Summary

Het .ai platform kan deze RPC functie aanroepen om activiteit op te halen:

```sql
SELECT * FROM get_user_activity_summary('user-uuid-here');
```

Of direct querien:

```sql
SELECT 
  COUNT(*) FILTER (WHERE activity_type = 'video_view') as videos_watched,
  COUNT(*) FILTER (WHERE activity_type = 'video_complete') as videos_completed,
  COUNT(*) FILTER (WHERE activity_type = 'webinar_attend') as webinars_attended,
  COUNT(*) as total_activities,
  MAX(created_at) as last_activity
FROM user_activity
WHERE user_id = 'user-uuid-here'
  AND created_at > NOW() - INTERVAL '30 days';
```

---

## CORS Configuratie

Het .ai platform moet CORS headers toestaan voor het .com domein:

```javascript
// Voorbeeld Express.js
app.use(cors({
  origin: [
    'https://hugoherbots-com.replit.app',
    'https://hugoherbots.com',
    'http://localhost:5000'
  ],
  credentials: true
}));
```

---

## Gedeelde Database

Beide platforms gebruiken dezelfde Supabase database:
- **Project ID**: pckctmojjrrgzuufsqoo
- **user_activity tabel**: Bevat video views, completions, webinar attendance
- **Supabase Auth**: Beide platforms delen dezelfde user identities

---

## Flow Diagram

```
┌─────────────────────┐         ┌─────────────────────┐
│  hugoherbots.com    │         │   hugoherbots.ai    │
│  (Video/Webinars)   │         │   (AI Chat/RAG)     │
└─────────┬───────────┘         └──────────┬──────────┘
          │                                 │
          │  POST /api/v2/chat             │
          │ ─────────────────────────────► │
          │                                 │
          │  { message, userId, history }   │
          │                                 │
          │ ◄───────────────────────────── │
          │  { message, technique, sources }│
          │                                 │
          ▼                                 ▼
     ┌─────────────────────────────────────────┐
     │         Supabase (gedeeld)               │
     │  - user_activity (video/webinar logs)    │
     │  - auth.users (gedeelde identities)      │
     │  - video_embeddings (RAG corpus)         │
     └─────────────────────────────────────────┘
```

---

## Testing

Test de integratie met:

```javascript
// In browser console op hugoherbots.com
const response = await fetch('https://hugoherbots-ai-chat.replit.app/api/v2/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hallo, test bericht',
    sourceApp: 'com'
  })
});
console.log(await response.json());
```
