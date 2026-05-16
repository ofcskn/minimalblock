---
title: Product Categories
description: Available values for ProductCategory and how each one affects AI 3D generation.
---

# Product Categories

The `ProductCategory` union type is defined in `libs/core/src/lib/domain/entities/product.entity.ts`.

```ts
type ProductCategory = 'house' | 'furniture' | 'vehicle' | 'appliance' | 'other'
```

---

## Available values

### house

Real estate or architectural objects: buildings, rooms, facades, floor plans.

The 3D generation prompt instructs Gemini to preserve exterior proportions and large structural geometry. Interior detail is deprioritised unless the image focuses on a single room.

### furniture

Chairs, tables, sofas, shelving, beds, and similar household items.

Gemini produces models with tight geometric accuracy around edges and legs. PBR materials reflect fabric texture or wood grain when visible in the source image.

### vehicle

Cars, motorcycles, bicycles, scooters, and similar transport objects.

The prompt requests body panel curvature and wheel geometry to be preserved. Reflective metallic materials are applied where the photograph shows paint or chrome.

### appliance

Kitchen or household appliances: refrigerators, washing machines, ovens, microwaves.

Gemini emphasises boxy forms, control panel detail, and handle geometry. Materials default to matte plastic or stainless steel based on the image.

### other

Any object that does not fit the categories above.

The prompt omits category-specific guidance and asks Gemini to infer geometry from the photograph directly. Use this when the category is genuinely ambiguous.

---

## How categories affect 3D generation

### Prompt injection via buildConvert2DTo3DPrompt

`buildConvert2DTo3DPrompt(productCategory, quality)` in `libs/ai/src/lib/prompts/convert-2d-to-3d.prompt.ts` interpolates the category value into the prompt string:

```
You are an expert 3D modelling AI. The user has provided a 2D photograph of a {productCategory}.
```

Gemini uses this to apply domain-specific geometric heuristics during generation.

### Quality hint interaction

The `qualityHint` parameter is orthogonal to the category — it controls polygon density and texture resolution, not category-specific behaviour:

| Quality | Effect |
|---|---|
| `fast` | Low-polygon, fast-loading, minimal texture detail |
| `balanced` | Moderate detail and file size (default) |
| `quality` | High-fidelity PBR materials, dense geometry |

---

## Extend categories

The type union is intentionally narrow for the hackathon scope. To add a category:

1. Add the new string literal to `ProductCategory` in [product.entity.ts](../../libs/core/src/lib/domain/entities/product.entity.ts).
2. Update the `qualityInstructions` or prompt body in [convert-2d-to-3d.prompt.ts](../../libs/ai/src/lib/prompts/convert-2d-to-3d.prompt.ts) if the new category needs custom generation guidance.
3. Update the `category` column check constraint in Supabase if you want DB-level enforcement.
