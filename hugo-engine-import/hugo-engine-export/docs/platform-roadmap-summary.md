# Hugo Platform V2 → Multi-Coach Platform Roadmap

**Datum:** Januari 2026  
**Status:** Planning fase  
**Doel:** Transform Hugo in multi-coach platform builder met Vertex AI integratie

---

## 1. HUIDIGE ARCHITECTUUR ANALYSE

### 1.1 Grounding Flow - Hoe het NU werkt

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STAP 1: PROMPT BUILDING                     │
│  coach-engine.ts → buildNestedOpeningPrompt()                      │
├─────────────────────────────────────────────────────────────────────┤
│  Laadt:                                                            │
│  • hugo_persona.json      → WIE Hugo is                            │
│  • technieken_index.json  → VOLLEDIGE methodologie (alle velden)   │
│  • detectors.json         → GEFILTERD (alleen huidige fase)        │
│  • klant_houdingen.json   → INGEKORT (eerste 2 voorbeelden)        │
│  • persona_templates.json → INGEKORT (alleen descriptions)         │
│  • evaluator_overlay.json → GEFILTERD (alleen huidige techniek)    │
│  • video_mapping.json     → Beschikbare video's                    │
│  • RAG corpus             → 2-4 fragmenten (niet volledig!)        │
│  • Historische context    → User mastery, struggle patterns        │
│  • Gathered context       → Verzamelde info over coachee           │
│  • coaching_richtlijn     → HOE Hugo zich gedraagt                 │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    STAP 2: AI GENEREERT RESPONSE                    │
│  OpenAI GPT krijgt volledige prompt → genereert Hugo's antwoord    │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    STAP 3: VALIDATOR CHECKT                         │
│  response-validator.ts (gpt-4o-mini)                               │
├─────────────────────────────────────────────────────────────────────┤
│  KRIJGT ALLEEN:                                                    │
│  • coaching_richtlijn.tekst                                        │
│  • doel                                                            │
│  • role (what_you_are / what_you_are_not)                          │
│                                                                     │
│  KRIJGT NIET:                                                      │
│  ✗ technieken_index.json                                           │
│  ✗ detectors.json                                                  │
│  ✗ klant_houdingen.json                                            │
│  ✗ persona_templates.json                                          │
│  ✗ RAG corpus                                                      │
│  ✗ Historische context (deels)                                     │
│  ✗ Gathered context                                                │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    STAP 4: REPAIR LOOP                              │
│  Als valid=false → response-repair.ts → max 2 pogingen             │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Geidentificeerde Problemen

| Probleem | Impact |
|----------|--------|
| **Validator te beperkt** | Kan niet checken of Hugo juiste techniek noemt |
| **RAG gefilterd (2-4 docs)** | Relevante info kan gemist worden |
| **Detectors gefilterd per fase** | Cross-fase patterns niet beschikbaar |
| **Geen feedback loop** | Coach correcties gaan nergens heen |
| **global_config.json is cruft** | Dode code, niet gebruikt |

### 1.3 Validator Labels - Huidige vs Benodigde

**Huidige labels:**
- VALID, WRONG_MODE, TOO_DIRECTIVE, MIXED_SIGNALS, NOT_LISTENING, IGNORES_HISTORY

**Ontbrekende labels:**
- WRONG_TECHNIQUE (techniek die niet bestaat)
- WRONG_PHASE (verkeerde fase volgorde)
- HALLUCINATED_FACTS (verzint info)
- INCONSISTENT_ADVICE (conflicteert met methodologie)
- BREAKS_METHODOLOGY (schendt EPIC regels)

---

## 2. VERTEX AI INTEGRATIE PLAN

### 2.1 Memory Bank (Gratis tot Jan 2026)

**Wat het doet:**
- Long-term user memory over sessies heen
- Automatische memory extractie
- Topics: USER_PREFERENCES, KEY_CONVERSATION_DETAILS, EXPLICIT_INSTRUCTIONS

