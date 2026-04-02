import { XMLParser } from "fast-xml-parser";
import type { RegionCode } from "./regions";

export type NewsPerspective = "left" | "center" | "right";

export type NewsItem = {
  title: string;
  link: string;
  publishedAt: string;
  source: string;
  perspective: NewsPerspective;
  regionCodes: RegionCode[];
};

const FEED_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/rss+xml, application/xml, text/xml",
};

function tagRegionsFromTitle(title: string): RegionCode[] {
  const t = title.toLowerCase();
  const out: RegionCode[] = [];
  if (/\b(china|chinese|beijing|xi)\b/.test(t)) out.push("CHN");
  if (/\b(russia|russian|ukraine|moscow|kremlin)\b/.test(t)) out.push("RUS");
  if (/\b(iran|israel|gaza|tehran|tel aviv|mena|middle east|saudi|uae|qatar|syria|lebanon)\b/.test(t)) out.push("MENA");
  if (/\b(mexico|mexican)\b/.test(t)) out.push("MEX");
  if (/\b(brazil|argentina|chile|south america|latam)\b/.test(t)) out.push("SAM");
  if (/\b(us|usa|america|federal reserve|fed)\b/.test(t)) out.push("US");
  if (/\b(eu|europe|ecb|european)\b/.test(t)) out.push("EU");
  if (/\b(japan|asia|korea)\b/.test(t)) out.push("APAC");
  return out.length ? out : ["US"];
}

type RssFeed = {
  rss?: {
    channel?: {
      item?: Array<{ title?: string; link?: string; pubDate?: string }>;
    };
  };
};

const parser = new XMLParser({
  ignoreAttributes: true,
  attributeNamePrefix: "",
});

/** Used only when all feeds fail so the Events/Today activity area is not empty. */
const FALLBACK_NEWS: NewsItem[] = [
  { title: "News feed temporarily unavailable. Refresh to retry.", link: "#", publishedAt: "", source: "System", perspective: "center", regionCodes: ["US"] },
];

const FEEDS: { url: string; source: string; perspective: NewsPerspective }[] = [
  { url: "https://feeds.reuters.com/reuters/topNews", source: "Reuters", perspective: "center" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC", perspective: "center" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera", perspective: "left" },
];

async function fetchOneFeed(
  url: string,
  source: string,
  perspective: NewsPerspective
): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(12_000),
      headers: FEED_HEADERS,
    });
    if (!res.ok) return [];
    const text = await res.text();
    const parsed = parser.parse(text) as RssFeed;
    const items = parsed.rss?.channel?.item ?? [];
    return items.slice(0, 15).map((item) => ({
      title: item.title ?? "Untitled",
      link: item.link ?? "#",
      publishedAt: item.pubDate ?? "",
      source,
      perspective,
      regionCodes: tagRegionsFromTitle(item.title ?? ""),
    }));
  } catch {
    return [];
  }
}

export async function fetchGlobalNews(): Promise<NewsItem[]> {
  const results = await Promise.all(
    FEEDS.map((f) => fetchOneFeed(f.url, f.source, f.perspective))
  );
  const combined = results.flat();
  const byDate = combined.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const seen = new Set<string>();
  const deduped = byDate.filter((n) => {
    const key = n.title.slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return deduped.length > 0 ? deduped.slice(0, 25) : FALLBACK_NEWS;
}

export function filterNewsByRegion(
  news: NewsItem[],
  regionCode: RegionCode | null
): NewsItem[] {
  if (!regionCode) return news;
  return news.filter((n) => n.regionCodes.includes(regionCode));
}
