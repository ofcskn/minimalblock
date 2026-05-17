import type { QualityHint } from '../types/ai-request.types.js';

const qualityInstructions: Record<QualityHint, string> = {
  fast: 'Generate a lightweight, low-polygon 3D model optimised for fast loading.',
  balanced: 'Generate a balanced 3D model with moderate detail and reasonable file size.',
  quality: 'Generate a high-fidelity 3D model with rich geometric detail and accurate textures.',
};

export function buildConvert2DTo3DPrompt(productCategory: string, quality: QualityHint = 'balanced'): string {
  return `You are an expert 3D modelling AI. The user has provided a 2D photograph of a ${productCategory}.

Your task:
1. Analyse the shape, materials, proportions, and visual features of the object.
2. ${qualityInstructions[quality]}
3. Output the model as a binary glTF file (GLB format, MIME type: model/gltf-binary).
4. Ensure the model is centred at the origin, Y-up, with real-world scale in metres.
5. Include PBR materials with base colour, roughness, and metallic maps derived from the photograph.

Respond with ONLY the base64-encoded GLB binary data. Do not include any explanatory text, markdown, code fences, or a data URI prefix.`;
}

export function buildImageAnalysisPrompt(): string {
  return `Analyse this product image and respond in JSON with:
{
  "description": "brief one-sentence description of the object",
  "suggestedCategory": "one of: furniture | home-decor | bags | accessories | other"
}
Respond with ONLY the JSON object.`;
}
