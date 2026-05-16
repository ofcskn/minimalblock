---
title: Ürün Karar Notu
description: Projenin neden bu şekilde inşa edildiği — tasarım kararları, ödünleşimler ve hackathon sprintinde kabul edilen kısıtlamalar.
---

# Ürün Karar Notu

## Problem tanımı

E-ticaret ürün sayfaları düz fotoğraflara dayanır. Alışverişçiler, fiziksel olarak tutmadan bir nesneyi birden fazla açıdan inceleyemez; bu durum iade oranlarını artırır ve satın alma güvenini azaltır. Minimal Block'un amacı, tek bir ürün fotoğrafından etkileşimli bir 3D model oluşturarak bu açığı kapatmaktır — ürün başına API token kullanımının ötesinde sıfır marjinal maliyetle.

---

## Neden yapay zeka destekli 3D modeller

### Değerlendirilen alternatif yaklaşımlar

| Yaklaşım | Neden reddedildi |
|---|---|
| Fotogrametri (çok fotoğraflı tarama) | Ürün başına 20–100 fotoğraf ve özel donanım gerektirir. Bireysel satıcılar için uygun değil. |
| Manuel 3D modelleme | Serbest çalışan başına ürün maliyeti 50–500 USD. Uzun kuyruklu kataloglar için ölçeklenebilir değil. |
| 3D model pazarları | Genel modeller, bireysel satıcı envanterine uymaz. |
| Derinlik algılayan kameralar (LiDAR) | Donanım bağımlılığı. "Sadece bir fotoğraf yükle" değer önerisini ortadan kaldırır. |

Tek bir JPEG'den yapılan tek bir çok modlu LLM çağrısı, sıfıra yakın birim maliyetle keyfi bir ürün kataloğuna ölçeklenebilen tek yaklaşımdır.

### Maliyet ve gecikme değiş tokuşları

Mevcut fiyatlandırmada `balanced` kaliteli bir üretim için Gemini token maliyetleri model başına 0,01 USD'nin altındadır. Üretim gecikmesi, görsel boyutu ve sunucu yüküne bağlı olarak 8–20 saniyedir. Bu, asenkron bir arka plan işi için kabul edilebilirdir — kullanıcı ekran başında beklemez.

---

## Neden Gemini 2.0 Flash

Gemini 2.0 Flash Deneysel (`gemini-2.0-flash-exp`), 3D üretim için seçildi çünkü **çok modlu satır içi veri** desteği sunar — bir görsel ve metin prompt'u tek bir API çağrısında gönderilebilir; yanıt ise keyfi ikili içerik (GLB dosyası) olabilir. Hackathon sırasında genel olarak kullanılabilir başka hiçbir model bu kombinasyonu sunmuyordu.

Kategori/açıklama çıkarımı görevi için daha güvenilir yapılandırılmış JSON çıktısı ürettiğinden görsel analizi için `gemini-1.5-pro` (`ANALYSIS_MODEL_ID`) kullanılır.

---

## Neden Supabase

Supabase tek bir yönetilen platformda üç hizmet sunar:

1. **Kimlik Doğrulama** — JWT tabanlı oturum yönetimiyle e-posta + Google OAuth. İşletilecek kimlik doğrulama sunucusu yok.
2. **Depolama** — Klasör düzeyinde erişim politikalarıyla S3 uyumlu nesne depolama. Kaynak görsellerini ve oluşturulan GLB dosyalarını `{ownerId}/` altında depolar.
3. **Veritabanı** — Satır Düzeyi Güvenlikli PostgreSQL. RLS politikaları, `products` ve `conversions` üzerindeki her `SELECT`, `INSERT`, `UPDATE` ve `DELETE` işleminin veritabanı düzeyinde satır sahibiyle kısıtlanmasını sağlar.

RLS politikaları, hatalı veya ele geçirilmiş bir uygulama katmanının bile başka bir kullanıcının verilerini açıklayamayacağı anlamına gelir — veritabanı sorguyu reddeder.

---

## Neden Temiz Mimari (DDD)

### Altyapısız test edilebilirlik

Temel alan — `Conversion` durum geçişleri, `Product.isOwnedBy()`, `validateImageFile()` — ağ çağrısı olmadan milisaniyeler içinde birim test edilebilir. `IModelGeneratorPort` ve `IProductRepository`'nin sahte uygulamaları, Gemini ve Supabase'in yerine geçer. Bu, iş mantığı üzerindeki hızlı iterasyonun altyapı kullanılabilirliği tarafından engellenmemesi gereken bir hackathon sırasında kritik öneme sahiptir.

### Değiştirilebilir adaptörler

Gemini GLB çıktı özelliğini kaldırırsa, yedek yapay zeka sağlayıcısı `IModelGeneratorPort` arayüzünü uygulayarak bağlanır. Özellik hook'ları, alan mantığı ve kullanıcı arayüzü değişmez. Aynı durum veritabanı katmanı için de geçerlidir — Supabase'i başka bir Postgres sağlayıcısıyla değiştirmek, başka hiçbir dosyaya dokunmadan `SupabaseProductRepository` ve `SupabaseConversionRepository`'yi yeniden uygulamayı gerektirir.

---

## Kabul edilen kısıtlamalar

### Yalnızca GLB çıktı formatı

GLB (ikili glTF), `<model-viewer>` tarafından dönüştürme adımı olmadan desteklendiğinden seçildi. USDZ (Apple AR) ve OBJ ek işleme boru hatları gerektirir ve ertelendi.

### 10 MB görsel yükleme limiti

Supabase Storage ücretsiz planı, ürün fotoğrafçılığı için bu limiti yeterince karşılar. Mobil telefon fotoğrafları genellikle tam çözünürlükte 2–6 MB'a sıkıştırılır. Kısıtlama, herhangi bir bayt iletilmeden önce `validateImageFile` düzeyinde uygulanır.

### Dönüşüm başına tek model tasarımı

Her `Conversion` bir GLB üretir. Aynı dönüşüme yeniden deneme kalıbı yoktur. Başarısız bir dönüşüm yeniden oluşturulmalıdır. Bu, aggregate durum makinesini basit tutar ve kısmi güncelleme kenar durumlarını önler.

---

## Kapsam Dışı

Aşağıdakiler değerlendirildi ve 2 günlük sprintten kasıtlı olarak çıkarıldı:

| Özellik | Erteleme nedeni |
|---|---|
| Ödeme / ödeme akışı | Sıfır fatura altyapısı; 2 günlük inşa maliyeti engelleyici |
| Çok kullanıcılı takım katalogları | RLS modeli tek sahipli satırları varsayar; yeniden tasarım tam bir gün alır |
| AR / QR kodu görünümü | USDZ boru hattı ve ek cihaz testi gerektirir |
| Ürün fiyatı / stok alanları | Sprint sonlarında şema değişikliği riski; kullanıcı arayüzü bileşeni hazır değil |
| Mobil uygulama | Ayrı uygulama yapı iskeleti çalışması; demo için web öncelikli yeterli |
