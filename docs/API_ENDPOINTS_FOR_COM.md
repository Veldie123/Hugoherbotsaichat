# HugoHerbots.ai API Endpoints - For .com Platform

## Base URL
```
https://hugoherbots.ai  (production)
```

## Architecture
- `.com` = Frontend platform (videos, webinars, content, user interaction)
- `.ai` = Backend API (Hugo Engine V2, RAG, AI coaching, activity tracking)
- `Supabase` = Shared database (sessions, user context, activity, RAG docs)

Both platforms share the same Supabase project. The `.com` platform calls `.ai` API endpoints for Hugo Engine functionality and activity tracking.

---

## CORS
All endpoints have CORS enabled for all origins. No special headers needed.

---

## 1. CHAT / COACHING

### POST /api/v2/chat
Main chat endpoint for Hugo coaching conversations.

```json
// Request
{
  "message": "Hoe gebruik ik de SPIN-methode?",
  "userId": "b01529ff-0b15-4976-a846-12aa508efdfa",
  "sessionId": "optional-existing-session-id",
  "techniqueId": "optional-technique-id"
}

// Response
{
  "response": "Hugo's antwoord...",
  "sessionId": "abc123",
  "mode": "COACH_CHAT",
  "signals": [...],
  "suggestions": [...]
}
```

### POST /api/v2/sessions
Create a new coaching session.

```json
// Request
{
  "userId": "uuid",
  "techniqueId": "2.1.1",
  "techniqueName": "SPIN Selling",
  "isExpert": false
}

// Response
{
  "sessionId": "abc123",
  "mode": "CONTEXT_GATHERING",
  "greeting": "Hoi! Vertel me..."
}
```

### POST /api/v2/message
Send a message in an existing session.

```json
// Request
{
  "sessionId": "abc123",
  "content": "Ik werk in B2B software sales",
  "userId": "uuid"
}

// Response
{
  "response": "...",
  "mode": "CONTEXT_GATHERING",
  "contextComplete": false,
  "signals": []
}
```

---

## 2. USER ACTIVITY TRACKING

### POST /api/v2/user/activity
Log user activity from .com platform (video views, webinar attendance, etc.)

```json
// Request
{
  "userId": "b01529ff-0b15-4976-a846-12aa508efdfa",
  "activityType": "video_view",        // video_view | webinar_attend | technique_practice | chat_session
  "sourceApp": "com",                  // "com" or "ai" - defaults to "ai" if not set
  "entityType": "video",               // video | webinar | technique | session
  "entityId": "919774eb-...",           // UUID of the entity (or string ID for techniques)
  "durationSeconds": 120,              // optional - stored in metadata
  "score": 85,                         // optional - stored in metadata
  "metadata": {                        // optional extra data
    "title": "SPIN Selling - Module 1",
    "progress": 0.75
  }
}

// Response
{
  "success": true,
  "activity": { "id": "uuid", "user_id": "...", "activity_type": "...", ... }
}
```

**Important:** `userId` must be a Supabase auth UUID. Entity IDs (video_id, webinar_id, session_id) must be UUIDs or they go into metadata. `techniek_id` can be any string (e.g., "2.1.1").

### GET /api/v2/user/activity-summary?userId=UUID
Get activity summary for personalized Hugo greeting.

```json
// Response
{
  "welcomeMessage": "Net keek je een video \"SPIN Selling\". Heb je daar nog vragen over?",
  "summary": {
    "videosWatched": 5,
    "webinarsAttended": 1,
    "techniquesExplored": 3,
    "totalChatSessions": 2
  },
  "recent": {
    "videos": [...],
    "webinars": [...],
    "techniques": [...],
    "chats": [...]
  },
  "lastActivity": { ... },
  "source": "com"
}
```

### GET /api/v2/user/hugo-context?userId=UUID
Get full Hugo context including activity, user profile, and mastery data.

```json
// Response
{
  "welcomeMessage": "...",
  "userProfile": { "sector": "B2B", "product": "Software", ... },
  "recentActivity": [...],
  "mastery": { ... },
  "suggestedTopics": [...]
}
```

---

## 3. USER CONTEXT / PROFILE

### GET /api/user/context?userId=UUID
Get user's sales context (sector, product, etc.)

```json
// Response
{
  "context": {
    "sector": "B2B",
    "product": "Software",
    "klantType": "Enterprise",
    "setting": null,
    "additionalContext": { "verkoopkanaal": "Direct", "ervaring": "3 jaar" }
  }
}
```

### POST /api/user/context
Save/update user's sales context.

