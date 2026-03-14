/**
 * Free live news stream sources (embeddable). YouTube uses the channel's
 * current live stream; when not live, shows latest. Rumble/custom use direct embed URLs.
 */

export type LiveStreamSource = "youtube" | "rumble" | "custom";

export interface LiveStreamChannel {
  id: string;
  name: string;
  source: LiveStreamSource;
  /** YouTube: channel ID for embed/live_stream?channel=ID. Rumble/custom: full embed URL. */
  embedValue: string;
  region?: string;
}

function youtubeLiveUrl(channelId: string, autoplay = true): string {
  const params = new URLSearchParams();
  if (autoplay) params.set("autoplay", "1");
  params.set("rel", "0");
  return `https://www.youtube.com/embed/live_stream?channel=${channelId}&${params.toString()}`;
}

/** Resolve channel to iframe src (with autoplay). */
export function getLiveStreamEmbedUrl(channel: LiveStreamChannel, autoplay = true): string {
  if (channel.source === "youtube") {
    return youtubeLiveUrl(channel.embedValue, autoplay);
  }
  if (channel.source === "rumble" || channel.source === "custom") {
    const url = new URL(channel.embedValue);
    if (autoplay) url.searchParams.set("autoplay", "1");
    return url.toString();
  }
  return channel.embedValue;
}

/**
 * Curated free live news channels (YouTube = stable embeds, autoplay, works well).
 * Add Rumble or other embed URLs as custom entries when you have a stable stream link.
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
    id: "bbc-news",
    name: "BBC News",
    source: "youtube",
    embedValue: "UC16niRr50-MSBwiO3YDb3RA",
    region: "EU",
  },
  {
    id: "sky-news",
    name: "Sky News",
    source: "youtube",
    embedValue: "UCoMdktPbSTixAyNGwbXYYkQ",
    region: "EU",
  },
  {
    id: "dw",
    name: "DW News",
    source: "youtube",
    embedValue: "UCknLrEdhRCp1aegoMqRaCZg",
    region: "EU",
  },
  {
    id: "cgtn",
    name: "CGTN",
    source: "youtube",
    embedValue: "UCgr2zUI5MCMypujLixO7O9g",
    region: "CHN",
  },
  {
    id: "rt",
    name: "RT",
    source: "youtube",
    embedValue: "UC7tc7cCl0yP5R1n7Z2Gjywg",
    region: "RUS",
  },
  {
    id: "france24",
    name: "France 24",
    source: "youtube",
    embedValue: "UCCCPCZNChQdGa9Ek5ieNlzA",
    region: "EU",
  },
  {
    id: "wion",
    name: "WION",
    source: "youtube",
    embedValue: "UC_gUM8rL-Lrg6O3adPW9K1g",
    region: "APAC",
  },
];

export function getLiveStreamChannelById(id: string): LiveStreamChannel | undefined {
  return LIVE_STREAM_CHANNELS.find((c) => c.id === id);
}
