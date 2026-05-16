---
title: Database Types
description: Every PostgreSQL and Supabase-specific type used in the Minimal Block schema — primitives, enums, RLS mechanics, and storage path conventions.
outline: deep
---

# Database Types

This page explains every type, enum, and structural pattern used in the Minimal Block Supabase schema. Use it as a reference when reading migrations, writing queries, or mapping rows to domain objects.

Migration source: `supabase/migrations/001_initial_schema.sql`

---

## PostgreSQL Primitive Types

### UUID

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
owner_id UUID NOT NULL REFERENCES auth.users(id)
```

| Property | Detail |
|---|---|
| Size | 16 bytes |
| Format | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (RFC 4122) |
| Default | `gen_random_uuid()` — cryptographically random v4 |
| Sortable | No — UUIDs are not sequential |

All primary keys (`id`) and foreign keys (`owner_id`, `product_id`) are `UUID`. Supabase Auth user IDs are also UUIDs, so `owner_id REFERENCES auth.users(id)` is a direct foreign key to the auth layer.

**Why not SERIAL / BIGSERIAL?** Sequential integers leak row count to clients and make IDs predictable. UUID v4 is unpredictable and safe to expose in URLs.

---

### TEXT

```sql
name        TEXT NOT NULL
description TEXT NOT NULL DEFAULT ''
category    TEXT NOT NULL
error_message TEXT
```

| Property | Detail |
|---|---|
| Max length | Unlimited (1 GB theoretical) |
| Encoding | UTF-8 |
| Indexed as | B-tree (full) or GIN (full-text) |

`TEXT` is used for all string columns: product names, descriptions, storage keys, URLs, MIME types, and error messages. PostgreSQL makes no practical distinction between `TEXT` and `VARCHAR(n)` in performance — the length constraint of `VARCHAR(n)` provides no storage saving and adds unnecessary validation overhead.

---

### TIMESTAMPTZ

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

| Property | Detail |
|---|---|
| Storage | 8 bytes |
| Precision | Microseconds |
| Timezone | Stored as UTC internally, displayed in session timezone |

`TIMESTAMPTZ` (timestamp with time zone) stores a moment in time without ambiguity. `NOW()` always returns the current UTC instant. JavaScript receives these as ISO 8601 strings (`"2026-05-16T10:30:00Z"`) and they are converted to `Date` objects in `rowToProduct()` and `rowToConversion()` in `libs/data`.

**Why not TIMESTAMP (without time zone)?** `TIMESTAMP` records wall-clock time with no timezone context. This creates data corruption bugs when the database server's timezone changes or when records are read by clients in different locales.

---

### BIGINT

```sql
source_asset_size BIGINT NOT NULL
output_asset_size BIGINT
```

| Property | Detail |
|---|---|
| Range | −9,223,372,036,854,775,808 to 9,223,372,036,854,775,807 |
| Storage | 8 bytes |
| Max file size representable | ~9.2 exabytes |

File sizes are stored in bytes as `BIGINT` rather than `INT` (4-byte integer, max ~2.1 GB). A 10 MB upload fits in `INT`, but GLB output files and future-proofing warrant 8-byte integers.

**TypeScript mapping:** Supabase JS returns `BIGINT` as a JavaScript `number`. This is safe up to 2^53 − 1 bytes (~8 petabytes). Beyond that, use `string` or `BigInt`.

---

## Custom Enum: conversion_status

```sql
CREATE TYPE conversion_status AS ENUM ('pending', 'processing', 'completed', 'failed');
```

| Value | Meaning | Terminal? |
|---|---|---|
| `pending` | Job created, not yet picked up by the processor | No |
| `processing` | Gemini API call in flight | No |
| `completed` | GLB model generated and stored in `media-assets` | Yes |
| `failed` | Non-recoverable error; see `error_message` | Yes |

PostgreSQL enforces that no value outside this set can be inserted. Attempting `UPDATE conversions SET status = 'cancelled'` will fail with a type error.

### State machine

```
pending → processing → completed
                    ↘ failed
