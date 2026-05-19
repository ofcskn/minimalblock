# Supabase Schema Reference

Complete reference for all database tables, storage buckets, and Row-Level Security policies in Minimal Block.

---

## Migrations

Schema changes are managed as sequential SQL migrations in `supabase/migrations/`.

| Migration | Description |
|---|---|
| `001_initial_schema.sql` | Products and conversions tables |
| `002_hotspots.sql` | Interactive model annotation points |
| `003_ai_insights.sql` | AI-generated product intelligence |
| `004_events.sql` | Analytics event stream |
| `005_delete_cascade.sql` | Cascade deletions on product → conversions |
| `006_public.sql` | Public schema views for shareable products |
| `007_event_metadata.sql` | Structured payload on events |
| `008_generation_jobs.sql` | Long-running Gemini job tracking |
| `009_conversion_source_assets.sql` | Source image quality metadata |
| `010_hotspots_suggested.sql` | AI-recommended hotspot positions |
| `011_commerce_categories.sql` | E-commerce product taxonomy |
| `012_product_import_phase0.sql` | Product import workflow tables |
| `013_import_apus_comment.sql` | Import pipeline comment fields |
| `014_generation_feedback.sql` | User quality ratings on conversions |
| `015_brand_placement.sql` | Logo/watermark placement configuration |
| `016_perf_indexes_and_rpcs.sql` | Performance indexes and RPC functions |

### Apply migrations

```bash
# Link to your Supabase project
supabase link --project-ref <project-ref>

# Apply all pending migrations
supabase db push

# Reset (wipe + replay all — dev only, destructive)
supabase db reset

# Check diff between local schema and remote
supabase db diff
```

---

## Tables

### `products`

User's product inventory. One record per physical product.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary key (gen_random_uuid()) |
| `owner_id` | `uuid` | No | FK → `auth.users.id` |
| `name` | `text` | No | Product display name |
| `description` | `text` | Yes | Product description |
| `category` | `text` | Yes | Product category slug |
| `is_public` | `boolean` | No | Whether the product is publicly shareable |
| `created_at` | `timestamptz` | No | Auto-set on insert |
| `updated_at` | `timestamptz` | No | Auto-updated on change |

**Indexes:**
- `idx_products_owner_created` — `(owner_id, created_at DESC)` — gallery queries

---

### `conversions`

Tracks each 2D-to-3D conversion attempt for a product image.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `product_id` | `uuid` | No | FK → `products.id` (cascade delete) |
| `owner_id` | `uuid` | No | FK → `auth.users.id` |
| `source_asset_url` | `text` | Yes | Signed URL to source image |
| `source_asset_key` | `text` | Yes | Storage path of source image |
| `source_asset_mime` | `text` | Yes | MIME type of source image |
| `source_asset_size` | `bigint` | Yes | File size in bytes |
| `output_asset_url` | `text` | Yes | Signed URL to generated GLB |
| `output_asset_key` | `text` | Yes | Storage path of GLB |
| `output_asset_mime` | `text` | Yes | `model/gltf-binary` |
| `output_asset_size` | `bigint` | Yes | GLB file size in bytes |
| `status` | `text` | No | `pending` / `processing` / `completed` / `failed` |
| `error_message` | `text` | Yes | Failure reason (if status = `failed`) |
| `created_at` | `timestamptz` | No | |
| `updated_at` | `timestamptz` | No | |

**Indexes:**
- `idx_conversions_status` — `(status, updated_at DESC)` — polling queries

---

### `hotspots`

Interactive annotation points on a 3D model. Each hotspot has a 3D position and a label.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `conversion_id` | `uuid` | No | FK → `conversions.id` |
| `owner_id` | `uuid` | No | FK → `auth.users.id` |
| `position` | `jsonb` | No | `{ x, y, z }` in model space |
| `normal` | `jsonb` | Yes | `{ x, y, z }` surface normal |
| `label` | `text` | No | Callout text |
| `url` | `text` | Yes | Optional link on click |
| `created_at` | `timestamptz` | No | |

---

### `hotspots_suggested`

AI-generated hotspot recommendations. Users accept or dismiss these.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `conversion_id` | `uuid` | No | FK → `conversions.id` |
| `position` | `jsonb` | No | Suggested 3D position |
| `label` | `text` | No | Suggested label text |
| `confidence` | `float` | Yes | AI confidence score (0–1) |
| `created_at` | `timestamptz` | No | |

---

### `ai_insights`

