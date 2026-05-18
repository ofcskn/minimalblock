// Gemini client factories
export { createGeminiClient, createGenerativeModel, DEFAULT_MODEL_ID, ANALYSIS_MODEL_ID } from './lib/gemini/gemini-client.js';

// Gemini implementations (constructor-injected with GenerativeModel)
export { GeminiModelGenerator } from './lib/gemini/gemini-3d-generator.js';
export { GeminiImageAnalyzer } from './lib/gemini/gemini-image-analyzer.js';
export { GeminiRiskAnalyzer } from './lib/gemini/gemini-risk-analyzer.js';
export { GeminiVisualQa } from './lib/gemini/gemini-visual-qa.js';
export type { VisualQaInput } from './lib/gemini/gemini-visual-qa.js';

// APUS — AI service classes
export { GeminiImageClassifier } from './lib/gemini/gemini-image-classifier.js';
export type { ImageClassificationResult } from './lib/gemini/gemini-image-classifier.js';
export { GeminiProductClusterAnalyzer } from './lib/gemini/gemini-product-cluster-analyzer.js';
export type { MultiProductDetectionResult } from './lib/gemini/gemini-product-cluster-analyzer.js';
export { GeminiMaterialInferenceEngine } from './lib/gemini/gemini-material-inference.js';
export type { MaterialInferenceResult } from './lib/gemini/gemini-material-inference.js';
export { ImageDeduplicationService } from './lib/gemini/image-deduplication.service.js';

// Prompts
export { buildConvert2DTo3DPrompt, buildImageAnalysisPrompt } from './lib/prompts/convert-2d-to-3d.prompt.js';
export { buildReturnRiskPrompt } from './lib/prompts/return-risk-analysis.prompt.js';
export { buildVisualQaPrompt } from './lib/prompts/visual-qa.prompt.js';
export { buildTrendyolListingPrompt } from './lib/prompts/trendyol-listing.js';
export type { TrendyolListingInput } from './lib/prompts/trendyol-listing.js';

// APUS — prompt builders
export { buildImageClassificationPrompt } from './lib/prompts/image-classification.prompt.js';
export type { ImageClassificationPromptInput } from './lib/prompts/image-classification.prompt.js';
export { buildMultiProductDetectionPrompt } from './lib/prompts/multi-product-detection.prompt.js';
export type { MultiProductDetectionInput, DetectedCluster } from './lib/prompts/multi-product-detection.prompt.js';
export { buildMaterialInferencePrompt } from './lib/prompts/material-inference.prompt.js';
export type { MaterialInferenceInput } from './lib/prompts/material-inference.prompt.js';
export { buildDeepAutofillPrompt } from './lib/prompts/deep-product-autofill.prompt.js';
export type { DeepAutofillInput } from './lib/prompts/deep-product-autofill.prompt.js';

// Types
export type { Convert2DTo3DRequest, AnalyzeImageRequest, QualityHint } from './lib/types/ai-request.types.js';
export type { Convert2DTo3DResponse, ImageAnalysisResponse } from './lib/types/ai-response.types.js';
export type { ReturnRiskItem } from './lib/gemini/gemini-risk-analyzer.js';
export type { ReturnRiskInput } from './lib/prompts/return-risk-analysis.prompt.js';

// Mock provider (replaceable — real Gemini implements the same interface)
export { getMockAnalysis } from './lib/mock/mock-analyzer.js';
