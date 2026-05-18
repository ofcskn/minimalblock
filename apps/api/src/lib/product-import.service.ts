import { MediaAsset, type ProductImportData } from '@minimalblock/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@minimalblock/data';
import { ExtractionOrchestrator, type OrchestratorResult } from './import/orchestrator.js';

export interface ProductImportServiceOptions {
  admin: SupabaseClient<Database>;
  ownerId: string;
  geminiApiKey: string;
}

export class ProductImportService {
  private readonly orchestrator: ExtractionOrchestrator;

  constructor(options: ProductImportServiceOptions) {
    this.orchestrator = new ExtractionOrchestrator(options);
  }

  async importFromUrl(rawUrl: string): Promise<OrchestratorResult> {
    return this.orchestrator.run(rawUrl);
  }

  static toImportedMediaAssets(importData: ProductImportData | null): MediaAsset[] {
    if (!importData) return [];
    return importData.imageCandidates
      .filter((candidate) => candidate.selected && candidate.storageKey && candidate.url && candidate.mimeType && candidate.sizeBytes !== undefined)
      .map((candidate) => new MediaAsset({
        url: candidate.url!,
        storageKey: candidate.storageKey!,
        mimeType: candidate.mimeType!,
        kind: 'source-image',
        sizeBytes: candidate.sizeBytes!,
      }));
  }
}
