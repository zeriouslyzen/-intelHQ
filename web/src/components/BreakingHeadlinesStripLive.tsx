"use client";

import { useEffect, useState } from "react";
import BreakingHeadlinesStrip, {
  type HeadlineItem,
} from "@/components/BreakingHeadlinesStrip";

const POLL_MS = 60_000;

function toHeadlineItems(data: Array<{ id: string; title: string; link: string; source: string }>): HeadlineItem[] {
  return data.slice(0, 20).map((c) => ({
    id: c.id,
    title: c.title,
    link: c.link,
    source: c.source,
  }));
}

interface BreakingHeadlinesStripLiveProps {
  initialItems: HeadlineItem[];
  className?: string;
}

export default function BreakingHeadlinesStripLive({
  initialItems,
  className = "",
}: BreakingHeadlinesStripLiveProps) {
  const [items, setItems] = useState<HeadlineItem[]>(initialItems);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch("/api/live/conflict", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setItems(toHeadlineItems(data));
      } catch {
        // keep current items on error
      }
    };
    fetchLatest();
    const t = setInterval(fetchLatest, POLL_MS);
    return () => clearInterval(t);
  }, []);

  return <BreakingHeadlinesStrip items={items} className={className} />;
}
