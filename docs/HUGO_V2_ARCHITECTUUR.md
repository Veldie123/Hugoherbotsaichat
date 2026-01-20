# Hugo V2 Engine Architectuur - Januari 2026

## Overzicht

De Hugo V2 Engine is een AI-gedreven sales coaching platform met rollenspellen, grounding via RAG, en dynamische klant-simulatie.

---

## 1. RAG GROUNDING (Semantic Search)

### Bestanden
- `server/v2/rag-service.ts` - Hoofd RAG service (280 regels)

### Hoe het werkt
1. **Embeddings**: OpenAI `text-embedding-3-small` (1536 dimensies)
2. **Database**: PostgreSQL met pgvector extensie
3. **Similarity Search**: Cosine similarity via ivfflat index
4. **Corpus**: 130+ documenten geïndexeerd uit Hugo's trainingsmateriaal

### Code Flow
```typescript
// server/v2/rag-service.ts

// Embeddings genereren
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const client = getOpenAIClientForEmbeddings();
  if (!client) return null;
  
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// Semantic search
export async function searchRag(
  query: string,
  options: { limit?: number; threshold?: number; docType?: string; }
): Promise<RagSearchResult> {
  const embedding = await generateEmbedding(query);
  
  // pgvector cosine similarity search
  const result = await pool.query(`
    SELECT id, doc_type, title, content, 
           1 - (embedding <=> $1::vector) as similarity
    FROM rag_documents
    WHERE 1 - (embedding <=> $1::vector) > $2
    ORDER BY similarity DESC
    LIMIT $3
  `, [embedding, threshold, limit]);
  
  return { documents: result.rows, query, searchTimeMs };
}
```

### Gebruik in Coach Engine
```typescript
// server/v2/coach-engine.ts

async function buildRagContext(userMessage: string, techniqueId?: string): Promise<string> {
  const ragDocs = await searchRag(userMessage, { limit: 5, threshold: 0.7 });
  
  if (ragDocs.documents.length === 0) {
    return "(Geen specifieke trainingscontext gevonden)";
  }
  
  return ragDocs.documents
    .map(d => `## ${d.title}\n${d.content}`)
    .join('\n\n');
}

// Toegevoegd aan system prompt als:
// RELEVANTE TRAININGSCONTEXT:
// [RAG documenten hier]
```

---

## 2. CUSTOMER DYNAMICS (Klant Dynamiek)

### Bestanden
- `server/houding-selector.ts` - CustomerDynamics model (415 regels)
- `config/customer_dynamics.json` - Configuratie waarden

### 3 Dynamische Variabelen
| Variabele | Bereik | Betekenis |
|-----------|--------|-----------|
| `rapport` | 0-1 | Vertrouwensrelatie met verkoper |
| `valueTension` | 0-1 | Spanning rond waardepropositie |
| `commitReadiness` | 0-1 | Bereidheid om te committeren |

### Interface
```typescript
// server/houding-selector.ts

export interface CustomerDynamics {
  rapport: number;       // 0..1
  valueTension: number;  // 0..1
  commitReadiness: number; // 0..1
}
```

### Initialisatie (per sessie)
```typescript
// server/houding-selector.ts

export function initializeCustomerDynamics(
  persona: ResolvedPersona,
  personaTemplates: any
): CustomerDynamics {
  const config = loadDynamicsConfig();
  const startValues = config.start_values;
  
  // Base values
  let rapport = startValues.rapport_base;  // 0.5
  let valueTension = config.buying_clock_valueTension[persona.buying_clock_stage];
  
  // Apply behavior_style modifiers
  const behaviorMod = startValues.behavior_style_modifiers?.[persona.behavior_style];
  if (behaviorMod) {
    rapport += behaviorMod.rapport || 0;
    valueTension += behaviorMod.valueTension || 0;
  }
  
  // Apply difficulty modifiers
  const diffMod = startValues.difficulty_modifiers?.[persona.difficulty_level];
  if (diffMod) {
    rapport += diffMod.rapport || 0;
    valueTension += diffMod.valueTension || 0;
  }
  
  // Calculate commitReadiness via formula
  const formula = config.commitReadiness_formula;
  const stageFactor = config.buying_clock_stage_factor[persona.buying_clock_stage];
  const commitReadiness = (formula.base + 
    formula.valueTension_weight * valueTension + 
    formula.rapport_weight * rapport) * stageFactor;
  
  return {
    rapport: clamp(rapport, 0, 1),
    valueTension: clamp(valueTension, 0, 1),
    commitReadiness: clamp(commitReadiness, 0, 1)
  };
}
```

### Update per Beurt
```typescript
// server/houding-selector.ts

