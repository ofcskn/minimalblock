---
title: Başlarken
description: Minimal Block geliştirme ortamını kurun, ortam değişkenlerini yapılandırın ve uygulamayı yerel olarak çalıştırın.
---

# Başlarken

Bu ders, depoyu klonlamayı, bağımlılıkları yüklemeyi, Supabase ve Gemini'yi yapılandırmayı ve web uygulaması, API ile belge sitesini yerel ortamınızda çalıştırmayı anlatır.

---

## Ön Koşullar

### Node.js ve paket yöneticisi

[Node.js](https://nodejs.org) 20 veya daha yenisini yükleyin. Proje paket yöneticisi olarak pnpm kullanır.

Sürümlerinizi doğrulayın:

```bash
node --version   # v20.x veya üzeri
pnpm --version   # 8.x veya üzeri
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
pnpm install
```

---

## Ortam değişkenlerini yapılandırın

Proje iki ayrı `.env` dosyası kullanır — biri web ön yüzü için, diğeri Node.js API arka ucu için. Hiçbiri sürüm kontrolüne eklenmemelidir.

### Web uygulaması — kök `.env`

Örnek dosyayı kopyalayın ve değerleri doldurun:

```bash
cp .env.example .env
```

```sh
# .env (depo kökü)
VITE_SUPABASE_URL=https://<proje-ref-kodunuz>.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase-anon-anahtarınız>
VITE_API_BASE_URL=http://localhost:8787
```

`VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` değerlerini Supabase panosunda **Settings** → **API** altında bulabilirsiniz.

Anon anahtar istemci tarafında kullanım için güvenlidir — veritabanındaki Satır Düzeyi Güvenlik her sorguyu kimliği doğrulanmış kullanıcının kendi satırlarıyla sınırlar.

Supabase projenizi henüz kurmadıysanız önce [Supabase Yapılandır](/tr/how-to/configure-supabase) rehberini izleyin.

### API arka ucu — `apps/api/.env`

Örnek dosyayı kopyalayın ve değerleri doldurun:

```bash
cp apps/api/.env.example apps/api/.env
```

```sh
# apps/api/.env
SUPABASE_URL=https://<proje-ref-kodunuz>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-anahtarınız>
GEMINI_API_KEY=<gemini-api-anahtarınız>
```

`SUPABASE_SERVICE_ROLE_KEY` değerini Supabase panosunda **Settings** → **API** → **Service role key** altında bulabilirsiniz (gizli tutun — RLS'yi atlar).

`GEMINI_API_KEY` değerini [Google AI Studio](https://aistudio.google.com) üzerinde **Get API key** bölümünde bulabilirsiniz.

::: warning GEMINI_API_KEY yalnızca arka uçta kullanılır
`GEMINI_API_KEY`, kök `.env` dosyasına veya herhangi bir `VITE_` önekli değişkene **asla** eklenmemelidir. Vite, `VITE_*` değişkenlerini tarayıcı paketine gömer ve bu durum anahtarı herkese açık hale getirir. Tüm Gemini çağrıları `apps/api` tarafından sunucu tarafında yapılır.
:::

Henüz bir anahtar oluşturmadıysanız önce [Gemini AI Yapılandır](/tr/how-to/configure-gemini) rehberini izleyin.

---

## Geliştirme sunucularını başlatın

Üç hizmeti de başlatın:

```bash
# Terminal 1 — API (8787 portu)
pnpm nx serve api

# Terminal 2 — Web uygulaması (4200 portu)
pnpm nx serve web

# Terminal 3 — Belge sitesi (5173 portu)
pnpm nx serve docs
```

Veya web uygulaması ve API'yi birlikte başlatın:

```bash
pnpm nx run-many -t serve -p web api
```

---

## Kurulumu doğrulayın

### API'yi kontrol edin

```bash
curl http://localhost:8787/health
# → {"status":"ok"}
```

### Web uygulamasını kontrol edin

`http://localhost:4200` adresini açın. Konsol hatası olmadan uygulama kabuğunu görmelisiniz. Supabase hatası görürseniz (örn. "Invalid API key"), kök `.env` dosyasındaki `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` değerlerini kontrol edin.

### Belge sitesini kontrol edin

`http://localhost:5173` adresini açın. Ana sayfa, **Get Started (English)** ve **Başla (Türkçe)** düğmeleriyle dil seçici kahramanı göstermelidir.

::: tip Sonraki adım
Gemini ile oluşturulmuş ilk 3D modelinizi içeren bir ürün oluşturmak için [3D Ürün Önizlemesi Oluştur](/tr/tutorials/create-product-3d-preview) dersini izleyin.
:::
