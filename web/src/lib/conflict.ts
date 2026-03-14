/**
 * Military, NATO, and conflict-related feeds. Uses feed registry; optional
 * enabledFeedIds to limit which sources to fetch (RT, Xinhua, CGTN, etc.).
 */
import { XMLParser } from "fast-xml-parser";
import type { RegionCode } from "./regions";
import {
  CONFLICT_FEED_REGISTRY,
  getDefaultFeedsConfig,
  type FeedsConfig,
} from "./feedsConfig";

export type ConflictItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  regionCodes: RegionCode[];
  /** Primary-source attribution: official, wire, outlet, or state. */
  attribution: "official" | "wire" | "outlet" | "state";
};

const FEED_HEADERS = {
  "User-Agent":
    "WorldSignals/1.0 (Tactical Dashboard; conflict monitoring)",
  Accept: "application/rss+xml, application/xml, text/xml",
};

function tagRegionsFromTitle(title: string): RegionCode[] {
  const t = title.toLowerCase();
  const out: RegionCode[] = [];
  if (/\b(china|chinese|beijing|taiwan)\b/.test(t)) out.push("CHN");
  if (/\b(russia|russian|ukraine|moscow|kremlin|donbas|crimea)\b/.test(t)) out.push("RUS");
  if (/\b(iran|israel|gaza|tehran|tel aviv|hezbollah|houthi|syria|yemen|idf|centcom)\b/.test(t)) out.push("MENA");
  if (/\b(nato|nordic|baltic|europe|eu)\b/.test(t)) out.push("EU");
  if (/\b(us|usa|pentagon|dod|defense)\b/.test(t)) out.push("US");
  if (/\b(korea|north korea|dprk)\b/.test(t)) out.push("APAC");
  return out.length ? out : ["US"];
}

type RssFeed = {
  rss?: {
    channel?: {
      item?: Array<{ title?: string; link?: string; pubDate?: string }>;
    };
  };
};

const parser = new XMLParser({ ignoreAttributes: true, attributeNamePrefix: "" });

function attributionToConflict(
  a: "official" | "wire" | "outlet" | "state"
): ConflictItem["attribution"] {
  return a === "state" ? "outlet" : a;
}

async function fetchOneConflictFeed(
  url: string,
  source: string,
  attribution: ConflictItem["attribution"]
): Promise<ConflictItem[]> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 120 },
      cache: "no-store",
      headers: FEED_HEADERS,
    });
    if (!res.ok) return [];
    const text = await res.text();
    const parsed = parser.parse(text) as RssFeed;
    const items = parsed.rss?.channel?.item ?? [];
    return items.slice(0, 15).map((item, i) => ({
      id: `${source}-${i}-${(item.pubDate ?? "").slice(0, 20)}`,
      title: item.title ?? "Untitled",
      link: item.link ?? "#",
      source,
      publishedAt: item.pubDate ?? "",
      regionCodes: tagRegionsFromTitle(item.title ?? ""),
      attribution,
    }));
  } catch {
    return [];
  }
}

/** Fetch conflict updates from registry; optional config to limit which feeds. */
export async function fetchConflictUpdates(
  config?: FeedsConfig | null
): Promise<ConflictItem[]> {
  const enabled =
    (config?.enabledFeedIds?.length ?? 0) > 0
      ? config.enabledFeedIds
      : getDefaultFeedsConfig().enabledFeedIds;
  const toFetch = CONFLICT_FEED_REGISTRY.filter((f) =>
    enabled.includes(f.id)
  );
  const results = await Promise.all(
    toFetch.map((f) =>
      fetchOneConflictFeed(
        f.url,
        f.name,
        attributionToConflict(f.attribution as "official" | "wire" | "outlet" | "state")
      )
    )
  );
  const combined = results.flat();
  const byDate = combined.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const seen = new Set<string>();
  const deduped = byDate.filter((n) => {
    const key = n.title.slice(0, 55);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return deduped.slice(0, 50);
}

export function filterConflictByRegion(
  items: ConflictItem[],
  regionCode: RegionCode | null
): ConflictItem[] {
  if (!regionCode) return items;
  return items.filter((i) => i.regionCodes.includes(regionCode));
}
