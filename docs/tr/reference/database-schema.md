---
title: Veritabanı Şeması
description: Minimal Block için Supabase tabloları, enumlar, dizinler, RLS politikaları ve depolama klasörü yapılandırması.
outline: deep
---

# Veritabanı Şeması

Migrasyon kaynağı: `libs/data/src/lib/migrations/001_initial_schema.sql`

---

## Enum: conversion_status

```sql
CREATE TYPE conversion_status AS ENUM ('pending', 'processing', 'completed', 'failed');
```

| Değer | Anlamı |
|---|---|
| `pending` | İş oluşturuldu, henüz başlatılmadı |
| `processing` | Gemini API çağrısı devam ediyor |
| `completed` | GLB modeli oluşturuldu ve depolandı |
| `failed` | Kurtarılamaz hata; `error_message` alanına bakın |

---

## Tablo: products

```sql
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Sütunlar

| Sütun | Tip | Null | Varsayılan | Notlar |
|---|---|---|---|---|
| `id` | `UUID` | Hayır | `gen_random_uuid()` | Birincil anahtar |
| `name` | `TEXT` | Hayır | — | Ürün görünen adı |
| `description` | `TEXT` | Hayır | `''` | Serbest metin açıklama |
| `category` | `TEXT` | Hayır | — | `ProductCategory` değerlerinden biri |
| `owner_id` | `UUID` | Hayır | — | FK → `auth.users.id` |
| `created_at` | `TIMESTAMPTZ` | Hayır | `NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | Hayır | `NOW()` | Her değişiklikte manuel olarak güncelleyin |

### Dizinler

```sql
CREATE INDEX idx_products_owner_id ON products(owner_id);
```

### RLS politikaları

Satır Düzeyi Güvenlik etkindir. Tüm işlemler satır sahibiyle kısıtlanmıştır.

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_owner_select" ON products FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "products_owner_insert" ON products FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "products_owner_update" ON products FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "products_owner_delete" ON products FOR DELETE USING (auth.uid() = owner_id);
```

---

## Tablo: conversions

```sql
CREATE TABLE conversions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  owner_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_asset_url    TEXT NOT NULL,
  source_asset_key    TEXT NOT NULL,
  source_asset_mime   TEXT NOT NULL,
  source_asset_size   BIGINT NOT NULL,
  output_asset_url    TEXT,
  output_asset_key    TEXT,
  output_asset_mime   TEXT,
  output_asset_size   BIGINT,
  status              conversion_status NOT NULL DEFAULT 'pending',
  error_message       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Sütunlar

| Sütun | Tip | Null | Varsayılan | Notlar |
|---|---|---|---|---|
| `id` | `UUID` | Hayır | `gen_random_uuid()` | Birincil anahtar |
| `product_id` | `UUID` | Hayır | — | FK → `products.id` |
| `owner_id` | `UUID` | Hayır | — | FK → `auth.users.id` |
| `source_asset_url` | `TEXT` | Hayır | — | Yüklenen görselin genel URL'si |
| `source_asset_key` | `TEXT` | Hayır | — | Depolama nesnesi yolu |
| `source_asset_mime` | `TEXT` | Hayır | — | `image/jpeg`, `image/png` veya `image/webp` |
| `source_asset_size` | `BIGINT` | Hayır | — | Bayt cinsinden dosya boyutu |
| `output_asset_url` | `TEXT` | Evet | `NULL` | GLB'nin genel URL'si; tamamlanana kadar `NULL` |
| `output_asset_key` | `TEXT` | Evet | `NULL` | GLB'nin depolama nesnesi yolu |
| `output_asset_mime` | `TEXT` | Evet | `NULL` | Ayarlandığında her zaman `model/gltf-binary` |
| `output_asset_size` | `BIGINT` | Evet | `NULL` | Bayt cinsinden GLB boyutu |
| `status` | `conversion_status` | Hayır | `'pending'` | Mevcut yaşam döngüsü durumu |
| `error_message` | `TEXT` | Evet | `NULL` | `failed` durumunda doldurulur |
| `created_at` | `TIMESTAMPTZ` | Hayır | `NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | Hayır | `NOW()` | |

### Dizinler

```sql
CREATE INDEX idx_conversions_owner_id   ON conversions(owner_id);
CREATE INDEX idx_conversions_product_id ON conversions(product_id);
CREATE INDEX idx_conversions_status     ON conversions(status);
```

### RLS politikaları

```sql
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversions_owner_select" ON conversions FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "conversions_owner_insert" ON conversions FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "conversions_owner_update" ON conversions FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "conversions_owner_delete" ON conversions FOR DELETE USING (auth.uid() = owner_id);
```

---

## Depolama: media-assets klasörü

### Klasör yapılandırması

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-assets', 'media-assets', true);
```

Klasör **genel (public)** yapılandırılmıştır — kimliği doğrulanmış veya anonim herhangi bir istemci nesneleri okuyabilir. Yazma ve silme erişimi sahip bazlıdır (aşağıdaki politikalara bakın).

Nesneler, sahip ön ekli bir yol altında depolanır: `{owner_id}/{dosya_adı}`. `SupabaseImageUploader`, bu kuralı otomatik olarak uygular.

### Depolama politikaları

```sql
CREATE POLICY "media_assets_owner_upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "media_assets_owner_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "media_assets_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'media-assets');
```

---

## Migrasyon dosyasının konumu

```
libs/data/src/lib/migrations/001_initial_schema.sql
```

Supabase SQL editöründe bir kez çalıştırın. Adım adım talimatlar için [Supabase Yapılandır](/tr/how-to/configure-supabase) rehberine bakın.
