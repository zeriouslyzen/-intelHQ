import { XMLParser } from "fast-xml-parser";
import type { RegionCode } from "./regions";

export type AlertType =
  | "earthquake"
  | "cyclone"
  | "flood"
  | "drought"
  | "volcano"
  | "disaster"
  | "crisis"
  | "other";

export type AlertSeverity = "green" | "orange" | "red" | "unknown";

export interface AlertItem {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  type: AlertType;
  severity: AlertSeverity;
  regionCodes: RegionCode[];
  /** When this item was fetched (for logging). */
  receivedAt: string;
  /** Optional geo for map display. */
  lat?: number;
  lon?: number;
  /** Optional magnitude or numeric severity. */
  magnitude?: number;
}

const FEED_HEADERS = {
  "User-Agent":
    "WorldSignals/1.0 (Tactical Dashboard; https://github.com/worldsignals)",
  Accept: "application/rss+xml, application/xml, application/json",
};

function tagRegionsFromTitle(title: string): RegionCode[] {
  const t = title.toLowerCase();
  const out: RegionCode[] = [];
  if (/\b(china|chinese|beijing|taiwan)\b/.test(t)) out.push("CHN");
  if (/\b(russia|russian|ukraine|moscow|kremlin)\b/.test(t)) out.push("RUS");
  if (/\b(iran|israel|gaza|tehran|tel aviv|saudi|uae|qatar|syria|lebanon|yemen|iraq|jordan|egypt)\b/.test(t)) out.push("MENA");
  if (/\b(mexico|mexican)\b/.test(t)) out.push("MEX");
  if (/\b(brazil|argentina|chile|colombia|peru|venezuela|ecuador|south america|latam)\b/.test(t)) out.push("SAM");
  if (/\b(usa|united states|us | u\.s\.|california|alaska|hawaii)\b/.test(t)) out.push("US");
  if (/\b(eu|europe|ecb|italy|greece|turkey|spain|france|germany)\b/.test(t)) out.push("EU");
  if (/\b(japan|india|indonesia|philippines|korea|australia|asia)\b/.test(t)) out.push("APAC");
  return out.length ? out : ["US"];
}

function inferTypeFromSource(source: string, title: string): AlertType {
  const s = source.toLowerCase();
  const t = title.toLowerCase();
  if (s.includes("gdacs")) {
    if (/\bearthquake|quake|magnitude|m\d\.\d\b/.test(t)) return "earthquake";
    if (/\bcyclone|typhoon|hurricane|storm\b/.test(t)) return "cyclone";
    if (/\bflood|flooding\b/.test(t)) return "flood";
    if (/\bdrought\b/.test(t)) return "drought";
    if (/\bvolcano|eruption\b/.test(t)) return "volcano";
    return "disaster";
  }
  if (s.includes("usgs")) return "earthquake";
  if (s.includes("reliefweb")) return "crisis";
  return "other";
}

// --- GDACS RSS (all events last 7 days) ---
type GdacsRss = {
  rss?: {
    channel?: {
      item?: Array<{
        title?: string;
        link?: string;
        pubDate?: string;
        "dc:date"?: string;
        description?: string;
      }>;
    };
  };
};

async function fetchGDACS(): Promise<AlertItem[]> {
  try {
    const res = await fetch("https://www.gdacs.org/xml/rss_7d.xml", {
      next: { revalidate: 300 },
      headers: FEED_HEADERS,
    });
    if (!res.ok) return [];
    const text = await res.text();
    const parser = new XMLParser({ ignoreAttributes: true });
    const parsed = parser.parse(text) as GdacsRss;
    const items = parsed.rss?.channel?.item ?? [];
    const now = new Date().toISOString();
    return items.slice(0, 30).map((item, i) => {
      const title = item.title ?? "GDACS event";
      const link = item.link ?? "https://www.gdacs.org/";
      const pubDate = item.pubDate ?? item["dc:date"] ?? now;
      return {
        id: `gdacs-${i}-${pubDate}`,
        title,
        link,
        source: "GDACS",
        publishedAt: pubDate,
        type: inferTypeFromSource("gdacs", title),
        severity: /red|orange|green/i.test(title) ? (title.toLowerCase().includes("red") ? "red" : title.toLowerCase().includes("orange") ? "orange" : "green") : "unknown",
        regionCodes: tagRegionsFromTitle(title),
        receivedAt: now,
      };
    });
  } catch {
    return [];
  }
}

