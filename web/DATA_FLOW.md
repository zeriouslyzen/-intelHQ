# Data flow

Single reference for where each data type is defined, fetched, exposed, and used. No duplication of fetch logic across pages: pages either get data server-side from libs or client-side from API routes.

## Live polling (site-wide)

Client components that refresh on an interval read **`shouldPoll`** from **`LivePollingContext`** (`pollEnabled && document visibility`). When the user turns **snapshot** mode on in the header, these consumers stop scheduling intervals (they may still run an initial fetch). Wired consumers include **NavTickers** (all rows), **BreakingHeadlinesStripLive**, and **PredictionBriefPanel** (Polymarket).

## Data sources (lib)

| Data | Lib | Fetcher | Fallback when API fails |
|------|-----|---------|-------------------------|
| Indices | `lib/markets.ts` | `fetchIndexQuotes()` | FALLBACK_INDICES |
| FX (snapshot) | `lib/markets.ts` | `fetchFxSnapshot()` | FALLBACK_FX |
| FX (regional) | `lib/markets.ts` | `fetchAllRegionalFx()` | REGIONAL_FX_FALLBACK |
| Commodities | `lib/markets.ts` | `fetchCommodities()` | FALLBACK_COMMODITIES |
| Crypto / stables | `lib/cryptoQuotes.ts` | `fetchCryptoQuotes()` | [] |
| Polymarket | `lib/polymarket.ts` | `fetchPolymarketTopMarkets()` | `{ markets: [], fetchedAt }` |
| News | `lib/news.ts` | `fetchGlobalNews()` | FALLBACK_NEWS |
| Conflict | `lib/conflict.ts` | `fetchConflictUpdates()` | Uses fetchGlobalNews + extra feeds only |
| Alerts (EMS) | `lib/alerts.ts` | `fetchAllAlerts()` | None (returns []) |
| Radio | `lib/radio.ts` | `fetchRadioStations()` | Curated list always merged in |
| Flights (ADS-B) | `lib/flights.ts` | `fetchFlightStates()` | [] (caller-dependent) |
| Vessels (AIS) | `lib/vessels.ts` | `fetchVesselPositions()` | [] (caller-dependent) |

## API routes (client / polling)

| Route | Calls | Response shape | Used by |
|-------|-------|----------------|---------|
| `GET /api/live/indices` | `fetchIndexQuotes()` | JSON array | NavTickers |
| `GET /api/live/fx` | `fetchFxSnapshot()` | JSON array | NavTickers |
| `GET /api/live/commodities` | `fetchCommodities()` | JSON array | NavTickers |
| `GET /api/live/crypto` | `fetchCryptoQuotes()` | JSON array | NavTickers |
| `GET /api/live/polymarket` | `fetchPolymarketTopMarkets()` | `{ markets, fetchedAt }` | NavTickers, PredictionBriefPanel |
| `GET /api/live/news` | `fetchGlobalNews()` | JSON array | NavTickers |
| `GET /api/live/conflict` | `fetchConflictUpdates()` | JSON array | Optional client use |
| `GET /api/live/alerts` | `fetchAllAlerts()` | JSON array | Optional client use |
| `GET /api/live/radio` | `fetchRadioStations()` | JSON array | Optional client use |

**Polymarket**: Each market in `markets` may include `updatedAt` and `endDate` from Gamma. **`parsePolymarketApiJson()`** in `lib/polymarket.ts` accepts either the new object shape or a legacy JSON array.

## Pages (server data)

| Page | Fetches (server) | Passes to |
|------|------------------|-----------|
| `/` (Today) | indices, fx (regional), commodities, news, conflict, flight states, vessel positions (with resilient fallbacks) | TodayPageContent (map embed, OSINT log, PredictionBriefPanel client-side for Poly), RegionDashboard, watchlist, activity |
| `/markets` | indices, fx (regional), commodities | Table, MarketsRegionPanel |
| `/map` | indices, fx (regional), commodities, news | MapViewClientWrapper → MapViewClient → WorldMap (with news popups), RegionDashboard, EventsLogOsint |
| `/events` | news, conflict | EventsView (Headlines + Conflict & military panels) |
| `/wartime` | conflict | WartimeView (conflict-only feed, region filter) |
| `/alerts` | alerts, radio | AlertsRadioView (Alerts, Radio, Updates log) |
| `/notes` | fx (regional), commodities | NotesView |

## Components that consume data

- **NavTickers**: indices, fx (snapshot), commodities, **crypto**, **polymarket** (`markets` + `fetchedAt`; per-market `updatedAt` in ribbon), news via `/api/live/*` (client, ~30s poll when `shouldPoll`, `cache: no-store`). Shows **feed as-of** and **by @Polymarket / X** beside the Polymarket row when data exists.
- **PredictionBriefPanel** (Today sidebar): Polymarket list from `/api/live/polymarket`, same polling rules; **editorial** sections are i18n-only. Displays feed timestamp, X attribution, and per-market relative “odds updated” when `updatedAt` is set.
- **BreakingHeadlinesStripLive**: Live conflict/headline strip; respects `shouldPoll`.
- **RegionDashboard**: fx, commodities, optional news; used on Today (CHN, MENA), Map (selected region), Markets (MarketsRegionPanel).
- **WorldMap**: optional news; region marker popups show event count and headlines per region; onRegionSelect for dashboard.
- **EventsLogOsint**: news or conflict-shaped lists (chronological OSINT-style log); Map and Today.
- **EventsView**: news + conflict; toggles Headlines vs Conflict & military; region filter.
- **WartimeView**: conflict only; region filter; used on /wartime.
- **AlertsRadioView**: alerts + radio; toggles Alerts / Radio / Updates log; region filter.
- **MapViewClient**: indices, fx, commodities, news; passes to WorldMap, RegionDashboard, EventsLogOsint.

## Duplication / single source

- **News vs conflict**: Conflict does not re-fetch Reuters/BBC/Al Jazeera. It calls `fetchGlobalNews()` once and maps to ConflictItem, then fetches only Reuters World and Defense News.
- **FX**: Two fetchers on purpose — `fetchFxSnapshot()` (4 pairs) for the nav ticker; `fetchAllRegionalFx()` (13+ pairs) for pages and map/region views.
- **Fallbacks**: Only in `lib/markets.ts` and `lib/news.ts` (and empty arrays for crypto/Polymarket when APIs fail). API routes and pages use the lib; when the external API fails, the lib returns the fallback so the UI is not blank.
