import { IModelGeneratorPort, GenerateModelInput, GenerateModelOutput, MediaAsset } from '@minimalblock/core';
import type { GenerativeModel } from '@google/generative-ai';
import type { QualityHint } from '../types/ai-request.types.js';
import type { SceneGraph } from '../types/scene-graph.types.js';
import type { SourceImage } from './gemini-product-understanding.js';

function toLegacyShape(shape: string): 'box' | 'cylinder' | 'sphere' {
  if (shape === 'cylinder') return 'cylinder';
  if (shape === 'sphere')   return 'sphere';
  return 'box';
}

// v1 legacy imports (kept for fallback)
import { buildConvert2DTo3DPrompt, DETECTED_PRODUCT_TYPES, type DetectedProductType } from '../prompts/convert-2d-to-3d.prompt.js';
import { buildGlbFromShape, buildCompoundGlb, buildProductTypeParts, sceneGraphToPartDefs, type ShapeParams } from './glb-builder.js';

// v2 pipeline imports
import { GeminiProductUnderstandingAnalyzer } from './gemini-product-understanding.js';
import { GeminiGeometryClassifier }            from './gemini-geometry-classifier.js';
import { GeminiSceneGraphReconstructor }       from './gemini-scene-graph-reconstructor.js';
import { GeminiPbrMaterialAnalyzer }           from './gemini-pbr-material-analyzer.js';
import { CategoryGeneratorFactory }            from '../generators/category-generator.factory.js';
import { SceneGraphValidator, autoRepairSceneGraph } from '../validation/scene-graph-validator.js';
import { GlbValidator }                        from '../validation/glb-validator.js';
import { getStaticScaleBounds }                from '../prompts/scale-estimation.prompt.js';

export type { ShapeParams };

// ─── Legacy v1 helpers ────────────────────────────────────────────────────────

interface ParsedShapeResponse extends ShapeParams {
  detectedType: DetectedProductType;
}

function parseShapeParams(raw: string): ParsedShapeResponse {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const preview = raw.slice(0, 120).replace(/\n/g, '\\n');
    throw new Error(`Gemini did not return valid shape parameter JSON. Response preview: "${preview}"`);
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Gemini returned non-object shape parameters');
  }

  const p = parsed as Record<string, unknown>;
  const rawShape = p['shape'] as string;
  if (rawShape !== 'box' && rawShape !== 'cylinder' && rawShape !== 'sphere') {
    throw new Error(`Gemini returned invalid shape: "${rawShape}"`);
  }

  const rawType = p['detectedType'] as string;
  const detectedType: DetectedProductType =
    DETECTED_PRODUCT_TYPES.includes(rawType as DetectedProductType) ? (rawType as DetectedProductType) : 'other';

  return {
    detectedType,
    shape: rawShape,
    width:     typeof p['width']    === 'number' ? (p['width']    as number) : 0.3,
    height:    typeof p['height']   === 'number' ? (p['height']   as number) : 0.3,
    depth:     typeof p['depth']    === 'number' ? (p['depth']    as number) : 0.3,
    baseColor: (Array.isArray(p['baseColor']) && p['baseColor'].length >= 4
      ? (p['baseColor'] as number[]).slice(0, 4) as [number, number, number, number]
      : [0.8, 0.8, 0.8, 1.0]),
    roughness: typeof p['roughness'] === 'number' ? (p['roughness'] as number) : 0.5,
    metalness: typeof p['metalness'] === 'number' ? (p['metalness'] as number) : 0.0,
  };
}

// ─── Image fetching ───────────────────────────────────────────────────────────

async function fetchImageAsSource(asset: MediaAsset): Promise<SourceImage | null> {
  try {
    // Handle data: URLs (already base64)
    if (asset.url.startsWith('data:')) {
      const [header, data] = asset.url.split(',');
      const mimeType = header.split(':')[1].split(';')[0];
      return { base64: data, mimeType };
    }
    const resp = await fetch(asset.url);
    if (!resp.ok) return null;
    const buffer = await resp.arrayBuffer();
    const bytes  = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return { base64: btoa(binary), mimeType: (asset.mimeType as string) || 'image/jpeg' };
  } catch {
    return null;
  }
}

async function fetchAllImages(assets: MediaAsset[]): Promise<SourceImage[]> {
  const results = await Promise.all(assets.map(fetchImageAsSource));
  return results.filter((r): r is SourceImage => r !== null);
}

