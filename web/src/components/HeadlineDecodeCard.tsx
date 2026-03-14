"use client";

import { useState, useMemo } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import DecodeBadges from "@/components/DecodeBadges";
import DeepDecodeSection from "@/components/DeepDecodeSection";
import { deepDecode } from "@/lib/decodeDeep";
import { getEli5, getWhyItMatters } from "@/lib/eli5Lookup";

interface HeadlineDecodeCardProps {
  title: string;
  source?: string;
  link?: string;
  publishedAt?: string | null;
}

export default function HeadlineDecodeCard({
  title,
  source = "",
  link,
  publishedAt,
}: HeadlineDecodeCardProps) {
  const { t } = useLocale();
  const [showWhy, setShowWhy] = useState(false);
  const [showEli5, setShowEli5] = useState(false);
  const [showDeep, setShowDeep] = useState(false);

  const whyLine = getWhyItMatters(title);
  const eli5Line = getEli5(title);
  const deepResult = useMemo(() => deepDecode(title, publishedAt), [title, publishedAt]);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="font-medium text-neutral-900">{title}</div>
      {source && (
        <div className="mt-0.5 text-[11px] text-neutral-500">{source}</div>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {whyLine && (
          <button
            type="button"
            onClick={() => setShowWhy((v) => !v)}
            className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-100"
          >
            {t("decode.whyItMatters")}
          </button>
        )}
        {eli5Line && (
          <button
            type="button"
            onClick={() => setShowEli5((v) => !v)}
            className="rounded border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-medium text-sky-800 hover:bg-sky-100"
          >
            {t("decode.eli5")}
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowDeep((v) => !v)}
          className="rounded border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-800 hover:bg-violet-100"
        >
          {t("decode.deeperDecode")}
        </button>
      </div>
      {showWhy && whyLine && (
        <p className="mt-2 border-l-2 border-amber-300 pl-2 text-xs text-neutral-700">
          {whyLine}
        </p>
      )}
      {showEli5 && eli5Line && (
        <p className="mt-2 border-l-2 border-sky-300 pl-2 text-xs text-neutral-700">
          {eli5Line}
        </p>
      )}
      <DecodeBadges text={title} />
      {showDeep && <DeepDecodeSection result={deepResult} />}
      {link && link !== "#" && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-[11px] text-amber-700 hover:underline"
        >
          {t("decode.readArticle")}
        </a>
      )}
    </div>
  );
}
