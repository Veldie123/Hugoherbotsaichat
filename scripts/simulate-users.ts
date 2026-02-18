import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3001';

interface UserProfile {
  id: string;
  name: string;
  sector: string;
  product: string;
  klantType: string;
  ervaring: string;
  description: string;
}

interface TurnRecord {
  role: 'user' | 'assistant';
  content: string;
}

interface TechniqueResult {
  techniqueId: string;
  techniqueName: string;
  turns: TurnRecord[];
  mode: 'coaching' | 'roleplay';
  error?: string;
}

const USERS: UserProfile[] = [
  {
    id: 'sim-user-1',
    name: 'Jan (IT/SaaS)',
    sector: 'IT & Software',
    product: 'CRM-platform voor middelgrote bedrijven',
    klantType: 'B2B',
    ervaring: 'ervaren',
    description: 'Senior accountmanager bij een SaaS-bedrijf, verkoopt CRM-oplossingen aan middelgrote bedrijven. 8 jaar ervaring.'
  },
  {
    id: 'sim-user-2',
    name: 'Lisa (Bouw/Renovatie)',
    sector: 'Bouw & Renovatie',
    product: 'Totaalrenovaties voor particulieren',
    klantType: 'B2C',
    ervaring: 'junior',
    description: 'Junior verkoopster bij een renovatiebedrijf, doet huisbezoeken bij particulieren. 1 jaar ervaring.'
  },
  {
    id: 'sim-user-3',
    name: 'Thomas (Financieel)',
    sector: 'Financiële dienstverlening',
    product: 'Verzekeringspakketten en pensioenoplossingen',
    klantType: 'B2B',
    ervaring: 'gemiddeld',
    description: 'Financieel adviseur, verkoopt verzekerings- en pensioenoplossingen aan KMO\'s. 4 jaar ervaring.'
  },
  {
    id: 'sim-user-4',
    name: 'Sarah (Horeca/Food)',
    sector: 'Horeca & Voeding',
    product: 'Groothandel in premium ingrediënten voor restaurants',
    klantType: 'B2B',
    ervaring: 'starter',
    description: 'Net gestart als vertegenwoordiger bij een food-groothandel. Bezoekt chefs en restauranthouders. Eerste verkoopjob.'
  },
  {
    id: 'sim-user-5',
    name: 'Marc (Medisch)',
    sector: 'Medische apparatuur',
    product: 'Diagnostische apparatuur voor ziekenhuizen',
    klantType: 'B2B',
    ervaring: 'senior',
    description: 'Key account manager medische devices, verkoopt aan ziekenhuizen en klinieken. 12 jaar ervaring, technisch sterk.'
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

function getUserMessage(user: UserProfile, technique: { id: string; naam: string }, mode: 'coaching' | 'roleplay'): string {
  if (mode === 'coaching') {
    const coachingPrompts = [
      `Hoe pas ik "${technique.naam}" toe in mijn sector (${user.sector})? Ik verkoop ${user.product}.`,
      `Kun je me uitleggen hoe "${technique.naam}" werkt? Ik ben ${user.ervaring} in verkoop en werk in ${user.sector}.`,
      `Wat zijn de beste tips voor "${technique.naam}" als ik ${user.klantType} klanten bedien met ${user.product}?`,
      `Ik wil "${technique.naam}" beter leren. Mijn context: ${user.description}`,
      `Help me "${technique.naam}" te begrijpen. Ik verkoop ${user.product} aan ${user.klantType} klanten.`
    ];
    return coachingPrompts[Math.floor(Math.random() * coachingPrompts.length)];
  } else {
    const roleplayPrompts = [
      `Laten we "${technique.naam}" oefenen. Jij bent een ${user.klantType === 'B2C' ? 'particuliere klant' : 'inkoper'} en ik verkoop ${user.product}.`,
      `Kan ik "${technique.naam}" oefenen in een rollenspel? Ik ben verkoper van ${user.product} in ${user.sector}.`,
      `Start een rollenspel voor "${technique.naam}". Scenario: ik bezoek een ${user.klantType === 'B2C' ? 'klant thuis' : 'bedrijf'} om ${user.product} voor te stellen.`
    ];
    return roleplayPrompts[Math.floor(Math.random() * roleplayPrompts.length)];
  }
}

function getFollowUp(user: UserProfile, mode: 'coaching' | 'roleplay', turnIndex: number): string {
  if (mode === 'coaching') {
    const followUps = [
      'Kun je een concreet voorbeeld geven hoe ik dit zou zeggen?',
      'Wat als de klant daar negatief op reageert?',
      'Hoe combineer ik dit met de vorige techniek die we besproken hebben?',
      'Wat zijn de meest voorkomende fouten die verkopers hier maken?',
      `Hoe zou dit er specifiek uitzien in ${user.sector}?`
    ];
    return followUps[turnIndex % followUps.length];
  } else {
    const roleplayFollowUps = [
      `Goedemorgen, ik ben ${user.name.split(' ')[0]} van ons bedrijf. Leuk om u te ontmoeten.`,
      'Dat is een goede vraag. Momenteel werken we met een andere leverancier, maar we zijn niet 100% tevreden.',
      'Interessant. Wat zou dat voor ons concreet betekenen qua besparing?',
      'Ik moet dit nog bespreken met mijn collega. Kan ik er even over nadenken?',
      'Oké, dat klinkt goed. Wat zijn de volgende stappen?'
    ];
    return roleplayFollowUps[turnIndex % roleplayFollowUps.length];
  }
}

async function callChatAPI(
  message: string,
  userId: string,
  techniqueId: string,
  conversationHistory: TurnRecord[]
): Promise<string> {
  const resp = await fetch(`${API_BASE}/api/v2/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      userId,
      techniqueContext: { techniqueId },
      conversationHistory,
      sourceApp: 'simulation-test'
    })
  });

  if (!resp.ok) {
    throw new Error(`API error ${resp.status}: ${await resp.text()}`);
  }

  const data = await resp.json();
  return data.response || data.message || '[geen antwoord]';
}

async function simulateTechnique(
  user: UserProfile,
  technique: { id: string; naam: string },
  mode: 'coaching' | 'roleplay'
): Promise<TechniqueResult> {
  const turns: TurnRecord[] = [];
  const TURNS_PER_TECHNIQUE = 3;

  try {
    const firstMessage = getUserMessage(user, technique, mode);
    turns.push({ role: 'user', content: firstMessage });

    const firstResponse = await callChatAPI(firstMessage, user.id, technique.id, []);
    turns.push({ role: 'assistant', content: firstResponse });

    for (let i = 1; i < TURNS_PER_TECHNIQUE; i++) {
      const followUp = getFollowUp(user, mode, i - 1);
      turns.push({ role: 'user', content: followUp });

      const response = await callChatAPI(followUp, user.id, technique.id, turns.slice(0, -1));
      turns.push({ role: 'assistant', content: response });
    }

    return { techniqueId: technique.id, techniqueName: technique.naam, turns, mode };
  } catch (error: any) {
    return {
      techniqueId: technique.id,
      techniqueName: technique.naam,
      turns,
      mode,
      error: error.message
    };
  }
}

function formatTranscript(user: UserProfile, results: TechniqueResult[]): string {
  let output = `# Transcript: ${user.name}\n\n`;
  output += `**Profiel:** ${user.description}\n`;
  output += `**Sector:** ${user.sector} | **Product:** ${user.product} | **Klanttype:** ${user.klantType} | **Ervaring:** ${user.ervaring}\n`;
  output += `**Datum:** ${new Date().toISOString().split('T')[0]}\n`;
  output += `**Technieken besproken:** ${results.length}\n`;
  output += `**Fouten:** ${results.filter(r => r.error).length}\n\n`;
  output += `---\n\n`;

  let currentFase = '';
  for (const result of results) {
    const fase = result.techniqueId.split('.')[0];
    const faseNames: Record<string, string> = {
      '0': 'Fase 0: Pre-contactfase',
      '1': 'Fase 1: Openingsfase',
      '2': 'Fase 2: Ontdekkingsfase (EPIC)',
      '3': 'Fase 3: Aanbevelingsfase',
      '4': 'Fase 4: Beslissingsfase'
    };

    if (fase !== currentFase) {
      currentFase = fase;
      output += `\n## ${faseNames[fase] || `Fase ${fase}`}\n\n`;
    }

    output += `### ${result.techniqueId}: ${result.techniqueName}\n`;
    output += `*Modus: ${result.mode === 'coaching' ? '🎓 Coaching' : '🎭 Rollenspel'}*\n\n`;

    if (result.error) {
      output += `> ⚠️ FOUT: ${result.error}\n\n`;
    }

    for (const turn of result.turns) {
      if (turn.role === 'user') {
        output += `**${user.name.split(' ')[0]}:** ${turn.content}\n\n`;
      } else {
        output += `**Hugo:** ${turn.content}\n\n`;
      }
    }

    output += `---\n\n`;
  }

  return output;
}

function formatSummary(allResults: Map<string, TechniqueResult[]>): string {
  let output = `# Simulatie Samenvatting - 5 Gebruikers × Alle Technieken\n\n`;
  output += `**Datum:** ${new Date().toISOString().split('T')[0]}\n\n`;

  let totalTechniques = 0;
  let totalErrors = 0;
  let totalTurns = 0;

  for (const [userId, results] of allResults) {
    const user = USERS.find(u => u.id === userId)!;
    const errors = results.filter(r => r.error).length;
    const turns = results.reduce((sum, r) => sum + r.turns.length, 0);
    totalTechniques += results.length;
    totalErrors += errors;
    totalTurns += turns;

    output += `## ${user.name}\n`;
    output += `- Technieken: ${results.length}\n`;
    output += `- Beurten: ${turns}\n`;
    output += `- Fouten: ${errors}\n`;
    if (errors > 0) {
      output += `- Falende technieken: ${results.filter(r => r.error).map(r => r.techniqueId).join(', ')}\n`;
    }
    output += `\n`;
  }

  output += `## Totalen\n`;
  output += `- Gebruikers: ${USERS.length}\n`;
  output += `- Techniek-sessies: ${totalTechniques}\n`;
  output += `- Totaal beurten: ${totalTurns}\n`;
  output += `- Fouten: ${totalErrors}\n`;
  output += `- Slagingspercentage: ${((1 - totalErrors / totalTechniques) * 100).toFixed(1)}%\n\n`;

  output += `## Kwaliteitsanalyse\n\n`;
  output += `*Wordt aangevuld na review van de transcripts*\n`;

  return output;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const techniques = getTechniqueList();
  console.log(`\n🚀 Simulatie gestart: ${USERS.length} gebruikers × ${techniques.length} technieken`);
  console.log(`   Totaal verwacht: ${USERS.length * techniques.length} techniek-sessies, ${USERS.length * techniques.length * 3} API calls\n`);

  const outputDir = 'docs/test-transcripts';
  fs.mkdirSync(outputDir, { recursive: true });

  const allResults = new Map<string, TechniqueResult[]>();

  for (let u = 0; u < USERS.length; u++) {
    const user = USERS[u];
    const userResults: TechniqueResult[] = [];
    console.log(`\n👤 [${u + 1}/${USERS.length}] Start: ${user.name}`);

    for (let t = 0; t < techniques.length; t++) {
      const technique = techniques[t];
      const mode: 'coaching' | 'roleplay' = t % 3 === 2 ? 'roleplay' : 'coaching';

      console.log(`  📖 [${t + 1}/${techniques.length}] ${technique.id}: ${technique.naam} (${mode})`);

      const result = await simulateTechnique(user, technique, mode);
      userResults.push(result);

      if (result.error) {
        console.log(`    ⚠️ FOUT: ${result.error}`);
      } else {
        const lastResponse = result.turns[result.turns.length - 1]?.content || '';
        console.log(`    ✅ ${result.turns.length} beurten, antwoord: ${lastResponse.substring(0, 80)}...`);
      }

      await sleep(500);
    }

    allResults.set(user.id, userResults);

    const transcript = formatTranscript(user, userResults);
    const filename = `transcript-${user.id}.md`;
    fs.writeFileSync(path.join(outputDir, filename), transcript);
    console.log(`  💾 Opgeslagen: ${outputDir}/${filename}`);
  }

  const summary = formatSummary(allResults);
  fs.writeFileSync(path.join(outputDir, 'SAMENVATTING.md'), summary);
  console.log(`\n📊 Samenvatting opgeslagen: ${outputDir}/SAMENVATTING.md`);
  console.log(`\n✅ Simulatie voltooid!`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
