---
name: Phase 1 Scope Freeze — AI Visual Commerce QA
description: MVP scope, product identity, and demo strategy frozen for hackathon
type: project
---

The product is **AI Visual Commerce QA** — not a 3D viewer. One-sentence MVP: "An AI-powered quality gate that blocks bad product assets before they reach buyers and approves safe-to-publish product experiences for sellers."

**Why:** Hackathon demo needs a clear story: seller uploads → AI scores → bad asset blocked → good asset approved → public page unlocked.

**How to apply:** Never describe the product as "only a 3D viewer." Always frame it around seller risk reduction and safe-to-publish assets.

## Scope freeze (Phase 1 implemented 2026-05-18)

### Must-have (implemented)
- QA review queue as the main gallery screen
- AI quality score visible on every product card (0–100)
- Marketplace readiness badge per product card and detail page
- Export package status (blocked/pending/ready) on product detail
- Status banners on product detail: blocked/awaiting review/approved
- Gated publish buttons: embed, share, Trendyol export only for `approved` products
- Seller-readable AI diagnosis card with next actions on failure
- Public page shows only `approved` products, no internal QA details
- Trust wording on public page: "Accuracy verified · AI quality-checked"
- Upload page: seller-first framing, clear QA outcome with next actions

### Cut (do NOT build)
- Real Trendyol/Shopify/Amazon API integrations
- Native AR (keep as "preview/future" label only)
- Full image-to-3D dependency (GLB fallback path exists)
- Enterprise bulk workflows
- Complex mesh QA
- Unnecessary dashboard complexity

## Demo products
- **Laptop** — failed case: bad 3D, low confidence, readiness blocked, publish gated
- **Chair/lamp/bag/accessory** — success case: clean GLB, approved, public page + export flow
- **Medium product (optional)** — warnings but not critical failure, shows scoring nuance

## Key branding changes made
- App tagline: "AI Visual Commerce QA"
- Nav: "QA Queue", "Upload Product", "Brand Settings"
- Gallery title: "QA Review Queue"
- Breadcrumbs: "Product QA → QA Queue"
- Notifications: QA blocked/approved content instead of generic messages