AI-generated product intelligence extracted during the import or analysis pipeline.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `product_id` | `uuid` | No | FK → `products.id` |
| `materials` | `jsonb` | Yes | Detected materials |
| `geometry_class` | `text` | Yes | Shape classification |
| `return_risk_score` | `float` | Yes | Predicted return probability (0–1) |
| `metadata` | `jsonb` | Yes | Additional AI-extracted attributes |
| `created_at` | `timestamptz` | No | |

---

### `generation_jobs`

Tracks long-running Gemini generation requests. Used for async polling.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `conversion_id` | `uuid` | No | FK → `conversions.id` |
| `status` | `text` | No | `queued` / `running` / `done` / `failed` |
| `model` | `text` | Yes | Gemini model name used |
| `prompt_tokens` | `int` | Yes | Prompt token count |
| `output_tokens` | `int` | Yes | Output token count |
| `error` | `text` | Yes | Error message |
| `created_at` | `timestamptz` | No | |
| `updated_at` | `timestamptz` | No | |

---

### `generation_feedback`

User quality ratings on completed conversions.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `conversion_id` | `uuid` | No | FK → `conversions.id` |
| `owner_id` | `uuid` | No | FK → `auth.users.id` |
| `rating` | `int` | No | 1–5 star rating |
| `notes` | `text` | Yes | Optional freeform feedback |
| `created_at` | `timestamptz` | No | |

---

### `events`

Analytics event stream. Each row is one user action.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `owner_id` | `uuid` | Yes | FK → `auth.users.id` (null for anonymous) |
| `type` | `text` | No | Event type slug (e.g., `conversion.started`) |
| `payload` | `jsonb` | Yes | Structured event data |
| `created_at` | `timestamptz` | No | |

---

### `conversion_source_assets`

Source image quality metadata, populated before generation starts.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `conversion_id` | `uuid` | No | FK → `conversions.id` |
| `readiness_score` | `float` | Yes | Pre-flight quality score (0–1) |
| `quality_flags` | `jsonb` | Yes | Structured quality issues |
| `created_at` | `timestamptz` | No | |

---

### `brand_placement`

Logo/watermark placement configuration per user.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `owner_id` | `uuid` | No | FK → `auth.users.id` |
| `logo_url` | `text` | Yes | Signed URL to logo image |
| `position` | `text` | Yes | Placement anchor (e.g., `bottom-right`) |
| `opacity` | `float` | Yes | 0–1 |
| `created_at` | `timestamptz` | No | |

---

### `commerce_categories`

Hierarchical e-commerce product taxonomy.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary key |
| `slug` | `text` | No | URL-safe identifier |
| `label_en` | `text` | No | English label |
| `label_tr` | `text` | No | Turkish label |
| `parent_id` | `uuid` | Yes | Self-FK for subcategories |

---

## Storage

### Bucket: `media-assets` (public)

All product images and generated GLB models are stored in this bucket.

```
media-assets/
└── <owner_id>/
    ├── <uuid>.jpg     ← source product photos
    ├── <uuid>.png
    └── <uuid>.glb     ← generated GLB models
```

**Policies:**
- Authenticated users can upload and delete files under their own `owner_id` prefix
- Public read access for all files (enables CDN delivery without signed URLs for embeds)

**Signed URLs:** The API generates time-limited signed URLs for uploads and returns permanent public URLs for generated models.

---

## Row-Level Security

RLS is enabled on all tables that contain user data. The standard policy pattern:

```sql
-- Enable RLS
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

-- Read: owner only
CREATE POLICY "owner_select" ON <table>
  FOR SELECT USING (auth.uid() = owner_id);

-- Insert: authenticated, owner-scoped
CREATE POLICY "owner_insert" ON <table>
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Update: owner only
CREATE POLICY "owner_update" ON <table>
  FOR UPDATE USING (auth.uid() = owner_id);

-- Delete: owner only
CREATE POLICY "owner_delete" ON <table>
  FOR DELETE USING (auth.uid() = owner_id);
```

The Cloudflare Worker uses the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for privileged operations (e.g., updating conversion status after Gemini completes). The browser client uses `VITE_SUPABASE_ANON_KEY`, which is subject to RLS.

---

## TypeScript Types

Auto-generated TypeScript types are in `libs/data/src/lib/supabase/database.types.ts`. These are generated from the live Supabase schema using:

```bash
supabase gen types typescript --project-id <project-ref> > libs/data/src/lib/supabase/database.types.ts
```

Run this after every migration that adds or changes columns.
