# AI Integration Guide

This document explains how Google Gemini is integrated into Minimal Block — the client architecture, prompt strategy, category generators, validation pipeline, and how to extend or swap the AI provider.

---

## Overview

Minimal Block uses **Google Gemini 2.0 Flash** as its multimodal AI backend. Gemini handles:

1. **Image analysis** — visual feature extraction, quality scoring
2. **Geometry classification** — shape and structural analysis
3. **Product understanding** — metadata extraction (name, materials, category)
4. **3D model generation** — GLB file synthesis from image + prompt
5. **Return risk scoring** — predict product return likelihood
6. **Visual QA** — answer questions about product images
7. **Multi-product detection** — identify clustered items in one photo
8. **Deep attribute autofill** — extract e-commerce attributes from images

All Gemini calls happen **inside the Cloudflare Worker** (`apps/api`). The browser never sends data to Gemini directly and never receives or stores the `GEMINI_API_KEY`.

---

## Configuration

### API Key

```bash
# Local development
echo "GEMINI_API_KEY=your-key-here" >> apps/api/.env

# Production (Cloudflare secret)
npx wrangler secret put GEMINI_API_KEY --cwd apps/api
```

Get a key from [aistudio.google.com](https://aistudio.google.com) → **Get API key**.

The free tier (as of 2026) provides 15 RPM and 1 million tokens/day — sufficient for development and light production use. For higher throughput, upgrade to a paid plan.

---

## Client Architecture

All Gemini clients live in `libs/ai/src/lib/gemini/`. Each client is a TypeScript class wrapping a specific Gemini use-case.

```
libs/ai/src/lib/
├── gemini/
│   ├── gemini-client.ts                    ← Base client (auth, retries, error mapping)
│   ├── gemini-3d-generator.ts              ← GLB generation
│   ├── gemini-image-analyzer.ts            ← Visual feature extraction
│   ├── gemini-product-understanding.ts     ← Metadata extraction
│   ├── gemini-product-intelligence-agent.ts← Market research
│   ├── gemini-visual-qa.ts                 ← Image Q&A
│   ├── gemini-risk-analyzer.ts             ← Return risk scoring
│   ├── gemini-geometry-classifier.ts       ← Shape classification
│   └── image-deduplication.service.ts      ← Duplicate detection
├── generators/
│   ├── category-generator.factory.ts       ← Factory pattern selector
│   ├── furniture.generator.ts
│   ├── clothing.generator.ts
│   ├── electronics.generator.ts
│   ├── jewelry.generator.ts
│   ├── vehicle.generator.ts
│   └── packaging.generator.ts
├── prompts/
│   ├── convert-2d-to-3d.prompt.ts
│   ├── product-understanding.prompt.ts
│   ├── material-inference.prompt.ts
│   ├── geometry-classification.prompt.ts
│   ├── visual-qa.prompt.ts
│   ├── scene-graph-reconstruction.prompt.ts
│   ├── multi-product-detection.prompt.ts
│   ├── return-risk-analysis.prompt.ts
│   └── deep-product-autofill.prompt.ts
├── validation/
│   ├── glb-validator.ts
│   └── scene-graph-validator.ts
├── feedback/
│   └── generation-feedback.service.ts
└── mock/
    └── mock-image-analyzer.ts              ← Test double (no API calls)
```

---

## 3D Generation Pipeline

The generation pipeline for a single product image:

```
1. gemini-image-analyzer
   Input:  Raw image bytes
   Output: { qualityScore, readinessScore, lightingQuality, backgroundComplexity, productVisibility }

2. gemini-geometry-classifier
   Input:  Image bytes + analyzer output
   Output: { geometryClass: 'box' | 'cylinder' | 'organic' | 'flat' | 'complex' }

3. gemini-product-understanding
   Input:  Image bytes + geometry class
   Output: { name, category, materials, keyAttributes }

4. category-generator.factory(category)
   → Selects the appropriate generator

5. selected generator.buildPrompt(imageAnalysis, productUnderstanding)
   → Returns a tailored generation prompt string

6. gemini-3d-generator
   Input:  Image bytes + prompt
   Output: GLB binary (ArrayBuffer)

7. glb-validator.validate(glbBytes)
   → Validates binary header and scene graph

8. Supabase Storage upload
   → Returns signed URL
```

---

## Category Generators

Each product category has a dedicated generator that builds a prompt tailored to that category's visual and structural properties.

### Factory usage

```typescript
import { createCategoryGenerator } from '@minimalblock/ai';

const generator = createCategoryGenerator(product.category);
const prompt = generator.buildPrompt(imageAnalysis, productUnderstanding);
```

### Generator characteristics

| Generator | Category | Prompt focus |
|---|---|---|
| `FurnitureGenerator` | Chairs, tables, sofas | Structural integrity, proportions, leg geometry |
| `ClothingGenerator` | Apparel, accessories | Fabric drape, texture, symmetry |
| `ElectronicsGenerator` | Devices, gadgets | Hard surfaces, ports, screens, buttons |
| `JewelryGenerator` | Rings, necklaces, watches | Metallic reflections, gem transparency |
| `VehicleGenerator` | Cars, bikes, scooters | Wheel geometry, scale, panel curvature |
| `PackagingGenerator` | Boxes, bottles, containers | Label placement, opening geometry |

If none match, a `GenericGenerator` is used as the fallback.

### Adding a new category

1. Create `libs/ai/src/lib/generators/<category>.generator.ts` implementing the `CategoryGenerator` interface
2. Add a case to `category-generator.factory.ts`
3. Add the category slug to `libs/core/src/lib/utils/categories.ts`
4. Export from `libs/ai/src/index.ts`

---

## Prompts

Prompts are TypeScript functions in `libs/ai/src/lib/prompts/`. Each takes a typed input and returns a string.

### Example — material inference

```typescript
// libs/ai/src/lib/prompts/material-inference.prompt.ts

export interface MaterialInferenceInput {
  productName: string;
  category: string;
  imageDescription?: string;
}

export function buildMaterialInferencePrompt(input: MaterialInferenceInput): string {
  return `
You are analyzing a product image for material composition.

Product: ${input.productName}
Category: ${input.category}
${input.imageDescription ? `Context: ${input.imageDescription}` : ''}

Identify the primary and secondary materials visible in the image.
Return a JSON object: { primary: string, secondary: string[], confidence: number }
  `.trim();
}
```

### Prompt design rules

- Prompts are **pure functions** — no side effects, no API calls
- Inputs are typed TypeScript interfaces
- Output is always a `string`
- Include explicit output format instructions (JSON schema or template)
- Never interpolate raw user input into system instructions — only into designated content slots
- Test prompts independently of Gemini

---

## GLB Validation

After generation, every GLB binary passes through two validators:

1. **`glb-validator.ts`** — checks the binary header (magic bytes `0x676C5446`, version, chunk structure)
2. **`scene-graph-validator.ts`** — parses the JSON chunk and validates the glTF scene graph (nodes, meshes, materials, accessors)

If validation fails, the conversion is marked `failed` with a descriptive error message. The user is prompted to retry with a higher-quality source image.

---

## Using the Mock Analyzer (Testing)

For unit tests and CI, use `MockImageAnalyzer` instead of calling Gemini:

```typescript
import { MockImageAnalyzer } from '@minimalblock/ai/mock';

const analyzer = new MockImageAnalyzer({
  qualityScore: 0.85,
  geometryClass: 'box',
  materials: ['cardboard', 'paper'],
});

// Use in tests — no API key required
const result = await analyzer.analyze(imageBytes);
```

The mock returns configurable fixture data and never makes network calls.

---

## Extending to a Different AI Provider

The `libs/core` port `ModelGeneratorPort` defines the contract:

```typescript
export interface ModelGeneratorPort {
  generate(input: GenerationInput): Promise<GenerationResult>;
}

export interface GenerationInput {
  imageBytes: Uint8Array;
  imageMime: string;
  productCategory: string;
  hints?: Record<string, unknown>;
}

export interface GenerationResult {
  glbBytes: ArrayBuffer;
  metadata: Record<string, unknown>;
}
```

To add a new provider:

1. Create a class in `libs/ai/src/lib/` implementing `ModelGeneratorPort`
2. Register it in the API route handler (`apps/api/src/lib/server.ts`)
3. Add the required API key to the environment variable reference

The Gemini implementation (`gemini-3d-generator.ts`) serves as the reference implementation.

---

## API Rate Limits and Cost

| Gemini tier | RPM | TPD | Notes |
|---|---|---|---|
| Free | 15 | 1M tokens | Development and testing |
| Pay-as-you-go | 2000+ | Unlimited | Production |

**Typical token usage per conversion:**

- Image analysis: ~500 tokens
- 3D generation prompt: ~300 tokens
- GLB output: varies (large models may approach context limits)

Monitor usage in the [Google AI Studio](https://aistudio.google.com) → Usage dashboard.

---

## Error Handling

Gemini errors are mapped to typed error classes in `gemini-client.ts`:

| Gemini status | Mapped error | Worker response |
|---|---|---|
| `RATE_LIMIT_EXCEEDED` | `GeminiRateLimitError` | 429 with retry-after header |
| `INVALID_ARGUMENT` | `GeminiValidationError` | 400 — usually bad prompt or image |
| `INTERNAL` | `GeminiServiceError` | 502 — retry recommended |
| Network timeout | `GeminiTimeoutError` | 504 |

Conversion records are updated with the error message when generation fails, so users can see why a conversion failed in the UI.
