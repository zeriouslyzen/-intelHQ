/**
 * Real-time flight positions from OpenSky Network (public API).
 * Rate limit: 1 request per 10 seconds without auth.
 * @see https://openskynetwork.github.io/opensky-api/rest.html
 */

export interface FlightState {
  id: string;
  icao24: string;
  callsign: string | null;
  originCountry: string;
  latitude: number;
  longitude: number;
  baroAltitude: number | null;
  velocity: number | null;
  onGround: boolean;
  lastContact: number;
}

type OpenSkyStateVector = [
  string, // 0 icao24
  string | null, // 1 callsign
  string, // 2 origin_country
  number | null, // 3 time_position
  number, // 4 last_contact
  number | null, // 5 longitude
  number | null, // 6 latitude
  number | null, // 7 baro_altitude
  boolean, // 8 on_ground
  number | null, // 9 velocity
  number | null, // 10 true_track
  number | null, // 11 vertical_rate
  number[] | null, // 12 sensors
  number | null, // 13 geo_altitude
  string | null, // 14 squawk
  boolean | null, // 15 spi
  number, // 16 position_source
];

interface OpenSkyResponse {
  time: number;
  states: OpenSkyStateVector[] | null;
}

const OPENSKY_BASE = "https://opensky-network.org/api";
/** Global-ish bbox to avoid huge response; focus on busy corridors. */
const DEFAULT_BBOX = {
  lamin: 20,
  lomin: -130,
  lamax: 55,
  lomax: 60,
};

const REQUEST_HEADERS = {
  "User-Agent": "WorldSignals/1.0 (Tactical dashboard; opensky-network.org/api)",
  Accept: "application/json",
};

export async function fetchFlightStates(
  bbox?: { lamin: number; lomin: number; lamax: number; lomax: number }
): Promise<FlightState[]> {
  const { lamin, lomin, lamax, lomax } = bbox ?? DEFAULT_BBOX;
  const url = `${OPENSKY_BASE}/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 15 },
      signal: AbortSignal.timeout(8_000),
      headers: REQUEST_HEADERS,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as OpenSkyResponse;
    const states = data.states ?? [];
    const out: FlightState[] = [];
    for (const s of states) {
      const lon = s[5];
      const lat = s[6];
      if (lon == null || lat == null) continue;
      out.push({
        id: s[0],
        icao24: s[0],
        callsign: s[1]?.trim() || null,
        originCountry: s[2] ?? "",
        latitude: lat,
        longitude: lon,
        baroAltitude: s[7] ?? null,
        velocity: s[9] ?? null,
        onGround: s[8] ?? false,
        lastContact: s[4] ?? 0,
      });
    }
    return out;
  } catch {
    return [];
  }
}
