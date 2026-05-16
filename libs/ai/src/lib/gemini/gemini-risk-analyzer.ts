import type { GenerativeModel } from '@google/generative-ai';
import { buildReturnRiskPrompt } from '../prompts/return-risk-analysis.prompt.js';
import type { ReturnRiskInput } from '../prompts/return-risk-analysis.prompt.js';

export interface ReturnRiskItem {
  risk: string;
  recommendation: string;
}

export class GeminiRiskAnalyzer {
  constructor(private readonly model: GenerativeModel) {}

  async analyze(input: ReturnRiskInput): Promise<ReturnRiskItem[]> {
    const result = await this.model.generateContent(buildReturnRiskPrompt(input));
    const raw = result.response.text().trim();
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
    return JSON.parse(cleaned) as ReturnRiskItem[];
  }
}