**Voor Hugo:**
- Onthoudt waar user mee worstelt
- Onthoudt mastery levels per techniek
- Personalisatie over sessies heen

### 2.2 RAG Engine (Managed)

**Wat het doet:**
- Video transcripties → embeddings → kennisbank
- Betere retrieval dan huidige 2-4 fragment limiet
- Managed infrastructure

**Voor Hugo:**
- Volledige RAG corpus beschikbaar
- Betere context selectie
- Minder gemiste fragmenten

### 2.3 Agentic RAG

**Wat het doet:**
- AI beslist zelf welke context relevant is
- Multi-tool: RAG + Memory + DB queries
- Dynamische context selectie

**Voor Hugo:**
- Kleinere prompts, betere antwoorden
- Hugo "kiest" zelf welke info hij nodig heeft

### 2.4 Geschatte Kosten

| Service | Kosten |
|---------|--------|
| Memory Bank | Gratis tot Jan 2026 |
| RAG Engine | ~EUR 35-100/maand (laag volume) |
| Agentic RAG | Variabel per query |

---

## 3. MULTI-COACH PLATFORM VISIE

### 3.1 Architectuur

```
┌─────────────────────────────────────────┐
│           PLATFORM CORE                 │
│  (een keer bouwen, altijd hergebruiken) │
├─────────────────────────────────────────┤
│  • Video Processing Pipeline            │
│  • RAG Engine (kennisextractie)         │
│  • Agent Engine (coach gedrag)          │
│  • Memory Bank (user progress)          │
└─────────────────────────────────────────┘
          ↓ Clone per coach
┌──────────┐ ┌──────────┐ ┌──────────┐
│  Hugo    │ │ Coach X  │ │ Coach Y  │
│ (sales)  │ │(fitness) │ │(finance) │
└──────────┘ └──────────┘ └──────────┘
```

### 3.2 Wat Coaches Doen

1. Upload video's met hun methodologie
2. Definieer "fases" en "technieken" (UI, geen code)
3. Systeem genereert RAG + Agent automatisch

### 3.3 Wat Eenmalig Gebouwd Wordt

- Video → transcript → RAG pipeline
- Agent template (gedrag = config, niet code)
- Multi-tenant infrastructure
- Clone-knop

---

## 4. FEEDBACK LOOP ARCHITECTUUR (ONTBREEKT NU)

### 4.1 Gewenste Flow

```
Coach speelt ──► AI maakt fout ──► Coach corrigeert
                                        │
                                        ▼
                                 Config Review
                                 (Admin UI)
                                        │
                                        ▼
                          ┌────────────────────────┐
                          │  CONSISTENCY CHECKER   │
                          │  (dit mist nu!)        │
                          └────────────────────────┘
                                        │
                   ┌────────────────────┼─────────┐
                   ▼                    ▼         ▼
             Update JSON          Update RAG    Flag
             (technieken,         (nieuwe       incon-
              detectors)          voorbeelden)  sisten-
                                               ties
```

### 4.2 Correctie Types

| Type | Actie | Inconsistentie Check |
|------|-------|---------------------|
| Verkeerde techniek verwacht | Update detector patterns | Past nieuwe pattern niet ook op andere technieken? |
| Fase overgang te vroeg | Update fase-regels | Conflicteert met andere overgang-regels? |
| Verkeerde evaluatie | Update scoring criteria | Consistent met andere technieken? |
| Hugo zei iets verkeerd | Update persona/richtlijn | Conflicteert met andere richtlijnen? |

### 4.3 Componenten Nodig

1. **Correctie Schema** - Gestructureerde correctie events
2. **Consistency Checker** - AI die conflicten detecteert
3. **Regression Test Suite** - Golden examples die niet mogen breken
4. **RAG Feedback Injection** - Correcties → nieuwe RAG entries

---

## 5. TWEE REPLITS SITUATIE