```json
// Request
{
  "userId": "uuid",
  "context": {
    "sector": "B2B",
    "product": "Software",
    "klantType": "Enterprise"
  }
}
```

---

## 4. SESSIONS

### GET /api/sessions?userId=UUID
List all sessions for a user.

### GET /api/v2/sessions/:sessionId
Get a specific session.

### DELETE /api/v2/sessions/:sessionId
Delete a session.

### GET /api/sessions/stats?userId=UUID
Get session statistics.

---

## 5. ROLEPLAY

### POST /api/v2/roleplay/start
Start a roleplay session.

```json
{
  "sessionId": "abc123",
  "scenario": { "type": "cold_call", "difficulty": "bewuste_onkunde" }
}
```

### POST /api/v2/roleplay/message
Send a roleplay message.

### POST /api/v2/roleplay/end
End roleplay with debrief.

---

## 6. USER PERFORMANCE & MASTERY

### GET /api/v2/user/level?userId=UUID
Get user's competence level.

### POST /api/v2/user/performance
Log performance data.

### GET /api/v2/user/mastery?userId=UUID
Get mastery data per technique.

---

## 7. SSO (Cross-Platform Authentication)

### POST /api/sso/generate-token
Generate SSO handoff token for cross-platform login.

```json
// Request
{
  "userId": "uuid",
  "email": "user@example.com",
  "sourcePlatform": "com",
  "targetPlatform": "ai"
}

// Response
{
  "success": true,
  "token": "sso-token-string",
  "expiresAt": "2026-02-11T11:00:00Z",
  "redirectUrl": "https://hugoherbots.ai/sso?token=..."
}
```

### GET /api/sso/validate?token=TOKEN
Validate an SSO token.

### POST /api/sso/cleanup
Clean up expired SSO tokens.

---

## 8. PLATFORM SYNC

### POST /api/platform-sync/send
Send a sync event to the other platform.

```json
{
  "eventType": "user_context_updated",
  "userId": "uuid",
  "data": { ... },
  "sourcePlatform": "com"
}
```

### GET /api/platform-sync/pending?platform=com
Get pending sync events.

### POST /api/platform-sync/acknowledge
Acknowledge processed sync events.

### GET /api/platform-sync/status
Get sync status.

---

## 9. HEALTH CHECK

### GET /api/health
Check if the API is running.

```json
{ "status": "ok", "engine": "v2-full", "timestamp": "..." }
```

---

## Usage from .com (JavaScript/TypeScript)

```typescript
// Example: Log video view from .com platform
const AI_API_URL = 'https://hugoherbots.ai';

async function logVideoView(userId: string, videoId: string, title: string) {
  const response = await fetch(`${AI_API_URL}/api/v2/user/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      activityType: 'video_view',
      sourceApp: 'com',
      entityType: 'video',
      entityId: videoId,
      metadata: { title }
    })
  });
  return response.json();
}

// Example: Get Hugo greeting based on user activity
async function getHugoGreeting(userId: string) {
  const response = await fetch(
    `${AI_API_URL}/api/v2/user/activity-summary?userId=${userId}`
  );
  const data = await response.json();
  return data.welcomeMessage;
}

// Example: Start Hugo chat from .com
async function chatWithHugo(userId: string, message: string, sessionId?: string) {
  const response = await fetch(`${AI_API_URL}/api/v2/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, message, sessionId })
  });
  return response.json();
}
```

---

## Supabase Tables (Shared)

| Table | Purpose | Used by |
|-------|---------|---------|
| `v2_sessions` | Coaching sessions | .ai (write), .com (read) |
| `session_artifacts` | Session outputs | .ai (write), .com (read) |
| `user_context` | User sales profile | .ai (write), .com (read/write) |
| `user_activity` | Cross-platform activity | .ai + .com (write), .ai (read) |
| `rag_documents` | RAG knowledge base | .ai (read), admin (write) |
| `platform_sync` | Sync events | .ai + .com (read/write) |
| `sso_handoff_tokens` | SSO tokens | .ai + .com (read/write) |

## user_activity Table Schema

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Auto-generated |
| `user_id` | UUID | Supabase auth user ID |
| `activity_type` | TEXT | video_view, webinar_attend, technique_practice, chat_session |
| `source_app` | TEXT | "com" or "ai" |
| `video_id` | UUID | Nullable, UUID reference |
| `webinar_id` | UUID | Nullable, UUID reference |
| `session_id` | UUID | Nullable, UUID reference |
| `techniek_id` | TEXT | Nullable, technique code (e.g., "2.1.1") |
| `metadata` | JSONB | Extra data (title, progress, duration, etc.) |
| `created_at` | TIMESTAMP | Auto-generated |
