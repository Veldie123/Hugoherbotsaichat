# Backend Integratie Prompt: Gesprek Analyse Systeem

## Context
HugoHerbots.ai heeft een **Gesprek Analyse** feature met twee modules:
1. **Upload Roleplay** - Gebruikers uploaden opgenomen sales gesprekken (audio/video)
2. **Live Analyse** - Gebruikers krijgen real-time coaching tijdens live gesprekken

Deze prompt beschrijft ALLE contactpunten tussen frontend en backend voor de volledige flow.

---

## 📂 Files Betrokken

### Frontend Components:
- `/components/HH/ConversationAnalysis.tsx` - Main page met beide modules
- `/components/HH/AnalysisResults.tsx` - Results page na analyse
- `/components/HH/AdminSessions.tsx` - Admin view voor alle analyses

### Backend:
- `/supabase/functions/server/index.tsx` - Hono server met routes
- Supabase Storage bucket: `make-b9a572ea-conversation-uploads`
- KV Store tables voor analyse metadata

---

## 🔄 MODULE 1: Upload Roleplay Flow

### **STAP 1: Gebruiker Upload Bestand**
📍 **Component:** `ConversationAnalysis.tsx` (Upload Roleplay tab)

#### Frontend Acties:
1. Gebruiker sleept/selecteert audio of video bestand (MP3, WAV, M4A, MP4, MOV)
2. Frontend validatie:
   - File type check (MIME + extensie)
   - File size check (max 50MB)
   - iCloud placeholder check (.icloud extensie)
3. Gebruiker vult in:
   - **Title** (verplicht): Naam van het gesprek
   - **Context** (optioneel): Beschrijving/situatie

#### Backend Contact Point #1: **File Upload naar Storage**

**Endpoint:** `POST /make-server-b9a572ea/analysis/upload`

**Frontend Request:**
```typescript
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('title', title);
formData.append('context', context);
formData.append('userId', user.id);
formData.append('userName', user.name);

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-b9a572ea/analysis/upload`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`, // User's auth token
    },
    body: formData,
  }
);
```

**Backend Verwerking:**
```typescript
// 1. Auth check - Verify user is logged in
const accessToken = request.headers.get('Authorization')?.split(' ')[1];
const { data: { user }, error } = await supabase.auth.getUser(accessToken);
if (!user) return new Response('Unauthorized', { status: 401 });

// 2. Extract file from FormData
const formData = await request.formData();
const file = formData.get('file') as File;
const title = formData.get('title') as string;
const context = formData.get('context') as string;
const userId = user.id;

// 3. Validate file
if (!file || file.size > 50 * 1024 * 1024) {
  return Response.json({ error: 'Invalid file' }, { status: 400 });
}

// 4. Generate unique filename
const fileExt = file.name.split('.').pop();
const fileName = `${userId}/${Date.now()}_${crypto.randomUUID()}.${fileExt}`;

// 5. Upload to Supabase Storage bucket
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('make-b9a572ea-conversation-uploads')
  .upload(fileName, file, {
    contentType: file.type,
    cacheControl: '3600',
  });

if (uploadError) {
  return Response.json({ error: 'Upload failed' }, { status: 500 });
}

// 6. Create analysis record in KV Store
const analysisId = crypto.randomUUID();
const analysisRecord = {
  id: analysisId,
  userId: userId,
  userName: user.user_metadata?.name || 'Onbekend',
  title: title,
  context: context || '',
  type: file.type.startsWith('audio') ? 'audio' : 'video',
  fileName: fileName,
  fileSize: file.size,
  uploadDate: new Date().toISOString(),
  status: 'processing', // processing | completed | failed
  processingStarted: new Date().toISOString(),
};

await kv.set(`analysis:${analysisId}`, analysisRecord);

// 7. Trigger AI processing job (background)
await triggerAnalysisProcessing(analysisId, fileName, file.type);

// 8. Return analysis ID to frontend
return Response.json({
  success: true,
  analysisId: analysisId,
  status: 'processing',
  message: 'Upload succesvol. Analyse wordt verwerkt...',
});
```

