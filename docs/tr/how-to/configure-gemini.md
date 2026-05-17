---
title: Gemini AI Yapılandır
description: Gemini API anahtarı edinin, model tanımlayıcılarını anlayın, boru hattını test edin ve kota hatalarını yönetin.
---

# Gemini AI Yapılandır

## Mimari not

**Gemini çağrıları yalnızca sunucu tarafında yapılır.** `GEMINI_API_KEY`, `apps/api/.env` dosyasında bulunur ve tarayıcıya asla gönderilmez. Web uygulaması `apps/api`'yi HTTP üzerinden çağırır; `apps/api` ise Gemini'yi kendi adına çağırır.

---

## Gemini API anahtarı edinin

1. [aistudio.google.com](https://aistudio.google.com) adresini açın ve bir Google hesabıyla oturum açın.
2. **Get API key** → **Create API key in new project** seçeneğine tıklayın.
3. Oluşturulan anahtarı kopyalayın.

`apps/api/.env` dosyasına ekleyin (dosya henüz yoksa `apps/api/.env.example` dosyasını kopyalayın):

```sh
GEMINI_API_KEY=<api-anahtarınız>
```

::: danger Bu anahtarı gizli tutun
`GEMINI_API_KEY`'i asla sürüm kontrolüne commit etmeyin. Yanlışlıkla ifşa ederseniz, Google AI Studio panosunda hemen iptal edin ve yeni bir anahtar oluşturun.
:::

---

## Model tanımlayıcılarını anlayın

`libs/ai/src/lib/gemini/gemini-client.ts` dosyasında iki model kimliği tanımlanmıştır:

```ts
export const DEFAULT_MODEL_ID = 'gemini-2.5-flash'
export const ANALYSIS_MODEL_ID = 'gemini-2.5-pro'
```

| Sabit | Model | Kullanım amacı |
|---|---|---|
| `DEFAULT_MODEL_ID` | `gemini-2.5-flash` | Görüntüden 3D GLB üretimi |
| `ANALYSIS_MODEL_ID` | `gemini-2.5-pro` | Görsel analizi — açıklama ve kategori önerisi |

`createGenerativeModel(apiKey)`, varsayılan olarak `DEFAULT_MODEL_ID` kullanır. `GeminiImageAnalyzer`'ı başlatırken ikinci argüman olarak `ANALYSIS_MODEL_ID` geçirin.

---

## Boru hattını yerel bir görsel ile test edin

`apps/api`, Gemini boru hattını sunar. Anahtarın çalıştığını doğrulamak için `/analyze-product` veya `/generate-model` uç noktalarına doğrudan `curl` ile istek atabilir ya da sınıfları `GEMINI_API_KEY` ortam değişkeniyle Node.js'ten başlatabilirsiniz:

```ts
import { createGenerativeModel, GeminiModelGenerator } from '@minimalblock/ai'
import { MediaAsset } from '@minimalblock/core'

// process.env.GEMINI_API_KEY — apps/api/.env dosyasında tanımlı
const model = createGenerativeModel(process.env.GEMINI_API_KEY!)
const generator = new GeminiModelGenerator(model)

const sourceAsset = new MediaAsset({
  url: 'https://<supabase-projeniz>.supabase.co/storage/v1/object/public/media-assets/<yol>',
  storageKey: '<yol>',
  mimeType: 'image/jpeg',
  kind: 'source-image',
  sizeBytes: 123456,
})

const result = await generator.generate({
  sourceAsset,
  productCategory: 'furniture',
  qualityHint: 'fast',
})

console.log('GLB boyutu (bayt):', result.outputAsset.sizeBytes)
console.log('Kullanılan token:', result.tokensUsed)
```

Başarılı bir çalışma, sıfırdan büyük bir `sizeBytes` değeri kaydeder. Gemini boş veya hatalı biçimlendirilmiş bir yanıt döndürürse log ifadesine ulaşmadan önce hata fırlatır.

---

## Kalite ipuçlarını yapılandırın

`qualityHint`'i `generator.generate()` metoduna üçüncü argüman olarak geçirin:

| Değer | Oluşturulan model üzerindeki etki |
|---|---|
| `'fast'` | Az poligon, minimal doku detayı — en hızlı üretim, en küçük dosya |
| `'balanced'` | Orta düzey detay ve dosya boyutu — **atlandığında varsayılan** |
| `'quality'` | Yüksek kaliteli PBR materyaller, yoğun geometri — en yavaş, en büyük dosya |

Demo amaçlı kullanım için `'balanced'` uygundur. Geliştirme sırasında bekleme süresini ve token kullanımını azaltmak için `'fast'` kullanın.

---

## Kota ve hız sınırı hatalarını yönetin

Ücretsiz plan Gemini kotaları her dakika sıfırlanır. Hızlı ardışık birden fazla istek gönderirseniz API şu hatayı döndürür:

```
Error: [429 Too Many Requests] Resource has been exhausted
```

`apps/api` bunu 500 yanıtı olarak iletir. Özellik hook'unda bunu yakalayın ve yeniden fırlatmadan veya kullanıcı arayüzünde hatayı göstermeden önce `conversion.markFailed(error.message)` çağrısı yapın.

::: tip Kota sınırları
`gemini-2.5-flash` ve `gemini-2.5-pro`'nun **ayrı** dakika başına kotaları vardır. Üretim modelinde sınıra ulaşmak analiz modelini etkilemez ve tam tersi de geçerlidir.
:::