function applyPbrMaterials(graph: SceneGraph, pbrEntries: Array<{ partId: string; baseColor: [number,number,number,number]; roughness: number; metalness: number; transmissionFactor?: number; emissiveFactor?: [number,number,number] }>): SceneGraph {
  const entryMap = new Map(pbrEntries.map(e => [e.partId, e]));
  const parts = graph.parts.map(part => {
    const entry = entryMap.get(part.id);
    if (!entry) return part;
    return {
      ...part,
      material: {
        ...part.material,
        baseColor:         entry.baseColor,
        roughness:         entry.roughness,
        metalness:         entry.metalness,
        transmissionFactor: entry.transmissionFactor ?? part.material.transmissionFactor,
        emissiveFactor:    entry.emissiveFactor     ?? part.material.emissiveFactor,
      },
    };
  });
  return { ...graph, parts };
}

// ─── Main generator ───────────────────────────────────────────────────────────

export class GeminiModelGenerator implements IModelGeneratorPort {
  constructor(
    private readonly flashModel: GenerativeModel,
    private readonly proModel?: GenerativeModel,
  ) {}

  async generate(input: GenerateModelInput): Promise<GenerateModelOutput> {
    const quality = (input.qualityHint ?? 'balanced') as QualityHint;

    // Prefer v2 pipeline; fall back to v1 on failure
    try {
      return await this.generateV2(input, quality);
    } catch (err) {
      console.error('[GeminiModelGenerator] v2 pipeline failed, falling back to v1:', err);
      return this.generateV1(input, quality);
    }
  }

  // ─── v2: 9-phase pipeline ─────────────────────────────────────────────────

  private async generateV2(input: GenerateModelInput, quality: QualityHint): Promise<GenerateModelOutput> {
    const allAssets  = input.sourceAssets?.length ? input.sourceAssets : [input.sourceAsset];
    const allImages  = await fetchAllImages(allAssets);
    if (allImages.length === 0) throw new Error('No images could be fetched for v2 pipeline');

    const model = (quality !== 'fast' && this.proModel) ? this.proModel : this.flashModel;
    let tokensUsed = 0;

    // Phase A: Deep product understanding
    const understandingAnalyzer = new GeminiProductUnderstandingAnalyzer(model);
    const understanding = await understandingAnalyzer.analyze(allImages, {
      productCategory:   input.productCategory,
      productTitle:      input.productTitle,
      productDimensions: input.productDimensions,
      inferredMaterial:  input.inferredMaterialFinish,
    }, quality);

    // Phase B: Geometry classification (Flash only — text call)
    const geometryClassifier   = new GeminiGeometryClassifier(this.flashModel);
    const geometryIntelligence = await geometryClassifier.classify(understanding);

    // Phase G: Scale estimation (static lookup, no Gemini call)
    const scaleBounds = getStaticScaleBounds(understanding.detectedSubtype, input.productDimensions);

    // Phase C: Multi-view scene graph reconstruction
    const reconstructor = new GeminiSceneGraphReconstructor(model);
    let sceneGraph = await reconstructor.reconstruct(allImages, understanding, geometryIntelligence, scaleBounds, quality);

    // Phase E: Category-specific correction
    const categoryGenerator = CategoryGeneratorFactory.for(understanding.detectedSubtype, understanding.geometryFamily);
    sceneGraph = categoryGenerator.generateSceneGraph(understanding, geometryIntelligence, sceneGraph);

    // Phase F: Per-part PBR materials (skip in fast mode)
    if (quality !== 'fast') {
      const pbrAnalyzer = new GeminiPbrMaterialAnalyzer(this.flashModel);
      const pbrMap = await pbrAnalyzer.analyze(allImages, sceneGraph.parts);
      if (pbrMap.parts.length > 0) {
        sceneGraph = applyPbrMaterials(sceneGraph, pbrMap.parts);
      }
    }

    // Phase H: Pre-encode validation + auto-repair
    const sceneValidator = new SceneGraphValidator();
    const preValidation  = sceneValidator.validate(sceneGraph);
    if (!preValidation.passed) {
      sceneGraph = autoRepairSceneGraph(sceneGraph, preValidation);
    }

    // Phase D: Topology-aware encoding
    const partDefs = sceneGraphToPartDefs(sceneGraph);
    const glb = buildCompoundGlb(partDefs);

    // Phase H: Post-encode GLB validation
    const glbValidator  = new GlbValidator();
    const glbValidation = glbValidator.validate(glb);

    // Upload GLB as data URL
    let glbBinary = '';
    for (let i = 0; i < glb.byteLength; i++) glbBinary += String.fromCharCode(glb[i]);

    const outputAsset = new MediaAsset({
      url:        `data:model/gltf-binary;base64,${btoa(glbBinary)}`,
      storageKey: '',
      mimeType:   'model/gltf-binary',
      kind:       'generated-model',
      sizeBytes:  glb.byteLength,
    });

    return {
      outputAsset,
      tokensUsed,
      generatedPrimitive: {
        shape:       'compound',
        detectedType: sceneGraph.productSubtype,
        widthM:      sceneGraph.boundingBox.width,
        heightM:     sceneGraph.boundingBox.height,
        depthM:      sceneGraph.boundingBox.depth,
        baseColor:   sceneGraph.parts[0]?.material.baseColor ?? [0.7, 0.7, 0.7, 1],
        roughness:   sceneGraph.parts[0]?.material.roughness ?? 0.5,
        metalness:   sceneGraph.parts[0]?.material.metalness ?? 0,
        parts:       partDefs.map(pd => ({
          shape:       toLegacyShape(pd.shape),
          widthM:      pd.width,
          heightM:     pd.height,
          depthM:      pd.depth,
          baseColor:   pd.baseColor,
          roughness:   pd.roughness,
          metalness:   pd.metalness,
          description: pd.description,
        })),
      },
      sceneGraph:      sceneGraph as unknown as Record<string, unknown>,
      validationReport: glbValidation as unknown as Record<string, unknown>,
    };
  }

