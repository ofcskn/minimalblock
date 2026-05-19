---
title: API Uç Noktaları
description: Minimal Block API'sinin tüm uç noktaları için eksiksiz referans — metodlar, istek gövdeleri ve yanıt şemaları.
outline: deep
---

# API Uç Noktaları

Tüm uç noktalar `apps/api` içindeki Cloudflare Worker tarafından sunulmaktadır.  
Temel URL (yerel geliştirme): `http://localhost:8787`  
Temel URL (üretim): Cloudflare Worker URL'niz veya özel alan adınız.

## Kimlik Doğrulama

`/health` ve `OPTIONS` ön kontrol isteği dışındaki tüm uç noktalar için Supabase JWT gereklidir:

```
Authorization: Bearer <supabase-erişim-tokeni>
```

Geçerli bir bearer token içermeyen istekler `401 Unauthorized` döndürür.

## CORS

Tüm yanıtlar şu başlıkları içerir:

```
Access-Control-Allow-Origin: <CORS_ORIGIN ortam değişkeni, varsayılan *>
Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS
Access-Control-Allow-Headers: authorization, content-type
```

Herhangi bir yola `OPTIONS` ön kontrol isteği göndererek `204 No Content` ve bu başlıkları alabilirsiniz.

---

## Sağlık Kontrolü

### `GET /health`

Worker'ın canlılık durumunu döndürür. Kimlik doğrulama gerektirmez.

**Yanıt `200`**
```json
{ "ok": true }
```

---

## Dönüşümler

### `POST /api/conversions`

Yeni bir ürün oluşturur ve kaynak görsellerden 3D model üretme işini başlatır.

**İstek gövdesi**
```ts
{
  product: {
    name: string            // zorunlu
    description?: string
    category: string        // örn. "furniture", "electronics"
  }
  sourceAssets: Array<{    // zorunlu, en az 1
    url: string
    storageKey: string
    mimeType: string        // örn. "image/jpeg"
    sizeBytes: number
  }>
  manualModelAsset?: {     // AI üretimini atla, bu GLB'yi doğrudan kullan
    url: string
    storageKey: string
    mimeType: string
    sizeBytes: number
  }
  qualityHint?: string     // Gemini'ye iletilen ipucu ("high_detail" vb.)
}
```

**Yanıt `200`**
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

Bir dönüşümün mevcut durumunu getirir.

**Yol parametresi:** `conversionId` — dönüşümün UUID'si.

**Yanıt `200`**
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

**Hata `404`** — dönüşüm bulunamadı veya çağırana ait değil.

---

### `POST /api/conversions/:conversionId/approve`

Bir dönüşümü onaylar ve 3D modeli yayınlar.  
Gemini üretim döngüsü için olumlu geri bildirim sinyali de kaydeder.

**Yol parametresi:** `conversionId`

**İstek gövdesi:** yok

**Yanıt `200`** — `GET /api/conversions/:id` ile aynı şema.

---

### `POST /api/conversions/:conversionId/reject`

Bir dönüşümü isteğe bağlı bir gerekçeyle reddeder.  
Üretim döngüsü için olumsuz geri bildirim sinyali kaydeder.

**Yol parametresi:** `conversionId`

**İstek gövdesi**
```ts
{ reason?: string }
```

**Yanıt `200`** — `GET /api/conversions/:id` ile aynı şema.

---

## Ürün İçe Aktarma

### `POST /api/products/import-url`

Bir ürün URL'sini tarar, görselleri ve meta verileri çıkarır, ardından isim, açıklama, kategori, malzeme ve boyutları doldurmak için AI otomatik doldurmayı çalıştırır.

**İstek gövdesi**
```ts
{ url: string }   // örn. "https://www.ikea.com/..."
```

**Yanıt `200`**
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

Satıcının incelediği ve onayladığı içe aktarma verilerini kaydeder — seçili görseller, düzenlenen alanlar ve onaylanan meta veriler.  
AI görsel analizini ve hazırlık puanlamasını tetikler.

**Yol parametresi:** `productId`

**İstek gövdesi**
```ts
{
  title: string              // zorunlu, boş olamaz
  description: string
  category: string
  materials: string[]
  dimensions: string
  selectedImageIds: string[] // zorunlu, en az 1
  sellerConfirmedText: boolean   // zorunlu, true olmalı
  sellerConfirmedImages: boolean // zorunlu, true olmalı
}
```

**Yanıt `200`**
```ts
{
  product: { /* ProductImportSnapshot */ }
  selectedImages: Array<{ /* ImageCandidate */ }>
  readinessScore: number     // 0–100
}
```

---

### `POST /api/products/:productId/import/retry`

Orijinal içe aktarma URL'sini sıfırdan yeniden tarar. İlk tarama başarısız olduğunda veya eksik veri döndürdüğünde kullanışlıdır.

**Yol parametresi:** `productId`

**İstek gövdesi:** yok

**Yanıt `200`** — `POST /api/products/import-url` ile aynı şema.

---

### `POST /api/products/:productId/import/accept-cluster`

Taranan sayfada birden fazla ürün bulunduğunda bir kümeyi (alt ürün) kabul eder ve içe aktarmayı o kümenin görselleri ve alanlarıyla sınırlar.

**Yol parametresi:** `productId`

**İstek gövdesi**
```ts
{ clusterId: string }  // zorunlu
```

