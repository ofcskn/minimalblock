# Hotspot Kalitesi — Referans

Faz 6, `HotspotQuality` adlı saf bir alan değer nesnesi sunar. Bu nesne, satıcının ürün sayfasını yayınlamadan önce her hotspot'ı bir dizi kurala göre doğrular.

## Durum değerleri

| Durum | Anlam |
|-------|-------|
| `valid` | Hotspot tüm kontrolleri geçer ve yayınlanabilir |
| `warning` | Bir veya daha fazla yumuşak sorun var; yayınlama hâlâ mümkün ama kalite düşük |
| `invalid` | Bir veya daha fazla sert sorun var; çözülene kadar yayın engellenir |

## Doğrulama kuralları

### Sert kurallar (`invalid` üretir)

| Kod | Kural |
|-----|-------|
| `empty_label` | F.9 — Etiket boş ya da yalnızca boşluktan oluşmamalı |
| `meaningless_label` | F.10 — Etiket genel bir yer tutucu olmamalı (hotspot, point, label, todo …) |
| `test_label` | F.11 — Etiket test kalıntısı olmamalı (test, foo, bar, asdf, temp …) |
| `label_too_short` | F.12 — Etiket en az 3 karakter olmalı |

### Yumuşak kurallar (`warning` üretir)

| Kod | Kural |
|-----|-------|
| `missing_description` | F.13 — Alıcıya yararlı bir açıklama eklenmeli |
| `description_too_short` | F.13 — Açıklama en az 10 karakter olmalı |
| `missing_type` | F.14 — `material \| dimension \| feature \| warning \| assembly` türlerinden biri seçilmeli |
| `missing_position` | F.16 — Hotspot 3D modele yerleştirilmeli (konum + normal gerekli) |

## API

```typescript
import { HotspotQuality } from '@minimalblock/core';

// Tek bir hotspot'u doğrula
const report = HotspotQuality.validate(hotspot, 'bags');
// { hotspotId, status, issues }

// Ürünteki tüm hotspot'ları doğrula
const reports = HotspotQuality.validateAll(product.hotspots, product.category);

// Yayın uygunluğunu kontrol et
const blocked = HotspotQuality.hasInvalidHotspots(product.hotspots);

// Satıcı onayını kontrol et
const ready = HotspotQuality.allApproved(product.hotspots);
```

## Onay kapısı (F.15, F.19)

Herhangi bir hotspot'ın `status === 'invalid'` olması durumunda yayın engellenir. `HotspotEditorPanel` bileşeni bu durumu kırmızı bir banner ile gösterir ve geçersiz hotspot sayısını bildirir.

Satıcılar, onay geçiş düğmesini kullanarak her hotspot'ı tek tek onaylar (F.5). Onay bilgisi `Hotspot.approved: boolean` olarak saklanır ve ürünün `hotspots` JSONB sütununa yazılır.

## Hotspot türleri

| Tür | Kullanım |
|-----|----------|
| `material` | Ürünün yapıldığı malzeme (deri, alüminyum, seramik) |
| `dimension` | Ölçülebilir bir özellik (genişlik, derinlik, ağırlık) |
| `feature` | İşlevsel ya da tasarım özelliği (manyetik kilit, USB-C portu) |
| `warning` | Satıcının alıcıya bildirmesi gereken bir uyarı (renk farklılığı, montaj gerektirir) |
| `assembly` | Yapısal bir bileşen detayı (menteşe, soket, bağlantı elemanı) |
