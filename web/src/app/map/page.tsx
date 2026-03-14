import MapViewClientWrapper from "@/components/MapViewClientWrapper";
import { fetchConflictUpdates } from "@/lib/conflict";
import { getFeedsConfig } from "@/lib/configDb";
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
  const config = await getFeedsConfig();
  const [indices, fx, commodities, news, conflict, flightStates, vesselPositions] =
    await Promise.all([
      fetchIndexQuotes(),
      fetchAllRegionalFx(),
      fetchCommodities(),
      fetchGlobalNews(),
      fetchConflictUpdates(config),
      fetchFlightStates(),
      fetchVesselPositions(),
    ]);

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
