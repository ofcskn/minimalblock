# Phase 6 — Hotspot QA and Hotspot Editor

## Objective

Prevent meaningless, placeholder, or unapproved hotspots from appearing on public product pages.

## What was built

### Domain layer (`libs/core`)

**`HotspotQuality` value object** (`libs/core/src/lib/domain/value-objects/hotspot-quality.vo.ts`)

Pure, side-effect-free validator that scores each `Hotspot` against 8 rules and returns a `HotspotQualityReport` with `status: 'valid' | 'warning' | 'invalid'` and a typed `issues[]` array.

Rules implemented:

| Feature | Code | Severity |
|---------|------|----------|
| F.9 — reject empty labels | `empty_label` | invalid |
| F.10 — reject meaningless labels | `meaningless_label` | invalid |
| F.11 — reject test labels | `test_label` | invalid |
| F.12 — reject labels < 3 chars | `label_too_short` | invalid |
| F.13 — require buyer-useful description ≥ 10 chars | `missing_description` / `description_too_short` | warning |
| F.14 — require hotspot type | `missing_type` | warning |
| F.16 — warn when 3D position is missing | `missing_position` | warning |

**`Hotspot` interface extended** (`libs/core/src/lib/domain/entities/product.entity.ts`)

Added `approved?: boolean` field (F.5).

**`Product` entity extended**

New immutable builder methods:

- `withHotspotUpdate(id, patch)` — F.2/F.3/F.4 inline editing
- `withHotspotApproved(id, approved)` — F.5 approval toggle
- `withHotspotRemoved(id)` — F.6 deletion
- `allHotspotsApproved()` — F.15 publish gate check

### UI layer (`libs/ui`)

**`HotspotEditorPanel` component** (`libs/ui/src/lib/components/HotspotEditorPanel.tsx`)

Self-contained React component that renders the full hotspot editing workflow:

- F.1 — clear list of all hotspots
- F.2/F.3/F.4 — inline label, description, and type editing per hotspot
- F.5 — approval toggle per hotspot (green Approved / grey Approve button)
- F.6 — delete button per hotspot
- F.7 — "Generate better" action (triggers AI regeneration)
- F.8 — quality status driven by `HotspotQuality.validate()`
- F.17/F.18 — invalid = red row + red dot, valid = green row + green dot
- F.19 — red "Publish blocked" banner when any hotspot is invalid
- F.20 — "Validate hotspots" action button
- F.21 — "Generate better hotspots" action button

### Demo data (`libs/data`)

All four demo products now carry meaningful hotspot arrays demonstrating each QA path:

| Demo product | QA path |
|---|---|
| Wireless Headphones (Failed QA) | Invalid: empty label, test label, missing type |
| Leather Tote Bag (Approved) | All valid + approved — full green path |
| Ceramic Vase (Ready for Review) | Valid but unapproved — pending-approval path |
| Modern Floor Lamp (Needs Fix) | Mixed: 1 valid+approved, 1 missing type+description |

### ProductDetailPage integration (`apps/web`)

- `HotspotEditorPanel` replaces the old bare `<ul>` hotspot list in edit mode
- `updateHotspot()` and `toggleHotspotApproval()` handlers wired inline
- "Validate hotspots" callback surfaces QA errors in the page error state
- "Generate better" delegates to `runAiAction('hotspots')`
- `publishBlocked` prop driven by `HotspotQuality.hasInvalidHotspots()`

## Test coverage

| Suite | Tests |
|-------|-------|
| `hotspot-quality.vo.spec.ts` | 42 unit tests covering all rules and aggregation |
| `HotspotEditorPanel.spec.tsx` | 16 component tests covering all interactive features |

## Documentation

- `docs/en/reference/hotspot-quality.md` — API reference
- `docs/en/how-to/manage-hotspots.md` — Step-by-step seller guide (EN)
- `docs/tr/reference/hotspot-quality.md` — API referansı (TR)
- `docs/tr/how-to/manage-hotspots.md` — Satıcı kılavuzu (TR)
