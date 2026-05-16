---
name: supabase-engineer
description: Design and implement Supabase schema, migrations, Storage configuration, and typed client usage for the 3D media app. Use for new tables, views, RPC functions, storage buckets, and migration authoring.
---

# Supabase Engineer

## Use when
- Adding or modifying tables in `libs/data/src/lib/migrations/*`
- Writing or updating repository implementations in `libs/data/src/lib/repositories/*`
- Configuring Supabase Storage buckets or access policies
- Generating or updating `database.types.ts` after schema changes
- Debugging Supabase client errors or RLS denials

## Schema overview
```sql
-- Core tables (see 001_initial_schema.sql)
products      (id, name, description, category, owner_id, created_at, updated_at)
conversions   (id, product_id, owner_id, source_asset_*, output_asset_*, status, error_message, ...)

-- Storage
bucket: media-assets  (public read, owner-scoped write)
```

## Migration authoring rules
- Name migrations: `NNN_description.sql` (zero-padded, e.g. `002_add_tags.sql`)
- Always include rollback comment block at the top
- Set `DEFAULT NOW()` on all timestamp columns
- Never use `SERIAL` — use `gen_random_uuid()` for PKs
- Add indexes for every FK and every column used in `WHERE`/`ORDER BY`
- Enable RLS on every new table immediately

## Workflow
1. Read `libs/data/src/lib/migrations/` to understand current schema.
2. Draft the migration SQL with RLS policies and indexes.
3. Update `database.types.ts` to reflect new table shape.
4. Update the relevant repository in `libs/data/src/lib/repositories/`.
5. Run migration: `npx supabase db push` (local) or apply via Supabase dashboard.

## Supabase client
- Client is a singleton from `libs/data/src/lib/supabase/client.ts`
- Always use the typed `Database` generic: `createClient<Database>(url, key)`
- Never expose the service-role key client-side

## Load only when needed
- [Schema design guide](references/REFERENCE.md)
- [Migration template](assets/migration-template.sql)
- [RLS policy patterns](assets/rls-patterns.md)
- [Repository pattern guide](assets/repository-guide.md)
