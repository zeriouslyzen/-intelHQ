/**
 * Deeper decode (no LLM): manipulation phrases, symbols, numbers, timing, society connections.
 * Ported and adapted from iceburg DecoderAgent; all rule-based.
 */

const MANIPULATION_PHRASES = [
  "experts say",
  "studies show",
  "it's been proven",
  "conspiracy theory",
  "misinformation",
  "fact checked",
  "debunked",
  "baseless claims",
  "without evidence",
  "official sources say",
  "authorities say",
  "reportedly",
  "allegedly",
];

const SIGNIFICANT_NUMBERS: Record<number, string> = {
  3: "Trinity, divine completion, Masonic",
  7: "Perfection, creation, luck",
  9: "Completion, judgment, enlightenment",
  11: "Master number, illumination, gateway",
  13: "Death/transformation, Templar, unlucky",
  22: "Master builder, Masonic degrees",
  33: "Highest Masonic degree, Christ age at death",
  39: "3x13, Masonic significance",
  42: "Answer to everything, 6x7",
  66: "Route 66, Revelation beast",
  93: "Thelema, Love + Will",
  322: "Skull & Bones, Genesis 3:22",
  666: "Number of the beast",
  777: "Divine completion, jackpot",
  911: "Emergency, Twin Towers date",
  1776: "Illuminati founding, US independence",
};

const SIGNIFICANT_DATES: Record<string, string> = {
  "12-21": "Winter solstice, rebirth, Saturnalia",
  "12-22": "Winter solstice",
  "03-20": "Spring equinox, balance",
  "03-21": "Spring equinox",
  "06-20": "Summer solstice",
  "06-21": "Summer solstice",
  "09-22": "Fall equinox, harvest",
  "09-23": "Fall equinox",
  "04-30": "Walpurgis, Witches' Night",
  "05-01": "Beltane, fire festival",
  "10-31": "Samhain, Halloween, veil thinnest",
  "11-01": "Samhain",
  "02-01": "Imbolc, Candlemas",
  "02-02": "Imbolc",
  "08-01": "Lughnasadh, first harvest",
  "09-11": "9/11, crisis symbolism",
  "03-22": "322, Skull & Bones",
  "06-06": "666 date",
  "01-13": "113 gematria",
  "11-03": "113 gematria",
};

const SYMBOL_KEYWORDS: Array<{ keys: string[]; name: string; meaning: string; description: string }> = [
  { keys: ["all seeing eye", "illuminati", "freemasonry", "dollar bill"], name: "all_seeing_eye", description: "Eye in triangle/pyramid", meaning: "Divine providence, omniscience, control" },
  { keys: ["eye of horus", "horus"], name: "eye_of_horus", description: "Egyptian eye symbol", meaning: "Protection, royal power" },
  { keys: ["pyramid", "pyramids"], name: "pyramid", description: "Triangular structure", meaning: "Hierarchy, power structure, ancient knowledge" },
  { keys: ["obelisk", "washington monument"], name: "obelisk", description: "Tall four-sided pillar", meaning: "Male principle, sun worship, power" },
  { keys: ["hexagram", "star of david"], name: "hexagram", description: "Six-pointed star", meaning: "As above so below, union of opposites" },
  { keys: ["pentagram", "pentacle"], name: "pentagram", description: "Five-pointed star", meaning: "Five elements, protection or inverted" },
  { keys: ["owl", "owls"], name: "owl", description: "Nocturnal bird of prey", meaning: "Hidden wisdom, secrecy" },
  { keys: ["phoenix"], name: "phoenix", description: "Bird rising from flames", meaning: "Transformation, destruction and rebirth" },
  { keys: ["serpent", "snake", "dragon"], name: "serpent", description: "Snake/dragon", meaning: "Knowledge, temptation, healing" },
  { keys: ["hidden hand"], name: "hidden_hand", description: "Hand inside coat", meaning: "Masonic allegiance, hidden knowledge" },
  { keys: ["devil horns", "666 hand"], name: "symbolic_hand", description: "Hand gesture", meaning: "Cultural/symbolic gesture" },
  { keys: ["skull and bones", "skull & bones", "322"], name: "skull_and_bones", description: "Society symbol", meaning: "Elite society, Yale" },
];

