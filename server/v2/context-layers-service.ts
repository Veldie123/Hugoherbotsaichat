/**
 * context-layers-service.ts - Extended Context Layers for V3 Orchestration
 * 
 * Implements the 4 context layer types defined in coach_overlay_v3.json:
 * - base: Basic seller context (sector, product, channel, customer type, experience)
 * - scenario: Specific customer scenario for roleplay (company, role, situation, challenge)
 * - value_map: Mapping of customer needs to benefits
 * - objection_bank: Common objections and concerns for the product/sector
 * 
 * These layers are progressively gathered based on the technique's context_depth setting.
 */

import { getOpenAI } from '../openai';
import type { ContextState } from './context_engine';

export type ContextLayer = 'base' | 'scenario' | 'value_map' | 'objection_bank';
export type ContextDepth = 'LIGHT' | 'STANDARD' | 'DEEP';

export interface ScenarioLayer {
  klant_naam?: string;
  klant_functie?: string;
  klant_bedrijf?: string;
  klant_bedrijfsgrootte?: string;
  klant_situatie?: string;
  klant_uitdaging?: string;
  klant_doel?: string;
  koopfase?: string;
}

export interface ValueMapLayer {
  belangrijkste_behoeften: string[];
  pijnpunten: string[];
  gewenste_resultaten: string[];
  prioriteiten: string[];
  besliscriteria?: string[];
}

export interface ObjectionBankLayer {
  veelvoorkomende_bezwaren: string[];
  typische_twijfels: string[];
  concurrentie_argumenten?: string[];
  prijsgevoeligheid?: string;
  risico_percepties?: string[];
}

export interface ExtendedContextLayers {
  base: Record<string, string>;
  scenario?: ScenarioLayer;
  value_map?: ValueMapLayer;
  objection_bank?: ObjectionBankLayer;
}

export const CONTEXT_DEPTH_LAYERS: Record<ContextDepth, ContextLayer[]> = {
  LIGHT: ['base'],
  STANDARD: ['base', 'scenario'],
  DEEP: ['base', 'scenario', 'value_map', 'objection_bank']
};

export function getRequiredLayers(depth: ContextDepth): ContextLayer[] {
  return CONTEXT_DEPTH_LAYERS[depth] || CONTEXT_DEPTH_LAYERS.LIGHT;
}

export function hasRequiredLayers(
  layers: ExtendedContextLayers,
  required: ContextLayer[]
): { complete: boolean; missing: ContextLayer[] } {
  const missing: ContextLayer[] = [];
  
  for (const layer of required) {
    if (layer === 'base') {
      if (!layers.base || Object.keys(layers.base).length < 2) {
        missing.push('base');
      }
    } else if (layer === 'scenario') {
      if (!layers.scenario || !layers.scenario.klant_situatie) {
        missing.push('scenario');
      }
    } else if (layer === 'value_map') {
      if (!layers.value_map || layers.value_map.belangrijkste_behoeften.length === 0) {
        missing.push('value_map');
      }
    } else if (layer === 'objection_bank') {
      if (!layers.objection_bank || layers.objection_bank.veelvoorkomende_bezwaren.length === 0) {
        missing.push('objection_bank');
      }
    }
  }
  
  return { complete: missing.length === 0, missing };
}