(any non-terminal) → failed
```

The domain aggregate `Conversion` in `libs/core` enforces these transitions:

- `markProcessing()` — only from `pending`
- `markCompleted(outputAsset)` — only from `processing`
- `markFailed(reason)` — from any non-terminal state

### TypeScript mapping

```ts
// libs/core
export type ConversionStatusValue = 'pending' | 'processing' | 'completed' | 'failed';

export class ConversionStatus {
  readonly value: ConversionStatusValue;
  static from(value: ConversionStatusValue): ConversionStatus
  isTerminal(): boolean
}
```

The repository calls `ConversionStatus.from(row.status)` when mapping a database row to the domain object.

---

## Nullable vs NOT NULL

| Pattern | Example | Meaning |
|---|---|---|
| `NOT NULL` | `name TEXT NOT NULL` | Column must always have a value; enforced at DB level |
| `NOT NULL DEFAULT ''` | `description TEXT NOT NULL DEFAULT ''` | Empty string instead of NULL; simplifies client code |
| Nullable (no modifier) | `output_asset_url TEXT` | `NULL` until the conversion completes |
| `BIGINT` nullable | `output_asset_size BIGINT` | `NULL` while output has not been generated |

The `output_*` columns on `conversions` are all nullable — they start as `NULL` when the conversion is `pending` or `processing`, and are filled in atomically when the conversion transitions to `completed`.

---

## Row Level Security (RLS)

All tables have RLS enabled. Every policy uses one of two clause types:

### USING clause

```sql
CREATE POLICY "products_owner_select" ON products
  FOR SELECT USING (auth.uid() = owner_id);
```

The `USING` clause is a row filter applied **after** the database fetches candidate rows. Only rows where the expression evaluates to `true` are returned. Applied to `SELECT`, `UPDATE`, and `DELETE`.

`auth.uid()` is a Supabase function that returns the UUID of the currently authenticated user from the JWT, or `NULL` if the request is unauthenticated. An unauthenticated request returns zero rows.

### WITH CHECK clause

```sql
CREATE POLICY "products_owner_insert" ON products
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
```

The `WITH CHECK` clause validates **new rows** before they are written. It is applied to `INSERT` and `UPDATE`. If the expression evaluates to `false`, the operation is rejected with a permission error — even if the application layer did not send an owner mismatch.

### Why both matter

A buggy application that attempts `INSERT INTO products (owner_id) VALUES ('someone-elses-id')` is rejected by `WITH CHECK`. A buggy query that fetches without filtering by `owner_id` returns only the caller's own rows due to `USING`. The database enforces correctness independently of the application layer.

---

## Storage: Object Path Convention

Objects in the `media-assets` bucket follow this naming pattern:

```
{owner_id}/{filename}
```

Example:

```
3f8a1e2b-4d5c-4f6e-9a7b-8c9d0e1f2a3b/1716810000000-product.jpg
3f8a1e2b-4d5c-4f6e-9a7b-8c9d0e1f2a3b/1716810045000-model.glb
```

The storage upload policy enforces this:

```sql
CREATE POLICY "media_assets_owner_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

`storage.foldername(name)[1]` extracts the first path segment and compares it to the authenticated user's UUID. Uploading to `another-user-id/file.jpg` is rejected.

The bucket is **public** — any client (including unauthenticated) can read objects via public URL. Write and delete are owner-scoped.

---

## Type Mapping Summary

| PostgreSQL type | TypeScript type | Notes |
|---|---|---|
| `UUID` | `string` | Supabase JS returns as string |
| `TEXT` | `string` | Direct mapping |
| `TIMESTAMPTZ` | `Date` (after `new Date(row.created_at)`) | Supabase JS returns ISO 8601 string |
| `BIGINT` | `number` | Safe up to 2^53 bytes |
| `conversion_status` enum | `ConversionStatusValue` | `'pending' \| 'processing' \| 'completed' \| 'failed'` |
| `TEXT` (nullable) | `string \| null` | Supabase JS returns `null` for SQL `NULL` |
| `BIGINT` (nullable) | `number \| null` | Same pattern |
