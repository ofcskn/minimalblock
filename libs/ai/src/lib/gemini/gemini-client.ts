import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export const DEFAULT_MODEL_ID = 'gemini-2.5-flash';
export const ANALYSIS_MODEL_ID = 'gemini-2.5-pro';

export function createGeminiClient(apiKey: string): GoogleGenerativeAI {
  return new GoogleGenerativeAI(apiKey);
}

export function createGenerativeModel(apiKey: string, modelId = DEFAULT_MODEL_ID): GenerativeModel {
  return createGeminiClient(apiKey).getGenerativeModel({ model: modelId });
}
