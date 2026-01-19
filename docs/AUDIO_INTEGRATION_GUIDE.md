# Audio Integratie Guide voor Hugo Platform

Dit document beschrijft de volledige audio setup voor voice-based coaching sessies.

---

## Architectuur Overzicht

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  LiveKit Cloud   │◀────│  LiveKit Agent  │
│   (Browser)     │     │  (WebRTC Server) │     │  (Node.js)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                                               │
        │ Audio Stream                                  │ V2 Engine API
        ▼                                               ▼
┌─────────────────┐                            ┌─────────────────┐
│  ElevenLabs     │                            │  Express Server │
│  (STT/Scribe)   │                            │  (Port 5000)    │
└─────────────────┘                            └─────────────────┘
        │                                               │
        │ Transcript                                    │ AI Response
        ▼                                               ▼
┌─────────────────┐                            ┌─────────────────┐
│  ElevenLabs     │◀───────────────────────────│  V2 Engine      │
│  (TTS)          │     Response Text          │  (Coach/Roleplay│
└─────────────────┘                            └─────────────────┘
```

---

## Vereiste Secrets

| Secret | Bron | Doel |
|--------|------|------|
| `LIVEKIT_URL` | LiveKit Cloud Dashboard | WebRTC server URL |
| `LIVEKIT_API_KEY` | LiveKit Cloud Dashboard | API authenticatie |
| `LIVEKIT_API_SECRET` | LiveKit Cloud Dashboard | Token signing |
| `ELEVENLABS_API_KEY` | ElevenLabs Dashboard | STT + TTS |

---

## Server Components

### 1. LiveKit Agent (`server/livekit-agent.ts`)

De agent handelt voice sessions af:

```typescript
// Kernfunctionaliteit:
export default defineAgent({
  prewarm: async (proc) => {
    // Load Silero VAD (Voice Activity Detection)
    proc.userData.vad = await silero.VAD.load();
  },
  
  entry: async (ctx) => {
    // 1. Connect to LiveKit room
    await ctx.connect();
    
    // 2. Setup STT (Speech-to-Text) - Deepgram Nova 3, Nederlands
    const session = new voice.AgentSession({
      stt: new inference.STT({
        model: 'deepgram/nova-3',
        language: 'nl',
      }),
      tts: hugoTTS,  // ElevenLabs
      vad: ctx.proc.userData.vad,
      // NO LLM - V2 engine handles conversation
    });
    
    // 3. Start V2 session
    const { sessionId, greeting } = await startV2Session(techniqueId);
    
    // 4. Speak greeting
    await session.say(greeting);
    
    // 5. Listen for user speech
    session.on('UserInputTranscribed', async (ev) => {
      if (ev.isFinal) {
        const response = await sendMessageToV2(sessionId, ev.transcript);
        await session.say(response);
      }
    });
  }
});
```

**Key features:**
- Silero VAD voor voice activity detection
- Deepgram Nova 3 voor STT (Nederlands)
- ElevenLabs voor TTS (Nederlandse stem)
- V2 Engine voor conversation logic (geen LLM in agent)

---

### 2. ElevenLabs Scribe STT (`server/elevenlabs-stt.ts`)

WebSocket proxy voor realtime speech-to-text:

```typescript
// Client → Server → ElevenLabs flow
export function setupScribeWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws/scribe" });
  
  wss.on("connection", (clientWs) => {
    // Connect to ElevenLabs Scribe API
    const elevenLabsWs = new WS("wss://api.elevenlabs.io/v1/speech-to-text/realtime", {
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY }
    });
    
    // Forward audio from client to ElevenLabs
    clientWs.on("message", (audioData) => {
      elevenLabsWs.send(JSON.stringify({
        message_type: "input_audio_chunk",
        audio_base_64: audioData.toString("base64")
      }));
    });
    
    // Forward transcripts from ElevenLabs to client
    elevenLabsWs.on("message", (data) => {
      const msg = JSON.parse(data);
      if (msg.message_type === "committed_transcript") {
        clientWs.send(JSON.stringify({ type: "transcript", text: msg.text }));
      }
    });
  });
}
```

**Config parameters:**
- Model: `scribe_v2_realtime`
- Sample rate: 16000 Hz
- Language: `nl` (Nederlands)
- VAD silence threshold: 0.5 seconds

---

## Frontend Implementation

### 1. NPM Packages nodig

```bash
npm install livekit-client @livekit/components-react
```

### 2. LiveKit Room Connection

```typescript
import { Room, RoomEvent, Track } from 'livekit-client';

