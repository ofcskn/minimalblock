---
name: Phase 4 — Source Image Readiness
description: What was built in Phase 4, key files, and design decisions
type: project
---

Phase 4 implemented the Source Image Readiness feature on 2026-05-18.

**Why:** Sellers need to understand that image count ≠ image quality. Phase 4 teaches them which views to provide and flags weak images before they enter the 3D pipeline.

**Key files:**
- `libs/core/src/lib/domain/value-objects/source-image-readiness.vo.ts` — VO with `SourceImageReadiness`, `SourceImageEntry`, `ImageViewLabel`, `ImageQualityWarning`
- `libs/core/src/lib/domain/value-objects/source-image-readiness.vo.spec.ts` — 20 unit tests
- `libs/ui/src/lib/components/SourceImageReadinessCard.tsx` — UI card: image grid, 8-view checklist, score bar, actions
- `libs/ui/src/lib/components/SourceImageReadinessCard.spec.tsx` — 13 UI tests
- `libs/data/src/lib/demo/demo-products.ts` — enriched with `sourceImageEntries` per demo product
- `libs/core/src/lib/domain/entities/product.entity.ts` — `ProductAiAnalysis.sourceImageEntries` added

**Score algorithm:** –30 no front, –20 no back, –10 no detail; warnings: –10 duplicate, –8 low-res, –5 others. Clamped [0, 100].

**How to apply:** When adding new upload or image quality features, extend `SourceImageEntry` and update `computeScore`. The card in `ProductDetailPage` prefers AI-enriched `sourceImageEntries` and falls back to heuristic derivation from `conversion.sourceAssets`.
