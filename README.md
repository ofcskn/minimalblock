# Minimal Block

AI-powered 3D product previews for e-commerce. Upload a product photo; get an embeddable GLB model in seconds.

## Architecture

```
apps/
  web/          React + Vite frontend (port 4200)
  api/          Cloudflare Worker API — all Gemini calls live here (port 8787 locally)
  docs/         VitePress bilingual docs (port 5173)
libs/
  ai/           Gemini client, model generator, image analyzer
  core/         Domain models (Product, Conversion, MediaAsset …)
  data/         Supabase repository implementations
  features/     React feature modules
  ui/           Shared component library
```

Gemini is called **server-side only** from `apps/api`. The browser never receives or uses `GEMINI_API_KEY`.

## Quick start

### 1. Install

```bash
pnpm install
```

### 2. Configure web app (root `.env`)

```bash
cp .env.example .env
```

```sh
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_API_BASE_URL=http://localhost:8787
```

### 3. Configure API backend (`apps/api/.env`)

```bash
cp apps/api/.env.example apps/api/.env
```

```sh
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
GEMINI_API_KEY=<your-gemini-api-key>
```

Get `GEMINI_API_KEY` from [aistudio.google.com](https://aistudio.google.com) → **Get API key**.

> **Never** put `GEMINI_API_KEY` in a `VITE_`-prefixed variable — Vite inlines those into the browser bundle.

### 4. Run

```bash
# API + web app together
pnpm nx run-many -t serve -p web api

# Docs site
pnpm nx serve docs
```

| Service | URL |
|---|---|
| Web app | http://localhost:4200 |
| API | http://localhost:8787 |
| Docs | http://localhost:5173 |

---

## Deploy to Cloudflare

`apps/api` runs as a **Cloudflare Worker** with Node.js compatibility enabled.

### Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- `wrangler` CLI (already a dev-dependency — invoked via `npx wrangler`)
- `wrangler login` completed at least once on this machine

### Step 1 — Build the Worker bundle

```bash
pnpm nx build:worker api
```

This produces `dist/apps/api/worker.js` — a single ESM bundle ready for Cloudflare.

### Step 2 — Set secrets

Secrets are **never** stored in `wrangler.toml`. Set them once via the CLI:

```bash
npx wrangler secret put SUPABASE_URL          --cwd apps/api
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --cwd apps/api
npx wrangler secret put GEMINI_API_KEY         --cwd apps/api
npx wrangler secret put CORS_ORIGIN            --cwd apps/api
```

Optional Trendyol secrets:

```bash
npx wrangler secret put TRENDYOL_MERCHANT_ID  --cwd apps/api
npx wrangler secret put TRENDYOL_API_KEY       --cwd apps/api
npx wrangler secret put TRENDYOL_API_SECRET    --cwd apps/api
npx wrangler secret put TRENDYOL_MOCK          --cwd apps/api
```

Or set them all at once in the Cloudflare dashboard:  
**Workers & Pages → minimalblock → Settings → Variables and Secrets**

| Secret | Required | Where to get it |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase dashboard → Settings → API (service role key) |
| `GEMINI_API_KEY` | Yes | [aistudio.google.com](https://aistudio.google.com) → Get API key |
| `CORS_ORIGIN` | No | Your frontend URL, e.g. `https://app.minimalblock.com` |
| `TRENDYOL_MERCHANT_ID` | No | Trendyol Seller Center → Integration → API |
| `TRENDYOL_API_KEY` | No | Trendyol Seller Center |
| `TRENDYOL_API_SECRET` | No | Trendyol Seller Center |
| `TRENDYOL_MOCK` | No | `false` for production, `true` for demo/fixture data |

### Step 3 — Deploy

```bash
# Build and deploy to production
pnpm nx deploy api

# Build and upload a preview version (non-production)
pnpm nx deploy:preview api
```

These Nx targets are defined in `apps/api/project.json` and wrap `wrangler deploy` / `wrangler versions upload`.

### Step 4 — Verify

```bash
curl https://<your-worker-subdomain>.workers.dev/health
# → {"ok":true}
```

### Cloudflare CI/CD (Workers Builds)

When using Cloudflare's built-in CI/CD pipeline (**Workers & Pages → Create → Import a Git repository**), use these settings:

| Field | Value |
|---|---|
| Project name | `minimalblock` |
| Build command | `nx build:worker api` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch deploy command | `npx wrangler versions upload` |
| Root directory | `/` |

Add all secrets from the table above as **Environment Variables** in the Cloudflare dashboard before the first deploy.

### Local Worker dev (optional)

Run the Worker locally with the full Cloudflare runtime (instead of the Node.js HTTP shim):

```bash
# 1. Build the worker bundle first
pnpm nx build:worker api --configuration=development

# 2. Start wrangler dev
pnpm nx cf:dev api
```

This starts the Worker at `http://localhost:8787` using the actual Workers runtime via `wrangler dev`.

---

## Environment variables reference

### Root `.env` (web app)

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon key (safe for browser) |
| `VITE_API_BASE_URL` | Yes | Base URL of `apps/api` |

### `apps/api` secrets (Cloudflare / local `.env`)

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (bypasses RLS — keep secret) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `CORS_ORIGIN` | No | Allowed CORS origin (default: `*`) |
| `TRENDYOL_MERCHANT_ID` | No | Trendyol seller ID |
| `TRENDYOL_API_KEY` | No | Trendyol API key |
| `TRENDYOL_API_SECRET` | No | Trendyol API secret |
| `TRENDYOL_MOCK` | No | `true` to use fixture data instead of live API |

For local development only: `API_PORT` (default `8787`) is read from `.env` by the Node.js dev shim (`main.ts`).

## Common tasks

```bash
# Build all
pnpm nx run-many -t build

# Build Worker bundle only
pnpm nx build:worker api

# Test all
pnpm nx run-many -t test

# Lint all
pnpm nx run-many -t lint

# Type-check all
pnpm nx run-many -t typecheck

# Visualise project graph
pnpm nx graph
```

## Docs

Full documentation (English and Turkish) is in [`docs/`](docs/index.md) and served at http://localhost:5173 when running `pnpm nx serve docs`.

Key guides:

- [Getting Started (EN)](docs/en/tutorials/getting-started.md)
- [API Endpoints Reference (EN)](docs/en/reference/api-endpoints.md)
- [API Endpoints Reference (TR)](docs/tr/reference/api-endpoints.md)
- [Configure Gemini AI (EN)](docs/en/how-to/configure-gemini.md)
- [Configure Supabase (EN)](docs/en/how-to/configure-supabase.md)
- [AI Pipeline Explanation (EN)](docs/en/explanation/ai-pipeline.md)
