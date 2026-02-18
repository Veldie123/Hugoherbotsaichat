import fs from 'fs';
import OpenAI from 'openai';

const API_BASE = 'http://localhost:3001';
const MAX_TURNS_PER_TECHNIQUE = 8;
const CONTEXT_GATHERING_MAX = 5;

const openai = new OpenAI();

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

const USERS: UserProfile[] = [
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

Je bent in gesprek met Hugo, je AI sales coach. Hij traint je in de techniek "${technique.naam}".
De huidige fase is: ${phase}.

REGELS:
- Antwoord als een ECHTE verkoper, niet als een AI
- Gebruik informeel Nederlands (Vlaams mag)
- Wees realistisch: soms begrijp je het niet meteen, soms heb je een "aha-moment"
- Als Hugo je iets vraagt over je sector/product, geef concrete details uit jouw wereld
- Als Hugo een rollenspel doet, speel mee als verkoper (niet als klant)
- Als Hugo coaching geeft, reageer met herkenning, vragen, of twijfels
- Houd antwoorden kort en natuurlijk (2-4 zinnen typisch)
- ${user.ervaring === 'starter' || user.ervaring === 'junior' ? 'Je bent soms onzeker en stelt veel vragen' : ''}
- ${user.ervaring === 'senior' ? 'Je hebt sterke meningen maar staat open voor nieuwe inzichten' : ''}
- Verwijs soms naar echte situaties uit je werk`;

  const messages: any[] = [
    { role: 'system', content: systemPrompt }
  ];

  for (const msg of conversationHistory.slice(-6)) {
    messages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    });
  }

  messages.push({ role: 'user', content: `Hugo zegt: "${hugoMessage}"\n\nReageer als ${user.name}:` });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_completion_tokens: 200,
    temperature: 0.9
  });

  return completion.choices[0]?.message?.content || 'Hmm, interessant. Ga verder.';
}

async function generateContextAnswer(
  user: UserProfile,
  hugoQuestion: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Je bent ${user.name}. Hugo (je AI coach) stelt je een vraag over je werk om je beter te leren kennen.
Profiel: ${user.description}
Sector: ${user.sector} | Product: ${user.product} | Klanttype: ${user.klantType}
Antwoord kort, natuurlijk, in het Nederlands. 1-2 zinnen.`
      },
      { role: 'user', content: hugoQuestion }
    ],
    max_completion_tokens: 100,
    temperature: 0.8
  });

  return completion.choices[0]?.message?.content || user.sector;
}

async function createSession(user: UserProfile, techniqueId: string): Promise<{ sessionId: string; initialMessage: string; phase: string }> {
  const resp = await fetch(`${API_BASE}/api/v2/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      techniqueId,
      mode: 'COACH_CHAT',
      isExpert: false,
      userId: user.id,
      userName: user.name
    })
  });

  if (!resp.ok) {
    throw new Error(`Session creation failed ${resp.status}: ${await resp.text()}`);
  }

  const data = await resp.json();
  return {
    sessionId: data.sessionId,
    initialMessage: data.initialMessage,
    phase: data.phase || 'CONTEXT_GATHERING'
  };
}

async function sendMessage(sessionId: string, content: string): Promise<{ response: string; phase: string }> {
  const resp = await fetch(`${API_BASE}/api/v2/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      content,
      isExpert: false
    })
  });

  if (!resp.ok) {
    throw new Error(`Message failed ${resp.status}: ${await resp.text()}`);
  }

  const data = await resp.json();
  return {
    response: data.response,
    phase: data.phase || 'COACH_CHAT'
  };
}

async function runTechniqueSession(
  user: UserProfile,
  technique: { id: string; naam: string }
): Promise<{ turns: number; error?: string }> {
  const { sessionId, initialMessage, phase } = await createSession(user, technique.id);

  let currentPhase = phase;
  const history: { role: string; content: string }[] = [
    { role: 'assistant', content: initialMessage }
  ];

  let contextTurns = 0;
  while (currentPhase === 'CONTEXT_GATHERING' && contextTurns < CONTEXT_GATHERING_MAX) {
    const answer = await generateContextAnswer(user, initialMessage);
    history.push({ role: 'user', content: answer });

    const result = await sendMessage(sessionId, answer);
    history.push({ role: 'assistant', content: result.response });
    currentPhase = result.phase;
    contextTurns++;
    await sleep(300);
  }

  let coachTurns = 0;
  while (coachTurns < MAX_TURNS_PER_TECHNIQUE) {
    const lastHugoMsg = history[history.length - 1]?.content || '';
    const sellerReply = await generateSellerResponse(user, lastHugoMsg, history, technique, currentPhase);
    history.push({ role: 'user', content: sellerReply });

    const result = await sendMessage(sessionId, sellerReply);
    history.push({ role: 'assistant', content: result.response });
    currentPhase = result.phase;
    coachTurns++;
    await sleep(300);
  }

  return { turns: history.length };
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const techniques = getTechniqueList();
  const totalSessions = USERS.length * techniques.length;

  console.log(`\n========================================`);
  console.log(`  HUGO V2 CURSUS SIMULATIE`);
  console.log(`  ${USERS.length} gebruikers x ${techniques.length} technieken = ${totalSessions} sessies`);
  console.log(`  Geschatte duur: ${Math.round(totalSessions * 30 / 60)} minuten`);
  console.log(`========================================\n`);

  let completedSessions = 0;
  let failedSessions = 0;
  const errors: string[] = [];

  for (let u = 0; u < USERS.length; u++) {
    const user = USERS[u];
    console.log(`\n👤 [Gebruiker ${u + 1}/${USERS.length}] ${user.name} (${user.sector})`);
    console.log(`   ${user.description}\n`);

    for (let t = 0; t < techniques.length; t++) {
      const technique = techniques[t];
      const progress = `[${completedSessions + failedSessions + 1}/${totalSessions}]`;

      process.stdout.write(`  ${progress} ${technique.id}: ${technique.naam}... `);

      try {
        const result = await runTechniqueSession(user, technique);
        completedSessions++;
        console.log(`✅ ${result.turns} beurten`);
      } catch (err: any) {
        failedSessions++;
        const errorMsg = `${user.name} / ${technique.id}: ${err.message}`;
        errors.push(errorMsg);
        console.log(`❌ ${err.message.substring(0, 60)}`);
      }

      await sleep(200);
    }
  }

  console.log(`\n========================================`);
  console.log(`  SIMULATIE VOLTOOID`);
  console.log(`  Geslaagd: ${completedSessions}/${totalSessions}`);
  console.log(`  Mislukt: ${failedSessions}/${totalSessions}`);
  if (errors.length > 0) {
    console.log(`\n  Fouten:`);
    errors.forEach(e => console.log(`    - ${e}`));
  }
  console.log(`\n  Alle sessies zijn zichtbaar in Admin > Sessions`);
  console.log(`========================================\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
