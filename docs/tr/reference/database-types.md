---
title: Veritabanı Tipleri
description: Minimal Block şemasında kullanılan her PostgreSQL ve Supabase'e özgü tip — primitifler, enum'lar, RLS mekanizmaları ve depolama yolu kuralları.
outline: deep
---

# Veritabanı Tipleri

Bu sayfa, Minimal Block Supabase şemasında kullanılan her tip, enum ve yapısal kalıbı açıklar. Migrasyon dosyalarını okurken, sorgu yazarken veya veritabanı satırlarını alan nesnelerine eşlerken bu sayfayı referans olarak kullanın.

Migrasyon kaynağı: `supabase/migrations/001_initial_schema.sql`

---

## PostgreSQL İlkel Tipler

### UUID

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
owner_id UUID NOT NULL REFERENCES auth.users(id)
```

| Özellik | Detay |
|---|---|
| Boyut | 16 bayt |
| Format | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (RFC 4122) |
| Varsayılan | `gen_random_uuid()` — kriptografik olarak rastgele v4 |
| Sıralanabilir | Hayır — UUID'ler sıralı değildir |

Tüm birincil anahtarlar (`id`) ve yabancı anahtarlar (`owner_id`, `product_id`) `UUID` tipindedir. Supabase Auth kullanıcı ID'leri de UUID olduğundan `owner_id REFERENCES auth.users(id)` doğrudan auth katmanına bağlı bir yabancı anahtardır.

**Neden SERIAL / BIGSERIAL kullanılmadı?** Sıralı tam sayılar, satır sayısını istemcilere sızdırır ve ID'leri tahmin edilebilir kılar. UUID v4 tahmin edilemez ve URL'lerde güvenle kullanılabilir.

---

### TEXT

```sql
name        TEXT NOT NULL
description TEXT NOT NULL DEFAULT ''
category    TEXT NOT NULL
error_message TEXT
```

| Özellik | Detay |
|---|---|
| Maksimum uzunluk | Sınırsız (teorik olarak 1 GB) |
| Kodlama | UTF-8 |
| İndeksleme | B-tree (tam) veya GIN (tam metin) |

`TEXT`, tüm metin sütunları için kullanılır: ürün adları, açıklamalar, depolama anahtarları, URL'ler, MIME tipleri ve hata mesajları. PostgreSQL, `TEXT` ile `VARCHAR(n)` arasında performans açısından pratik bir fark gözetmez. `VARCHAR(n)`'nin uzunluk kısıtlaması depolama tasarrufu sağlamaz ve gereksiz doğrulama yükü ekler.

---

### TIMESTAMPTZ

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

| Özellik | Detay |
|---|---|
| Depolama | 8 bayt |
| Hassasiyet | Mikrosaniye |
| Saat dilimi | Dahili olarak UTC, oturum saat diliminde görüntülenir |

`TIMESTAMPTZ` (zaman dilimiyle zaman damgası), belirsizlik olmadan bir anı depolar. `NOW()` her zaman mevcut UTC anını döndürür. JavaScript bu değerleri ISO 8601 dizileri (`"2026-05-16T10:30:00Z"`) olarak alır ve `libs/data` içindeki `rowToProduct()` ile `rowToConversion()` fonksiyonlarında `Date` nesnelerine dönüştürülür.

**Neden TIMESTAMP (zaman dilimi olmadan) kullanılmadı?** `TIMESTAMP`, saat dilimi bağlamı olmadan duvar saati zamanını kaydeder. Veritabanı sunucusunun saat dilimi değiştiğinde veya kayıtlar farklı bölgelerdeki istemciler tarafından okunduğunda veri bozulması hatalarına yol açar.

---

### BIGINT

```sql
source_asset_size BIGINT NOT NULL
output_asset_size BIGINT
```

| Özellik | Detay |
|---|---|
| Aralık | −9.223.372.036.854.775.808 ile 9.223.372.036.854.775.807 |
| Depolama | 8 bayt |
| Temsil edilebilen maksimum dosya boyutu | ~9,2 eksabayt |

Dosya boyutları bayt cinsinden `BIGINT` olarak saklanır; `INT` (4 baytlık tam sayı, maksimum ~2,1 GB) yerine 8 baytlık tam sayı kullanılır. 10 MB'lık bir yükleme `INT`'e sığar, ancak GLB çıktı dosyaları ve gelecekteki ihtiyaçlar 8 baytlık tam sayıları gerektirir.

**TypeScript eşlemesi:** Supabase JS, `BIGINT`'i JavaScript `number` olarak döndürür. Bu, 2^53 − 1 bayta (~8 petabayt) kadar güvenlidir.

---

## Özel Enum: conversion_status

```sql
CREATE TYPE conversion_status AS ENUM ('pending', 'processing', 'completed', 'failed');
```

| Değer | Anlam | Sonlandırıcı mı? |
|---|---|---|
| `pending` | İş oluşturuldu, henüz işleme alınmadı | Hayır |
| `processing` | Gemini API çağrısı devam ediyor | Hayır |
| `completed` | GLB modeli oluşturuldu ve `media-assets`'e kaydedildi | Evet |
| `failed` | Kurtarılamayan hata; `error_message` alanına bakın | Evet |

PostgreSQL, bu küme dışındaki hiçbir değerin eklenmemesini zorlar. `UPDATE conversions SET status = 'cancelled'` gibi bir deneme tip hatası ile başarısız olur.

### Durum makinesi

```
pending → processing → completed
                    ↘ failed