  // ─── v1 legacy fallback ───────────────────────────────────────────────────

  /** @deprecated Use v2 pipeline. Kept as fallback. */
  private async generateV1(input: GenerateModelInput, quality: QualityHint): Promise<GenerateModelOutput> {
    const prompt = buildConvert2DTo3DPrompt(input.productCategory, quality);

    const imageResp   = await fetch(input.sourceAsset.url);
    const imageBuffer = await imageResp.arrayBuffer();
    const imageBytes  = new Uint8Array(imageBuffer);
    let binary = '';
    for (let i = 0; i < imageBytes.byteLength; i++) binary += String.fromCharCode(imageBytes[i]);
    const imageBase64 = btoa(binary);

    const result = await this.flashModel.generateContent([
      { text: prompt },
      { inlineData: { mimeType: input.sourceAsset.mimeType as string, data: imageBase64 } },
    ]);

    const tokensUsed = result.response.usageMetadata?.totalTokenCount ?? 0;
    const raw = result.response.text().trim();
    const parsed = parseShapeParams(raw);
    const { detectedType, ...shapeParams } = parsed;

    const parts = buildProductTypeParts(detectedType, shapeParams);
    const isCompound = parts.length > 1;
    const glb = isCompound ? buildCompoundGlb(parts) : buildGlbFromShape(shapeParams);

    let glbBinary = '';
    for (let i = 0; i < glb.byteLength; i++) glbBinary += String.fromCharCode(glb[i]);

    const outputAsset = new MediaAsset({
      url:        `data:model/gltf-binary;base64,${btoa(glbBinary)}`,
      storageKey: '',
      mimeType:   'model/gltf-binary',
      kind:       'generated-model',
      sizeBytes:  glb.byteLength,
    });

    const generatedPrimitive = isCompound
      ? {
          shape: 'compound' as const,
          detectedType,
          widthM:    shapeParams.width,
          heightM:   shapeParams.height,
          depthM:    shapeParams.depth,
          baseColor: shapeParams.baseColor,
          roughness: shapeParams.roughness,
          metalness: shapeParams.metalness,
          parts: parts.map(part => ({
            shape:       toLegacyShape(part.shape),
            widthM:      part.width,
            heightM:     part.height,
            depthM:      part.depth,
            baseColor:   part.baseColor,
            roughness:   part.roughness,
            metalness:   part.metalness,
            description: part.description,
          })),
        }
      : {
          shape:     shapeParams.shape,
          detectedType,
          widthM:    shapeParams.width,
          heightM:   shapeParams.height,
          depthM:    shapeParams.depth,
          baseColor: shapeParams.baseColor,
          roughness: shapeParams.roughness,
          metalness: shapeParams.metalness,
        };

    return { outputAsset, tokensUsed, generatedPrimitive };
  }
}