**Frontend Response Handling:**
```typescript
// ConversationAnalysis.tsx - handleUpload()
const result = await response.json();

if (result.success) {
  // 1. Reset form
  setSelectedFile(null);
  setTitle('');
  setContext('');
  setIsUploading(false);
  
  // 2. Show success message
  toast.success('Upload succesvol! Analyse wordt verwerkt...');
  
  // 3. Optionally: Poll for processing status OR use WebSocket
  pollAnalysisStatus(result.analysisId);
  
  // 4. Refresh analyses list
  fetchUserAnalyses();
}
```

---

### **STAP 2: AI Processing (Backend Background Job)**

**Backend Contact Point #2: AI Analysis Processing**

**Endpoint:** Internal function `triggerAnalysisProcessing()`

**Verwerking:**
```typescript
async function triggerAnalysisProcessing(
  analysisId: string, 
  fileName: string, 
  fileType: string
) {
  // 1. Download file from Supabase Storage
  const { data: fileBlob } = await supabase.storage
    .from('make-b9a572ea-conversation-uploads')
    .download(fileName);
  
  // 2. Transcribe audio/video → Text
  const transcript = await transcribeAudio(fileBlob); // OpenAI Whisper API
  
  // 3. Analyze transcript with AI
  const analysis = await analyzeTranscript(transcript); // OpenAI GPT-4 + EPIC context
  
  // Analysis output:
  // - Overall score (0-100)
  // - Phase scores (Fase 1-4)
  // - Technique usage detection (25 EPIC techniques)
  // - Timeline (timestamp → technique → score)
  // - Plus/min points per phase
  // - Hugo's feedback per phase
  // - Improvement suggestions
  
  // 4. Update analysis record in KV Store
  const analysisRecord = await kv.get(`analysis:${analysisId}`);
  analysisRecord.status = 'completed';
  analysisRecord.processingCompleted = new Date().toISOString();
  analysisRecord.duration = calculateDuration(transcript); // "24:18"
  analysisRecord.transcript = transcript;
  analysisRecord.results = {
    overallScore: analysis.overallScore,
    benchmark: analysis.benchmark, // User's avg
    topPerformer: analysis.topPerformer, // Team's best
    phaseScores: analysis.phaseScores,
    timeline: analysis.timeline,
    topTechnique: analysis.topTechnique,
    scoreDelta: analysis.scoreDelta, // "up" | "down" | "neutral"
  };
  
  await kv.set(`analysis:${analysisId}`, analysisRecord);
  
  // 5. Notify user (email/push notification)
  await sendNotification(analysisRecord.userId, {
    title: 'Analyse voltooid!',
    body: `Je gesprek "${analysisRecord.title}" is geanalyseerd. Score: ${analysis.overallScore}%`,
    link: `/analysis-results?id=${analysisId}`,
  });
}
```

---

### **STAP 3: Frontend Polling voor Status Updates**

**Backend Contact Point #3: Poll Analysis Status**

**Endpoint:** `GET /make-server-b9a572ea/analysis/status/:analysisId`

**Frontend Request:**
```typescript
// ConversationAnalysis.tsx - pollAnalysisStatus()
const pollInterval = setInterval(async () => {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-b9a572ea/analysis/status/${analysisId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  const data = await response.json();
  
  if (data.status === 'completed') {
    clearInterval(pollInterval);
    toast.success('Analyse voltooid!');
    // Optionally: Auto-navigate to results
    navigate('analysis-results', { analysisId });
  } else if (data.status === 'failed') {
    clearInterval(pollInterval);
    toast.error('Analyse mislukt. Probeer opnieuw.');
  }
}, 3000); // Poll every 3 seconds
```

