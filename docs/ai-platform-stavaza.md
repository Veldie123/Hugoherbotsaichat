# Stavaza & TODO — hugoherbots.ai Platform

Laatst bijgewerkt: 2026-02-11

## Wat is dit document?

Dit document beschrijft wat het `.com` platform (hugoherbots.com) al implementeert en verwacht van het `.ai` platform (hugoherbots.ai). Gebruik dit als referentie en TODO lijst voor het .ai Replit project.

---

## Huidige status .com platform

### Wat .com al doet

| Feature | Status | Details |
|---|---|---|
| Activity dual-write | Actief | Elke activiteit (video, webinar, chat, etc.) wordt naar Supabase + .ai API gestuurd |
| Chat via .ai API | Actief | Gebruikt `/api/v2/chat` met fallback naar `/api/chat` en `/api/chat/message` |
| Sessie management | Actief | Creëert sessies via `POST /api/v2/sessions` |
| Hugo begroeting | Actief | Haalt gepersonaliseerde context op via `/api/v2/user/hugo-context` en `/api/v2/user/activity-summary` |
| SSO handoff | Actief | "Open Hugo AI" knop genereert SSO token en redirect naar .ai platform |
| Platform sync | Actief | Berichten sturen/ontvangen via `platform_sync` tabel |
| Health check | Actief | Controleert .ai bereikbaarheid via `/api/health` |

### Services die .ai aanroepen

| Service | Bestand | Wat het doet |
|---|---|---|
| `hugoAiApi` | `src/services/hugoAiApi.ts` | Chat, sessies, activity summary, hugo context, health check |
| `activityService` | `src/services/activityService.ts` | Dual-write activiteit notificaties naar .ai |
| `ssoHandoffService` | `src/services/ssoHandoffService.ts` | SSO token generatie en cross-platform navigatie |
| `platformSyncService` | `src/services/platformSyncService.ts` | Berichten uitwisseling via Supabase |

### Shared types

Alle gedeelde types staan in `src/types/crossPlatform.ts`. Dit bestand kan 1-op-1 gekopieerd worden naar het .ai project voor type-safety.

---

## Gedeelde Supabase database

**Project ID:** `pckctmojjrrgzuufsqoo`

### Tabellen die beide platforms gebruiken

| Tabel | .com schrijft | .ai schrijft | Beschrijving |
|---|---|---|---|
| `user_activity` | Ja | Ja | Alle gebruikersactiviteiten over beide platforms |
| `platform_sync` | Ja | Ja | Cross-platform communicatie berichten |
| `sso_handoff_tokens` | Ja | Ja | Eenmalige SSO tokens (TTL: 60s) |
| `features` | Ja (admin) | Leest | Feature definities |
| `plans` | Ja (admin) | Leest | Abonnement plans |
| `plan_features` | Ja (admin) | Leest | Feature-plan koppelingen |

### Supabase RPCs die .ai moet ondersteunen

| RPC | Beschrijving |
|---|---|
| `generate_sso_handoff_token` | Token aanmaken voor SSO (params: user_id, source, target, path, ttl) |
| `validate_sso_handoff_token` | Token valideren bij ontvangst (params: token, expected_target) |
| `get_pending_sync_messages` | Ongelezen platform_sync berichten ophalen |
| `mark_sync_message_read` | Bericht als gelezen markeren |

---

## TODO voor .ai platform

### Prioriteit 1: API Endpoints (vereist voor .com integratie)

- [ ] **POST /api/v2/chat** — Chat endpoint met RAG
  - Moet `message`, `userId`, `sourceApp`, `sessionId`, `conversationHistory`, `techniqueContext` accepteren
  - Moet `response`/`message`, `sessionId`, `mode`, `technique`, `sources`, `suggestions` returnen
  - RAG moet zoeken in video transcripties + technieken_index embeddings

- [ ] **POST /api/v2/sessions** — Sessie aanmaken
  - Accepteert `userId`, `techniqueId`, `techniqueName`, `isExpert`
  - Retourneert `sessionId`, `greeting`, `mode`
  - Greeting moet gepersonaliseerd zijn op basis van gebruikershistorie

