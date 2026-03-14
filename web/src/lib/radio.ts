import type { RegionCode } from "./regions";

export interface RadioStation {
  id: string;
  name: string;
  url: string;
  countryCode: string;
  country?: string;
  tags: string[];
  regionCode: RegionCode | null;
  /** When this was last fetched (for log). */
  fetchedAt: string;
  /** Optional homepage. */
  homepage?: string;
}

const RADIO_API_BASE = "https://de1.api.radio-browser.info";
const RADIO_HEADERS = {
  "User-Agent": "WorldSignals/1.0 (Tactical Dashboard)",
  Accept: "application/json",
};

/** Map country codes to our region codes for filtering. */
const COUNTRY_TO_REGION: Record<string, RegionCode> = {
  US: "US", USA: "US", CA: "US", MX: "MEX",
  GB: "EU", UK: "EU", DE: "EU", FR: "EU", IT: "EU", ES: "EU", NL: "EU", PL: "EU", UA: "EU", TR: "EU",
  RU: "RUS", CN: "CHN", JP: "APAC", KR: "APAC", IN: "APAC", AU: "APAC", ID: "APAC", SG: "APAC",
  BR: "SAM", AR: "SAM", CL: "SAM", CO: "SAM", PE: "SAM",
  SA: "MENA", AE: "MENA", IL: "MENA", IR: "MENA", IQ: "MENA", EG: "MENA", QA: "MENA", JO: "MENA", LB: "MENA",
};

interface RadioBrowserStation {
  stationuuid?: string;
  name?: string;
  url_resolved?: string;
  url?: string;
  countrycode?: string;
  country?: string;
  tags?: string;
  homepage?: string;
}

async function fetchFromRadioBrowser(
  path: string,
  params: Record<string, string>
): Promise<RadioBrowserStation[]> {
  try {
    const q = new URLSearchParams(params).toString();
    const url = `${RADIO_API_BASE}${path}?${q}`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: RADIO_HEADERS,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Curated international and national news/talk stations (fallback and known broadcasters). */
const CURATED_STATIONS: Omit<RadioStation, "id" | "fetchedAt">[] = [
  { name: "BBC World Service", url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service", countryCode: "GB", tags: ["news", "international"], regionCode: "EU", homepage: "https://www.bbc.co.uk/sounds/play/live:bbc_world_service" },
  { name: "NPR News Now", url: "https://live.wostreaming.net/direct/npr-news-now-mp3", countryCode: "US", tags: ["news", "national"], regionCode: "US", homepage: "https://www.npr.org" },
  { name: "VOA English", url: "https://voa-28.akacast.akamaistream.net/7/998/234273/v1/nonpac.akacast.akamaistream.net/voa-28", countryCode: "US", tags: ["news", "international"], regionCode: "US", homepage: "https://www.voanews.com" },
  { name: "DW English", url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8", countryCode: "DE", tags: ["news", "international"], regionCode: "EU", homepage: "https://www.dw.com" },
  { name: "ABC News Radio Australia", url: "https://live.abc.net.au/radio/newsradio/audio/", countryCode: "AU", tags: ["news"], regionCode: "APAC", homepage: "https://www.abc.net.au/newsradio" },
  { name: "Radio France Internationale English", url: "https://rfien-lh.akamaihd.net/i/rfien_1@586591/master.m3u8", countryCode: "FR", tags: ["news", "international"], regionCode: "EU", homepage: "https://www.rfi.fr/en" },
  { name: "CBC Radio One", url: "https://cbcradiolive-lh.akamaihd.net/i/cbcradio1_1@450257/master.m3u8", countryCode: "CA", tags: ["news", "national"], regionCode: "US", homepage: "https://www.cbc.ca/radio" },
  { name: "Al Jazeera English", url: "https://live-hls-web-aje.getaj.net/AJE/index.m3u8", countryCode: "QA", tags: ["news", "international"], regionCode: "MENA", homepage: "https://www.aljazeera.com" },
  { name: "NHK World Radio Japan", url: "https://nhkworld.webcdn.stream.ne.jp/www11/nhkworld/tv/domestic/live_news.m3u8", countryCode: "JP", tags: ["news", "international"], regionCode: "APAC", homepage: "https://www3.nhk.or.jp/nhkworld/" },
];

function toStation(s: RadioBrowserStation, fetchedAt: string): RadioStation {
  const code = (s.countrycode ?? "").toUpperCase();
  return {
    id: s.stationuuid ?? `rb-${code}-${s.name ?? ""}`.replace(/\s/g, "-"),
    name: s.name ?? "Unknown",
    url: s.url_resolved ?? s.url ?? "#",
    countryCode: code,
    country: s.country,
    tags: (s.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    regionCode: COUNTRY_TO_REGION[code] ?? null,
    fetchedAt,
    homepage: s.homepage,
  };
}

/** Fetch news/talk stations from Radio Browser API; merge with curated list and dedupe by name. */
export async function fetchRadioStations(): Promise<RadioStation[]> {
  const fetchedAt = new Date().toISOString();
  const [byTagNews, byTagTalk] = await Promise.all([
    fetchFromRadioBrowser("/json/stations/search", { tag: "news", limit: "20" }),
    fetchFromRadioBrowser("/json/stations/search", { tag: "talk", limit: "15" }),
  ]);
  const fromApi = [...byTagNews, ...byTagTalk]
    .filter((s) => s.url_resolved || s.url)
    .map((s) => toStation(s, fetchedAt));
  const curated: RadioStation[] = CURATED_STATIONS.map((c, i) => ({
    ...c,
    id: `curated-${i}-${c.name.replace(/\s/g, "-")}`,
    fetchedAt,
  }));
  const byName = new Map<string, RadioStation>();
  curated.forEach((s) => byName.set(s.name.toLowerCase(), s));
  fromApi.forEach((s) => {
    const key = s.name.toLowerCase();
    if (!byName.has(key)) byName.set(key, s);
  });
  return Array.from(byName.values()).slice(0, 50);
}

export function filterRadioByRegion(
  stations: RadioStation[],
  regionCode: RegionCode | null
): RadioStation[] {
  if (!regionCode) return stations;
  return stations.filter((s) => s.regionCode === regionCode);
}
