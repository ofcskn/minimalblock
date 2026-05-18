import { generateId, type ImportedImageCandidate, type ProductCluster, type ImportFieldConfidence, type ProductCategory } from '@minimalblock/core';
import { GeminiProductClusterAnalyzer, type MultiProductDetectionInput } from '@minimalblock/ai';
import type { ScrapedPageData } from '@minimalblock/core';

export interface ClusterDetectionResult {
  clusters: ProductCluster[];
  primaryClusterId: string;
  multiProductDetected: boolean;
}

export class ClusterDetectionPipeline {
  constructor(private readonly analyzer: GeminiProductClusterAnalyzer) {}

  async detect(
    candidates: ImportedImageCandidate[],
    scrape: ScrapedPageData,
  ): Promise<ClusterDetectionResult> {
    const nonRejected = candidates.filter((c) => !c.aiRejected && c.url && c.mimeType);
    const acceptedImages: Array<{ base64: string; mimeType: string }> = [];

    for (const candidate of nonRejected.slice(0, 6)) {
      if (!candidate.url || !candidate.mimeType || candidate.mimeType === 'image/svg+xml') continue;
      try {
        const res = await fetch(candidate.url, {
          headers: { 'user-agent': 'MinimalBlockBot/1.0', accept: 'image/*' },
        });
        if (!res.ok) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        acceptedImages.push({ base64: buf.toString('base64'), mimeType: candidate.mimeType });
      } catch {
        // skip unfetchable images
      }
    }

    const input: MultiProductDetectionInput = {
      title: scrape.title,
      description: scrape.description,
      imageCount: acceptedImages.length || candidates.length,
      specTableKeys: scrape.specificationTable ? Object.keys(scrape.specificationTable) : undefined,
    };

    const result = await this.analyzer.analyze(acceptedImages, input);

    const clusters: ProductCluster[] = result.clusters.map((detectedCluster) => {
      const clusterId = generateId();
      // Map image indexes back to candidate IDs from accepted images
      const imageIds: string[] = detectedCluster.imageIndexes
        .map((idx) => nonRejected[idx]?.id)
        .filter((id): id is string => id !== undefined);

      return {
        clusterId,
        clusterLabel: detectedCluster.label,
        confidence: detectedCluster.confidence as ImportFieldConfidence,
        imageIds: imageIds.length > 0 ? imageIds : candidates.map((c) => c.id),
        fields: {
          ...(detectedCluster.fieldHints.title ? {
            title: { value: detectedCluster.fieldHints.title, confidence: detectedCluster.confidence as ImportFieldConfidence, source: 'ai' as const },
          } : {}),
          ...(detectedCluster.fieldHints.category ? {
            category: { value: detectedCluster.fieldHints.category as ProductCategory, confidence: detectedCluster.confidence as ImportFieldConfidence, source: 'ai' as const },
          } : {}),
          ...(detectedCluster.fieldHints.materials?.length ? {
            materials: { value: detectedCluster.fieldHints.materials, confidence: detectedCluster.confidence as ImportFieldConfidence, source: 'ai' as const },
          } : {}),
          ...(detectedCluster.fieldHints.dimensions ? {
            dimensions: { value: detectedCluster.fieldHints.dimensions, confidence: detectedCluster.confidence as ImportFieldConfidence, source: 'ai' as const },
          } : {}),
        },
      };
    });

    const primaryClusterId = clusters[0]?.clusterId ?? generateId();

    return { clusters, primaryClusterId, multiProductDetected: result.multiProductDetected };
  }
}
