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
  const count = conflict.length;
  const topRegionCode = getTopRegionFromConflict(conflict);
  const topRegionName = topRegionCode ? getRegionName(topRegionCode) : null;
  const themes = getThemeKeywordsFromConflict(conflict);

  const parts: string[] = [];
  if (count > 0) {
    parts.push(`${count} conflict update${count !== 1 ? "s" : ""}`);
    if (topRegionName) parts.push(`most activity in ${topRegionName}`);
  }
  if (riskLabel) {
    parts.push(riskLabel === "risk-on" ? "risk-on" : riskLabel === "risk-off" ? "risk-off" : "mixed");
  }
  if (themes.length > 0) {
    parts.push(`Themes: ${themes.slice(0, 5).join(", ")}`);
  }

  const sentence =
    parts.length > 0
      ? `Today: ${parts.join("; ")}.`
      : "Today: No conflict updates yet. Markets and feeds updating live.";

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-xs text-neutral-700">{sentence}</p>
    </div>
  );
}
