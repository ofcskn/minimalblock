---
name: database-unit-tester
description: Write and maintain integration tests for Supabase repositories (libs/data), RLS policies, schema migrations, and storage access rules. Tests run against a local Supabase instance. Use after every migration, repository change, or RLS policy update.
disable-model-invocation: true
---

# Database Unit Tester

## Use when
- A new SQL migration is added to `libs/data/src/lib/migrations/`
- A repository in `libs/data/src/lib/repositories/` is added or changed
- An RLS policy is added, removed, or modified
- Supabase Storage bucket policies change
- Auth flows that affect row-level access change

## Test stack
- **Runner**: Jest (configured in `libs/data/jest.config.cts`)
- **Supabase local**: `npx supabase start` before running data tests
- **Client**: `createSupabaseClient(url, anonKey)` from `@minimalblock/data`
- **Test files**: `libs/data/src/lib/**/*.spec.ts` (next to source)

## What to test per area

### Repository CRUD
```typescript
describe('SupabaseProductRepository', () => {
  it('save() inserts a new product', ...)
  it('save() updates existing product on conflict', ...)
  it('findById() returns null for unknown id', ...)
  it('findByOwnerId() returns only owner rows', ...)
  it('delete() removes the row', ...)
});

describe('SupabaseConversionRepository', () => {
  it('save() persists all status transitions', ...)
  it('findByOwnerId() ordered by created_at desc', ...)
  it('delete() cascades to conversion', ...)
});
```

### RLS policy tests (run as different auth users)
```typescript
// Use two distinct Supabase users (userA, userB)
describe('RLS — products table', () => {
  it('userA cannot SELECT userB rows', ...)
  it('userA cannot INSERT with owner_id = userB', ...)
  it('userA cannot UPDATE userB rows', ...)
  it('userA cannot DELETE userB rows', ...)
  it('unauthenticated request is denied', ...)
});

describe('RLS — conversions table', () => {
  it('owner can select own conversions only', ...)
  it('non-owner cannot read foreign conversions', ...)
});
```

### Storage RLS
```typescript
describe('Storage — media-assets bucket', () => {
  it('owner can upload to own folder', ...)
  it('non-owner cannot upload to foreign folder', ...)
  it('anyone can read public URLs', ...)
  it('owner can delete own files', ...)
  it('non-owner cannot delete foreign files', ...)
});
```

### Migration schema correctness
```typescript
describe('Migration 001 — schema', () => {
  it('products table exists with required columns', ...)
  it('conversions table exists with FK to products', ...)
  it('conversion_status enum has all 4 values', ...)
  it('RLS is enabled on both tables', ...)
  it('indexes exist on owner_id columns', ...)
});
```

### Data validation
```typescript
describe('Database constraints', () => {
  it('product name cannot be empty string via NOT NULL', ...)
  it('conversion status defaults to pending', ...)
  it('output_asset_url is nullable', ...)
  it('deleting a product cascades to conversions', ...)
});
```

## Security test rules
Every RLS test MUST:
1. Create two separate authenticated users (userA, userB)
2. Insert rows owned by userB
3. Try to read/write/delete as userA
4. Assert the operation is denied (`data === null` or `error` is set)
5. Verify userA CAN access their own rows

## Running tests
```bash
# Start local Supabase first
npx supabase start

# Run data tests
npx nx test @minimalblock/data

# Apply latest migration
npx supabase db push
```

## Workflow
1. Read the migration file and the affected repository before writing tests.
2. Write CRUD tests for every repository method.
3. Write RLS tests for every table using two-user scenarios.
4. Write storage tests if a bucket policy changed.
5. Run `npx nx test @minimalblock/data` and fix until green.
6. Never mock Supabase in these tests — hit the real local instance.

## Load only when needed
- [Supabase test client factory](assets/supabase-test-client.ts)
- [Two-user RLS test helper](assets/rls-test-helper.ts)
- [Migration schema checker](assets/schema-checker.ts)
- [Storage test helper](assets/storage-test-helper.ts)
