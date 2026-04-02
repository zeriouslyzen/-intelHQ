"use client";

import { useEffect, useState } from "react";
import LiveNumber from "@/components/LiveNumber";
import { useLivePolling } from "@/contexts/LivePollingContext";
import { useLocale } from "@/contexts/LocaleContext";
import { formatPolyAbsolute } from "@/lib/formatPolyTimes";
import type { CryptoQuote } from "@/lib/cryptoQuotes";
import type { CommodityQuote, Quote } from "@/lib/markets";
import type { NewsItem } from "@/lib/news";
import {
  POLY_X_URL,
  parsePolymarketApiJson,
  type PolymarketRibbonItem,
} from "@/lib/polymarket";

const POLL_MS = 30_000;

/** Hue-coded symbols: indices, FX, futures — matches Yahoo-style tickers */
function symbolMarketClass(symbol: string): string {
  if (symbol.startsWith("^"))
    return "text-amber-600 dark:text-[var(--mkt-index)]";
  if (symbol.endsWith("=X"))
    return "text-cyan-700 dark:text-[var(--mkt-fx)]";
  if (symbol.endsWith("=F"))
    return "text-violet-700 dark:text-[var(--mkt-commodity)]";
  return "text-neutral-700 dark:text-zinc-400";
}

function cryptoDecimals(price: number): number {
  if (price >= 100) return 2;
  if (price >= 1) return 4;
  return 5;
}

