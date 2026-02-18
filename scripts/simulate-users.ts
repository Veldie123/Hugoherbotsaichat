import fs from 'fs';
import OpenAI from 'openai';

const API_BASE = 'http://localhost:5000';
const MAX_TURNS_PER_TECHNIQUE = 6;
const LOG_FILE = '/tmp/simulation-user1.log';

const openai = new OpenAI();

function log(msg: string) {
  const line = msg + '\n';
  process.stdout.write(line);
  fs.appendFileSync(LOG_FILE, line);
}

interface UserProfile {
  id: string;
  name: string;
  sector: string;
  product: string;
  klantType: string;
  ervaring: string;
  description: string;
  personality: string;
}

const ALL_USERS: UserProfile[] = [
  {
    id: 'sim-jan-saas',
    name: 'Jan Verstraeten',
    sector: 'IT & Software',
    product: 'CRM-platform voor middelgrote bedrijven',
    klantType: 'B2B',
    ervaring: 'ervaren',
    description: 'Senior accountmanager bij een SaaS-bedrijf, verkoopt CRM-oplossingen aan middelgrote bedrijven. 8 jaar ervaring in tech sales.',
    personality: 'Analytisch, stelt gerichte vragen, wil concrete frameworks. Soms te technisch in gesprekken met klanten. Redelijk zelfverzekerd maar wil altijd beter worden.'
  },
  {
    id: 'sim-lisa-bouw',
    name: 'Lisa De Smet',
    sector: 'Bouw & Renovatie',
    product: 'Totaalrenovaties voor particulieren',
    klantType: 'B2C',
    ervaring: 'junior',
    description: 'Junior verkoopster bij een renovatiebedrijf, doet huisbezoeken bij particulieren. 1 jaar ervaring, komt uit interieurdesign.',
    personality: 'Enthousiast maar onzeker, stelt veel vragen, worstelt met prijsgesprekken. Creatief maar mist verkoopstructuur. Soms te snel naar oplossingen.'
  },
  {
    id: 'sim-thomas-fin',
    name: 'Thomas Janssens',
    sector: 'Financiële dienstverlening',
    product: 'Verzekeringspakketten en pensioenoplossingen voor KMOs',
    klantType: 'B2B',
    ervaring: 'gemiddeld',
    description: 'Financieel adviseur, verkoopt verzekerings- en pensioenoplossingen aan KMOs. 4 jaar ervaring.',
    personality: 'Correct en professioneel, soms te formeel waardoor hij afstandelijk overkomt. Goede productkennis maar mist emotionele connectie. Wil leren hoe hij meer vertrouwen wekt.'
  },
  {
    id: 'sim-sarah-food',
    name: 'Sarah Peeters',
    sector: 'Horeca & Voeding',
    product: 'Premium ingrediënten en seizoensproducten voor restaurants',
    klantType: 'B2B',
    ervaring: 'starter',
    description: 'Net gestart als vertegenwoordiger bij een food-groothandel. Bezoekt chefs en restauranthouders. Eerste verkoopjob, komt uit de horeca zelf.',
    personality: 'Sociaal en warm, kent de horeca van binnenuit. Maar is onervaren in verkoop, durft niet goed te closen, is bang om pushy over te komen. Wil haar passie voor eten omzetten in verkoopresultaten.'
  },
  {
    id: 'sim-marc-med',
    name: 'Marc Wouters',
    sector: 'Medische apparatuur',
    product: 'Diagnostische beeldvormingsapparatuur voor ziekenhuizen',
    klantType: 'B2B',
    ervaring: 'senior',
    description: 'Key account manager medische devices, verkoopt aan ziekenhuizen en klinieken. 12 jaar ervaring, biomedisch ingenieur van opleiding.',
    personality: 'Zeer technisch sterk, geloofwaardig bij artsen. Maar leunt te veel op productfeatures in plaats van klantbaten. Lange salescycles van 6-18 maanden. Wil leren hoe hij sneller naar commitment gaat.'
  }
];

