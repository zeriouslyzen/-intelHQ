## UX Flows and Screen Definitions

This document captures concrete UX flows and screen descriptions for the core views across **mobile-first** and **desktop dashboard** experiences.

---

## Today View (`/`)

### Mobile

- **Goal**: Give a 30–60 second understanding of how the world and markets have shifted and what to watch next.
- **Layout**
  - Header: Date, user greeting, quick toggle for \"Global\" vs \"My universe\" (regions/instruments of interest).
  - World state card:
    - Short AI summary (2–3 sentences) describing regime (risk-on/off), volatility, and major themes.
    - Mini world map strip with heat colors by region.
  - Market movers card:
    - Top gainers/losers (equities, FX pairs) as a vertical list with sparklines.
    - Tap row → Instrument Detail.
  - Key events card:
    - 3–5 major macro/news events with time, source, and impact tags.
    - Tap event → Event Detail (in `/events` domain).
  - Alerts and watchlist card:
    - List of triggered alerts since last visit.
    - Watchlist summary with aggregated change and P/L.
- **Primary interactions**
  - Scroll through stacked cards.
  - Tap any card header to expand into its full route (`/markets`, `/map`, `/events`).
  - Pull-to-refresh to re-evaluate the snapshot and AI summary.

### Desktop

- **Goal**: High-density glanceable overview for the current session.
- **Layout**
  - Two-column layout:
    - Left: world state, regime summary, top events.
    - Right: markets overview (gainers/losers, indices, FX) and watchlist.
  - Compact map panel at the top or right showing regions with most movement.
- **Primary interactions**
  - Hover to reveal more detail (tooltips on map and movers).
  - Click to navigate to Instrument Detail, Map, or Events.
  - Quick filters (timeframe, region, asset class) at top of page.

---

## Markets View (`/markets`)

### Mobile

- **Goal**: Browse and filter instruments quickly from a phone; jump into detail when needed.
- **Layout**
  - Segmented controls for asset class: `All`, `Equities`, `FX`, `Indices`.
  - Filter chips: region clusters (Americas, Europe, Asia, Emerging), volatility, volume.
  - Watchlist section pinned at top:
    - Horizontally scrollable or small stacked list with sparklines.
  - Main list:
    - Each row: instrument name/symbol, last price, change %, small sparkline, tag (region).
  - Bottom sticky bar:
    - Access to quick search, alert creation, and sort options.
- **Primary interactions**
  - Tap row → Instrument Detail.
  - Long-press row → context actions: add/remove from watchlist, create alert, open discussion.
  - Swipe left/right on row (optional) → quick add/remove from watchlist.

### Desktop

