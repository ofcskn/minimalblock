# Minimal Block

> **AI-powered 3D product previews for e-commerce.** Upload a 2D product photo; receive an embeddable, interactive GLB model in seconds — powered by Google Gemini, hosted on Cloudflare Workers, backed by Supabase.

[![CI](https://github.com/ofcskn/minimalblock/actions/workflows/ci.yml/badge.svg)](https://github.com/ofcskn/minimalblock/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.30-F69220?logo=pnpm)](https://pnpm.io/)
[![Nx](https://img.shields.io/badge/Nx-22.7-143055?logo=nx)](https://nx.dev/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
  - [Monorepo Structure](#monorepo-structure)
  - [System Diagram](#system-diagram)
  - [Data Flow](#data-flow)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Run Locally](#run-locally)
- [Environment Variables Reference](#environment-variables-reference)
- [Supabase Setup](#supabase-setup)
  - [Database Schema](#database-schema)
  - [Storage](#storage)
  - [Row-Level Security](#row-level-security)
- [AI Integration](#ai-integration)
  - [Gemini Pipeline](#gemini-pipeline)
  - [Category Generators](#category-generators)
  - [Prompt Engineering](#prompt-engineering)
- [API Reference](#api-reference)
- [Development Workflow](#development-workflow)
  - [Common Commands](#common-commands)
  - [Testing](#testing)
  - [Linting & Formatting](#linting--formatting)
  - [Project Graph](#project-graph)
- [Deployment](#deployment)
  - [Cloudflare Workers (API)](#cloudflare-workers-api)
  - [Frontend (Static SPA)](#frontend-static-spa)
  - [CI/CD Pipeline](#cicd-pipeline)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Contributing](#contributing)
- [Security](#security)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Minimal Block turns a flat product photograph into a fully interactive 3D model that merchants can embed directly in their storefront or share via a QR code — no 3D modelling expertise required.

The system uses **Google Gemini** multimodal AI for visual analysis, geometry classification, material inference, and GLB generation. All AI calls happen **server-side only** inside a Cloudflare Worker — the browser never touches the Gemini API key.

**Target users:**
- E-commerce merchants wanting immersive product pages without a 3D design team
- Developers integrating 3D previews into existing storefronts
- Marketplace sellers on platforms like Trendyol, IKEA, and Amazon

---

## Features

| Feature | Description |
|---|---|
| **One-click 3D generation** | Upload a product photo → receive a GLB model in seconds |
| **AI image analysis** | Gemini analyzes geometry, materials, lighting, and quality |
| **Category-aware generation** | Specialized generators for furniture, clothing, electronics, jewelry, vehicles, and packaging |
| **Interactive hotspots** | Add clickable callouts to 3D models (positions, labels, links) |
| **Brand placement** | Embed logo/watermark onto generated models |
| **AI diagnosis panel** | Readiness score for source images before generation |
| **Multi-product detection** | Identify and separate clustered items in a single photo |
| **Product import** | Scrape metadata & images from Trendyol, IKEA, Amazon, and generic URLs |
| **Embeddable viewer** | `<model-viewer>` web component — works in any HTML page |
| **QR code sharing** | Generate scannable codes to any public model URL |
| **Analytics events** | Track views, conversions, and interactions |
| **Bilingual UI** | Full English and Turkish interface |
| **Row-Level Security** | All data scoped to the authenticated owner |

---

## Architecture

### Monorepo Structure

This repository is an **Nx monorepo** managed with **pnpm workspaces**.

```
minimalblock/
├── apps/
│   ├── web/          # React 19 + Vite SPA (port 4200)
│   ├── api/          # Cloudflare Worker HTTP API (port 8787 locally)
│   └── docs/         # VitePress bilingual documentation site (port 5173)
│
├── libs/
│   ├── core/         # Domain layer — entities, value objects, ports (no framework deps)
│   ├── data/         # Supabase repository implementations
│   ├── ai/           # Gemini clients, generators, prompts, validation
│   ├── features/     # React feature hooks (upload, auth, gallery, conversion)
│   ├── ui/           # Shared component library (Tailwind + React)
│   └── trendyol/     # Trendyol marketplace integration
│
├── supabase/
│   ├── migrations/   # 16 sequential SQL migrations
│   └── config.toml   # Supabase CLI configuration
│
├── docs/             # Static documentation (Diátaxis: tutorials/how-to/explanation/reference)
│   ├── en/           # 30 English documentation pages
│   └── tr/           # 19 Turkish documentation pages
│
└── .github/
    ├── workflows/    # GitHub Actions CI/CD
    └── ISSUE_TEMPLATE/
```

### System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (apps/web)                   │
│  React 19 + React Router + React Query + i18next        │
│  Tailwind CSS • model-viewer WebComponent • QR codes    │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Worker (apps/api)                │
│  Node.js compatibility • Web Standard Request/Response  │
│                                                         │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │   Pipelines  │   │   Adapters   │   │  Orchestrator│ │
│  │ autofill     │   │ trendyol     │   │ import flow  │ │
│  │ material     │   │ ikea         │   │ job tracking │ │
│  │ cluster      │   │ amazon       │   └─────────────┘ │
│  │ image-intel  │   │ generic      │                   │
│  │ image-upload │   └──────────────┘                   │
│  │ product-intel│                                      │
│  └─────────────┘                                        │
└───────┬───────────────────────────────┬─────────────────┘
        │                               │
        ▼                               ▼
┌──────────────┐               ┌─────────────────┐
│ Google Gemini │               │    Supabase      │
│ 2.0 Flash API │               │ PostgreSQL + RLS │
│               │               │ Storage (CDN)   │
│ • Image anal. │               │ Auth (JWT)      │
│ • 3D gen.    │               │                 │
│ • Materials  │               └─────────────────┘
│ • Geometry   │
└──────────────┘
```

### Data Flow

```
1. User uploads product photo
       │
       ▼
2. Worker receives file → stores in Supabase Storage
       │
       ▼
3. Gemini image-analyzer extracts visual features
   (geometry, materials, lighting quality, category)
       │
       ▼
4. Category-specific generator builds 3D prompt
   (furniture / clothing / electronics / jewelry / vehicle / packaging)
       │
       ▼
5. Gemini generates GLB model bytes
       │
       ▼
6. GLB validation (schema + scene graph integrity)
       │
       ▼
7. GLB stored in Supabase Storage → signed URL returned
       │
       ▼
8. Conversion record written to database (status: completed)
       │
       ▼
9. Browser renders interactive model via <model-viewer>
       │
       ▼
10. User adds hotspots, brand placement, and publishes
```

---

## Tech Stack

### Frontend (`apps/web`)

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| React Router | 6.30 | Client-side routing |
| React Query (TanStack) | 5 | Server state management |
| TanStack Virtual | 3.13 | Virtualized lists |
| Tailwind CSS | 3.4 | Utility-first styling |
| i18next | 26 | Internationalization |
| react-i18next | 17 | React i18n bindings |
| model-viewer | (web component) | 3D GLB renderer |
| qrcode | 1.5.4 | QR code generation |
| Vitest | 4.1 | Frontend unit testing |
| Testing Library | 16 | React component testing |

### Backend (`apps/api`)

| Technology | Purpose |
|---|---|
| Cloudflare Workers | Serverless compute (Node.js compat mode) |
| Google Gemini 2.0 Flash | Multimodal AI for 3D generation & analysis |
| Supabase JS | Database client + storage + auth |
| Web Standard Request/Response | Framework-free HTTP routing |
| esbuild | Worker bundle compilation |
| wrangler | Cloudflare Workers CLI |
| Jest 30 | Backend unit testing |

### Infrastructure & Tooling

| Technology | Purpose |
|---|---|
| Nx 22.7 | Monorepo orchestration, distributed caching |
| pnpm 10 | Package management |
| TypeScript 5.9 | Language (strict mode) |
| ESLint 9 | Linting |
| Prettier 3 | Formatting |
| GitHub Actions | CI/CD |
| Nx Cloud | Distributed test execution |
| VitePress 2 | Documentation site |

---

## Quick Start

### Prerequisites

| Requirement | Minimum | Notes |
|---|---|---|
| Node.js | 20.x | Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) |
| pnpm | 10.30.3 | `npm install -g pnpm@10.30.3` |
| Supabase account | — | [supabase.com](https://supabase.com) |
| Google Gemini API key | — | [aistudio.google.com](https://aistudio.google.com) |
| Cloudflare account | For deploy only | [dash.cloudflare.com](https://dash.cloudflare.com) |

### Installation

```bash
# Clone the repository
git clone https://github.com/ofcskn/minimalblock.git
cd minimalblock

# Install all workspace dependencies
pnpm install
```

### Environment Setup

#### Step 1 — Web app environment (root `.env`)

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_API_BASE_URL=http://localhost:8787
```

> **Where to find these values:** Supabase dashboard → Project Settings → API

#### Step 2 — API backend environment (`apps/api/.env`)

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
GEMINI_API_KEY=<your-gemini-api-key>

# Optional — restricts CORS to your frontend domain
CORS_ORIGIN=http://localhost:4200

# Optional — Trendyol marketplace integration
TRENDYOL_MERCHANT_ID=
TRENDYOL_API_KEY=
TRENDYOL_API_SECRET=
TRENDYOL_MOCK=true
```

> **Security:** `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must **never** appear in `VITE_`-prefixed variables. Vite inlines those into the browser bundle. The Worker is the only service that should hold these secrets.

#### Step 3 — Apply Supabase migrations

```bash
# Install Supabase CLI (once)
npm install -g supabase

# Link to your project
supabase link --project-ref <project-ref>

# Apply all 16 migrations
supabase db push
```

### Run Locally

```bash
# Start web app + API together (recommended)
pnpm nx run-many -t serve -p web api

# Start docs site separately
pnpm nx serve docs
```

| Service | URL | Description |
|---|---|---|
| Web app | http://localhost:4200 | React SPA |
| API | http://localhost:8787 | Cloudflare Worker (Node.js shim) |
| Docs | http://localhost:5173 | VitePress documentation |

---

## Environment Variables Reference

### Root `.env` (web app — VITE_ prefix)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon key (safe for browser) | `sb_publishable_...` |
| `VITE_API_BASE_URL` | Yes | Base URL of `apps/api` | `http://localhost:8787` |

### `apps/api` Secrets (Cloudflare / local `.env`)

| Variable | Required | Description | Where to get |
|---|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (bypasses RLS) | Supabase → Settings → API |
| `GEMINI_API_KEY` | Yes | Google Gemini API key | [aistudio.google.com](https://aistudio.google.com) → Get API key |
| `CORS_ORIGIN` | No | Allowed CORS origin (default: `*`) | Your frontend URL |
| `TRENDYOL_MERCHANT_ID` | No | Trendyol seller ID | Trendyol Seller Center → API |
| `TRENDYOL_API_KEY` | No | Trendyol API key | Trendyol Seller Center |
| `TRENDYOL_API_SECRET` | No | Trendyol API secret | Trendyol Seller Center |
| `TRENDYOL_MOCK` | No | Use fixture data instead of live API | `true` / `false` |
| `API_PORT` | No (local only) | Node.js dev shim port | `8787` |

---

## Supabase Setup

### Database Schema

The database is managed through 16 sequential migrations in `supabase/migrations/`.

**Core tables:**

```
products              — User product inventory
conversions           — 2D-to-3D conversion jobs & results
hotspots              — Interactive model annotations
hotspots_suggested    — AI-recommended hotspot positions
ai_insights           — Extracted product intelligence
generation_jobs       — Long-running Gemini job tracking
generation_feedback   — User quality ratings
events                — Analytics event stream
conversion_source_assets — Source image metadata & readiness scores
brand_placement       — Logo/watermark placement data
commerce_categories   — E-commerce product taxonomy
```

**Key columns in `conversions`:**

| Column | Type | Description |
|---|---|---|
| `status` | enum | `pending` / `processing` / `completed` / `failed` |
| `source_asset_url` | text | Signed URL to the input image |
| `output_asset_url` | text | Signed URL to the generated GLB |
| `error_message` | text | Failure reason if status is `failed` |

Run migrations:

```bash
# Apply all pending migrations
supabase db push

# Reset to a clean state (destructive — dev only)
supabase db reset
```

### Storage

One storage bucket is used: **`media-assets`** (public CDN).

```
media-assets/
└── <owner-id>/
    ├── <uuid>.jpg        ← source product photos
    └── <uuid>.glb        ← generated GLB models
```

Files are organized by `owner_id` to enforce ownership at the storage level in addition to database RLS.

### Row-Level Security

All tables enforce RLS. The typical policy pattern:

```sql
-- Read: owner only
CREATE POLICY "owner_select" ON products
  FOR SELECT USING (auth.uid() = owner_id);

-- Insert: authenticated users for their own records
CREATE POLICY "owner_insert" ON products
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
```

Public product pages use a separate `public` schema view that exposes only explicitly shared records.

---

## AI Integration

### Gemini Pipeline

All AI processing happens inside `apps/api` — Gemini credentials are **never** sent to the browser.

```
Input photo
    │
    ▼
gemini-image-analyzer         ← visual features, quality assessment
    │
    ▼
gemini-geometry-classifier    ← shape & structural analysis
    │
    ▼
gemini-product-understanding  ← metadata extraction (name, materials, category)
    │
    ▼
category-generator.factory    ← selects specialized generator
    │
    ├── furniture.generator
    ├── clothing.generator
    ├── electronics.generator
    ├── jewelry.generator
    ├── vehicle.generator
    └── packaging.generator
    │
    ▼
gemini-3d-generator           ← GLB model generation
    │
    ▼
glb-validator                 ← schema + scene graph integrity check
    │
    ▼
Supabase Storage              ← GLB stored, signed URL returned
```

**Additional AI capabilities:**

| Module | Purpose |
|---|---|
| `gemini-product-intelligence-agent` | Market research & competitive analysis |
| `gemini-visual-qa` | Visual question answering on product images |
| `gemini-risk-analyzer` | Product return risk scoring |
| `image-deduplication.service` | Detect duplicate source images |

### Category Generators

Each product category uses a tailored 3D generation strategy:

| Generator | Category | Key considerations |
|---|---|---|
| `furniture.generator` | Chairs, tables, sofas | Structural integrity, proportions |
| `clothing.generator` | Apparel & accessories | Fabric drape, texture |
| `electronics.generator` | Devices & gadgets | Hard surfaces, ports, buttons |
| `jewelry.generator` | Rings, necklaces, watches | Metallic reflections, gemstones |
| `vehicle.generator` | Cars, bikes, scooters | Scale, wheel geometry |
| `packaging.generator` | Boxes, bottles, containers | Label placement, openings |

### Prompt Engineering

Prompts are TypeScript template functions in `libs/ai/src/lib/prompts/`. Each prompt:

- Takes a typed input object
- Returns a string instruction for Gemini
- Is versioned alongside the codebase

Key prompt files:

```
convert-2d-to-3d.prompt.ts          ← Core GLB generation instruction
product-understanding.prompt.ts     ← Metadata extraction
material-inference.prompt.ts        ← Surface material analysis
geometry-classification.prompt.ts   ← Shape & structural classification
deep-product-autofill.prompt.ts     ← E-commerce attribute extraction
return-risk-analysis.prompt.ts      ← Quality/return risk scoring
scene-graph-reconstruction.prompt.ts ← Spatial relationship mapping
multi-product-detection.prompt.ts   ← Cluster / bundle detection
```

---

## API Reference

The API (`apps/api`) exposes a lightweight HTTP API with no third-party framework. All routes are defined in `src/lib/server.ts`.

**Base URL:** `http://localhost:8787` (local) / `https://mbapi.conectlens.com` (production)

### Health check

```
GET /health
→ { "ok": true }
```

### Product import

```
POST /import
Content-Type: application/json

{
  "url": "https://www.trendyol.com/product/..."
}

→ {
  "product": { ... },
  "images": [ ... ],
  "metadata": { ... }
}
```

### Generate 3D model

```
POST /convert
Content-Type: multipart/form-data

Fields:
  file        — product image (JPEG/PNG/WebP, max 10MB)
  productId   — UUID of the associated product

→ {
  "conversionId": "uuid",
  "status": "processing",
  "jobId": "uuid"
}
```

### Conversion status

```
GET /convert/:conversionId
Authorization: Bearer <supabase-jwt>

→ {
  "id": "uuid",
  "status": "completed",
  "outputUrl": "https://...",
  "error": null
}
```

> Full API documentation is available in [`docs/en/reference/api-endpoints.md`](docs/en/reference/api-endpoints.md) and in the running docs site at http://localhost:5173.

---

## Development Workflow

### Common Commands

```bash
# ─── Development Servers ────────────────────────────────────────
pnpm nx run-many -t serve -p web api   # Web + API together
pnpm nx serve web                      # Web only (port 4200)
pnpm nx serve api                      # API only (port 8787)
pnpm nx serve docs                     # Docs site (port 5173)

# ─── Building ───────────────────────────────────────────────────
pnpm nx run-many -t build              # Build all projects
pnpm nx build web                      # Build SPA only
pnpm nx build:worker api               # Build Cloudflare Worker bundle

# ─── Testing ────────────────────────────────────────────────────
pnpm nx run-many -t test               # Run all tests
pnpm nx test core                      # Test a specific library
pnpm nx test web --watch               # Watch mode

# ─── Code Quality ───────────────────────────────────────────────
pnpm nx run-many -t lint               # Lint all projects
pnpm nx run-many -t typecheck          # Type-check all projects
pnpm nx format:check                   # Check formatting
pnpm nx format:write                   # Auto-fix formatting

# ─── Nx Utilities ───────────────────────────────────────────────
pnpm nx graph                          # Visualize project dependency graph
pnpm nx affected -t test               # Test only affected projects
pnpm nx reset                          # Clear Nx cache
```

### Testing

**Unit tests** use Vitest (frontend) and Jest (backend).

```bash
# Run all tests
pnpm nx run-many -t test

# Run tests for a specific library
pnpm nx test ai
pnpm nx test core
pnpm nx test data

# Run with coverage
pnpm nx test core --coverage

# Watch mode during development
pnpm nx test web --watch
```

**Test file conventions:**
- Unit tests: `*.spec.ts` / `*.spec.tsx`
- Co-located with the module under test
- No database calls in unit tests — use mock repositories from `libs/ai/src/lib/mock/`

### Linting & Formatting

```bash
# Lint all (ESLint 9 flat config)
pnpm nx run-many -t lint

# Auto-fix lint issues
pnpm nx run-many -t lint --fix

# Check formatting (Prettier 3)
pnpm nx format:check

# Auto-fix formatting
pnpm nx format:write
```

ESLint config: `eslint.config.mjs`  
Prettier config: `.prettierrc`

### Project Graph

Visualize library dependencies:

```bash
pnpm nx graph
```

This opens an interactive browser showing how `apps/` and `libs/` depend on each other — essential for understanding which changes are `affected`.

**Dependency direction (no cycles allowed):**

```
apps/web ──→ libs/features ──→ libs/core
apps/web ──→ libs/ui       ──→ libs/core
apps/api ──→ libs/ai       ──→ libs/core
apps/api ──→ libs/data     ──→ libs/core
```

---

## Deployment

### Cloudflare Workers (API)

`apps/api` is deployed as a **Cloudflare Worker** with Node.js compatibility enabled.

#### Prerequisites

- Cloudflare account with a configured worker named `minimalblock`
- `wrangler login` completed: `npx wrangler login`

#### Step 1 — Build the Worker bundle

```bash
pnpm nx build:worker api
# Output: dist/apps/api/worker.js (single ESM bundle)
```

#### Step 2 — Set secrets

Secrets are **never** stored in `wrangler.toml`. Set them once via CLI:

```bash
npx wrangler secret put SUPABASE_URL            --cwd apps/api
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --cwd apps/api
npx wrangler secret put GEMINI_API_KEY           --cwd apps/api
npx wrangler secret put CORS_ORIGIN              --cwd apps/api
```

Or configure in the Cloudflare Dashboard: **Workers & Pages → minimalblock → Settings → Variables and Secrets**

#### Step 3 — Deploy

```bash
# Production deploy
pnpm nx deploy api

# Preview deploy (non-production version)
pnpm nx deploy:preview api
```

#### Step 4 — Verify

```bash
curl https://<your-worker-subdomain>.workers.dev/health
# → {"ok":true}
```

#### Local Worker dev (wrangler runtime)

```bash
# Build in development mode
pnpm nx build:worker api --configuration=development

# Start with actual Cloudflare runtime
pnpm nx cf:dev api
# → http://localhost:8787
```

### Frontend (Static SPA)

`apps/web` builds to a static SPA deployable to any CDN (Vercel, Netlify, Cloudflare Pages, AWS S3, etc.).

```bash
# Build the SPA
pnpm nx build web
# Output: dist/apps/web/

# Preview the build locally
pnpm nx preview web
```

Set the environment variables (`VITE_*`) in your CDN's environment configuration before the first deploy.

#### Cloudflare Pages (recommended)

| Field | Value |
|---|---|
| Build command | `pnpm nx build web` |
| Output directory | `dist/apps/web` |
| Root directory | `/` |
| Node.js version | `20.x` |

#### Cloudflare Workers Builds (API CI/CD)

| Field | Value |
|---|---|
| Build command | `nx build:worker api` |
| Deploy command | `npx wrangler deploy --config apps/api/wrangler.toml` |
| Preview deploy command | `npx wrangler versions upload --config apps/api/wrangler.toml` |
| Root directory | `/` |

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to `main` and every pull request.

**Pipeline steps:**

1. Checkout with full history (Nx affected detection requires git history)
2. Restore pnpm cache
3. Install dependencies (`pnpm install --frozen-lockfile`)
4. Start Nx Cloud distributed agents (3× linux-medium-js)
5. Run affected: `format:check`, `lint`, `typecheck`, `test`, `build`
6. Auto-fix CI suggestions

**Nx Cloud** distributes work across parallel agents — typically completes in 2–4 minutes.

---

## Performance

### Frontend

- **Code splitting:** Vite + Rollup manual chunk config splits vendor, Supabase, and feature code
- **Virtualization:** `@tanstack/react-virtual` for large product galleries
- **Lazy loading:** All route components are dynamically imported
- **3D models:** `<model-viewer>` defers WebGL initialization until visible

### API

- **Cold start:** Cloudflare Worker cold starts are sub-millisecond (V8 isolates)
- **Gemini latency:** 3D generation typically takes 5–15 seconds depending on model complexity
- **Supabase queries:** Performance indexes added in migration 016 for frequent query patterns

### Database (migration 016)

```sql
-- Index on owner_id + created_at for gallery queries
CREATE INDEX idx_products_owner_created ON products(owner_id, created_at DESC);

-- Index on conversion status for polling
CREATE INDEX idx_conversions_status ON conversions(status, updated_at DESC);
```

---

## Troubleshooting

### "Cannot connect to API" (CORS error in browser)

Set `CORS_ORIGIN` in `apps/api/.env` to match your frontend URL:

```env
CORS_ORIGIN=http://localhost:4200
```

### "Gemini API key not found"

Ensure `GEMINI_API_KEY` is set in `apps/api/.env` — **not** in root `.env`. The root `.env` is for `VITE_*` variables only.

### "Supabase RLS policy violation"

The user must be authenticated before any database operation. Check that:
1. `VITE_SUPABASE_ANON_KEY` is correct in root `.env`
2. The user has completed the sign-up/sign-in flow

### "GLB validation failed"

The generated GLB failed the scene graph integrity check. This usually means:
- Source image quality was too low (blurry, dark, or cluttered)
- Run through the **AI Diagnosis Panel** first to check `readinessScore`
- A score ≥ 0.7 is recommended before triggering generation

### "pnpm install fails"

Ensure you are using the correct pnpm version:

```bash
npm install -g pnpm@10.30.3
pnpm install
```

### Nx cache issues

```bash
# Reset Nx local cache
pnpm nx reset

# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

### Worker fails to build

```bash
# Check TypeScript errors first
pnpm nx typecheck api

# Then build
pnpm nx build:worker api
```

### Supabase migrations fail

```bash
# Check current migration status
supabase db diff

# Reset and reapply all migrations (dev only — destructive)
supabase db reset
```

---

## FAQ

**Q: Can I use a different AI provider instead of Gemini?**  
A: The `libs/core` ports define `ModelGeneratorPort`. Implement this interface with any provider (OpenAI, Anthropic, etc.) and register it in the API. The Gemini implementation lives entirely in `libs/ai`.

**Q: Is the 3D generation deterministic?**  
A: No — Gemini generation is probabilistic. Results will vary between runs for the same input. The feedback system (`generation_feedback` table) lets users rate quality to help track regressions.

**Q: What file formats are supported for source images?**  
A: JPEG, PNG, and WebP. Maximum file size is 10 MB. Run images through the AI Diagnosis Panel for a pre-flight quality check.

**Q: Can I self-host instead of using Cloudflare Workers?**  
A: Yes. The Worker is standard Node.js-compatible code. Run `apps/api/src/main.ts` directly with Node.js for a local/VPS deployment. You lose the global CDN edge distribution but retain all functionality.

**Q: How do I add a new product category?**  
A: Create a new generator in `libs/ai/src/lib/generators/`, add it to the factory in `category-generator.factory.ts`, and add the category to `libs/core/src/lib/utils/categories.ts`.

**Q: Where is the i18n configuration?**  
A: `apps/web/src/i18n/index.ts` initializes i18next. Translation strings are in `apps/web/src/i18n/locales/en.ts` and `tr.ts`.

---

## Contributing

We welcome contributions of all kinds — bug fixes, new features, documentation improvements, and translations.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide, including:
- Local development setup
- Coding standards and TypeScript conventions
- Commit message format
- Branch naming and PR process
- Testing requirements

---

## Security

To report a security vulnerability, **do not open a public GitHub issue**. Email **ofcskn1@gmail.com** privately.

See [.github/SECURITY.md](.github/SECURITY.md) for the full disclosure policy, scope, and response timeline.

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the planned feature set and delivery timeline.

---

## License

MIT © [Ömer Faruk Coşkun](https://github.com/ofcskn)

See [LICENSE](LICENSE) for the full license text.
