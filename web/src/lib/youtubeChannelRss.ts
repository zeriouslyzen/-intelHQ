/**
 * Latest upload for a channel via YouTube's public Atom feed (no API key).
 * https://www.youtube.com/feeds/videos.xml?channel_id=UC...
 */

const RSS_URL = (channelId: string) =>
  `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;

/** YouTube channel IDs are UC + 22 chars (24 total). */
export function isLikelyYoutubeChannelId(id: string): boolean {
  return /^UC[A-Za-z0-9_-]{22}$/.test(id);
}

export async function fetchYoutubeChannelLatestFromRss(
  channelId: string
): Promise<{ videoId: string; title: string } | null> {
  if (!isLikelyYoutubeChannelId(channelId)) return null;

  const res = await fetch(RSS_URL(channelId), {
    headers: {
      "User-Agent": "IntelHQ/1.0 (channel RSS; editorial dashboard)",
      Accept: "application/atom+xml, application/xml, text/xml, */*",
    },
    next: { revalidate: 120 },
  });

  if (!res.ok) return null;
  const text = await res.text();

  const entry = text.match(/<entry>([\s\S]*?)<\/entry>/);
  if (!entry?.[1]) return null;

  const block = entry[1];
  const videoId = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
  if (!videoId) return null;

  const title = block.match(/<title(?:[^>]*)>([^<]*)<\/title>/)?.[1]?.trim() ?? "";

  return { videoId, title };
}