- **Goal**: Power-table for scanning and sorting many instruments.
- **Layout**
  - Table with frozen first column (instrument) and horizontally scrollable metrics.
  - Left sidebar:
    - Watchlists tree.
    - Saved screeners.
  - Top toolbar:
    - Global search.
    - Filters (asset class, region, sector, volatility).
    - View presets (e.g., \"Risk\", \"Momentum\", \"Yield\").
- **Primary interactions**
  - Column sorting, multi-column filters.
  - Right-click row (or kebab menu) for actions: open in new tab, create alert, open region on map, open chat.
  - Multi-select instruments to compare (opens comparison widget or map overlay).

---

## Instrument Detail (`/markets/[instrumentId]`)

### Mobile

- **Goal**: Provide a deep yet navigable view of a single instrument across price, context, and community.
- **Layout**
  - Header: symbol, name, region flag, current price and change.
  - Timeframe selector (intraday, 1D, 5D, 1M, 6M, 1Y, Max).
  - Chart area:
    - Candlesticks or line chart with volume bars.
    - Gesture interactions: pinch-to-zoom, drag, tap to inspect candles.
  - Context strip:
    - Quick stats: range, volatility, volume vs average.
    - Region and sector badges (tap navigates to Map/Region view).
  - News timeline:
    - Chronological list of headlines tagged by impact (high/medium/low).
    - AI summary chip: \"Key narrative today\".
  - Map mini-panel:
    - Region highlight on mini map; tap to expand full map view.
  - Chat drawer:
    - Collapsible panel from bottom with live thread and AI summary of last N messages.
- **Primary interactions**
  - Swipe between tabs or sections (e.g., `Overview`, `News`, `Map`, `Chat`).
  - Join instrument-specific chat; post messages.
  - Create or adjust alerts directly from header or chart.

### Desktop

- **Goal**: Rich analytical workspace focused on a single instrument.
- **Layout**
  - Flexible two- or three-column layout:
    - Main: full chart with indicators and drawing tools (phase 2).
    - Right: news, AI summary, key stats.
    - Bottom or side: chat and map mini panel.
  - Widgets can be resized and rearranged, with layout saved per user.
- **Primary interactions**
  - Hover and keyboard shortcuts for more precise chart control (later).
  - Click on a map region or event to filter associated news and chat.
  - Toggle overlays (e.g., correlation with an index or FX pair).

---

## Map View (`/map`)

### Mobile

- **Goal**: Spatial feeling of where change is happening in the world.
- **Layout**
  - Full-screen interactive map with minimal chrome.
  - Layer controls in a bottom or side sheet (opened via map FAB):
    - Overlays: market performance, volatility, volume, news intensity, sentiment.
    - Time slider for intraday vs multi-day heat.
  - Tap region:
    - Shows region card: key indices, FX pairs, top movers, recent news.
    - CTA buttons: \"Open regional dashboard\", \"Open chat\".
- **Primary interactions**
  - Pinch/zoom, drag to navigate.
  - Tap markers for events (e.g., earnings, policy decisions, shocks).
  - Toggle overlays and quickly jump between saved map presets.

### Desktop

- **Goal**: Tactical map/dashboard that can be a primary monitoring screen.
- **Layout**
  - Map takes majority of screen (central).
  - Side panel:
    - Region details for selected region.
    - Event stack with scrollable list of recent or filtered events.
  - Top bar:
    - Overlay toggles and time controls.
  - Optional mini-views:
    - Mini chart of key index for the selected region.
    - Snippet of regional chat.
- **Primary interactions**
  - Drag-to-select regions or corridors (e.g., shipping lanes or trade routes in later versions).
  - Hover to reveal inline stats for regions and event clusters.
  - Multi-select of overlays (e.g., performance + news intensity) to detect confluence.

---

## Events View (`/events`)

### Mobile

- **Goal**: Timeline of impactful macro and micro events, with clear relevance to user.
- **Layout**
  - Filter row: `All`, `Macro`, `Earnings`, `Policy`, `Geopolitics`.
  - Timeline list:
    - Each entry: time, title, source, impacted instruments/regions (chips), impact level.
    - AI label: e.g., \"FX-sensitive\", \"Equity risk\", \"Safe-haven flow\".
  - Event detail:
    - When tapped: opens a sheet with narrative, impacted instruments, map snapshot, and discussion.
- **Primary interactions**
  - Filter and search event timeline.
  - Save events or set reminders for upcoming ones (e.g., FOMC).

### Desktop

- **Goal**: Analysis of past and upcoming events and their cross-asset impact.
- **Layout**
  - Two-panel layout:
    - Left: filterable timeline.
    - Right: detail pane with narrative, instruments, region map, and linked chats.
- **Primary interactions**
  - Correlate events with price reactions (simple linked charts).
  - Save filtered views / event screens for reuse.

---

## Chat View (`/chat`)

### Mobile

- **Goal**: Accessible, non-intimidating space for discussion tied to markets and events.
- **Layout**
  - Top tabs:
    - `Global`, `By Instrument`, `By Region`, `Events`.
  - Channel list for selected tab.
  - Message area with pinned AI summary bubble at top (optional).
  - Composer:
    - Simple input with optional quick tags (e.g., instrument, region, event).
- **Primary interactions**
  - Join/leave channels.
  - Jump into instrument/region/event detail from tagged messages.
  - Report or mute content (for moderation pipeline).

### Desktop

- **Goal**: Companion to dashboard views; secondary but always available.
- **Layout**
  - Docked panel on right or bottom that can be expanded/collapsed.
  - Multi-channel view with ability to pop out a dedicated chat window.
- **Primary interactions**
  - Link chat context with current dashboard state (e.g., if looking at EURUSD, auto-focus that thread).
  - Filter messages by tag (instrument/region/event).

---

## Dashboard Behavior and Customization (Desktop Focus)

- **Widget model**
  - Core screens (`Today`, `Markets`, `Instrument`, `Map`, `Events`, `Chat`) are composed of widgets that can also be placed on the main dashboard.
  - Each widget has:
    - Title, description, data source(s), refresh/real-time behavior, controls (filters).
- **Customization**
  - Drag-and-drop layout editing with snap-to-grid.
  - Persistent layouts per user, per device class (mobile layout is guided; desktop allows more freedom).
  - Predefined templates (e.g., \"Macro watcher\", \"FX focus\", \"Equity volatility\").

