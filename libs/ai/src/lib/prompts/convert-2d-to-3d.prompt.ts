import type { QualityHint } from '../types/ai-request.types.js';

const qualityInstructions: Record<QualityHint, string> = {
  fast: 'Prioritise speed — use simple proportions and round dimensions to one decimal place.',
  balanced: 'Use a balanced level of detail for shape and material.',
  quality: 'Use high-fidelity proportions with precise material values derived from the photograph.',
};

// All recognisable product sub-types. Used in the prompt AND in the template builder.
export const DETECTED_PRODUCT_TYPES = [
  'laptop', 'phone', 'tablet', 'monitor', 'speaker', 'keyboard', 'headphones',
  'chair', 'table', 'sofa', 'desk', 'bookshelf', 'lamp',
  'bag', 'backpack', 'wallet',
  'watch', 'ring', 'bracelet', 'sunglasses',
  'bottle', 'cup', 'mug', 'vase', 'bowl', 'pot',
  'shoe', 'sneaker', 'boot',
  'other',
] as const;

export type DetectedProductType = typeof DETECTED_PRODUCT_TYPES[number];

export function buildConvert2DTo3DPrompt(productCategory: string, quality: QualityHint = 'balanced'): string {
  return `You are a product analyst for a 3D visualisation pipeline. A 2D photograph is provided.

The merchant categorised this product as "${productCategory}". Use your own visual analysis to identify the REAL product type — do not blindly trust the merchant label.

${qualityInstructions[quality]}

Respond with ONLY a raw JSON object — no markdown, no explanatory text, no code fences:

{
  "detectedType": "laptop",
  "shape": "box",
  "width": 0.35,
  "height": 0.24,
  "depth": 0.24,
  "baseColor": [0.15, 0.15, 0.15, 1.0],
  "roughness": 0.25,
  "metalness": 0.55
}

Rules:
- "detectedType" must be exactly one of: ${DETECTED_PRODUCT_TYPES.join(' | ')}
- "shape" must be exactly one of: "box", "cylinder", "sphere" — choose the best single-body primitive
- width/height/depth are the overall bounding box in metres (product in its normal-use / open state):
    laptop  → height = open height (base bottom to top of screen), width = laptop width, depth = front-to-back
    phone/tablet → height = device length, width = device width, depth = thickness
    chair/table → overall including legs
    bottle/cup → height = full height including cap, width = widest diameter
- baseColor is RGBA, each component 0–1
- roughness and metalness are each 0–1
- Choose dimensions from real-world product knowledge, corrected by visual cues in the photo`;
}

export function buildImageAnalysisPrompt(): string {
  return `Analyse this product image and respond in JSON with:
{
  "description": "brief one-sentence description of the object",
  "suggestedCategory": "one of: furniture | home-decor | bags | accessories | electronics | other"
}
Respond with ONLY the JSON object.`;
}
