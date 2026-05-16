---
name: web-developer
description: Build and maintain the React + Vite + Tailwind CSS web app at apps/web. Use for feature pages, routing, component wiring, state management, and integrating libs/features and libs/ui into the app shell.
---

# Web Developer

## Use when
- Adding or modifying pages/routes in `apps/web/src`
- Wiring `@minimalblock/features` hooks to `@minimalblock/ui` components
- Configuring Vite (vite.config.mts), env variables, or build output
- Handling routing with `react-router-dom` v6
- Debugging hydration, rendering, or bundling issues

## File naming rules — NON-NEGOTIABLE
Every file in `libs/ui/`, `libs/features/`, and `apps/web/src/` must follow these conventions:

| Type | Convention | Example |
|------|-----------|---------|
| React component | PascalCase, `.tsx` | `Button.tsx`, `ModelViewer.tsx` |
| React page | PascalCase + Page suffix | `HomePage.tsx`, `GalleryPage.tsx` |
| React hook | camelCase, `use` prefix | `useUpload.ts`, `useConversion.ts` |
| Provider / Guard | PascalCase | `AuthGuard.tsx`, `SupabaseProvider.tsx` |
| Domain entity / VO | PascalCase | `Product.entity.ts`, `MediaAsset.vo.ts` |
| Utility | camelCase | `fileValidator.ts`, `idGenerator.ts` |

**Never** use kebab-case for component files. `file-upload.tsx` ❌ → `FileUpload.tsx` ✓  
**Never** use lowercase for component files. `button.tsx` ❌ → `Button.tsx` ✓

## App structure convention
```
apps/web/src/
  pages/
    HomePage.tsx          ← upload entry point
    GalleryPage.tsx       ← conversion gallery
    ConversionPage.tsx    ← real-time conversion status
    AuthPage.tsx          ← login / signup
  components/             ← app-specific components (not reusable — use libs/ui for those)
  providers/
    SupabaseProvider.tsx  ← injects Supabase client via context
    AuthGuard.tsx         ← redirect unauthenticated users
  router.tsx              ← react-router-dom route definitions
  main.tsx                ← app entry, provider wrapping
```

## libs/ui component file layout
```
libs/ui/src/lib/
  components/
    Button.tsx
    Card.tsx
    FileUpload.tsx
    Modal.tsx
    Spinner.tsx
    StatusBadge.tsx
  layout/
    AppShell.tsx
  3d-viewer/
    ModelViewer.tsx
```

## Wiring pattern
```tsx
// Page: uses feature hook + ui component
import { useUpload } from '@minimalblock/features';
import { FileUpload, Button, Spinner } from '@minimalblock/ui';

function HomePage() {
  const { upload, uploading, error, asset } = useUpload(uploader, userId);
  return <FileUpload onFileSelected={upload} disabled={uploading} />;
}
```

## Constraints
- Tailwind CSS only — no CSS Modules or styled-components
- No business logic in pages — delegate to `@minimalblock/features` hooks
- No direct Supabase calls in pages — use `@minimalblock/data` or `@minimalblock/features`
- All env vars must be prefixed `VITE_` and typed via `src/env.d.ts`
- PascalCase filenames in all component/page/provider files — enforced, no exceptions

## Workflow
1. Read the target page/component before modifying.
2. Verify the filename is PascalCase before creating any new file.
3. Identify whether new logic belongs in a feature hook (libs/features) or a UI component (libs/ui).
4. Never duplicate in the app what exists in libs.
5. Run `npx nx dev web` to verify locally before marking complete.

## Load only when needed
- [Routing map](assets/routing-map.md)
- [Provider wiring guide](assets/providers.md)
- [Env variable contract](assets/env-contract.md)
