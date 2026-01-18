/**
 * Display Mappings - SSOT → Frontend vertalingen
 * 
 * Vertaalt backend keys naar leesbare Nederlandse tekst
 */

// Buying Clock vertalingen
export const buyingClockToDisplay: Record<string, string> = {
  situation_as_is: "Situatie zoals het is (00u-06u)",
  field_of_tension: "Spanningsveld (06u-08u)",
  market_research: "Marktonderzoek (08u-11u)",
  hesitation: "Aarzeling (11u-12u)",
  decision: "Beslissing (12u)"
};

// Gedragsstijlen (uit persona_templates.json)
export const behaviorStyleToDisplay: Record<string, string> = {
  promoverend: "Promoverend",
  faciliterend: "Faciliterend",
  controlerend: "Controlerend",
  analyserend: "Analyserend"
};

// Difficulty levels (backend → display)
export const difficultyToDisplay: Record<string, string> = {
  onbewuste_onkunde: "Beginner (1/4)",
  bewuste_onkunde: "Beginner+ (2/4)",
  bewuste_kunde: "Gemiddeld (3/4)",
  onbewuste_kunde: "Expert (4/4)",
  beginner: "Beginner",
  gemiddeld: "Gemiddeld",
  expert: "Expert"
};

// Signal vertalingen
export const signalToDisplay: Record<string, string> = {
  positive: "positief",
  positief: "positief",
  neutral: "neutraal",
  neutraal: "neutraal",
  negative: "negatief",
  negatief: "negatief"
};

// Evaluatie vertalingen
export const evaluationToDisplay: Record<string, string> = {
  goed: "positief",
  positief: "positief",
  gemist: "gemist",
  neutraal: "neutraal"
};

/**
 * Helper om veilig te vertalen met fallback
 */
export function translate<T extends Record<string, string>>(
  mapping: T, 
  key: string | undefined | null, 
  fallback = "N/A"
): string {
  if (!key) return fallback;
  return mapping[key] || key;
}

/**
 * Build debug info from API response
 */
export function buildDebugInfoFromResponse(
  apiResponse: any,
  fallbackDifficulty: string = "beginner"
) {
  const persona = apiResponse?.debug?.persona || {};
  const dynamics = apiResponse?.debug?.dynamics || apiResponse?.debug?.customerDynamics;
  
  return {
    persona: {
      gedragsstijl: translate(behaviorStyleToDisplay, persona.behavior_style, "Analytisch"),
      koopklok: translate(buyingClockToDisplay, persona.buying_clock_stage, "N/A"),
      moeilijkheid: translate(difficultyToDisplay, persona.difficulty_level || fallbackDifficulty)
    },
    customerDynamics: dynamics ? {
      rapport: typeof dynamics.rapport === 'number' ? dynamics.rapport : 50,
      valueTension: typeof dynamics.valueTension === 'number' ? dynamics.valueTension : 50,
      commitReadiness: typeof dynamics.commitReadiness === 'number' ? dynamics.commitReadiness : 50
    } : null,
    context: {
      fase: apiResponse?.debug?.context?.fase || apiResponse?.debug?.phase || 1
    },
    aiDecision: {
      epicFase: apiResponse?.debug?.epicFase || `Fase ${apiResponse?.debug?.context?.fase || 1}`,
      evaluatie: translate(evaluationToDisplay, apiResponse?.debug?.evaluation?.quality || apiResponse?.debug?.evaluation, "neutraal")
    }
  };
}
