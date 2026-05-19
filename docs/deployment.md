# Deployment Guide

This guide covers deploying all three applications in the Minimal Block monorepo to production.

---

## Overview

| Application | Deployment target | Command |
|---|---|---|
| `apps/api` | Cloudflare Workers | `pnpm nx deploy api` |
| `apps/web` | Any static CDN (Cloudflare Pages recommended) | `pnpm nx build web` |
| `apps/docs` | Any static CDN | `pnpm nx build docs` |

---

## Prerequisites

- pnpm 10.30.3 and Node.js 20.x installed
- Cloudflare account with `wrangler login` completed
- Supabase project with migrations applied
- Gemini API key

---

## 1. Supabase Setup

Before deploying, ensure your Supabase project is configured:

```bash
# Link to your project (one-time)
supabase link --project-ref <project-ref>

# Apply all migrations
supabase db push

# Generate fresh TypeScript types after schema changes
supabase gen types typescript --project-id <project-ref> \
  > libs/data/src/lib/supabase/database.types.ts
```

Create the `media-assets` storage bucket if it does not exist:

1. Supabase dashboard → Storage → Create bucket
2. Name: `media-assets`
3. Public bucket: **Yes**
4. Set policies: authenticated users can upload/delete their own files; public read for all

---

## 2. Cloudflare Worker (apps/api)

### Build

```bash
pnpm nx build:worker api
# Output: dist/apps/api/worker.js (single ESM bundle, ~200–400 KB)
```

### Set secrets (one-time per environment)

```bash
npx wrangler secret put SUPABASE_URL            --cwd apps/api
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --cwd apps/api
npx wrangler secret put GEMINI_API_KEY           --cwd apps/api
npx wrangler secret put CORS_ORIGIN              --cwd apps/api
```

For Trendyol integration (optional):

```bash
npx wrangler secret put TRENDYOL_MERCHANT_ID     --cwd apps/api
npx wrangler secret put TRENDYOL_API_KEY         --cwd apps/api
npx wrangler secret put TRENDYOL_API_SECRET      --cwd apps/api
npx wrangler secret put TRENDYOL_MOCK            --cwd apps/api
```

### Deploy to production

```bash
pnpm nx deploy api
```

### Deploy preview version

```bash
pnpm nx deploy:preview api
```

Preview deployments upload a new version without routing production traffic to it, allowing staged rollouts.

### Verify

```bash
curl https://<worker-name>.<account>.workers.dev/health
# Expected: {"ok":true}
```

### Cloudflare Dashboard CI/CD

To use Cloudflare's built-in CI/CD (Workers Builds):

1. Workers & Pages → Create → Import a Git repository
2. Connect the `minimalblock` repository
3. Configure build settings:

| Field | Value |
|---|---|
| Project name | `minimalblock` |
| Build command | `npx nx build:worker api` |
| Deploy command | `npx wrangler deploy --config apps/api/wrangler.toml` |
| Preview deploy command | `npx wrangler versions upload --config apps/api/wrangler.toml` |
| Root directory | `/` |
| Node.js version | `20.x` |

Add all secrets as environment variables in the Cloudflare Dashboard before the first deployment.

---

## 3. Frontend SPA (apps/web)

The web app builds to a static SPA. Deploy the `dist/apps/web/` directory to any CDN.

```bash
# Set production environment variables
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_API_BASE_URL=https://<worker>.<account>.workers.dev

# Build
pnpm nx build web
# Output: dist/apps/web/
```

### Cloudflare Pages (recommended)

1. Pages → Create → Connect to Git
2. Select the `minimalblock` repository
3. Build settings:

| Field | Value |
|---|---|
| Framework preset | None (custom) |
| Build command | `pnpm nx build web` |
| Output directory | `dist/apps/web` |
| Root directory | `/` |
| Node.js version | `20.x` |

4. Add environment variables (`VITE_*`) in Pages → Settings → Environment variables

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd dist/apps/web
vercel --prod
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
pnpm nx build web
netlify deploy --prod --dir dist/apps/web
```

### SPA routing

The app uses client-side routing. Configure your CDN to redirect all 404s to `index.html`:

**Cloudflare Pages:** Handled automatically.

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache:**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ /index.html [L]
```

---

## 4. Documentation Site (apps/docs)

```bash
pnpm nx build docs
# Output: apps/docs/src/.vitepress/dist/
```

Deploy `apps/docs/src/.vitepress/dist/` to any static host. No special routing configuration is needed — VitePress generates a fully static site with no client-side routing fallback requirements.

---

## 5. CI/CD via GitHub Actions

The workflow in `.github/workflows/ci.yml` runs on every push to `main` and every pull request.

### What it does

1. Checks out the repository with full git history (required for Nx affected detection)
2. Restores pnpm cache
3. Installs dependencies with `--frozen-lockfile`
4. Starts 3 Nx Cloud distributed agents
5. Runs affected: `format:check`, `lint`, `typecheck`, `test`, `build`

### Nx Cloud

Nx Cloud distributes test execution across agents. Set the `NX_CLOUD_AUTH_TOKEN` secret in GitHub repository settings → Secrets → Actions.

Without Nx Cloud, runs complete sequentially. The CI still works; it just takes longer.

### Deployment from CI

To trigger production deployments from the CI pipeline, add deployment steps after the build:

```yaml
- name: Deploy Worker
  if: github.ref == 'refs/heads/main'
  run: pnpm nx deploy api
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

Required secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

---

## 6. Database Migrations in CI

For automated migration deployment, add a migration step:

```yaml
- name: Apply Supabase migrations
  run: supabase db push --linked
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
    SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

> Always apply migrations to a staging environment first. Never run `supabase db reset` in CI against a production database.

---

## 7. Environment Checklist Before First Deploy

- [ ] Supabase project created and migrations applied
- [ ] `media-assets` storage bucket created and policies set
- [ ] Cloudflare Worker secrets set (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `CORS_ORIGIN`)
- [ ] Frontend environment variables set (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`)
- [ ] `VITE_API_BASE_URL` points to the production Worker URL
- [ ] `CORS_ORIGIN` Worker secret matches the production frontend URL
- [ ] Health check passes: `curl https://<worker>/health`

---

## 8. Rollback

### Worker rollback

Cloudflare Workers versioning allows instant rollback:

```bash
# List versions
npx wrangler versions list --cwd apps/api

# Rollback to a previous version
npx wrangler rollback --cwd apps/api
```

### Frontend rollback

Re-deploy the previous build artifact, or revert the Git commit and trigger a new CI build.

### Database rollback

Supabase does not support automatic migration rollback. Write a reverse migration manually:

```sql
-- 017_rollback_016.sql
DROP INDEX IF EXISTS idx_products_owner_created;
DROP INDEX IF EXISTS idx_conversions_status;
```

Apply with `supabase db push`.

---

## 9. Monitoring

| What | Where |
|---|---|
| Worker logs | Cloudflare Dashboard → Workers & Pages → minimalblock → Logs |
| Worker metrics (requests, errors, latency) | Cloudflare Dashboard → Workers Analytics |
| Database queries | Supabase Dashboard → Database → Logs |
| Storage usage | Supabase Dashboard → Storage |
| Auth events | Supabase Dashboard → Auth → Logs |

For structured logging from the Worker, configure [Cloudflare Logpush](https://developers.cloudflare.com/logs/get-started/enable-destinations/) to push logs to your preferred destination (R2, S3, Datadog, etc.).
