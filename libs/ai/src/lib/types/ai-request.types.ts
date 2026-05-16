export type QualityHint = 'fast' | 'balanced' | 'quality';

export interface Convert2DTo3DRequest {
  imageBase64: string;
  imageMimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  productCategory: string;
  qualityHint?: QualityHint;
}

export interface AnalyzeImageRequest {
  imageBase64: string;
  imageMimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}