export function updateCustomerDynamics(
  dynamics: CustomerDynamics,
  evaluationQuality: 'perfect' | 'goed' | 'bijna' | 'niet' | 'gemist',
  epicPhase?: string,
  detectedThema?: string
): CustomerDynamics {
  const config = loadDynamicsConfig();
  let { rapport, valueTension, commitReadiness } = dynamics;
  
  // 1. Apply evaluation quality effects (primary driver)
  const evalEffects = config.evaluation_effects?.[evaluationQuality];
  if (evalEffects) {
    rapport += evalEffects.rapport || 0;
    valueTension += evalEffects.valueTension || 0;
    commitReadiness += evalEffects.commitReadiness || 0;
  }
  
  // 2. Apply EPIC phase effects (when technique matches phase)
  if (epicPhase && evaluationQuality !== 'niet') {
    const phaseEffects = config.epic_phase_effects?.[epicPhase];
    if (phaseEffects) {
      rapport += phaseEffects.rapport || 0;
      valueTension += phaseEffects.valueTension || 0;
      commitReadiness += phaseEffects.commitReadiness || 0;
    }
  }
  
  return {
    rapport: clamp(rapport, 0, 1),
    valueTension: clamp(valueTension, 0, 1),
    commitReadiness: clamp(commitReadiness, 0, 1)
  };
}
```

### Config (customer_dynamics.json)
```json
{
  "start_values": {
    "rapport_base": 0.5,
    "valueTension_base": 0.3,
    "behavior_style_modifiers": {
      "analytisch": { "rapport": -0.1, "valueTension": 0.1 },
      "expressief": { "rapport": 0.1, "valueTension": -0.05 }
    },
    "difficulty_modifiers": {
      "makkelijk": { "rapport": 0.15 },
      "gemiddeld": { "rapport": 0 },
      "moeilijk": { "rapport": -0.15 }
    }
  },
  "evaluation_effects": {
    "perfect": { "rapport": 0.15, "valueTension": 0.05, "commitReadiness": 0.1 },
    "goed": { "rapport": 0.08, "valueTension": 0.03 },
    "bijna": { "rapport": 0.03 },
    "niet": { "rapport": -0.1, "valueTension": -0.05 },
    "gemist": { "rapport": -0.05 }
  },
  "epic_phase_effects": {
    "explore": { "valueTension": 0.05 },
    "probe": { "valueTension": 0.08, "rapport": 0.03 },
    "impact": { "commitReadiness": 0.1 },
    "commit": { "commitReadiness": 0.15 }
  }
}
```

---

## 3. HOUDINGEN (Klant Attitudes → Verwachte Techniek)

### Bestanden
- `config/klant_houdingen.json` - Houding definities
- `server/v2/customer_engine.ts` - Houding generatie (664 regels)

### 9 Houding Types (CustomerSignal)
```typescript
// server/v2/customer_engine.ts

export type CustomerSignal = 
  | 'positief'
  | 'negatief'
  | 'vaag'
  | 'ontwijkend'
  | 'vraag'
  | 'twijfel'
  | 'bezwaar'
  | 'uitstel'
  | 'angst';
