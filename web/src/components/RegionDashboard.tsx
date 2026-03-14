"use client";

import LiveNumber from "@/components/LiveNumber";
import {
  filterCommoditiesByRegion,
  filterFxForRegion,
  REGION_BY_CODE,
  type RegionCode,
} from "@/lib/regions";
import type { CommodityQuote, Quote } from "@/lib/markets";
import { filterNewsByRegion } from "@/lib/news";
import type { NewsItem } from "@/lib/news";

interface RegionDashboardProps {
  regionCode: RegionCode | null;
  fx: Quote[];
  commodities: CommodityQuote[];
  news?: NewsItem[];
  className?: string;
}

export default function RegionDashboard({
  regionCode,
  fx,
  commodities,
  news = [],
  className = "",
}: RegionDashboardProps) {
  if (!regionCode) {
    return (
      <div
        className={
          "rounded-xl border border-neutral-200 bg-white p-4 text-xs text-neutral-500 " +
          className
        }
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Region dashboard
        </div>
        <p className="mt-1">Click a map marker to see FX, commodities, and events for that region.</p>
      </div>
    );
  }

  const region = REGION_BY_CODE.get(regionCode);
  const regionFx = filterFxForRegion(fx, regionCode);
  const regionCommodities = filterCommoditiesByRegion(commodities, regionCode);
  const regionNews = filterNewsByRegion(news, regionCode).slice(0, 5);

  return (
    <div
      className={
        "flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 " +
        className
      }
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {region?.name ?? regionCode}
      </div>
      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
          FX
        </div>
        <div className="space-y-1.5">
          {regionFx.length === 0 ? (
            <p className="text-[11px] text-neutral-400">No FX data for this region.</p>
          ) : (
            regionFx.map((q) => (
              <div
                key={q.symbol}
                className="flex justify-between rounded border border-neutral-100 bg-neutral-50 px-2 py-1.5"
              >
                <span className="font-medium text-neutral-800">{q.symbol}</span>
                <span className="font-mono text-[11px] text-neutral-700">
                  <LiveNumber value={q.price} decimals={4} />
                  {q.changePercent !== 0 && (
                    <>
                      {" "}
                      <LiveNumber
                        value={q.changePercent}
                        decimals={2}
                        suffix="%"
                        prefix={q.changePercent >= 0 ? "+" : ""}
                        className={q.changePercent >= 0 ? "text-emerald-600" : "text-red-600"}
                      />
                    </>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
          Commodities
        </div>
        <div className="space-y-1.5">
          {regionCommodities.length === 0 ? (
            <p className="text-[11px] text-neutral-400">No commodity data for this region.</p>
          ) : (
            regionCommodities.map((q) => (
              <div
                key={q.symbol}
                className="flex justify-between rounded border border-neutral-100 bg-neutral-50 px-2 py-1.5"
              >
                <span className="font-medium text-neutral-800">{q.name}</span>
                <span className="font-mono text-[11px]">
                  <LiveNumber value={q.price} decimals={2} />
                  {" "}
                  <LiveNumber
                    value={q.changePercent}
                    decimals={2}
                    suffix="%"
                    prefix={q.changePercent >= 0 ? "+" : ""}
                    className={q.changePercent >= 0 ? "text-emerald-600" : "text-red-600"}
                  />
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      {news.length > 0 && (
        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
            Events in this region
          </div>
          <div className="space-y-1.5">
            {regionNews.length === 0 ? (
              <p className="text-[11px] text-neutral-400">No recent events for this region.</p>
            ) : (
              regionNews.map((item, i) => (
                <a
                  key={`${item.source}-${i}-${item.title.slice(0, 25)}`}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded border border-neutral-100 bg-neutral-50 px-2 py-1.5 text-[11px]"
                >
                  <span className="font-medium text-neutral-800 line-clamp-2">
                    {item.title}
                  </span>
                  <span
                    className={
                      item.perspective === "left"
                        ? "text-sky-600"
                        : item.perspective === "right"
                          ? "text-amber-600"
                          : "text-neutral-500"
                    }
                  >
                    {item.source}
                  </span>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
