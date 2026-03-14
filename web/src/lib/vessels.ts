/**
 * Real vessel/cargo positions. Set VESSEL_API_URL in env to a pg_featureserv
 * or OGC API - Features endpoint that returns GeoJSON with point geometries.
 * Example: OpenAIS latest_position collection (self-hosted or provided).
 * Without a configured URL, returns [] and the map uses static cargo lane waypoints only.
 */

export interface VesselPosition {
  id: string;
  mmsi: string;
  name: string | null;
  latitude: number;
  longitude: number;
  sog: number | null;
  cog: number | null;
  type: string | null;
  flag: string | null;
  timeBucket: string | null;
}

/** GeoJSON Feature with point geometry and properties we can parse. */
interface GeoJsonFeature {
  type: "Feature";
  geometry?: { type: "Point"; coordinates: [number, number] };
  properties?: Record<string, unknown>;
}

interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features?: GeoJsonFeature[];
}

const HEADERS = {
  "User-Agent": "WorldSignals/1.0 (Tactical dashboard)",
  Accept: "application/geo+json, application/json",
};

/**
 * Fetch latest vessel positions from an OGC API - Features or pg_featureserv
 * collection. URL should be the collection items endpoint, e.g.:
 * https://your-server/collections/latest_position/items?limit=500
 * Optional CQL bbox: &bbox=minLon,minLat,maxLon,maxLat
 */
export async function fetchVesselPositions(
  baseUrl?: string,
  bbox?: { minLat: number; minLon: number; maxLat: number; maxLon: number }
): Promise<VesselPosition[]> {
  const url = baseUrl ?? process.env.VESSEL_API_URL;
  if (!url || typeof url !== "string") return [];

  let itemsUrl = url;
  if (bbox) {
    const sep = url.includes("?") ? "&" : "?";
    itemsUrl = `${url}${sep}bbox=${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`;
  }
  if (!itemsUrl.includes("limit=")) {
    itemsUrl += (itemsUrl.includes("?") ? "&" : "?") + "limit=300";
  }

  try {
    const res = await fetch(itemsUrl, {
      next: { revalidate: 60 },
      headers: HEADERS,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as GeoJsonFeatureCollection;
    const features = data.features ?? [];
    const out: VesselPosition[] = [];
    for (const f of features) {
      const coords = f.geometry?.coordinates;
      if (!coords || coords.length < 2) continue;
      const [lon, lat] = coords;
      const p = f.properties ?? {};
      const mmsi = String(p.mmsi ?? p.MMSI ?? "").trim();
      if (!mmsi) continue;
      out.push({
        id: mmsi,
        mmsi,
        name: (p.name ?? p.Name ?? null) as string | null,
        latitude: lat,
        longitude: lon,
        sog: (p.sog ?? p.SOG ?? null) as number | null,
        cog: (p.cog ?? p.COG ?? null) as number | null,
        type: (p.type ?? p.Type ?? null) as string | null,
        flag: (p.flag ?? p.Flag ?? null) as string | null,
        timeBucket: (p.time_bucket ?? p.Time_bucket ?? null) as string | null,
      });
    }
    return out;
  } catch {
    return [];
  }
}
