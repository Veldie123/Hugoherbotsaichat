# AUDIT.md - hugoherbots.ai (.ai Replit)

**Datum:** 2 februari 2026  
**Doel:** Inventarisatie huidige staat voor platform integratie

---

## 1. DATABASE CONFIGURATIE

### ⚠️ KRITISCHE BEVINDING: Twee aparte databases!

| Database | Doel | Host | Tabellen |
|----------|------|------|----------|
| **Supabase** | Auth (frontend) | `pckctmojjrrgzuufsqoo.supabase.co` | Auth tables only |
| **Replit PostgreSQL** | App data + RAG | `helium` (Replit intern) | 20+ tabellen |

**Implicatie:** De data is NIET gedeeld met .com Replit. Voor integratie moet ofwel:
- Beide apps naar dezelfde Supabase wijzen, OF
- Replit PostgreSQL data migreren naar Supabase

### Supabase Project Details
```
Project ID: pckctmojjrrgzuufsqoo
URL: https://pckctmojjrrgzuufsqoo.supabase.co
Anon Key: [STORED IN ENVIRONMENT VARIABLE: VITE_SUPABASE_ANON_KEY]
```

---

## 2. BESTAANDE TABELLEN (Replit PostgreSQL)

### Core Tables
| Tabel | Beschrijving | Status |
|-------|--------------|--------|
| `users` | Lokale user records | ✅ Actief |
| `sessions` | V1 conversation sessions | ✅ Actief |
| `turns` | Conversation messages | ✅ Actief |
| `v2_sessions` | V2 engine sessions | ✅ Actief |
| `user_context` | User's business context | ✅ Actief |
| `technique_sessions` | Technique-specific context | ✅ Actief |

### Training & Progress Tables
| Tabel | Beschrijving | Status |
|-------|--------------|--------|
| `technique_mastery` | Technique progress tracking | ✅ Schema aanwezig |
| `user_training_profile` | Aggregated user performance | ✅ Schema aanwezig |
| `persona_history` | Roleplay persona outcomes | ✅ Schema aanwezig |

### Video & Live Content Tables
| Tabel | Beschrijving | Status |
|-------|--------------|--------|
| `videos` | Video metadata | ✅ Schema aanwezig |
| `video_progress` | Watch progress per user | ✅ Schema aanwezig |
| `live_sessions` | Live webinar sessions | ✅ Schema aanwezig |
| `live_session_attendees` | Webinar attendance | ✅ Schema aanwezig |

### RAG Tables
| Tabel | Beschrijving | Status |
|-------|--------------|--------|
| `rag_documents` | Vector embeddings corpus | ✅ **559 docs geïndexeerd** |

---

## 3. RAG SERVICE

### Status: ✅ Operationeel

```
Corpus size: 559 documenten
Embedding model: text-embedding-3-small
Vector dimensions: 1536
Index type: ivfflat (pgvector)
```

### RAG Endpoints (server/v2/rag-service.ts)
- `searchSimilarDocuments()` - Semantic search
- `indexDocument()` - Add new document
- `getDocumentCount()` - Corpus statistics

### Metadata velden aanwezig
- `doc_type` - video/webinar/technique/etc
- `title` - Document title
- `content` - Full text
- `embedding` - Vector(1536)

### ⚠️ GAP: Ontbrekende velden voor cross-app
- `visibility` (free/premium) - NIET aanwezig
- `source_app` (.ai/.com) - NIET aanwezig
- `entitlement_required` - NIET aanwezig

---

## 4. AUTH FLOWS

### Status: ✅ Supabase Auth Operationeel

**Ondersteunde flows:**
- ✅ Email/password login
- ✅ OAuth (Google, Azure)
- ✅ Password reset
- ✅ Session persistence (localStorage)
- ✅ Auto refresh tokens

**Client:** `src/utils/supabase/client.ts`

### ⚠️ GAP: Cross-domain SSO
- Geen handoff_tokens tabel
- Geen cross-domain auth endpoints
- Subdomeinen nog niet geconfigureerd

---

## 5. ACTIVITY/EVENTS LOGGING

### Status: ⚠️ Gedeeltelijk

**Wat bestaat:**
| Component | Status | Locatie |
|-----------|--------|---------|
| `activity_log` tabel | ✅ Schema aanwezig | shared/schema.ts |
| `video_progress` tracking | ✅ Schema aanwezig | shared/schema.ts |
| `lastActivityService` | ✅ Frontend only | src/services/lastActivityService.ts |

**Wat NIET bestaat (GAPS):**
| Component | Status | Nodig voor |
|-----------|--------|------------|
| `user_activity` centrale tabel | ❌ Ontbreekt | Omniscient Coach |
| Server-side event logging | ❌ Ontbreekt | Analytics |
| Cross-app events store | ❌ Ontbreekt | Platform integratie |
| `activity-summary` endpoint | ❌ Ontbreekt | Hugo opening message |

---

## 6. MULTI-MODAL INTEGRATIE

### Status: ✅ Operationeel

| Mode | Provider | Status |
|------|----------|--------|
| Chat | OpenAI (gpt-5.1) | ✅ Werkt |
| Audio | LiveKit + ElevenLabs | ✅ Werkt |
| Video | HeyGen Streaming Avatar | ✅ Werkt |

**Voice ID:** `sOsTzBXVBqNYMd5L4sCU` (Hugo Herbots cloned voice)

---

## 7. SSOT CONFIG

### Status: ✅ Lokaal Operationeel

**Bestanden:**
- `config/ssot/technieken_index.json` - 54 technieken
- `config/ssot/coach_overlay_v3_1.json` - Coach overlays
- `config/hugo_persona.json` - Hugo's persona

