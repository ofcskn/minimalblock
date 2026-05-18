import type { SupabaseClient } from '@supabase/supabase-js';
import type { FeedbackSignal } from '../types/feedback.types.js';
import type { SceneGraph } from '../types/scene-graph.types.js';

interface FeedbackRow {
  product_id: string;
  conversion_id: string;
  owner_id: string;
  signal: FeedbackSignal;
  rejection_reason?: string;
  detected_subtype: string;
  geometry_family: string;
  qa_score?: number;
  validation_score?: number;
  scene_graph_snapshot?: Record<string, unknown>;
}

export class GenerationFeedbackService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly supabase: SupabaseClient<any>, private readonly ownerId: string) {}

  async recordApproval(
    productId: string,
    conversionId: string,
    sceneGraph?: SceneGraph,
    qaScore?: number,
    validationScore?: number,
  ): Promise<void> {
    await this.insert({
      product_id:    productId,
      conversion_id: conversionId,
      owner_id:      this.ownerId,
      signal:        'approved',
      detected_subtype: sceneGraph?.productSubtype ?? 'unknown',
      geometry_family:  sceneGraph?.geometryFamily ?? 'hard-surface',
      qa_score:         qaScore,
      validation_score: validationScore,
      scene_graph_snapshot: sceneGraph
        ? { boundingBox: sceneGraph.boundingBox, partCount: sceneGraph.parts.length, confidence: sceneGraph.confidence }
        : undefined,
    });
  }

  async recordRejection(
    productId: string,
    conversionId: string,
    reason: string,
    sceneGraph?: SceneGraph,
    qaScore?: number,
  ): Promise<void> {
    await this.insert({
      product_id:       productId,
      conversion_id:    conversionId,
      owner_id:         this.ownerId,
      signal:           'rejected',
      rejection_reason: reason,
      detected_subtype: sceneGraph?.productSubtype ?? 'unknown',
      geometry_family:  sceneGraph?.geometryFamily ?? 'hard-surface',
      qa_score:         qaScore,
      scene_graph_snapshot: sceneGraph
        ? { boundingBox: sceneGraph.boundingBox, partCount: sceneGraph.parts.length, confidence: sceneGraph.confidence }
        : undefined,
    });
  }

  async recordRegeneration(productId: string, conversionId: string, sceneGraph?: SceneGraph): Promise<void> {
    await this.insert({
      product_id:    productId,
      conversion_id: conversionId,
      owner_id:      this.ownerId,
      signal:        'regenerated',
      detected_subtype: sceneGraph?.productSubtype ?? 'unknown',
      geometry_family:  sceneGraph?.geometryFamily ?? 'hard-surface',
    });
  }

  private async insert(row: FeedbackRow): Promise<void> {
    try {
      const { error } = await this.supabase.from('generation_feedback').insert(row);
      if (error) console.error('[GenerationFeedbackService] Insert failed:', error);
    } catch (err) {
      console.error('[GenerationFeedbackService] Unexpected error:', err);
    }
  }
}