// --- USGS Earthquakes GeoJSON ---
interface USGSFeature {
  type: string;
  properties?: {
    title?: string;
    url?: string;
    time?: number;
    mag?: number;
    place?: string;
  };
  geometry?: { type: string; coordinates?: [number, number, number] };
  id?: string;
}

interface USGSGeoJSON {
  type: string;
  features?: USGSFeature[];
}

async function fetchUSGSEarthquakes(): Promise<AlertItem[]> {
  try {
    const res = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson",
      { next: { revalidate: 300 }, headers: FEED_HEADERS }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as USGSGeoJSON;
    const features = data.features ?? [];
    const now = new Date().toISOString();
    return features.slice(0, 25).map((f, i) => {
      const props = f.properties ?? {};
      const title = props.title ?? `M${props.mag ?? "?"} - ${props.place ?? "Unknown"}`;
      const link = props.url ?? "https://earthquake.usgs.gov/earthquakes/";
      const coords = f.geometry?.coordinates;
      const lat = coords ? coords[1] : undefined;
      const lon = coords ? coords[0] : undefined;
      return {
        id: `usgs-${f.id ?? i}`,
        title,
        link,
        source: "USGS",
        publishedAt: props.time ? new Date(props.time).toISOString() : now,
        type: "earthquake",
        severity: (props.mag ?? 0) >= 6 ? "red" : (props.mag ?? 0) >= 5 ? "orange" : "green",
        regionCodes: tagRegionsFromTitle(title),
        receivedAt: now,
        lat,
        lon,
        magnitude: props.mag,
      };
    });
  } catch {
    return [];
  }
}

// --- ReliefWeb disasters RSS ---
type ReliefWebRss = {
  rss?: {
    channel?: {
      item?: Array<{ title?: string; link?: string; pubDate?: string }>;
    };
  };
};

async function fetchReliefWeb(): Promise<AlertItem[]> {
  try {
    const res = await fetch("https://reliefweb.int/disasters/rss.xml", {
      next: { revalidate: 600 },
      headers: FEED_HEADERS,
    });
    if (!res.ok) return [];
    const text = await res.text();
    const parser = new XMLParser({ ignoreAttributes: true });
    const parsed = parser.parse(text) as ReliefWebRss;
    const items = parsed.rss?.channel?.item ?? [];
    const now = new Date().toISOString();
    return items.slice(0, 20).map((item, i) => {
      const title = item.title ?? "ReliefWeb disaster";
      return {
        id: `reliefweb-${i}-${item.pubDate ?? ""}`,
        title,
        link: item.link ?? "https://reliefweb.int/disasters",
        source: "ReliefWeb",
        publishedAt: item.pubDate ?? now,
        type: "crisis",
        severity: "unknown",
        regionCodes: tagRegionsFromTitle(title),
        receivedAt: now,
      };
    });
  } catch {
    return [];
  }
}

/** Fetch all international/national EMS and disaster alerts; each item includes receivedAt for logging. */
export async function fetchAllAlerts(): Promise<AlertItem[]> {
  const [gdacs, usgs, reliefweb] = await Promise.all([
    fetchGDACS(),
    fetchUSGSEarthquakes(),
    fetchReliefWeb(),
  ]);
  const combined = [...gdacs, ...usgs, ...reliefweb];
  const byDate = combined.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const seen = new Set<string>();
  const deduped = byDate.filter((a) => {
    const key = `${a.source}-${a.title.slice(0, 50)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return deduped.slice(0, 60);
}

export function filterAlertsByRegion(
  alerts: AlertItem[],
  regionCode: RegionCode | null
): AlertItem[] {
  if (!regionCode) return alerts;
  return alerts.filter((a) => a.regionCodes.includes(regionCode));
}
