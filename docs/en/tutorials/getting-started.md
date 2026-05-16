---
title: Getting Started
description: Set up the Minimal Block development environment, configure environment variables, and run the app locally.
---

# Getting Started

This tutorial walks through cloning the repository, installing dependencies, configuring Supabase and Gemini, and running the web app and docs site on your machine.

---

## Prerequisites

### Node.js and package manager

Install [Node.js](https://nodejs.org) 20 or later. The project uses npm as the default package manager (specified in `package.json`).

Verify your versions:

```bash
node --version   # v20.x or later
npm --version    # 10.x or later
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
npm install
```

---

## Configure environment variables

Create a `.env` file at the repository root. This file is listed in `.gitignore` — never commit it.

```sh
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_GEMINI_API_KEY=<your-gemini-api-key>
```

### VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

Find both values in the Supabase dashboard under **Settings** → **API**.

The anon key is safe for client-side use — Row Level Security on the database restricts every query to the authenticated user's own rows.

If you have not set up your Supabase project yet, follow the [Configure Supabase](/en/how-to/configure-supabase) guide first.

### VITE_GEMINI_API_KEY

Find this in [Google AI Studio](https://aistudio.google.com) under **Get API key**.

If you have not generated a key yet, follow the [Configure Gemini AI](/en/how-to/configure-gemini) guide first.

### Optional variables

No other variables are required to run the app locally.

---

## Run the dev server

Start the web app:

```bash
npm run dev
# or via Nx:
npx nx serve web
```

The app opens at `http://localhost:4200` by default.

Start the docs site:

```bash
npm run docs:dev
# or via Nx:
npx nx serve docs
```

The docs open at `http://localhost:5173`.

---

## Verify the setup

### Check the web app

Open `http://localhost:4200`. You should see the app shell without console errors. If you see a Supabase error (e.g., "Invalid API key"), check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env` file.

### Check the docs site

Open `http://localhost:5173`. The home page should display the locale-selector hero with **Get Started (English)** and **Başla (Türkçe)** buttons.

::: tip Next step
Follow the [Create a 3D Product Preview](/en/tutorials/create-product-3d-preview) tutorial to build your first product with a Gemini-generated 3D model.
:::
