import { getFeedsConfig, setFeedsConfig } from "@/lib/configDb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getFeedsConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json(
      { enabledFeedIds: [], videoEmbedUrl: undefined },
      { status: 200 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { enabledFeedIds, videoEmbedUrl } = body as {
      enabledFeedIds?: string[];
      videoEmbedUrl?: string;
    };
    const current = await getFeedsConfig();
    const config = {
      enabledFeedIds: Array.isArray(enabledFeedIds) ? enabledFeedIds : current.enabledFeedIds,
      videoEmbedUrl: typeof videoEmbedUrl === "string" ? videoEmbedUrl : current.videoEmbedUrl,
    };
    await setFeedsConfig(config);
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}
