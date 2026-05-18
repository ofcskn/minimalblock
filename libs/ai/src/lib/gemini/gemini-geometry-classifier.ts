import type { GenerativeModel } from '@google/generative-ai';
import type { GeometryIntelligence, ProductUnderstanding } from '../types/product-understanding.types.js';
import { buildGeometryClassificationPrompt } from '../prompts/geometry-classification.prompt.js';

const FALLBACK_SEGMENTS: Record<string, number> = {};

export class GeminiGeometryClassifier {
  constructor(private readonly model: GenerativeModel) {}

  async classify(understanding: ProductUnderstanding): Promise<GeometryIntelligence> {
    const prompt = buildGeometryClassificationPrompt(understanding);
    try {
      const result = await this.model.generateContent([{ text: prompt }]);
      const raw = result.response.text().trim();
      return this.parse(raw, understanding);
    } catch (err) {
      console.error('[GeminiGeometryClassifier] Gemini call failed:', err);
      return this.fallback(understanding);
    }
  }

  private parse(raw: string, understanding: ProductUnderstanding): GeometryIntelligence {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    try {
      const p = JSON.parse(cleaned) as Record<string, unknown>;
      return {
        geometryFamily: (p['geometryFamily'] as GeometryIntelligence['geometryFamily']) || understanding.geometryFamily,
        recommendedSegments: (p['recommendedSegments'] as Record<string, number>) || FALLBACK_SEGMENTS,
        smoothShadingParts: Array.isArray(p['smoothShadingParts']) ? (p['smoothShadingParts'] as string[]) : [],
        hardEdgeParts: Array.isArray(p['hardEdgeParts']) ? (p['hardEdgeParts'] as string[]) : [],
        criticalTopologyNotes: Array.isArray(p['criticalTopologyNotes']) ? (p['criticalTopologyNotes'] as string[]) : [],
      };
    } catch {
      console.error('[GeminiGeometryClassifier] JSON parse failed. Raw:', raw.slice(0, 200));
      return this.fallback(understanding);
    }
  }

  private fallback(understanding: ProductUnderstanding): GeometryIntelligence {
    const segments: Record<string, number> = {};
    for (const part of understanding.structuralParts) {
      if (part.geometryHint === 'cylinder') segments[part.partId] = 16;
      if (part.geometryHint === 'torus')    segments[part.partId] = 32;
      if (part.geometryHint === 'sphere')   segments[part.partId] = 16;
    }
    return {
      geometryFamily: understanding.geometryFamily,
      recommendedSegments: segments,
      smoothShadingParts: [],
      hardEdgeParts: [],
      criticalTopologyNotes: [],
    };
  }
}
