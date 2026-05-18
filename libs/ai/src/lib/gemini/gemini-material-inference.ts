import type { GenerativeModel } from '@google/generative-ai';
import {
  buildMaterialInferencePrompt,
  type MaterialInferenceInput,
  type MaterialInferenceResult,
} from '../prompts/material-inference.prompt.js';

export type { MaterialInferenceInput, MaterialInferenceResult };

export class GeminiMaterialInferenceEngine {
  constructor(private readonly model: GenerativeModel) {}

  async infer(
    heroImages: Array<{ base64: string; mimeType: string }>,
    input: MaterialInferenceInput,
  ): Promise<MaterialInferenceResult> {
    if (heroImages.length === 0) {
      return {
        materialFinish: 'unknown',
        geometryComplexity: 'moderate',
        geometrySymmetry: 'symmetric',
        inferredMaterials: input.knownMaterials ?? [],
        confidence: 'low',
      };
    }

    const prompt = buildMaterialInferencePrompt(input);
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: prompt },
      ...heroImages.slice(0, 3).map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.base64 } })),
    ];

    const result = await this.model.generateContent(parts);
    const raw = result.response.text().trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    return JSON.parse(raw) as MaterialInferenceResult;
  }
}
