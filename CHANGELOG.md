# Changelog

All notable changes to Minimal Block are documented in this file.

This project follows [Semantic Versioning](https://semver.org/) and [Conventional Commits](https://www.conventionalcommits.org/).
Changelog entries are **automatically generated** by `scripts/generate-changelog.mts` from the git history and [Changesets](https://github.com/changesets/changesets) on every release.

- Each entry links to the relevant commits, pull requests, and issues.
- Breaking changes, migration notices, and security alerts are prominently highlighted.
- Run `pnpm changelog:generate` locally to preview the next entry.
- To contribute a changelog entry for your PR, run `pnpm changeset`.

---

## [Unreleased]

### Added
- Complete documentation and governance system (README, CONTRIBUTING, ARCHITECTURE, ROADMAP, CHANGELOG, CODE_OF_CONDUCT, DISCLAIMER, SUPPORT, issue templates, PR template)
- `docs/` developer documentation: environment variables, Supabase schema, AI integration, deployment guide

---

## [0.6.x] — 2026-05

### Added
- Brand placement configuration (`brand_placement` table — migration 015)
- `BrandPlacementPanel` UI component for logo/watermark position and opacity
- Performance indexes and RPC functions (migration 016)
  - `idx_products_owner_created` for gallery queries
  - `idx_conversions_status` for conversion polling
- Security policy (`.github/SECURITY.md`) with coordinated disclosure process
- CI pipeline hardening: read-only workflow permissions, full git history checkout for Nx affected detection

### Changed
- Production Supabase URL updated in `wrangler.toml`
- `wrangler.toml` environment variables reorganized into logical categories

---

## [0.5.x] — 2026-04

### Added
- Hotspot QA phase (`phase-6-hotspot-qa.md`)
- AI-suggested hotspot positions (`hotspots_suggested` table — migration 010)
- Hotspot quality metrics reference documentation
- `SourceImageReadinessCard` component with structured quality flags

### Changed
- Hotspot editor panel refactored for improved 3D position picking accuracy

---

## [0.4.x] — 2026-03

### Added
- Source Image Readiness system (migration 009)
  - `conversion_source_assets` table
  - `readinessScore` value object with quality flags
  - `AiDiagnosisPanel` pre-flight check UI
- Generation feedback system (`generation_feedback` table — migration 014)
  - User quality ratings (1–5 stars + notes)
  - Admin dashboard feedback view

### Fixed
- Cascade deletion for products and conversions (migration 005)

---

## [0.3.x] — 2026-02

### Added
- Product import pipeline for external URLs
  - Adapters: Trendyol, IKEA, Amazon, generic e-commerce scraper
  - Parallel processing pipelines: autofill, material, cluster, image-intelligence, image-upload, product-intelligence
  - `MultiProductClusterSelector` for clustered product photos
- Generation job tracking (`generation_jobs` table — migration 008)
- Event metadata extension (migration 007)
- Commerce categories taxonomy (migration 011)
- Import APUS phase zero (migration 012)

### Changed
- API routing refactored into `server.ts` with adapter registry

---

## [0.2.x] — 2026-01

### Added
- Specialized category generators
  - `furniture.generator` — chairs, tables, sofas
  - `clothing.generator` — apparel and accessories
  - `electronics.generator` — devices and gadgets
  - `jewelry.generator` — rings, necklaces, watches
  - `vehicle.generator` — cars, bikes, scooters
  - `packaging.generator` — boxes, bottles, containers
  - `category-generator.factory` — factory pattern selector
- Gemini image analyzer with quality and readiness scoring
- Material inference pipeline (`material-inference.prompt.ts`)
- Geometry classification (`geometry-classification.prompt.ts`)
- Product intelligence agent with market research capabilities
- Multi-product cluster detection
- Return risk scoring (`return-risk-analysis.prompt.ts`)
- Analytics events table (migration 004)
- Public schema/views for shareable products (migration 006)

### Changed
- AI layer restructured into separate clients per capability

---

## [0.1.x] — 2025-Q4

### Added
- Initial monorepo scaffold (Nx 22 + pnpm workspaces)
- Domain layer (`libs/core`): entities, value objects, ports
  - `Product`, `Conversion`, `MediaAsset` entities
  - `ConversionStatus`, `QualityReport` value objects
  - Repository and service port interfaces
- Data layer (`libs/data`): Supabase repository implementations
  - `ProductRepository`, `ConversionRepository`
  - Typed Supabase client and storage utilities
- AI layer (`libs/ai`): Google Gemini integration
  - `gemini-client.ts` base wrapper
  - `gemini-3d-generator.ts` GLB generation
  - `convert-2d-to-3d.prompt.ts` core generation prompt
- Web app (`apps/web`):
  - React 19 + Vite 8 + Tailwind CSS 3.4
  - React Router 6.30 with route-level code splitting
  - React Query 5 for server state
  - i18next 26 with English and Turkish locales
  - GalleryPage, UploadPage, ProductDetailPage, PublicProductPage, AuthPage
- Cloudflare Worker API (`apps/api`):
  - Node.js dev shim + Workers production entry
  - `/health`, `/convert`, `/import` endpoints
  - esbuild Worker bundle pipeline
- Supabase integration:
  - Initial schema (migration 001): products, conversions
  - Hotspots (migration 002)
  - AI insights (migration 003)
  - Row-Level Security on all tables
  - `media-assets` storage bucket
- VitePress documentation site (`apps/docs`):
  - Diátaxis framework (tutorials, how-to, explanation, reference)
  - 30 English pages, 19 Turkish pages
- GitHub Actions CI/CD pipeline with Nx Cloud distributed execution
- Bilingual UI (English + Turkish)

---

## Release Notes Format

Each release entry follows this structure:

```markdown
## [version] — YYYY-MM

### Added
- New features and capabilities

### Changed
- Modifications to existing behavior

### Deprecated
- Features scheduled for removal

### Removed
- Features removed in this release

### Fixed
- Bug fixes

### Security
- Security patches (without exploitable detail)
```

[Unreleased]: https://github.com/ofcskn/minimalblock/compare/HEAD...HEAD