**Backend Response:**
```typescript
// GET /analysis/status/:analysisId
const analysisRecord = await kv.get(`analysis:${analysisId}`);

if (!analysisRecord || analysisRecord.userId !== user.id) {
  return Response.json({ error: 'Not found' }, { status: 404 });
}

return Response.json({
  status: analysisRecord.status, // "processing" | "completed" | "failed"
  progress: analysisRecord.progress || 0, // 0-100 (optional)
  message: getStatusMessage(analysisRecord.status),
});
```

---

### **STAP 4: Gebruiker Bekijkt Analyse Resultaten**

📍 **Component:** `AnalysisResults.tsx`

**Backend Contact Point #4: Fetch Analysis Results**

**Endpoint:** `GET /make-server-b9a572ea/analysis/results/:analysisId`

**Frontend Request:**
```typescript
// AnalysisResults.tsx - useEffect
useEffect(() => {
  async function fetchResults() {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-b9a572ea/analysis/results/${analysisId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    const data = await response.json();
    setAnalysisData(data);
  }
  
  fetchResults();
}, [analysisId]);
```

**Backend Response:**
```typescript
const analysisRecord = await kv.get(`analysis:${analysisId}`);

if (!analysisRecord || analysisRecord.userId !== user.id) {
  return Response.json({ error: 'Not found' }, { status: 404 });
}

return Response.json({
  // Metadata
  id: analysisRecord.id,
  title: analysisRecord.title,
  uploadDate: analysisRecord.uploadDate,
  duration: analysisRecord.duration,
  type: analysisRecord.type,
  
  // Scores
  overallScore: analysisRecord.results.overallScore,
  benchmark: analysisRecord.results.benchmark,
  topPerformer: analysisRecord.results.topPerformer,
  scoreDelta: analysisRecord.results.scoreDelta,
  topTechnique: analysisRecord.results.topTechnique,
  
  // Detailed results
  phaseScores: analysisRecord.results.phaseScores,
  timeline: analysisRecord.results.timeline,
  transcript: analysisRecord.transcript,
  
  // Audio file (signed URL for playback)
  audioUrl: await getSignedUrl(analysisRecord.fileName),
});
```

---

### **STAP 5: Gebruiker Lijst Bekijken (Geschiedenis)**

📍 **Component:** `ConversationAnalysis.tsx` (Upload Roleplay tab - analyses list)

**Backend Contact Point #5: Fetch User's Analyses**

**Endpoint:** `GET /make-server-b9a572ea/analysis/list`

**Frontend Request:**
```typescript
// ConversationAnalysis.tsx - useEffect
useEffect(() => {
  async function fetchAnalyses() {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-b9a572ea/analysis/list`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    const data = await response.json();
    setAnalyses(data.analyses);
  }
  
  fetchAnalyses();
}, []);
```

**Backend Response:**
```typescript
// GET /analysis/list
const allAnalyses = await kv.getByPrefix(`analysis:`);

// Filter by user
const userAnalyses = allAnalyses
  .filter(a => a.userId === user.id)
  .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)); // Newest first

return Response.json({
  analyses: userAnalyses.map(a => ({
    id: a.id,
    title: a.title,
    type: a.type,
    uploadDate: formatDate(a.uploadDate),
    duration: a.duration,
    status: a.status,
    overallScore: a.results?.overallScore,
    scoreDelta: a.results?.scoreDelta,
    topTechnique: a.results?.topTechnique,
    phase: a.results?.phase,
  })),
});
```

---

## 🔄 MODULE 2: Live Analyse Flow

### **STAP 1: Gebruiker Start Live Copilot**

📍 **Component:** `ConversationAnalysis.tsx` (Live Analyse tab)

#### Frontend Acties:
1. Gebruiker klikt "Start Live Copilot"
2. Browser mic permission requested
3. Real-time audio streaming starts

**Backend Contact Point #6: Initialize Live Session**

**Endpoint:** `POST /make-server-b9a572ea/analysis/live/start`

**Frontend Request:**
```typescript
// ConversationAnalysis.tsx - handleStartCopilot()
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-b9a572ea/analysis/live/start`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: user.id,
      userName: user.name,
    }),
  }
);

const { sessionId, wsUrl } = await response.json();

// Connect to WebSocket for real-time updates
const ws = new WebSocket(wsUrl);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleLiveUpdate(data); // Update UI with tips/transcript
};
```

