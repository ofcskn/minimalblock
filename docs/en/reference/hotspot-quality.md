# Hotspot Quality — Reference

Phase 6 introduces `HotspotQuality`, a pure domain value object that validates every hotspot against a set of rules before a seller can publish their product page.

## Status values

| Status | Meaning |
|--------|---------|
| `valid` | Hotspot passes all checks and may be published |
| `warning` | One or more soft issues exist; publishing is still allowed but quality is suboptimal |
| `invalid` | One or more hard issues block publishing until they are resolved |

## Validation rules

### Hard rules (produce `invalid`)

| Code | Rule |
|------|------|
| `empty_label` | F.9 — Label must not be blank or whitespace-only |
| `meaningless_label` | F.10 — Label must not be a generic placeholder (hotspot, point, label, todo, …) |
| `test_label` | F.11 — Label must not be a test artifact (test, foo, bar, asdf, temp, …) |
| `label_too_short` | F.12 — Label must be at least 3 characters |

### Soft rules (produce `warning`)

| Code | Rule |
|------|------|
| `missing_description` | F.13 — A buyer-useful description should explain why this detail matters |
| `description_too_short` | F.13 — Description must be at least 10 characters |
| `missing_type` | F.14 — One of `material \| dimension \| feature \| warning \| assembly` must be selected |
| `missing_position` | F.16 — Hotspot must be placed on the 3D model (position + normal required) |

## API

```typescript
import { HotspotQuality } from '@minimalblock/core';

// Validate a single hotspot
const report = HotspotQuality.validate(hotspot, 'bags');
// { hotspotId, status, issues }

// Validate all hotspots on a product
const reports = HotspotQuality.validateAll(product.hotspots, product.category);

// Check publish eligibility
const blocked = HotspotQuality.hasInvalidHotspots(product.hotspots);

// Check seller approval
const ready = HotspotQuality.allApproved(product.hotspots);
```

## Approval gate (F.15, F.19)

Publishing is blocked when **any** hotspot has `status === 'invalid'`. The `HotspotEditorPanel` component surfaces the blocked state via a red banner and shows the count of invalid hotspots.

Sellers approve each hotspot individually using the approval toggle (F.5). Approval is stored as `Hotspot.approved: boolean` and persisted as part of the product's `hotspots` JSONB column.

## Hotspot types

| Type | Use for |
|------|---------|
| `material` | What the product is made of (leather, aluminium, ceramic) |
| `dimension` | A measurable attribute (width, depth, weight) |
| `feature` | A functional or design capability (magnetic closure, USB-C port) |
| `warning` | A buyer caveat the seller must surface (colour variation, assembly required) |
| `assembly` | A component joint or structural detail (hinge, socket, connector) |
