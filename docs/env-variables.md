# Environment Variables

This page documents every environment variable used across the monorepo.

---

## Web App — Root `.env`

Variables prefixed with `VITE_` are inlined into the browser bundle by Vite at build time. They are publicly visible to anyone who inspects the bundle. Only safe-for-public values belong here.

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon (publishable) key | `sb_publishable_eyJ...` |
| `VITE_API_BASE_URL` | Yes | Base URL of `apps/api` | `http://localhost:8787` (dev) / `https://mbapi.conectlens.com` (prod) |

### Setup

```bash
cp .env.example .env
# Edit .env with your values
```

**Where to find Supabase values:**
1. Open [supabase.com](https://supabase.com) → Your project
2. Go to **Project Settings → API**
3. Copy **Project URL** → `VITE_SUPABASE_URL`
4. Copy **anon / public** key → `VITE_SUPABASE_ANON_KEY`

---

## API Worker — `apps/api/.env` (local) or Cloudflare Secrets (production)

These variables are **server-side only** and must never be exposed to the browser. In production they are stored as encrypted Cloudflare Worker secrets, not in `wrangler.toml`.

### Core secrets (all required)

| Variable | Description | Where to get |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — bypasses Row-Level Security | Supabase → Project Settings → API → service_role key |
| `GEMINI_API_KEY` | Google Gemini API key | [aistudio.google.com](https://aistudio.google.com) → Get API key |

> **Warning:** The service role key bypasses all RLS policies. It must never appear in client-side code or be committed to version control.

### Optional configuration

| Variable | Default | Description |
|---|---|---|
| `CORS_ORIGIN` | `*` | Restrict CORS to a specific origin (e.g., `https://app.minimalblock.com`) |
| `API_PORT` | `8787` | Port for the local Node.js dev shim (`main.ts` only — not used in production) |

### Trendyol integration (optional)

| Variable | Description |
|---|---|
| `TRENDYOL_MERCHANT_ID` | Trendyol seller/merchant ID |
| `TRENDYOL_API_KEY` | Trendyol API key |
| `TRENDYOL_API_SECRET` | Trendyol API secret |
| `TRENDYOL_MOCK` | Set to `true` to use fixture data instead of the live Trendyol API |

### Local setup

```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env
```

### Production — set Cloudflare secrets

```bash
npx wrangler secret put SUPABASE_URL            --cwd apps/api
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --cwd apps/api
npx wrangler secret put GEMINI_API_KEY           --cwd apps/api
npx wrangler secret put CORS_ORIGIN              --cwd apps/api

# Optional
npx wrangler secret put TRENDYOL_MERCHANT_ID     --cwd apps/api
npx wrangler secret put TRENDYOL_API_KEY         --cwd apps/api
npx wrangler secret put TRENDYOL_API_SECRET      --cwd apps/api
npx wrangler secret put TRENDYOL_MOCK            --cwd apps/api
```

Or set them in the Cloudflare Dashboard: **Workers & Pages → minimalblock → Settings → Variables and Secrets**

---

## Security Rules

1. **Never use `VITE_` prefix for secrets.** Vite inlines `VITE_*` variables into the browser bundle.
2. **Never commit `.env` files** — they are in `.gitignore`.
3. **Never put `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` in `wrangler.toml`** — use `wrangler secret put`.
4. **Rotate credentials immediately** if they are accidentally committed. Invalidate the old key at the provider and generate a new one.

---

## Full `.env.example` (root)

```env
# Supabase — get from: supabase.com → Project Settings → API
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>

# API base URL
VITE_API_BASE_URL=http://localhost:8787
```

## Full `apps/api/.env.example`

```env
# Supabase service role (bypasses RLS — never expose to browser)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Google Gemini
GEMINI_API_KEY=<your-gemini-api-key>

# CORS (optional — restrict to your frontend domain)
CORS_ORIGIN=http://localhost:4200

# Local dev only
API_PORT=8787

# Trendyol (optional)
TRENDYOL_MERCHANT_ID=
TRENDYOL_API_KEY=
TRENDYOL_API_SECRET=
TRENDYOL_MOCK=true
```
