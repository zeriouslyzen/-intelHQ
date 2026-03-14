## Real-Time Strategy: SSE, WebSockets, and Client Abstractions

This document specifies the concrete real-time endpoints, client abstraction layer, and throttling/reconnection behavior.

---

## Transport Overview

- **Server-Sent Events (SSE)**:
  - Used for **server → client** update streams:
    - Market prices and aggregates.
    - News/event ticker.
    - High-level world/map overlays (e.g., region performance).
- **WebSockets**:
  - Used where **bidirectional** communication is required:
    - Chat messages.
    - Future collaborative dashboard interactions.

Both transports are hidden behind a small client library so the UI code never depends on specific transport mechanics.

---

## SSE Endpoints

Base prefix: `/api/stream`.

### Market Prices Stream

- **Endpoint**: `GET /api/stream/markets`
- **Query parameters**:
  - `instrumentIds: string` – comma-separated list of `InstrumentId`s.
  - `timeframe?: Timeframe` – defaults to `intraday`.
  - `granularityMs?: number` – client hint for update frequency (server may override).
- **Event format**:
  - `event: price`
  - `data: PriceUpdateEvent`

```ts
export interface PriceUpdateEvent {
  instrumentId: InstrumentId;
  lastPrice: number;
  changePct: number;
  timestamp: string;
}
```

### News and Events Stream

- **Endpoint**: `GET /api/stream/events`
- **Query parameters**:
  - `regionId?: RegionId`
  - `instrumentId?: InstrumentId`
  - `kind?: EventKind`
- **Event format**:
  - `event: news_event`
  - `data: Event`

### Map Overlays Stream

- **Endpoint**: `GET /api/stream/map-overlays`
- **Query parameters**:
  - `overlay: "performance" | "volatility" | "volume" | "news_intensity" | "sentiment"`
- **Event format**:
  - `event: map_overlay`
  - `data: MapOverlayEvent`

```ts
export interface MapOverlayEvent {
  overlay: string;
  timestamp: string;
  // One value per region
  values: Array<{
    regionId: RegionId;
    value: number;
  }>;
}
```

---

## WebSocket Endpoints

Base prefix: `/api/ws`.

### Chat

- **Endpoint**: `GET /api/ws/chat`
- **Protocol**: WebSocket.
- **Handshake query parameters**:
  - `threadId: ThreadId` (required).
  - `userId` derived from authenticated session on the server side.
- **Messages**:
  - Text frames containing JSON.

```ts
export type ChatClientMessage =
  | {
      type: "send_message";
      threadId: ThreadId;
      body: string;
      // Optional associations
      instrumentIds?: InstrumentId[];
      regionIds?: RegionId[];
      eventIds?: EventId[];
    }
  | {
      type: "ping";
    };

export type ChatServerMessage =
  | {
      type: "message";
      payload: Message;
    }
  | {
      type: "system";
      payload: {
        text: string;
      };
    }
  | {
      type: "pong";
    };
```

---

## Client Abstraction Layer

To keep UI components decoupled from the specific transport, the client code exposes two small utilities under `src/lib/realtime`:

### SSE Client

```ts
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
  // Implementation will wrap EventSource and handle reconnection.
}
```

Usage example (in a client component):

```ts
useEffect(() => {
  const sub = subscribeToSse<PriceUpdateEvent>({
    url: "/api/stream/markets?instrumentIds=AAPL,MSFT",
    eventType: "price",
    onMessage: (update) => {
      // update local state or query cache
    },
  });
  return () => sub.close();
}, []);
```

### WebSocket Client

```ts
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
  // Implementation will wrap WebSocket and handle reconnection.
}
```

Usage example (chat):

```ts
useEffect(() => {
  const conn = connectWebSocket<ChatClientMessage, ChatServerMessage>({
    url: `/api/ws/chat?threadId=${threadId}`,
    onMessage: handleIncomingChat,
  });
  return () => conn.close();
}, [threadId]);
```

---

## Throttling and Aggregation

### Server-Side

- Price updates:
  - Aggregate raw ticks to **no more than 4–10 updates per second per instrument** for UI friendliness.
  - Allow per-client `granularityMs` hints but enforce minimum thresholds based on server policy.
- Map overlays:
  - Update every **1–5 seconds** depending on overlay type.
  - For low-priority overlays, batch multiple underlying changes into a single event.

### Client-Side

- Use requestAnimationFrame or simple time-based throttling in subscribers to limit state updates (e.g., no more than 10 UI updates/second per component).
- Deduplicate events where only non-visible properties changed.

---

## Resilience and Reconnection

- **SSE**:
  - Use browser `EventSource` support for automatic reconnection.
  - Implement `Last-Event-ID` handling on the server so that clients can catch up after a disconnect.
  - On repeated failures, back off reconnection attempts (e.g., 1s, 2s, 5s, 10s, capped).

- **WebSockets**:
  - Implement heartbeat `ping`/`pong` messages every N seconds.
  - If heartbeat fails, close and attempt reconnection with backoff.
  - On reconnection, client requests recent messages (via REST) to fill any gaps.

This strategy provides efficient, scalable real-time behavior while keeping the complexity out of individual UI components and allowing the transport layer to evolve independently.