async function connectToVoiceSession(techniqueId: string) {
  // 1. Get token from backend
  const tokenRes = await fetch('/api/livekit/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ techniqueId })
  });
  const { token, url } = await tokenRes.json();
  
  // 2. Create and connect room
  const room = new Room();
  await room.connect(url, token);
  
  // 3. Enable microphone
  await room.localParticipant.setMicrophoneEnabled(true);
  
  // 4. Listen for agent audio
  room.on(RoomEvent.TrackSubscribed, (track) => {
    if (track.kind === Track.Kind.Audio) {
      const audioElement = track.attach();
      document.body.appendChild(audioElement);
    }
  });
  
  return room;
}
```

### 3. Token Endpoint (`/api/livekit/token`)

```typescript
import { AccessToken } from 'livekit-server-sdk';

app.post('/api/livekit/token', (req, res) => {
  const { techniqueId } = req.body;
  const roomName = `hugo-${techniqueId}-${Date.now()}`;
  
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: `user-${Date.now()}`,
      name: 'Trainee'
    }
  );
  
  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true
  });
  
  res.json({
    token: token.toJwt(),
    url: process.env.LIVEKIT_URL,
    roomName
  });
});
```

---

## Audio UI Components

### Phone/Call Interface

```tsx
interface VoiceSessionProps {
  techniqueId: string;
  onEnd: () => void;
}

function VoiceSession({ techniqueId, onEnd }: VoiceSessionProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  
  useEffect(() => {
    // Connect on mount
    connectToVoiceSession(techniqueId).then(setRoom);
    
    // Timer
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    
    return () => {
      clearInterval(interval);
      room?.disconnect();
    };
  }, [techniqueId]);
  
  const toggleMute = async () => {
    if (room) {
      await room.localParticipant.setMicrophoneEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };
  
  const hangUp = () => {
    room?.disconnect();
    onEnd();
  };
  
  return (
    <div className="voice-session">
      <div className="avatar">HH</div>
      <div className="name">Hugo Herbots</div>
      <div className="timer">{formatTime(duration)}</div>
      
      <div className="waveform">
        <AudioVisualizer room={room} />
      </div>
      
      <div className="controls">
        <Button onClick={toggleMute}>
          {isMuted ? <MicOff /> : <Mic />}
          Mute
        </Button>
        <Button variant="destructive" onClick={hangUp}>
          <PhoneOff />
          Ophangen
        </Button>
        <Button>
          <Volume2 />
          Speaker
        </Button>
      </div>
    </div>
  );
}
```

---

## Flow Diagram

```
1. User clicks "Start Voice Session"
   │
2. Frontend requests token from /api/livekit/token
   │
3. Frontend connects to LiveKit room with token
   │
4. LiveKit dispatches job to agent
   │
5. Agent starts V2 session (POST /api/v2/session/start)
   │
6. Agent speaks greeting via ElevenLabs TTS
   │
7. User speaks → Deepgram STT → Transcript
   │
8. Agent sends transcript to V2 (POST /api/v2/session/message)
   │
9. V2 returns AI response
   │
10. Agent speaks response via ElevenLabs TTS
    │
11. Loop steps 7-10 until user hangs up
    │
12. Agent ends V2 session (POST /api/v2/session/end)
```

---

## Troubleshooting

### Agent niet verbonden
```bash
# Check agent logs
grep "LiveKit Agent" /tmp/logs/*.log
```

### Geen audio
- Check `ELEVENLABS_API_KEY` is set
- Check microphone permissions in browser
- Check LiveKit room connection

### Transcript errors
- Check ElevenLabs quota
- Check language setting is `nl`

### TTS issues
- Verify voice ID exists: `wqDY19Brqhu7UCoLadPh` (Dutch male)
- Check ElevenLabs API key has TTS access

---

## ElevenLabs Voice IDs

| Voice | ID | Taal |
|-------|-----|------|
| Dutch Male (default) | `wqDY19Brqhu7UCoLadPh` | NL |
| Hugo Custom (future) | `sOsTzBXVBqNYMd5L4sCU` | NL |

---

## Latency Budget

| Component | Target | Actual |
|-----------|--------|--------|
| STT (Deepgram) | <500ms | ~300ms |
| V2 Engine | <2000ms | ~1500ms |
| TTS (ElevenLabs) | <500ms | ~400ms |
| **Total** | <3000ms | ~2200ms |

---

## Checklist voor Andere Replit

- [ ] `server/livekit-agent.ts` bestaat
- [ ] `server/elevenlabs-stt.ts` bestaat
- [ ] `LIVEKIT_URL` secret geconfigureerd
- [ ] `LIVEKIT_API_KEY` secret geconfigureerd
- [ ] `LIVEKIT_API_SECRET` secret geconfigureerd
- [ ] `ELEVENLABS_API_KEY` secret geconfigureerd
- [ ] `livekit-client` npm package geïnstalleerd
- [ ] `/api/livekit/token` endpoint bestaat
- [ ] Agent wordt gestart bij server startup
- [ ] Frontend VoiceSession component geïmplementeerd