**Yanıt `200`**
```ts
{ product: { /* ProductImportSnapshot */ } }
```

**Hata `400`** — üründe küme yok veya `clusterId` bulunamadı.

---

### `POST /api/products/:productId/try-3d`

Ürünün halihazırda içe aktarılmış ve seçilmiş kaynak görsellerini kullanarak 3D model üretme işini başlatır.

**Yol parametresi:** `productId`

**İstek gövdesi:** yok

**Yanıt `200`** — `POST /api/conversions` ile aynı şema.

---

## AI Özellikleri

### `POST /api/ai/analyze-product`

Ürün üzerinde Gemini analizi çalıştırır: malzemeler, güven puanı, eksik görseller, iade risk faktörleri, kalite ve satıcı önerileri ile hazırlık puanı.

**İstek gövdesi**
```ts
{ productId: string }
```

**Yanıt `200`**
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

3D görüntüleyici için 3–5 etkileşimli hotspot önerisi üretir (malzeme, boyut, özellik, uyarı veya montaj notları).

**İstek gövdesi**
```ts
{ productId: string }
```

**Yanıt `200`**
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

Ürün için SEO odaklı e-ticaret metni oluşturur (başlık, madde işaretleri, açıklama).

**İstek gövdesi**
```ts
{ productId: string }
```

**Yanıt `200`**
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

Ürün için iade risk faktörlerini ve önerilen çözümlerini belirler.

**İstek gövdesi**
```ts
{ productId: string }
```

**Yanıt `200`**
```ts
{
  returnRiskFactors: Array<{ risk: string; fix: string }>
}
```

---

### `POST /api/ai/quality-check`

Şunları birleştirerek bileşik bir hazırlık puanı ve kalite önerileri hesaplar:
- Dönüşüm kalite raporu (dosya boyutu, üçgen sayısı, doku boyutu)
- Gemini Görsel QA puanı (varsa)
- İçe aktarma görsel hazırlığı (benzersiz açı kapsamı)

**İstek gövdesi**
```ts
{ productId: string }
```

**Yanıt `200`**
```ts
{
  readinessScore?: number       // 0–100
  qualityRecommendations: string[]
}
```

---

## Trendyol Entegrasyonu

### `POST /api/ai/trendyol-listing`

Gemini kullanarak bir Trendyol ürün listesi taslağı oluşturur (başlık, açıklama, kategori, marka, fiyatlandırma, nitelikler).

**İstek gövdesi**
```ts
{ productId: string }
```

**Yanıt `200`**
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

Trendyol kataloğuna bir veya daha fazla ürün listesi gönderir.

**İstek gövdesi**
```ts
{
  items: TrendyolProduct[]   // en az 1
}
```

**Yanıt `200`**
```ts
{ batchRequestId: string }
```

---

### `GET /api/trendyol/products/batch/:batchRequestId`

Trendyol toplu ürün gönderiminin sonucunu sorgular.

**Yol parametresi:** `batchRequestId`

**Yanıt `200`**
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

Satıcı hesabındaki onaylanmamış Trendyol ürünlerini listeler (sayfalı, sayfa başına 20).

**Sorgu parametreleri**

| Ad | Tür | Varsayılan | Açıklama |
|---|---|---|---|
| `page` | sayı | `0` | Sıfır tabanlı sayfa dizini |

**Yanıt `200`**
```ts
{
  content: TrendyolUnapprovedProduct[]
  totalElements: number
}
```

---

### `POST /api/trendyol/buybox`

En fazla 10 ürün barkodu için buybox bilgisini getirir.

**İstek gövdesi**
```ts
{ barcodes: string[] }   // 1–10 barkod
```

**Yanıt `200`**
```ts
{ result: TrendyolBuyboxResult[] }
```

---

### `GET /api/trendyol/orders`

İsteğe bağlı durum filtresiyle sevkiyat paketlerini (siparişleri) listeler (sayfalı).

**Sorgu parametreleri**

| Ad | Tür | Varsayılan | Açıklama |
|---|---|---|---|
| `page` | sayı | `0` | Sıfır tabanlı sayfa dizini |
| `size` | sayı | `50` | Sayfa başına öğe sayısı |
| `status` | dize | — | Paket durumuna göre filtrele |

**Yanıt `200`**
```ts
{
  content: TrendyolPackage[]
  totalPages: number
  totalElements: number
}
```

---

### `PUT /api/trendyol/orders/:packageId/status`

Bir sevkiyat paketinin durumunu günceller (örn. Picking veya Invoiced olarak işaretleme).

**Yol parametresi:** `packageId`

**İstek gövdesi**
```ts
{
  status: "Picking" | "Invoiced"  // zorunlu
  invoiceNumber?: string          // status = "Invoiced" ise zorunlu
}
```

**Yanıt `200`**
```ts
{ ok: true }
```

---

## Hata Yanıtları

Tüm hatalar tutarlı bir şemayı izler:

```ts
{ error: string }
```

| HTTP Durum Kodu | Koşul |
|---|---|
| `400 Bad Request` | Eksik veya geçersiz istek alanları |
| `401 Unauthorized` | Eksik, hatalı biçimli veya süresi dolmuş bearer token |
| `404 Not Found` | Kaynak bulunamadı veya çağırana ait değil |
| `500 Internal Server Error` | Beklenmedik sunucu veya AI sağlayıcı hatası |
