---
title: Supabase Yapılandır
description: Bir Supabase projesi oluşturun, ilk migrasyonu çalıştırın, RLS'yi doğrulayın ve ortam değişkenlerini ayarlayın.
---

# Supabase Yapılandır

## Supabase projesi oluşturun

1. [supabase.com](https://supabase.com) adresini açın ve oturum açın.
2. **New project** düğmesine tıklayın.
3. Bir kuruluş seçin, proje adı belirleyin (örn. `minimalblock`) ve bir veritabanı şifresi girin.
4. Size yakın bir bölge seçin ve **Create new project** düğmesine tıklayın.

Projenin hazırlanmasını bekleyin (yaklaşık 60 saniye).

---

## İlk migrasyonu çalıştırın

Tam şema `libs/data/src/lib/migrations/001_initial_schema.sql` dosyasındadır.

1. Supabase panosunda **SQL Editor** → **New query** bölümüne gidin.
2. `001_initial_schema.sql` dosyasının tüm içeriğini kopyalayıp editöre yapıştırın.
3. **Run** düğmesine tıklayın.

Sorgu şunları oluşturur:
- `conversion_status` enum tipi
- Dizinler içeren `products` ve `conversions` tabloları
- Her iki tablo için RLS politikaları
- RLS politikalarıyla birlikte `media-assets` depolama klasörü

::: warning Yalnızca bir kez çalıştırın
Migrasyonu ikinci kez çalıştırmak "relation already exists" (ilişki zaten mevcut) hatasıyla başarısız olur. Sıfırlamak istiyorsanız önce tüm tabloları ve klasörü silin ya da yeni bir Supabase projesi oluşturun.
:::

---

## Satır Düzeyi Güvenlik politikalarını doğrulayın

### products RLS'yi test edin

**Table Editor** → **products** bölümünü açın. Kimlik doğrulama olmadan (veya farklı bir kullanıcı olarak) SQL editörü aracılığıyla doğrudan bir satır eklemeyi deneyin:

```sql
INSERT INTO products (id, name, description, category, owner_id)
VALUES (gen_random_uuid(), 'Test', '', 'other', '00000000-0000-0000-0000-000000000001');
```

Sorgu `new row violates row-level security policy` (yeni satır satır düzeyi güvenlik politikasını ihlal ediyor) hatasıyla başarısız olmalıdır. Bu, RLS'nin etkin olduğunu doğrular.

### conversions RLS'yi test edin

Kimliği doğrulanmamış bir oturumda `conversions` üzerinde `SELECT` çalıştırın:

```sql
SELECT * FROM conversions;
```

Sonuç bir hata değil, boş bir dizi olmalıdır — politika `WITH CHECK` değil `USING` kullanır, dolayısıyla kimliği doğrulanmamış okumalar sorguyu reddetmek yerine sıfır satır döndürür.

---

## Depolama klasörünü yapılandırın

### media-assets klasörünün var olduğunu doğrulayın

Supabase panosunda **Storage** bölümüne gidin. `media-assets` klasörünün listede göründüğünü ve erişim türü olarak **Public** (Genel) yazıldığını doğrulayın.

### Depolama politikalarını onaylayın

**Storage** → **Policies** bölümüne gidin. `storage.objects` üzerinde üç politikanın mevcut olduğunu doğrulayın:

| Politika adı | İşlem | Koşul |
|---|---|---|
| `media_assets_owner_upload` | INSERT | `foldername(name)[1] = auth.uid()` |
| `media_assets_owner_delete` | DELETE | `foldername(name)[1] = auth.uid()` |
| `media_assets_public_read` | SELECT | `bucket_id = 'media-assets'` |

---

## Ortam değişkenlerini ayarlayın

Proje kimlik bilgilerinizi Supabase panosunda **Settings** → **API** bölümünden alın.

Depo kökünde bir `.env` dosyası oluşturun (bu dosyayı asla commit etmeyin):

```sh
VITE_SUPABASE_URL=https://<proje-ref-kodunuz>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-anahtarınız>
```

`VITE_` ön eki, değişkenleri Vite build sürecine açar. Anon anahtar istemci tarafı kullanım için güvenlidir — Supabase'in RLS politikaları erişim kontrolünü veritabanı düzeyinde uygular.
