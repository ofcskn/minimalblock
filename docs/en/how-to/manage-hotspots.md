# How to manage hotspots (Phase 6)

Hotspots are interactive points that appear on the 3D model and explain product details to buyers. This guide covers the full seller workflow: placing, editing, validating, and publishing hotspots.

## 1. Open the hotspot editor

On any product detail page, click **Edit hotspots** to enter edit mode. The **Hotspot QA** panel appears below the 3D viewer.

## 2. Place a hotspot on the model

With edit mode active:

1. Click anywhere on the 3D model surface.
2. A dialog prompts you for a short label (e.g., *Full-Grain Italian Leather*).
3. Type the label and press **Add**. The hotspot appears at the clicked position.

## 3. Edit label, description, and type

In the **Hotspot QA** panel, click **Edit** next to any hotspot:

- **Label** — A short buyer-facing name (minimum 3 characters, no placeholders).
- **Description** — A sentence explaining why this detail matters to the buyer (minimum 10 characters).
- **Type** — Select one: `material`, `dimension`, `feature`, `warning`, or `assembly`.

Click **Save** to commit. Status dots update instantly to reflect the new quality score.

## 4. Understand quality status

Each hotspot row shows a coloured dot:

- **Green** — All checks pass; hotspot is ready to publish.
- **Amber** — One or more soft warnings (missing description or type, no 3D placement). Publishing is still allowed, but improve these before going live.
- **Red** — One or more hard failures (empty label, test label, placeholder label). These **block publishing** until resolved.

The panel header shows a count of invalid and warning hotspots.

## 5. Approve hotspots (F.15)

Each hotspot must be explicitly approved by the seller before it can appear on the public product page. Click **Approve** to toggle approval on/off. Approved hotspots show a green **Approved** badge.

## 6. Validate hotspots

Click **Validate hotspots** to run QA across all hotspots and surface any issues in the sidebar notification area.

## 7. Generate better hotspots (F.21)

Click **Generate better** to re-run AI hotspot generation. New suggestions appear in the **Suggested hotspots** queue below the editor. Accept individual suggestions to add them to the hotspot list.

## 8. Delete a hotspot (F.6)

Click **Delete** on any hotspot row to remove it permanently from the local list. Click **Save hotspots** to persist the change.

## 9. Save and exit edit mode

Click **Save hotspots** to persist all changes to the database and exit edit mode. Click **Cancel** to discard all unsaved changes.

## 10. Publish gate (F.19)

The **Publish** action is blocked if any hotspot has an invalid status. Resolve all red issues and re-run validation before attempting to publish.

## Demo paths

| Demo product | Hotspot scenario |
|---|---|
| Wireless Headphones (Failed QA) | Invalid hotspots — empty label, test label, missing type |
| Leather Tote Bag (Approved) | All valid, all approved — green demo path |
| Ceramic Vase (Ready for Review) | Valid hotspots, pending approval |
| Modern Floor Lamp (Needs Fix) | Mixed: one valid+approved, one missing type+description |
