/**
 * Embeddable stream sources. YouTube:
 * - `live` (default): embed/live_stream?channel= — only works while the channel is **live**.
 * - `latest`: newest upload via /api/live/youtube-latest (RSS) — for mostly-VOD channels.
 * Rumble/custom: full embed URL in embedValue.
 */

export type LiveStreamSource = "youtube" | "rumble" | "custom";

export type YoutubeEmbedMode = "live" | "latest";

export interface LiveStreamChannel {
  id: string;
  name: string;
  source: LiveStreamSource;
  /** YouTube: channel ID (UC…). Rumble/custom: full embed URL. */
  embedValue: string;
  region?: string;
  /** YouTube only. Default "live". */
  youtubeMode?: YoutubeEmbedMode;
}

function youtubeLiveUrl(channelId: string, autoplay = true): string {
  const params = new URLSearchParams();
  if (autoplay) params.set("autoplay", "1");
  params.set("rel", "0");
  return `https://www.youtube.com/embed/live_stream?channel=${channelId}&${params.toString()}`;
}

export function youtubeVideoEmbedUrl(videoId: string, autoplay = true): string {
  const params = new URLSearchParams();
  if (autoplay) params.set("autoplay", "1");
  params.set("rel", "0");
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
}

/** Resolve channel to iframe src (with autoplay). Ignores youtubeMode "latest" — resolved client-side. */
export function getLiveStreamEmbedUrl(channel: LiveStreamChannel, autoplay = true): string {
  if (channel.source === "youtube") {
    if (channel.youtubeMode === "latest") {
      return "";
    }
    return youtubeLiveUrl(channel.embedValue, autoplay);
  }
  if (channel.source === "rumble" || channel.source === "custom") {
    const url = new URL(channel.embedValue);
    if (autoplay) url.searchParams.set("autoplay", "1");
    return url.toString();
  }
  return channel.embedValue;
}

/** Shown as quick-toggle buttons with “new upload” dots when RSS detects a change. */
export const FLIPPER_PINNED_CHANNEL_IDS = ["aljazeera", "thecrowhouse"] as const;

/**
 * All flipper sources. YouTube `latest` = newest upload embed; default `live` = 24/7 live embed.
 */
export const LIVE_STREAM_CHANNELS: LiveStreamChannel[] = [
  {
    id: "aljazeera",
    name: "Al Jazeera English",
    source: "youtube",
    embedValue: "UCNye-wNBqNL5ZzHSJj3l8Bg",
    region: "MENA",
  },
  {
    id: "thecrowhouse",
    name: "thecrowhouse",
    source: "youtube",
    embedValue: "UCegOTmclzjfKuQh0SHflqww",
    youtubeMode: "latest",
  },
  {
    id: "predictive-history",
    name: "Predictive History",
    source: "youtube",
    embedValue: "UC11aHtNnc5bEPLI4jf6mnYg",
    youtubeMode: "latest",
  },
  {
    id: "rathbone",
    name: "Rathbone",
    source: "youtube",
    embedValue: "UCT4LlKacuIJd0sB-9OtuFDA",
    youtubeMode: "latest",
  },
  {
    id: "adapt2030",
    name: "Adapt 2030",
    source: "youtube",
    embedValue: "UC-5dIHmtQzHIdNCs7-bEdCA",
    youtubeMode: "latest",
  },
  {
    id: "spaceweather",
    name: "SpaceWeatherNews (S0)",
    source: "youtube",
    embedValue: "UCTiL1q9YbrVam5nP2xzFTWQ",
    youtubeMode: "latest",
  },
];

export function getLiveStreamChannelById(id: string): LiveStreamChannel | undefined {
  return LIVE_STREAM_CHANNELS.find((c) => c.id === id);
}
