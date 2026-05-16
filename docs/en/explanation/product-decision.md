---
title: Product Decision
description: Why this project was built the way it was — the design decisions, trade-offs, and constraints accepted during the hackathon sprint.
---

# Product Decision

## Problem statement

E-commerce product pages rely on flat photography. Shoppers cannot examine an object from multiple angles without physically handling it, which increases return rates and reduces purchase confidence. The goal of Minimal Block is to close that gap by generating an interactive 3D model from a single product photograph — at zero marginal cost per product beyond API token usage.

---

## Why AI-generated 3D models

### Competing approaches considered

| Approach | Why rejected |
|---|---|
| Photogrammetry (multi-photo scan) | Requires 20–100 photos per product and specialised hardware. Not viable for solo sellers. |
| Manual 3D modelling | Cost is $50–$500 per product from a freelancer. Not scalable for long-tail catalogues. |
| 3D model marketplaces | Generic models do not match individual seller inventory. |
| Depth-sensing cameras (LiDAR) | Hardware dependency. Eliminates the "just upload a photo" value proposition. |

A single multimodal LLM call from one JPEG is the only approach that scales to an arbitrary product catalogue with a near-zero per-unit cost.

### Cost and latency trade-offs

Gemini token costs for a `balanced`-quality generation run under $0.01 per model at current pricing. Generation latency is 8–20 seconds depending on image size and server load. This is acceptable for an asynchronous background job — the user does not wait at the screen.

---

## Why Gemini 2.0 Flash

Gemini 2.0 Flash Experimental (`gemini-2.0-flash-exp`) was selected for 3D generation because it supports **multimodal inline data** — an image and a text prompt can be sent in one API call, with the response being arbitrary binary content (the GLB file). No other generally available model offered this combination at the time of the hackathon.

`gemini-1.5-pro` (`ANALYSIS_MODEL_ID`) is used for image analysis because it produces more reliable structured JSON output for the category/description extraction task.

---

## Why Supabase

Supabase provides three services in one managed platform:

1. **Auth** — email + Google OAuth, with JWT-based session management. No auth server to operate.
2. **Storage** — S3-compatible object storage with folder-level access policies. Stores source images and generated GLB files under `{ownerId}/`.
3. **Database** — PostgreSQL with Row Level Security. RLS policies enforce that every `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on `products` and `conversions` is restricted to the row owner at the database level.

The RLS policies mean that even a buggy or compromised application layer cannot expose another user's data — the database rejects the query.

---

## Why Clean Architecture (DDD)

### Testability without infrastructure

The core domain — `Conversion` state transitions, `Product.isOwnedBy()`, `validateImageFile()` — can be unit-tested in milliseconds with no network calls. Mock implementations of `IModelGeneratorPort` and `IProductRepository` substitute for Gemini and Supabase. This is critical during a hackathon where rapid iteration on business logic must not be blocked by infrastructure availability.

### Swappable adapters

If Gemini removes the GLB output capability, the replacement AI provider plugs in by implementing `IModelGeneratorPort`. The feature hooks, domain logic, and UI are unchanged. The same applies to the database layer — replacing Supabase with another Postgres provider requires re-implementing `SupabaseProductRepository` and `SupabaseConversionRepository` without touching any other file.

---

## Constraints accepted

### GLB-only output format

GLB (binary glTF) was chosen because `<model-viewer>` supports it natively without a converter step. USDZ (Apple AR) and OBJ require additional processing pipelines and were deferred.

### 10 MB image upload limit

Supabase Storage free tier handles the limit adequately for product photography. Mobile phone photos typically compress to 2–6 MB at full resolution. The constraint is enforced at the `validateImageFile` level before any bytes are transmitted.

### Single-model-per-conversion design

Each `Conversion` produces one GLB. There is no retry-into-the-same-conversion pattern. A failed conversion must be recreated. This keeps the aggregate state machine simple and avoids partial-update edge cases.

---

## Out of scope

The following were evaluated and deliberately excluded from the 2-day sprint:

| Feature | Reason deferred |
|---|---|
| Payment / checkout | Zero billing infrastructure; 2-day build cost is prohibitive |
| Multi-user team catalogs | RLS model assumes single-owner rows; redesigning it takes a full day |
| AR / QR code view | Requires USDZ pipeline and additional device testing |
| Product price / inventory fields | Schema change risk late in sprint; no UI component ready |
| Mobile app | Separate app scaffolding effort; web-first is sufficient for demo |
