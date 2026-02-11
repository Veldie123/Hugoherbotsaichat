import OpenAI from 'openai';
import { supabase } from '../supabase-client';
import { getTechnique, loadMergedTechniques } from '../ssot-loader';
import { getExpectedMoves } from './evaluator';
import * as crypto from 'crypto';

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export interface ConversationAnalysis {
  id: string;
  userId: string;
  title: string;
  type: 'upload' | 'live';
  status: 'uploading' | 'transcribing' | 'analyzing' | 'evaluating' | 'generating_report' | 'completed' | 'failed';
  consentConfirmed: boolean;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface TranscriptTurn {
  idx: number;
  startMs: number;
  endMs: number;
  speaker: 'seller' | 'customer';
  text: string;
}

export interface TurnEvaluation {
  turnIdx: number;
  techniques: Array<{
    id: string;
    naam: string;
    quality: 'perfect' | 'goed' | 'bijna' | 'gemist';
    score: number;
    stappen_gevolgd?: string[];
  }>;
  overallQuality: string;
  rationale: string;
}

export interface CustomerSignalResult {
  turnIdx: number;
  houding: 'vraag' | 'twijfel' | 'bezwaar' | 'uitstel' | 'interesse' | 'akkoord' | 'neutraal';
  confidence: number;
  recommendedTechniqueIds: string[];
}

export interface EpicCoverage {
  explore: { score: number; themes: string[]; missing: string[] };
  probe: { score: number; found: boolean; examples: string[] };
  impact: { score: number; found: boolean; examples: string[] };
  commit: { score: number; found: boolean; examples: string[] };
  overall: number;
}

export interface MissedOpportunity {
  turnIdx: number;
  type: 'twijfel_niet_uitgepakt' | 'bezwaar_overgeslagen' | 'baat_niet_gemaakt' | 'te_vroeg_fase_3_4' | 'probe_gemist' | 'impact_gemist' | 'commit_gemist';
  description: string;
  sellerSaid: string;
  customerSaid: string;
  betterQuestion: string;
}

export interface AnalysisInsights {
  epicCoverage: EpicCoverage;
  missedOpportunities: MissedOpportunity[];
  summaryMarkdown: string;
  strengths: Array<{ text: string; quote: string; turnIdx: number }>;
  improvements: Array<{ text: string; quote: string; turnIdx: number; betterApproach: string }>;
  microExperiments: string[];
  overallScore: number;
}

export interface FullAnalysisResult {
  conversation: ConversationAnalysis;
  transcript: TranscriptTurn[];
  evaluations: TurnEvaluation[];
  signals: CustomerSignalResult[];
  insights: AnalysisInsights;
}

interface WhisperSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

const analysisJobs = new Map<string, ConversationAnalysis>();
const analysisResults = new Map<string, FullAnalysisResult>();

const BUCKET_NAME = 'conversation-uploads';

async function ensureBucket(): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET_NAME);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: false,
      fileSizeLimit: 100 * 1024 * 1024,
    });
  }
}