const SOCIETY_KEYWORDS: Array<{ keys: string[]; name: string; influenceAreas: string[] }> = [
  { keys: ["freemason", "freemasonry", "masonic", "masons"], name: "Freemasonry", influenceAreas: ["government", "business", "entertainment"] },
  { keys: ["skull and bones", "skull & bones", "yale secret"], name: "Skull & Bones", influenceAreas: ["politics", "finance", "intelligence"] },
  { keys: ["bilderberg", "bilderberg group"], name: "Bilderberg", influenceAreas: ["policy", "media", "finance"] },
  { keys: ["bohemian grove", "bohemian"], name: "Bohemian Grove", influenceAreas: ["policy coordination"] },
  { keys: ["cfr", "council on foreign relations"], name: "CFR", influenceAreas: ["foreign policy", "media narrative"] },
  { keys: ["trilateral commission", "trilateral"], name: "Trilateral Commission", influenceAreas: ["global governance", "trade policy"] },
];

export interface DeepDecodeResult {
  manipulation: string[];
  numbers: Array<{ number: number; significance: string }>;
  timing: Array<{ date: string; significance: string }>;
  symbols: Array<{ name: string; meaning: string; description: string }>;
  societies: Array<{ name: string; matchType: string; influenceAreas: string[] }>;
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

export function getManipulationPatterns(text: string): string[] {
  if (!text?.trim()) return [];
  const t = normalize(text);
  const out: string[] = [];
  for (const phrase of MANIPULATION_PHRASES) {
    if (t.includes(phrase)) out.push(`Manipulation indicator: "${phrase}"`);
  }
  return out;
}

export function getSignificantNumbers(text: string): Array<{ number: number; significance: string }> {
  if (!text?.trim()) return [];
  const matches = text.match(/\b(\d+)\b/g) ?? [];
  const seen = new Set<number>();
  const out: Array<{ number: number; significance: string }> = [];
  for (const m of matches) {
    const n = parseInt(m, 10);
    if (SIGNIFICANT_NUMBERS[n] != null && !seen.has(n)) {
      seen.add(n);
      out.push({ number: n, significance: SIGNIFICANT_NUMBERS[n]! });
    }
  }
  return out.slice(0, 8);
}

export function getTimingSignificance(publishedAt?: string | null): Array<{ date: string; significance: string }> {
  if (!publishedAt) return [];
  const out: Array<{ date: string; significance: string }> = [];
  let mmdd = "";
  try {
    const d = new Date(publishedAt);
    if (Number.isNaN(d.getTime())) return [];
    const m = d.getMonth() + 1;
    const day = d.getDate();
    mmdd = `${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  } catch {
    return [];
  }
  const sig = SIGNIFICANT_DATES[mmdd];
  if (sig) out.push({ date: mmdd, significance: sig });
  return out;
}

export function getSymbolsDetected(text: string): Array<{ name: string; meaning: string; description: string }> {
  if (!text?.trim()) return [];
  const t = normalize(text);
  const out: Array<{ name: string; meaning: string; description: string }> = [];
  const seen = new Set<string>();
  for (const sym of SYMBOL_KEYWORDS) {
    for (const key of sym.keys) {
      if (t.includes(key) && !seen.has(sym.name)) {
        seen.add(sym.name);
        out.push({ name: sym.name, meaning: sym.meaning, description: sym.description });
        break;
      }
    }
  }
  return out;
}

export function getSocietyConnections(text: string): Array<{ name: string; matchType: string; influenceAreas: string[] }> {
  if (!text?.trim()) return [];
  const t = normalize(text);
  const out: Array<{ name: string; matchType: string; influenceAreas: string[] }> = [];
  for (const s of SOCIETY_KEYWORDS) {
    for (const key of s.keys) {
      if (t.includes(key)) {
        out.push({ name: s.name, matchType: "keyword", influenceAreas: s.influenceAreas });
        break;
      }
    }
  }
  return out;
}

export function deepDecode(
  text: string,
  publishedAt?: string | null
): DeepDecodeResult {
  return {
    manipulation: getManipulationPatterns(text),
    numbers: getSignificantNumbers(text),
    timing: getTimingSignificance(publishedAt),
    symbols: getSymbolsDetected(text),
    societies: getSocietyConnections(text),
  };
}
