import type { GenerativeModel } from '@google/generative-ai';
import {
  buildImageClassificationPrompt,
  type ImageClassificationResult,
} from '../prompts/image-classification.prompt.js';

export type { ImageClassificationResult };

export class GeminiImageClassifier {
  constructor(private readonly model: GenerativeModel) {}

  async classifyBatch(
    images: Array<{ base64: string; mimeType: string }>,
    productTitleHint?: string,
  ): Promise<ImageClassificationResult[]> {
    if (images.length === 0) return [];

    const prompt = buildImageClassificationPrompt({ imageCount: images.length, productTitleHint });
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: prompt },
      ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.base64 } })),
    ];

    const result = await this.model.generateContent(parts);
    const raw = result.response.text().trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(raw) as ImageClassificationResult[];

    // Ensure every index has a result; fill missing with safe defaults
    return images.map((_, index) => {
      const found = parsed.find((item) => item.index === index);
      return found ?? {
        index,
        imageClass: 'unknown' as const,
        relevanceScore: 0.5,
        viewAngle: 'unknown' as const,
        rejected: false,
      };
    });
  }
}
