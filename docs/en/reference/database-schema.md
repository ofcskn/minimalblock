---
title: Database Schema
description: Supabase tables, enums, indexes, RLS policies, and storage bucket configuration for Minimal Block.
outline: deep
---

# Database Schema

Migration source: `libs/data/src/lib/migrations/001_initial_schema.sql`

---

## Enum: conversion_status

```sql
CREATE TYPE conversion_status AS ENUM ('pending', 'processing', 'completed', 'failed');
```

| Value | Meaning |
|---|---|
| `pending` | Job created, not yet picked up |
| `processing` | Gemini API call in flight |
| `completed` | GLB model generated and stored |
| `failed` | Non-recoverable error; see `error_message` |

---

## Table: products

```sql
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Columns

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | `UUID` | No | `gen_random_uuid()` | Primary key |
| `name` | `TEXT` | No | — | Product display name |
| `description` | `TEXT` | No | `''` | Free-text description |
| `category` | `TEXT` | No | — | One of the `ProductCategory` values |
| `owner_id` | `UUID` | No | — | FK → `auth.users.id` |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | Update manually on each change |

### Indexes

```sql
CREATE INDEX idx_products_owner_id ON products(owner_id);
```

### RLS policies

Row Level Security is enabled. All operations are restricted to the row owner.

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_owner_select" ON products FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "products_owner_insert" ON products FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "products_owner_update" ON products FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "products_owner_delete" ON products FOR DELETE USING (auth.uid() = owner_id);
```

---

## Table: conversions

```sql
CREATE TABLE conversions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  owner_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_asset_url    TEXT NOT NULL,
  source_asset_key    TEXT NOT NULL,
  source_asset_mime   TEXT NOT NULL,
  source_asset_size   BIGINT NOT NULL,
  output_asset_url    TEXT,
  output_asset_key    TEXT,
  output_asset_mime   TEXT,
  output_asset_size   BIGINT,
  status              conversion_status NOT NULL DEFAULT 'pending',
  error_message       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Columns

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | `UUID` | No | `gen_random_uuid()` | Primary key |
| `product_id` | `UUID` | No | — | FK → `products.id` |
| `owner_id` | `UUID` | No | — | FK → `auth.users.id` |
| `source_asset_url` | `TEXT` | No | — | Public URL of the uploaded image |
| `source_asset_key` | `TEXT` | No | — | Storage object path |
| `source_asset_mime` | `TEXT` | No | — | `image/jpeg`, `image/png`, or `image/webp` |
| `source_asset_size` | `BIGINT` | No | — | File size in bytes |
| `output_asset_url` | `TEXT` | Yes | `NULL` | Public URL of the GLB; `NULL` until completed |
| `output_asset_key` | `TEXT` | Yes | `NULL` | Storage object path of the GLB |
| `output_asset_mime` | `TEXT` | Yes | `NULL` | Always `model/gltf-binary` when set |
| `output_asset_size` | `BIGINT` | Yes | `NULL` | GLB size in bytes |
| `status` | `conversion_status` | No | `'pending'` | Current lifecycle state |
| `error_message` | `TEXT` | Yes | `NULL` | Populated on `failed` status |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | |

### Indexes

```sql
CREATE INDEX idx_conversions_owner_id   ON conversions(owner_id);
CREATE INDEX idx_conversions_product_id ON conversions(product_id);
CREATE INDEX idx_conversions_status     ON conversions(status);
```

### RLS policies

```sql
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversions_owner_select" ON conversions FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "conversions_owner_insert" ON conversions FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "conversions_owner_update" ON conversions FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "conversions_owner_delete" ON conversions FOR DELETE USING (auth.uid() = owner_id);
```

---

## Storage: media-assets bucket

### Bucket configuration

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-assets', 'media-assets', true);
```

The bucket is **public** — any authenticated or anonymous client can read objects. Write and delete access is owner-scoped (see policies below).

Objects are stored under an owner-prefixed path: `{owner_id}/{filename}`. `SupabaseImageUploader` enforces this convention automatically.

### Storage policies

```sql
CREATE POLICY "media_assets_owner_upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "media_assets_owner_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "media_assets_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'media-assets');
```

---

## Migration file location

```
libs/data/src/lib/migrations/001_initial_schema.sql
```

Run it once in the Supabase SQL editor. See [Configure Supabase](/en/how-to/configure-supabase) for step-by-step instructions.
