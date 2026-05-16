---
name: performance-engineer
description: Audit and optimise frontend performance for the 3D media app. Covers Vite bundle analysis, 3D asset loading, route code-splitting, image optimisation, and Supabase query performance. Use for slow pages, heavy bundles, or poor loading experience.
---

# Performance Engineer

## Use when
- Pages load slowly or LCP is above 2.5 s
- Bundle size exceeds 500 KB (uncompressed)
- 3D model loading blocks the UI thread
- Supabase queries are slow or over-fetching
- Duplicate or unused dependencies detected in the bundle

## Performance targets
| Metric | Target |
|--------|--------|
| LCP | < 2.5 s on 3G |
| Bundle (initial) | < 150 KB gzip |
| GLB model load | < 3 s on 10 Mbps |
| Supabase query | < 200 ms p95 |

## Priority optimisations for this app

### 3D model loading
- Lazy-load `<model-viewer>` script; it is ~500 KB
- Store GLB files in Supabase Storage with `Content-Encoding: br` (Brotli)
- Serve progressive GLB where possible (Draco compression)
- Show `ModelViewerPlaceholder` while the model streams

### Bundle
- Route-level code splitting via `React.lazy` + `Suspense`
- Tree-shake `@google/generative-ai` — only import what's used
- Externalise `react`, `react-dom` via Vite config if using CDN

### Image upload
- Compress images client-side with `browser-image-compression` before upload
- Use WebP for all preview thumbnails

### Supabase
- Select only needed columns — never `select('*')` in lists
- Add indexes on `owner_id` and `status` (already in migration 001)
- Use Supabase Realtime only for active conversions (not the full gallery)

## Workflow
1. Run `npx nx build web -- --analyze` to inspect bundle.
2. Use Lighthouse for LCP/CLS/FID baselines.
3. Apply highest-impact changes first (3D loading > bundle > queries).
4. Re-measure after each change — document before/after.

## Load only when needed
- [Vite bundle optimisation checklist](assets/bundle-checklist.md)
- [3D asset loading guide](assets/3d-loading.md)
- [Supabase query optimisation](assets/supabase-perf.md)
- [Performance audit report template](assets/perf-report.md)
