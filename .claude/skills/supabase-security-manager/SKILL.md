---
name: supabase-security-manager
description: Review and harden Supabase RLS policies, storage access policies, auth configuration, SQL function privileges, and schema exposure for the 3D media app. Use for any auth-sensitive migration, policy design, or security audit.
disable-model-invocation: true
---

# Supabase Security Manager

## Use when
- Any migration adds or modifies RLS policies, grants, or storage policies
- Auth flows change (new OAuth provider, session config, email templates)
- Public schema exposure needs review
- A SQL function with SECURITY DEFINER is introduced
- Least-privilege correctness must be verified before deploy

## RLS invariants for this app
Every table must satisfy ALL of the following:
1. `ALTER TABLE <t> ENABLE ROW LEVEL SECURITY;` is present in its migration
2. A `FOR SELECT` policy gating on `auth.uid() = owner_id` exists
3. A `FOR INSERT` policy with `WITH CHECK (auth.uid() = owner_id)` exists
4. No `GRANT ALL ON <table> TO anon` exists
5. Service-role bypass is never used client-side

## Storage invariants
- Bucket `media-assets` must NOT be fully public-write
- Upload policy: `(storage.foldername(name))[1] = auth.uid()::text`
- Delete policy: same owner check
- Public read is acceptable — GLB/image URLs are not sensitive by themselves

## SQL function rules
- `SECURITY DEFINER` functions must explicitly `SET search_path = public`
- No function should expose rows from other users
- Prefer `SECURITY INVOKER` (default) unless escalation is explicitly required

## Workflow
1. Read every migration file that is being added or changed.
2. Verify each RLS invariant above for every affected table.
3. Check storage policies against the upload/delete invariants.
4. Flag any `SECURITY DEFINER` function and review its privilege boundary.
5. Return a **Risk Register** with severity (Critical/High/Medium/Low) and hardened replacement.

## Red flags (block deploy until resolved)
- Missing RLS on any table
- `anon` or `public` role with INSERT/UPDATE/DELETE on user data
- Storage bucket with unrestricted write
- `auth.uid()` compared to a column that is user-settable
- Hard-coded UUIDs or bypass tokens

## Load only when needed
- [RLS policy patterns](references/REFERENCE.md)
- [Security checklist](assets/security-checklist.md)
- [Privilege matrix template](assets/privilege-matrix.md)
- [Risk register template](assets/risk-register.md)
