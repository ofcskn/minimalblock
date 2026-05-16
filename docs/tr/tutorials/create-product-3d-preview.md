---
title: 3D Ürün Önizlemesi Oluştur
description: Uçtan uca rehber — ürün oluşturun, görsel yükleyin, Gemini ile GLB modeli oluşturun ve 3D görüntüleyicide gösterin.
---

# 3D Ürün Önizlemesi Oluştur

Bu ders, tam kullanıcı akışını oluşturur: bir ürün oluşturan, fotoğraf yükleyen, Gemini 3D üretimini tetikleyen ve sonucu etkileşimli bir görüntüleyicide render eden bir form.

**Başlamadan önce:** [Başlarken](/tr/tutorials/getting-started) dersini tamamlayın. `.env` dosyanızda üç değişkenin tamamı ayarlanmış olmalı ve Supabase migrasyonu uygulanmış olmalıdır.

---

## Ne inşa edeceksiniz

Şunları yapan tek sayfalık bir form:

1. Ürün adı, açıklama ve kategori kabul eder.
2. Kullanıcının bir JPEG/PNG/WebP fotoğrafı seçmesine izin verir (maks. 10 MB).
3. Fotoğrafı Supabase Storage'a yükler.
4. GLB modeli oluşturmak için Gemini'yi çağırır.
5. Modeli etkileşimli bir `<model-viewer>` içinde gösterir.

---

## 1. Adım — Ürün görseli yükleyin

### FileUpload'u useUpload ile bağlayın

Altyapı adaptörlerini bileşen düzeyinde bir kez başlatın ve `useUpload`'a bağlayın:

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

### Doğrulama hatalarını yönetin

`useUpload`, Supabase'e herhangi bir bayt göndermeden önce `validateImageFile`'ı çağırır. Dosya reddedilirse `error` değeri ayarlanır. Bunu kullanıcı arayüzünde gösterin:

```tsx
{uploadError && (
  <p className="text-red-600">{uploadError}</p>
)}
```

---

## 2. Adım — Yapay zeka dönüşümünü tetikleyin

### useConversion'ı GeminiModelGenerator ile bağlayın

`GeminiModelGenerator` ve `SupabaseConversionRepository`'yi başlatın, ardından `useConversion`'a aktarın:

```tsx
import { useConversion } from '@minimalblock/features'
import { GeminiModelGenerator, createGenerativeModel } from '@minimalblock/ai'
import { SupabaseConversionRepository } from '@minimalblock/data'

const geminiModel = createGenerativeModel(import.meta.env.VITE_GEMINI_API_KEY)
const generator = new GeminiModelGenerator(geminiModel)
const conversionRepo = new SupabaseConversionRepository(client)

// Bileşen içinde:
const { converting, conversion, error: conversionError, startConversion } = useConversion(
  generator,
  conversionRepo,
  user?.id ?? '',
)
```

Yükleme tamamlandıktan sonra (yani `asset` ayarlandığında) dönüşümü başlatın:

```tsx
useEffect(() => {
  if (asset && product) {
    startConversion(asset, product.id)
  }
}, [asset, product])
```

### Durum değişikliklerine tepki verin

`conversion.status`, `useConversion` ilerledikçe otomatik olarak güncellenir. `StatusBadge` ile gösterin:

```tsx
import { StatusBadge } from '@minimalblock/ui'

{conversion && (
  <StatusBadge status={conversion.status.toString()} />
)}
{conversionError && <p className="text-red-600">{conversionError}</p>}
```

---

## 3. Adım — 3D modeli gösterin

### ModelViewer'ı çıktı URL'si ile render edin

`conversion.status.isCompleted()` doğru olduğunda modeli gösterin:

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

### Yükleme ve hata durumlarını yönetin

`ModelViewerPlaceholder` şunları render eder:
- `pending` için tarafsız bir kutu
- `processing` için dönen animasyon
- `failed` için `conversion.errorMessage` içeren kırmızı hata mesajı

Bu durumlar için ek koşullu render işlemi gerekmez.

---

## 4. Adım — Galeriye kaydedin

### SupabaseProductRepository ile kaydedin

Dönüşümü başlatmadan önce `Product` varlığını oluşturun ve kaydedin:

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

### useGallery ile alın

Galeri sayfasında, geçerli kullanıcıya ait tüm ürünleri yüklemek için `useGallery`'yi kullanın:

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

Yeni bir ürün kaydedildikten sonra tam sayfa yenileme olmadan listeye eklemek için `refresh()`'i çağırın.
