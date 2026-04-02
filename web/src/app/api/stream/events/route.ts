import { fetchGlobalNews } from "@/lib/news";
import type { NewsEventPayload } from "@/lib/realtime/types";

export const dynamic = "force-dynamic";

const THROTTLE_MS = 2000;

export async function GET(request: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: NewsEventPayload) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      let last = Date.now();
      const tick = async () => {
        try {
          const news = await fetchGlobalNews();
          const toSend = news.slice(0, 5).map((n) => ({
            id: `${n.title}-${n.publishedAt}`,
            kind: "news",
            title: n.title,
            source: n.source,
            time: n.publishedAt,
            regionId: n.regionCodes?.[0],
          })) as NewsEventPayload[];
          for (const e of toSend) {
            send("news_event", e);
          }
        } catch {
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
