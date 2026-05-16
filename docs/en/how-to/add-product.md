---
title: Add a Product
description: Create a product entity, save it to Supabase, attach a source image, start a conversion, and display the status.
---

# Add a Product

## Create the product entity

Use `IdGenerator.generateId()` and the `Product` constructor from `@minimalblock/core`:

```ts
import { Product, generateId } from '@minimalblock/core'

const product = new Product({
  id: generateId(),
  name: formValues.name,
  description: formValues.description,
  category: formValues.category,
  ownerId: currentUser.id,
  createdAt: new Date(),
  updatedAt: new Date(),
})
```

Validate `formValues.category` against the `ProductCategory` union before constructing. The domain does not throw on invalid categories — it trusts the caller.

---

## Save with SupabaseProductRepository

```ts
import { getSupabaseClient, SupabaseProductRepository } from '@minimalblock/data'

const client = getSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
const productRepo = new SupabaseProductRepository(client)

await productRepo.save(product)
```

`save()` uses an upsert — calling it a second time with the same `id` updates the existing row. RLS ensures the `owner_id` in the row matches the authenticated session's `auth.uid()`.

---

## Attach a source image via useUpload

Wire the `FileUpload` component to `useUpload` from `@minimalblock/features`:

```tsx
import { FileUpload } from '@minimalblock/ui'
import { useUpload } from '@minimalblock/features'
import { SupabaseImageUploader } from '@minimalblock/data'

const uploader = new SupabaseImageUploader(client)
const { uploading, asset, error, upload } = useUpload(uploader, currentUser.id)

return (
  <FileUpload
    onFile={upload}
    onError={(reason) => console.error(reason)}
  />
)
```

`useUpload` calls `validateImageFile` internally. `asset` becomes a `MediaAsset` with a public Supabase Storage URL once the upload completes.

---

## Start a conversion via useConversion

```tsx
import { useConversion } from '@minimalblock/features'
import { GeminiModelGenerator, createGenerativeModel } from '@minimalblock/ai'
import { SupabaseConversionRepository } from '@minimalblock/data'

const model = createGenerativeModel(import.meta.env.VITE_GEMINI_API_KEY)
const generator = new GeminiModelGenerator(model)
const conversionRepo = new SupabaseConversionRepository(client)

const { converting, conversion, error, startConversion } = useConversion(
  generator,
  conversionRepo,
  currentUser.id,
)

// Call after asset is ready
if (asset) {
  await startConversion(asset, product.id)
}
```

`startConversion` creates a `Conversion` aggregate, saves it as `pending`, calls `generator.generate()`, uploads the resulting GLB, and saves the final `completed` (or `failed`) state.

---

## Check conversion status with StatusBadge

Render the current state inline with the `StatusBadge` component from `@minimalblock/ui`:

```tsx
import { StatusBadge } from '@minimalblock/ui'

{conversion && (
  <StatusBadge status={conversion.status.toString()} />
)}
```

`StatusBadge` accepts `'pending' | 'processing' | 'completed' | 'failed'` and renders a colour-coded label. Pair it with a `Spinner` during `processing` state for better perceived responsiveness.
