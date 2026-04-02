# World Signals — Web App

Next.js 16 app for the IntelHQ / World Signals dashboard. See the [root README](../README.md) for project overview and how the repo is pieced together.

## Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS 4**
- **Leaflet** + **react-leaflet** for the world map
- **Prisma** + **PostgreSQL** (auth, chat, notes, layout config, and domain models — see `prisma/schema.prisma`)
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

- **`DATABASE_URL`** — Required for Prisma (PostgreSQL). Apply migrations: `npx prisma migrate dev`.

**Auth (NextAuth.js)** — Required for sign-in, sessions, and chat persistence:

- `NEXTAUTH_URL` — e.g. `http://localhost:3000` in development
- `NEXTAUTH_SECRET` — strong random string for session signing

Without these, public/market pages may still run, but `/signin`, `/signup`, and chat routes will not function correctly.

## Data flow

Data is fetched in **lib** modules and either:

- Used **server-side** by pages (e.g. map page calls `fetchIndexQuotes()`, `fetchGlobalNews()`, etc.) and passed as props to client components, or
- Exposed via **API routes** under `app/api/live/*` and consumed by the client (e.g. NavTickers polls on an interval when **live metrics** are on in the header).

Single source of truth for which fetcher feeds which route and page: **[DATA_FLOW.md](./DATA_FLOW.md)**.

## Key paths

| Path | Purpose |
|------|--------|
| `src/app/` | Routes and API handlers |
| `src/app/api/live/` | Live data (indices, fx, commodities, crypto, polymarket, news, conflict, alerts, radio, …) |
| `src/app/api/auth/` | NextAuth |
| `src/app/api/chat/` | Authenticated chat APIs |
| `src/contexts/` | `LivePollingContext`, `LocaleContext`, theme |
| `src/components/` | React components (NavTickers, WorldMap, RegionDashboard, EventsLogOsint, etc.) |
| `src/lib/` | Data fetchers and domain logic (markets, news, conflict, alerts, radio, regions) |
| `prisma/schema.prisma` | PostgreSQL schema (User, Session, chat, Note, LayoutConfig, …) |

## Deploy

Build and run in production:

```bash
npm run build
npm run start
```

For Vercel or similar, point the project root to `web`. Set **`DATABASE_URL`** (PostgreSQL), **`NEXTAUTH_URL`**, and **`NEXTAUTH_SECRET`**. Run migrations against the production database as part of deploy or CI.
