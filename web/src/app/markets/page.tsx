import MarketsRegionPanel from "@/components/MarketsRegionPanel";
import {
  fetchAllRegionalFx,
  fetchCommodities,
  fetchIndexQuotes,
} from "@/lib/markets";

export default async function MarketsPage() {
  let indices: Awaited<ReturnType<typeof fetchIndexQuotes>> = [];
  let fx: Awaited<ReturnType<typeof fetchAllRegionalFx>> = [];
  let commodities: Awaited<ReturnType<typeof fetchCommodities>> = [];
  try {
    [indices, fx, commodities] = await Promise.all([
      fetchIndexQuotes(),
      fetchAllRegionalFx(),
      fetchCommodities(),
    ]);
  } catch {
    // keep empty arrays
  }

  const rows = [
    ...indices.map((q) => ({ ...q, type: "index" as const })),
    ...fx.map((q) => ({ ...q, type: "fx" as const })),
    ...commodities.map((q) => ({ ...q, type: "commodity" as const })),
  ].slice(0, 20);

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Markets
          </p>
          <h1 className="mt-1 text-base font-semibold text-neutral-900">
            Instruments and watchlists
          </h1>
        </div>
        <div className="hidden text-[11px] text-neutral-500 sm:block">
          Indices, FX, gold, silver, oil, chips, water.
        </div>
      </header>
      <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        <section className="flex min-h-0 flex-col rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3 text-xs text-neutral-500">
            <div>Live snapshot</div>
            <div className="flex gap-2 text-[11px]">
              <span>Indices</span>
              <span>FX</span>
              <span>Commodities</span>
            </div>
          </div>
          <div className="mt-3 flex-1 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 text-xs text-neutral-800">
            <table className="w-full border-separate border-spacing-y-0.5">
              <thead className="bg-white text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                <tr>
                  <th className="px-3 py-2 text-left">Symbol</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-right">Last</th>
                  <th className="px-3 py-2 text-right">% Chg</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((q) => (
                  <tr key={`${q.symbol}-${q.type}`} className="bg-neutral-50">
                    <td className="px-3 py-1.5 font-mono text-[11px] text-neutral-900">
                      {q.symbol}
                    </td>
                    <td className="px-3 py-1.5 text-[11px] text-neutral-700">
                      {q.name}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono">
                      {q.price.toFixed(4)}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono">
                      {"changePercent" in q && q.changePercent ? (
                        <span
                          className={
                            q.changePercent >= 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }
                        >
                          {q.changePercent.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-neutral-400">–</span>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-3 text-center text-[11px] text-neutral-500"
                    >
                      Feed offline. Refresh to retry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <MarketsRegionPanel fx={fx} commodities={commodities} />
      </div>
    </div>
  );
}
