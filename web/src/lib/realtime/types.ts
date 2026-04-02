/**
 * Shared event payload types for SSE streams (see docs/architecture/realtime-strategy.md).
 */

export interface PriceUpdateEvent {
  instrumentId: string;
  lastPrice: number;
  changePct: number;
  timestamp: string;
}

export interface MapOverlayEvent {
  overlay: string;
  timestamp: string;
  values: Array<{ regionId: string; value: number }>;
}

export type EventKind = string;
export interface NewsEventPayload {
  id: string;
  kind: EventKind;
  title: string;
  source: string;
  time: string;
  regionId?: string;
  instrumentId?: string;
}

/** Chat WebSocket protocol (see docs/architecture/realtime-strategy.md). */
export type ChatClientMessage =
  | { type: "send_message"; threadId: string; body: string; instrumentIds?: string[]; regionIds?: string[]; eventIds?: string[] }
  | { type: "ping" };

export interface ChatMessagePayload {
  id: string;
  author: string;
  content: string;
  at: number;
}

export type ChatServerMessage =
  | { type: "message"; payload: ChatMessagePayload }
  | { type: "system"; payload: { text: string } }
  | { type: "pong" };
