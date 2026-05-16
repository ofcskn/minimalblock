---
title: Başlarken
description: Minimal Block geliştirme ortamını kurun, ortam değişkenlerini yapılandırın ve uygulamayı yerel olarak çalıştırın.
---

# Başlarken

Bu ders, depoyu klonlamayı, bağımlılıkları yüklemeyi, Supabase ve Gemini'yi yapılandırmayı ve web uygulaması ile belge sitesini yerel ortamınızda çalıştırmayı anlatır.

---

## Ön Koşullar

### Node.js ve paket yöneticisi

[Node.js](https://nodejs.org) 20 veya daha yenisini yükleyin. Proje varsayılan paket yöneticisi olarak npm kullanır (`package.json` dosyasında belirtilmiştir).

Sürümlerinizi doğrulayın:

```bash
node --version   # v20.x veya üzeri
npm --version    # 10.x veya üzeri
```

### Gerekli hesaplar

Aşağıdaki hesaplara ihtiyacınız vardır:

| Hizmet | Amaç | Ücretsiz plan |
|---|---|---|
| [Supabase](https://supabase.com) | Veritabanı, kimlik doğrulama, depolama | Evet — 2 ücretsiz proje |
| [Google AI Studio](https://aistudio.google.com) | Gemini API anahtarı | Evet — hız sınırları ile |

Devam etmeden önce her iki hesabı da oluşturun.

---

## Klonlama ve kurulum

```bash
git clone https://github.com/ofcskn/minimalblock.git
cd minimalblock
npm install
```

---

## Ortam değişkenlerini yapılandırın

Depo kökünde bir `.env` dosyası oluşturun. Bu dosya `.gitignore` listesindedir — asla commit etmeyin.

```sh
VITE_SUPABASE_URL=https://<proje-ref-kodunuz>.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase-anon-anahtarınız>
VITE_GEMINI_API_KEY=<gemini-api-anahtarınız>
```

### VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY

Her iki değeri de Supabase panosunda **Settings** → **API** altında bulabilirsiniz.

Anon anahtar istemci tarafında kullanım için güvenlidir — veritabanındaki Satır Düzeyi Güvenlik her sorguyu kimliği doğrulanmış kullanıcının kendi satırlarıyla sınırlar.

Supabase projenizi henüz kurmadıysanız önce [Supabase Yapılandır](/tr/how-to/configure-supabase) rehberini izleyin.

### VITE_GEMINI_API_KEY

Bu değeri [Google AI Studio](https://aistudio.google.com) üzerinde **Get API key** bölümünde bulabilirsiniz.

Henüz bir anahtar oluşturmadıysanız önce [Gemini AI Yapılandır](/tr/how-to/configure-gemini) rehberini izleyin.

### İsteğe bağlı değişkenler

Uygulamayı yerel ortamda çalıştırmak için başka bir değişken gerekli değildir.

---

## Geliştirme sunucusunu başlatın

Web uygulamasını başlatın:

```bash
npm run dev
# veya Nx aracılığıyla:
npx nx serve web
```

Uygulama varsayılan olarak `http://localhost:4200` adresinde açılır.

Belge sitesini başlatın:

```bash
npm run docs:dev
# veya Nx aracılığıyla:
npx nx serve docs
```

Belgeler `http://localhost:5173` adresinde açılır.

---

## Kurulumu doğrulayın

### Web uygulamasını kontrol edin

`http://localhost:4200` adresini açın. Konsol hatası olmadan uygulama kabuğunu görmelisiniz. Supabase hatası görürseniz (örn. "Invalid API key"), `.env` dosyasındaki `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` değerlerini kontrol edin.

### Belge sitesini kontrol edin

`http://localhost:5173` adresini açın. Ana sayfa, **Get Started (English)** ve **Başla (Türkçe)** düğmeleriyle dil seçici kahramanı göstermelidir.

::: tip Sonraki adım
Gemini ile oluşturulmuş ilk 3D modelinizi içeren bir ürün oluşturmak için [3D Ürün Önizlemesi Oluştur](/tr/tutorials/create-product-3d-preview) dersini izleyin.
:::
