import type { GenerativeModel } from '@google/generative-ai';
import type { SceneGraph, ScenePart, ScenePartMaterial, ScenePartDimensions, PrimitiveShape } from '../types/scene-graph.types.js';
import type { ProductUnderstanding, GeometryIntelligence, ScaleBounds } from '../types/product-understanding.types.js';
import { buildSceneGraphReconstructionPrompt } from '../prompts/scene-graph-reconstruction.prompt.js';
import type { QualityHint } from '../types/ai-request.types.js';
import type { SourceImage } from './gemini-product-understanding.js';

function fallbackSceneGraph(understanding: ProductUnderstanding): SceneGraph {
  const bb = understanding.estimatedBoundingBox;
  const mainPart: ScenePart = {
    id: 'main-body',
    label: 'main body',
    shape: 'box',
    dimensions: { width: bb.width, height: bb.height, depth: bb.depth },
    position: [0, bb.height / 2, 0],
    rotation: [0, 0, 0, 1],
    material: { baseColor: [0.7, 0.7, 0.7, 1], roughness: 0.5, metalness: 0 },
    smooth: false,
  };
  return {
    schemaVersion: '2.0',
    productCategory: understanding.detectedCategory,
    productSubtype:  understanding.detectedSubtype,
    geometryFamily:  understanding.geometryFamily,
    symmetryAxis:    understanding.symmetryAxis,
    boundingBox:     bb,
    parts:           [mainPart],
    confidence:      0.1,
    sourceViewsUsed: [],
    structuralWarnings: ['Fallback scene graph — Gemini response could not be parsed'],
  };
}

function parseMaterial(m: Record<string, unknown>): ScenePartMaterial {
  const bc = Array.isArray(m['baseColor']) ? (m['baseColor'] as number[]) : [0.7, 0.7, 0.7, 1];
  const mat: ScenePartMaterial = {
    baseColor: [bc[0] ?? 0.7, bc[1] ?? 0.7, bc[2] ?? 0.7, bc[3] ?? 1] as [number,number,number,number],
    roughness: typeof m['roughness'] === 'number' ? (m['roughness'] as number) : 0.5,
    metalness: typeof m['metalness'] === 'number' ? (m['metalness'] as number) : 0,
  };
  if (typeof m['transmissionFactor'] === 'number') mat.transmissionFactor = m['transmissionFactor'] as number;
  if (typeof m['ior']     === 'number') mat.ior = m['ior'] as number;
  if (typeof m['clearcoat'] === 'number') mat.clearcoat = m['clearcoat'] as number;
  if (Array.isArray(m['emissiveFactor'])) {
    const ef = m['emissiveFactor'] as number[];
    mat.emissiveFactor = [ef[0] ?? 0, ef[1] ?? 0, ef[2] ?? 0];
  }
  return mat;
}

function parseDimensions(d: Record<string, unknown>): ScenePartDimensions {
  return {
    width:        typeof d['width']        === 'number' ? (d['width']        as number) : 0.1,
    height:       typeof d['height']       === 'number' ? (d['height']       as number) : 0.1,
    depth:        typeof d['depth']        === 'number' ? (d['depth']        as number) : 0.1,
    topWidth:     typeof d['topWidth']     === 'number' ? (d['topWidth']     as number) : undefined,
    topHeight:    typeof d['topHeight']    === 'number' ? (d['topHeight']    as number) : undefined,
    topDepth:     typeof d['topDepth']     === 'number' ? (d['topDepth']     as number) : undefined,
    radiusTop:    typeof d['radiusTop']    === 'number' ? (d['radiusTop']    as number) : undefined,
    radiusBottom: typeof d['radiusBottom'] === 'number' ? (d['radiusBottom'] as number) : undefined,
    tubeRadius:   typeof d['tubeRadius']   === 'number' ? (d['tubeRadius']   as number) : undefined,
    majorRadius:  typeof d['majorRadius']  === 'number' ? (d['majorRadius']  as number) : undefined,
    rx:           typeof d['rx']           === 'number' ? (d['rx']           as number) : undefined,
    ry:           typeof d['ry']           === 'number' ? (d['ry']           as number) : undefined,
  };
}

