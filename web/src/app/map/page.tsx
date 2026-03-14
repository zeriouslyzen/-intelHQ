import MapViewClientWrapper from "@/components/MapViewClientWrapper";
import { fetchConflictUpdates } from "@/lib/conflict";
import { getDefaultFeedsConfig, getFeedsConfig } from "@/lib/configDb";
import { fetchFlightStates } from "@/lib/flights";
import {
  fetchAllRegionalFx,
  fetchCommodities,
  fetchIndexQuotes,
} from "@/lib/markets";
import { fetchGlobalNews } from "@/lib/news";
import { fetchVesselPositions } from "@/lib/vessels";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  let indices: Awaited<ReturnType<typeof fetchIndexQuotes>> = [];
  let fx: Awaited<ReturnType<typeof fetchAllRegionalFx>> = [];
  let commodities: Awaited<ReturnType<typeof fetchCommodities>> = [];
  let news: Awaited<ReturnType<typeof fetchGlobalNews>> = [];
  let conflict: Awaited<ReturnType<typeof fetchConflictUpdates>> = [];
  let flightStates: Awaited<ReturnType<typeof fetchFlightStates>> = [];
  let vesselPositions: Awaited<ReturnType<typeof fetchVesselPositions>> = [];
  try {
    const config = await getFeedsConfig();
    const result = await Promise.all([
      fetchIndexQuotes(),
      fetchAllRegionalFx(),
      fetchCommodities(),
      fetchGlobalNews(),
      fetchConflictUpdates(config),
      fetchFlightStates(),
      fetchVesselPositions(),
    ]);
    indices = result[0];
    fx = result[1];
    commodities = result[2];
    news = result[3];
    conflict = result[4];
    flightStates = result[5];
    vesselPositions = result[6];
  } catch {
    const config = getDefaultFeedsConfig();
    try {
      [indices, fx, commodities, news, conflict, flightStates, vesselPositions] = await Promise.all([
        fetchIndexQuotes(),
        fetchAllRegionalFx(),
        fetchCommodities(),
        fetchGlobalNews(),
        fetchConflictUpdates(config),
        fetchFlightStates(),
        fetchVesselPositions(),
      ]);
    } catch {
      // keep empty arrays
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Map
          </p>
          <h1 className="mt-1 text-base font-semibold text-neutral-900">
            Radar · news · cargo · air
          </h1>
        </div>
        <div className="hidden text-[11px] text-neutral-500 sm:block">
          Real metrics: OpenSky flights; cargo lanes + vessels when VESSEL_API_URL set.
        </div>
      </header>
      <MapViewClientWrapper
        indices={indices}
        fx={fx}
        commodities={commodities}
        news={news}
        conflict={conflict}
        flightStates={flightStates}
        vesselPositions={vesselPositions}
      />
    </div>
  );
}
