import type { GenerativeModel } from '@google/generative-ai';
import {
  buildMultiProductDetectionPrompt,
  type MultiProductDetectionInput,
  type MultiProductDetectionResult,
} from '../prompts/multi-product-detection.prompt.js';

export type { MultiProductDetectionInput, MultiProductDetectionResult };

export class GeminiProductClusterAnalyzer {
  constructor(private readonly model: GenerativeModel) {}

  async analyze(
    images: Array<{ base64: string; mimeType: string }>,
    input: MultiProductDetectionInput,
  ): Promise<MultiProductDetectionResult> {
    const prompt = buildMultiProductDetectionPrompt(input);
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: prompt },
      ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.base64 } })),
    ];

    const result = await this.model.generateContent(parts);
    const raw = result.response.text().trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(raw) as MultiProductDetectionResult;

    if (!parsed.clusters || parsed.clusters.length === 0) {
      return {
        multiProductDetected: false,
        clusters: [{
          label: 'Main product',
          confidence: 'high',
          imageIndexes: images.map((_, i) => i),
          fieldHints: {},
        }],
      };
    }

    return parsed;
  }
}
