"use client";

const BACKOFF_MS = [1000, 2000, 5000, 10000];
const MAX_BACKOFF = 10000;

export interface SseSubscription<T> {
  close: () => void;
}

export function subscribeToSse<T>({
  url,
  eventType,
  onMessage,
  onError,
}: {
  url: string;
  eventType: string;
  onMessage: (data: T) => void;
  onError?: (error: unknown) => void;
}): SseSubscription<T> {
  let closed = false;
  let attempt = 0;
  let eventSource: EventSource | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function connect() {
    if (closed) return;
    const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "");
    eventSource = new EventSource(u.toString());
    eventSource.addEventListener(eventType, (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data || "{}") as T;
        onMessage(data);
      } catch (err) {
        onError?.(err);
      }
    });
    eventSource.onerror = () => {
      eventSource?.close();
      eventSource = null;
      if (closed) return;
      const delay = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)] ?? MAX_BACKOFF;
      attempt += 1;
      timeoutId = setTimeout(connect, delay);
    };
  }

  connect();

  return {
    close() {
      closed = true;
      if (timeoutId) clearTimeout(timeoutId);
      eventSource?.close();
      eventSource = null;
    },
  };
}
