## Domain Models and API Contracts

This document defines the core domain models and outlines the initial API contracts between the frontend and backend.

TypeScript-style interfaces are illustrative and will be implemented in shared code as the services are built.

---

## Core Entities

### User

```ts
export type UserId = string;

export interface User {
  id: UserId;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
  preferences: UserPreferences;
}

export type UserRole = "user" | "power_user" | "admin";

export interface UserPreferences {
  theme: "dark" | "light" | "system";
  regionsOfInterest: RegionId[];
  instrumentsOfInterest: InstrumentId[];
  riskProfile: "conservative" | "balanced" | "aggressive";
  defaultTimeframe: Timeframe;
}
```

### Instrument

```ts
export type InstrumentId = string;

export type InstrumentClass = "equity" | "fx" | "index";

export interface Instrument {
  id: InstrumentId;
  symbol: string;
  name: string;
  class: InstrumentClass;
  regionId: RegionId;
  currency: string;
  exchange?: string;
  sector?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Region

```ts
export type RegionId = string;

export interface Region {
  id: RegionId;
  name: string;
  code: string; // e.g., "US", "EU", "APAC"
  parentId?: RegionId;
  centroid: {
    lat: number;
    lon: number;
  };
  // Optional references to geo shapes maintained by the Geo/Map service
  shapeKey?: string;
}
```

### Event

```ts
export type EventId = string;

export type EventKind =
  | "macro"
  | "earnings"
  | "policy"
  | "geopolitics"
  | "other";

export type EventImpactLevel = "low" | "medium" | "high";

export interface Event {
  id: EventId;
  kind: EventKind;
  title: string;
  description?: string;
  source: string;
  url?: string;
  time: string;
  impactLevel: EventImpactLevel;
  relatedInstrumentIds: InstrumentId[];
  relatedRegionIds: RegionId[];
  aiLabels?: string[]; // e.g., "FX-sensitive", "Safe-haven flow"
}
```

### Thread and Message (Chat)

```ts
export type ThreadId = string;
export type MessageId = string;

export type ThreadContextType =
  | "global"
  | "instrument"
  | "region"
  | "event";

export interface ThreadContext {
  type: ThreadContextType;
  instrumentId?: InstrumentId;
  regionId?: RegionId;
  eventId?: EventId;
}

export interface Thread {
  id: ThreadId;
  context: ThreadContext;
  title: string;
  createdAt: string;
  createdBy: UserId;
  isReadOnly: boolean;
  // AI summary id for the latest window of conversation
  latestSummaryId?: string;
}

export interface Message {
  id: MessageId;
  threadId: ThreadId;
  authorId: UserId;
  body: string;
  createdAt: string;
  editedAt?: string;
  // Optional referenced entities for deep linking
  instrumentIds?: InstrumentId[];
  regionIds?: RegionId[];
  eventIds?: EventId[];
}
```

### Price and Time Series

```ts
export type Timeframe =
  | "intraday"
  | "1D"
  | "5D"
  | "1M"
  | "6M"
  | "1Y"
  | "max";

export interface PricePoint {
  t: string; // ISO timestamp
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
}

export interface PriceSeries {
  instrumentId: InstrumentId;
  timeframe: Timeframe;
  points: PricePoint[];
}
```

---

## High-Level API Contracts

All routes are prefixed with `/api` in the Next.js app. Response envelopes may later be standardized; for now they return raw data structures or small envelopes.

### Markets API

- `GET /api/markets/instruments`
  - Query params:
    - `class?: InstrumentClass`
    - `regionId?: RegionId`
    - `search?: string`
  - Response:
    - `Instrument[]`

- `GET /api/markets/instruments/:id`
  - Response:
    - `Instrument`

- `GET /api/markets/prices/:instrumentId`
  - Query params:
    - `timeframe: Timeframe`
  - Response:
    - `PriceSeries`

### Events and News API

- `GET /api/events`
  - Query params:
    - `kind?: EventKind`
    - `regionId?: RegionId`
    - `instrumentId?: InstrumentId`
    - `from?: string`
    - `to?: string`
  - Response:
    - `Event[]`

- `GET /api/events/:id`
  - Response:
    - `Event`

### Regions and Map API

- `GET /api/regions`
  - Response:
    - `Region[]`

- `GET /api/regions/:id`
  - Response:
    - `Region`

- `GET /api/regions/:id/overview`
  - Response (simplified):
    - {
      `region: Region;`
      `topInstruments: Instrument[];`
      `recentEvents: Event[];`
    }

### Threads and Chat API

- `GET /api/threads`
  - Query params:
    - `contextType?: ThreadContextType`
    - `instrumentId?: InstrumentId`
    - `regionId?: RegionId`
    - `eventId?: EventId`
  - Response:
    - `Thread[]`

- `GET /api/threads/:id`
  - Response:
    - `Thread`

- `GET /api/threads/:id/messages`
  - Query params:
    - `before?: string`
    - `after?: string`
    - `limit?: number`
  - Response:
    - `Message[]`

These contracts are sufficient to support the initial UX surfaces (Today, Markets, Instrument Detail, Map, Events, Chat). They will be implemented first as Next.js API routes backed by mocked or limited-scope data sources and then connected to real data providers and storage as the backend is expanded.