**Backend Response:**
```typescript
// POST /analysis/live/start
const sessionId = crypto.randomUUID();

const liveSession = {
  id: sessionId,
  userId: user.id,
  userName: user.user_metadata?.name || 'Onbekend',
  startTime: new Date().toISOString(),
  status: 'active',
  transcript: [],
  tips: [],
};

await kv.set(`live-session:${sessionId}`, liveSession);

return Response.json({
  sessionId: sessionId,
  wsUrl: `wss://your-websocket-server.com/live/${sessionId}`, // WebSocket endpoint
});
```

---

### **STAP 2: Real-time Audio Processing**

**Backend Contact Point #7: WebSocket Stream Processing**

**Flow:**
1. Frontend captures audio chunks from mic (MediaRecorder API)
2. Sends audio chunks via WebSocket every 2-3 seconds
3. Backend transcribes in real-time (OpenAI Whisper streaming)
4. Backend analyzes transcript chunk with AI
5. Backend sends tips back to frontend via WebSocket

**WebSocket Message Format (Frontend → Backend):**
```typescript
ws.send(JSON.stringify({
  type: 'audio-chunk',
  sessionId: sessionId,
  audioData: base64EncodedAudio,
  timestamp: Date.now(),
}));
```

**WebSocket Message Format (Backend → Frontend):**
```typescript
// Transcript update
ws.send(JSON.stringify({
  type: 'transcript',
  speaker: 'you' | 'client', // Speaker diarization
  text: 'Ik begrijp dat prijs een belangrijke factor is...',
  timestamp: '12:34',
}));

// Real-time tip
ws.send(JSON.stringify({
  type: 'tip',
  tipType: 'wedervraag' | 'lock' | 'waarschuwing' | 'open' | 'positief',
  text: 'Goed! Je gebruikt een wedervraag om dieper te graven.',
  timestamp: '12:35',
  technique: '2.1.5', // EPIC technique nummer
}));
```

---

### **STAP 3: Gebruiker Stopt Live Copilot**

**Backend Contact Point #8: End Live Session & Save**

**Endpoint:** `POST /make-server-b9a572ea/analysis/live/stop`

**Frontend Request:**
```typescript
// ConversationAnalysis.tsx - handleStopCopilot()
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-b9a572ea/analysis/live/stop`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: sessionId,
    }),
  }
);

const { analysisId } = await response.json();

// Navigate to results
navigate('analysis-results', { analysisId });
```

**Backend Verwerking:**
```typescript
// POST /analysis/live/stop
const liveSession = await kv.get(`live-session:${sessionId}`);

if (!liveSession || liveSession.userId !== user.id) {
  return Response.json({ error: 'Not found' }, { status: 404 });
}

// 1. Mark session as ended
liveSession.endTime = new Date().toISOString();
liveSession.status = 'completed';
liveSession.duration = calculateDuration(liveSession.startTime, liveSession.endTime);

// 2. Analyze full transcript
const fullTranscript = liveSession.transcript.map(t => t.text).join(' ');
const analysis = await analyzeTranscript(fullTranscript);

// 3. Create analysis record (same format as upload)
const analysisId = crypto.randomUUID();
const analysisRecord = {
  id: analysisId,
  userId: user.id,
  userName: liveSession.userName,
  title: `Live copilot - ${new Date().toLocaleDateString('nl-NL')}`,
  context: 'Live copilot sessie',
  type: 'live',
  uploadDate: liveSession.startTime,
  duration: liveSession.duration,
  status: 'completed',
  transcript: liveSession.transcript,
  tips: liveSession.tips,
  results: {
    overallScore: analysis.overallScore,
    benchmark: analysis.benchmark,
    topPerformer: analysis.topPerformer,
    phaseScores: analysis.phaseScores,
    timeline: analysis.timeline,
    topTechnique: analysis.topTechnique,
    scoreDelta: analysis.scoreDelta,
  },
};

await kv.set(`analysis:${analysisId}`, analysisRecord);

// 4. Clean up live session (optional)
await kv.del(`live-session:${sessionId}`);

return Response.json({
  analysisId: analysisId,
  message: 'Live sessie opgeslagen en geanalyseerd',
});
```

