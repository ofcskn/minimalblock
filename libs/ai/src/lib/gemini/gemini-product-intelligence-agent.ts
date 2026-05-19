import type { GenerativeModel } from '@google/generative-ai';
import {
  buildProductIntelligencePrompt,
  type ProductIntelligenceOutput,
  type PerImageIntelligence,
  type DatasetIntelligence,
} from '../prompts/product-intelligence.prompt.js';

export type { ProductIntelligenceOutput, PerImageIntelligence, DatasetIntelligence };

const SAFE_IMAGE_DEFAULTS: Omit<PerImageIntelligence, 'index'> = {
  imageClass: 'unknown',
  relevanceScore: 0.5,
  viewAngle: 'unknown',
  rejected: false,
  informationValue: 'medium',
  geometricContribution: 'secondary',
};

const SAFE_DATASET_DEFAULTS: DatasetIntelligence = {
  productIdentityScore: 0.5,
  datasetCoherence: 'medium',
  reconstructionReadiness: 'degraded',
  uncertaintyLevel: 'high',
  perspectiveDiversity: 'limited',
  intelligenceNotes: ['Dataset intelligence unavailable — safe degradation applied.'],
};

export class GeminiProductIntelligenceAgent {
  constructor(private readonly model: GenerativeModel) {}

  async analyze(
    images: Array<{ base64: string; mimeType: string }>,
    productTitleHint?: string,
  ): Promise<ProductIntelligenceOutput> {
    if (images.length === 0) {
      return {
        images: [],
        dataset: { ...SAFE_DATASET_DEFAULTS, intelligenceNotes: ['No images provided.'] },
      };
    }

    const prompt = buildProductIntelligencePrompt({ imageCount: images.length, productTitleHint });
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: prompt },
      ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.base64 } })),
    ];

    const result = await this.model.generateContent(parts);
    const raw = result.response.text().trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(raw) as ProductIntelligenceOutput;

    const enrichedImages = images.map((_, index) => {
      const found = parsed.images?.find((item) => item.index === index);
      return found ? { ...found, index } : { ...SAFE_IMAGE_DEFAULTS, index };
    });

    const dataset: DatasetIntelligence = parsed.dataset ?? SAFE_DATASET_DEFAULTS;

    return { images: enrichedImages, dataset };
  }
}
