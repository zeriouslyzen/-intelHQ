# World Signals (IntelHQ)

Mobile-first tactical dashboard for global markets, FX, macro news, conflict/wartime updates, EMS and radio feeds, and a world map with region-linked events. Built for quick scanning and OSINT-style event logs.

## What it does

- **Live markets**: Indices (S&P 500, NASDAQ, VIX), FX (USD pairs), commodities (gold, silver, oil, chips, water). Data from Yahoo Finance and Frankfurter. A **crypto / stables** row (CoinGecko) and a **Polymarket** ribbon show spot moves and crowd-implied event odds. Nav tickers use color-coded percent change.
- **Site-wide live metrics**: Header control toggles **live polling** vs **snapshot** for the whole app (tickers, headlines strip, Polymarket, prediction panel). When off, data loads once per visit without background refresh while the tab stays open.
- **News and conflict**: Multi-source headlines (Reuters, BBC, Al Jazeera) with perspective tags; dedicated **Wartime** feed (wire + Defense News) and **Events** page with region filters. Conflict feed reuses news and adds extra sources to avoid duplicate fetches.
- **Today**: Regime summary, watchlist, activity feed, **embedded world map** (same stack as the Map page), **OSINT-style events log** in-column, and **Predictions · scenarios** (live Polymarket list with feed timestamp and [X](https://x.com/Polymarket) attribution, plus editorial cascade / trade / horizon / stress-test copy). i18n: `en`, `es`, `ja`, `tr`.
- **Map**: Leaflet world map with region markers (US, EU, APAC, SAM, MEX, RUS, CHN, MENA). Click a region to see FX, commodities, and **events for that region**. Popups show event count and headlines per region.
- **OSINT-style events log**: Chronological stream (timestamp, source, region, headline). Dark panel, monospace, link-through; surfaced on Map and Today.
- **EMS and radio**: Alerts from GDACS, USGS, ReliefWeb; radio stations via Radio Browser API plus curated international/news stations. Updates log by source.
- **Auth and chat** (optional): Credentials sign-in, Prisma-backed sessions, chat APIs and UI hooks for signed-in users. Requires `DATABASE_URL` and migrations.
- **Notes**: Notes and layout config in the database (see Prisma schema).

## How it works

- **Next.js 16** App Router; server components fetch data on the server, client components (map, tickers, filters) run in the browser.
- **Data layer** lives in `web/src/lib/`: `markets.ts`, `news.ts`, `conflict.ts`, `alerts.ts`, `radio.ts`, `regions.ts`, `polymarket.ts`, `cryptoQuotes.ts`, plus flights/vessels helpers where used on Today. Each module exports fetchers (e.g. `fetchGlobalNews()`); no duplicate fetch logic.
- **API routes** under `web/src/app/api/live/*` (indices, fx, commodities, **crypto**, **polymarket**, news, conflict, alerts, radio, …) power the nav ticker and other clients that need fresh data without a full page load. Polymarket returns `{ markets, fetchedAt }` with per-market `updatedAt` from the Gamma API when present.
- **`LivePollingContext`**: Wraps the app (inside locale); `shouldPoll` is `pollEnabled && tabVisible`. Consumers (e.g. `NavTickers`, `PredictionBriefPanel`, `BreakingHeadlinesStripLive`) respect the same rule so one toggle governs all wired polling.
- **Pages** load data server-side and pass it to client components. **Today** also loads conflict, flights, and vessel snapshots for the map when available. Map page fetches indices, regional FX, commodities, and news, then passes them into the map and side panels. Events page fetches news and conflict; Wartime page fetches conflict only.
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
    ├── prisma/               # PostgreSQL schema (auth, chat, notes, layout, …)
    ├── src/
    │   ├── app/              # Routes and API
    │   │   ├── page.tsx      # Today
    │   │   ├── markets/      # Instruments table + region panel
    │   │   ├── map/          # World map + dashboard + OSINT log
    │   │   ├── events/       # Headlines + Conflict & military
    │   │   ├── wartime/      # Conflict-only feed
    │   │   ├── alerts/       # EMS + radio + updates log
    │   │   ├── notes/        # Notes view
    │   │   ├── chat/         # Chat UI
    │   │   ├── signin/       # Credentials sign-in
    │   │   ├── signup/       # Registration
    │   │   ├── api/live/     # Live data (indices, fx, commodities, crypto, polymarket, …)
    │   │   ├── api/auth/     # NextAuth
    │   │   └── api/chat/     # Chat APIs
    │   ├── components/       # NavTickers, BottomNavBar, LiveFeedToggle, PredictionBriefPanel, …
    │   ├── contexts/         # LivePollingContext, LocaleContext, …
    │   └── lib/              # Data fetchers and domain helpers
    └── public/
```

- **Layout**: Root layout (`app/layout.tsx`) provides header (with **LiveFeedToggle**), **NavTickers** (markets, news, crypto, Polymarket), **BottomNavBar** primary navigation, main content, and footer. Theme (light / dark) is user-selectable.
- **Map flow**: `map/page.tsx` (server) fetches indices, FX, commodities, news → `MapViewClientWrapper` → `MapViewClient` (client) → `WorldMap` (with `news` for popups) and `RegionDashboard`; `EventsLogOsint` gets the same `news` for the log panel.
- **Wartime vs Events**: Wartime is a dedicated route and view for conflict/military updates only. Events page has two panels (Headlines and Conflict & military) and the same region filter; conflict there reuses global news plus extra feeds.

## Quick start

```bash
cd web
npm install
# Set DATABASE_URL to a PostgreSQL URL (see Prisma schema), then:
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For **auth and chat**, configure `DATABASE_URL`, run migrations, and set NextAuth env vars as in `web/README.md`.

- **Build**: `npm run build`
- **Start (production)**: `npm run start`
- **DB**: `npx prisma migrate dev` when schema changes.

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
- **Crypto**: [CoinGecko](https://www.coingecko.com/) public API (stables + major alts in the configured basket).
- **Prediction markets**: [Polymarket Gamma API](https://docs.polymarket.com/developers/gamma-markets-api/overview) (implied probabilities; not IntelHQ forecasts). Social: [@Polymarket on X](https://x.com/Polymarket).

## License

Proprietary / private. See repository settings for terms.
