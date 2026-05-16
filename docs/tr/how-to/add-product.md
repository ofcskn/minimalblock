---
title: Ürün Ekle
description: Ürün varlığı oluşturun, Supabase'e kaydedin, kaynak görsel ekleyin, dönüşüm başlatın ve durumu gösterin.
---

# Ürün Ekle

## Ürün varlığını oluşturun

`@minimalblock/core` paketinden `IdGenerator.generateId()` ve `Product` yapıcısını kullanın:

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

Yapıcıyı çağırmadan önce `formValues.category` değerini `ProductCategory` union tipiyle doğrulayın. Alan, geçersiz kategorilerde hata fırlatmaz — çağıranı güvenilir kabul eder.

---

## SupabaseProductRepository ile kaydedin

```ts
import { getSupabaseClient, SupabaseProductRepository } from '@minimalblock/data'

const client = getSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
const productRepo = new SupabaseProductRepository(client)

await productRepo.save(product)
```

`save()`, bir upsert kullanır — aynı `id` ile ikinci kez çağırmak mevcut satırı günceller. RLS, satırdaki `owner_id` değerinin kimliği doğrulanmış oturumun `auth.uid()` değeriyle eşleşmesini sağlar.

---

## useUpload aracılığıyla kaynak görsel ekleyin

`FileUpload` bileşenini `@minimalblock/features` paketindeki `useUpload`'a bağlayın:

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

`useUpload`, dahili olarak `validateImageFile`'ı çağırır. Yükleme tamamlandıktan sonra `asset`, genel bir Supabase Storage URL'si olan bir `MediaAsset` olur.

---

## useConversion ile dönüşüm başlatın

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

// asset hazır olduğunda çağırın
if (asset) {
  await startConversion(asset, product.id)
}
```

`startConversion`, bir `Conversion` aggregate'i oluşturur, bunu `pending` olarak kaydeder, `generator.generate()` çağrısı yapar, elde edilen GLB'yi yükler ve son `completed` (veya `failed`) durumunu kaydeder.

---

## StatusBadge ile dönüşüm durumunu kontrol edin

Mevcut durumu `@minimalblock/ui` paketindeki `StatusBadge` bileşeniyle satır içi olarak render edin:

```tsx
import { StatusBadge } from '@minimalblock/ui'

{conversion && (
  <StatusBadge status={conversion.status.toString()} />
)}
```

`StatusBadge`, `'pending' | 'processing' | 'completed' | 'failed'` değerlerini kabul eder ve renk kodlu bir etiket render eder. Daha iyi bir kullanıcı deneyimi için `processing` durumunda bir `Spinner` ile birleştirin.