export async function uploadAndStore(
  file: Buffer,
  filename: string,
  mimeType: string,
  userId: string
): Promise<string> {
  await ensureBucket();

  const ext = filename.split('.').pop() || 'wav';
  const storageKey = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storageKey, file, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload mislukt: ${error.message}`);
  }

  return storageKey;
}

export async function transcribeAudio(storageKey: string): Promise<WhisperSegment[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(storageKey);

  if (error || !data) {
    throw new Error(`Download mislukt: ${error?.message || 'Geen data'}`);
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const ext = storageKey.split('.').pop() || 'wav';
  const file = new File([buffer], `audio.${ext}`, { type: `audio/${ext}` });

  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
    language: 'nl',
  });

  const segments: WhisperSegment[] = ((response as any).segments || []).map((seg: any) => ({
    id: seg.id,
    start: seg.start,
    end: seg.end,
    text: (seg.text || '').trim(),
  }));

  return segments;
}

export function buildTurns(segments: WhisperSegment[]): TranscriptTurn[] {
  if (segments.length === 0) return [];

  const questionPatterns = [
    /\?$/,
    /^(hoe|wat|waarom|wanneer|wie|waar|welk|hoeveel|kun je|kunt u|mag ik|vertelt? u|vertel eens)/i,
    /begrijp ik goed/i,
    /klopt dat/i,
    /is dat zo/i,
    /dus als ik/i,
    /stel dat/i,
    /wat betekent/i,
    /wat vindt u/i,
    /wat zijn de gevolgen/i,
  ];

  const sellerIndicators = [
    /wij bieden/i,
    /ons product/i,
    /onze oplossing/i,
    /ik wil u/i,
    /laat me uitleggen/i,
    /het voordeel/i,
    /concreet betekent/i,
    /als ik het goed begrijp/i,
    /gentleman's agreement/i,
    /mag ik.*vragen/i,
  ];

  const customerIndicators = [
    /ik zoek/i,
    /wij hebben/i,
    /ons probleem/i,
    /bij ons/i,
    /ik twijfel/i,
    /dat is te duur/i,
    /ik weet niet/i,
    /we gebruiken momenteel/i,
    /onze situatie/i,
  ];

  const labeled: Array<{ segment: WhisperSegment; speaker: 'seller' | 'customer' }> = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const text = seg.text;

    let sellerScore = 0;
    let customerScore = 0;

    for (const p of questionPatterns) {
      if (p.test(text)) sellerScore += 2;
    }
    for (const p of sellerIndicators) {
      if (p.test(text)) sellerScore += 3;
    }
    for (const p of customerIndicators) {
      if (p.test(text)) customerScore += 3;
    }

    const prevPause = i > 0 ? seg.start - segments[i - 1].end : 2;
    const longPause = prevPause > 1.5;

    let speaker: 'seller' | 'customer';

    if (sellerScore > customerScore) {
      speaker = 'seller';
    } else if (customerScore > sellerScore) {
      speaker = 'customer';
    } else if (i === 0) {
      speaker = 'seller';
    } else if (longPause) {
      speaker = labeled[i - 1].speaker === 'seller' ? 'customer' : 'seller';
    } else {
      speaker = labeled[i - 1].speaker;
    }

    labeled.push({ segment: seg, speaker });
  }

  const turns: TranscriptTurn[] = [];
  let currentTurn: { speaker: 'seller' | 'customer'; texts: string[]; startMs: number; endMs: number } | null = null;

  for (const item of labeled) {
    if (!currentTurn || currentTurn.speaker !== item.speaker) {
      if (currentTurn) {
        turns.push({
          idx: turns.length,
          startMs: Math.round(currentTurn.startMs * 1000),
          endMs: Math.round(currentTurn.endMs * 1000),
          speaker: currentTurn.speaker,
          text: currentTurn.texts.join(' '),
        });
      }
      currentTurn = {
        speaker: item.speaker,
        texts: [item.segment.text],
        startMs: item.segment.start,
        endMs: item.segment.end,
      };
    } else {
      currentTurn.texts.push(item.segment.text);
      currentTurn.endMs = item.segment.end;
    }
  }

  if (currentTurn) {
    turns.push({
      idx: turns.length,
      startMs: Math.round(currentTurn.startMs * 1000),
      endMs: Math.round(currentTurn.endMs * 1000),
      speaker: currentTurn.speaker,
      text: currentTurn.texts.join(' '),
    });
  }

  return turns;
}

function buildTechniqueCatalog(): string {
  const techniques = loadMergedTechniques();
  const lines: string[] = [];

  for (const t of techniques) {
    if (t.is_fase) continue;
    const example = t.voorbeeld?.[0] || '';
    lines.push(`- ${t.nummer} ${t.naam} (fase ${t.fase}): ${t.wat || ''} Voorbeeld: "${example.substring(0, 80)}"`);
  }

  return lines.join('\n');
}

export async function evaluateSellerTurns(turns: TranscriptTurn[]): Promise<TurnEvaluation[]> {
  const sellerTurns = turns.filter(t => t.speaker === 'seller');
  const catalog = buildTechniqueCatalog();
  const evaluations: TurnEvaluation[] = [];

  for (const turn of sellerTurns) {
    const prevCustomerTurn = turns.filter(t => t.idx < turn.idx && t.speaker === 'customer').pop();
    const customerContext = prevCustomerTurn ? prevCustomerTurn.text : '(begin gesprek)';

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Je bent een expert verkoopcoach die de EPIC-methode evalueert. Je analyseert verkoopgesprekken en detecteert welke verkooptechnieken de verkoper toepast.

EPIC-structuur:
- Fase 1: Opening (technieken 0, 1, 1.1-1.4)
- Fase 2: Ontdekking - Explore (2.1.x), Probe (2.2), Impact (2.3), Commitment (2.4)
- Fase 3: Aanbeveling (3.1-3.5)
- Fase 4: Beslissing (4.x)

TECHNIEK CATALOGUS:
${catalog}

SCORING:
- perfect: Techniek volledig en correct toegepast (score 10)
- goed: Techniek grotendeels correct (score 7)
- bijna: Goede richting maar onvolledig (score 4)
- gemist: Geen herkenbare techniek (score 0)

Geef maximaal 2 technieken per beurt. Antwoord in JSON.`
          },
          {
            role: 'user',
            content: `Klant zei: "${customerContext}"
Verkoper zei: "${turn.text}"

Welke EPIC-technieken past de verkoper toe? Antwoord als JSON:
{
  "techniques": [{"id": "2.1.1", "naam": "...", "quality": "goed", "score": 7, "stappen_gevolgd": ["stap 1"]}],
  "overallQuality": "goed",
  "rationale": "Uitleg waarom..."
}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content?.trim() || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        evaluations.push({
          turnIdx: turn.idx,
          techniques: (parsed.techniques || []).slice(0, 2).map((t: any) => ({
            id: t.id || '0',
            naam: t.naam || 'Onbekend',
            quality: t.quality || 'gemist',
            score: t.score ?? 0,
            stappen_gevolgd: t.stappen_gevolgd,
          })),
          overallQuality: parsed.overallQuality || 'gemist',
          rationale: parsed.rationale || '',
        });
      } else {
        evaluations.push({
          turnIdx: turn.idx,
          techniques: [],
          overallQuality: 'gemist',
          rationale: 'Kon geen technieken detecteren.',
        });
      }
    } catch (err: any) {
      evaluations.push({
        turnIdx: turn.idx,
        techniques: [],
        overallQuality: 'gemist',
        rationale: `Evaluatie mislukt: ${err.message}`,
      });
    }
  }

  return evaluations;
}

const signalKeywords: Record<string, string[]> = {
  vraag: ['hoe werkt', 'wat kost', 'kunt u uitleggen', 'wat houdt in', 'hoe zit het met', 'wat is'],
  twijfel: ['ik weet niet', 'misschien', 'ik twijfel', 'niet zeker', 'ik moet erover nadenken', 'lastig'],
  bezwaar: ['te duur', 'te veel', 'dat kan niet', 'niet akkoord', 'dat geloof ik niet', 'nee want'],
  uitstel: ['later', 'volgende week', 'nog niet', 'even wachten', 'niet nu', 'binnenkort'],
  interesse: ['interessant', 'klinkt goed', 'dat wil ik', 'vertel meer', 'hoe kan ik', 'graag'],
  akkoord: ['akkoord', 'deal', 'laten we beginnen', 'ik ga ermee akkoord', 'prima', 'oké laten we'],
};

export async function detectCustomerSignals(turns: TranscriptTurn[]): Promise<CustomerSignalResult[]> {
  const customerTurns = turns.filter(t => t.speaker === 'customer');
  const results: CustomerSignalResult[] = [];

  for (const turn of customerTurns) {
    const lower = turn.text.toLowerCase();
    let detectedHouding: CustomerSignalResult['houding'] = 'neutraal';
    let confidence = 0.5;
    let matchedByKeyword = false;

    for (const [houding, keywords] of Object.entries(signalKeywords)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          detectedHouding = houding as CustomerSignalResult['houding'];
          confidence = 0.8;
          matchedByKeyword = true;
          break;
        }
      }
      if (matchedByKeyword) break;
    }

    if (!matchedByKeyword && turn.text.length > 20) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Je classificeert klantuitspraken in een verkoopgesprek. Kies exact één houding:
- vraag: klant stelt een informatieve vraag
- twijfel: klant is onzeker of aarzelt
- bezwaar: klant brengt een tegenargument
- uitstel: klant wil beslissing uitstellen
- interesse: klant toont positieve interesse
- akkoord: klant gaat akkoord
- neutraal: geen duidelijk signaal

Antwoord als JSON: {"houding": "...", "confidence": 0.0-1.0}`
            },
            {
              role: 'user',
              content: `Klant zegt: "${turn.text}"`
            }
          ],
          max_tokens: 100,
          temperature: 0.2,
        });

        const content = response.choices[0]?.message?.content?.trim() || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          detectedHouding = parsed.houding || 'neutraal';
          confidence = parsed.confidence ?? 0.6;
        }
      } catch {
        detectedHouding = 'neutraal';
        confidence = 0.3;
      }
    }

    let recommendedTechniqueIds: string[] = [];
    try {
      const moves = getExpectedMoves(detectedHouding as any);
      recommendedTechniqueIds = moves.map(m => m.id);
    } catch {
      recommendedTechniqueIds = [];
    }

    results.push({
      turnIdx: turn.idx,
      houding: detectedHouding,
      confidence,
      recommendedTechniqueIds,
    });
  }

  return results;
}

