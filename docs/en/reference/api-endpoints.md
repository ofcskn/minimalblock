---
title: API Endpoints
description: Complete reference for all Minimal Block API endpoints — methods, request bodies, and response shapes.
outline: deep
---

# API Endpoints

All endpoints are served by the Cloudflare Worker at `apps/api`.  
Base URL (local dev): `http://localhost:8787`  
Base URL (production): your Cloudflare Worker URL or custom domain.

## Authentication

Every endpoint except `/health` and `OPTIONS` preflight requires a Supabase JWT:

```
Authorization: Bearer <supabase-access-token>
```

Requests without a valid bearer token return `401 Unauthorized`.

## CORS

All responses include:

```
Access-Control-Allow-Origin: <CORS_ORIGIN env var, default *>
Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS
Access-Control-Allow-Headers: authorization, content-type
```

Send an `OPTIONS` preflight on any path to receive a `204 No Content` with these headers.

---

## Health

### `GET /health`

Returns the liveness status of the worker. No authentication required.

**Response `200`**
```json
{ "ok": true }
```

---

## Conversions

### `POST /api/conversions`

Create a new product and kick off a 3D model generation job from source images.

**Request body**
```ts
{
  product: {
    name: string            // required
    description?: string
    category: string        // e.g. "furniture", "electronics"
  }
  sourceAssets: Array<{    // required, at least 1
    url: string
    storageKey: string
    mimeType: string        // e.g. "image/jpeg"
    sizeBytes: number
  }>
  manualModelAsset?: {     // skip AI generation, use this GLB directly
    url: string
    storageKey: string
    mimeType: string
    sizeBytes: number
  }
  qualityHint?: string     // hint passed to Gemini ("high_detail", etc.)
}
```

**Response `200`**
```ts
{
  productId: string
  conversionId: string
  jobId: string
  status: "processing" | "awaiting_approval" | "approved" | "failed"
}
```

---

### `GET /api/conversions/:conversionId`

Fetch the current state of a conversion.

**Path parameter:** `conversionId` — UUID of the conversion.

**Response `200`**
```ts
{
  conversion: {
    id: string
    productId: string
    ownerId: string
    status: string
    sourceAssets: Array<{ url; storageKey; mimeType; sizeBytes }>
    outputAsset?: { url; storageKey; mimeType; sizeBytes }
    errorMessage?: string
    provider: string
    qualityReport?: { ... }
    approvedAt?: string     // ISO 8601
    rejectionReason?: string
    createdAt: string
    updatedAt: string
  }
}
```

**Error `404`** — conversion not found or not owned by caller.

---

### `POST /api/conversions/:conversionId/approve`

Mark a conversion as approved and publish the 3D model.  
Also records a positive feedback signal for the Gemini generation loop.

**Path parameter:** `conversionId`

**Request body:** none

**Response `200`** — same shape as `GET /api/conversions/:id`.

---

### `POST /api/conversions/:conversionId/reject`

Reject a conversion with an optional reason.  
Records a negative feedback signal for the generation loop.

**Path parameter:** `conversionId`

**Request body**
```ts
{ reason?: string }
```

**Response `200`** — same shape as `GET /api/conversions/:id`.

---

## Product Import

### `POST /api/products/import-url`

Scrape a product URL, extract images and metadata, then run AI autofill to populate name, description, category, materials, and dimensions.

**Request body**
```ts
{ url: string }   // e.g. "https://www.ikea.com/..."
```

**Response `200`**
```ts
{
  product: {
    productId: string
    name: string
    description: string
    category: string
    workflowStatus: string
    inputMethod: string
    importData: { ... } | null
  }
}
```

---

### `POST /api/products/:productId/import/review`

Save the seller's reviewed and confirmed import — selected images, edited fields, and confirmed metadata.  
Triggers AI image analysis and readiness scoring.

**Path parameter:** `productId`

**Request body**
```ts
{
  title: string              // required, non-empty
  description: string
  category: string
  materials: string[]
  dimensions: string
  selectedImageIds: string[] // required, at least 1
  sellerConfirmedText: boolean   // required true
  sellerConfirmedImages: boolean // required true
}
```

**Response `200`**
```ts
{
  product: { /* ProductImportSnapshot */ }
  selectedImages: Array<{ /* ImageCandidate */ }>
  readinessScore: number     // 0–100
}
```

---

### `POST /api/products/:productId/import/retry`

Re-scrape the original import URL from scratch. Useful when the initial scrape failed or returned incomplete data.

**Path parameter:** `productId`

**Request body:** none

**Response `200`** — same shape as `POST /api/products/import-url`.

---

### `POST /api/products/:productId/import/accept-cluster`

When a scraped page contains multiple products, accept one cluster (sub-product) and scope the import to its images and fields.

**Path parameter:** `productId`

**Request body**
```ts
{ clusterId: string }  // required
```

**Response `200`**
```ts
{ product: { /* ProductImportSnapshot */ } }
```

**Error `400`** — product has no clusters or `clusterId` not found.

---

### `POST /api/products/:productId/try-3d`

Kick off a 3D model generation job using the product's already-imported and selected source images.

