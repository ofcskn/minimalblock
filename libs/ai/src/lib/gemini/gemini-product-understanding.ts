import type { GenerativeModel } from '@google/generative-ai';
import type { ProductUnderstanding, ProductUnderstandingInput, ProductStructuralPart } from '../types/product-understanding.types.js';
import { buildProductUnderstandingPrompt } from '../prompts/product-understanding.prompt.js';
import type { QualityHint } from '../types/ai-request.types.js';

export interface SourceImage {
  base64: string;
  mimeType: string;
  viewAngle?: string;
}

const FALLBACK: ProductUnderstanding = {
  detectedCategory: 'other',
  detectedSubtype: 'other',
  geometryFamily: 'hard-surface',
  structuralParts: [
    {
      partId: 'main-body',
      label: 'main body',
      geometryHint: 'box',
      relativeSize: 'dominant',
      relativePosition: 'center',
      material: 'unknown',
      isVisible: true,
    },
  ],
  symmetryAxis: 'none',
  estimatedBoundingBox: { width: 0.3, height: 0.3, depth: 0.3 },
  viewAnglesDetected: ['front'],
  confidence: 0.1,
  structuralWarnings: ['Fallback used — Gemini response could not be parsed'],
};

export class GeminiProductUnderstandingAnalyzer {
  constructor(private readonly model: GenerativeModel) {}

  async analyze(
    images: SourceImage[],
    input: ProductUnderstandingInput,
    quality: QualityHint = 'balanced',
  ): Promise<ProductUnderstanding> {
    const prompt = buildProductUnderstandingPrompt({
      productCategory: input.productCategory,
      productTitle: input.productTitle,
      productDimensions: input.productDimensions,
      inferredMaterial: input.inferredMaterial,
      imageViewAngles: images.map(img => img.viewAngle ?? 'unknown').filter(a => a !== 'unknown'),
      quality,
    });

    const parts: Parameters<typeof this.model.generateContent>[0] extends Array<infer U> ? U[] : never[] = [];
    const contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: prompt },
      ...images.slice(0, 5).map(img => ({
        inlineData: { mimeType: img.mimeType, data: img.base64 },
      })),
    ];

    void parts;

    try {
      const result = await this.model.generateContent(contentParts);
      const raw = result.response.text().trim();
      return this.parse(raw);
    } catch (err) {
      console.error('[GeminiProductUnderstandingAnalyzer] Gemini call failed:', err);
      return { ...FALLBACK };
    }
  }

  private parse(raw: string): ProductUnderstanding {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    try {
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;
      return this.validate(parsed);
    } catch {
      console.error('[GeminiProductUnderstandingAnalyzer] JSON parse failed. Raw:', raw.slice(0, 200));
      return { ...FALLBACK };
    }
  }

  private validate(p: Record<string, unknown>): ProductUnderstanding {
    const parts = Array.isArray(p['structuralParts']) ? p['structuralParts'] : [];
    const bb = (p['estimatedBoundingBox'] as Record<string, number>) ?? {};
    return {
      detectedCategory: (p['detectedCategory'] as string) || 'other',
      detectedSubtype:  (p['detectedSubtype']  as string) || 'other',
      geometryFamily:   (p['geometryFamily']   as ProductUnderstanding['geometryFamily']) || 'hard-surface',
      structuralParts:  parts.map((pt: Record<string, unknown>) => ({
        partId:              (pt['partId'] as string) || 'part',
        label:               (pt['label'] as string) || 'part',
        geometryHint:        ((pt['geometryHint'] as string) || 'box') as ProductStructuralPart['geometryHint'],
        relativeSize:        ((pt['relativeSize'] as string) || 'medium') as ProductStructuralPart['relativeSize'],
        relativePosition:    (pt['relativePosition'] as string) || 'center',
        material:            (pt['material'] as string) || 'unknown',
        isVisible:           pt['isVisible'] !== false,
        symmetricCounterpart: (pt['symmetricCounterpart'] as string | null) || undefined,
      })),
      symmetryAxis:     (p['symmetryAxis'] as 'x' | 'z' | 'none') || 'none',
      estimatedBoundingBox: {
        width:  typeof bb['width']  === 'number' ? bb['width']  : 0.3,
        height: typeof bb['height'] === 'number' ? bb['height'] : 0.3,
        depth:  typeof bb['depth']  === 'number' ? bb['depth']  : 0.3,
      },
      viewAnglesDetected: Array.isArray(p['viewAnglesDetected']) ? (p['viewAnglesDetected'] as string[]) : [],
      confidence:        typeof p['confidence'] === 'number' ? (p['confidence'] as number) : 0.5,
      structuralWarnings: Array.isArray(p['structuralWarnings']) ? (p['structuralWarnings'] as string[]) : [],
    };
  }
}
