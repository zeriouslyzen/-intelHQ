# World Signals — Web App

Next.js 16 app for the IntelHQ / World Signals dashboard. See the [root README](../README.md) for project overview and how the repo is pieced together.

## Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS 4**
- **Leaflet** + **react-leaflet** for the world map
- **Prisma** + **SQLite** (notes, layout config)
- **fast-xml-parser** for RSS (news, conflict, alerts)

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server (default port 3000) |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npx prisma migrate dev` | Apply schema migrations (dev) |
| `npx prisma generate` | Regenerate Prisma client (postinstall) |

## Environment

No required env vars for local run. Optional:

- `DATABASE_URL` — Prisma; defaults to `file:./dev.db` relative to project root. Override for production or a different path.

## Data flow

Data is fetched in **lib** modules and either:

- Used **server-side** by pages (e.g. map page calls `fetchIndexQuotes()`, `fetchGlobalNews()`, etc.) and passed as props to client components, or
- Exposed via **API routes** under `app/api/live/*` and consumed by the client (e.g. NavTickers polls these every 30s).

Single source of truth for which fetcher feeds which route and page: **[DATA_FLOW.md](./DATA_FLOW.md)**.

## Key paths

| Path | Purpose |
|------|--------|
| `src/app/` | Routes and API handlers |
| `src/app/api/live/` | Live data endpoints (indices, fx, commodities, news, conflict, alerts, radio) |
| `src/components/` | React components (NavTickers, WorldMap, RegionDashboard, EventsLogOsint, etc.) |
| `src/lib/` | Data fetchers and domain logic (markets, news, conflict, alerts, radio, regions) |
| `prisma/schema.prisma` | DB schema (Note, LayoutConfig, and legacy models) |

## Deploy

Build and run in production:

```bash
npm run build
npm run start
```

For Vercel or similar, point the project root to `web` (or the repo root if the app is deployed from `web`). Ensure `DATABASE_URL` is set if using a remote DB; for SQLite, the file path must be writable in the deployment environment.
