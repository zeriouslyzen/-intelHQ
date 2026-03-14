import type { RegionCode } from "./regions";
import { REGIONS } from "./regions";
import type { ConflictItem } from "./conflict";

const STOPWORDS = new Set([
  "the",
  "and",
  "of",
  "in",
  "to",
  "a",
  "is",
  "for",
  "on",
  "with",
  "at",
  "by",
  "from",
  "as",
  "be",
  "this",
  "are",
  "was",
  "have",
  "has",
  "had",
  "will",
  "would",
  "could",
  "can",
  "may",
  "might",
  "said",
  "says",
  "it",
  "its",
  "an",
  "or",
  "but",
  "not",
  "you",
  "your",
  "that",
  "they",
  "we",
  "our",
  "he",
  "she",
  "his",
  "her",
  "new",
  "after",
  "over",
  "into",
  "out",
  "up",
  "about",
]);

export function getTopRegionFromConflict(conflict: ConflictItem[]): RegionCode | null {
  if (conflict.length === 0) return null;
  const counts = new Map<RegionCode, number>();
  for (const item of conflict) {
    for (const code of item.regionCodes) {
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
  }
  let top: RegionCode | null = null;
  let max = 0;
  for (const [code, n] of counts) {
    if (n > max) {
      max = n;
      top = code;
    }
  }
  return top;
}

export function getThemeKeywordsFromConflict(
  conflict: ConflictItem[],
  limit = 5
): string[] {
  const text = conflict.map((c) => c.title).join(" ").toLowerCase();
  const words = text.replace(/[^\w\s]/g, " ").split(/\s+/).filter(Boolean);
  const counts = new Map<string, number>();
  for (const w of words) {
    if (w.length < 3 || STOPWORDS.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}

export function getRegionName(code: RegionCode): string {
  return REGIONS.find((r) => r.code === code)?.name ?? code;
}
