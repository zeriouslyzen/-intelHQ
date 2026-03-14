# Data flow

Single reference for where each data type is defined, fetched, exposed, and used. No duplication of fetch logic across pages: pages either get data server-side from libs or client-side from API routes.

## Data sources (lib)

| Data | Lib | Fetcher | Fallback when API fails |
|------|-----|---------|-------------------------|
| Indices | `lib/markets.ts` | `fetchIndexQuotes()` | FALLBACK_INDICES |
| FX (snapshot) | `lib/markets.ts` | `fetchFxSnapshot()` | FALLBACK_FX |
| FX (regional) | `lib/markets.ts` | `fetchAllRegionalFx()` | REGIONAL_FX_FALLBACK |
| Commodities | `lib/markets.ts` | `fetchCommodities()` | FALLBACK_COMMODITIES |
| News | `lib/news.ts` | `fetchGlobalNews()` | FALLBACK_NEWS |
| Conflict | `lib/conflict.ts` | `fetchConflictUpdates()` | Uses fetchGlobalNews + extra feeds only |
| Alerts (EMS) | `lib/alerts.ts` | `fetchAllAlerts()` | None (returns []) |
| Radio | `lib/radio.ts` | `fetchRadioStations()` | Curated list always merged in |

## API routes (client / polling)

| Route | Calls | Used by |
|-------|-------|---------|
| `GET /api/live/indices` | `fetchIndexQuotes()` | NavTickers |
| `GET /api/live/fx` | `fetchFxSnapshot()` | NavTickers |
| `GET /api/live/commodities` | `fetchCommodities()` | NavTickers |
| `GET /api/live/news` | `fetchGlobalNews()` | NavTickers |
| `GET /api/live/conflict` | `fetchConflictUpdates()` | Optional client use |
| `GET /api/live/alerts` | `fetchAllAlerts()` | Optional client use |
| `GET /api/live/radio` | `fetchRadioStations()` | Optional client use |

## Pages (server data)

| Page | Fetches (server) | Passes to |
|------|------------------|-----------|
| `/` (Today) | indices, fx (regional), commodities, news | RegionDashboard (CHN, MENA), Watchlist table, Activity feed |
| `/markets` | indices, fx (regional), commodities | Table, MarketsRegionPanel |
| `/map` | indices, fx (regional), commodities, news | MapViewClientWrapper → MapViewClient → WorldMap (with news popups), RegionDashboard, EventsLogOsint |
| `/events` | news, conflict | EventsView (Headlines + Conflict & military panels) |
| `/wartime` | conflict | WartimeView (conflict-only feed, region filter) |
| `/alerts` | alerts, radio | AlertsRadioView (Alerts, Radio, Updates log) |
| `/notes` | fx (regional), commodities | NotesView |

## Components that consume data

- **NavTickers**: indices, fx (snapshot), commodities, news via `/api/live/*` (client, 30s poll, cache: no-store).
- **RegionDashboard**: fx, commodities, optional news; used on Today (CHN, MENA), Map (selected region), Markets (MarketsRegionPanel).
- **WorldMap**: optional news; region marker popups show event count and headlines per region; onRegionSelect for dashboard.
- **EventsLogOsint**: news (chronological, OSINT-style log); used on Map page below Global snapshot.
- **EventsView**: news + conflict; toggles Headlines vs Conflict & military; region filter.
- **WartimeView**: conflict only; region filter; used on /wartime.
- **AlertsRadioView**: alerts + radio; toggles Alerts / Radio / Updates log; region filter.
- **MapViewClient**: indices, fx, commodities, news; passes to WorldMap, RegionDashboard, EventsLogOsint.

## Duplication / single source

- **News vs conflict**: Conflict does not re-fetch Reuters/BBC/Al Jazeera. It calls `fetchGlobalNews()` once and maps to ConflictItem, then fetches only Reuters World and Defense News.
- **FX**: Two fetchers on purpose — `fetchFxSnapshot()` (4 pairs) for the nav ticker; `fetchAllRegionalFx()` (13+ pairs) for pages and map/region views.
- **Fallbacks**: Only in `lib/markets.ts` and `lib/news.ts`. API routes and pages use the lib; when the external API fails, the lib returns the fallback so the UI is not blank.
