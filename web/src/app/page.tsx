import TodayPageContent from "@/components/TodayPageContent";
import { fetchConflictUpdates } from "@/lib/conflict";
import { getDefaultFeedsConfig, getFeedsConfig } from "@/lib/configDb";
import {
  fetchAllRegionalFx,
  fetchCommodities,
  fetchIndexQuotes,
} from "@/lib/markets";
import { fetchGlobalNews } from "@/lib/news";

export default async function Home() {
  let indices: Awaited<ReturnType<typeof fetchIndexQuotes>> = [];
  let fx: Awaited<ReturnType<typeof fetchAllRegionalFx>> = [];
  let commodities: Awaited<ReturnType<typeof fetchCommodities>> = [];
  let news: Awaited<ReturnType<typeof fetchGlobalNews>> = [];
  let conflict: Awaited<ReturnType<typeof fetchConflictUpdates>> = [];
  try {
    const config = await getFeedsConfig();
    const result = await Promise.all([
      fetchIndexQuotes(),
      fetchAllRegionalFx(),
      fetchCommodities(),
      fetchGlobalNews(),
      fetchConflictUpdates(config),
    ]);
    indices = result[0];
    fx = result[1];
    commodities = result[2];
    news = result[3];
    conflict = result[4];
  } catch {
    const config = getDefaultFeedsConfig();
    try {
      conflict = await fetchConflictUpdates(config);
    } catch {
      conflict = [];
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
    mainIndex && mainIndex.changePercent != null
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
    />
  );
}
