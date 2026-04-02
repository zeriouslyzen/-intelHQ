"use client";

const PING_INTERVAL_MS = 30000;
const BACKOFF_MS = [1000, 2000, 5000, 10000];
const MAX_BACKOFF = 10000;

export interface WsConnection<TIn, TOut> {
  send: (message: TIn) => void;
  close: () => void;
}

export function connectWebSocket<TIn, TOut>({
  url,
  onMessage,
  onError,
}: {
  url: string;
  onMessage: (data: TOut) => void;
  onError?: (error: unknown) => void;
}): WsConnection<TIn, TOut> {
  let closed = false;
  let ws: WebSocket | null = null;
  let pingId: ReturnType<typeof setInterval> | null = null;
  let attempt = 0;
  let backoffTimeout: ReturnType<typeof setTimeout> | null = null;

  function connect() {
    if (closed) return;
    const fullUrl = url.startsWith("ws") ? url : `${typeof window !== "undefined" && window.location.origin?.startsWith("https") ? "wss" : "ws"}://${typeof window !== "undefined" ? window.location.host : ""}${url.startsWith("/") ? url : `/${url}`}`;
    ws = new WebSocket(fullUrl);
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as TOut & { type?: string };
        if (msg && typeof msg === "object" && (msg as { type?: string }).type === "pong") return;
        onMessage(msg as TOut);
      } catch (err) {
        onError?.(err);
      }
    };
    ws.onerror = (e) => onError?.(e);
    ws.onclose = () => {
      ws = null;
      if (pingId) clearInterval(pingId);
      pingId = null;
      if (closed) return;
      const delay = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)] ?? MAX_BACKOFF;
      attempt += 1;
      backoffTimeout = setTimeout(connect, delay);
    };
    ws.onopen = () => {
      attempt = 0;
      pingId = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, PING_INTERVAL_MS);
    };
  }

  connect();

  return {
    send(message: TIn) {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    },
    close() {
      closed = true;
      if (backoffTimeout) clearTimeout(backoffTimeout);
      if (pingId) clearInterval(pingId);
      ws?.close();
      ws = null;
    },
  };
}
