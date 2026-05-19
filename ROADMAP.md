# Roadmap

This document outlines the planned feature set and delivery phases for Minimal Block. Items are organized by phase, roughly in priority order. The roadmap is a living document — it will be updated as the project evolves.

**Current status:** Active development (pre-release `0.x`)

---

## Completed Phases

### Phase 1 — MVP

- [x] Core monorepo structure (Nx + pnpm workspaces)
- [x] Domain layer with ports-adapters architecture (`libs/core`)
- [x] Supabase auth, database, and storage integration
- [x] React SPA with gallery, upload, and product detail pages
- [x] Cloudflare Worker API with Gemini 3D generation
- [x] Initial database schema (products, conversions)
- [x] Row-Level Security on all tables
- [x] Basic 3D model viewer (`<model-viewer>` web component)
- [x] Bilingual documentation site (English + Turkish)

### Phase 2 — AI Enhancement

- [x] Specialized category generators (furniture, clothing, electronics, jewelry, vehicle, packaging)
- [x] Gemini image analyzer with quality assessment
- [x] Material inference pipeline
- [x] Geometry classification
- [x] Product intelligence agent (market research)
- [x] Multi-product cluster detection
- [x] Return risk scoring

### Phase 3 — E-commerce Integration

- [x] Product import from URL (Trendyol, IKEA, Amazon, generic)
- [x] Import pipeline with parallel processing stages
- [x] Multi-source adapter pattern

### Phase 4 — Source Image Readiness

- [x] AI Diagnosis Panel (pre-flight quality check)
- [x] `readinessScore` value object with structured quality flags
- [x] `SourceImageReadinessCard` UI component
- [x] `conversion_source_assets` database table

### Phase 5 — Hotspot Editing

- [x] Hotspot data model and storage
- [x] `HotspotEditorPanel` 3D position picker
- [x] AI-suggested hotspot positions
- [x] Hotspot quality metrics reference

### Phase 6 — Brand & Polish

- [x] Brand placement configuration
- [x] `BrandPlacementPanel` UI
- [x] Performance indexes (migration 016)
- [x] Admin dashboard with analytics
- [x] QR code sharing
- [x] Public product embed page

---

## In Progress

### Phase 7 — Production Hardening

- [ ] End-to-end test suite (Playwright)
- [ ] Error boundary coverage across all pages
- [ ] Retry logic for transient Gemini API failures
- [ ] Structured logging from the Worker (Cloudflare Logpush)
- [ ] Rate limiting on the `/convert` endpoint
- [ ] Webhook support for conversion status updates
- [ ] Full test coverage for `libs/ai` (mock-based)

---

## Planned

### Phase 8 — Multi-model Support

- [ ] Support for OpenAI GPT-4o as an alternative AI provider
- [ ] Provider selection UI (bring-your-own-key — BYOK)
- [ ] Abstract `ModelGeneratorPort` implementations for multiple providers
- [ ] Cost estimation per generation before confirming

### Phase 9 — Collaboration

- [ ] Team workspaces (multiple users, shared products)
- [ ] Role-based access control (owner, editor, viewer)
- [ ] Product sharing via invite link
- [ ] Comment threads on conversions

### Phase 10 — Embed SDK

- [ ] Official JavaScript embed SDK (`<script>` tag)
- [ ] Customizable viewer theme (colors, controls, background)
- [ ] Embed analytics (view counts, interaction events)
- [ ] iframe embed with configurable permissions
- [ ] WordPress and Shopify plugin stubs

### Phase 11 — Marketplace Publishing

- [ ] Direct publishing to Trendyol product listings
- [ ] Batch import and bulk generation
- [ ] Marketplace template matching (auto-resize GLB to platform constraints)
- [ ] Scheduled publishing queues

### Phase 12 — Developer Platform

- [ ] Public REST API with API key authentication
- [ ] API rate limits and usage dashboard
- [ ] SDKs (TypeScript, Python)
- [ ] Webhook management UI
- [ ] OpenAPI 3.1 spec generation

---

## Long-Term Exploration

These items are under consideration but not committed:

- **Video-to-3D:** Accept short product video clips as input instead of still photos
- **AR try-on:** WebXR integration for augmented reality product previews
- **Batch processing:** Queue-based generation for large product catalogues
- **On-premises deployment:** Docker Compose option for air-gapped or data-sensitive environments
- **3D model editing:** In-browser mesh editing (vertex manipulation, UV unwrapping)
- **Format export:** Export to USDZ (Apple), OBJ, FBX in addition to GLB

---

## How to Influence the Roadmap

- Open a **feature request** using the [Feature Request issue template](.github/ISSUE_TEMPLATE/feature_request.yml)
- Start a **discussion** in [GitHub Discussions](https://github.com/ofcskn/minimalblock/discussions)
- Submit a **pull request** — PRs that implement planned items are prioritized in review

Items with significant community interest (upvotes, comments) are prioritized. Items that align with the core mission — making professional 3D product previews accessible to every merchant — are more likely to be scheduled.
