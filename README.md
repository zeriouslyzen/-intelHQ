# World Signals (IntelHQ)

Mobile-first tactical dashboard for global markets, FX, macro news, conflict/wartime updates, EMS and radio feeds, and a world map with region-linked events. Built for quick scanning and OSINT-style event logs.

## What it does

- **Live markets**: Indices (S&P 500, NASDAQ, VIX), FX (USD pairs), commodities (gold, silver, oil, chips, water). Data from Yahoo Finance and Frankfurter; nav ticker polls every 30s with color-coded percent change.
- **News and conflict**: Multi-source headlines (Reuters, BBC, Al Jazeera) with perspective tags; dedicated **Wartime** feed (wire + Defense News) and **Events** page with region filters. Conflict feed reuses news and adds extra sources to avoid duplicate fetches.
- **Map**: Leaflet world map with region markers (US, EU, APAC, SAM, MEX, RUS, CHN, MENA). Click a region to see FX, commodities, and **events for that region**. Popups show event count and headlines per region.
- **OSINT-style events log**: Chronological stream on the map page (timestamp, source, region, headline). Dark panel, monospace, link-through to articles.
- **EMS and radio**: Alerts from GDACS, USGS, ReliefWeb; radio stations via Radio Browser API plus curated international/news stations. Updates log by source.
- **Notes**: SQLite-backed notes with optional region pin; layout config stored in DB.

## How it works

- **Next.js 16** App Router; server components fetch data on the server, client components (map, tickers, filters) run in the browser.
- **Data layer** lives in `web/src/lib/`: `markets.ts`, `news.ts`, `conflict.ts`, `alerts.ts`, `radio.ts`, `regions.ts`. Each module exports fetchers (e.g. `fetchGlobalNews()`); no duplicate fetch logic.
- **API routes** under `web/src/app/api/live/*` (indices, fx, commodities, news, conflict, alerts, radio) are used by the nav ticker and any client that needs fresh data without a full page load.
- **Pages** load data server-side and pass it to client components. Map page fetches indices, regional FX, commodities, and news, then passes them into the map and side panels. Events page fetches news and conflict; Wartime page fetches conflict only.
- **Fallbacks**: Markets and news libs return safe fallback data when external APIs fail so the UI is never blank. See `web/DATA_FLOW.md` for where each data type is defined and consumed.

## How it’s pieced together

```
IntelHQ/
├── README.md                 # This file
├── .gitignore
├── docs/                     # Architecture, UX, domain models
│   ├── README.md
│   ├── architecture/
│   ├── domain/
│   └── ux/
└── web/                      # Next.js app
    ├── README.md             # App-specific setup
    ├── DATA_FLOW.md          # Data sources, API routes, pages, components
    ├── package.json
    ├── prisma/               # SQLite schema (notes, layout)
    ├── src/
    │   ├── app/              # Routes and API
    │   │   ├── page.tsx      # Today
    │   │   ├── markets/      # Instruments table + region panel
    │   │   ├── map/          # World map + dashboard + OSINT log
    │   │   ├── events/       # Headlines + Conflict & military
    │   │   ├── wartime/      # Conflict-only feed
    │   │   ├── alerts/       # EMS + radio + updates log
    │   │   ├── notes/        # Notes view
    │   │   ├── chat/         # Placeholder
    │   │   └── api/live/     # Live data endpoints
    │   ├── components/       # UI (NavTickers, WorldMap, RegionDashboard, etc.)
    │   └── lib/              # Data fetchers and domain helpers
    └── public/
```

- **Layout**: Root layout (`app/layout.tsx`) provides header, **NavTickers** (markets + news), sidebar nav, main content, and footer. All pages render inside the main content area.
- **Map flow**: `map/page.tsx` (server) fetches indices, FX, commodities, news → `MapViewClientWrapper` → `MapViewClient` (client) → `WorldMap` (with `news` for popups) and `RegionDashboard`; `EventsLogOsint` gets the same `news` for the log panel.
- **Wartime vs Events**: Wartime is a dedicated route and view for conflict/military updates only. Events page has two panels (Headlines and Conflict & military) and the same region filter; conflict there reuses global news plus extra feeds.

## Quick start

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No env vars required for basic run; SQLite DB is created under `web/prisma/` on first use.

- **Build**: `npm run build`
- **Start (production)**: `npm run start`
- **DB**: `npx prisma migrate dev` when schema changes; `prisma/dev.db` is gitignored.

## Docs

- **Data flow** (where data lives and who uses it): [web/DATA_FLOW.md](web/DATA_FLOW.md)
- **Architecture and stack**: [docs/architecture/stack-and-architecture.md](docs/architecture/stack-and-architecture.md)
- **Domain models and APIs**: [docs/domain/models-and-apis.md](docs/domain/models-and-apis.md)
- **UX flows**: [docs/ux/flows.md](docs/ux/flows.md)
- **Realtime strategy**: [docs/architecture/realtime-strategy.md](docs/architecture/realtime-strategy.md)
- **AI orchestration**: [docs/architecture/ai-orchestration.md](docs/architecture/ai-orchestration.md)

## External data (attribution)

- **Markets**: Yahoo Finance (indices, commodities), [Frankfurter](https://www.frankfurter.app/) (FX).
- **News**: Reuters, BBC, Al Jazeera (RSS). Conflict feed adds Reuters World, Defense News.
- **Alerts**: [GDACS](https://www.gdacs.org/), USGS Earthquake Catalog, [ReliefWeb](https://reliefweb.int/).
- **Radio**: [Radio Browser API](https://api.radio-browser.info/), plus curated stations.
- **Map**: OpenStreetMap (Leaflet).

## License

Proprietary / private. See repository settings for terms.
