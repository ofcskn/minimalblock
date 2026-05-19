# Architecture

This document describes the technical architecture of Minimal Block — design decisions, layer boundaries, data flows, and extension points.

---

## Table of Contents

- [Overview](#overview)
- [Architectural Principles](#architectural-principles)
- [Monorepo Layout](#monorepo-layout)
- [Layer Architecture](#layer-architecture)
  - [Domain Layer (libs/core)](#domain-layer-libscore)
  - [Data Layer (libs/data)](#data-layer-libsdata)
  - [AI Layer (libs/ai)](#ai-layer-libsai)
  - [Feature Layer (libs/features)](#feature-layer-libsfeatures)
  - [UI Layer (libs/ui)](#ui-layer-libsui)
- [Application Architecture](#application-architecture)
  - [Web App (apps/web)](#web-app-appsweb)
  - [API Worker (apps/api)](#api-worker-appsapi)
  - [Documentation Site (apps/docs)](#documentation-site-appsdocs)
- [Data Flow](#data-flow)
  - [3D Model Generation Pipeline](#3d-model-generation-pipeline)
  - [Product Import Pipeline](#product-import-pipeline)
- [Database Design](#database-design)
  - [Schema Overview](#schema-overview)
  - [Row-Level Security Model](#row-level-security-model)
  - [Migration Strategy](#migration-strategy)
- [AI Architecture](#ai-architecture)
  - [Prompt Engineering Strategy](#prompt-engineering-strategy)
  - [Category Generator Pattern](#category-generator-pattern)
  - [Feedback Loop](#feedback-loop)
- [Security Architecture](#security-architecture)
- [Scalability Considerations](#scalability-considerations)
- [Architectural Decision Records](#architectural-decision-records)

---

## Overview

Minimal Block is a **full-stack AI product tool** structured as an Nx monorepo with three applications and six shared libraries. It converts 2D product photographs into interactive GLB 3D models using Google Gemini's multimodal AI.

```
┌────────────────────────────────────────────────────────────────┐
│                     Browser (apps/web)                          │
│  React 19 • React Router • React Query • Tailwind CSS          │
│  model-viewer • i18next • QR codes • Hotspot Editor            │
└──────────────────────┬─────────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌────────────────────────────────────────────────────────────────┐
│              Cloudflare Worker (apps/api)                       │
│  Web Standard Request/Response • Node.js compatibility         │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Import       │  │  Pipelines   │  │  Product Adapters    │ │
│  │  Orchestrator │  │  autofill    │  │  ikea / amazon /     │ │
│  │              │  │  material    │  │  trendyol / generic  │ │
│  │              │  │  cluster     │  └──────────────────────┘ │
│  │              │  │  image-intel │                           │
│  └──────────────┘  │  image-upload│                           │
│                    │  product-intel                            │
│                    └──────────────┘                            │
└──────────┬─────────────────────────────────┬───────────────────┘
           │                                 │
           ▼                                 ▼
┌────────────────────┐             ┌─────────────────────┐
│  Google Gemini API │             │      Supabase        │
│  2.0 Flash         │             │  PostgreSQL + RLS    │
│                    │             │  Storage (CDN)       │
│  • Image analysis  │             │  Auth (JWT/PKCE)     │
│  • 3D generation   │             │  Realtime (optional) │
│  • Material infer. │             └─────────────────────┘
│  • Geometry class. │
└────────────────────┘
```

---

## Architectural Principles

1. **Server-side AI only.** Gemini API keys are never exposed to the browser. All LLM calls happen inside the Cloudflare Worker.

2. **Ports and Adapters (Hexagonal Architecture).** `libs/core` defines ports (interfaces). `libs/data` and `libs/ai` provide implementations. Applications depend on abstractions, not concrete services.

3. **Domain purity.** `libs/core` has zero framework dependencies. Domain entities and value objects are plain TypeScript classes that can run anywhere.

4. **Library isolation.** Nx enforces dependency boundaries. Libraries cannot import from applications. `libs/core` cannot import from other workspace libraries.

5. **Monorepo-first.** Shared code lives in libraries. Applications are thin orchestration layers.

6. **Affected-only CI.** Nx's project graph determines which tests and builds run on each commit — untouched projects are skipped.

---

## Monorepo Layout

```
minimalblock/
├── apps/
│   ├── web/         SPA (React + Vite)
│   ├── api/         Serverless API (Cloudflare Worker)
│   └── docs/        Documentation site (VitePress)
├── libs/
│   ├── core/        Domain: entities, value objects, ports
│   ├── data/        Infrastructure: Supabase repositories
│   ├── ai/          Infrastructure: Gemini clients, generators, prompts
│   ├── features/    Application: React hooks (use-cases)
│   ├── ui/          Presentation: shared React components
│   └── trendyol/    Integration: Trendyol marketplace adapter
├── supabase/
│   └── migrations/  Sequential SQL migrations (001–016)
└── docs/            Static documentation (Diátaxis)
```

**Dependency graph (enforced — no cycles):**

```
apps/web ──→ libs/features ──→ libs/core
apps/web ──→ libs/ui       ──→ libs/core
apps/api ──→ libs/ai       ──→ libs/core
apps/api ──→ libs/data     ──→ libs/core
apps/api ──→ libs/trendyol ──→ libs/core
```

---

## Layer Architecture

### Domain Layer (`libs/core`)

The domain layer defines **what the system is** without specifying **how it is implemented**.

**Contents:**
- **Entities:** `Product`, `Conversion`, `User` — objects with identity and lifecycle
- **Value Objects:** `ConversionStatus`, `QualityReport`, `GenerationJob`, `ExportProfile`, `MediaAsset` — immutable descriptors
- **Ports (interfaces):**
  - `ProductRepository` — CRUD for product records
  - `ConversionRepository` — Conversion job tracking
  - `GenerationJobRepository` — Long-running job state
  - `ModelGeneratorPort` — Contract for any AI 3D generator
  - `ImageUploaderPort` — Contract for any file storage provider
  - `PageScraperPort` — Contract for any e-commerce site scraper
- **API Contracts:** Request/response type definitions shared between `apps/api` and `apps/web`
- **Utilities:** Product category classification, file validation, UUID generation

**Zero external dependencies** — can be run and tested in isolation.

### Data Layer (`libs/data`)

Implements the ports defined in `libs/core` using Supabase.

**Contents:**
- `ProductRepository` — Supabase implementation of `ProductRepository` port
- `ConversionRepository` — Tracks conversion status with Supabase Realtime support
- `GenerationJobRepository` — Long-running job polling
- `EventsRepository` — Analytics event writes
- `EmbedViewsRepository` — Public embed view counts
- `supabase/client.ts` — Typed Supabase JS client factory
- `supabase/storage.ts` — Signed URL generation, file uploads/deletes
- `supabase/database.types.ts` — Auto-generated TypeScript types from Supabase schema

Swapping Supabase for another database requires implementing the same ports — the rest of the system is unaffected.

### AI Layer (`libs/ai`)

Implements `ModelGeneratorPort` and provides all AI analysis capabilities.

**Contents:**
- **Gemini Clients** — 20+ specialized classes, each wrapping a specific Gemini use-case
- **Category Generators** — Strategy pattern; each product category has a tailored 3D generation pipeline
- **Prompts** — TypeScript functions returning LLM instruction strings; versioned with the codebase
- **Validation** — GLB binary validation and scene graph integrity checks
- **Feedback** — Structured quality feedback collection
- **Mock** — `MockImageAnalyzer` for testing without real API calls

### Feature Layer (`libs/features`)

Application-layer hooks that coordinate domain and infrastructure. Contains no UI code.

**Hooks:**
- `use-upload` — Orchestrates file validation → upload → conversion trigger
- `use-auth` — Wraps Supabase Auth session management
- `use-gallery` — Product listing with filters and pagination
- `use-conversion` — Polls conversion status via React Query

### UI Layer (`libs/ui`)

Stateless (or locally stateful) React components with Tailwind styling. No direct Supabase calls.

**Component categories:**
- **Layout:** `AppShell`, `Header`, `Sidebar`, admin shell components
- **Primitives:** `Button`, `Card`, `Modal`, `Spinner`, `StatusBadge`
- **Domain:** `ModelViewer`, `ModelInfoCard`, `AiDiagnosisPanel`, `HotspotEditorPanel`, `BrandPlacementPanel`, `QrCode`
- **Admin:** `DashboardShell`, `AppSidebar`, `ProfileMenu`, `NotificationMenu`

---

## Application Architecture

### Web App (`apps/web`)

Single-page application using React Router for client-side navigation.

**Route structure:**

```
/             → GalleryPage (product grid)
/upload       → UploadPage (photo upload + conversion trigger)
/product/:id  → ProductDetailPage (model viewer + hotspot editor)
/public/:id   → PublicProductPage (shareable embed-ready view)
/brand        → BrandPage (brand configuration)
```

**State architecture:**

| Type | Tool | Examples |
|---|---|---|
| Server state | React Query | Product list, conversion status |
| App-wide UI state | React Context (`AppContext`) | Supabase client, auth session |
| Local UI state | `useState` / `useReducer` | Modal open, form fields |
| URL state | React Router params/search | Product ID, filters |

**Performance:**
- Route-level code splitting via `React.lazy`
- Gallery virtualization via `@tanstack/react-virtual`
- 3D models deferred until visible in viewport

### API Worker (`apps/api`)

Cloudflare Worker with Node.js compatibility enabled. The entry point differs by environment:

- **Production:** `src/worker.ts` — standard `fetch` export for Cloudflare Workers
- **Local dev:** `src/main.ts` — Node.js HTTP server shim wrapping the same handler

**Request routing** is handled in `src/lib/server.ts` without a framework — plain `if/switch` on `Request.url` and `Request.method`.

**Import pipeline** (triggered by `POST /import`):

```
adapter-registry
    │
    ├── trendyol-adapter
    ├── ikea-adapter
    ├── amazon-adapter
    └── generic-adapter
          │
          ▼
    orchestrator.ts
          │
          ├── image-intelligence.pipeline
          ├── image-upload.pipeline
          ├── product-intelligence.pipeline
          ├── material.pipeline
          ├── cluster.pipeline
          └── autofill.pipeline
```

**Worker bundle:** Single ESM file produced by esbuild (`build-worker.mjs`). All imports are bundled; no dynamic `require`.

### Documentation Site (`apps/docs`)

VitePress 2 static site with bilingual content (English and Turkish) following the Diátaxis documentation framework:

| Section | Purpose |
|---|---|
| Tutorials | Learning-oriented, step-by-step guided experiences |
| How-to guides | Problem-oriented, specific task instructions |
| Explanations | Understanding-oriented, conceptual background |
| Reference | Information-oriented, technical fact lookup |

---

## Data Flow

### 3D Model Generation Pipeline

```
1. User selects product image in GalleryPage / UploadPage
   └─ use-upload hook validates file type and size

2. POST /convert (multipart/form-data)
   └─ Worker receives image bytes

3. Worker: gemini-image-analyzer
   └─ Extracts visual features, quality score, readiness assessment

4. Worker: gemini-geometry-classifier
   └─ Determines shape class (box / cylinder / organic / flat / etc.)

5. Worker: gemini-product-understanding
   └─ Extracts category, materials, name, key attributes

6. Worker: category-generator.factory
   └─ Selects generator by category (furniture / clothing / electronics / etc.)

7. Worker: selected generator builds prompt → gemini-3d-generator
   └─ Gemini returns GLB bytes

8. Worker: glb-validator
   └─ Validates binary format and scene graph integrity

9. Worker: Supabase Storage upload
   └─ GLB stored under owner_id/uuid.glb

10. Worker: conversions table update
    └─ status: completed, output_asset_url populated

11. Browser: React Query re-fetches conversion
    └─ model-viewer renders the GLB
```

### Product Import Pipeline

```
1. User pastes product URL → POST /import

2. adapter-registry identifies source (Trendyol / IKEA / Amazon / generic)

3. Adapter fetches product page HTML, extracts:
   - Product name, description, price
   - Image URLs
   - Category hints

4. Pipelines run in parallel:
   - image-intelligence: quality pre-screening
   - product-intelligence: AI-enhanced metadata
   - material: material inference from images
   - cluster: multi-product detection
   - autofill: e-commerce attribute completion

5. Normalized product object returned to browser

6. User selects images → triggers 3D generation pipeline
```

---

## Database Design

### Schema Overview

```sql
-- Core product inventory
products (id, owner_id, name, description, category, created_at, updated_at)

-- Conversion tracking
conversions (
  id, product_id, owner_id,
  source_asset_url, source_asset_key, source_asset_mime, source_asset_size,
  output_asset_url, output_asset_key, output_asset_mime, output_asset_size,
  status [pending|processing|completed|failed],
  error_message, created_at, updated_at
)

-- Interactive 3D annotations
hotspots (id, conversion_id, owner_id, position, normal, label, url)
hotspots_suggested (id, conversion_id, position, label, confidence)

-- AI-generated product intelligence
ai_insights (id, product_id, materials, geometry, return_risk, metadata)

-- Source image quality metadata
conversion_source_assets (id, conversion_id, readiness_score, quality_flags)

-- Long-running job tracking
generation_jobs (id, conversion_id, status, model, prompt_tokens, created_at)

-- User quality ratings
generation_feedback (id, conversion_id, owner_id, rating, notes, created_at)

-- Analytics
events (id, owner_id, type, payload, created_at)

-- Brand configuration
brand_placement (id, owner_id, logo_url, position, opacity)

-- Product taxonomy
commerce_categories (id, slug, label_en, label_tr, parent_id)
```

### Row-Level Security Model

Every table that contains user data has RLS enabled. The pattern:

```sql
-- Users can only see their own records
CREATE POLICY "owner_select" ON <table>
  FOR SELECT USING (auth.uid() = owner_id);

-- Users can only insert their own records
CREATE POLICY "owner_insert" ON <table>
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Public-facing records use a separate view
CREATE VIEW public_products AS
  SELECT id, name, description, output_asset_url
  FROM products
  WHERE is_public = true;
```

The Cloudflare Worker uses the **service role key** (bypasses RLS) to perform privileged operations like updating conversion status after a Gemini call completes. The browser client uses the **anon key** (subject to RLS).

### Migration Strategy

- Migrations are sequential SQL files in `supabase/migrations/`
- Naming: `NNN_descriptive_name.sql` (e.g., `016_perf_indexes_and_rpcs.sql`)
- Never edit a committed migration — always create a new one
- Run `supabase db push` to apply pending migrations
- Run `supabase db reset` to wipe and replay all migrations (dev only — destructive)

---

## AI Architecture

### Prompt Engineering Strategy

Each Gemini call uses a dedicated TypeScript function in `libs/ai/src/lib/prompts/`. Prompts are:

- **Typed:** accept a structured input, return a string
- **Testable:** can be unit-tested independently of Gemini
- **Versioned:** live in the codebase alongside the code that calls them
- **Category-aware:** generation prompts incorporate category-specific constraints

### Category Generator Pattern

The factory pattern (`category-generator.factory.ts`) selects a generator based on `productCategory`:

```typescript
export function createCategoryGenerator(category: ProductCategory): CategoryGenerator {
  switch (category) {
    case 'furniture': return new FurnitureGenerator();
    case 'clothing':  return new ClothingGenerator();
    // ...
    default:          return new GenericGenerator();
  }
}
```

Each generator builds a prompt tailored to the visual and structural properties of that category (e.g., `FurnitureGenerator` emphasizes structural integrity and proportion accuracy; `ClothingGenerator` emphasizes fabric drape and texture).

### Feedback Loop

`generation_feedback` records user quality ratings (1–5 stars + notes) per conversion. This data:

- Is exposed in the Admin Dashboard for quality monitoring
- Provides ground truth for future prompt refinement
- Helps identify which categories or image types produce poor results

---

## Security Architecture

| Threat | Mitigation |
|---|---|
| API key exposure | `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` only in Worker secrets — never in frontend env |
| Unauthorized data access | RLS on all Supabase tables; anon key used in browser |
| File upload attacks | MIME type validation + size limits in Worker before processing |
| Prompt injection | User-supplied strings are interpolated only into designated template slots; not concatenated into system instructions |
| CORS abuse | `CORS_ORIGIN` env var restricts cross-origin requests |
| XSS | React's JSX escaping; no `dangerouslySetInnerHTML` without sanitization |

---

## Scalability Considerations

**Cloudflare Workers** scale horizontally and automatically — no instance management. Each request runs in an isolated V8 isolate with sub-millisecond cold starts.

**Supabase** scales via connection pooling (PgBouncer) and read replicas. The performance indexes added in migration 016 cover the gallery query (owner + created_at) and conversion polling (status + updated_at).

**AI throughput** is bounded by Gemini API rate limits. Long-running generations use the `generation_jobs` table for async polling — the Worker does not hold the HTTP connection open during the full generation.

**Static assets** (GLB models, product images) are served from Supabase Storage with CDN caching — not from the Worker.

---

## Architectural Decision Records

### ADR-001: Cloudflare Workers for the API

**Decision:** Deploy `apps/api` as a Cloudflare Worker rather than a Node.js server (e.g., on Railway or Fly.io).

**Rationale:** Workers provide global edge distribution, sub-millisecond cold starts, zero infrastructure management, and built-in secret storage. Gemini API latency (5–15s) dominates response time — the compute overhead of a traditional server adds no value.

**Trade-off:** Worker bundle must be a single ESM file; some npm packages with native modules are incompatible.

### ADR-002: Supabase for Auth, Database, and Storage

**Decision:** Use Supabase for all backend persistence instead of separate services.

**Rationale:** Supabase provides PostgreSQL + RLS + Storage + Auth + Realtime in one managed platform with a generous free tier. The `database.types.ts` file provides generated TypeScript types aligned with the schema.

**Trade-off:** Vendor lock-in; migrating to a different database requires re-implementing all repositories and rewriting migrations.

### ADR-003: Ports and Adapters

**Decision:** Define repository and service interfaces in `libs/core`; implement them in `libs/data` and `libs/ai`.

**Rationale:** Enables unit testing domain logic without infrastructure. Makes it possible to swap Supabase or Gemini for different providers without changing business logic.

**Trade-off:** Additional indirection and boilerplate for simple CRUD operations.

### ADR-004: No API framework in the Worker

**Decision:** Use native `Request`/`Response` routing in `server.ts` rather than Hono, itty-router, or another micro-framework.

**Rationale:** The API surface is small (< 10 routes). A framework adds bundle size and an additional dependency to maintain. The native approach is transparent and easy to debug.

**Trade-off:** Requires manual route matching; no built-in middleware system for cross-cutting concerns.

### ADR-005: pnpm Workspaces + Nx

**Decision:** Use pnpm for package management and Nx for monorepo orchestration.

**Rationale:** Nx provides affected-only CI, project graph visualization, caching, and code generators. pnpm's strict symlink model prevents phantom dependency issues common in npm workspaces.

**Trade-off:** Learning curve for contributors unfamiliar with Nx; Nx Cloud required for full distributed CI benefit.
