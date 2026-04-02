import { fetchIndexQuotes } from "@/lib/markets";
import type { PriceUpdateEvent } from "@/lib/realtime/types";

export const dynamic = "force-dynamic";

const THROTTLE_MS = 250;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instrumentIds = searchParams.get("instrumentIds")?.split(",").filter(Boolean) ?? [];
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: PriceUpdateEvent) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      let last = Date.now();
      const tick = async () => {
        try {
          const quotes = await fetchIndexQuotes();
          const now = new Date().toISOString();
          const toSend = instrumentIds.length > 0
            ? quotes.filter((q) => instrumentIds.includes(q.symbol))
            : quotes.slice(0, 10);
          for (const q of toSend) {
            send("price", {
              instrumentId: q.symbol,
              lastPrice: q.price,
              changePct: q.changePercent,
              timestamp: now,
            });
          }
        } catch (e) {
          // ignore
        }
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
