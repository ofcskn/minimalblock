---
title: Configure Gemini AI
description: Obtain a Gemini API key, understand model identifiers, test the pipeline, and handle quota errors.
---

# Configure Gemini AI

## Architecture note

**Gemini calls are made server-side only.** `GEMINI_API_KEY` lives in `apps/api/.env` and is never sent to the browser. The web app calls `apps/api` over HTTP; `apps/api` calls Gemini on its behalf.

---

## Obtain a Gemini API key

1. Open [aistudio.google.com](https://aistudio.google.com) and sign in with a Google account.
2. Click **Get API key** → **Create API key in new project**.
3. Copy the generated key.

Add it to `apps/api/.env` (copy from `apps/api/.env.example` if the file does not exist yet):

```sh
GEMINI_API_KEY=<your-api-key>
```

::: danger Keep this key private
Never commit `GEMINI_API_KEY` to version control. If you accidentally expose it, revoke it immediately in the Google AI Studio dashboard and generate a new one.
:::

---

## Understand the model identifiers

Two model IDs are defined in `libs/ai/src/lib/gemini/gemini-client.ts`:

```ts
export const DEFAULT_MODEL_ID = 'gemini-2.5-flash'
export const ANALYSIS_MODEL_ID = 'gemini-2.5-pro'
```

| Constant | Model | Used for |
|---|---|---|
| `DEFAULT_MODEL_ID` | `gemini-2.5-flash` | 3D GLB generation from an image |
| `ANALYSIS_MODEL_ID` | `gemini-2.5-pro` | Image analysis — description and category suggestion |

`createGenerativeModel(apiKey)` defaults to `DEFAULT_MODEL_ID`. Pass `ANALYSIS_MODEL_ID` as the second argument when instantiating `GeminiImageAnalyzer`.

---

## Test the pipeline with a local image

`apps/api` exposes the Gemini pipeline. You can verify the key works by hitting the `/analyze-product` or `/generate-model` endpoints directly with `curl`, or by instantiating the classes from Node.js using the `GEMINI_API_KEY` env var:

```ts
import { createGenerativeModel, GeminiModelGenerator } from '@minimalblock/ai'
import { MediaAsset } from '@minimalblock/core'

// process.env.GEMINI_API_KEY — set in apps/api/.env
const model = createGenerativeModel(process.env.GEMINI_API_KEY!)
const generator = new GeminiModelGenerator(model)

const sourceAsset = new MediaAsset({
  url: 'https://<your-supabase-project>.supabase.co/storage/v1/object/public/media-assets/<path>',
  storageKey: '<path>',
  mimeType: 'image/jpeg',
  kind: 'source-image',
  sizeBytes: 123456,
})

const result = await generator.generate({
  sourceAsset,
  productCategory: 'furniture',
  qualityHint: 'fast',
})

console.log('GLB size (bytes):', result.outputAsset.sizeBytes)
console.log('Tokens used:', result.tokensUsed)
```

A successful run logs a non-zero `sizeBytes` value. If Gemini returns an empty or malformed response, it will throw before reaching the log statement.

---

## Configure quality hints

Pass `qualityHint` as the third argument to `generator.generate()`:

| Value | Effect on generated model |
|---|---|
| `'fast'` | Low-polygon, minimal texture detail — fastest generation, smallest file |
| `'balanced'` | Moderate detail and file size — **default when omitted** |
| `'quality'` | High-fidelity PBR materials, dense geometry — slowest, largest file |

For demo purposes, `'balanced'` is suitable. Use `'fast'` during development to reduce wait time and token usage.

---

## Handle quota and rate-limit errors

Free-tier Gemini quotas reset every minute. If you send multiple requests in quick succession, the API returns:

```
Error: [429 Too Many Requests] Resource has been exhausted
```

`apps/api` surfaces this as a 500 response. Catch it in the feature hook and call `conversion.markFailed(error.message)` before re-throwing or surfacing the error in the UI.

::: tip Quota limits
`gemini-2.5-flash` and `gemini-2.5-pro` have **separate** per-minute quotas. Hitting the limit on the generation model does not affect the analysis model, and vice versa.
:::