```

### Houding → Verwachte Techniek Mapping
| Houding | Beschrijving | Verwachte Technieken |
|---------|-------------|---------------------|
| positief | Klant is enthousiast | Doorpakken, Afsluiten |
| negatief | Klant is kritisch | Onderzoeken, Empathie |
| vaag | Onduidelijk antwoord | Doorvragen, Concretiseren |
| ontwijkend | Vermijdt onderwerp | Terugkoppelen, Confronteren |
| vraag | Stelt inhoudelijke vraag | Beantwoorden met waarde |
| twijfel | Onzeker over keuze | Bevestigen, Geruststellen |
| bezwaar | Expliciet bezwaar | Ombuigen, Prijs verdedigen |
| uitstel | Wil wachten | Urgentie creëren |
| angst | Bang voor risico | Geruststellen, Social proof |

### Config (klant_houdingen.json)
```json
{
  "houdingen": {
    "bezwaar": {
      "id": "bezwaar",
      "naam": "Bezwaar",
      "houding_beschrijving": "Klant uit expliciet bezwaar tegen prijs, timing, of product",
      "recommended_technique_ids": ["3.2", "3.3"],
      "semantic_markers": [
        "te duur",
        "geen budget",
        "concurrent is beter",
        "moet eerst met collega overleggen"
      ],
      "fallback_response": "Ik weet het niet hoor, dit is best prijzig voor wat het is."
    },
    "positief": {
      "id": "positief",
      "naam": "Positief",
      "houding_beschrijving": "Klant toont interesse en openheid",
      "recommended_technique_ids": ["4.1", "4.2"],
      "semantic_markers": [
        "interessant",
        "klinkt goed",
        "vertel me meer"
      ],
      "fallback_response": "Dat klinkt inderdaad interessant, vertel eens verder."
    }
  },
  "expected_moves_scoring": {
    "recommended_match_bonus": 15,
    "no_match_penalty": -5
  }
}
```

### Customer Engine: Houding Response Generatie
```typescript
// server/v2/customer_engine.ts

