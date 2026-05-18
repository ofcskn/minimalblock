import { MediaAsset } from '../../domain/value-objects/media-asset.vo.js';

export interface GenerateModelInput {
  sourceAsset: MediaAsset;
  /** All available source images (multi-view). Falls back to [sourceAsset] if omitted. */
  sourceAssets?: MediaAsset[];
  productCategory: string;
  qualityHint?: 'fast' | 'balanced' | 'quality';
  /** Product title from import data — improves Gemini structural prompts. */
  productTitle?: string;
  /** Declared dimensions string from import data (e.g. "120 x 80 x 75 cm"). */
  productDimensions?: string;
  /** Pre-computed material finish from the import pipeline. */
  inferredMaterialFinish?: string;
  /** Pre-computed geometry complexity from the import pipeline. */
  inferredGeometryComplexity?: string;
}

export interface GeneratedPrimitivePart {
  shape: 'box' | 'cylinder' | 'sphere';
  widthM: number;
  heightM: number;
  depthM: number;
  baseColor: [number, number, number, number];
  roughness: number;
  metalness: number;
  description?: string;
}

export interface GeneratedPrimitive {
  shape: 'box' | 'cylinder' | 'sphere' | 'compound';
  detectedType: string;
  widthM: number;
  heightM: number;
  depthM: number;
  baseColor: [number, number, number, number];
  roughness: number;
  metalness: number;
  parts?: GeneratedPrimitivePart[];
}

export interface GenerateModelOutput {
  outputAsset: MediaAsset;
  tokensUsed: number;
  generatedPrimitive?: GeneratedPrimitive;
  /** Full scene graph produced by the v2 pipeline (undefined for legacy fallback). */
  sceneGraph?: Record<string, unknown>;
  /** Validation report from the v2 pipeline. */
  validationReport?: Record<string, unknown>;
}

export interface IModelGeneratorPort {
  generate(input: GenerateModelInput): Promise<GenerateModelOutput>;
}
