---
title: Create a 3D Product Preview
description: End-to-end walkthrough — create a product, upload an image, generate a GLB model with Gemini, and display it in the 3D viewer.
---

# Create a 3D Product Preview

This tutorial builds the full user-facing flow: a form that creates a product, uploads a photo, triggers Gemini 3D generation, and renders the result in an interactive viewer.

**Before you start:** Complete the [Getting Started](/en/tutorials/getting-started) tutorial. Your `.env` must have all three variables set and the Supabase migration must be applied.

---

## What you will build

A single-page form that:

1. Accepts a product name, description, and category.
2. Lets the user pick a JPEG/PNG/WebP photo (max 10 MB).
3. Uploads the photo to Supabase Storage.
4. Calls Gemini to generate a GLB model.
5. Displays the model in an interactive `<model-viewer>`.

---

## Step 1 — Upload a product image

### Wire FileUpload to useUpload

Initialize the infrastructure adapters once at the component level and connect them to `useUpload`:

```tsx
import { useEffect } from 'react'
import { FileUpload, Spinner } from '@minimalblock/ui'
import { useUpload, useAuth } from '@minimalblock/features'
import { getSupabaseClient, SupabaseImageUploader } from '@minimalblock/data'

const client = getSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

function ProductForm() {
  const { user } = useAuth(client)
  const uploader = new SupabaseImageUploader(client)
  const { uploading, asset, error: uploadError, upload } = useUpload(
    uploader,
    user?.id ?? '',
  )

  return (
    <div>
      <FileUpload onFile={upload} onError={console.error} />
      {uploading && <Spinner />}
    </div>
  )
}
```

### Handle validation errors

`useUpload` calls `validateImageFile` before sending any bytes to Supabase. If the file is rejected, `error` is set. Surface it in the UI:

```tsx
{uploadError && (
  <p className="text-red-600">{uploadError}</p>
)}
```

---

## Step 2 — Trigger the AI conversion

### Wire useConversion with GeminiModelGenerator

Instantiate `GeminiModelGenerator` and `SupabaseConversionRepository`, then pass them to `useConversion`:

```tsx
import { useConversion } from '@minimalblock/features'
import { GeminiModelGenerator, createGenerativeModel } from '@minimalblock/ai'
import { SupabaseConversionRepository } from '@minimalblock/data'

const geminiModel = createGenerativeModel(import.meta.env.VITE_GEMINI_API_KEY)
const generator = new GeminiModelGenerator(geminiModel)
const conversionRepo = new SupabaseConversionRepository(client)

// Inside the component:
const { converting, conversion, error: conversionError, startConversion } = useConversion(
  generator,
  conversionRepo,
  user?.id ?? '',
)
```

After the upload completes (i.e., `asset` is set), start the conversion:

```tsx
useEffect(() => {
  if (asset && product) {
    startConversion(asset, product.id)
  }
}, [asset, product])
```

### React to status changes

`conversion.status` updates automatically as `useConversion` progresses. Display it with `StatusBadge`:

```tsx
import { StatusBadge } from '@minimalblock/ui'

{conversion && (
  <StatusBadge status={conversion.status.toString()} />
)}
{conversionError && <p className="text-red-600">{conversionError}</p>}
```

---

## Step 3 — Display the 3D model

### Render ModelViewer with the output URL

Show the model once `conversion.status.isCompleted()` is true:

```tsx
import { ModelViewer, ModelViewerPlaceholder } from '@minimalblock/ui'

const modelReady = conversion?.status.isCompleted() && conversion.outputAsset

{modelReady ? (
  <ModelViewer
    src={conversion.outputAsset.url}
    alt={product.name}
    autoRotate
    cameraControls
    className="h-80 w-full rounded-xl"
  />
) : (
  <ModelViewerPlaceholder
    status={conversion?.status.toString() ?? 'pending'}
    errorMessage={conversion?.errorMessage}
  />
)}
```

### Handle loading and error states

`ModelViewerPlaceholder` renders:
- A neutral box for `pending`
- A spinner animation for `processing`
- A red error message with `conversion.errorMessage` for `failed`

No additional conditional rendering is needed around these states.

---

## Step 4 — Persist to the gallery

### Save via SupabaseProductRepository

Create the `Product` entity and save it before starting the conversion:

```ts
import { Product, generateId } from '@minimalblock/core'
import { SupabaseProductRepository } from '@minimalblock/data'

const productRepo = new SupabaseProductRepository(client)

const product = new Product({
  id: generateId(),
  name: formValues.name,
  description: formValues.description,
  category: formValues.category,
  ownerId: user.id,
  createdAt: new Date(),
  updatedAt: new Date(),
})

await productRepo.save(product)
```

### Retrieve with useGallery

On the gallery page, use `useGallery` to load all products owned by the current user:

```tsx
import { useGallery } from '@minimalblock/features'

const { products, loading, refresh } = useGallery(productRepo, user.id)

return (
  <div className="grid grid-cols-3 gap-4">
    {products.map((p) => (
      <ProductCard key={p.id} product={p} />
    ))}
  </div>
)
```

Call `refresh()` after a new product is saved to add it to the list without a full page reload.
