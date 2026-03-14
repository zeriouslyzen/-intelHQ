## AI Orchestration Plan

This document defines how AI components integrate into the platform: which events are summarized, how outputs feed the UX, and how to keep behavior safe and neutral.

---

## AI Orchestrator Responsibilities

- **News and event summarization**:
  - Cluster related news items and events.
  - Produce concise narratives explaining:
    - What happened.
    - Why it matters.
    - Which instruments/regions are most affected.
- **Regime and daily overview**:
  - Generate daily or intraday updates describing:
    - Risk regime (risk-on/off, volatility spikes).
    - Sector rotations and FX regimes.
    - Key regions driving change.
- **Chat summarization**:
  - Periodically summarize long chat threads into:
    - Neutral, non-promotional briefs.
    - Extracted topics and concerns from the community.

The orchestrator will run as a backend module with a clear interface, independent of the frontend.

---

## Inputs and Outputs

### Inputs

- **Events from the event bus (future)**:
  - Normalized news items.
  - Macro/policy events.
  - Market regime indicators (e.g., volatility metrics per region/asset class).
- **Direct API calls (initial phase)**:
  - The Next.js backend aggregates relevant data and calls the AI provider directly (e.g., LLM API).

### Outputs

Outputs are stored as durable records that the UI can query.

```ts
export type SummaryId = string;

export type SummaryKind =
  | "event_cluster"
  | "daily_overview"
  | "chat_window";

export interface Summary {
  id: SummaryId;
  kind: SummaryKind;
  // Pointer to the entity/entities summarized
  eventIds?: EventId[];
  threadId?: ThreadId;
  regionIds?: RegionId[];
  instrumentIds?: InstrumentId[];
  timeframe?: Timeframe;
  language: string; // e.g., "en"
  text: string;
  createdAt: string;
}
```

---

## Backend Integration

### REST Interface

- `GET /api/ai/summary/:id`
  - Returns a `Summary` by ID.

- `GET /api/ai/summary/event/:eventId`
  - Returns the latest `Summary` for the specified event (if available).

- `GET /api/ai/summary/thread/:threadId`
  - Returns the latest `Summary` of the given chat thread.

- `GET /api/ai/summary/daily`
  - Query params:
    - `regionId?: RegionId`
  - Returns the latest daily or intraday overview summary.

### Internal Orchestrator API

The orchestrator exposes internal functions, not directly accessible from the client:

```ts
interface AiOrchestrator {
  summarizeEvents(eventIds: EventId[]): Promise<Summary>;
  summarizeThread(threadId: ThreadId): Promise<Summary>;
  generateDailyOverview(options: { regionId?: RegionId }): Promise<Summary>;
}
```

These functions are invoked from:

- Cron jobs / scheduled tasks (e.g., nightly or hourly overviews).
- Event-driven handlers (e.g., when a burst of news arrives).
- On-demand triggers (e.g., user requests an updated summary for a busy thread).

---

## UX Touchpoints

- **Today view**:
  - Top AI narrative banner:
    - Fetches from `GET /api/ai/summary/daily`.
    - Includes a short headline and 2–3 sentence body.
- **Instrument detail**:
  - \"Key narrative today\" chip:
    - Uses `summarizeEvents` over events linked to the instrument.
    - Surfaces the latest relevant summary.
- **Events view**:
  - Event details:
    - For each event, show AI-generated summary alongside raw headlines and data.
- **Chat**:
  - Pinned AI summary bubble:
    - Uses `summarizeThread` for the current thread.
    - Updated periodically or on demand (e.g., button press).

---

## Safety, Neutrality, and Guardrails

- **Non-advisory stance**:
  - Summaries must be phrased descriptively, not prescriptively.
  - Avoid direct trading recommendations (e.g., \"buy\", \"sell\", \"should\" language).
- **Attribution and transparency**:
  - Clearly label AI-generated content as such.
  - Where possible, include references to underlying events or data (e.g., links to news items).
- **Content moderation support**:
  - Chat summaries should avoid amplifying abusive or spam content.
  - The orchestrator can flag potential policy violations for moderation systems rather than surface them directly.
- **Fallback behavior**:
  - If the AI provider is unavailable or errors:
    - UI should degrade gracefully by hiding AI sections and relying on raw data.
    - Critical paths (market data, news, map, chat transport) must not depend on AI availability.

This orchestration plan keeps AI as an augmentation layer, not a dependency for accessing core information, while providing clear interfaces for growth into more advanced scenario analysis in later phases.