export default function NavTickers() {
  const { shouldPoll, reportFeedSuccess } = useLivePolling();
  const { t, locale } = useLocale();
  const [markets, setMarkets] = useState<(Quote & { tag?: string })[]>([]);
  const [crypto, setCrypto] = useState<CryptoQuote[]>([]);
  const [poly, setPoly] = useState<PolymarketRibbonItem[]>([]);
  const [polyFetchedAt, setPolyFetchedAt] = useState<string | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setHasAttemptedLoad(true);
      try {
        /* Default cache: honors Route Handler revalidate + CDN; polling still refreshes on interval. */
        const [indicesRes, fxRes, commoditiesRes, cryptoRes, polyRes, newsRes] =
          await Promise.all([
            fetch("/api/live/indices"),
            fetch("/api/live/fx"),
            fetch("/api/live/commodities"),
            fetch("/api/live/crypto"),
            fetch("/api/live/polymarket"),
            fetch("/api/live/news"),
          ]);
        if (cancelled) return;
        const indices = indicesRes.ok ? ((await indicesRes.json()) as Quote[]) : [];
        const fx = fxRes.ok ? ((await fxRes.json()) as Quote[]) : [];
        const commodities = commoditiesRes.ok
          ? ((await commoditiesRes.json()) as CommodityQuote[])
          : [];
        const cryptoData = cryptoRes.ok
          ? ((await cryptoRes.json()) as CryptoQuote[])
          : [];
        const polyRaw = polyRes.ok ? await polyRes.json() : null;
        const polyPayload = parsePolymarketApiJson(polyRaw);
        const newsData = newsRes.ok ? ((await newsRes.json()) as NewsItem[]) : [];
        setMarkets([
          ...indices.slice(0, 3),
          ...fx.slice(0, 4),
          ...commodities.slice(0, 4),
        ]);
        setCrypto(Array.isArray(cryptoData) ? cryptoData : []);
        if (polyPayload) {
          setPoly(polyPayload.markets.slice(0, 14));
          setPolyFetchedAt(polyPayload.fetchedAt);
        } else {
          setPoly([]);
          setPolyFetchedAt(null);
        }
        setNews(newsData.slice(0, 12));
        const now = new Date();
        setLastUpdated(now);
        const anyOk =
          indicesRes.ok ||
          fxRes.ok ||
          commoditiesRes.ok ||
          cryptoRes.ok ||
          polyRes.ok ||
          newsRes.ok;
        if (anyOk) reportFeedSuccess();
      } catch {
        if (!cancelled) {
          setMarkets([]);
          setCrypto([]);
          setPoly([]);
          setPolyFetchedAt(null);
          setNews([]);
        }
      }
    };
    load();
    if (!shouldPoll) {
      return () => {
        cancelled = true;
      };
    }
    const t = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [shouldPoll, reportFeedSuccess]);

  const marketsRow = markets.length === 0 ? null : (
    <>
      {markets.map((q) => (
        <span
          key={q.symbol}
          className="font-mkt-mono flex shrink-0 items-center gap-1.5 text-[11px] tracking-tight"
        >
          <span
            className={`font-board text-[11px] font-semibold tracking-wide ${symbolMarketClass(q.symbol)}`}
          >
            {q.symbol}
          </span>
          <LiveNumber
            value={q.price}
            decimals={typeof q.price === "number" && q.price > 1 ? 2 : 4}
            className="text-neutral-900 dark:text-zinc-200"
            showDirection={false}
          />
          {"changePercent" in q && (
            <LiveNumber
              value={(q as Quote).changePercent}
              decimals={2}
              suffix="%"
              prefix={(q as Quote).changePercent >= 0 ? "+" : ""}
              showDirection
              upClass="text-emerald-600 dark:text-emerald-400"
              downClass="text-red-600 dark:text-rose-400"
              className={
                (q as Quote).changePercent >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-rose-400"
              }
            />
          )}
        </span>
      ))}
    </>
  );

  const cryptoRow = crypto.length === 0 ? null : (
    <>
      {crypto.map((q) => (
        <span
          key={q.symbol}
          className="font-mkt-mono flex shrink-0 items-center gap-1.5 text-[11px] tracking-tight"
        >
          <span className="font-board text-[11px] font-semibold tracking-wide text-fuchsia-700 dark:text-fuchsia-400">
            {q.symbol}
          </span>
          <LiveNumber
            value={q.price}
            decimals={cryptoDecimals(q.price)}
            className="text-neutral-900 dark:text-zinc-200"
            showDirection={false}
          />
          <LiveNumber
            value={q.changePercent}
            decimals={2}
            suffix="%"
            prefix={q.changePercent >= 0 ? "+" : ""}
            showDirection
            upClass="text-emerald-600 dark:text-emerald-400"
            downClass="text-red-600 dark:text-rose-400"
            className={
              q.changePercent >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-rose-400"
            }
          />
        </span>
      ))}
    </>
  );

  const polyRow = poly.length === 0 ? null : (
    <>
      {poly.map((m) => (
        <a
          key={m.slug}
          href={m.url}
          target="_blank"
          rel="noreferrer"
          className="font-mkt-mono flex max-w-[min(100vw,420px)] shrink-0 items-center gap-2 text-[11px] text-violet-800 hover:underline dark:text-violet-300"
        >
          <span className="shrink-0 font-board text-[10px] text-violet-600 dark:text-violet-400">
            POLY
          </span>
          <span className="shrink-0 tabular-nums opacity-90">
            {(m.primaryProb * 100).toFixed(1)}¢ {m.primaryLabel}
          </span>
          <span className="min-w-0 truncate text-neutral-700 dark:text-zinc-400">
            {m.question}
          </span>
          {m.updatedAt && (
            <span className="shrink-0 tabular-nums text-[9px] text-neutral-400 dark:text-zinc-600">
              · {formatPolyAbsolute(m.updatedAt, locale)}
            </span>
          )}
        </a>
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
          className="font-mkt-mono flex shrink-0 items-center gap-2 text-[11px]"
        >
          <span
            className={
              item.perspective === "left"
                ? "text-sky-600 dark:text-sky-400"
                : item.perspective === "right"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-neutral-500 dark:text-zinc-500"
            }
          >
            [{item.source}]
          </span>
          <span className="max-w-[280px] truncate text-neutral-800 dark:text-zinc-300">
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
    <div className="border-b border-neutral-200 bg-white/95 dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="overflow-hidden border-b border-neutral-100 dark:border-zinc-800/80">
        <div className="flex items-center justify-between gap-2 py-1.5 text-[11px] font-medium">
          <div className="flex min-w-0 flex-1 overflow-hidden">
            {markets.length === 0 ? (
              <span className="font-mkt-mono text-neutral-400 dark:text-zinc-600">
                {marketsStatus}
              </span>
            ) : (
              <div className="flex w-max gap-6 animate-scroll-markets">
                <div className="flex shrink-0 gap-6">{marketsRow}</div>
                <div className="flex shrink-0 gap-6" aria-hidden>
                  {marketsRow}
                </div>
              </div>
            )}
          </div>
          {markets.length > 0 && (
            <span className="font-board flex shrink-0 items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-neutral-400 dark:text-zinc-600">
              <span
                className={`h-1.5 w-1.5 rounded-full bg-emerald-500 ${lastUpdated && Date.now() - lastUpdated.getTime() < 35000 ? "animate-pulse" : ""}`}
              />
              {marketsStatus}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-hidden border-b border-neutral-100 dark:border-zinc-800/80">
        <div className="flex py-1.5 text-[11px]">
          {news.length === 0 ? (
            <span className="font-mkt-mono text-neutral-400 dark:text-zinc-600">
              {!hasAttemptedLoad ? "Loading…" : "Headlines offline. Retrying…"}
            </span>
          ) : (
            <div className="flex w-max gap-6 animate-scroll-news">
              <div className="flex shrink-0 gap-6">{newsRow}</div>
              <div className="flex shrink-0 gap-6" aria-hidden>
                {newsRow}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden border-b border-neutral-100 dark:border-zinc-800/80">
        <div className="flex py-1.5 text-[11px]">
          {crypto.length === 0 ? (
            <span className="font-mkt-mono px-1 text-neutral-400 dark:text-zinc-600">
              {!hasAttemptedLoad
                ? "Loading…"
                : "Stables / crypto tape offline. Retrying…"}
            </span>
          ) : (
            <div className="flex w-max gap-6 animate-scroll-crypto">
              <div className="flex shrink-0 gap-6">{cryptoRow}</div>
              <div className="flex shrink-0 gap-6" aria-hidden>
                {cryptoRow}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="flex items-stretch gap-2 py-1.5 text-[11px]">
          {poly.length === 0 ? (
            <span className="font-mkt-mono px-1 text-neutral-400 dark:text-zinc-600">
              {!hasAttemptedLoad
                ? "Loading…"
                : "Polymarket ribbon offline. Retrying…"}
            </span>
          ) : (
            <>
              {polyFetchedAt && (
                <div className="font-mkt-mono flex shrink-0 flex-col justify-center border-r border-neutral-200 pr-2 text-[9px] leading-tight text-neutral-500 dark:border-zinc-800 dark:text-zinc-500">
                  <span>
                    {t("predictions.polyFeedAsOf", {
                      time: formatPolyAbsolute(polyFetchedAt, locale),
                    })}
                  </span>
                  <a
                    href={POLY_X_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 text-violet-600 hover:underline dark:text-violet-400"
                  >
                    {t("predictions.polyByX")}
                  </a>
                </div>
              )}
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex w-max gap-8 animate-scroll-news">
                  <div className="flex shrink-0 gap-8">{polyRow}</div>
                  <div className="flex shrink-0 gap-8" aria-hidden>
                    {polyRow}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
