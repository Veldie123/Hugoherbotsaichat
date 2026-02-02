# PersonaPlex V3 Audio/Video Roadmap

## Executive Summary

PersonaPlex-7B is NVIDIA's full-duplex speech-to-speech model dat perfect past bij Hugo's coaching filosofie: "Dit is een gesprek, geen rapport." Dit document beschrijft hoe we PersonaPlex kunnen integreren als de "mond en oren" van Hugo, terwijl de coach-engine het "brein" blijft.

## Huidige Architectuur (V2 met Humanizer)

```
┌─────────────────────────────────────────────────────────────┐
│                     HUIDIGE FLOW                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Audio → Deepgram STT → Text                          │
│                                ↓                            │
│                          Coach Engine (GPT)                 │
│                                ↓                            │
│                     Speech Humanizer (pauzes, euh)          │
│                                ↓                            │
│                      ElevenLabs TTS → Audio                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Latency: ~2-4 seconden (STT + LLM + TTS)
Interactie: Turn-based (geen interrupts)
```

## PersonaPlex Architectuur (V3 Concept)

```
┌─────────────────────────────────────────────────────────────┐
│                     PERSONAPLEX FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │           PersonaPlex (7B model)             │          │
│  │  ┌─────────────┐    ┌──────────────────┐    │          │
│  │  │  LISTENER   │←──→│    SPEAKER       │    │          │
│  │  │  (Audio In) │    │   (Audio Out)    │    │          │
│  │  └─────────────┘    └──────────────────┘    │          │
│  │         ↓                   ↑                │          │
│  │   transcript +        speech plan            │          │
│  │   prosody info                               │          │
│  └──────────────────────────────────────────────┘          │
│              ↓                   ↑                          │
│              ↓                   ↑                          │
│         ┌─────────────────────────────┐                    │
│         │     Hugo Coach Engine       │                    │
│         │  - EPIC reasoning           │                    │
│         │  - Technique detection      │                    │
│         │  - RAG grounding           │                    │
│         │  - Evaluator logic         │                    │
│         └─────────────────────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Latency: ~200-500ms (full-duplex, simultaan)
Interactie: Natural (interrupts, backchannels)
```

## Split-Brain Architectuur

### Laag 1: PersonaPlex (Conversational Layer)
- **Rol**: "Mond en Oren" van Hugo
- **Taken**:
  - Luisteren (full-duplex audio streaming)
  - Spreken (natural timing, prosody)
  - Backchannels ("hm", "ja", "precies")
  - Interrupties afhandelen
  - Stiltes laten vallen (denktijd)

### Laag 2: Coach Engine (Cognitive Layer)
- **Rol**: "Brein" van Hugo
- **Taken**:
  - EPIC redenering
  - Techniekdetectie en -suggestie
  - RAG grounding
  - Evaluator logica
  - SSOT consistentie
  - Context gathering

### Communicatie tussen lagen

```typescript
// PersonaPlex → Coach Engine
interface PersonaPlexToCoach {
  transcript: string;
  timing: {
    wordTimestamps: number[];
    speechPace: "slow" | "normal" | "fast";
    pauseDuration: number;
  };
  prosody: {
    confidence: number; // 0-1
    emotion: "neutral" | "frustrated" | "excited" | "uncertain";
    energy: number; // 0-1
  };
  interrupt: boolean; // User interrupted Hugo
}

// Coach Engine → PersonaPlex
interface CoachToPersonaPlex {
  responseText: string;
  deliveryHints: {
    pacing: "slow" | "normal" | "fast";
    emphasis: string[]; // Woorden om te benadrukken
    pauses: { after: string; duration: number }[];
    tone: "supportive" | "challenging" | "neutral";
  };
  allowInterrupt: boolean;
}
```

## Technische Vereisten