- [ ] **POST /api/v2/user/activity** — Activiteit ontvangen van .com
  - Accepteert het volledige `ActivityPayload` (zie `crossPlatform.ts`)
  - Opslaan voor Hugo Engine context
  - Mag falen zonder .com te blokkeren (fire-and-forget)

- [ ] **GET /api/v2/user/activity-summary** — Activiteit samenvatting
  - Query param: `userId`
  - Aggregeert activiteiten over BEIDE platforms
  - Genereert optioneel een `welcomeMessage`

- [ ] **GET /api/v2/user/hugo-context** — Volledige Hugo context
  - Query param: `userId`
  - Retourneert: `welcomeMessage`, `userProfile`, `recentActivity`, `mastery`, `suggestedTopics`
  - Dit is het belangrijkste personalisatie-endpoint

- [ ] **GET /api/health** — Health check
  - Retourneert `{ status: "ok", engine: "v2.x.x" }`

### Prioriteit 2: SSO Handoff

- [ ] **GET /auth/handoff** — SSO token ontvangen en verwerken
  - Query params: `token`, `redirect`
  - Token valideren via `validate_sso_handoff_token` RPC
  - Bij succes: Supabase sessie starten voor de gebruiker
  - Redirect naar `redirect` param of `/`

- [ ] **Token generatie voor .ai → .com** (omgekeerde flow)
  - Gebruikt dezelfde `generate_sso_handoff_token` RPC
  - Met `source_platform: 'ai'`, `target_platform: 'com'`

### Prioriteit 3: CORS & Security

- [ ] CORS configureren voor:
  - `https://hugoherbots-com.replit.app`
  - `https://hugoherbots.com`
  - `https://*.replit.dev`
- [ ] Rate limiting op chat endpoints
- [ ] API keys server-side houden (nooit naar frontend)
- [ ] Request logging per endpoint voor observability

### Prioriteit 4: Platform Sync

- [ ] Luisteren naar `platform_sync` tabel via Supabase realtime
  - Filter: `target_platform IN ('ai', 'both')`
- [ ] Berichten verwerken en status updaten
- [ ] API spec berichten automatisch toepassen

### Prioriteit 5: RAG & Embeddings

- [ ] Video transcripties indexeren met OpenAI embeddings
  - Bron: Supabase `videos` tabel (transcripties van Cloud Run processing)
  - Opslaan in pgvector (`video_embeddings` tabel)
- [ ] Technieken embeddings uit `technieken_index.json`
  - 54 technieken, 5 fases
  - Sync via `scripts/sync_ssot_to_rag.py`
- [ ] Semantic search voor chat context
- [ ] "Archief" video's: WEL in RAG voor tone of voice, NIET tonen als bron aan gebruikers

---

## Architectuur notities

### Chat flow

```
Gebruiker typt bericht op .com
  → hugoAiApi.sendMessage()
    → POST /api/v2/chat (primair)
    → POST /api/chat (fallback 1)
    → POST /api/chat/message (fallback 2)
  → Response weergeven in TalkToHugoAI component
```

### Activity dual-write flow

```
Gebruiker bekijkt video op .com
  → activityService.logActivity('video_view', { videoId })
    → Promise.allSettled([
        Supabase INSERT into user_activity,
        POST /api/v2/user/activity (naar .ai)
      ])
  → Beide mogen onafhankelijk falen
```

### SSO handoff flow

```
Gebruiker klikt "Open Hugo AI" op .com
  → ssoHandoffService.openAiPlatformInNewTab('/chat')
    → Supabase RPC: generate_sso_handoff_token
    → Open: https://[.ai]/auth/handoff?token=xxx&redirect=/chat
  → .ai valideert token, start sessie, redirect naar /chat
```

---

## Belangrijk: wat NIET te doen

1. **Geen eigen user management** — Gebruik dezelfde Supabase auth
2. **Geen aparte database** — Alles via gedeelde Supabase
3. **Geen API keys in frontend** — Alle model keys (OpenAI etc.) server-side
4. **Archief videos niet tonen** — Wel in RAG voor tone, niet als bron
5. **Geen breaking changes in API** — .com verwacht specifieke response formats (zie api-contract.md)
