import { NextResponse } from "next/server";
import {
  fetchYoutubeChannelLatestFromRss,
  isLikelyYoutubeChannelId,
} from "@/lib/youtubeChannelRss";

const MAX_CHANNELS = 16;

type BatchItem = { channelId: string; videoId: string; title: string };

/**
 * Latest upload per channel (parallel RSS reads). Used by LiveStreamFlipper for
 * embeds + “new video” notifications without N sequential round-trips.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw =
    body &&
    typeof body === "object" &&
    "channelIds" in body &&
    Array.isArray((body as { channelIds: unknown }).channelIds)
      ? (body as { channelIds: string[] }).channelIds
      : [];

  const channelIds = [
    ...new Set(
      raw
        .filter((x): x is string => typeof x === "string")
        .map((s) => s.trim())
        .filter(isLikelyYoutubeChannelId)
    ),
  ].slice(0, MAX_CHANNELS);

  if (channelIds.length === 0) {
    return NextResponse.json({ error: "No valid channelIds" }, { status: 400 });
  }

  try {
    const settled = await Promise.all(
      channelIds.map(async (channelId): Promise<BatchItem | null> => {
        const r = await fetchYoutubeChannelLatestFromRss(channelId);
        return r ? { channelId, videoId: r.videoId, title: r.title } : null;
      })
    );

    const items = settled.filter((x): x is BatchItem => x != null);

    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Upstream failed" }, { status: 502 });
  }
}