### 5.1 Huidige Staat

| Replit 1 (Video Pipeline) | Replit 2 (Hugo Engine) |
|---------------------------|------------------------|
| Google Cloud credentials | Hugo V2 engine |
| Video processing | Chat/Audio/Video UI |
| Greenscreen removal | Coaching logic |
| Mux integratie | Frontend |
| ElevenLabs | RAG service (lokaal) |
| Transcriptie → RAG | Database |

### 5.2 Merge Poging: MISLUKT

- 5+ uur geprobeerd
- Verschillende architecturen
- Dependencies conflicten
- "Nachtmerrie"

### 5.3 Aanbevolen Aanpak: API Integratie

```
Replit 1 (Video/RAG)              Replit 2 (Hugo)
┌────────────────────┐            ┌────────────────────┐
│ Video upload       │            │ Hugo Engine        │
│ Transcriptie       │◄───API────►│ Chat/Audio/Video   │
│ RAG Engine         │            │ Coaching Logic     │
│ Memory Bank        │            │ Frontend           │
└────────────────────┘            └────────────────────┘
```

**Voordelen:**
- Geen merge nodig
- Elk systeem blijft werkend
- Credentials blijven gescheiden
- Later makkelijk uitbreidbaar

---

## 6. OPRUIM TAKEN

### 6.1 global_config.json

**Status:** DOOD - niet gebruikt

| Sectie | Status |
|--------|--------|
| ai_parameters | Nergens aangeroepen |
| stopwords_nl | Alleen in /archive |
| short_answer_fields | Alleen in /archive |
| ui_labels | Frontend heeft eigen labels |

**Actie:** Verwijderen of guardrails verplaatsen naar prompts

### 6.2 Build Functies Aanpassen

| Functie | Probleem | Fix |
|---------|----------|-----|
| buildDetectorPatterns() | Alleen huidige fase | Alle fases includen |
| buildAttitudesContext() | slice(0,2) | Alle voorbeelden |
| buildPersonaContext() | Alleen descriptions | Alle details |
| buildEvaluationCriteria() | Alleen huidige techniek | Alle technieken |

---

## 7. VOLGENDE STAPPEN (PRIORITEIT)

### Fase 1: Fix Huidige Systeem
1. [ ] Validator verrijken met volledige context
2. [ ] Extra validator labels toevoegen
3. [ ] Build functies volledig maken (geen filters)
4. [ ] global_config.json opruimen

### Fase 2: Feedback Loop
1. [ ] Correctie event schema definieren
2. [ ] Config Review UI (al bestaand in andere Replit)
3. [ ] Consistency checker bouwen
4. [ ] Regression test suite opzetten

### Fase 3: Vertex AI Integratie
1. [ ] Google Cloud Project setup (Vertex AI API enabled)
2. [ ] Service Account met juiste roles
3. [ ] Memory Bank integratie
4. [ ] RAG Engine migratie

### Fase 4: API Integratie Twee Replits
1. [ ] API endpoints definieren
2. [ ] Hugo roept RAG/Memory aan via API
3. [ ] Unified session management

### Fase 5: Multi-Coach Schaling
1. [ ] Coach onboarding UI
2. [ ] Video → RAG automatische pipeline
3. [ ] Multi-tenant architectuur
4. [ ] Clone functionaliteit

---

## 8. ARCHITECTUUR PRINCIPES

1. **KNOWLEDGE in config files, BEHAVIOR in prompts**
2. **SSOT (Single Source of Truth)** - technieken_index.json is master
3. **Faciliteren, niet limiteren** - AI Freedom Philosophy
4. **Geen hardcoded zinnen** - AI genereert alles vers
5. **LSD methode** - Luisteren, Samenvatten, Doorvragen
6. **Validate FORM, not CONTENT** - Stijl checken, niet feitelijke correctheid

---

*Dit document dient als referentie voor toekomstige ontwikkeling en gesprekken.*