function getTechniqueList(): { id: string; naam: string; fase: string }[] {
  const data = JSON.parse(fs.readFileSync('config/ssot/technieken_index.json', 'utf-8'));
  const techs = data.technieken;
  const keys = Object.keys(techs).sort((a, b) => {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
    }
    return 0;
  });

  return keys
    .filter(k => !techs[k].is_fase)
    .map(k => ({
      id: k,
      naam: techs[k].naam,
      fase: techs[k].fase || k.split('.')[0]
    }));
}

async function generateSellerResponse(
  user: UserProfile,
  hugoMessage: string,
  conversationHistory: { role: string; content: string }[],
  technique: { id: string; naam: string },
  phase: string
): Promise<string> {
  const systemPrompt = `Je bent ${user.name}, een ${user.ervaring} verkoper in ${user.sector}.
Profiel: ${user.description}
Persoonlijkheid: ${user.personality}
Je verkoopt: ${user.product} aan ${user.klantType} klanten.

Je bent in gesprek met Hugo, je AI sales coach. Hij traint je in de techniek "${technique.naam}" (fase ${technique.fase}).
De huidige sessie-modus is: ${phase}.

REGELS:
- Antwoord als een ECHTE verkoper, niet als een AI
- Gebruik informeel Nederlands (Vlaams mag)
- Wees realistisch: soms begrijp je het niet meteen, soms heb je een "aha-moment"
- Als Hugo je iets vraagt over je sector/product, geef concrete details uit jouw wereld
- Als Hugo een rollenspel start, speel mee als verkoper
- Als Hugo coaching geeft, reageer met herkenning, vragen, of twijfels
- Houd antwoorden kort en natuurlijk (2-4 zinnen typisch, max 5)
- ${user.ervaring === 'starter' || user.ervaring === 'junior' ? 'Je bent soms onzeker en stelt veel vragen' : ''}
- ${user.ervaring === 'senior' ? 'Je hebt sterke meningen maar staat open voor nieuwe inzichten' : ''}
- Verwijs soms naar echte situaties uit je werk
- NOOIT meta-commentaar geven over het gesprek zelf`;

  const messages: any[] = [
    { role: 'system', content: systemPrompt }
  ];

  const recentHistory = conversationHistory.slice(-8);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === 'user' ? 'assistant' : 'user',
      content: msg.content
    });
  }

  messages.push({ role: 'user', content: hugoMessage });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages,
      max_completion_tokens: 250,
      temperature: 0.85
    });
    return completion.choices[0]?.message?.content || 'Ja, dat snap ik. Ga verder.';
  } catch (err: any) {
    log(`    [OpenAI seller] Error: ${err.message}`);
    return 'Interessant, kun je daar wat meer over vertellen?';
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 120000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(timer);
  }
}

async function createSession(
  user: UserProfile,
  techniqueId: string
): Promise<{ sessionId: string; initialMessage: string; phase: string }> {
  const resp = await fetchWithTimeout(`${API_BASE}/api/v2/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      techniqueId,
      mode: 'COACH_CHAT',
      isExpert: false,
      userId: user.id,
      userName: user.name
    })
  }, 180000);

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Session creation failed (${resp.status}): ${body.substring(0, 200)}`);
  }

  const data = await resp.json();
  return {
    sessionId: data.sessionId,
    initialMessage: data.initialMessage,
    phase: data.phase || 'CONTEXT_GATHERING'
  };
}

