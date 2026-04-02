"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useLivePolling } from "@/contexts/LivePollingContext";
import {
  LIVE_STREAM_CHANNELS,
  FLIPPER_PINNED_CHANNEL_IDS,
  getLiveStreamEmbedUrl,
  youtubeVideoEmbedUrl,
  type LiveStreamChannel,
} from "@/lib/liveStreams";

const LATEST_POLL_MS = 180_000;

type Snapshot = { videoId: string; title: string };

interface LiveStreamFlipperProps {
  className?: string;
  defaultChannelId?: string;
}

const YOUTUBE_CHANNELS = LIVE_STREAM_CHANNELS.filter((c) => c.source === "youtube");

export default function LiveStreamFlipper({
  className = "",
  defaultChannelId,
}: LiveStreamFlipperProps) {
  const { shouldPoll, reportFeedSuccess } = useLivePolling();
  const defaultChannel =
    (defaultChannelId && LIVE_STREAM_CHANNELS.find((c) => c.id === defaultChannelId)) ||
    LIVE_STREAM_CHANNELS[0];
  const [current, setCurrent] = useState<LiveStreamChannel>(defaultChannel);
  const [key, setKey] = useState(0);
  const [snapshots, setSnapshots] = useState<Record<string, Snapshot>>({});
  const [batchLoading, setBatchLoading] = useState(true);
  const [batchHadError, setBatchHadError] = useState(false);
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(() => new Set());

  const currentIdRef = useRef(current.id);
  currentIdRef.current = current.id;

  const prevVideoByChannelRef = useRef<Record<string, string>>({});
  const baselineReadyRef = useRef(false);

  const pinnedChannels = useMemo(
    () =>
      FLIPPER_PINNED_CHANNEL_IDS.map((id) => LIVE_STREAM_CHANNELS.find((c) => c.id === id)).filter(
        (c): c is LiveStreamChannel => c != null
      ),
    []
  );

  const isLatestMode =
    current.source === "youtube" && current.youtubeMode === "latest";

  const runBatch = useCallback(async () => {
    const channelIds = YOUTUBE_CHANNELS.map((c) => c.embedValue);
    try {
      const res = await fetch("/api/live/youtube-latest/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelIds }),
        cache: "no-store",
      });
      if (!res.ok) {
        setBatchHadError(true);
        return;
      }
      setBatchHadError(false);
      const data = (await res.json()) as {
        items: { channelId: string; videoId: string; title: string }[];
      };
      const items = data.items ?? [];
      if (items.length > 0) reportFeedSuccess();

      const byChannel = new Map(items.map((i) => [i.channelId, i]));

      setSnapshots((prev) => {
        const next = { ...prev };
        for (const it of items) {
          next[it.channelId] = { videoId: it.videoId, title: it.title };
        }
        return next;
      });

      const watching = currentIdRef.current;
      for (const it of items) {
        const ch = YOUTUBE_CHANNELS.find((c) => c.embedValue === it.channelId);
        if (!ch) continue;
        const prevVid = prevVideoByChannelRef.current[it.channelId];
        if (
          baselineReadyRef.current &&
          prevVid &&
          prevVid !== it.videoId &&
          ch.id !== watching
        ) {
          setNotifiedIds((s) => new Set(s).add(ch.id));
        }
        prevVideoByChannelRef.current[it.channelId] = it.videoId;
      }

      if (!baselineReadyRef.current && byChannel.size > 0) {
        baselineReadyRef.current = true;
      }
    } catch {
      setBatchHadError(true);
    } finally {
      setBatchLoading(false);
    }
  }, [reportFeedSuccess]);

  useEffect(() => {
    void runBatch();
    if (!shouldPoll) return;
    const id = setInterval(() => void runBatch(), LATEST_POLL_MS);
    return () => clearInterval(id);
  }, [runBatch, shouldPoll]);

  const selectChannel = useCallback((ch: LiveStreamChannel) => {
    setCurrent(ch);
    setKey((k) => k + 1);
    setNotifiedIds((s) => {
      if (!s.has(ch.id)) return s;
      const n = new Set(s);
      n.delete(ch.id);
      return n;
    });
  }, []);

  const snap = current.source === "youtube" ? snapshots[current.embedValue] : undefined;

  const embedUrl = isLatestMode
    ? snap?.videoId
      ? youtubeVideoEmbedUrl(snap.videoId, true)
      : ""
    : getLiveStreamEmbedUrl(current, true);

  const popOutHref =
    isLatestMode && snap?.videoId
      ? `https://www.youtube.com/watch?v=${snap.videoId}`
      : embedUrl ||
        `https://www.youtube.com/channel/${encodeURIComponent(current.embedValue)}`;

  const iframeKey = `${key}-${isLatestMode ? snap?.videoId ?? "pending" : "live"}`;

  const selectArrowStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat" as const,
    backgroundPosition: "right 0.5rem center",
    backgroundSize: "1rem",
  };

  return (
    <div
      className={`min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 ${className}`}
    >
      <div className="flex flex-col gap-2 border-b border-neutral-700 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-board shrink-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
          Live · flip channel
        </span>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          {pinnedChannels.map((ch) => {
            const hasNew = notifiedIds.has(ch.id);
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => selectChannel(ch)}
                className={`relative shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  current.id === ch.id
                    ? "bg-amber-500/90 text-neutral-900"
                    : "bg-neutral-700/80 text-neutral-300 hover:bg-neutral-600 hover:text-white"
                }`}
                aria-label={hasNew ? `${ch.name}, new upload` : ch.name}
              >
                {ch.name}
                {hasNew ? (
                  <span
                    className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]"
                    title="New upload since last check"
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
          <select
            aria-label="All channels"
            value={current.id}
            onChange={(e) => {
              const ch = LIVE_STREAM_CHANNELS.find((c) => c.id === e.target.value);
              if (ch) selectChannel(ch);
            }}
            className="min-w-0 max-w-full flex-1 appearance-none rounded-lg border border-neutral-600 bg-neutral-800 py-1.5 pl-3 pr-8 text-[11px] font-medium text-neutral-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 sm:max-w-[min(100%,14rem)] sm:flex-initial"
            style={selectArrowStyle}
          >
            {LIVE_STREAM_CHANNELS.map((ch) => {
              const mark = notifiedIds.has(ch.id) ? "● " : "";
              return (
                <option key={ch.id} value={ch.id}>
                  {mark}
                  {ch.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="relative aspect-video w-full bg-black">
        {isLatestMode && batchLoading && !snap?.videoId ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-sm text-neutral-500">
            <span>Loading latest uploads…</span>
          </div>
        ) : null}
        {isLatestMode && !batchLoading && !snap?.videoId ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-sm text-neutral-500">
            <span>
              {batchHadError
                ? "Could not load video metadata. Retry or open on YouTube."
                : "No video id for this channel yet."}
            </span>
            <a
              href={`https://www.youtube.com/channel/${encodeURIComponent(current.embedValue)}/videos`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300"
            >
              Open channel on YouTube
            </a>
          </div>
        ) : null}
        {(!isLatestMode || snap?.videoId) && embedUrl ? (
          <iframe
            key={iframeKey}
            src={embedUrl}
            title={
              snap?.title
                ? `${current.name}: ${snap.title}`
                : `Live: ${current.name}`
            }
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : null}
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <span className="rounded bg-black/70 px-2 py-1 text-[10px] font-medium text-neutral-300">
            {current.name}
            {isLatestMode ? " · latest upload" : ""}
          </span>
          <a
            href={popOutHref}
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
