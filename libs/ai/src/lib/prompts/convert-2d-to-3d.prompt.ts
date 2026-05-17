import type { QualityHint } from '../types/ai-request.types.js';

const qualityInstructions: Record<QualityHint, string> = {
  fast: 'Prioritise speed — use simple proportions and round dimensions to one decimal place.',
  balanced: 'Use a balanced level of detail for shape and material.',
  quality: 'Use high-fidelity proportions with precise material values derived from the photograph.',
};

export function buildConvert2DTo3DPrompt(productCategory: string, quality: QualityHint = 'balanced'): string {
  return `You are a product analyst for a 3D visualisation pipeline. A 2D photograph of a "${productCategory}" is provided.

${qualityInstructions[quality]}

Analyse the object and respond with ONLY a raw JSON object — no markdown, no explanatory text, no code fences:

{
  "shape": "box",
  "width": 0.3,
  "height": 0.4,
  "depth": 0.2,
  "baseColor": [0.8, 0.6, 0.4, 1.0],
  "roughness": 0.6,
  "metalness": 0.1
}

Rules:
- "shape" must be exactly one of: "box", "cylinder", "sphere"
- width/height/depth are in metres (real-world scale)
- For "cylinder": width is the diameter, depth is ignored
- For "sphere": width is the diameter, height and depth are ignored
- baseColor is RGBA with each component in the range 0–1
- roughness and metalness are each in the range 0–1
- Choose the primitive that best approximates the object's 3D form`;
}

export function buildImageAnalysisPrompt(): string {
  return `Analyse this product image and respond in JSON with:
{
  "description": "brief one-sentence description of the object",
  "suggestedCategory": "one of: furniture | home-decor | bags | accessories | other"
}
Respond with ONLY the JSON object.`;
}
