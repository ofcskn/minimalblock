# Minimal Block

AI-powered 3D product previews for e-commerce. Upload a product photo; get an embeddable GLB model in seconds.

## Architecture

```
apps/
  web/          React + Vite frontend (port 4200)
  api/          Node.js HTTP API — all Gemini calls live here (port 8787)
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

## Environment variables reference

### Root `.env` (web app)

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon key (safe for browser) |
| `VITE_API_BASE_URL` | Yes | Base URL of `apps/api` |

### `apps/api/.env` (backend)

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (bypasses RLS — keep secret) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `API_PORT` | No | Server port (default: `8787`) |
| `CORS_ORIGIN` | No | Allowed CORS origin (default: `*`) |

## Common tasks

```bash
# Build all
pnpm nx run-many -t build

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
- [Configure Gemini AI (EN)](docs/en/how-to/configure-gemini.md)
- [Configure Supabase (EN)](docs/en/how-to/configure-supabase.md)
- [AI Pipeline Explanation (EN)](docs/en/explanation/ai-pipeline.md)
