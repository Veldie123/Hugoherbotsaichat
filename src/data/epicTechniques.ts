// EPIC Sales Flow - Complete Techniekencatalogus
// 4 Fasen + 25 Technieken volgens Hugo Herbots methodologie

export interface EpicTechnique {
  nummer: string;
  naam: string;
  fase: string; // "1" | "2" | "3" | "4" | "*"
  ai_eval_points: string[];
  detector_id: string;
  subTechnieken?: EpicTechnique[]; // Voor 4e niveau items (zoals 2.1.1.1 Bron)
}

export const EPIC_TECHNIQUES: EpicTechnique[] = [
  // FASE 1: VOORBEREIDING / OPENING
  {
    nummer: "1.1",
    naam: "Koopklimaat creëren",
    fase: "1",
    ai_eval_points: [
      "Speelt de verkoper in op sfeer/interesse van klant?"
    ],
    detector_id: "1.1"
  },
  {
    nummer: "1.2",
    naam: "Gentleman's agreement",
    fase: "1",
    ai_eval_points: [
      "Werd expliciet akkoord gevraagd?"
    ],
    detector_id: "1.2"
  },
  {
    nummer: "1.3",
    naam: "Firmavoorstelling + reference story",
    fase: "1",
    ai_eval_points: [
      "Bondigheid & relevantie gecheckt?"
    ],
    detector_id: "1.3"
  },
  {
    nummer: "1.4",
    naam: "Instapvraag",
    fase: "1",
    ai_eval_points: [
      "Is de vraag open en neutraal?"
    ],
    detector_id: "1.4"
  },

  // ALGEMEEN: Antwoord op de vraag (alle fasen)
  {
    nummer: "A1",
    naam: "Antwoord op de vraag",
    fase: "*",
    ai_eval_points: [
      "Werd de vraag beantwoord zonder afdwalen?"
    ],
    detector_id: "A1"
  },

  // FASE 2: ONTDEKKING / DISCOVERY
  {
    nummer: "2.1",
    naam: "Explore questioning",
    fase: "2",
    ai_eval_points: [
      "Wordt de situatie breed verkend?"
    ],
    detector_id: "2.1"
  },
  {
    nummer: "2.1.1",
    naam: "Feitgerichte vragen",
    fase: "2",
    ai_eval_points: [
      "Is de vraag helder en feitelijk?"
    ],
    detector_id: "2.1.1",
    subTechnieken: [
      {
        nummer: "2.1.1.1",
        naam: "Bron",
        fase: "2",
        ai_eval_points: ["Waar komt de interesse vandaan?"],
        detector_id: "2.1.1.1"
      },
      {
        nummer: "2.1.1.2",
        naam: "Motivatie",
        fase: "2",
        ai_eval_points: ["Wat drijft de klant?"],
        detector_id: "2.1.1.2"
      },
      {
        nummer: "2.1.1.3",
        naam: "Ervaring",
        fase: "2",
        ai_eval_points: ["Wat is de huidige situatie?"],
        detector_id: "2.1.1.3"
      },
      {
        nummer: "2.1.1.4",
        naam: "Verwachtingen",
        fase: "2",
        ai_eval_points: ["Wat wil de klant bereiken?"],
        detector_id: "2.1.1.4"
      },
      {
        nummer: "2.1.1.5",
        naam: "Alternatieven",
        fase: "2",
        ai_eval_points: ["Welke andere opties overweegt de klant?"],
        detector_id: "2.1.1.5"
      },
      {
        nummer: "2.1.1.6",
        naam: "Budget",
        fase: "2",
        ai_eval_points: ["Wat is het financiële kader?"],
        detector_id: "2.1.1.6"
      },
      {
        nummer: "2.1.1.7",
        naam: "Timing",
        fase: "2",
        ai_eval_points: ["Wat is de tijdslijn?"],
        detector_id: "2.1.1.7"
      },
      {
        nummer: "2.1.1.8",
        naam: "Beslissingscriteria",
        fase: "2",
        ai_eval_points: ["Hoe wordt de beslissing genomen?"],
        detector_id: "2.1.1.8"
      }
    ]
  },
  {
    nummer: "2.1.2",
    naam: "Meningsgerichte vragen (open vragen)",
    fase: "2",
    ai_eval_points: [
      "Is de vraag echt open?"
    ],
    detector_id: "2.1.2"
  },
  {
    nummer: "2.1.3",
    naam: "Feitgerichte vragen onder alternatieve vorm",
    fase: "2",
    ai_eval_points: [
      "Zijn alternatieven helder & relevant?"
    ],
    detector_id: "2.1.3"
  },
  {
    nummer: "2.1.4",
    naam: "Ter zijde schuiven",
    fase: "2",
    ai_eval_points: [
      "Erkenning + sturing aanwezig?"
    ],
    detector_id: "2.1.4"
  },
  {
    nummer: "2.1.5",
    naam: "Pingpong techniek",
    fase: "2",
    ai_eval_points: [
      "Zijn onduidelijkheden aangepakt?"
    ],
    detector_id: "2.1.5"
  },
  {
    nummer: "2.1.6",
    naam: "Actief en empathisch luisteren",
    fase: "2",
    ai_eval_points: [
      "Empathie & actief luisteren gedetecteerd?"
    ],
    detector_id: "2.1.6"
  },
  {
    nummer: "2.2",
    naam: "Probe questioning (storytelling)",
    fase: "2",
    ai_eval_points: [
      "Subtiele sturing via verhaal?"
    ],
    detector_id: "2.2"
  },
  {
    nummer: "2.3",
    naam: "Impact questioning",
    fase: "2",
    ai_eval_points: [
      "Impact van probleem uitgevraagd?"
    ],
    detector_id: "2.3"
  },
  {
    nummer: "2.4",
    naam: "Commitment questioning",
    fase: "2",
    ai_eval_points: [
      "Commitment om te veranderen gecheckt?"
    ],
    detector_id: "2.4"
  },

  // FASE 3: VOORSTEL / AANBEVELING
  {
    nummer: "3.1",
    naam: "Empathie tonen",
    fase: "3",
    ai_eval_points: [
      "Echte empathie voor klant?"
    ],
    detector_id: "3.1"
  },
  {
    nummer: "3.2",
    naam: "Oplossing",
    fase: "3",
    ai_eval_points: [
      "Past de oplossing bij behoeftes?"
    ],
    detector_id: "3.2"
  },
  {
    nummer: "3.3",
    naam: "Voordeel",
    fase: "3",
    ai_eval_points: [
      "Voordeel duidelijk gemaakt?"
    ],
    detector_id: "3.3"
  },
  {
    nummer: "3.4",
    naam: "Baat",
    fase: "3",
    ai_eval_points: [
      "Persoonlijke baat voor klant helder?"
    ],
    detector_id: "3.4"
  },
  {
    nummer: "3.5",
    naam: "Mening vragen / standpunt (of koopsignaal) onder alternatieve vorm",
    fase: "3",
    ai_eval_points: [
      "Expliciet mening of koopsignaal gevraagd?"
    ],
    detector_id: "3.5"
  },

  // FASE 4: AFSLUITING / CLOSING
  {
    nummer: "4.1",
    naam: "Afsluiten",
    fase: "4",
    ai_eval_points: [
      "Natuurlijke afsluiting?"
    ],
    detector_id: "4.1"
  },
  {
    nummer: "4.2",
    naam: "Houdingen van de klant",
    fase: "4",
    ai_eval_points: [
      "Klanthouding correct geïdentificeerd en behandeld?"
    ],
    detector_id: "4.2"
  },
  {
    nummer: "4.2.1",
    naam: "Klant stelt vragen",
    fase: "4",
    ai_eval_points: [
      "Vragen goed beantwoord?"
    ],
    detector_id: "4.2.1"
  },
  {
    nummer: "4.2.2",
    naam: "Twijfels",
    fase: "4",
    ai_eval_points: [
      "Twijfels weggenomen?"
    ],
    detector_id: "4.2.2"
  },
  {
    nummer: "4.2.3",
    naam: "Poging tot uitstel",
    fase: "4",
    ai_eval_points: [
      "Urgentie gecreëerd?"
    ],
    detector_id: "4.2.3"
  },
  {
    nummer: "4.2.4",
    naam: "Bezwaren",
    fase: "4",
    ai_eval_points: [
      "Bezwaar adequaat behandeld?"
    ],
    detector_id: "4.2.4"
  },
  {
    nummer: "4.2.5",
    naam: "Angst / Bezorgdheden",
    fase: "4",
    ai_eval_points: [
      "Angsten/bezorgdheden weggenomen?"
    ],
    detector_id: "4.2.5"
  }
];

