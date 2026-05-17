import { MediaAsset } from '../../domain/value-objects/media-asset.vo.js';

export interface GenerateModelInput {
  sourceAsset: MediaAsset;
  productCategory: string;
  qualityHint?: 'fast' | 'balanced' | 'quality';
}

export interface GeneratedPrimitive {
  shape: 'box' | 'cylinder' | 'sphere';
  widthM: number;
  heightM: number;
  depthM: number;
  baseColor: [number, number, number, number];
  roughness: number;
  metalness: number;
}

export interface GenerateModelOutput {
  outputAsset: MediaAsset;
  tokensUsed: number;
  generatedPrimitive?: GeneratedPrimitive;
}

export interface IModelGeneratorPort {
  generate(input: GenerateModelInput): Promise<GenerateModelOutput>;
}