### ⚠️ GAP: Geen centrale versioning
- Config is file-based, niet database
- Geen draft/published workflow
- Geen sync met .com Replit

---

## 8. ENTITLEMENTS

### Status: ❌ NIET AANWEZIG

**Wat ontbreekt:**
- `user_entitlements` tabel
- `has_entitlement()` DB functie
- RLS policies voor access control
- Stripe subscription sync
- UI gating componenten

---

## 9. GAPS vs PDF FASES

| Fase | Requirement | AS-IS Status | GAP |
|------|-------------|--------------|-----|
| 0 | Entitlement matrix | ❌ Niet aanwezig | Volledig bouwen |
| 0 | Event schema | ⚠️ Gedeeltelijk | Centrale events tabel |
| 0 | Deep link map | ⚠️ Gedeeltelijk | Cross-app links |
| 1 | Shared identity | ✅ Supabase auth | Zelfde project delen |
| 1 | Entitlements | ❌ Niet aanwezig | Volledig bouwen |
| 2 | SSO handoff | ❌ Niet aanwezig | Subdomeinen of handoff |
| 3 | SSOT centralisatie | ⚠️ File-based | Supabase of shared repo |
| 4 | RAG corpus | ✅ 559 docs | Metadata uitbreiden |
| 5 | Analytics | ❌ Niet aanwezig | Events store + views |
| 6 | Chat als epicentrum | ⚠️ Gedeeltelijk | Activity-summary endpoint |

---

## 10. PRIORITEIT ACTIES

### Hoge Prioriteit (Week 1)
1. ✅ Bevestig welke Supabase project .com gebruikt
2. 🔲 Beide apps naar zelfde Supabase wijzen
3. 🔲 `user_activity` tabel aanmaken
4. 🔲 `/api/user/activity-summary` endpoint bouwen

### Medium Prioriteit (Week 2)
5. 🔲 RAG metadata uitbreiden (visibility, source_app)
6. 🔲 Subdomeinen instellen (ai.hugoherbots.com)
7. 🔲 Cookie-based auth configureren

### Lage Prioriteit (Week 3+)
8. 🔲 Entitlements tabel + RLS
9. 🔲 SSOT sync workflow
10. 🔲 Analytics events store

---

## 11. ENV VARS HUIDIGE CONFIGURATIE

| Variabele | Aanwezig | Doel |
|-----------|----------|------|
| `DATABASE_URL` | ✅ | Replit PostgreSQL |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | ✅ | OpenAI via Replit |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | ✅ | OpenAI via Replit |
| `ELEVENLABS_API_KEY` | ✅ | TTS audio |
| `HEYGEN_API_KEY` | ✅ | Video avatar |
| `LIVEKIT_API_KEY` | ✅ | Audio WebRTC |
| `LIVEKIT_API_SECRET` | ✅ | Audio WebRTC |
| `LIVEKIT_URL` | ✅ | Audio WebRTC |

---

## 12. VERGELIJKING MET .COM REPLIT (CORE_AUDIT)

**Goed nieuws:** Beide Replits gebruiken **hetzelfde Supabase project**!

| Aspect | .ai Replit | .com Replit |
|--------|-----------|-------------|
| Supabase project | `pckctmojjrrgzuufsqoo` | `pckctmojjrrgzuufsqoo` |
| RAG location | Replit PostgreSQL | Supabase |
| RAG count | 559 docs | 559 docs |
| SSOT | JSON file | JSON file |
| Entitlements | ❌ | ❌ |
| User Activity | ❌ | ❌ |
| RLS | N/A (lokaal) | ❌ Disabled |

### Belangrijke observaties:

1. **RAG data lijkt gedupliceerd** - Dezelfde 559 docs staan op twee plekken. De .com Supabase versie is waarschijnlijk de bron, .ai heeft een lokale kopie.

2. **Auth is al gedeeld** - Beide apps wijzen naar dezelfde Supabase auth, dus SSO is technisch al mogelijk!

3. **Ontbrekende tabellen zijn identiek** - Beide missen:
   - `user_entitlements`
   - `user_activity` 
   - `profiles`
   - `events`
   - `handoff_tokens`

---

## 13. AANBEVOLEN AANPAK

### Optie A: .ai gebruikt Supabase RAG (Aanbevolen)
- .ai stopt met Replit PostgreSQL voor RAG
- .ai leest rechtstreeks uit Supabase `rag_documents`
- Voordeel: Single source of truth, minder onderhoud

### Optie B: Sync tussen databases
- Periodieke sync van RAG data
- Nadeel: Complexer, meer kans op inconsistentie

### Eerste stappen (beide Replits):
1. ✅ Supabase project is al hetzelfde
2. 🔲 `user_activity` tabel aanmaken in Supabase
3. 🔲 .ai overschakelen naar Supabase RAG
4. 🔲 RLS aanzetten op kritieke tabellen
5. 🔲 Subdomeinen configureren voor SSO

---

## 14. SAMENVATTING

**Sterke punten:**
- RAG corpus is operationeel (559 docs)
- Multi-modal (chat/audio/video) werkt
- Auth via Supabase werkt
- **Supabase project is al gedeeld!**
- SSOT config is compleet

**Kritische gaps:**
- RAG data duplicatie (Supabase vs Replit PostgreSQL)
- Geen entitlements/access control
- Geen centrale activity tracking voor "omniscient coach"
- RLS policies ontbreken

**Aanbeveling:**
1. Kies Supabase als single RAG bron
2. Bouw `user_activity` tabel voor Hugo's geheugen
3. Configureer subdomeinen voor SSO
