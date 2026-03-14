/**
 * Map layer data: cargo lanes, air routes, and helpers for pins.
 * Used by the radar-style map for togglable layers and icons.
 */

export type MapLayerId = "news" | "logs" | "cargo" | "air";

export interface CargoRoute {
  id: string;
  name: string;
  /** [lat, lon][] for polyline */
  positions: [number, number][];
  summary?: string;
}

export interface AirRoute {
  id: string;
  name: string;
  positions: [number, number][];
  summary?: string;
}

/**
 * Major shipping lane waypoints (real geography: Suez, Malacca, Panama, Trans-Pacific).
 * Live vessel positions are fetched separately via fetchVesselPositions when VESSEL_API_URL is set.
 */
export const CARGO_ROUTES: CargoRoute[] = [
  {
    id: "suez",
    name: "Suez Canal",
    summary: "Europe–Asia corridor",
    positions: [
      [31.3, 32.3],
      [29.9, 32.5],
      [29.5, 32.3],
      [27.2, 33.8],
      [12.5, 43.3],
    ],
  },
  {
    id: "strait-malacca",
    name: "Strait of Malacca",
    summary: "Indian Ocean–South China Sea",
    positions: [
      [5.4, 100.3],
      [1.2, 103.8],
      [1.3, 104.0],
    ],
  },
  {
    id: "panama",
    name: "Panama Canal",
    summary: "Atlantic–Pacific",
    positions: [
      [9.4, -79.9],
      [9.1, -79.7],
      [8.9, -79.5],
    ],
  },
  {
    id: "transpacific",
    name: "Trans-Pacific (Asia–US)",
    summary: "Shanghai–LA",
    positions: [
      [31.2, 121.5],
      [35.5, 139.8],
      [37.8, -122.4],
    ],
  },
];

/**
 * Representative air corridor waypoints (real city pairs). Live flight positions
 * are from OpenSky Network via fetchFlightStates.
 */
export const AIR_ROUTES: AirRoute[] = [
  {
    id: "lhr-dxb",
    name: "LHR–DXB",
    summary: "London–Dubai",
    positions: [
      [51.5, -0.5],
      [50.0, 8.0],
      [45.0, 12.0],
      [25.3, 55.4],
    ],
  },
  {
    id: "jfk-lhr",
    name: "JFK–LHR",
    summary: "New York–London",
    positions: [
      [40.6, -73.8],
      [51.5, -0.5],
    ],
  },
  {
    id: "pek-fra",
    name: "PEK–FRA",
    summary: "Beijing–Frankfurt",
    positions: [
      [40.1, 116.6],
      [51.1, 10.5],
    ],
  },
  {
    id: "dxb-sin",
    name: "DXB–SIN",
    summary: "Dubai–Singapore",
    positions: [
      [25.3, 55.4],
      [1.4, 103.99],
    ],
  },
];
