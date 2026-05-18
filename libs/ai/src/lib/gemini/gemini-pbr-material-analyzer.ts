import type { GenerativeModel } from '@google/generative-ai';
import type { PbrMaterialMap, PbrMaterialEntry } from '../types/product-understanding.types.js';
import type { ScenePart } from '../types/scene-graph.types.js';
import { buildPbrMaterialPrompt } from '../prompts/pbr-material.prompt.js';
import type { SourceImage } from './gemini-product-understanding.js';

export class GeminiPbrMaterialAnalyzer {
  constructor(private readonly model: GenerativeModel) {}

  async analyze(images: SourceImage[], parts: ScenePart[]): Promise<PbrMaterialMap> {
    if (parts.length === 0) return { parts: [] };

    const partIds    = parts.map(p => p.id);
    const partLabels = parts.map(p => p.label);
    const prompt = buildPbrMaterialPrompt(partIds, partLabels);

    const contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: prompt },
      ...images.slice(0, 3).map(img => ({ inlineData: { mimeType: img.mimeType, data: img.base64 } })),
    ];

    try {
      const result = await this.model.generateContent(contentParts);
      const raw = result.response.text().trim();
      return this.parse(raw, parts);
    } catch (err) {
      console.error('[GeminiPbrMaterialAnalyzer] Gemini call failed:', err);
      return { parts: [] };
    }
  }

  private parse(raw: string, parts: ScenePart[]): PbrMaterialMap {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    try {
      const p = JSON.parse(cleaned) as { parts?: Record<string, unknown>[] };
      const rawParts = Array.isArray(p.parts) ? p.parts : [];
      const entries: PbrMaterialEntry[] = rawParts.map((rp): PbrMaterialEntry => {
        const bc = Array.isArray(rp['baseColor']) ? (rp['baseColor'] as number[]) : [0.7, 0.7, 0.7, 1];
        const entry: PbrMaterialEntry = {
          partId:          (rp['partId'] as string) || '',
          baseColor:       [bc[0] ?? 0.7, bc[1] ?? 0.7, bc[2] ?? 0.7, bc[3] ?? 1] as [number,number,number,number],
          roughness:       typeof rp['roughness'] === 'number' ? (rp['roughness'] as number) : 0.5,
          metalness:       typeof rp['metalness'] === 'number' ? (rp['metalness'] as number) : 0,
          dominantMaterial: (rp['dominantMaterial'] as string) || 'unknown',
        };
        if (typeof rp['transmissionFactor'] === 'number') entry.transmissionFactor = rp['transmissionFactor'] as number;
        if (typeof rp['ior']     === 'number') entry.ior = rp['ior'] as number;
        if (typeof rp['clearcoat'] === 'number') entry.clearcoat = rp['clearcoat'] as number;
        if (Array.isArray(rp['emissiveFactor'])) {
          const ef = rp['emissiveFactor'] as number[];
          entry.emissiveFactor = [ef[0] ?? 0, ef[1] ?? 0, ef[2] ?? 0];
        }
        return entry;
      });

      // Fill missing parts with defaults
      const entryMap = new Map(entries.map(e => [e.partId, e]));
      for (const part of parts) {
        if (!entryMap.has(part.id)) {
          entries.push({
            partId:          part.id,
            baseColor:       part.material.baseColor,
            roughness:       part.material.roughness,
            metalness:       part.material.metalness,
            dominantMaterial: 'unknown',
          });
        }
      }

      return { parts: entries };
    } catch {
      console.error('[GeminiPbrMaterialAnalyzer] JSON parse failed. Raw:', raw.slice(0, 200));
      return { parts: [] };
    }
  }
}