---

## 👨‍💼 ADMIN VIEW: Alle Analyses Bekijken

📍 **Component:** `AdminSessions.tsx`

### **STAP 1: Admin Bekijkt Alle Analyses**

**Backend Contact Point #9: Fetch All Analyses (Admin)**

**Endpoint:** `GET /make-server-b9a572ea/admin/analysis/list`

**Frontend Request:**
```typescript
// AdminSessions.tsx - useEffect
useEffect(() => {
  async function fetchAllAnalyses() {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-b9a572ea/admin/analysis/list`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    const data = await response.json();
    setAnalyses(data.analyses);
  }
  
  fetchAllAnalyses();
}, []);
```

**Backend Response:**
```typescript
// GET /admin/analysis/list
// 1. Verify user is admin
const isAdmin = await checkUserIsAdmin(user.id);
if (!isAdmin) {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}

// 2. Fetch ALL analyses (all users)
const allAnalyses = await kv.getByPrefix(`analysis:`);

// 3. Sort by date (newest first)
const sortedAnalyses = allAnalyses.sort((a, b) => 
  new Date(b.uploadDate) - new Date(a.uploadDate)
);

return Response.json({
  analyses: sortedAnalyses.map(a => ({
    // Analysis data
    id: a.id,
    title: a.title,
    type: a.type,
    uploadDate: formatDate(a.uploadDate),
    duration: a.duration,
    status: a.status,
    overallScore: a.results?.overallScore,
    scoreDelta: a.results?.scoreDelta,
    topTechnique: a.results?.topTechnique,
    phase: a.results?.phase,
    
    // User data
    userId: a.userId,
    userName: a.userName,
    userEmail: await getUserEmail(a.userId),
  })),
  stats: {
    totalAnalyses: allAnalyses.length,
    processingCount: allAnalyses.filter(a => a.status === 'processing').length,
    completedCount: allAnalyses.filter(a => a.status === 'completed').length,
    failedCount: allAnalyses.filter(a => a.status === 'failed').length,
    avgScore: calculateAvgScore(allAnalyses),
  },
});
```

---

### **STAP 2: Admin Bekijkt Specifieke Analyse**

**Backend Contact Point #10: Fetch Analysis (Admin)**

**Endpoint:** `GET /make-server-b9a572ea/admin/analysis/results/:analysisId`

**Frontend Request:**
```typescript
// AdminSessions.tsx - handleViewAnalysis()
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-b9a572ea/admin/analysis/results/${analysisId}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);

const data = await response.json();
// Navigate to AnalysisResults with admin flag
navigate('analysis-results', { analysisId, isAdmin: true });
```

**Backend Response:**
```typescript
// Same as Contact Point #4, but NO user.id check (admin can see all)
const isAdmin = await checkUserIsAdmin(user.id);
if (!isAdmin) {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}

const analysisRecord = await kv.get(`analysis:${analysisId}`);

if (!analysisRecord) {
  return Response.json({ error: 'Not found' }, { status: 404 });
}

// Return full analysis data (same format as Contact Point #4)
return Response.json({ ...analysisRecord });
```

---

### **STAP 3: Admin Verwijdert Analyse**

**Backend Contact Point #11: Delete Analysis (Admin)**

**Endpoint:** `DELETE /make-server-b9a572ea/admin/analysis/:analysisId`

**Frontend Request:**
```typescript
// AdminSessions.tsx - handleDeleteAnalysis()
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-b9a572ea/admin/analysis/${analysisId}`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);

if (response.ok) {
  toast.success('Analyse verwijderd');
  fetchAllAnalyses(); // Refresh list
}
```

