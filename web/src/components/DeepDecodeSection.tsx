"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import type { DeepDecodeResult } from "@/lib/decodeDeep";

interface DeepDecodeSectionProps {
  result: DeepDecodeResult;
  className?: string;
}

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-600 hover:text-neutral-900"
      >
        {title}
        <span className="text-neutral-400">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="pb-2 pl-0 text-xs text-neutral-700">{children}</div>}
    </div>
  );
}

export default function DeepDecodeSection({ result, className = "" }: DeepDecodeSectionProps) {
  const { t } = useLocale();
  const hasAny =
    result.manipulation.length > 0 ||
    result.numbers.length > 0 ||
    result.timing.length > 0 ||
    result.symbols.length > 0 ||
    result.societies.length > 0;

  return (
    <div className={`mt-3 rounded-lg border border-neutral-200 bg-neutral-50/80 p-2 ${className}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
        {t("decode.deepDecodeTitle")}
      </div>
      <div className="space-y-0">
        {result.manipulation.length > 0 && (
          <Section title={t("decode.manipulationTitle")} defaultOpen>
            <ul className="list-inside list-disc space-y-0.5">
              {result.manipulation.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </Section>
        )}
        {result.numbers.length > 0 && (
          <Section title={t("decode.numbersTitle")}>
            <ul className="space-y-1">
              {result.numbers.map((n, i) => (
                <li key={i}>
                  <span className="font-mono font-medium">{n.number}</span>
                  <span className="ml-1 text-neutral-600">— {n.significance}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
        {result.timing.length > 0 && (
          <Section title={t("decode.timingTitle")}>
            <ul className="space-y-1">
              {result.timing.map((tim, i) => (
                <li key={i}>
                  <span className="font-medium">{tim.date}</span>
                  <span className="ml-1 text-neutral-600">— {tim.significance}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
        {result.symbols.length > 0 && (
          <Section title={t("decode.symbolsTitle")}>
            <ul className="space-y-1.5">
              {result.symbols.map((s, i) => (
                <li key={i}>
                  <span className="font-medium">{s.name.replace(/_/g, " ")}</span>
                  <span className="ml-1 text-neutral-600">({s.description})</span>
                  <div className="mt-0.5 text-neutral-600">{s.meaning}</div>
                </li>
              ))}
            </ul>
          </Section>
        )}
        {result.societies.length > 0 && (
          <Section title={t("decode.societiesTitle")}>
            <ul className="space-y-1">
              {result.societies.map((s, i) => (
                <li key={i}>
                  <span className="font-medium">{s.name}</span>
                  <span className="ml-1 text-neutral-600">
                    — {s.influenceAreas.join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}
        {!hasAny && (
          <p className="py-2 text-[11px] text-neutral-500">
            {t("decode.noPatterns")}
          </p>
        )}
      </div>
    </div>
  );
}