const EXPLORE_THEMES = ['Bron', 'Motivatie', 'Ervaring', 'Verwachtingen', 'Alternatieven', 'Budget', 'Timing', 'Beslissingscriteria'];

const themeKeywords: Record<string, string[]> = {
  Bron: ['terechtgekomen', 'gevonden', 'gehoord', 'via wie', 'hoe kwam'],
  Motivatie: ['aanleiding', 'waarom', 'reden', 'wat brengt'],
  Ervaring: ['ervaring', 'eerder', 'al eens', 'bekend met'],
  Verwachtingen: ['verwacht', 'ideaal', 'belangrijk voor', 'hoop'],
  Alternatieven: ['andere', 'alternatieven', 'opties', 'vergelijk'],
  Budget: ['budget', 'investering', 'bedrag', 'prijs'],
  Timing: ['wanneer', 'timing', 'planning', 'deadline'],
  Beslissingscriteria: ['wie beslist', 'beslissing', 'criteria', 'belangrijk voor de keuze'],
};

export function calculateEpicCoverage(
  evaluations: TurnEvaluation[],
  turns: TranscriptTurn[]
): EpicCoverage {
  const allTechIds = evaluations.flatMap(e => e.techniques.map(t => t.id));

  const coveredThemes: string[] = [];
  const missingThemes: string[] = [];

  const sellerTexts = turns.filter(t => t.speaker === 'seller').map(t => t.text.toLowerCase()).join(' ');

  for (const theme of EXPLORE_THEMES) {
    const keywords = themeKeywords[theme] || [];
    const found = keywords.some(kw => sellerTexts.includes(kw));
    if (found) {
      coveredThemes.push(theme);
    } else {
      missingThemes.push(theme);
    }
  }

  const exploreScore = EXPLORE_THEMES.length > 0 ? Math.round((coveredThemes.length / EXPLORE_THEMES.length) * 100) : 0;

  const probeExamples: string[] = [];
  const probeFound = allTechIds.some(id => id.startsWith('2.2'));
  if (probeFound) {
    const probeEvals = evaluations.filter(e => e.techniques.some(t => t.id.startsWith('2.2')));
    for (const ev of probeEvals) {
      const turn = turns.find(t => t.idx === ev.turnIdx);
      if (turn) probeExamples.push(turn.text.substring(0, 100));
    }
  }
  const probeScore = probeFound ? 100 : 0;

  const impactExamples: string[] = [];
  const impactFound = allTechIds.some(id => id.startsWith('2.3'));
  if (impactFound) {
    const impactEvals = evaluations.filter(e => e.techniques.some(t => t.id.startsWith('2.3')));
    for (const ev of impactEvals) {
      const turn = turns.find(t => t.idx === ev.turnIdx);
      if (turn) impactExamples.push(turn.text.substring(0, 100));
    }
  }
  const impactScore = impactFound ? 100 : 0;

  const commitExamples: string[] = [];
  const commitFound = allTechIds.some(id => id.startsWith('2.4'));
  if (commitFound) {
    const commitEvals = evaluations.filter(e => e.techniques.some(t => t.id.startsWith('2.4')));
    for (const ev of commitEvals) {
      const turn = turns.find(t => t.idx === ev.turnIdx);
      if (turn) commitExamples.push(turn.text.substring(0, 100));
    }
  }
  const commitScore = commitFound ? 100 : 0;

  const overall = Math.round((exploreScore + probeScore + impactScore + commitScore) / 4);

  return {
    explore: { score: exploreScore, themes: coveredThemes, missing: missingThemes },
    probe: { score: probeScore, found: probeFound, examples: probeExamples },
    impact: { score: impactScore, found: impactFound, examples: impactExamples },
    commit: { score: commitScore, found: commitFound, examples: commitExamples },
    overall,
  };
}

