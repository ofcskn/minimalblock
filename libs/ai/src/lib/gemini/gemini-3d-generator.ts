import { IModelGeneratorPort, GenerateModelInput, GenerateModelOutput, MediaAsset } from '@minimalblock/core';
import type { GenerativeModel } from '@google/generative-ai';
import { buildConvert2DTo3DPrompt } from '../prompts/convert-2d-to-3d.prompt.js';
import type { QualityHint } from '../types/ai-request.types.js';
import { buildGlbFromShape, buildCompoundGlb, buildCategoryParts, type ShapeParams } from './glb-builder.js';
// Re-export for convenience so callers can import from this module
export type { ShapeParams };

function parseShapeParams(raw: string): ShapeParams {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const preview = raw.slice(0, 120).replace(/\n/g, '\\n');
    throw new Error(`Gemini did not return valid shape parameter JSON. Response preview: "${preview}"`);
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Gemini returned non-object shape parameters');
  }

  const p = parsed as Record<string, unknown>;
  const shape = p['shape'] as string;
  if (shape !== 'box' && shape !== 'cylinder' && shape !== 'sphere') {
    throw new Error(`Gemini returned invalid shape: "${shape}"`);
  }

  return {
    shape: shape as 'box' | 'cylinder' | 'sphere',
    width:    typeof p['width']    === 'number' ? p['width']    : 0.3,
    height:   typeof p['height']   === 'number' ? p['height']   : 0.3,
    depth:    typeof p['depth']    === 'number' ? p['depth']    : 0.3,
    baseColor: (Array.isArray(p['baseColor']) && p['baseColor'].length >= 4
      ? (p['baseColor'] as number[]).slice(0, 4) as [number, number, number, number]
      : [0.8, 0.8, 0.8, 1.0]),
    roughness: typeof p['roughness'] === 'number' ? p['roughness'] : 0.5,
    metalness: typeof p['metalness'] === 'number' ? p['metalness'] : 0.0,
  };
}

export class GeminiModelGenerator implements IModelGeneratorPort {
  constructor(private readonly model: GenerativeModel) {}

  async generate(input: GenerateModelInput): Promise<GenerateModelOutput> {
    const quality = (input.qualityHint ?? 'balanced') as QualityHint;
    const prompt = buildConvert2DTo3DPrompt(input.productCategory, quality);

    const imageResp = await fetch(input.sourceAsset.url);
    const imageBuffer = await imageResp.arrayBuffer();
    const imageBytes = new Uint8Array(imageBuffer);
    let binary = '';
    for (let i = 0; i < imageBytes.byteLength; i += 1) {
      binary += String.fromCharCode(imageBytes[i]);
    }
    const imageBase64 = btoa(binary);

    const result = await this.model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: input.sourceAsset.mimeType as string,
          data: imageBase64,
        },
      },
    ]);

    const tokensUsed = result.response.usageMetadata?.totalTokenCount ?? 0;
    const raw = result.response.text().trim();
    const shapeParams = parseShapeParams(raw);

    // Build category-appropriate compound or single-primitive shape
    const parts = buildCategoryParts(input.productCategory, shapeParams);
    const isCompound = parts.length > 1;
    const glb = isCompound ? buildCompoundGlb(parts) : buildGlbFromShape(shapeParams);

    let glbBinary = '';
    for (let i = 0; i < glb.byteLength; i += 1) {
      glbBinary += String.fromCharCode(glb[i]);
    }
    const glbBase64 = btoa(glbBinary);

    const outputAsset = new MediaAsset({
      url: `data:model/gltf-binary;base64,${glbBase64}`,
      storageKey: '',
      mimeType: 'model/gltf-binary',
      kind: 'generated-model',
      sizeBytes: glb.byteLength,
    });

    const generatedPrimitive = isCompound
      ? {
          shape: 'compound' as const,
          widthM: shapeParams.width,
          heightM: shapeParams.height,
          depthM: shapeParams.depth,
          baseColor: shapeParams.baseColor,
          roughness: shapeParams.roughness,
          metalness: shapeParams.metalness,
          parts: parts.map((part) => ({
            shape: part.shape,
            widthM: part.width,
            heightM: part.height,
            depthM: part.depth,
            baseColor: part.baseColor,
            roughness: part.roughness,
            metalness: part.metalness,
            description: part.description,
          })),
        }
      : {
          shape: shapeParams.shape,
          widthM: shapeParams.width,
          heightM: shapeParams.height,
          depthM: shapeParams.depth,
          baseColor: shapeParams.baseColor,
          roughness: shapeParams.roughness,
          metalness: shapeParams.metalness,
        };

    return {
      outputAsset,
      tokensUsed,
      generatedPrimitive,
    };
  }
}
