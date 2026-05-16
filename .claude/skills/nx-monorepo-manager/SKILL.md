---
name: nx-monorepo-manager
description: Manage and extend the Nx workspace for the 3D media app. Use for adding libs, configuring targets, fixing project graph issues, adjusting tsconfig paths, and running tasks correctly.
---

# Nx Monorepo Manager

## Use when
- Adding a new library under `libs/*`
- A build, lint, test, or typecheck target fails unexpectedly
- Import resolution errors for `@minimalblock/*` packages
- The project graph is stale or misconfigured
- Nx cache is producing wrong output

## Workspace layout
```
apps/
  web/               ← React + Vite app (main entry point)
libs/
  core/              ← @minimalblock/core — domain entities, ports, utils (no framework deps)
  data/              ← @minimalblock/data — Supabase client, repositories, migrations
  features/          ← @minimalblock/features — React hooks for upload, conversion, gallery, auth
  ui/                ← @minimalblock/ui — reusable React UI components
  ai/                ← @minimalblock/ai — Gemini client, prompts, types
```

## Dependency rules (enforced by Nx)
- `core` → no internal deps (pure domain)
- `data` → depends on `core`
- `ai` → depends on `core`
- `features` → depends on `core`, `data`, `ai`
- `ui` → depends on `core` only (no data/ai/features)
- `web` → depends on all libs

## Workflow
1. Run `npx nx graph` to inspect current project graph.
2. Use `npx nx g @nx/js:library` for new TS-only libs.
3. Use `npx nx g @nx/react:library` for new React libs.
4. After adding a lib, update `tsconfig.base.json` paths and `package.json` workspaces.
5. Prefix all nx commands with the package manager: `npx nx run-many -t build`.

## Common commands
```bash
npx nx build @minimalblock/core
npx nx run-many -t build --all
npx nx affected -t test
npx nx graph
```

## Load only when needed
- [Nx plugin docs](references/REFERENCE.md)
- [Task dependency template](assets/task-deps.md)
- [Generator quick reference](assets/generators.md)