export async function generateCustomerResponse(
  contextState: ContextState,
  persona: Persona,
  attitude: CustomerSignal,
  sellerMessage: string,
  dynamics: CustomerDynamics,
  conversationHistory: Message[]
): Promise<CustomerResponse> {
  const config = loadRoleplayPromptConfig();
  const houdingConfig = loadHoudingen();
  
  // Build prompt with attitude-specific guidance
  const attitudeEntry = houdingConfig.houdingen[attitude];
  const phaseGuideline = config.epic_phase_guidelines[contextState.epicPhase];
  
  const systemPrompt = `
Je bent een klant in een sales rollenspel.
Huidige houding: ${attitudeEntry.naam} - ${attitudeEntry.houding_beschrijving}

EPIC Fase: ${contextState.epicPhase}
${phaseGuideline}

Reageer authentiek vanuit deze houding. 
Gebruik eventueel deze markers: ${attitudeEntry.semantic_markers.join(', ')}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: sellerMessage }
    ]
  });
  
  return {
    message: response.choices[0].message.content,
    signal: attitude,
    dynamics: dynamics
  };
}
```

---

## 4. DETECTORS (Gedetecteerde Techniek)

### Bestanden
- `config/detectors.json` - Detectie patronen
- `config/ssot/evaluator_overlay.json` - Scoring rubrics
- `server/v2/evaluator.ts` - AI-based evaluatie (767 regels)

### Detectie Aanpak: AI Conceptueel (niet regex)
De evaluator gebruikt AI om te bepalen of een techniek correct is toegepast:

```typescript
// server/v2/evaluator.ts

export interface EvaluationEvent {
  techniqueId: string;
  expected: string;           // Verwachte techniek naam
  detected: string | null;    // Gedetecteerde techniek ID
  detectedName: string | null; // Gedetecteerde techniek naam
  quality: 'perfect' | 'goed' | 'bijna' | 'niet' | 'gemist';
  feedback: string;           // Coaching feedback
  score: number;              // 0-100
  debug?: {
    ragContext: string;
    ssotContext: string;
    goldenExamples: ReferenceAnswer[];
  };
}
```

### Evaluatie Flow
```typescript
// server/v2/evaluator.ts

export async function evaluateTechnique(
  sellerMessage: string,
  expectedTechniqueId: string,
  customerSignal: CustomerSignal,
  context: EvaluationContext
): Promise<EvaluationEvent> {
  const config = loadEvaluatorConfig();
  
  // 1. Load technique definition from SSOT
  const technique = getTechnique(expectedTechniqueId);
  const scoringRubric = getScoringRubric(expectedTechniqueId);
  
  // 2. Load detector patterns
  const detectors = loadDetectors();
  const detectorPatterns = detectors.technique_detectors[expectedTechniqueId];
  
  // 3. Load golden standards (few-shot examples)
  const goldenExamples = await getExamplesForTechnique(expectedTechniqueId);
  
  // 4. Get RAG training context
  const ragContext = await getTrainingContext(technique.naam);
  
  // 5. Build evaluation prompt
  const systemPrompt = buildEvaluationPrompt(
    config.prompt_template,
    technique,
    detectorPatterns,
    scoringRubric,
    ragContext,
    goldenExamples
  );
  
  // 6. AI evaluation
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `
KLANT SIGNAAL: ${customerSignal}
VERKOPER ANTWOORD: ${sellerMessage}

Evalueer dit antwoord.
` }
    ],
    response_format: { type: "json_object" }
  });
  
  const result = JSON.parse(response.choices[0].message.content);
  
  return {
    techniqueId: expectedTechniqueId,
    expected: technique.naam,
    detected: result.detected_technique_id,
    detectedName: result.detected_technique_name,
    quality: result.quality,
    feedback: result.feedback,
    score: result.score
  };
}
```

### Detector Config (detectors.json)
```json
{
  "technique_detectors": {
    "1.1": {
      "id": "1.1",
      "name": "Koopklimaat creëren",
      "detection_patterns": [
        "verwelkoming met naam",
        "open vraag over welzijn",
        "positieve sfeer creëren",
        "oprechte interesse tonen"
      ],
      "negative_indicators": [
        "direct over product beginnen",
        "geen begroeting",
        "zakelijke toon zonder warmte"
      ],
      "scoring_weights": {
        "pattern_match": 0.4,
        "negative_absence": 0.3,
        "overall_quality": 0.3
      }
    },
    "2.3": {
      "id": "2.3",
      "name": "Pijn/probleem verdiepen",
      "detection_patterns": [
        "impact vraag stellen",
        "gevolgen uitvragen",
        "emotie aanspreken",
        "doorvragen op pijnpunt"
      ],
      "negative_indicators": [
        "te snel naar oplossing",
        "oppervlakkig blijven",
        "eigen aannames invullen"
      ]
    }
  }
}
```

### Scoring Rubric (evaluator_overlay.json)
```json
{
  "prompt_template": {
    "system": "Je bent een expert sales trainer die verkopertechnieken evalueert.",
    "evaluation_method": "Vergelijk het antwoord met de techniek definitie en detection patterns.",
    "format": "Geef een JSON met: detected_technique_id, quality, score, feedback"
  },
  "technieken": {
    "1.1": {
      "rubric": {
        "perfect": { "score": 100, "criteria": "Alle elementen aanwezig, natuurlijke uitvoering" },
        "goed": { "score": 75, "criteria": "Meeste elementen aanwezig" },
        "bijna": { "score": 50, "criteria": "Poging zichtbaar maar incompleet" },
        "niet": { "score": 25, "criteria": "Verkeerde techniek of geen match" }
      }
    }
  }
}
```

---

## 5. VOLLEDIGE FLOW (Roleplay Sessie)

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER MESSAGE BINNENKOMT                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 1. CONTEXT GATHERING (als nog niet compleet)                   │
│    server/v2/context_engine.ts                                  │
│                                                                 │
│    Verzamel via slot-based systeem:                            │
│    - bedrijfsnaam, branche, doelgroep                          │
│    - klantnaam, functie, beslissingsniveau                     │
│    - situatie, pijnpunt, gewenste uitkomst                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. HOUDING SELECTIE                                             │
│    server/houding-selector.ts                                   │
│                                                                 │
│    Input: CustomerDynamics + epicPhase + previousHouding       │
│    Output: SelectedHouding (bv. "bezwaar")                     │
│                                                                 │
│    Algoritme:                                                   │
│    - Filter op fase_restrictie                                  │
│    - Weeg probability op dynamics                               │
│    - Random select met weighted distribution                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. CUSTOMER RESPONSE GENERATIE                                  │
│    server/v2/customer_engine.ts                                 │
│                                                                 │
│    Input: ContextState + persona + houding + sellerMessage     │
│    Output: CustomerResponse { message, signal, dynamics }       │
│                                                                 │
│    - Laad houding config (semantic_markers, fallback)          │
│    - Genereer authentiek klant antwoord via AI                 │
│    - Label met CustomerSignal (houding type)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. VERKOPER EVALUATIE (volgende beurt)                         │
│    server/v2/evaluator.ts                                       │
│                                                                 │
│    Wanneer verkoper reageert:                                   │
│    - Bepaal verwachte techniek (uit houding.recommended_ids)   │
│    - Laad detector patterns                                     │
│    - Laad golden standards (few-shot examples)                  │
│    - AI evaluatie met RAG grounding                             │
│    - Score: perfect/goed/bijna/niet/gemist                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. DYNAMICS UPDATE                                              │
│    server/houding-selector.ts                                   │
│                                                                 │
│    updateCustomerDynamics(dynamics, evaluationQuality, phase)  │
│                                                                 │
│    Effects:                                                     │
│    - Perfect → rapport +0.15, commitReadiness +0.1             │
│    - Goed → rapport +0.08                                      │
│    - Niet → rapport -0.1                                       │
│    - Phase bonus (explore → valueTension +0.05)                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. RESPONSE + DEBUG INFO                                        │
│                                                                 │
│    Return naar frontend:                                        │
│    {                                                            │
│      response: "Klant antwoord...",                            │
│      debug: {                                                   │
│        customerDynamics: { rapport, valueTension, commit },    │
│        signal: "bezwaar",                                       │
│        expectedTechnique: "Ombuigen",                          │
│        detectedTechnique: "Prijs verdedigen",                  │
│        evaluation: { quality: "goed", score: 75 }              │
│      }                                                          │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. BESTANDEN OVERZICHT

### Engine Core (server/v2/)
| Bestand | Regels | Functie |
|---------|--------|---------|
| `coach-engine.ts` | 1080 | COACH_CHAT mode, RAG grounding |
| `customer_engine.ts` | 664 | Klant response generatie |
| `evaluator.ts` | 767 | Techniek detectie en scoring |
| `context_engine.ts` | 1200+ | Slot-based context gathering |
| `rag-service.ts` | 280 | Semantic search met embeddings |
| `roleplay-engine.ts` | 1700+ | Orchestratie van roleplay |
| `response-repair.ts` | 300 | JSON validation en repair loop |
| `orchestrator.ts` | 400 | V3 gate system |

### Supporting (server/)
| Bestand | Functie |
|---------|---------|
| `houding-selector.ts` | CustomerDynamics + houding selectie |
| `ssot-loader.ts` | SSOT technieken laden |
| `hugo-persona-loader.ts` | Hugo persona en prompts |
| `api.ts` | Express API endpoints |

### Config Files (config/)
| Bestand | Functie |
|---------|---------|
| `klant_houdingen.json` | 9 houding types + verwachte technieken |
| `customer_dynamics.json` | Dynamics formules en effects |
| `detectors.json` | Techniek detectie patronen |
| `persona_templates.json` | Klant persona's |

### SSOT (config/ssot/)
| Bestand | Functie |
|---------|---------|
| `techniques_index.json` | 25 technieken in 5 EPIC fases |
| `evaluator_overlay.json` | Scoring rubrics per techniek |
| `coach_overlay_v3_1.json` | V3 gate system en artifacts |

---

## 7. API ENDPOINTS

### Sessie Management
```
POST /api/v2/session/create     → Nieuwe sessie starten
POST /api/v2/session/message    → Bericht sturen (roleplay)
GET  /api/v2/session/:id        → Sessie ophalen
DELETE /api/v2/session/:id      → Sessie verwijderen
```

### Response Format (POST /api/v2/session/message)
```typescript
interface SendMessageResponse {
  response: string;              // Klant antwoord
  promptsUsed: string[];         // Gebruikte prompts
  debug?: {
    customerDynamics: CustomerDynamics;
    signal: CustomerSignal;
    expectedTechnique: string;
    detectedTechnique: string | null;
    evaluation: EvaluationEvent;
    ragContext: string;
    promptsUsed: string[];
  };
}
```

---

## 8. KEY TAKEAWAYS

1. **RAG Grounding**: Alle coaching responses zijn gegrond in Hugo's trainingsmateriaal via semantic search
2. **CustomerDynamics**: 3 variabelen (rapport, valueTension, commitReadiness) evolueren per beurt
3. **Houdingen → Verwachte Techniek**: Elke klanthouding heeft recommended_technique_ids
4. **AI Detectie**: Geen regex, maar conceptuele AI evaluatie met few-shot examples
5. **Config Driven**: Alle Dutch teksten en parameters uit JSON config files
