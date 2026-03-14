"use client";

import { useEffect, useState } from "react";
import LiveNumber from "@/components/LiveNumber";
import type { CommodityQuote, Quote } from "@/lib/markets";
import type { NewsItem } from "@/lib/news";

const POLL_MS = 30_000;

export default function NavTickers() {
  const [markets, setMarkets] = useState<(Quote & { tag?: string })[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  useEffect(() => {
    const load = async () => {
      setHasAttemptedLoad(true);
      const cacheOpts = { cache: "no-store" as RequestCache };
      try {
        const [indicesRes, fxRes, commoditiesRes, newsRes] = await Promise.all([
          fetch("/api/live/indices", cacheOpts),
          fetch("/api/live/fx", cacheOpts),
          fetch("/api/live/commodities", cacheOpts),
          fetch("/api/live/news", cacheOpts),
        ]);
        const indices = indicesRes.ok ? ((await indicesRes.json()) as Quote[]) : [];
        const fx = fxRes.ok ? ((await fxRes.json()) as Quote[]) : [];
        const commodities = commoditiesRes.ok ? ((await commoditiesRes.json()) as CommodityQuote[]) : [];
        const newsData = newsRes.ok ? ((await newsRes.json()) as NewsItem[]) : [];
        setMarkets([
          ...indices.slice(0, 3),
          ...fx.slice(0, 4),
          ...commodities.slice(0, 4),
        ]);
        setNews(newsData.slice(0, 12));
        setLastUpdated(new Date());
      } catch {
        setMarkets([]);
        setNews([]);
      }
    };
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, []);

  const marketsRow = markets.length === 0 ? null : (
    <>
      {markets.map((q) => (
        <span key={q.symbol} className="flex shrink-0 items-center gap-1.5">
          <span className="text-neutral-700">{q.symbol}</span>
          <LiveNumber
            value={q.price}
            decimals={typeof q.price === "number" && q.price > 1 ? 2 : 4}
            className="text-neutral-900"
            showDirection={false}
          />
          {"changePercent" in q && (
            <LiveNumber
              value={(q as Quote).changePercent}
              decimals={2}
              suffix="%"
              prefix={(q as Quote).changePercent >= 0 ? "+" : ""}
              showDirection
              upClass="text-emerald-600"
              downClass="text-red-600"
              className={(q as Quote).changePercent >= 0 ? "text-emerald-600" : "text-red-600"}
            />
          )}
        </span>
      ))}
    </>
  );

  const newsRow = news.length === 0 ? null : (
    <>
      {news.map((item, i) => (
        <a
          key={`${item.source}-${i}-${item.title.slice(0, 30)}`}
          href={item.link}
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center gap-2"
        >
          <span
            className={
              item.perspective === "left"
                ? "text-sky-600"
                : item.perspective === "right"
                  ? "text-amber-600"
                  : "text-neutral-500"
            }
          >
            [{item.source}]
          </span>
          <span className="max-w-[280px] truncate text-neutral-800">
            {item.title}
          </span>
        </a>
      ))}
    </>
  );

  const marketsStatus =
    !hasAttemptedLoad
      ? "Loading…"
      : markets.length === 0
        ? "Feed offline. Retrying…"
        : lastUpdated
          ? `${Math.round((Date.now() - lastUpdated.getTime()) / 1000)}s ago`
          : "";

  return (
    <div className="border-b border-neutral-200 bg-white/95">
      <div className="overflow-hidden border-b border-neutral-100">
        <div className="flex items-center justify-between gap-2 py-1.5 text-[11px] font-medium">
          <div className="flex min-w-0 flex-1 overflow-hidden">
          {markets.length === 0 ? (
            <span className="text-neutral-400">{marketsStatus}</span>
          ) : (
            <div className="flex w-max gap-6 animate-scroll-markets">
              <div className="flex shrink-0 gap-6">{marketsRow}</div>
              <div className="flex shrink-0 gap-6" aria-hidden>{marketsRow}</div>
            </div>
          )}
          </div>
          {markets.length > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-[10px] text-neutral-400">
              <span className={`h-1.5 w-1.5 rounded-full bg-emerald-500 ${lastUpdated && Date.now() - lastUpdated.getTime() < 35000 ? "animate-pulse" : ""}`} />
              {marketsStatus}
            </span>
          )}
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="flex py-1.5 text-[11px]">
          {news.length === 0 ? (
            <span className="text-neutral-400">
              {!hasAttemptedLoad ? "Loading…" : "Headlines offline. Retrying…"}
            </span>
          ) : (
            <div className="flex w-max gap-6 animate-scroll-news">
              <div className="flex shrink-0 gap-6">{newsRow}</div>
              <div className="flex shrink-0 gap-6" aria-hidden>{newsRow}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
