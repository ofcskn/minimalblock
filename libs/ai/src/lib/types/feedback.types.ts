import type { GeometryFamily } from './scene-graph.types.js';

export type FeedbackSignal = 'approved' | 'rejected' | 'regenerated';

export interface GenerationFeedbackRecord {
  productId: string;
  conversionId: string;
  signal: FeedbackSignal;
  rejectionReason?: string;
  detectedSubtype: string;
  geometryFamily: GeometryFamily;
  qaScore?: number;
  validationScore?: number;
  sceneGraphSnapshot?: Record<string, unknown>;
  createdAt: string;
}
