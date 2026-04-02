"use client";

import { useState, useCallback } from "react";
import {
  LIVE_STREAM_CHANNELS,
  getLiveStreamEmbedUrl,
  type LiveStreamChannel,
} from "@/lib/liveStreams";

interface LiveStreamFlipperProps {
  className?: string;
  /** Override default channel id to show first. */
  defaultChannelId?: string;
}

export default function LiveStreamFlipper({
  className = "",
  defaultChannelId,
}: LiveStreamFlipperProps) {
  const defaultChannel =
    (defaultChannelId && LIVE_STREAM_CHANNELS.find((c) => c.id === defaultChannelId)) ||
    LIVE_STREAM_CHANNELS[0];
  const [current, setCurrent] = useState<LiveStreamChannel>(defaultChannel);
  const [key, setKey] = useState(0);

  const selectChannel = useCallback((ch: LiveStreamChannel) => {
    setCurrent(ch);
    setKey((k) => k + 1);
  }, []);

  const embedUrl = getLiveStreamEmbedUrl(current, true);

  return (
    <div
      className={`min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 ${className}`}
    >
      <div className="flex flex-col border-b border-neutral-700 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center justify-between gap-2 border-b border-neutral-700 px-3 py-2 sm:border-b-0 sm:border-b-transparent">
          <span className="font-board truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Live · flip channel
          </span>
          {/* Mobile: dropdown */}
          <select
            aria-label="Select live channel"
            value={current.id}
            onChange={(e) => {
              const ch = LIVE_STREAM_CHANNELS.find((c) => c.id === e.target.value);
              if (ch) selectChannel(ch);
            }}
            className="sm:hidden w-full max-w-[180px] appearance-none rounded-lg border border-neutral-600 bg-neutral-800 py-1.5 pl-3 pr-8 text-[11px] font-medium text-neutral-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.5rem center",
              backgroundSize: "1rem",
            }}
          >
            {LIVE_STREAM_CHANNELS.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name}
              </option>
            ))}
          </select>
        </div>
        {/* Desktop: pill row */}
        <div className="hidden flex-wrap gap-1 overflow-x-auto p-2 sm:flex sm:max-w-none sm:flex-1 sm:justify-end sm:p-2 sm:pr-3">
          {LIVE_STREAM_CHANNELS.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => selectChannel(ch)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                current.id === ch.id
                  ? "bg-amber-500/90 text-neutral-900"
                  : "bg-neutral-700/80 text-neutral-300 hover:bg-neutral-600 hover:text-white"
              }`}
            >
              {ch.name}
            </button>
          ))}
        </div>
      </div>
      <div className="relative aspect-video w-full bg-black">
        <iframe
          key={key}
          src={embedUrl}
          title={`Live: ${current.name}`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <span className="rounded bg-black/70 px-2 py-1 text-[10px] font-medium text-neutral-300">
            {current.name}
          </span>
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-black/70 px-2 py-1 text-[10px] font-medium text-amber-400 hover:bg-black/80 hover:text-amber-300"
            title="Open in new window to watch while using the app"
          >
            Pop out
          </a>
        </div>
      </div>
    </div>
  );
}
