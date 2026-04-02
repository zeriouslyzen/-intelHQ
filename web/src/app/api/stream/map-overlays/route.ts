import type { MapOverlayEvent } from "@/lib/realtime/types";

export const dynamic = "force-dynamic";

const THROTTLE_MS = 3000;
const REGION_IDS = ["CHN", "RUS", "MENA", "EUR", "ASA", "LAT", "AFR"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const overlay = searchParams.get("overlay") ?? "performance";
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: MapOverlayEvent) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      let last = Date.now();
      const tick = () => {
        const now = new Date().toISOString();
        send("map_overlay", {
          overlay,
          timestamp: now,
          values: REGION_IDS.map((regionId) => ({
            regionId,
            value: Math.random() * 100,
          })),
        });
        const elapsed = Date.now() - last;
        const wait = Math.max(0, THROTTLE_MS - elapsed);
        last = Date.now() + wait;
        timeoutId = setTimeout(tick, wait);
      };
      let timeoutId = setTimeout(tick, 0);
      request.signal?.addEventListener?.("abort", () => {
        clearTimeout(timeoutId);
        controller.close();
      });
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
    },
  });
}