export async function detectMissedOpportunities(
  evaluations: TurnEvaluation[],
  signals: CustomerSignalResult[],
  turns: TranscriptTurn[]
): Promise<MissedOpportunity[]> {
  const missed: MissedOpportunity[] = [];
  const allTechIds = evaluations.flatMap(e => e.techniques.map(t => t.id));

  const hasPhase3or4 = allTechIds.some(id => id.startsWith('3.') || id.startsWith('4.'));
  const exploreCount = allTechIds.filter(id => id.startsWith('2.1')).length;

  if (hasPhase3or4 && exploreCount < 3) {
    const phase3Turn = evaluations.find(e => e.techniques.some(t => t.id.startsWith('3.') || t.id.startsWith('4.')));
    const turnIdx = phase3Turn?.turnIdx ?? 0;
    const sellerTurn = turns.find(t => t.idx === turnIdx);
    const prevCustomer = turns.filter(t => t.idx < turnIdx && t.speaker === 'customer').pop();

    missed.push({
      turnIdx,
      type: 'te_vroeg_fase_3_4',
      description: 'Verkoper ging te snel naar aanbeveling/closing zonder voldoende ontdekking.',
      sellerSaid: sellerTurn?.text || '',
      customerSaid: prevCustomer?.text || '',
      betterQuestion: '',
    });
  }

  if (!allTechIds.some(id => id.startsWith('2.2'))) {
    missed.push({
      turnIdx: 0,
      type: 'probe_gemist',
      description: 'Geen Probe-techniek (storytelling/hypothetische scenario\'s) toegepast in het gesprek.',
      sellerSaid: '',
      customerSaid: '',
      betterQuestion: '',
    });
  }

  if (!allTechIds.some(id => id.startsWith('2.3'))) {
    missed.push({
      turnIdx: 0,
      type: 'impact_gemist',
      description: 'Geen Impact-vragen gesteld. De klant is niet bewust gemaakt van de gevolgen.',
      sellerSaid: '',
      customerSaid: '',
      betterQuestion: '',
    });
  }

  if (!allTechIds.some(id => id.startsWith('2.4'))) {
    missed.push({
      turnIdx: 0,
      type: 'commit_gemist',
      description: 'Geen Commitment-vraag gesteld. De klant heeft niet bevestigd dat de baat belangrijk is.',
      sellerSaid: '',
      customerSaid: '',
      betterQuestion: '',
    });
  }

  for (const signal of signals) {
    if (signal.houding === 'twijfel') {
      const nextSellerTurn = turns.find(t => t.idx > signal.turnIdx && t.speaker === 'seller');
      if (nextSellerTurn) {
        const nextEval = evaluations.find(e => e.turnIdx === nextSellerTurn.idx);
        const hasImpactOrCommit = nextEval?.techniques.some(t =>
          t.id.startsWith('2.3') || t.id.startsWith('2.4')
        );
        if (!hasImpactOrCommit) {
          const customerTurn = turns.find(t => t.idx === signal.turnIdx);
          missed.push({
            turnIdx: nextSellerTurn.idx,
            type: 'twijfel_niet_uitgepakt',
            description: 'Klant toonde twijfel, maar verkoper ging niet in op de impact of vroeg geen commitment.',
            sellerSaid: nextSellerTurn.text,
            customerSaid: customerTurn?.text || '',
            betterQuestion: '',
          });
        }
      }
    }

    if (signal.houding === 'bezwaar') {
      const nextSellerTurn = turns.find(t => t.idx > signal.turnIdx && t.speaker === 'seller');
      if (nextSellerTurn) {
        const lower = nextSellerTurn.text.toLowerCase();
        const argues = lower.includes('maar') || lower.includes('nee') || lower.includes('integendeel') || lower.includes('dat klopt niet');
        if (argues) {
          const customerTurn = turns.find(t => t.idx === signal.turnIdx);
          missed.push({
            turnIdx: nextSellerTurn.idx,
            type: 'bezwaar_overgeslagen',
            description: 'Klant had een bezwaar, maar verkoper ging direct in de verdediging in plaats van empathie te tonen en door te vragen.',
            sellerSaid: nextSellerTurn.text,
            customerSaid: customerTurn?.text || '',
            betterQuestion: '',
          });
        }
      }
    }
  }

  const sellerTurnsWithVoordeel = turns.filter(t => {
    if (t.speaker !== 'seller') return false;
    const lower = t.text.toLowerCase();
    return lower.includes('voordeel') || lower.includes('het mooie is') || lower.includes('het fijne is');
  });

  for (const vTurn of sellerTurnsWithVoordeel) {
    const nextTurns = turns.filter(t => t.idx > vTurn.idx && t.idx <= vTurn.idx + 3);
    const hasBaat = nextTurns.some(t => {
      const lower = t.text.toLowerCase();
      return lower.includes('concreet betekent') || lower.includes('dat betekent voor u') || lower.includes('baat');
    });
    if (!hasBaat) {
      const prevCustomer = turns.filter(t => t.idx < vTurn.idx && t.speaker === 'customer').pop();
      missed.push({
        turnIdx: vTurn.idx,
        type: 'baat_niet_gemaakt',
        description: 'Verkoper benoemde een voordeel maar vertaalde het niet naar een concrete baat voor de klant.',
        sellerSaid: vTurn.text,
        customerSaid: prevCustomer?.text || '',
        betterQuestion: '',
      });
    }
  }

  if (missed.length > 0) {
    const toEnrich = missed.filter(m => !m.betterQuestion);
    const batchPrompt = toEnrich.map((m, i) => `${i + 1}. Type: ${m.type}
Verkoper: "${m.sellerSaid.substring(0, 150)}"
Klant: "${m.customerSaid.substring(0, 150)}"`).join('\n\n');

    if (batchPrompt.length > 10) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Je bent een verkoopcoach die de EPIC-methode gebruikt. Genereer voor elk gemist moment een betere vraag die de verkoper had kunnen stellen. Antwoord als JSON array: [{"idx": 1, "betterQuestion": "..."}]`
            },
            {
              role: 'user',
              content: `Genereer voor elk gemist moment een betere vraag:\n\n${batchPrompt}`
            }
          ],
          max_tokens: 600,
          temperature: 0.5,
        });

        const content = response.choices[0]?.message?.content?.trim() || '';
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const suggestions = JSON.parse(jsonMatch[0]);
          for (const s of suggestions) {
            const idx = (s.idx || s.index || 1) - 1;
            if (toEnrich[idx]) {
              toEnrich[idx].betterQuestion = s.betterQuestion || '';
            }
          }
        }
      } catch {
        for (const m of toEnrich) {
          if (!m.betterQuestion) {
            m.betterQuestion = 'Vraag door naar de impact: "Wat zou het voor u betekenen als we dit samen oplossen?"';
          }
        }
      }
    }

    for (const m of missed) {
      if (!m.betterQuestion) {
        m.betterQuestion = 'Vraag door naar de impact: "Wat zou het voor u betekenen als we dit samen oplossen?"';
      }
    }
  }

  return missed;
}

export async function generateCoachReport(
  turns: TranscriptTurn[],
  evaluations: TurnEvaluation[],
  signals: CustomerSignalResult[],
  epicCoverage: EpicCoverage,
  missedOpps: MissedOpportunity[]
): Promise<AnalysisInsights> {
  const turnSummaries = turns.map(t => `[${t.speaker}] "${t.text.substring(0, 120)}"`).join('\n');
  const evalSummaries = evaluations.map(e => {
    const techs = e.techniques.map(t => `${t.id} ${t.naam} (${t.quality})`).join(', ');
    return `Beurt ${e.turnIdx}: ${techs || 'geen techniek'} - ${e.rationale.substring(0, 80)}`;
  }).join('\n');
  const signalSummaries = signals.map(s => `Beurt ${s.turnIdx}: ${s.houding} (${Math.round(s.confidence * 100)}%)`).join('\n');
  const missedSummaries = missedOpps.map(m => `${m.type}: ${m.description.substring(0, 100)}`).join('\n');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Je bent Hugo Herbots, verkoopcoach en expert in de EPIC-methode. Je schrijft een coachrapport in het Nederlands over een verkoopgesprek. 

Stijl: concreet, coachend, niet academisch. Gebruik "je" (informeel). Geef concrete voorbeelden met quotes uit het gesprek.

EPIC staat voor: Explore (2.1), Probe (2.2), Impact (2.3), Commitment (2.4).

Genereer het rapport als JSON met deze structuur:
{
  "summaryMarkdown": "Korte samenvatting in markdown (3-4 zinnen)",
  "strengths": [{"text": "wat ging goed", "quote": "citaat uit gesprek", "turnIdx": 0}],
  "improvements": [{"text": "wat kan beter", "quote": "citaat", "turnIdx": 0, "betterApproach": "wat je beter had kunnen doen"}],
  "microExperiments": ["experiment 1", "experiment 2", "experiment 3"],
  "overallScore": 65
}

Geef exact 3 strengths, 3 improvements en 3 micro-experimenten. Score van 0-100.`
        },
        {
          role: 'user',
          content: `GESPREKSTRANSCRIPT:
${turnSummaries}

TECHNIEK-EVALUATIES:
${evalSummaries}

KLANTSIGNALEN:
${signalSummaries}

EPIC COVERAGE:
- Explore: ${epicCoverage.explore.score}% (thema's: ${epicCoverage.explore.themes.join(', ')} | missend: ${epicCoverage.explore.missing.join(', ')})
- Probe: ${epicCoverage.probe.score}%
- Impact: ${epicCoverage.impact.score}%
- Commit: ${epicCoverage.commit.score}%
- Overall: ${epicCoverage.overall}%

GEMISTE KANSEN:
${missedSummaries || 'Geen'}

Schrijf het coachrapport.`
        }
      ],
      max_tokens: 1500,
      temperature: 0.6,
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      return {
        epicCoverage,
        missedOpportunities: missedOpps,
        summaryMarkdown: parsed.summaryMarkdown || '',
        strengths: (parsed.strengths || []).slice(0, 3).map((s: any) => ({
          text: s.text || '',
          quote: s.quote || '',
          turnIdx: s.turnIdx ?? 0,
        })),
        improvements: (parsed.improvements || []).slice(0, 3).map((s: any) => ({
          text: s.text || '',
          quote: s.quote || '',
          turnIdx: s.turnIdx ?? 0,
          betterApproach: s.betterApproach || '',
        })),
        microExperiments: (parsed.microExperiments || []).slice(0, 3),
        overallScore: parsed.overallScore ?? epicCoverage.overall,
      };
    }

    throw new Error('Geen geldig JSON in coachrapport');
  } catch (err: any) {
    return {
      epicCoverage,
      missedOpportunities: missedOpps,
      summaryMarkdown: 'Het coachrapport kon niet volledig worden gegenereerd.',
      strengths: [],
      improvements: [],
      microExperiments: [
        'Oefen met het stellen van impactvragen na elke klanttwijfel.',
        'Gebruik de Probe-techniek: vertel een kort verhaal voordat je een meningsvraag stelt.',
        'Vraag altijd commitment voordat je naar fase 3 gaat.',
      ],
      overallScore: epicCoverage.overall,
    };
  }
}

