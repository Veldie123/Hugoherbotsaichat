import techniekenData from "./technieken_index.json";

export interface Techniek {
  nummer: string;
  naam: string;
  fase: string;
  is_fase?: boolean;
  parent?: string;
  doel?: string;
  wat?: string;
  waarom?: string;
  wanneer?: string;
  hoe?: string;
  themas?: string[];
  tags?: string[];
  voorbeeld?: string[];
  stappenplan?: string[];
  context_requirements?: string[];
  kan_starten_op_klant_signaal?: boolean;
  verkoper_intentie?: string[];
}

export interface TechniekenIndex {
  _meta: {
    version: string;
    description: string;
    last_updated: string;
    EPIC_structure?: Record<string, string>;
  };
  technieken: Record<string, Techniek>;
}

const data = techniekenData as TechniekenIndex;

export function getAllTechnieken(): Techniek[] {
  return Object.values(data.technieken);
}

export function getTechniekByNummer(nummer: string): Techniek | undefined {
  return data.technieken[nummer];
}

export function getTechniekenByFase(fase: string): Techniek[] {
  return Object.values(data.technieken).filter(t => t.fase === fase && !t.is_fase);
}

export function getFases(): Techniek[] {
  return Object.values(data.technieken).filter(t => t.is_fase === true);
}

export function getTechniekChildren(parentNummer: string): Techniek[] {
  return Object.values(data.technieken).filter(t => t.parent === parentNummer);
}

export function getEPICTechnieken(): Techniek[] {
  return Object.values(data.technieken).filter(t => 
    !t.is_fase && 
    (t.fase === "1" || t.fase === "2" || t.fase === "3" || t.fase === "4")
  );
}

export function getTechniekCount(): number {
  return Object.values(data.technieken).filter(t => !t.is_fase).length;
}

export function getTechniekCountByFase(fase: string): number {
  return getTechniekenByFase(fase).length;
}

export function getFaseNaam(fase: string): string {
  const faseMap: Record<string, string> = {
    "0": "Pre-contactfase",
    "1": "Openingsfase",
    "2": "Ontdekkingsfase",
    "3": "Aanbevelingsfase",
    "4": "Beslissingsfase"
  };
  return faseMap[fase] || fase;
}

export function searchTechnieken(query: string): Techniek[] {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(data.technieken).filter(t => 
    t.naam.toLowerCase().includes(lowercaseQuery) ||
    t.nummer.toLowerCase().includes(lowercaseQuery) ||
    t.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    t.themas?.some(thema => thema.toLowerCase().includes(lowercaseQuery))
  );
}

export const TECHNIEKEN_META = data._meta;
