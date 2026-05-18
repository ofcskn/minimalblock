# Hotspot yönetimi (Faz 6)

Hotspot'lar, 3D model üzerinde görünen ve alıcılara ürün detaylarını açıklayan etkileşimli noktalardır. Bu kılavuz; yerleştirme, düzenleme, doğrulama ve yayınlama adımlarını kapsar.

## 1. Hotspot düzenleyiciyi açın

Herhangi bir ürün detay sayfasında **Hotspot'ları düzenle** düğmesine tıklayarak düzenleme moduna girin. 3D görüntüleyicinin altında **Hotspot QA** paneli görünür.

## 2. Modele hotspot yerleştirin

Düzenleme modu aktifken:

1. 3D modelin herhangi bir yüzeyine tıklayın.
2. Bir iletişim kutusu kısa bir etiket girmenizi ister (ör. *İtalyan Tam Taneli Deri*).
3. Etiketi yazıp **Ekle**'ye basın. Hotspot seçilen konumda görünür.

## 3. Etiket, açıklama ve tür düzenleme

**Hotspot QA** panelinde herhangi bir hotspot'ın yanındaki **Düzenle**'ye tıklayın:

- **Etiket** — Kısa, alıcıya yönelik bir ad (en az 3 karakter, yer tutucu kullanılmamalı).
- **Açıklama** — Bu detayın alıcı için neden önemli olduğunu anlatan bir cümle (en az 10 karakter).
- **Tür** — Şunlardan birini seçin: `material`, `dimension`, `feature`, `warning`, `assembly`.

Kaydetmek için **Kaydet**'e tıklayın. Durum noktaları anında güncellenir.

## 4. Kalite durumunu anlayın

Her hotspot satırında renkli bir nokta bulunur:

- **Yeşil** — Tüm kontroller geçildi; hotspot yayına hazır.
- **Sarı** — Bir veya daha fazla yumuşak uyarı var (açıklama/tür eksik, 3D konum yok). Yayın yapılabilir ancak iyileştirme önerilir.
- **Kırmızı** — Bir veya daha fazla sert hata var (boş etiket, test etiketi, yer tutucu). Bu sorunlar giderilene kadar **yayın engellenir**.

Panel başlığında geçersiz ve uyarılı hotspot sayıları görüntülenir.

## 5. Hotspot'ları onaylayın (F.15)

Her hotspot, genel ürün sayfasında görünmeden önce satıcı tarafından açıkça onaylanmalıdır. Onayı açıp kapatmak için **Onayla** düğmesine tıklayın. Onaylanan hotspot'lar yeşil **Onaylandı** rozeti gösterir.

## 6. Hotspot'ları doğrulayın

**Hotspot'ları doğrula**'ya tıklayarak tüm hotspot'lar için QA kontrolü çalıştırın ve sorunlar bildirim alanında görüntülensin.

## 7. Daha iyi hotspot oluşturun (F.21)

**Daha iyisini oluştur**'a tıklayarak yapay zeka tabanlı hotspot oluşturmayı yeniden başlatın. Yeni öneriler düzenleyicinin altındaki **Önerilen hotspot'lar** kuyruğunda görünür. Tekil önerileri kabul ederek hotspot listesine ekleyebilirsiniz.

## 8. Hotspot silin (F.6)

Herhangi bir hotspot satırındaki **Sil**'e tıklayarak onu yerel listeden kaldırın. Değişikliği kaydetmek için **Hotspot'ları kaydet**'e tıklayın.

## 9. Kaydet ve düzenleme modundan çıkın

**Hotspot'ları kaydet**'e tıklayarak tüm değişiklikleri veritabanına yazın ve düzenleme modundan çıkın. Kaydedilmemiş değişiklikleri atmak için **İptal**'e tıklayın.

## 10. Yayın kapısı (F.19)

Herhangi bir hotspot geçersiz durumda ise **Yayınla** eylemi engellenir. Tüm kırmızı sorunları çözün ve yayınlamayı denemeden önce doğrulamayı yeniden çalıştırın.

## Demo senaryoları

| Demo ürün | Hotspot senaryosu |
|---|---|
| Kablosuz Kulaklık (Başarısız QA) | Geçersiz hotspot'lar — boş etiket, test etiketi, eksik tür |
| Deri Çanta (Onaylı) | Tümü geçerli ve onaylı — yeşil demo yolu |
| Seramik Vazo (İncelemeye Hazır) | Geçerli hotspot'lar, onay bekliyor |
| Modern Zemin Lambası (Düzeltme Gerekiyor) | Karma: biri geçerli+onaylı, biri eksik tür+açıklama |
