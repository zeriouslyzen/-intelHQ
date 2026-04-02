"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { REGIONS, REGION_BY_CODE, type RegionCode } from "@/lib/regions";
import { filterNewsByRegion } from "@/lib/news";
import type { NewsItem } from "@/lib/news";
import type { ConflictItem } from "@/lib/conflict";
import {
  CARGO_ROUTES,
  AIR_ROUTES,
  type CargoRoute,
  type AirRoute,
} from "@/lib/mapLayers";
import type { FlightState } from "@/lib/flights";
import type { VesselPosition } from "@/lib/vessels";

const DEFAULT_CENTER: [number, number] = [20, 0];
const DEFAULT_ZOOM = 2;

function FixLeafletIcons() {
  const map = useMap();
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
      ._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, [map]);
  return null;
}

/** Injects radar sweep and pulse inside the map so it sits above tiles but below markers/popups. */
function RadarOverlay() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;
    const pane = container.querySelector(".leaflet-map-pane") as HTMLElement;
    if (!pane) return;
    const radar = document.createElement("div");
    radar.setAttribute("aria-hidden", "true");
    radar.className =
      "pointer-events-none absolute inset-0 overflow-hidden rounded-lg";
    radar.style.cssText =
      "left:0;top:0;right:0;bottom:0;z-index:250;border-radius:inherit;";
    radar.innerHTML = `
      <div style="position:absolute;inset:0;border-radius:inherit;border:2px solid rgba(16,185,129,0.3);background:linear-gradient(to bottom, transparent, rgba(16,185,129,0.05), transparent);"></div>
      <div class="radar-sweep-line" style="position:absolute;left:50%;top:50%;height:120%;width:8px;transform:translate(-50%,-50%);transform-origin:top center;background:linear-gradient(to bottom, transparent 0%, rgba(16,185,129,0.2) 45%, rgba(16,185,129,0.45) 50%, rgba(16,185,129,0.2) 55%, transparent 100%);"></div>
      <div class="radar-pulse-ring" style="position:absolute;left:50%;top:50%;width:128px;height:128px;margin-left:-64px;margin-top:-64px;border-radius:50%;border:2px solid rgba(16,185,129,0.4);"></div>
    `;
    pane.appendChild(radar);
    return () => {
      pane.removeChild(radar);
    };
  }, [map]);
  return null;
}

