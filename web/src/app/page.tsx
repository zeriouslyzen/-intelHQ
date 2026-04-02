import TodayPageContent from "@/components/TodayPageContent";
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

export default async function Home() {
  let indices: Awaited<ReturnType<typeof fetchIndexQuotes>> = [];
  let fx: Awaited<ReturnType<typeof fetchAllRegionalFx>> = [];
  let commodities: Awaited<ReturnType<typeof fetchCommodities>> = [];
  let news: Awaited<ReturnType<typeof fetchGlobalNews>> = [];
  let conflict: Awaited<ReturnType<typeof fetchConflictUpdates>> = [];
  let flightStates: Awaited<ReturnType<typeof fetchFlightStates>> = [];
  let vesselPositions: Awaited<ReturnType<typeof fetchVesselPositions>> = [];

  let feedsConfig = getDefaultFeedsConfig();
  try {
    feedsConfig = await getFeedsConfig();
  } catch {
    // SQLite / DB unavailable — conflict feed still works with defaults
  }

  async function loadAll(cfg: ReturnType<typeof getDefaultFeedsConfig>) {
    return Promise.all([
      fetchIndexQuotes(),
      fetchAllRegionalFx(),
      fetchCommodities(),
      fetchGlobalNews(),
      fetchConflictUpdates(cfg),
      fetchFlightStates(),
      fetchVesselPositions(),
    ]);
  }

  try {
    const result = await loadAll(feedsConfig);
    indices = result[0];
    fx = result[1];
    commodities = result[2];
    news = result[3];
    conflict = result[4];
    flightStates = result[5];
    vesselPositions = result[6];
  } catch {
    try {
      const result = await loadAll(getDefaultFeedsConfig());
      indices = result[0];
      fx = result[1];
      commodities = result[2];
      news = result[3];
      conflict = result[4];
      flightStates = result[5];
      vesselPositions = result[6];
    } catch {
      try {
        conflict = await fetchConflictUpdates(getDefaultFeedsConfig());
      } catch {
        conflict = [];
      }
      try {
        indices = await fetchIndexQuotes();
      } catch {
        indices = [];
      }
      try {
        fx = await fetchAllRegionalFx();
      } catch {
        fx = [];
      }
      try {
        commodities = await fetchCommodities();
      } catch {
        commodities = [];
      }
      try {
        news = await fetchGlobalNews();
      } catch {
        news = [];
      }
      try {
        flightStates = await fetchFlightStates();
      } catch {
        flightStates = [];
      }
      try {
        vesselPositions = await fetchVesselPositions();
      } catch {
        vesselPositions = [];
      }
    }
  }

  const headlineItems = conflict.slice(0, 20).map((c) => ({
    id: c.id,
    title: c.title,
    link: c.link,
    source: c.source,
  }));

  const mainIndex = indices[0] ?? null;
  const riskLabel =
    mainIndex &&
    mainIndex.changePercent != null &&
    !Number.isNaN(mainIndex.changePercent)
      ? mainIndex.changePercent > 0.5
        ? "risk-on"
        : mainIndex.changePercent < -0.5
          ? "risk-off"
          : "mixed"
      : null;

  return (
    <TodayPageContent
      indices={indices}
      fx={fx}
      commodities={commodities}
      news={news}
      conflict={conflict}
      headlineItems={headlineItems}
      mainIndex={mainIndex}
      riskLabel={riskLabel}
      flightStates={flightStates}
      vesselPositions={vesselPositions}
    />
  );
}