(sonlandırıcı olmayan herhangi bir durum) → failed
```

`libs/core`'daki `Conversion` alan toplayıcısı bu geçişleri zorlar:

- `markProcessing()` — yalnızca `pending` durumundan
- `markCompleted(outputAsset)` — yalnızca `processing` durumundan
- `markFailed(reason)` — sonlandırıcı olmayan herhangi bir durumdan

### TypeScript eşlemesi

```ts
// libs/core
export type ConversionStatusValue = 'pending' | 'processing' | 'completed' | 'failed';

export class ConversionStatus {
  readonly value: ConversionStatusValue;
  static from(value: ConversionStatusValue): ConversionStatus
  isTerminal(): boolean
}
```

Depo (repository), veritabanı satırını alan nesnesine eşlerken `ConversionStatus.from(row.status)` çağırır.

---

## Nullable ve NOT NULL

| Kalıp | Örnek | Anlam |
|---|---|---|
| `NOT NULL` | `name TEXT NOT NULL` | Sütun her zaman değer içermelidir; veritabanı seviyesinde zorunlu |
| `NOT NULL DEFAULT ''` | `description TEXT NOT NULL DEFAULT ''` | NULL yerine boş dize; istemci kodunu basitleştirir |
| Nullable (değiştirici yok) | `output_asset_url TEXT` | Dönüşüm tamamlanana kadar `NULL` |
| `BIGINT` nullable | `output_asset_size BIGINT` | Çıktı henüz oluşturulmadığında `NULL` |

`conversions` tablosundaki `output_*` sütunları tamamen null olabilir — dönüşüm `pending` veya `processing` durumundayken `NULL` olarak başlar ve dönüşüm `completed` durumuna geçtiğinde atomik olarak doldurulur.

---

## Satır Düzeyi Güvenlik (RLS)

Tüm tablolarda RLS etkinleştirilmiştir. Her politika iki yan tümce türünden birini kullanır:

### USING yan tümcesi

```sql
CREATE POLICY "products_owner_select" ON products
  FOR SELECT USING (auth.uid() = owner_id);
```

`USING` yan tümcesi, veritabanı aday satırları getirdikten **sonra** uygulanan bir satır filtresidir. Yalnızca ifadenin `true` olarak değerlendirildiği satırlar döndürülür. `SELECT`, `UPDATE` ve `DELETE` işlemlerine uygulanır.

`auth.uid()`, JWT'deki kimliği doğrulanmış kullanıcının UUID'sini döndüren bir Supabase fonksiyonudur. Kimlik doğrulanmamış bir istek sıfır satır döndürür.

### WITH CHECK yan tümcesi

```sql
CREATE POLICY "products_owner_insert" ON products
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
```

`WITH CHECK` yan tümcesi, **yeni satırları** yazılmadan önce doğrular. `INSERT` ve `UPDATE` işlemlerine uygulanır. İfade `false` olarak değerlendirilirse, uygulama katmanı sahip uyuşmazlığı göndermemiş olsa bile işlem izin hatasıyla reddedilir.

### Her ikisinin önemi

`INSERT INTO products (owner_id) VALUES ('baskasinin-id')` gibi hatalı bir uygulama, `WITH CHECK` tarafından reddedilir. `owner_id` ile filtreleme yapmadan getirme yapan hatalı bir sorgu, `USING` sayesinde yalnızca çağıranın kendi satırlarını döndürür. Veritabanı, uygulama katmanından bağımsız olarak doğruluğu zorlar.

---

## Depolama: Nesne Yolu Kuralı

`media-assets` paketindeki nesneler şu adlandırma kalıbını izler:

```
{owner_id}/{filename}
```

Örnek:

```
3f8a1e2b-4d5c-4f6e-9a7b-8c9d0e1f2a3b/1716810000000-product.jpg
3f8a1e2b-4d5c-4f6e-9a7b-8c9d0e1f2a3b/1716810045000-model.glb
```

Depolama yükleme politikası bunu zorlar:

```sql
CREATE POLICY "media_assets_owner_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

`storage.foldername(name)[1]`, ilk yol segmentini çıkarır ve kimliği doğrulanmış kullanıcının UUID'siyle karşılaştırır. `baska-kullanici-id/dosya.jpg` konumuna yükleme reddedilir.

Paket **herkese açık** — tüm istemciler (kimlik doğrulanmamış dahil) nesneleri genel URL aracılığıyla okuyabilir. Yazma ve silme işlemleri sahip kapsamlıdır.

---

## Tip Eşleme Özeti

| PostgreSQL tipi | TypeScript tipi | Notlar |
|---|---|---|
| `UUID` | `string` | Supabase JS dize olarak döndürür |
| `TEXT` | `string` | Doğrudan eşleme |
| `TIMESTAMPTZ` | `Date` (`new Date(row.created_at)` sonrası) | Supabase JS ISO 8601 dizisi döndürür |
| `BIGINT` | `number` | 2^53 bayta kadar güvenli |
| `conversion_status` enum | `ConversionStatusValue` | `'pending' \| 'processing' \| 'completed' \| 'failed'` |
| `TEXT` (nullable) | `string \| null` | Supabase JS, SQL `NULL` için `null` döndürür |
| `BIGINT` (nullable) | `number \| null` | Aynı kalıp |
