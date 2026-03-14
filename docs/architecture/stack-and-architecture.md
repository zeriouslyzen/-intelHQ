## Stack and Architecture Selection

This document records the concrete technology choices and high-level architecture for the global markets UX platform.

---

## Frontend

- **Framework**: Next.js **16.1.x** with App Router and React **19.x**.
- **Language**: TypeScript.
- **Rendering model**:
  - React Server Components by default for data-heavy views.
  - Server-side rendering for authenticated app shell and main routes.
  - Static generation / ISR for any public or marketing content (to be added later).
- **Styling and design system**:
  - Tailwind CSS 4 with design tokens for the tactical, dark-first aesthetic.
  - Custom CSS variables for colors, typography, spacing, and elevation.
  - Utility-first approach with small semantic wrappers for layout primitives.
- **Component primitives**:
  - Radix UI or similar headless primitives for dialogs, sheets, popovers, and menus (to be added as dependency when first used).
  - Internal component library under `src/components` for:
    - Layout: app shell, grid, card, panel, dashboard layout primitives.
    - Visualization: charts, map wrappers, status pills, tags, badges.
    - Navigation: tab bars, sidebars, top navigation, bottom nav for mobile.
- **Data fetching and client state**:
  - TanStack Query for client-side fetching and caching where needed.
  - Minimal global store (Zustand) only for cross-cutting UI state (theme, layout preferences, auth shell).

---

## Backend and Services (Initial Phase)

Initial implementation will run as a **single Next.js app** with clearly separated domain modules, evolving over time into independent services as needed.

- **Runtime**: Node.js (as required by Next.js 16).
- **API surface**:
  - RESTful routes under `/api/*` for:
    - Markets data (mocked or limited-scope provider initially).
    - News/events (stubbed, later backed by ingest pipeline).
    - Geo/regions and overlays (static data first, dynamic later).
    - Chat (placeholder endpoints until real-time infra added).
- **Data store (initial)**:
  - Postgres (or a managed equivalent) as the primary relational store for:
    - Users, profiles, preferences, layouts.
    - Instruments, regions, events, threads.
  - Seed data and fixtures stored under a dedicated directory for early development.
- **Real-time transport**:
  - Server-Sent Events (SSE) for one-way streams:
    - Market ticks / price snapshots.
    - News/event ticker streams.
  - WebSockets for bidirectional features:
    - Chat channels.
    - Future collaborative dashboards.

In the first implementation phase we will stub these endpoints with static or simulated streams and add real providers later.

---

## Event Bus and Future Decomposition

The architecture is designed to evolve from a modular monolith into separate services:

- **Event bus (future)**:
  - Kafka/Redpanda/Pulsar or a managed equivalent.
  - Used for ingesting:
    - Normalized market data from providers.
    - News and macro events.
    - Enrichment events for AI summarization and correlation.
- **Domain services**:
  - Markets service.
  - News service.
  - Geo/Map service.
  - Chat service.
  - AI Orchestrator.

These will begin as internal modules and service boundaries within the Next.js backend code, with clear interfaces and types to prepare for extraction.

---

## Libraries to Add (When Needed)

These libraries are part of the plan but will be added to `package.json` when their first concrete usage is implemented:

- **Charts**: Recharts or ApexCharts for price charts and small multiples.
- **Maps**: MapLibre GL JS or Mapbox GL JS for the world map and overlays.
- **State and data**:
  - `@tanstack/react-query`.
  - `zustand` for minimal global state.
- **Validation**: Zod for runtime validation of external inputs and API payloads.
- **Auth**: NextAuth or another OAuth2/OIDC solution for user authentication.

The scaffolding in `web` already provides a solid Next.js + Tailwind + TypeScript foundation on which to build the UX and domain features described in the plan.

