import { MediaAsset } from '../../domain/value-objects/media-asset.vo.js';

export interface GenerateModelInput {
  sourceAsset: MediaAsset;
  productCategory: string;
  qualityHint?: 'fast' | 'balanced' | 'quality';
}

export interface GenerateModelOutput {
  outputAsset: MediaAsset;
  tokensUsed: number;
}

export interface IModelGeneratorPort {
  generate(input: GenerateModelInput): Promise<GenerateModelOutput>;
}
