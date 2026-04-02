import { NextRequest, NextResponse } from "next/server";
import {
  fetchYoutubeChannelLatestFromRss,
  isLikelyYoutubeChannelId,
} from "@/lib/youtubeChannelRss";

/**
 * Latest upload for a channel (for embed when live_stream?channel= is offline).
 */
export async function GET(req: NextRequest) {
  const channelId = req.nextUrl.searchParams.get("channelId")?.trim() ?? "";

  if (!isLikelyYoutubeChannelId(channelId)) {
    return NextResponse.json({ error: "Invalid channelId" }, { status: 400 });
  }

  try {
    const result = await fetchYoutubeChannelLatestFromRss(channelId);
    if (!result) {
      return NextResponse.json({ error: "No video found" }, { status: 404 });
    }
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "Upstream failed" }, { status: 502 });
  }
}