**Path parameter:** `productId`

**Request body:** none

**Response `200`** — same shape as `POST /api/conversions`.

---

## AI Features

### `POST /api/ai/analyze-product`

Run Gemini analysis on the product: materials, confidence score, missing visuals, return risk factors, quality and merchant recommendations, and readiness score.

**Request body**
```ts
{ productId: string }
```

**Response `200`**
```ts
{
  analysis: {
    categorySuggestion?: string
    materials: string[]
    confidenceScore: number
    missingVisuals: string[]
    suggestedCopy: { seoTitle; bullets; description } | null
    returnRiskFactors: Array<{ risk: string; fix: string }>
    qualityRecommendations: string[]
    merchantRecommendations: string[]
    readinessScore?: number
    lastUpdatedAt: string
  }
}
```

---

### `POST /api/ai/generate-hotspots`

Generate 3–5 interactive hotspot suggestions for the product 3D viewer (material, dimension, feature, warning, or assembly annotations).

**Request body**
```ts
{ productId: string }
```

**Response `200`**
```ts
{
  hotspots: Array<{
    id: string
    title: string
    description: string
    type: "material" | "dimension" | "feature" | "warning" | "assembly"
    status: "pending"
  }>
}
```

---

### `POST /api/ai/generate-description`

Generate SEO-optimised e-commerce copy (title, bullet points, description) for the product.

**Request body**
```ts
{ productId: string }
```

**Response `200`**
```ts
{
  suggestedCopy: {
    seoTitle: string
    bullets: string[]
    description: string
  } | null
}
```

---

### `POST /api/ai/return-risk`

Identify return-risk factors and their suggested fixes for the product.

**Request body**
```ts
{ productId: string }
```

**Response `200`**
```ts
{
  returnRiskFactors: Array<{ risk: string; fix: string }>
}
```

---

### `POST /api/ai/quality-check`

Compute a composite readiness score and quality recommendations, combining:
- Conversion quality report (file size, triangle count, texture dim)
- Gemini Visual QA score (if available)
- Import image readiness (unique view coverage)

**Request body**
```ts
{ productId: string }
```

**Response `200`**
```ts
{
  readinessScore?: number       // 0–100
  qualityRecommendations: string[]
}
```

---

## Trendyol Integration

### `POST /api/ai/trendyol-listing`

Generate a Trendyol product listing draft (title, description, category, brand, pricing, attributes) using Gemini.

**Request body**
```ts
{ productId: string }
```

**Response `200`**
```ts
{
  draft: {
    title: string
    description: string
    categoryId: number
    brandName: string
    listPrice: number
    salePrice: number
    attributes: Array<{ name: string; value: string }>
  }
}
```

---

### `POST /api/trendyol/products`

Submit one or more product listings to the Trendyol catalog.

**Request body**
```ts
{
  items: TrendyolProduct[]   // at least 1
}
```

**Response `200`**
```ts
{ batchRequestId: string }
```

---

### `GET /api/trendyol/products/batch/:batchRequestId`

Poll the result of a Trendyol batch product submission.

**Path parameter:** `batchRequestId`

**Response `200`**
```ts
{
  batch: {
    batchRequestId: string
    status: string
    items: Array<{ ... }>
  }
}
```

---

### `GET /api/trendyol/unapproved`

List unapproved Trendyol products for the seller account (paginated, 20 per page).

**Query parameters**

| Name | Type | Default | Description |
|---|---|---|---|
| `page` | number | `0` | Zero-based page index |

**Response `200`**
```ts
{
  content: TrendyolUnapprovedProduct[]
  totalElements: number
}
```

---

### `POST /api/trendyol/buybox`

Retrieve buybox information for up to 10 product barcodes.

**Request body**
```ts
{ barcodes: string[] }   // 1–10 barcodes
```

**Response `200`**
```ts
{ result: TrendyolBuyboxResult[] }
```

---

### `GET /api/trendyol/orders`

List shipment packages (orders) with optional status filtering (paginated).

**Query parameters**

| Name | Type | Default | Description |
|---|---|---|---|
| `page` | number | `0` | Zero-based page index |
| `size` | number | `50` | Items per page |
| `status` | string | — | Filter by package status |

**Response `200`**
```ts
{
  content: TrendyolPackage[]
  totalPages: number
  totalElements: number
}
```

---

### `PUT /api/trendyol/orders/:packageId/status`

Update the status of a shipment package (e.g. mark as Picking or Invoiced).

**Path parameter:** `packageId`

**Request body**
```ts
{
  status: "Picking" | "Invoiced"  // required
  invoiceNumber?: string          // required when status = "Invoiced"
}
```

**Response `200`**
```ts
{ ok: true }
```

---

## Error Responses

All errors follow a consistent shape:

```ts
{ error: string }
```

| HTTP status | Condition |
|---|---|
| `400 Bad Request` | Missing or invalid request fields |
| `401 Unauthorized` | Missing, malformed, or expired bearer token |
| `404 Not Found` | Resource not found or not owned by the caller |
| `500 Internal Server Error` | Unexpected server or AI provider error |