**Backend Verwerking:**
```typescript
// DELETE /admin/analysis/:analysisId
const isAdmin = await checkUserIsAdmin(user.id);
if (!isAdmin) {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}

const analysisRecord = await kv.get(`analysis:${analysisId}`);

if (!analysisRecord) {
  return Response.json({ error: 'Not found' }, { status: 404 });
}

// 1. Delete file from Storage (if upload type)
if (analysisRecord.type === 'audio' || analysisRecord.type === 'video') {
  await supabase.storage
    .from('make-b9a572ea-conversation-uploads')
    .remove([analysisRecord.fileName]);
}

// 2. Delete analysis record from KV Store
await kv.del(`analysis:${analysisId}`);

return Response.json({
  success: true,
  message: 'Analyse verwijderd',
});
```

---

## 📊 Data Structuur Overzicht

### KV Store Keys:

```typescript
// User analyses
`analysis:${analysisId}` = {
  id: string,
  userId: string,
  userName: string,
  title: string,
  context: string,
  type: 'audio' | 'video' | 'live',
  fileName?: string, // Only for uploads
  fileSize?: number, // Only for uploads
  uploadDate: string, // ISO timestamp
  status: 'processing' | 'completed' | 'failed',
  duration?: string, // "24:18"
  transcript?: Array<{ speaker, text, timestamp }>,
  results?: {
    overallScore: number,
    benchmark: number,
    topPerformer: number,
    phaseScores: PhaseScore[],
    timeline: TimelineItem[],
    topTechnique: string,
    scoreDelta: 'up' | 'down' | 'neutral',
  },
}

// Live sessions (temporary, deleted after stop)
`live-session:${sessionId}` = {
  id: string,
  userId: string,
  userName: string,
  startTime: string,
  endTime?: string,
  status: 'active' | 'completed',
  transcript: Array<{ speaker, text, timestamp }>,
  tips: Array<{ type, text, timestamp, technique }>,
  duration?: string,
}
```

### Supabase Storage Buckets:

```typescript
// Bucket: make-b9a572ea-conversation-uploads
// Path structure: {userId}/{timestamp}_{uuid}.{ext}
// Example: 123abc/1736422800000_abc123.mp3

// Signed URLs (expires in 1 hour)
const { data } = await supabase.storage
  .from('make-b9a572ea-conversation-uploads')
  .createSignedUrl(fileName, 3600);
```

---

## 🔐 Security & Auth

### User Authentication:
- Alle endpoints vereisen `Authorization: Bearer ${accessToken}` header
- User ID wordt gehaald uit Supabase auth token via `supabase.auth.getUser()`
- Analyses zijn alleen zichtbaar voor eigenaar (behalve admin)

### Admin Checks:
```typescript
async function checkUserIsAdmin(userId: string): Promise<boolean> {
  const userRecord = await kv.get(`user:${userId}`);
  return userRecord?.role === 'admin' || userRecord?.isAdmin === true;
}
```

---

## 📈 Admin Dashboard Integration

### Statistics voor Admin Dashboard:

**Backend Contact Point #12: Analysis Stats**

**Endpoint:** `GET /make-server-b9a572ea/admin/analysis/stats`

```typescript
// AdminDashboard.tsx - Fetch stats
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-b9a572ea/admin/analysis/stats`,
  {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  }
);

const stats = await response.json();
// Display in KPI tiles: Total Analyses, Avg Score, Processing Count, etc.
```

**Backend Response:**
```typescript
const allAnalyses = await kv.getByPrefix(`analysis:`);