function formatPopoverTime(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function createPinIcon(kind: "news" | "logs" | "cargo" | "air", label: string) {
  return L.divIcon({
    html: `<div class="map-pin map-pin-${kind}" title="${label}">${label.slice(0, 1)}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
    className: "map-custom-pin",
  });
}

const newsIcon = createPinIcon("news", "N");
const logsIcon = createPinIcon("logs", "L");
const cargoIcon = createPinIcon("cargo", "C");
const airIcon = createPinIcon("air", "A");

/** Offset conflict pin within region to avoid overlap (lat, lon delta). */
function conflictOffset(index: number): [number, number] {
  const row = Math.floor(index / 3);
  const col = index % 3;
  return [(row - 1) * 0.8, (col - 1) * 1.2];
}

export interface MapLayersState {
  news: boolean;
  logs: boolean;
  cargo: boolean;
  air: boolean;
}

interface WorldMapProps {
  onRegionSelect?: (regionCode: RegionCode) => void;
  news?: NewsItem[];
  conflict?: ConflictItem[];
  cargoRoutes?: CargoRoute[];
  airRoutes?: AirRoute[];
  flightStates?: FlightState[];
  vesselPositions?: VesselPosition[];
  layers?: MapLayersState;
}

const DEFAULT_LAYERS: MapLayersState = {
  news: true,
  logs: true,
  cargo: true,
  air: true,
};

const MAX_FLIGHT_MARKERS = 250;
const MAX_VESSEL_MARKERS = 200;

export default function WorldMap({
  onRegionSelect,
  news = [],
  conflict = [],
  cargoRoutes = CARGO_ROUTES,
  airRoutes = AIR_ROUTES,
  flightStates = [],
  vesselPositions = [],
  layers: layerState = DEFAULT_LAYERS,
}: WorldMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-full min-h-[280px] w-full items-center justify-center rounded-lg border border-neutral-200 bg-sky-50 text-neutral-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500">
        Loading map…
      </div>
    );
  }

  const showNews = layerState.news;
  const showLogs = layerState.logs;
  const showCargo = layerState.cargo;
  const showAir = layerState.air;

  return (
    <div className="relative z-0 h-full min-h-[280px] w-full overflow-hidden rounded-lg border border-neutral-200 dark:border-zinc-700/80">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%", minHeight: "280px" }}
        className="z-0"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FixLeafletIcons />
        <RadarOverlay />

        {/* News pins: one per region */}
        {showNews &&
          REGIONS.map((r) => {
            const regionNews = filterNewsByRegion(news, r.code).slice(0, 5);
            const hasNews = regionNews.length > 0;
            return (
              <Marker
                key={`news-${r.code}`}
                position={[r.centroidLat, r.centroidLon]}
                icon={newsIcon}
                eventHandlers={{
                  click: () => onRegionSelect?.(r.code),
                }}
              >
                <Popup className="min-w-[260px] max-w-[340px] map-popup">
                  <div className="text-left">
                    <span className="font-medium">{r.name}</span>
                    <span className="ml-1 text-xs text-neutral-500">
                      · {r.code}
                    </span>
                    <div className="mt-2 border-t border-neutral-200 pt-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                        Clip / feed
                      </div>
                      <div className="rounded bg-neutral-100 p-2 text-[11px] text-neutral-500 mb-2">
                        No clip available. Link to source below.
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                        {regionNews.length} event
                        {regionNews.length !== 1 ? "s" : ""}
                      </span>
                      <ul className="mt-1 space-y-1">
                        {regionNews.map((item, i) => (
                          <li
                            key={`${item.source}-${i}-${item.title.slice(0, 20)}`}
                          >
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-[11px] text-neutral-800 hover:underline"
                            >
                              <span className="text-neutral-400">
                                [{formatPopoverTime(item.publishedAt)}] [
                                {item.source}]
                              </span>{" "}
                              {item.title.slice(0, 55)}
                              {item.title.length > 55 ? "…" : ""}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {onRegionSelect && (
                      <div className="mt-2 border-t border-neutral-100 pt-1.5">
                        <button
                          type="button"
                          className="text-xs font-medium text-sky-600 hover:underline"
                          onClick={() => onRegionSelect(r.code)}
                        >
                          View dashboard
                        </button>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Logs / conflict pins: one per conflict item, placed in first region with offset */}
        {showLogs &&
          conflict.slice(0, 40).map((item, idx) => {
            const code = item.regionCodes[0] ?? "US";
            const region = REGION_BY_CODE.get(code);
            if (!region) return null;
            const [dLat, dLon] = conflictOffset(idx);
            const lat = region.centroidLat + dLat;
            const lon = region.centroidLon + dLon;
            return (
              <Marker
                key={`log-${item.id}`}
                position={[lat, lon]}
                icon={logsIcon}
              >
                <Popup className="min-w-[260px] max-w-[340px] map-popup">
                  <div className="text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                      {item.source} · {item.attribution}
                    </span>
                    <div className="mt-2 border-t border-neutral-200 pt-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                        Clip / feed
                      </div>
                      <div className="rounded bg-neutral-100 p-2 text-[11px] text-neutral-500 mb-2">
                        No clip available. Link to source below.
                      </div>
                      <p className="text-sm text-neutral-800">
                        {item.title}
                      </p>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block text-xs font-medium text-sky-600 hover:underline"
                      >
                        Open source
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Cargo routes: real-geography lane polylines */}
        {showCargo &&
          cargoRoutes.map((route) => (
            <Polyline
              key={`cargo-${route.id}`}
              positions={route.positions}
              pathOptions={{
                color: "#059669",
                weight: 2,
                opacity: 0.6,
                dashArray: "6 4",
              }}
            />
          ))}

        {/* Real vessel positions (live AIS when VESSEL_API_URL set) */}
        {showCargo &&
          vesselPositions.slice(0, MAX_VESSEL_MARKERS).map((v) => (
            <Marker key={`vessel-${v.id}`} position={[v.latitude, v.longitude]} icon={cargoIcon}>
              <Popup>
                <div className="text-left text-sm">
                  <span className="font-medium">{v.name || v.mmsi}</span>
                  <span className="ml-1 text-xs text-neutral-500">MMSI {v.mmsi}</span>
                  {(v.sog != null || v.type) && (
                    <p className="mt-1 text-xs text-neutral-500">
                      {v.sog != null && `${v.sog.toFixed(1)} kn`}
                      {v.sog != null && v.type && " · "}
                      {v.type ?? ""}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Air routes: reference corridor polylines */}
        {showAir &&
          airRoutes.map((route) => (
            <Polyline
              key={`air-${route.id}`}
              positions={route.positions}
              pathOptions={{
                color: "#6d28d9",
                weight: 1,
                opacity: 0.35,
              }}
            />
          ))}

        {/* Real flight positions (OpenSky Network) */}
        {showAir &&
          flightStates
            .filter((f) => !f.onGround)
            .slice(0, MAX_FLIGHT_MARKERS)
            .map((f) => (
              <Marker
                key={`flight-${f.id}`}
                position={[f.latitude, f.longitude]}
                icon={airIcon}
              >
                <Popup>
                  <div className="text-left text-sm">
                    <span className="font-medium">{f.callsign || f.icao24}</span>
                    <span className="ml-1 text-xs text-neutral-500">{f.originCountry}</span>
                    <div className="mt-1 text-xs text-neutral-500">
                      {f.baroAltitude != null && `${Math.round(f.baroAltitude)} m`}
                      {f.velocity != null && ` · ${Math.round(f.velocity)} m/s`}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

        {/* Cargo route endpoints as small markers (optional) */}
        {showCargo &&
          cargoRoutes.map((route) => {
            const pos = route.positions[0];
            if (!pos) return null;
            return (
              <Marker
                key={`cargo-pin-${route.id}`}
                position={pos}
                icon={cargoIcon}
              >
                <Popup>
                  <div className="text-left text-sm">
                    <span className="font-medium">{route.name}</span>
                    {route.summary && (
                      <p className="mt-1 text-xs text-neutral-500">
                        {route.summary}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {showAir &&
          airRoutes.map((route) => {
            const pos = route.positions[0];
            if (!pos) return null;
            return (
              <Marker
                key={`air-pin-${route.id}`}
                position={pos}
                icon={airIcon}
              >
                <Popup>
                  <div className="text-left text-sm">
                    <span className="font-medium">{route.name}</span>
                    {route.summary && (
                      <p className="mt-1 text-xs text-neutral-500">
                        {route.summary}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}
