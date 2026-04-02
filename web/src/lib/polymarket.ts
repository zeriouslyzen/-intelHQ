/**
 * Polymarket Gamma API — public, no auth.
 * https://docs.polymarket.com/developers/gamma-markets-api/overview
 */

export type PolymarketRibbonItem = {
  slug: string;
  question: string;
  /** Implied probability 0–1 for the primary (first) outcome */
  primaryProb: number;
  primaryLabel: string;
  volume: number;
  url: string;
  /** Gamma `updatedAt` (ISO), when present */
  updatedAt?: string;
  /** Market resolution / close target from Gamma */
  endDate?: string;
};

/** JSON body from `GET /api/live/polymarket` */
export type PolymarketApiPayload = {
  markets: PolymarketRibbonItem[];
  /** Server time when Gamma was queried */
  fetchedAt: string;
};

type GammaMarket = {
  slug?: string;
  question?: string;
  outcomes?: string | string[];
  outcomePrices?: string | string[];
  volume?: string;
  active?: boolean;
  closed?: boolean;
  updatedAt?: string;
  endDate?: string;
};

function parseStringArrayField(v: string | string[] | undefined): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String);
  try {
    const parsed = JSON.parse(v) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/** Down-rank sports/entertainment; up-rank geopolitics/macro in the same volume pool. */
const POLY_SPORTS_RE =
  /\b(nba|nhl|mlb|nfl|mls|wnba|stanley cup|super bowl|world series|nba finals|fifa|world cup|uefa|champions league|olympics?|ncaa|esports|ufc|bellator|mvp|lakers|celtics|hornets|blazers|hawks|heat|warriors|suns|raptors|clippers|nuggets|bucks)\b/i;
const POLY_INTEL_RE =
  /\b(war|wars|attack|military|missile|drone|sanction|nato|pentagon|kremlin|idf|gaza|ukraine|iran|israel|taiwan|china\b|russia|syria|yemen|oil|opec|fed\b|inflation|election|president|congress|gdp|tariff|trade war|ceasefire|invasion|troops|nuclear|un security|security council|hamas|hezbollah|taiwan strait|south china|tanker|strait)\b/i;

function polymarketSortScore(volume: number, question: string): number {
  let s = volume;
  if (POLY_SPORTS_RE.test(question)) s *= 0.1;
  if (POLY_INTEL_RE.test(question)) s *= 3.5;
  return s;
}

function parsePrimary(
  outcomes: string[],
  prices: string[]
): { label: string; prob: number } {
  const label = outcomes[0] ?? "?";
  const raw = prices[0];
  const prob = raw != null ? parseFloat(raw) : NaN;
  return {
    label,
    prob: Number.isFinite(prob) ? Math.min(1, Math.max(0, prob)) : 0,
  };
}

export async function fetchPolymarketTopMarkets(
  limit = 10
): Promise<PolymarketApiPayload> {
  const fetchedAt = new Date().toISOString();
  const url =
    "https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=80";
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { markets: [], fetchedAt };
    const raw = (await res.json()) as GammaMarket[];
    if (!Array.isArray(raw)) return { markets: [], fetchedAt };

    const sorted = [...raw]
      .filter((m) => m.slug && m.question && m.outcomePrices && m.outcomes)
      .map((m) => {
        const outcomes = parseStringArrayField(m.outcomes);
        const priceStrs = parseStringArrayField(m.outcomePrices);
        const { label, prob } = parsePrimary(outcomes, priceStrs);
        const vol = parseFloat(m.volume ?? "0") || 0;
        return {
          slug: m.slug as string,
          question: m.question as string,
          primaryProb: prob,
          primaryLabel: label,
          volume: vol,
          url: `https://polymarket.com/market/${m.slug}`,
          updatedAt:
            typeof m.updatedAt === "string" && m.updatedAt.length > 0
              ? m.updatedAt
              : undefined,
          endDate:
            typeof m.endDate === "string" && m.endDate.length > 0
              ? m.endDate
              : undefined,
        };
      })
      .sort(
        (a, b) =>
          polymarketSortScore(b.volume, b.question) -
          polymarketSortScore(a.volume, a.question)
      )
      .slice(0, limit);

    return { markets: sorted, fetchedAt };
  } catch {
    return { markets: [], fetchedAt };
  }
}

const POLY_X_URL = "https://x.com/Polymarket";

/** Normalize client parse of `/api/live/polymarket` (object or legacy array). */
export function parsePolymarketApiJson(json: unknown): PolymarketApiPayload | null {
  if (json == null) return null;
  if (Array.isArray(json)) {
    return {
      markets: json as PolymarketRibbonItem[],
      fetchedAt: new Date().toISOString(),
    };
  }
  if (typeof json !== "object") return null;
  const o = json as { markets?: unknown; fetchedAt?: unknown };
  if (!Array.isArray(o.markets)) return null;
  return {
    markets: o.markets as PolymarketRibbonItem[],
    fetchedAt:
      typeof o.fetchedAt === "string" && o.fetchedAt.length > 0
        ? o.fetchedAt
        : new Date().toISOString(),
  };
}

export { POLY_X_URL };