### Hardware
- **GPU**: NVIDIA GPU met 16GB+ VRAM (A10, A100, L4)
- **RAM**: 32GB+ systeem RAM
- **Storage**: ~15GB voor modelgewichten

### Software
- Python 3.10+
- CUDA 11.8+
- Moshi framework
- SSL certificaat voor WebSocket

### Hosting Opties

| Optie | Kosten | Latency | Setup |
|-------|--------|---------|-------|
| Replit Reserved VM | ~$50-100/maand | 50-100ms | Eenvoudig |
| Runpod Serverless | ~$0.0002/sec | 100-200ms | Medium |
| Modal Labs | ~$0.0003/sec | 100-200ms | Medium |
| NVIDIA NIM (Enterprise) | Custom | <50ms | Complex |
| Self-hosted (AWS/GCP) | ~$300-500/maand | 30-50ms | Complex |

## Implementatie Roadmap

### Fase 1: Humanizer (DONE ✓)
- [x] Speech humanizer service
- [x] Integratie met LiveKit agent
- [x] Ellipsis/em-dash pauzes
- [x] Nederlandse aarzelingen

### Fase 2: Latency Optimalisatie
- [ ] Streaming responses van coach-engine
- [ ] Parallel LLM + TTS opstarten
- [ ] Response chunking (zin-voor-zin)
- [ ] Pre-caching van veelgebruikte zinnen

### Fase 3: PersonaPlex Pilot
- [ ] Model deployment op Runpod/Modal
- [ ] Basis integratie met WebSocket
- [ ] Hugo persona prompting
- [ ] Fallback naar V2 bij errors

### Fase 4: Full Integration
- [ ] Bidirectional communicatie coach ↔ PersonaPlex
- [ ] Prosody-aware coaching
- [ ] Real-time interrupt handling
- [ ] Production deployment

## PersonaPlex Persona Configuration

```python
# Hugo persona voor PersonaPlex
HUGO_SYSTEM_PROMPT = """
Je bent Hugo, een ervaren sales coach. Je spreekt Nederlands.
Je stijl is:
- Direct maar ondersteunend
- Je denkt hardop
- Je laat stiltes vallen om de verkoper te laten nadenken
- Je gebruikt korte bevestigingen ("hm", "ja", "precies")
- Je stelt nooit meer dan één vraag tegelijk
"""

HUGO_VOICE_PROMPT = "NATM_01"  # Male Dutch-friendly voice
```

## Risico's en Mitigatie

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| GPU beschikbaarheid | Hoog | Fallback naar V2 (ElevenLabs) |
| Model instabiliteit | Medium | Guardrails, content filtering |
| Nederlandse taalondersteuning | Medium | Fine-tuning op NL corpus |
| Latency bij cold start | Laag | Keep-alive, pre-warming |
| Kosten overschrijding | Medium | Rate limiting, usage caps |

## Conclusie

PersonaPlex is een **experience upgrade**, geen feature upgrade. Het transformeert Hugo van "AI die praat" naar "Hugo die naast je zit". 

**Aanbeveling**: 
1. ✅ Fase 1 (Humanizer) nu deployen - direct merkbare verbetering
2. 🔜 Fase 2 (Latency) binnen 2 weken - technische optimalisatie
3. 📋 Fase 3 (PersonaPlex Pilot) als aparte sprint - 2-3 weken werk
4. 📋 Fase 4 (Full Integration) na succesvolle pilot

## Appendix: ElevenLabs vs PersonaPlex

| Feature | ElevenLabs (V2) | PersonaPlex (V3) |
|---------|-----------------|------------------|
| Turn-based | ✓ | Real-time |
| Interrupts | ✗ | ✓ |
| Backchannels | ✗ | ✓ |
| Latency | 1-2s | 200-500ms |
| Nederlandse stem | ✓ | Te trainen |
| Kosten | Per karakter | Per GPU tijd |
| Setup | SaaS | Self-hosted |
| Reliability | Hoog | Medium |
