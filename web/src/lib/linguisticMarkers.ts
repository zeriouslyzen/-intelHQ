/**
 * Linguistic marker detector (intel-style).
 * Port of iceburg/protocols/dossier/linguistic_markers.py.
 * Detects gatekeeper, reciprocity, euphemism, compartmentation in text.
 */

export type MarkerType =
  | "gatekeeper"
  | "reciprocity"
  | "euphemism"
  | "compartmentation";

export interface LinguisticMarker {
  phrase: string;
  type: MarkerType;
  span: [number, number];
}

const GATEKEEPER_PHRASES = [
  "craft an answer",
  "craft a response",
  "i can connect you with",
  "connect you with",
  "introductions to",
  "introduction to",
  "prominent global figures",
  "prominent figures",
  "wing man",
  "wingman",
  "broker access",
  "brokering access",
];

const RECIPROCITY_PHRASES = [
  "generating a debt",
  "generate a debt",
  "save him",
  "save her",
  "valuable currency",
  "political currency",
  "pr and political currency",
  "best shot",
  "best shot is",
  "positive benefit for you",
  "hang him",
  "hang her",
];

const EUPHEMISM_PHRASES = [
  "dog that hasn't barked",
  "hasn't barked",
  "the girls",
  "the girl",
  "forced holding pattern",
  "holding pattern",
  "wing man",
  "wingman",
  // News/headline extensions
  "response",
  "military response",
  "escalation",
  "incident",
  "exchange",
  "limited strike",
  "precision strike",
  "kinetic action",
  "collateral damage",
];

const COMPARTMENTATION_PHRASES = [
  "off the record",
  "on background",
  "not for attribution",
  "between us",
  "confidentially",
];

const PHRASE_LISTS: [MarkerType, string[]][] = [
  ["gatekeeper", GATEKEEPER_PHRASES],
  ["reciprocity", RECIPROCITY_PHRASES],
  ["euphemism", EUPHEMISM_PHRASES],
  ["compartmentation", COMPARTMENTATION_PHRASES],
];

export function detectLinguisticMarkers(text: string): LinguisticMarker[] {
  if (!text?.trim()) return [];
  const results: LinguisticMarker[] = [];
  const textLower = text.toLowerCase();

  for (const [markerType, phrases] of PHRASE_LISTS) {
    for (const phrase of phrases) {
      let start = 0;
      while (true) {
        const pos = textLower.indexOf(phrase, start);
        if (pos === -1) break;
        results.push({
          phrase,
          type: markerType,
          span: [pos, pos + phrase.length],
        });
        start = pos + 1;
      }
    }
  }
  return results;
}
