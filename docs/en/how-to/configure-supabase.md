---
title: Configure Supabase
description: Create a Supabase project, run the initial migration, verify RLS, and set environment variables.
---

# Configure Supabase

## Create a Supabase project

1. Open [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Choose an organisation, set a project name (e.g., `minimalblock`), and pick a database password.
4. Select a region close to your users and click **Create new project**.

Wait for the project to finish provisioning (approximately 60 seconds).

---

## Run the initial migration

The full schema is in `libs/data/src/lib/migrations/001_initial_schema.sql`.

1. In the Supabase dashboard, go to **SQL Editor** → **New query**.
2. Copy the entire contents of `001_initial_schema.sql` and paste it into the editor.
3. Click **Run**.

The query creates:
- `conversion_status` enum
- `products` and `conversions` tables with indexes
- RLS policies for both tables
- The `media-assets` storage bucket with its policies

::: warning Run once only
Running the migration a second time will fail with "relation already exists" errors. If you need to reset, drop all tables and the bucket first, or create a fresh Supabase project.
:::

---

## Verify Row Level Security policies

### Test products RLS

Open **Table Editor** → **products**. While logged out (or as a different user), attempt to insert a row directly via the SQL editor:

```sql
INSERT INTO products (id, name, description, category, owner_id)
VALUES (gen_random_uuid(), 'Test', '', 'other', '00000000-0000-0000-0000-000000000001');
```

The query should fail with `new row violates row-level security policy`. This confirms RLS is active.

### Test conversions RLS

Run a `SELECT` on `conversions` without an authenticated session:

```sql
SELECT * FROM conversions;
```

The result should be an empty array, not an error — the policy uses `USING` (not `WITH CHECK`), so unauthenticated reads return zero rows rather than rejecting the query.

---

## Configure the storage bucket

### Verify media-assets bucket exists

Go to **Storage** in the Supabase dashboard. Confirm the `media-assets` bucket appears in the list and shows **Public** as its access type.

### Confirm the storage policies

Go to **Storage** → **Policies**. Verify three policies exist on `storage.objects`:

| Policy name | Operation | Condition |
|---|---|---|
| `media_assets_owner_upload` | INSERT | `foldername(name)[1] = auth.uid()` |
| `media_assets_owner_delete` | DELETE | `foldername(name)[1] = auth.uid()` |
| `media_assets_public_read` | SELECT | `bucket_id = 'media-assets'` |

---

## Set environment variables

Retrieve your project credentials from **Settings** → **API** in the Supabase dashboard.

Create a `.env` file at the repository root (never commit this file):

```sh
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

The `VITE_` prefix exposes the variables to the Vite build. The anon key is safe for client-side use — Supabase's RLS policies enforce access control at the database level.
