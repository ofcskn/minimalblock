---
title: Getting Started
description: Set up the Minimal Block development environment, configure environment variables, and run the app locally.
---

# Getting Started

This tutorial walks through cloning the repository, installing dependencies, configuring Supabase and Gemini, and running the web app, API, and docs site on your machine.

---

## Prerequisites

### Node.js and package manager

Install [Node.js](https://nodejs.org) 20 or later. The project uses pnpm as its package manager.

Verify your versions:

```bash
node --version   # v20.x or later
pnpm --version   # 8.x or later
```

### Required accounts

You need:

| Service | Purpose | Free tier |
|---|---|---|
| [Supabase](https://supabase.com) | Database, auth, storage | Yes — 2 free projects |
| [Google AI Studio](https://aistudio.google.com) | Gemini API key | Yes — with rate limits |

Create both accounts before proceeding.

---

## Clone and install

```bash
git clone https://github.com/ofcskn/minimalblock.git
cd minimalblock
pnpm install
```

---

## Configure environment variables

The project uses two separate `.env` files — one for the web frontend and one for the Node.js API backend. Neither should be committed to version control.

### Web app — root `.env`

Copy the example and fill in the values:

```bash
cp .env.example .env
```

```sh
# .env (repo root)
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_API_BASE_URL=http://localhost:8787
```

Find `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Supabase dashboard under **Settings** → **API**.

The anon key is safe for client-side use — Row Level Security on the database restricts every query to the authenticated user's own rows.

If you have not set up your Supabase project yet, follow the [Configure Supabase](/en/how-to/configure-supabase) guide first.

### API backend — `apps/api/.env`

Copy the example and fill in the values:

```bash
cp apps/api/.env.example apps/api/.env
```

```sh
# apps/api/.env
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
GEMINI_API_KEY=<your-gemini-api-key>
```

Find `SUPABASE_SERVICE_ROLE_KEY` in the Supabase dashboard under **Settings** → **API** → **Service role key** (keep this secret — it bypasses RLS).

Find `GEMINI_API_KEY` in [Google AI Studio](https://aistudio.google.com) under **Get API key**.

::: warning GEMINI_API_KEY is backend-only
`GEMINI_API_KEY` must **never** be set in the root `.env` or any `VITE_`-prefixed variable. Vite inlines `VITE_*` variables into the browser bundle, which would expose the key publicly. All Gemini calls are made by `apps/api` server-side.
:::

If you have not generated a key yet, follow the [Configure Gemini AI](/en/how-to/configure-gemini) guide first.

---

## Run the dev servers

Start all three services:

```bash
# Terminal 1 — API (port 8787)
pnpm nx serve api

# Terminal 2 — Web app (port 4200)
pnpm nx serve web

# Terminal 3 — Docs site (port 5173)
pnpm nx serve docs
```

Or start the web app and API together:

```bash
pnpm nx run-many -t serve -p web api
```

---

## Verify the setup

### Check the API

```bash
curl http://localhost:8787/health
# → {"status":"ok"}
```

### Check the web app

Open `http://localhost:4200`. You should see the app shell without console errors. If you see a Supabase error (e.g., "Invalid API key"), check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your root `.env` file.

### Check the docs site

Open `http://localhost:5173`. The home page should display the locale-selector hero with **Get Started (English)** and **Başla (Türkçe)** buttons.

::: tip Next step
Follow the [Create a 3D Product Preview](/en/tutorials/create-product-3d-preview) tutorial to build your first product with a Gemini-generated 3D model.
:::