export async function runFullAnalysis(
  conversationId: string,
  storageKey: string,
  userId: string,
  title?: string
): Promise<void> {
  const job: ConversationAnalysis = {
    id: conversationId,
    userId,
    title: title || `Analyse ${new Date().toLocaleDateString('nl-NL')}`,
    type: 'upload',
    status: 'transcribing',
    consentConfirmed: true,
    createdAt: new Date().toISOString(),
  };
  analysisJobs.set(conversationId, job);

  try {
    job.status = 'transcribing';
    analysisJobs.set(conversationId, { ...job });
    const segments = await transcribeAudio(storageKey);

    job.status = 'analyzing';
    analysisJobs.set(conversationId, { ...job });
    const turns = buildTurns(segments);

    if (turns.length === 0) {
      throw new Error('Geen spraak gedetecteerd in het audiobestand.');
    }

    job.status = 'evaluating';
    analysisJobs.set(conversationId, { ...job });
    const [evaluations, signals] = await Promise.all([
      evaluateSellerTurns(turns),
      detectCustomerSignals(turns),
    ]);

    const epicCoverage = calculateEpicCoverage(evaluations, turns);
    const missedOpps = await detectMissedOpportunities(evaluations, signals, turns);

    job.status = 'generating_report';
    analysisJobs.set(conversationId, { ...job });
    const insights = await generateCoachReport(turns, evaluations, signals, epicCoverage, missedOpps);

    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    analysisJobs.set(conversationId, { ...job });

    analysisResults.set(conversationId, {
      conversation: { ...job },
      transcript: turns,
      evaluations,
      signals,
      insights,
    });
  } catch (err: any) {
    job.status = 'failed';
    job.error = err.message || 'Onbekende fout';
    analysisJobs.set(conversationId, { ...job });
  }
}

export function getAnalysisStatus(conversationId: string): ConversationAnalysis | undefined {
  return analysisJobs.get(conversationId);
}

export function getAnalysisResults(conversationId: string): FullAnalysisResult | undefined {
  return analysisResults.get(conversationId);
}
