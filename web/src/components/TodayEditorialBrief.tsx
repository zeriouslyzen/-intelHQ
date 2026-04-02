"use client";

import { useLocale } from "@/contexts/LocaleContext";
import type { Quote } from "@/lib/markets";
import type { NewsItem } from "@/lib/news";
import type { ConflictItem } from "@/lib/conflict";
import {
  getRegionName,
  getThemeKeywordsFromConflict,
  getThemeKeywordsFromTitles,
  getTopRegionFromConflict,
} from "@/lib/todaySummary";

interface TodayEditorialBriefProps {
  conflict: ConflictItem[];
  news: NewsItem[];
  riskLabel: "risk-on" | "risk-off" | "mixed" | null;
  mainIndex: Quote | null;
}

export default function TodayEditorialBrief({
  conflict,
  news,
  riskLabel,
  mainIndex,
}: TodayEditorialBriefProps) {
  const { t } = useLocale();

  const topRegion = getTopRegionFromConflict(conflict);
  const topRegionName = topRegion ? getRegionName(topRegion) : null;
  const themes =
    conflict.length > 0
      ? getThemeKeywordsFromConflict(conflict, 6)
      : getThemeKeywordsFromTitles(
          news.slice(0, 12).map((n) => n.title),
          6
        );
  const themePhrase = themes.slice(0, 5).join(", ");

  const headline =
    conflict.length > 0 && topRegionName
      ? t("today.editorialHeadlineRegion", { region: topRegionName })
      : conflict.length > 0
        ? t("today.editorialHeadlineSpread")
        : news.length > 0
          ? t("today.editorialHeadlineNews")
          : t("today.editorialHeadlineQuiet");

  let lede: string;
  if (conflict.length > 0 && topRegionName && themePhrase.length > 0) {
    lede = t("today.editorialLedeConflict", {
      count: conflict.length,
      region: topRegionName,
      themes: themePhrase,
    });
  } else if (conflict.length > 0 && topRegionName) {
    lede = t("today.editorialLedeConflictNoThemes", {
      count: conflict.length,
      region: topRegionName,
    });
  } else if (conflict.length > 0) {
    lede = t("today.editorialLedeConflictNoRegion", {
      count: conflict.length,
    });
  } else if (news.length > 0) {
    lede = t("today.editorialLedeNewsOnly", { count: news.length });
  } else {
    lede = t("today.editorialEmpty");
  }

  const indexName = mainIndex?.name?.trim() || "the benchmark index";

  const marketLine =
    riskLabel === "risk-on"
      ? t("today.editorialMarketRiskOn", { index: indexName })
      : riskLabel === "risk-off"
        ? t("today.editorialMarketRiskOff", { index: indexName })
        : riskLabel === "mixed"
          ? t("today.editorialMarketMixed", { index: indexName })
          : t("today.editorialMarketUnknown");

  return (
    <article
      className={
        "font-editorial relative -mx-3 w-[calc(100%+1.5rem)] max-w-none overflow-hidden border-y border-stone-200/90 bg-gradient-to-b from-stone-50/95 to-white px-3 py-2 sm:-mx-4 sm:w-[calc(100%+2rem)] sm:px-4 sm:py-2.5 " +
        "dark:border-zinc-800/90 dark:from-zinc-950/98 dark:to-zinc-950/90"
      }
    >
      <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-stone-200/60 pb-1.5 dark:border-zinc-800/70">
        <span className="font-board text-[7px] font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-zinc-500">
          {t("today.editorialEyebrow")}
        </span>
        {themePhrase.length > 0 ? (
          <span className="text-[11px] italic leading-none text-stone-500 dark:text-zinc-500">
            {t("today.editorialThemesChip", { keywords: themePhrase })}
          </span>
        ) : null}
      </div>

      <h2 className="text-[1.05rem] font-semibold leading-[1.3] tracking-tight text-stone-900 sm:text-lg dark:text-zinc-100">
        {headline}
      </h2>

      <p className="mt-1.5 text-[13px] font-normal leading-[1.5] text-stone-700 dark:text-zinc-400">
        {lede}
      </p>

      <p
        className={
          "mt-1 border-l pl-2.5 text-[12px] font-normal leading-[1.5] text-stone-600 dark:text-zinc-500 " +
          (riskLabel
            ? "border-sky-400/45 dark:border-cyan-500/35"
            : "border-stone-300/80 dark:border-zinc-600/70")
        }
      >
        {marketLine}
      </p>
    </article>
  );
}
