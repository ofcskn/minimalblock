// Gemini client factories
export { createGeminiClient, createGenerativeModel, DEFAULT_MODEL_ID, ANALYSIS_MODEL_ID } from './lib/gemini/gemini-client.js';

// Gemini implementations (constructor-injected with GenerativeModel)
export { GeminiModelGenerator } from './lib/gemini/gemini-3d-generator.js';
export { GeminiImageAnalyzer } from './lib/gemini/gemini-image-analyzer.js';
export { GeminiRiskAnalyzer } from './lib/gemini/gemini-risk-analyzer.js';
export { GeminiVisualQa } from './lib/gemini/gemini-visual-qa.js';
export type { VisualQaInput } from './lib/gemini/gemini-visual-qa.js';

// Prompts
export { buildConvert2DTo3DPrompt, buildImageAnalysisPrompt } from './lib/prompts/convert-2d-to-3d.prompt.js';
export { buildReturnRiskPrompt } from './lib/prompts/return-risk-analysis.prompt.js';
export { buildVisualQaPrompt } from './lib/prompts/visual-qa.prompt.js';

// Types
export type { Convert2DTo3DRequest, AnalyzeImageRequest, QualityHint } from './lib/types/ai-request.types.js';
export type { Convert2DTo3DResponse, ImageAnalysisResponse } from './lib/types/ai-response.types.js';
export type { ReturnRiskItem } from './lib/gemini/gemini-risk-analyzer.js';
export type { ReturnRiskInput } from './lib/prompts/return-risk-analysis.prompt.js';
