---
title: Ürün Kategorileri
description: ProductCategory için kullanılabilir değerler ve her birinin yapay zeka 3D üretimini nasıl etkilediği.
---

# Ürün Kategorileri

`ProductCategory` union tipi `libs/core/src/lib/domain/entities/product.entity.ts` dosyasında tanımlanmıştır.

```ts
type ProductCategory = 'house' | 'furniture' | 'vehicle' | 'appliance' | 'other'
```

---

## Mevcut değerler

### house (ev)

Gayrimenkul veya mimari nesneler: binalar, odalar, cepheler, kat planları.

3D üretim prompt'u, Gemini'ye dış oranları ve büyük yapısal geometriyi korumasını söyler. Görsel tek bir odaya odaklanmıyorsa iç mekan detayı önceliklendirilmez.

### furniture (mobilya)

Sandalyeler, masalar, koltuklar, raflar, yataklar ve benzeri ev eşyaları.

Gemini, kenarlar ve bacaklar etrafında sıkı geometrik doğruluk sağlayan modeller üretir. Kaynak görselde görünüyorsa kumaş dokusu veya ahşap tanesi PBR materyallerine yansıtılır.

### vehicle (araç)

Arabalar, motosikletler, bisikletler, scooterlar ve benzeri ulaşım nesneleri.

Prompt, kaporta eğriliğinin ve tekerlek geometrisinin korunmasını talep eder. Fotoğrafın boya veya krom gösterdiği yerlerde yansıtıcı metalik materyaller uygulanır.

### appliance (beyaz eşya)

Mutfak veya ev aletleri: buzdolapları, çamaşır makineleri, fırınlar, mikrodalgalar.

Gemini, köşeli formları, kontrol paneli detaylarını ve tutma yeri geometrisini ön plana çıkarır. Materyaller, görsele göre mat plastik veya paslanmaz çelik olarak varsayılan değer alır.

### other (diğer)

Yukarıdaki kategorilere uymayan herhangi bir nesne.

Prompt, kategoriye özgü yönlendirmeyi atlar ve Gemini'den geometriyi doğrudan fotoğraftan çıkarmasını ister. Kategori gerçekten belirsiz olduğunda bunu kullanın.

---

## Kategoriler 3D üretimi nasıl etkiler

### buildConvert2DTo3DPrompt aracılığıyla prompt enjeksiyonu

`libs/ai/src/lib/prompts/convert-2d-to-3d.prompt.ts` dosyasındaki `buildConvert2DTo3DPrompt(productCategory, quality)` işlevi, kategori değerini prompt dizesine yerleştirir:

```
You are an expert 3D modelling AI. The user has provided a 2D photograph of a {productCategory}.
```

Gemini bunu, üretim sırasında alana özgü geometrik buluşsal yöntemler uygulamak için kullanır.

### Kalite ipucu etkileşimi

`qualityHint` parametresi kategoriden bağımsızdır — poligon yoğunluğunu ve doku çözünürlüğünü kontrol eder, kategoriye özgü davranışı değil:

| Kalite | Etki |
|---|---|
| `fast` | Az poligon, hızlı yükleme, minimal doku detayı |
| `balanced` | Orta düzey detay ve dosya boyutu (varsayılan) |
| `quality` | Yüksek kaliteli PBR materyaller, yoğun geometri |

---

## Kategorileri genişletin

Union tipi, hackathon kapsamı için kasıtlı olarak dardır. Yeni bir kategori eklemek için:

1. `ProductCategory`'ye yeni dize değerini [product.entity.ts](../../libs/core/src/lib/domain/entities/product.entity.ts) dosyasında ekleyin.
2. Yeni kategori özel üretim yönlendirmesi gerektiriyorsa [convert-2d-to-3d.prompt.ts](../../libs/ai/src/lib/prompts/convert-2d-to-3d.prompt.ts) dosyasındaki `qualityInstructions` veya prompt gövdesini güncelleyin.
3. Veritabanı düzeyinde zorlama istiyorsanız Supabase'deki `category` sütununa bir kontrol kısıtlaması ekleyin.
