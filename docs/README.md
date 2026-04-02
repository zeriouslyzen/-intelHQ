# IntelHQ / World Signals — Documentation

Reference for architecture, domain, and UX. The running app lives in **../web**; data flow is documented in [../web/DATA_FLOW.md](../web/DATA_FLOW.md).

## Index

| Document | Description |
|----------|-------------|
| [architecture/stack-and-architecture.md](architecture/stack-and-architecture.md) | Stack choices (Next.js, Tailwind, Prisma), rendering model, API surface, future decomposition |
| [architecture/realtime-strategy.md](architecture/realtime-strategy.md) | SSE, WebSockets, and real-time data strategy |
| [architecture/ai-orchestration.md](architecture/ai-orchestration.md) | AI and orchestration plans |
| [domain/models-and-apis.md](domain/models-and-apis.md) | Domain models (User, Instrument, Region, Event, etc.) and API contracts |
| [ux/flows.md](ux/flows.md) | UX flows and navigation |

## Data and app behavior

For where data is fetched, which API routes expose it, and which pages/components consume it, see **[web/DATA_FLOW.md](../web/DATA_FLOW.md)**. It is the single reference for data flow in the app. That document also covers **site-wide live vs snapshot polling** (`LivePollingContext`), **crypto** and **Polymarket** routes, and the **Predictions** panel contract (`{ markets, fetchedAt }`).
