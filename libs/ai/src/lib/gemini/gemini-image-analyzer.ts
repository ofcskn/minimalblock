import type { GenerativeModel } from '@google/generative-ai';
import { buildImageAnalysisPrompt } from '../prompts/convert-2d-to-3d.prompt.js';
import type { ImageAnalysisResponse } from '../types/ai-response.types.js';

export class GeminiImageAnalyzer {
  constructor(private readonly model: GenerativeModel) {}

  async analyze(imageBase64: string, mimeType: string): Promise<ImageAnalysisResponse> {
    const result = await this.model.generateContent([
      { text: buildImageAnalysisPrompt() },
      { inlineData: { mimeType, data: imageBase64 } },
    ]);

    const raw = result.response.text().trim();
    const parsed = JSON.parse(raw) as { description: string; suggestedCategory: string };
    return {
      description: parsed.description,
      suggestedCategory: parsed.suggestedCategory,
      tokensUsed: result.response.usageMetadata?.totalTokenCount ?? 0,
    };
  }
}