// Helper functies
export const getTechniquesByPhase = (phase: string): EpicTechnique[] => {
  return EPIC_TECHNIQUES.filter(t => t.fase === phase);
};

export const getTechniqueByDetectorId = (detectorId: string): EpicTechnique | undefined => {
  return EPIC_TECHNIQUES.find(t => t.detector_id === detectorId);
};

export const getTechniqueByNumber = (number: string): EpicTechnique | undefined => {
  return EPIC_TECHNIQUES.find(t => t.nummer === number);
};

export const getAllPhases = (): string[] => {
  return ["1", "2", "3", "4"];
};

export const getPhaseLabel = (phase: string): string => {
  const labels: Record<string, string> = {
    "1": "Fase 1 - Openingsfase",
    "2": "Fase 2 - Ontdekkingsfase",
    "3": "Fase 3 - Aanbevelingsfase",
    "4": "Fase 4 - Beslissingsfase",
    "*": "Algemeen"
  };
  return labels[phase] || phase;
};

export const getPhaseTechniqueCount = (phase: string): number => {
  return EPIC_TECHNIQUES.filter(t => t.fase === phase).length;
};

// Statistieken
export const EPIC_STATS = {
  totalTechniques: EPIC_TECHNIQUES.length, // 28
  phase1Count: getTechniquesByPhase("1").length, // 4
  phase2Count: getTechniquesByPhase("2").length, // 11 (2.1 + 6 sub + 2.2 + 2.3 + 2.4)
  phase3Count: getTechniquesByPhase("3").length, // 5
  phase4Count: getTechniquesByPhase("4").length, // 7 (4.1 + 4.2 + 5 sub)
  generalCount: getTechniquesByPhase("*").length  // 1
};