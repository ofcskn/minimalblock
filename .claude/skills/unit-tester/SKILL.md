---
name: unit-tester
description: Coordinate and enforce unit testing across all layers of the minimalblock workspace. Use when new code is written, a bug is fixed, a migration lands, or a feature is complete. Delegates to frontend-unit-tester and database-unit-tester as needed.
---

# Unit Tester — Coordinator

## Use when
- A feature, hook, component, or migration has just been implemented
- A bug fix or refactor requires regression coverage
- CI is failing and test gaps must be identified
- You need to decide which layers require testing after a change

## Decision matrix — what to test after each action

| Action | frontend-unit-tester | database-unit-tester |
|--------|---------------------|--------------------|
| New React component in `libs/ui` | ✓ | — |
| New feature hook in `libs/features` | ✓ | — |
| New domain entity / VO / aggregate in `libs/core` | ✓ (logic) | — |
| New Supabase migration | — | ✓ |
| New repository in `libs/data` | — | ✓ |
| RLS policy change | — | ✓ |
| Gemini prompt change in `libs/ai` | ✓ (unit mock) | — |
| New page in `apps/web` | ✓ | — |
| Auth flow change | ✓ | ✓ |
| Storage policy change | — | ✓ |

## Test pyramid targets for minimalblock

```
Unit tests (fast, isolated):
  libs/core     → every entity, VO, aggregate method
  libs/ai       → prompt builders, response parsers
  libs/ui       → render + interaction per component
  libs/features → hooks (mocked ports)

Integration tests (real Supabase local):
  libs/data     → repositories (CRUD + RLS)
  migrations    → schema correctness + RLS policies
```

## Running tests
```bash
# All
npx nx run-many -t test --all

# Affected only (after a change)
npx nx affected -t test

# Single lib
npx nx test @minimalblock/core
npx nx test @minimalblock/ui
npx nx test @minimalblock/data
```

## Workflow
1. Identify which layers were changed (use `git diff --name-only`).
2. Delegate to `frontend-unit-tester` for UI/hooks/domain logic.
3. Delegate to `database-unit-tester` for migrations, repositories, RLS.
4. Run `npx nx affected -t test` after all tests are written.
5. All tests must pass before marking a task complete.

## Load only when needed
- [Test coverage targets](assets/coverage-targets.md)
- [Test decision flowchart](assets/test-decision-flowchart.md)
