/**
 * Feed registry and config. All wartime/conflict and news sources with ids
 * so the user can enable/disable which data to fetch.
 */

export type FeedAttribution = "official" | "wire" | "outlet" | "state";

export interface FeedDef {
  id: string;
  name: string;
  url: string;
  attribution: FeedAttribution;
  region?: string;
}

/** All available conflict/wartime and mainstream news feeds. */
export const CONFLICT_FEED_REGISTRY: FeedDef[] = [
  { id: "reuters", name: "Reuters", url: "https://feeds.reuters.com/reuters/topNews", attribution: "wire", region: "US" },
  { id: "bbc", name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", attribution: "wire", region: "EU" },
  { id: "aljazeera", name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", attribution: "outlet", region: "MENA" },
  { id: "reuters-world", name: "Reuters World", url: "https://feeds.reuters.com/reuters/worldNews", attribution: "wire", region: "US" },
  { id: "defense-news", name: "Defense News", url: "https://www.defensenews.com/m/rss/", attribution: "outlet", region: "US" },
  { id: "rt", name: "RT", url: "https://www.rt.com/rss/news/", attribution: "state", region: "RUS" },
  { id: "xinhua", name: "Xinhua English", url: "http://www.xinhuanet.com/english/rss/world.htm", attribution: "state", region: "CHN" },
  { id: "cgtn", name: "CGTN", url: "https://www.cgtn.com/rss/news", attribution: "state", region: "CHN" },
];

export interface FeedsConfig {
  enabledFeedIds: string[];
  videoEmbedUrl?: string;
}

const DEFAULT_ENABLED_IDS = ["reuters", "bbc", "aljazeera", "reuters-world", "defense-news"];

export function getDefaultFeedsConfig(): FeedsConfig {
  return {
    enabledFeedIds: DEFAULT_ENABLED_IDS,
    videoEmbedUrl: undefined,
  };
}

export function getFeedById(id: string): FeedDef | undefined {
  return CONFLICT_FEED_REGISTRY.find((f) => f.id === id);
}