export async function generateScenarioLayer(
  baseContext: Record<string, string>
): Promise<ScenarioLayer> {
  const openai = getOpenAI();
  
  const prompt = `Je bent een scenario-generator voor sales roleplay training.

Gebaseerd op deze verkoper context:
- Sector: ${baseContext.sector || 'onbekend'}
- Product: ${baseContext.product || 'onbekend'}
- Verkoopkanaal: ${baseContext.verkoopkanaal || 'onbekend'}
- Klant type: ${baseContext.klant_type || 'onbekend'}

Genereer een realistisch klantscenario voor een roleplay oefening.

Antwoord in JSON formaat:
{
  "klant_naam": "Voornaam Achternaam",
  "klant_functie": "Functietitel",
  "klant_bedrijf": "Bedrijfsnaam",
  "klant_bedrijfsgrootte": "klein/midden/groot",
  "klant_situatie": "Korte beschrijving van de huidige situatie",
  "klant_uitdaging": "Het specifieke probleem of de uitdaging",
  "klant_doel": "Wat de klant wil bereiken",
  "koopfase": "orienterend/vergelijkend/beslissend"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content) as ScenarioLayer;
  } catch (error: any) {
    console.error('[context-layers] Error generating scenario:', error.message);
    return {
      klant_naam: 'Jan de Vries',
      klant_functie: 'Manager',
      klant_bedrijf: 'Voorbeeld BV',
      klant_situatie: 'Zoekt naar een oplossing',
      klant_uitdaging: 'Huidige proces is inefficient',
      koopfase: 'orienterend'
    };
  }
}

export async function generateValueMapLayer(
  baseContext: Record<string, string>,
  scenario?: ScenarioLayer
): Promise<ValueMapLayer> {
  const openai = getOpenAI();
  
  const prompt = `Je bent een value mapping expert voor sales training.

Verkoper context:
- Sector: ${baseContext.sector || 'onbekend'}
- Product: ${baseContext.product || 'onbekend'}
- Klant type: ${baseContext.klant_type || 'onbekend'}
${scenario ? `
Klant scenario:
- Functie: ${scenario.klant_functie || 'onbekend'}
- Situatie: ${scenario.klant_situatie || 'onbekend'}
- Uitdaging: ${scenario.klant_uitdaging || 'onbekend'}
` : ''}

Genereer een value map die typische behoeften, pijnpunten en gewenste resultaten beschrijft voor dit type klant.

Antwoord in JSON formaat:
{
  "belangrijkste_behoeften": ["behoefte 1", "behoefte 2", "behoefte 3"],
  "pijnpunten": ["pijnpunt 1", "pijnpunt 2", "pijnpunt 3"],
  "gewenste_resultaten": ["resultaat 1", "resultaat 2", "resultaat 3"],
  "prioriteiten": ["prioriteit 1", "prioriteit 2"],
  "besliscriteria": ["criterium 1", "criterium 2"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content) as ValueMapLayer;
  } catch (error: any) {
    console.error('[context-layers] Error generating value map:', error.message);
    return {
      belangrijkste_behoeften: ['Efficientie verbeteren', 'Kosten besparen', 'Risicos beperken'],
      pijnpunten: ['Tijdgebrek', 'Onduidelijke processen', 'Gebrek aan inzicht'],
      gewenste_resultaten: ['Meer controle', 'Betere resultaten', 'Minder stress'],
      prioriteiten: ['ROI', 'Implementatietijd']
    };
  }
}