async function sendMessage(
  sessionId: string,
  content: string
): Promise<{ response: string; phase: string }> {
  const resp = await fetchWithTimeout(`${API_BASE}/api/v2/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, content, isExpert: false })
  }, 120000);

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Message failed (${resp.status}): ${body.substring(0, 200)}`);
  }

  const data = await resp.json();
  return {
    response: data.response,
    phase: data.phase || 'COACH_CHAT'
  };
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFullCourse(user: UserProfile) {
  const techniques = getTechniqueList();

  fs.writeFileSync(LOG_FILE, '');
  log(`\n${'='.repeat(60)}`);
  log(`  CURSUS SIMULATIE: ${user.name}`);
  log(`  ${user.description}`);
  log(`  ${techniques.length} technieken van A tot Z`);
  log(`${'='.repeat(60)}\n`);

  let completed = 0;
  let failed = 0;
  const failedTechs: string[] = [];

  for (let t = 0; t < techniques.length; t++) {
    const technique = techniques[t];
    const progress = `[${t + 1}/${techniques.length}]`;

    log(`\n  ${progress} ${technique.id}: ${technique.naam}`);

    try {
      const { sessionId, initialMessage, phase } = await createSession(user, technique.id);
      log(`    Session: ${sessionId} | Phase: ${phase}`);
      log(`    Hugo: "${initialMessage.substring(0, 100)}..."`);

      const history: { role: string; content: string }[] = [
        { role: 'assistant', content: initialMessage }
      ];
      let currentPhase = phase;
      let turnCount = 0;

      while (currentPhase === 'CONTEXT_GATHERING' && turnCount < 5) {
        const answer = await generateSellerResponse(
          user, history[history.length - 1].content, history, technique, currentPhase
        );
        log(`    ${user.name.split(' ')[0]}: "${answer.substring(0, 80)}..."`);
        history.push({ role: 'user', content: answer });

        const result = await sendMessage(sessionId, answer);
        history.push({ role: 'assistant', content: result.response });
        currentPhase = result.phase;
        turnCount++;

        if (currentPhase !== 'CONTEXT_GATHERING') {
          log(`    → Transitie naar ${currentPhase}`);
          log(`    Hugo: "${result.response.substring(0, 100)}..."`);
        }
        await sleep(500);
      }

      let coachTurns = 0;
      while (coachTurns < MAX_TURNS_PER_TECHNIQUE) {
        const lastHugoMsg = history[history.length - 1].content;
        const sellerReply = await generateSellerResponse(
          user, lastHugoMsg, history, technique, currentPhase
        );
        log(`    ${user.name.split(' ')[0]}: "${sellerReply.substring(0, 80)}..."`);
        history.push({ role: 'user', content: sellerReply });

        const result = await sendMessage(sessionId, sellerReply);
        history.push({ role: 'assistant', content: result.response });
        currentPhase = result.phase;
        coachTurns++;

        log(`    Hugo: "${result.response.substring(0, 80)}..."`);
        await sleep(500);
      }

      const totalTurns = history.length;
      completed++;
      log(`    ✅ Voltooid: ${totalTurns} berichten (${Math.ceil(totalTurns / 2)} beurten)`);

    } catch (err: any) {
      failed++;
      failedTechs.push(`${technique.id}: ${err.message.substring(0, 80)}`);
      log(`    ❌ FOUT: ${err.message.substring(0, 100)}`);
    }

    await sleep(300);
  }

  log(`\n${'='.repeat(60)}`);
  log(`  RESULTAAT: ${user.name}`);
  log(`  Voltooid: ${completed}/${techniques.length}`);
  log(`  Mislukt: ${failed}/${techniques.length}`);
  if (failedTechs.length > 0) {
    log(`  Fouten:`);
    failedTechs.forEach(e => log(`    - ${e}`));
  }
  log(`  → Alle sessies zichtbaar in Admin > Sessions`);
  log(`${'='.repeat(60)}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const userIndex = args.includes('--user') ? parseInt(args[args.indexOf('--user') + 1]) - 1 : 0;

  if (userIndex < 0 || userIndex >= ALL_USERS.length) {
    console.error(`Ongeldige gebruiker. Kies 1-${ALL_USERS.length}`);
    process.exit(1);
  }

  const user = ALL_USERS[userIndex];
  log(`\nGekozen gebruiker: ${user.name} (${user.sector})`);

  await runFullCourse(user);
}

main().catch(err => {
  log(`Fatal error: ${err.message || err}`);
  process.exit(1);
});
