import type { ImportedImageCandidate, ProductImportData } from '@minimalblock/core';
import { GeminiProductIntelligenceAgent, ImageDeduplicationService } from '@minimalblock/ai';

export interface ImageIntelligenceResult {
  candidates: ImportedImageCandidate[];
  summary: ProductImportData['imageIntelligence'];
}

export class ProductIntelligencePipeline {
  constructor(
    private readonly agent: GeminiProductIntelligenceAgent,
    private readonly deduplicator: ImageDeduplicationService,
  ) {}

  async analyze(
    candidates: ImportedImageCandidate[],
    productTitleHint?: string,
  ): Promise<ImageIntelligenceResult> {
    const totalBefore = candidates.length;
    if (candidates.length === 0) {
      return {
        candidates,
        summary: {
          totalCandidatesBeforeFiltering: 0,
          rejectedByAi: 0,
          duplicatesRemoved: 0,
          variantImagesDetected: 0,
          datasetCoherence: 'low',
          reconstructionReadiness: 'blocked',
          productIdentityScore: 0,
          uncertaintyLevel: 'high',
          perspectiveDiversity: 'limited',
          intelligenceNotes: ['No candidates provided.'],
        },
      };
    }

    // Fetch all candidate image buffers
    const buffers = await Promise.all(
      candidates.map(async (candidate) => {
        if (!candidate.url) return null;
        try {
          const res = await fetch(candidate.url, {
            headers: { 'user-agent': 'MinimalBlockBot/1.0', accept: 'image/*' },
          });
          if (!res.ok) return null;
          return new Uint8Array(await res.arrayBuffer());
        } catch {
          return null;
        }
      }),
    );

    // Perceptual deduplication
    const hashes = buffers.map((buf) =>
      buf ? this.deduplicator.computeHash(buf) : '0000000000000000',
    );
    const duplicateIndexes = new Set(this.deduplicator.findDuplicates(hashes));

    // Build base64 images for agent (only non-failed, non-SVG)
    const agentImages: Array<{ base64: string; mimeType: string; originalIndex: number }> = [];
    for (let i = 0; i < candidates.length; i++) {
      const buf = buffers[i];
      if (buf && candidates[i].mimeType && candidates[i].mimeType !== 'image/svg+xml') {
        agentImages.push({
          base64: btoa(String.fromCharCode(...buf)),
          mimeType: candidates[i].mimeType!,
          originalIndex: i,
        });
      }
    }

    // Single Gemini call — contextual reasoning over the full image set
    let agentResult: Awaited<ReturnType<GeminiProductIntelligenceAgent['analyze']>> | undefined;
    try {
      agentResult = await this.agent.analyze(
        agentImages.map((img) => ({ base64: img.base64, mimeType: img.mimeType })),
        productTitleHint,
      );
    } catch {
      // Graceful fallback: proceed without APIA
    }

    let rejectedCount = 0;
    let variantCount = 0;

    const enriched: ImportedImageCandidate[] = candidates.map((candidate, originalIndex) => {
      const agentIdx = agentImages.findIndex((g) => g.originalIndex === originalIndex);
      const imageResult = agentIdx >= 0 ? agentResult?.images[agentIdx] : undefined;
      const isDuplicate = duplicateIndexes.has(originalIndex);
      const isRejected = isDuplicate || (imageResult?.rejected ?? false);

      if (isRejected) rejectedCount++;
      if (imageResult?.rejectionReason?.startsWith('variant:') || candidate.variantKey) variantCount++;

      return {
        ...candidate,
        perceptualHash: hashes[originalIndex] !== '0000000000000000' ? hashes[originalIndex] : undefined,
        aiImageClass: imageResult?.imageClass,
        aiRelevanceScore: imageResult?.relevanceScore,
        aiRejected: isRejected,
        aiRejectionReason: isDuplicate ? 'duplicate' : imageResult?.rejectionReason,
        viewAngle: imageResult?.viewAngle,
        informationValue: imageResult?.informationValue,
        geometricContribution: imageResult?.geometricContribution,
      };
    });

    // Sort: high-information non-rejected first, then by relevance, rejected last
    const sorted = [...enriched].sort((a, b) => {
      if (a.aiRejected && !b.aiRejected) return 1;
      if (!a.aiRejected && b.aiRejected) return -1;
      const infoOrder = { high: 0, medium: 1, low: 2 };
      const aInfo = infoOrder[a.informationValue ?? 'medium'];
      const bInfo = infoOrder[b.informationValue ?? 'medium'];
      if (aInfo !== bInfo) return aInfo - bInfo;
      return (b.aiRelevanceScore ?? 0.5) - (a.aiRelevanceScore ?? 0.5);
    });

    const dataset = agentResult?.dataset;

    return {
      candidates: sorted,
      summary: {
        totalCandidatesBeforeFiltering: totalBefore,
        rejectedByAi: rejectedCount,
        duplicatesRemoved: duplicateIndexes.size,
        variantImagesDetected: variantCount,
        datasetCoherence: dataset?.datasetCoherence,
        reconstructionReadiness: dataset?.reconstructionReadiness,
        reconstructionBlockReason: dataset?.reconstructionBlockReason,
        productIdentityScore: dataset?.productIdentityScore,
        uncertaintyLevel: dataset?.uncertaintyLevel,
        perspectiveDiversity: dataset?.perspectiveDiversity,
        intelligenceNotes: dataset?.intelligenceNotes,
      },
    };
  }
}
