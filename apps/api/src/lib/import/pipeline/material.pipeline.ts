import type { ImportedImageCandidate, MaterialFinish, GeometryComplexity } from '@minimalblock/core';
import { GeminiMaterialInferenceEngine } from '@minimalblock/ai';
import type { ScrapedPageData } from '@minimalblock/core';

export interface MaterialInferenceOutput {
  inferredMaterialFinish: MaterialFinish;
  inferredGeometryComplexity: GeometryComplexity;
}

export class MaterialInferencePipeline {
  constructor(private readonly engine: GeminiMaterialInferenceEngine) {}

  async infer(
    candidates: ImportedImageCandidate[],
    scrape: ScrapedPageData,
  ): Promise<MaterialInferenceOutput> {
    const heroCandidates = candidates
      .filter((c) => !c.aiRejected && c.url && c.mimeType && c.mimeType !== 'image/svg+xml')
      .sort((a, b) => (b.aiRelevanceScore ?? 0.5) - (a.aiRelevanceScore ?? 0.5))
      .slice(0, 3);

    const heroImages: Array<{ base64: string; mimeType: string }> = [];
    for (const candidate of heroCandidates) {
      if (!candidate.url || !candidate.mimeType) continue;
      try {
        const res = await fetch(candidate.url, {
          headers: { 'user-agent': 'MinimalBlockBot/1.0', accept: 'image/*' },
        });
        if (!res.ok) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        heroImages.push({ base64: buf.toString('base64'), mimeType: candidate.mimeType });
      } catch {
        // skip
      }
    }

    const result = await this.engine.infer(heroImages, {
      productTitle: scrape.title,
      knownMaterials: scrape.materials,
    });

    return {
      inferredMaterialFinish: result.materialFinish,
      inferredGeometryComplexity: result.geometryComplexity,
    };
  }
}
