import type { GenerativeModel } from '@google/generative-ai';
import type { GeneratedPrimitive, GeminiQaResult } from '@minimalblock/core';
import { buildVisualQaPrompt } from '../prompts/visual-qa.prompt.js';

export interface VisualQaInput {
  sourceImageUrls: string[];
  productCategory: string;
  generatedPrimitive: GeneratedPrimitive;
}

async function fetchImageBase64(url: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') ?? 'image/jpeg';
    const mimeType = contentType.split(';')[0].trim();
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return { mimeType, data: btoa(binary) };
  } catch {
    return null;
  }
}

function parseQaResponse(raw: string): GeminiQaResult {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  try {
    const parsed = JSON.parse(cleaned) as Partial<GeminiQaResult>;
    const score = typeof parsed.qualityScore === 'number' ? Math.max(0, Math.min(100, parsed.qualityScore)) : 0;
    const statusFromScore = (s: number): GeminiQaResult['status'] =>
      s >= 90 ? 'excellent' : s >= 70 ? 'good' : s >= 40 ? 'needs_improvement' : s >= 20 ? 'failed' : 'critical_failure';
    return {
      conversionSucceeded: parsed.conversionSucceeded ?? score >= 40,
      qualityScore: score,
      status: parsed.status ?? statusFromScore(score),
      categoryMatch: parsed.categoryMatch ?? { score: 0, reason: 'Unable to assess' },
      missingParts: parsed.missingParts ?? [],
      sourceImageIssues: parsed.sourceImageIssues ?? [],
      recommendedActions: parsed.recommendedActions ?? [],
    };
  } catch {
    return {
      conversionSucceeded: false,
      qualityScore: 0,
      status: 'critical_failure',
      categoryMatch: { score: 0, reason: 'QA response could not be parsed' },
      missingParts: [],
      sourceImageIssues: [],
      recommendedActions: ['Regenerate the model with a clearer product image.'],
    };
  }
}

export class GeminiVisualQa {
  constructor(private readonly model: GenerativeModel) {}

  async evaluate(input: VisualQaInput): Promise<GeminiQaResult> {
    const imageUrls = input.sourceImageUrls.slice(0, 5);
    const imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];

    for (const url of imageUrls) {
      const img = await fetchImageBase64(url);
      if (img) {
        imageParts.push({ inlineData: img });
      }
    }

    if (imageParts.length === 0) {
      return {
        conversionSucceeded: false,
        qualityScore: 0,
        status: 'critical_failure',
        categoryMatch: { score: 0, reason: 'No source images could be loaded for QA' },
        missingParts: [],
        sourceImageIssues: ['Source images could not be fetched for visual QA'],
        recommendedActions: ['Re-upload source images and regenerate.'],
      };
    }

    const prompt = buildVisualQaPrompt(input.productCategory, input.generatedPrimitive);
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: prompt },
      ...imageParts,
    ];

    const result = await this.model.generateContent(parts);
    return parseQaResponse(result.response.text());
  }
}
