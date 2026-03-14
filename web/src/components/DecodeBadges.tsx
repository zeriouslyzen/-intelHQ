"use client";

import { detectLinguisticMarkers, type LinguisticMarker } from "@/lib/linguisticMarkers";

const TYPE_LABELS: Record<string, string> = {
  gatekeeper: "Gatekeeper",
  reciprocity: "Reciprocity",
  euphemism: "Euphemism",
  compartmentation: "Compartmentation",
};

const TYPE_STYLE: Record<string, string> = {
  gatekeeper: "bg-violet-100 text-violet-800 border-violet-200",
  reciprocity: "bg-amber-100 text-amber-800 border-amber-200",
  euphemism: "bg-sky-100 text-sky-800 border-sky-200",
  compartmentation: "bg-neutral-100 text-neutral-700 border-neutral-200",
};

export default function DecodeBadges({ text }: { text: string }) {
  const markers = detectLinguisticMarkers(text);
  if (markers.length === 0) return null;

  const byType = new Map<string, LinguisticMarker[]>();
  for (const m of markers) {
    const list = byType.get(m.type) ?? [];
    list.push(m);
    byType.set(m.type, list);
  }

  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {Array.from(byType.entries()).map(([type, list]) => (
        <span
          key={type}
          className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-medium ${TYPE_STYLE[type] ?? ""}`}
          title={list.map((m) => m.phrase).join(", ")}
        >
          {TYPE_LABELS[type] ?? type}: &quot;{list[0]!.phrase}&quot;
          {list.length > 1 ? ` +${list.length - 1}` : ""}
        </span>
      ))}
    </div>
  );
}
