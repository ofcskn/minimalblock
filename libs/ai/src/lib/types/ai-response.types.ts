export interface Convert2DTo3DResponse {
  modelDataBase64: string;
  mimeType: 'model/gltf-binary';
  tokensUsed: number;
  promptTokens: number;
  candidateTokens: number;
}

export interface ImageAnalysisResponse {
  description: string;
  suggestedCategory: string;
  tokensUsed: number;
}
