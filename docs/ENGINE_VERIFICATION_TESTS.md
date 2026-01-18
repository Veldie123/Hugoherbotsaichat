# Hugo V2 Engine Verificatie Tests

Deze tests verifiëren dat de **volledige engine** actief is (niet de vereenvoudigde versie).

## Wat de Volledige Engine Uniek Maakt

| Feature | Vereenvoudigd | Volledig |
|---------|---------------|----------|
| Nested prompts (13+ secties) | ❌ | ✅ |
| Validation + Repair loop | ❌ | ✅ |
| Hugo Persona SSOT | ❌ | ✅ |
| Detector patterns | ❌ | ✅ |
| `repairAttempts` in debug | ❌ | ✅ |
| `validationResult` in debug | ❌ | ✅ |

---

## Test 1: Session Creation - Check Opening Message

```bash
curl -X POST http://localhost:3001/api/v2/sessions \
  -H "Content-Type: application/json" \
  -d '{"techniqueId": "opening-vraag", "mode": "COACH_CHAT"}' | jq
```

**Verwacht bij volledige engine:**
- Response bevat `initialMessage` in Hugo's stijl (Nederlands, coachend)
- Debug info bevat `validationResult` object
- Geen hardcoded/template zinnen

---

## Test 2: Context Gathering - Sector Extraction

```bash
# Eerst sessie starten
SESSION_ID=$(curl -s -X POST http://localhost:3001/api/v2/sessions \
  -H "Content-Type: application/json" \
  -d '{"mode": "CONTEXT_GATHERING"}' | jq -r '.sessionId')

# Context bericht sturen
curl -X POST http://localhost:3001/api/v2/message \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION_ID\", \"content\": \"Ik werk in de IT sector en verkoop CRM software aan grote bedrijven\", \"isExpert\": true}" | jq
```

**Verwacht bij volledige engine:**
- `debug.context.sector` = "IT" of vergelijkbaar
- `debug.context.product` = "CRM software" of vergelijkbaar
- `debug.context.klant_type` = "B2B" of "grote bedrijven"
- Phase transition naar `COACH_CHAT` als sector + product geëxtraheerd

---

## Test 3: Validation Loop - Check Debug Info

```bash
curl -X POST http://localhost:3001/api/v2/message \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION_ID\", \"content\": \"Hoe begin ik een gesprek met een nieuwe klant?\", \"isExpert\": true}" | jq '.debug'
```

**Verwacht bij volledige engine - debug object bevat:**
```json
{
  "validation": {
    "label": "VALID",
    "confidence": 1.0,
    "reasoning": "..."
  },
  "repairAttempts": 0,
  "signalDetection": { ... },
  "techniqueEvaluation": { ... }
}
```

**Als `validation` of `repairAttempts` ONTBREEKT → vereenvoudigde engine actief!**

---

## Test 4: Technique Detection via Detectors

```bash
curl -X POST http://localhost:3001/api/v2/message \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION_ID\", \"content\": \"Ik wil leren hoe ik een goede opening vraag stel\", \"isExpert\": true}" | jq '.debug.signalDetection'
```

**Verwacht bij volledige engine:**
- `signalDetection` object met detected patterns
- Referenties naar technieken uit `technieken_index.json`
- Geen lege/null waarden

---

## Test 5: Hugo Persona Stijl Check

De volledige engine laadt `hugo_persona.json` en past Hugo's stijl toe.

**Check in responses:**
- Toon: Coaching, niet docerend
- Taal: Nederlands, natuurlijk
- Methode: LSD (Luisteren, Samenvatten, Doorvragen)
- Vraagt één vraag per beurt, wacht op antwoord

**Rode vlaggen (vereenvoudigde engine):**
- Engelse woorden/zinnen
- Meerdere vragen in één response
- Generieke AI-stijl antwoorden
- Template-achtige responses

---

## Test 6: Full Conversation Flow

```bash
# 1. Start sessie
SESSION_ID=$(curl -s -X POST http://localhost:3001/api/v2/sessions \
  -H "Content-Type: application/json" \
  -d '{"mode": "CONTEXT_GATHERING"}' | jq -r '.sessionId')

echo "Session: $SESSION_ID"

# 2. Context bericht (moet sector/product extracten)
curl -s -X POST http://localhost:3001/api/v2/message \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION_ID\", \"content\": \"Ik ben sales manager bij een software bedrijf, we verkopen ERP systemen aan MKB\", \"isExpert\": true}" | jq '{phase: .debug.phase, context: .debug.context}'

# 3. Coaching vraag (moet relevante coaching geven)
curl -s -X POST http://localhost:3001/api/v2/message \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION_ID\", \"content\": \"Hoe kan ik beter omgaan met prijsbezwaren?\", \"isExpert\": true}" | jq '{response: .response, validation: .debug.validation}'

# 4. Check repair attempts
curl -s -X POST http://localhost:3001/api/v2/message \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION_ID\", \"content\": \"Kun je me een voorbeeld geven?\", \"isExpert\": true}" | jq '.debug.repairAttempts'
```

---

## Samenvatting: Hoe Weet Je Welke Engine Actief Is?

| Check | Vereenvoudigd | Volledig |
|-------|---------------|----------|
| `debug.validation` bestaat | ❌ Nee | ✅ Ja |
| `debug.repairAttempts` bestaat | ❌ Nee | ✅ Ja (0 of hoger) |
| `debug.signalDetection` bevat patterns | ❌ Leeg/null | ✅ Gevuld |
| Response stijl | Generiek | Hugo persona |
| Nederlands taalgebruik | Wisselend | Consistent |
| Één vraag per beurt | Niet gegarandeerd | Gegarandeerd |

---

## Playwright Test (voor frontend)

Als de andere Replit ook de frontend wil testen:

```
Test Plan:

1. [New Context] Create browser context
2. [Browser] Navigate to /talk-to-hugo (of /admin/chat)
3. [Browser] Select a technique from sidebar
4. [Verify] Check that initial message appears (not "Loading...")
5. [Browser] Type: "Ik werk in IT en verkoop software aan bedrijven"
6. [Browser] Click send button
7. [Verify] Check response appears within 10 seconds
8. [Verify] Response is in Dutch
9. [Verify] Response asks ONE follow-up question
10. [Browser] Open debug panel (admin view only)
11. [Verify] Debug panel shows "validation" section
12. [Verify] Debug panel shows "repairAttempts" field
```

---

## Snelle API Health Check

```bash
# One-liner om te checken of volledige engine actief is:
curl -s -X POST http://localhost:3001/api/v2/sessions \
  -H "Content-Type: application/json" \
  -d '{"mode": "COACH_CHAT"}' | jq 'if .debug.validation then "VOLLEDIGE ENGINE ✅" else "VEREENVOUDIGDE ENGINE ❌" end'
```
