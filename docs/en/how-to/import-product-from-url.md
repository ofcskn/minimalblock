---
title: Import a Product from a URL
description: How to use the APUS URL import flow to create a product record automatically from a merchant product page.
---

# Import a Product from a URL

APUS can extract product data — title, description, category, materials, and images — directly from a supported merchant URL. This guide walks through the complete import flow from pasting a URL to launching 3D conversion.

---

## Prerequisites

- A running Minimal Block API (`apps/api`) with a valid `GEMINI_API_KEY` environment variable.
- A logged-in user with an active Supabase session.
- A product page URL from Amazon, IKEA, or any publicly accessible e-commerce site.

---

## Step 1 — Paste the product URL

On the **New Product** screen, select **Import from URL** and paste the product page URL into the input field.

The API calls `POST /import/url` with `{ url: "<pasted-url>" }`.

If the URL is malformed or missing a protocol, the server normalises it to `https://` automatically.

---

## Step 2 — Review the extracted data

The extraction pipeline runs all six APUS stages (scrape → upload → intelligence → autofill → cluster → material). When it completes, the review panel opens with pre-filled fields.

Each field shows a **confidence badge**:

| Badge | Meaning |
|---|---|
| `high` | Taken directly from a structured data source (JSON-LD, specification table) |
| `medium` | Scraped from visible text; AI suggested an alternative |
| `low` | AI-inferred only; no scraper data was available |

Edit any field — changes are tracked as `editedBySeller: true` in the audit trail.

---

## Step 3 — Handle multi-product pages (if shown)

If the page contains a product bundle or multiple distinct items, the **Cluster Selector** appears before the review panel.

Each cluster card shows:
- A cluster label and confidence score
- The images assigned to that product

Select the cluster that matches the product you want to import, then click **Use this product**. The API calls `POST /import/:productId/cluster/accept` with `{ clusterId: "<id>" }`. The remaining clusters are discarded.

---

## Step 4 — Select images

The image grid shows all extracted images ranked by AI relevance score. Images flagged as `aiRejected` (logos, banners, UI assets) are hidden by default.

- Check the images you want to include in the 3D conversion.
- At least one image must be selected to proceed.
- Up to six images are pre-selected automatically by the pipeline.

---

## Step 5 — Confirm and save

Click **Confirm and Continue**. The app calls `POST /import/:productId/review` with the seller-confirmed fields and selected image IDs.

The product `workflowStatus` transitions to `autofill_ready`, and the product appears in your dashboard ready for 3D conversion.

---

## Step 6 — Launch 3D conversion (optional, immediate)

From the product detail page, click **Generate 3D Model**. The selected images are sent to the conversion pipeline using the inferred `materialFinish` and `geometryComplexity` values as quality hints.

---

## Troubleshooting

**No images were extracted**

The scraper could not find product images on the page. This can happen if the site uses heavy JavaScript rendering. Try a direct image URL or upload images manually.

**Fields are all `low` confidence**

The domain is in `best_effort` mode. The scraper fell back to generic HTML extraction. Review all fields carefully before proceeding.

**Cluster selector does not appear**

The page was detected as a single-product page. This is the expected behaviour for most product URLs.

**Import fails with `scrape_failed` status**

Check that the URL is publicly accessible (not behind a login wall). If the domain requires authentication, use manual upload instead.
