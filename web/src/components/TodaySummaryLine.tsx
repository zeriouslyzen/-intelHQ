"use client";

import { useLocale } from "@/contexts/LocaleContext";
import {
  getRegionName,
  getThemeKeywordsFromConflict,
  getTopRegionFromConflict,
} from "@/lib/todaySummary";
import type { ConflictItem } from "@/lib/conflict";

interface TodaySummaryLineProps {
  conflict: ConflictItem[];
  riskLabel: "risk-on" | "risk-off" | "mixed" | null;
}

export default function TodaySummaryLine({
  conflict,
  riskLabel,
}: TodaySummaryLineProps) {
  const { t } = useLocale();
  const count = conflict.length;
  const topRegionCode = getTopRegionFromConflict(conflict);
  const topRegionName = topRegionCode ? getRegionName(topRegionCode) : null;
  const themes = getThemeKeywordsFromConflict(conflict);

  const parts: string[] = [];
  if (count > 0) {
    parts.push(t("today.conflictUpdates", { n: count }));
    if (topRegionName) parts.push(t("today.mostActivityIn", { region: topRegionName }));
  }
  if (riskLabel) {
    parts.push(
      riskLabel === "risk-on"
        ? t("today.riskOn")
        : riskLabel === "risk-off"
          ? t("today.riskOff")
          : t("today.mixed")
    );
  }
  if (themes.length > 0) {
    parts.push(t("today.themes", { keywords: themes.slice(0, 5).join(", ") }));
  }

  const sentence =
    parts.length > 0
      ? `${t("today.summaryPrefix")} ${parts.join("; ")}.`
      : `${t("today.summaryPrefix")} ${t("today.noUpdatesYet")}`;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="font-mkt-mono text-xs text-neutral-700 dark:text-zinc-400">{sentence}</p>
    </div>
  );
}
