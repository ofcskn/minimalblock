import { Buffer } from 'node:buffer';
import type { ImportedImageCandidate, ProductImportData } from '@minimalblock/core';
import { GeminiImageClassifier, ImageDeduplicationService } from '@minimalblock/ai';

export interface ImageIntelligenceResult {
  candidates: ImportedImageCandidate[];
  summary: ProductImportData['imageIntelligence'];
}

export class ImageIntelligencePipeline {
  private readonly deduplicator = new ImageDeduplicationService();

  constructor(private readonly classifier: GeminiImageClassifier) {}

  async analyze(
    candidates: ImportedImageCandidate[],
    productTitleHint?: string,
  ): Promise<ImageIntelligenceResult> {
    const totalBefore = candidates.length;
    if (candidates.length === 0) {
      return {
        candidates,
        summary: { totalCandidatesBeforeFiltering: 0, rejectedByAi: 0, duplicatesRemoved: 0, variantImagesDetected: 0 },
      };
    }

    // Fetch all candidate images into buffers for hashing
    const buffers = await Promise.all(
      candidates.map(async (candidate) => {
        if (!candidate.url) return null;
        try {
          const res = await fetch(candidate.url, {
            headers: { 'user-agent': 'MinimalBlockBot/1.0', accept: 'image/*' },
          });
          if (!res.ok) return null;
          return Buffer.from(await res.arrayBuffer());
        } catch {
          return null;
        }
      }),
    );

    // Perceptual deduplication
    const hashes = buffers.map((buf) => buf ? this.deduplicator.computeHash(new Uint8Array(buf)) : '0000000000000000');
    const duplicateIndexes = new Set(this.deduplicator.findDuplicates(hashes));

    // Build base64 images for Gemini classification (only non-failed uploads)
    const geminiImages: Array<{ base64: string; mimeType: string; originalIndex: number }> = [];
    for (let i = 0; i < candidates.length; i++) {
      const buf = buffers[i];
      if (buf && candidates[i].mimeType && candidates[i].mimeType !== 'image/svg+xml') {
        geminiImages.push({
          base64: buf.toString('base64'),
          mimeType: candidates[i].mimeType!,
          originalIndex: i,
        });
      }
    }

    // Single Gemini call for all images
    let classifications: Awaited<ReturnType<GeminiImageClassifier['classifyBatch']>> = [];
    try {
      classifications = await this.classifier.classifyBatch(
        geminiImages.map((img) => ({ base64: img.base64, mimeType: img.mimeType })),
        productTitleHint,
      );
    } catch {
      // Graceful fallback: proceed without AI classification
    }

    let rejectedCount = 0;
    let variantCount = 0;

    const enriched: ImportedImageCandidate[] = candidates.map((candidate, originalIndex) => {
      const geminiIdx = geminiImages.findIndex((g) => g.originalIndex === originalIndex);
      const classification = geminiIdx >= 0 ? classifications[geminiIdx] : undefined;
      const isDuplicate = duplicateIndexes.has(originalIndex);
      const isRejected = isDuplicate || (classification?.rejected ?? false);

      if (isRejected) rejectedCount++;
      if (classification?.rejectionReason?.startsWith('variant:') || candidate.variantKey) variantCount++;

      return {
        ...candidate,
        perceptualHash: hashes[originalIndex] !== '0000000000000000' ? hashes[originalIndex] : undefined,
        aiImageClass: classification?.imageClass,
        aiRelevanceScore: classification?.relevanceScore,
        aiRejected: isRejected,
        aiRejectionReason: isDuplicate ? 'duplicate' : classification?.rejectionReason,
        viewAngle: classification?.viewAngle,
      };
    });

    // Sort: hero/detail first by relevance, rejected last
    const sorted = [...enriched].sort((a, b) => {
      if (a.aiRejected && !b.aiRejected) return 1;
      if (!a.aiRejected && b.aiRejected) return -1;
      return (b.aiRelevanceScore ?? 0.5) - (a.aiRelevanceScore ?? 0.5);
    });

    return {
      candidates: sorted,
      summary: {
        totalCandidatesBeforeFiltering: totalBefore,
        rejectedByAi: rejectedCount,
        duplicatesRemoved: duplicateIndexes.size,
        variantImagesDetected: variantCount,
      },
    };
  }
}