export async function generateObjectionBankLayer(
  baseContext: Record<string, string>,
  scenario?: ScenarioLayer
): Promise<ObjectionBankLayer> {
  const openai = getOpenAI();
  
  const prompt = `Je bent een sales trainer die bezwaren en twijfels voorspelt.

Verkoper context:
- Sector: ${baseContext.sector || 'onbekend'}
- Product: ${baseContext.product || 'onbekend'}
- Klant type: ${baseContext.klant_type || 'onbekend'}
${scenario ? `
Klant scenario:
- Functie: ${scenario.klant_functie || 'onbekend'}
- Bedrijfsgrootte: ${scenario.klant_bedrijfsgrootte || 'onbekend'}
- Koopfase: ${scenario.koopfase || 'onbekend'}
` : ''}

Genereer typische bezwaren en twijfels die deze klant zou kunnen hebben.

Antwoord in JSON formaat:
{
  "veelvoorkomende_bezwaren": ["bezwaar 1", "bezwaar 2", "bezwaar 3"],
  "typische_twijfels": ["twijfel 1", "twijfel 2", "twijfel 3"],
  "concurrentie_argumenten": ["concurrent argument 1", "concurrent argument 2"],
  "prijsgevoeligheid": "laag/gemiddeld/hoog",
  "risico_percepties": ["risico 1", "risico 2"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content) as ObjectionBankLayer;
  } catch (error: any) {
    console.error('[context-layers] Error generating objection bank:', error.message);
    return {
      veelvoorkomende_bezwaren: ['Te duur', 'Geen tijd voor implementatie', 'Moet met collega overleggen'],
      typische_twijfels: ['Werkt het echt?', 'Past het bij ons?', 'Wat als het niet werkt?'],
      prijsgevoeligheid: 'gemiddeld',
      risico_percepties: ['Implementatierisico', 'Veranderingsrisico']
    };
  }
}

export async function buildExtendedContext(
  baseContext: Record<string, string>,
  requiredLayers: ContextLayer[]
): Promise<ExtendedContextLayers> {
  const result: ExtendedContextLayers = {
    base: baseContext
  };
  
  if (requiredLayers.includes('scenario')) {
    console.log('[context-layers] Generating scenario layer...');
    result.scenario = await generateScenarioLayer(baseContext);
  }
  
  if (requiredLayers.includes('value_map')) {
    console.log('[context-layers] Generating value map layer...');
    result.value_map = await generateValueMapLayer(baseContext, result.scenario);
  }
  
  if (requiredLayers.includes('objection_bank')) {
    console.log('[context-layers] Generating objection bank layer...');
    result.objection_bank = await generateObjectionBankLayer(baseContext, result.scenario);
  }
  
  console.log('[context-layers] Extended context built with layers:', Object.keys(result));
  return result;
}

export function formatExtendedContextForPrompt(layers: ExtendedContextLayers): string {
  const sections: string[] = [];
  
  sections.push('── VERKOPER CONTEXT ──');
  for (const [key, value] of Object.entries(layers.base)) {
    sections.push(`${key}: ${value}`);
  }
  
  if (layers.scenario) {
    sections.push('\n── KLANT SCENARIO ──');
    if (layers.scenario.klant_naam) sections.push(`Naam: ${layers.scenario.klant_naam}`);
    if (layers.scenario.klant_functie) sections.push(`Functie: ${layers.scenario.klant_functie}`);
    if (layers.scenario.klant_bedrijf) sections.push(`Bedrijf: ${layers.scenario.klant_bedrijf}`);
    if (layers.scenario.klant_bedrijfsgrootte) sections.push(`Bedrijfsgrootte: ${layers.scenario.klant_bedrijfsgrootte}`);
    if (layers.scenario.klant_situatie) sections.push(`Situatie: ${layers.scenario.klant_situatie}`);
    if (layers.scenario.klant_uitdaging) sections.push(`Uitdaging: ${layers.scenario.klant_uitdaging}`);
    if (layers.scenario.klant_doel) sections.push(`Doel: ${layers.scenario.klant_doel}`);
    if (layers.scenario.koopfase) sections.push(`Koopfase: ${layers.scenario.koopfase}`);
  }
  
  if (layers.value_map) {
    sections.push('\n── VALUE MAP ──');
    sections.push(`Belangrijkste behoeften: ${layers.value_map.belangrijkste_behoeften.join(', ')}`);
    sections.push(`Pijnpunten: ${layers.value_map.pijnpunten.join(', ')}`);
    sections.push(`Gewenste resultaten: ${layers.value_map.gewenste_resultaten.join(', ')}`);
    sections.push(`Prioriteiten: ${layers.value_map.prioriteiten.join(', ')}`);
    if (layers.value_map.besliscriteria) {
      sections.push(`Besliscriteria: ${layers.value_map.besliscriteria.join(', ')}`);
    }
  }
  
  if (layers.objection_bank) {
    sections.push('\n── OBJECTION BANK ──');
    sections.push(`Veelvoorkomende bezwaren: ${layers.objection_bank.veelvoorkomende_bezwaren.join(', ')}`);
    sections.push(`Typische twijfels: ${layers.objection_bank.typische_twijfels.join(', ')}`);
    if (layers.objection_bank.concurrentie_argumenten) {
      sections.push(`Concurrentie argumenten: ${layers.objection_bank.concurrentie_argumenten.join(', ')}`);
    }
    if (layers.objection_bank.prijsgevoeligheid) {
      sections.push(`Prijsgevoeligheid: ${layers.objection_bank.prijsgevoeligheid}`);
    }
    if (layers.objection_bank.risico_percepties) {
      sections.push(`Risico percepties: ${layers.objection_bank.risico_percepties.join(', ')}`);
    }
  }
  
  return sections.join('\n');
}
