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

**Auth (NextAuth.js)** — Optional. Sign-in, header session UI, and chat load only when **both** `NEXTAUTH_SECRET` and `DATABASE_URL` are set. Otherwise NextAuth is not mounted (no `/api/auth/session` polling, no console `CLIENT_FETCH_ERROR`).

- `NEXTAUTH_URL` — Must match the site origin in the browser (include `www` if that is canonical).
- `NEXTAUTH_SECRET` — Strong random string for session signing.
- To force auth off even when secrets exist: `NEXT_PUBLIC_AUTH_DISABLED=true`.

Without a full auth setup, `/signin` and `/signup` redirect home; `/chat` shows a short “not enabled” message.

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

### Site won’t load, auth errors, or “security” / cookie issues

- Set **`NEXTAUTH_URL`** to the **same origin users see** (including `www` if that is your canonical host). A mismatch between apex and `www` breaks session cookies and CSRF checks.
- Production **`NEXTAUTH_SECRET`** must be set (see `.env.example`).
- Vercel previews use **`VERCEL_URL`** automatically for metadata when `NEXTAUTH_URL` is unset; for custom domains, always set **`NEXTAUTH_URL`** explicitly.