return Response.json({
  totalAnalyses: allAnalyses.length,
  processingCount: allAnalyses.filter(a => a.status === 'processing').length,
  completedCount: allAnalyses.filter(a => a.status === 'completed').length,
  failedCount: allAnalyses.filter(a => a.status === 'failed').length,
  avgScore: calculateAvgScore(allAnalyses.filter(a => a.status === 'completed')),
  totalUsers: new Set(allAnalyses.map(a => a.userId)).size,
  analysesThisWeek: allAnalyses.filter(a => isThisWeek(a.uploadDate)).length,
  topPerformers: getTopPerformers(allAnalyses, 5), // Top 5 users by avg score
});
```

---

## 🚀 Summary: Alle Backend Contact Points

| # | Endpoint | Methode | Doel | Triggered By |
|---|----------|---------|------|--------------|
| 1 | `/analysis/upload` | POST | Upload file en start processing | User uploads file |
| 2 | Internal | - | AI processing (transcribe + analyze) | After upload |
| 3 | `/analysis/status/:id` | GET | Poll processing status | Frontend polling every 3s |
| 4 | `/analysis/results/:id` | GET | Fetch results voor user | User clicks "Bekijk" |
| 5 | `/analysis/list` | GET | Fetch user's analyses | ConversationAnalysis load |
| 6 | `/analysis/live/start` | POST | Start live session + WebSocket | User clicks "Start Copilot" |
| 7 | WebSocket | - | Real-time audio processing | Audio chunks streamed |
| 8 | `/analysis/live/stop` | POST | End live session, save analysis | User clicks "Stop Copilot" |
| 9 | `/admin/analysis/list` | GET | Fetch ALL analyses (admin) | AdminSessions load |
| 10 | `/admin/analysis/results/:id` | GET | Fetch analysis (admin) | Admin clicks "Bekijk" |
| 11 | `/admin/analysis/:id` | DELETE | Delete analysis (admin) | Admin clicks "Verwijder" |
| 12 | `/admin/analysis/stats` | GET | Analysis statistics | AdminDashboard load |

---

## 🎯 Implementation Checklist

### Backend Setup:
- [ ] Create Supabase Storage bucket `make-b9a572ea-conversation-uploads` (private)
- [ ] Implement all 11 backend endpoints in `/supabase/functions/server/index.tsx`
- [ ] Set up KV Store schema voor analyses
- [ ] Integrate OpenAI Whisper API (transcription)
- [ ] Integrate OpenAI GPT-4 API (analysis met EPIC context)
- [ ] Set up WebSocket server voor live sessions
- [ ] Implement admin role checking
- [ ] Add error handling + logging

### Frontend Updates:
- [ ] Update `ConversationAnalysis.tsx` - Replace mock data met API calls
- [ ] Update `AnalysisResults.tsx` - Fetch real data van backend
- [ ] Update `AdminSessions.tsx` - Connect to admin endpoints
- [ ] Implement polling logic voor upload status
- [ ] Implement WebSocket client voor live copilot
- [ ] Add toast notifications voor success/error states
- [ ] Add loading states tijdens upload/processing

### Testing:
- [ ] Test upload flow (audio + video)
- [ ] Test file validation (size, type, iCloud)
- [ ] Test AI processing pipeline
- [ ] Test live copilot (WebSocket connection)
- [ ] Test admin view (list, view, delete)
- [ ] Test error scenarios (upload fail, processing fail)
- [ ] Test auth checks (user vs admin)

---

## 💡 Notes

- **File size limit:** 50MB (Supabase Storage limit)
- **Supported formats:** MP3, WAV, M4A, MP4, MOV
- **Processing time:** ~30-60 seconds voor 15min gesprek
- **WebSocket:** Use Supabase Realtime of externe WebSocket service
- **Cost optimization:** Cache transcriptions, reuse analyses
- **Privacy:** Files zijn private (signed URLs only), analyses alleen zichtbaar voor eigenaar/admin

Dit is de complete backend integratie specificatie voor de Gesprek Analyse feature! 🚀
