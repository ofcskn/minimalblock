---
title: URL'den Ürün İçe Aktarma
description: APUS URL içe aktarma akışını kullanarak bir satıcı ürün sayfasından otomatik olarak ürün kaydı oluşturma.
---

# URL'den Ürün İçe Aktarma

APUS, desteklenen bir satıcı URL'sinden ürün verilerini — başlık, açıklama, kategori, malzemeler ve görseller — doğrudan çıkarabilir. Bu kılavuz, URL yapıştırmaktan 3D dönüştürme başlatmaya kadar tüm içe aktarma akışını adım adım anlatır.

---

## Ön koşullar

- Geçerli bir `GEMINI_API_KEY` ortam değişkeniyle çalışan Minimal Block API'si (`apps/api`).
- Aktif Supabase oturumuna sahip oturum açmış bir kullanıcı.
- Amazon, IKEA veya herhangi bir genel e-ticaret sitesinden bir ürün sayfası URL'si.

---

## Adım 1 — Ürün URL'sini yapıştırın

**Yeni Ürün** ekranında **URL'den İçe Aktar**'ı seçin ve ürün sayfası URL'sini giriş alanına yapıştırın.

API, `{ url: "<yapıştırılan-url>" }` ile `POST /import/url` çağrısı yapar.

URL hatalı biçimlendirilmişse veya protokol eksikse sunucu bunu otomatik olarak `https://` ile normalleştirir.

---

## Adım 2 — Çıkarılan verileri inceleyin

Çıkarma pipeline'ı altı APUS aşamasını çalıştırır (kazıma → yükleme → zeka → otomatik doldurma → küme → malzeme). Tamamlandığında, önceden doldurulmuş alanlarla inceleme paneli açılır.

Her alanda bir **güven rozeti** gösterilir:

| Rozet | Anlamı |
|---|---|
| `high` | Doğrudan yapısal bir veri kaynağından alındı (JSON-LD, özellikler tablosu) |
| `medium` | Görünür metinden kazındı; yapay zeka alternatif önerdi |
| `low` | Yalnızca yapay zeka tarafından çıkarıldı; kazıyıcı verisi yok |

İstediğiniz alanı düzenleyin — değişiklikler denetim izinde `editedBySeller: true` olarak izlenir.

---

## Adım 3 — Çok ürünlü sayfaları yönetin (gösterilirse)

Sayfa bir ürün demeti veya birden fazla farklı ürün içeriyorsa, inceleme panelinden önce **Küme Seçici** görünür.

Her küme kartında şunlar gösterilir:
- Küme etiketi ve güven skoru
- O ürüne atanan görseller

İçe aktarmak istediğiniz ürünle eşleşen kümeyi seçin, ardından **Bu ürünü kullan**'a tıklayın. API, `{ clusterId: "<id>" }` ile `POST /import/:productId/cluster/accept` çağrısı yapar. Kalan kümeler silinir.

---

## Adım 4 — Görselleri seçin

Görsel ızgarası, yapay zeka alaka skoru sırasına göre tüm çıkarılmış görselleri gösterir. `aiRejected` olarak işaretlenen görseller (logolar, afişler, UI varlıkları) varsayılan olarak gizlenir.

- 3D dönüştürmeye dahil etmek istediğiniz görselleri işaretleyin.
- Devam etmek için en az bir görsel seçilmeli.
- Pipeline en fazla altı görsel önceden seçer.

---

## Adım 5 — Onaylayın ve kaydedin

**Onayla ve Devam Et**'e tıklayın. Uygulama, satıcı tarafından onaylanan alanlar ve seçilen görsel ID'leriyle `POST /import/:productId/review` çağrısı yapar.

Ürünün `workflowStatus` değeri `autofill_ready` durumuna geçer ve ürün 3D dönüştürmeye hazır şekilde kontrol panelinizde görünür.

---

## Adım 6 — 3D dönüştürme başlatın (isteğe bağlı, hemen)

Ürün detay sayfasından **3D Model Oluştur**'a tıklayın. Seçilen görseller, çıkarılan `materialFinish` ve `geometryComplexity` değerleri kalite ipucu olarak kullanılarak dönüştürme pipeline'ına gönderilir.

---

## Sorun giderme

**Hiç görsel çıkarılamadı**

Kazıyıcı sayfada ürün görseli bulamadı. Bu durum, site ağır JavaScript render ettiğinde yaşanabilir. Doğrudan bir görsel URL'si deneyin veya görselleri manuel olarak yükleyin.

**Tüm alanlar `low` güvende**

Domain `best_effort` modunda. Kazıyıcı genel HTML çıkarımına geri döndü. Devam etmeden önce tüm alanları dikkatlice inceleyin.

**Küme seçici görünmüyor**

Sayfa tek ürünlü sayfa olarak algılandı. Çoğu ürün URL'si için beklenen davranış budur.

**İçe aktarma `scrape_failed` durumuyla başarısız oldu**

URL'nin herkese açık olduğundan (giriş duvarının arkasında olmadığından) emin olun. Domain kimlik doğrulama gerektiriyorsa, bunun yerine manuel yükleme kullanın.