function parsePart(p: Record<string, unknown>): ScenePart {
  const pos = Array.isArray(p['position']) ? (p['position'] as number[]) : [0, 0, 0];
  const rot = Array.isArray(p['rotation']) ? (p['rotation'] as number[]) : [0, 0, 0, 1];

  return {
    id:     (p['id']    as string) || 'part',
    label:  (p['label'] as string) || 'part',
    shape:  (p['shape'] as PrimitiveShape) || 'box',
    dimensions: parseDimensions((p['dimensions'] as Record<string, unknown>) ?? {}),
    position: [pos[0] ?? 0, pos[1] ?? 0, pos[2] ?? 0],
    rotation: [rot[0] ?? 0, rot[1] ?? 0, rot[2] ?? 0, rot[3] ?? 1],
    material: parseMaterial((p['material'] as Record<string, unknown>) ?? {}),
    smooth:   p['smooth'] === true,
    segments: typeof p['segments'] === 'number' ? (p['segments'] as number) : undefined,
    symmetryMirror: (p['symmetryMirror'] as 'x' | 'z' | null) ?? undefined,
  };
}

export class GeminiSceneGraphReconstructor {
  constructor(private readonly model: GenerativeModel) {}

  async reconstruct(
    images: SourceImage[],
    understanding: ProductUnderstanding,
    geometryIntelligence: GeometryIntelligence,
    scaleBounds: ScaleBounds,
    quality: QualityHint,
  ): Promise<SceneGraph> {
    const prompt = buildSceneGraphReconstructionPrompt(understanding, geometryIntelligence, scaleBounds, quality);

    const contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: prompt },
      ...images.slice(0, 5).map(img => ({ inlineData: { mimeType: img.mimeType, data: img.base64 } })),
    ];

    try {
      const result = await this.model.generateContent(contentParts);
      const raw = result.response.text().trim();
      return this.parse(raw, understanding);
    } catch (err) {
      console.error('[GeminiSceneGraphReconstructor] Gemini call failed:', err);
      return fallbackSceneGraph(understanding);
    }
  }

  private parse(raw: string, understanding: ProductUnderstanding): SceneGraph {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    try {
      const p = JSON.parse(cleaned) as Record<string, unknown>;
      const rawParts = Array.isArray(p['parts']) ? (p['parts'] as Record<string, unknown>[]) : [];
      const bb = (p['boundingBox'] as Record<string, number>) ?? {};

      return {
        schemaVersion: '2.0',
        productCategory: (p['productCategory'] as string) || understanding.detectedCategory,
        productSubtype:  (p['productSubtype']  as string) || understanding.detectedSubtype,
        geometryFamily:  (p['geometryFamily']  as SceneGraph['geometryFamily']) || understanding.geometryFamily,
        symmetryAxis:    (p['symmetryAxis']    as SceneGraph['symmetryAxis'])    || understanding.symmetryAxis,
        boundingBox: {
          width:  typeof bb['width']  === 'number' ? bb['width']  : understanding.estimatedBoundingBox.width,
          height: typeof bb['height'] === 'number' ? bb['height'] : understanding.estimatedBoundingBox.height,
          depth:  typeof bb['depth']  === 'number' ? bb['depth']  : understanding.estimatedBoundingBox.depth,
        },
        parts: rawParts.map(parsePart),
        confidence: typeof p['confidence'] === 'number' ? (p['confidence'] as number) : 0.5,
        sourceViewsUsed: Array.isArray(p['sourceViewsUsed']) ? (p['sourceViewsUsed'] as string[]) : [],
        structuralWarnings: Array.isArray(p['structuralWarnings']) ? (p['structuralWarnings'] as string[]) : [],
      };
    } catch {
      console.error('[GeminiSceneGraphReconstructor] JSON parse failed. Raw:', raw.slice(0, 300));
      return fallbackSceneGraph(understanding);
    }
  }
}
