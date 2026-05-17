import { Buffer } from 'node:buffer';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { URL } from 'node:url';
import {
  Conversion,
  Product,
  GenerationJob,
  MediaAsset,
  QualityReport,
  generateId,
  migrateLegacyProductCategory,
  type AnalyzeProductRequest,
  type AnalyzeProductResponse,
  type ApiMediaAssetInput,
  type ConversionResponse,
  type ConversionSnapshot,
  type CreateConversionRequest,
  type CreateConversionResponse,
  type GenerateDescriptionRequest,
  type GenerateDescriptionResponse,
  type GenerateHotspotsRequest,
  type GenerateHotspotsResponse,
  type GeminiQaResult,
  type ProductAiAnalysis,
  type ProductAiCopy,
  type QualityCheckRequest,
  type QualityCheckResponse,
  type RejectConversionRequest,
  type ReturnRiskRequest,
  type ReturnRiskResponse,
  type SuggestedHotspot,
  type SuggestedHotspotType,
} from '@minimalblock/core';
import {
  SupabaseConversionRepository,
  SupabaseEventsRepository,
  SupabaseGenerationJobRepository,
  SupabaseProductRepository,
} from '@minimalblock/data';
import { createGenerativeModel, ANALYSIS_MODEL_ID, GeminiModelGenerator, GeminiVisualQa } from '@minimalblock/ai';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { Database } from '@minimalblock/data';

export interface ApiEnv {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  geminiApiKey: string;
  port: number;
  corsOrigin: string;
}

interface RequestContext {
  env: ApiEnv;
  admin: SupabaseClient<Database>;
  user: User;
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

function getEnv(): ApiEnv {
  const supabaseUrl = process.env['SUPABASE_URL'];
  const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  const geminiApiKey = process.env['GEMINI_API_KEY'];

  if (!supabaseUrl || !supabaseServiceRoleKey || !geminiApiKey) {
    throw new Error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY');
  }

  return {
    supabaseUrl,
    supabaseServiceRoleKey,
    geminiApiKey,
    port: Number(process.env['API_PORT'] ?? 8787),
    corsOrigin: process.env['CORS_ORIGIN'] ?? '*',
  };
}

function createAdminClient(env: ApiEnv): SupabaseClient<Database> {
  return createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(raw) as T;
}

function sendJson(res: ServerResponse, status: number, body: unknown, origin: string): void {
  res.writeHead(status, {
    ...JSON_HEADERS,
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'authorization,content-type',
  });
  res.end(JSON.stringify(body));
}

function sendNoContent(res: ServerResponse, origin: string): void {
  res.writeHead(204, {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'authorization,content-type',
  });
  res.end();
}

async function authenticate(req: IncomingMessage, env: ApiEnv): Promise<RequestContext> {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const admin = createAdminClient(env);
  const token = authorization.slice('Bearer '.length);
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) {
    throw new Error('Unauthorized');
  }

  return { env, admin, user: data.user };
}

function toMediaAsset(input: ApiMediaAssetInput, kind: 'source-image' | 'generated-model'): MediaAsset {
  return new MediaAsset({
    url: input.url,
    storageKey: input.storageKey,
    mimeType: input.mimeType,
    kind,
    sizeBytes: input.sizeBytes,
  });
}

function toSuggestedHotspotType(value: string): SuggestedHotspotType {
  switch (value) {
    case 'material':
    case 'dimension':
    case 'feature':
    case 'warning':
    case 'assembly':
      return value;
    default:
      return 'feature';
  }
}

function parseJsonText<T>(raw: string): T {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return JSON.parse(cleaned) as T;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48) || 'product';
}

function updateJob(
  job: GenerationJob,
  patch: Partial<ConstructorParameters<typeof GenerationJob>[0]>,
): GenerationJob {
  return new GenerationJob({
    id: job.id,
    conversionId: job.conversionId,
    ownerId: job.ownerId,
    provider: job.provider,
    providerJobId: job.providerJobId,
    status: job.status,
    attempt: job.attempt,
    costCredits: job.costCredits,
    errorMessage: job.errorMessage,
    requestPayload: job.requestPayload,
    responsePayload: job.responsePayload,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    createdAt: job.createdAt,
    updatedAt: new Date(),
    ...patch,
  });
}

async function fetchAssetBase64(asset: MediaAsset): Promise<{ mimeType: string; data: string }> {
  const response = await fetch(asset.url);
  if (!response.ok) {
    throw new Error(`Failed to fetch asset: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return {
    mimeType: asset.mimeType,
    data: Buffer.from(arrayBuffer).toString('base64'),
  };
}

async function uploadGeneratedModel(
  admin: SupabaseClient<Database>,
  ownerId: string,
  modelAsset: MediaAsset,
  productName: string,
): Promise<MediaAsset> {
  const dataUrl = modelAsset.url;
  const encoded = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  const bytes = Buffer.from(encoded, 'base64');
  const key = `${ownerId}/generated/${Date.now()}-${slugify(productName)}.glb`;
  const { error } = await admin.storage.from('media-assets').upload(key, bytes, {
    contentType: 'model/gltf-binary',
    upsert: false,
  });
  if (error) {
    throw new Error(`Failed to upload generated model: ${error.message}`);
  }
  const { data } = admin.storage.from('media-assets').getPublicUrl(key);
  return new MediaAsset({
    url: data.publicUrl,
    storageKey: key,
    mimeType: 'model/gltf-binary',
    kind: 'generated-model',
    sizeBytes: bytes.byteLength,
  });
}

function createQualityReport(
  asset: MediaAsset,
  sourceImageCount: number,
  qaResult?: GeminiQaResult,
  isPrimitiveMesh?: boolean,
): QualityReport {
  const warnings: string[] = [];
  if (sourceImageCount < 3) {
    warnings.push('Upload at least 3 source images to improve geometry accuracy.');
  }
  if (asset.sizeBytes > 15 * 1024 * 1024) {
    warnings.push('Model is above the 15 MB storefront comfort zone.');
  } else if (asset.sizeBytes > 4 * 1024 * 1024) {
    warnings.push('Model is above the ideal 4 MB target for fast PDP loading.');
  }

  return new QualityReport({
    fileSizeBytes: asset.sizeBytes,
    triangleCount: Math.max(25_000, Math.round(asset.sizeBytes / 64)),
    textureMaxDim: asset.sizeBytes > 4 * 1024 * 1024 ? 4096 : 2048,
    hasUSDZ: false,
    arCompat: asset.mimeType === 'model/gltf-binary',
    warnings,
    geminiQaScore: qaResult?.qualityScore,
    geminiQaReport: qaResult,
    isPrimitiveMesh: isPrimitiveMesh ?? false,
  });
}

function toConversionSnapshot(conversion: Conversion): ConversionSnapshot {
  return {
    id: conversion.id,
    productId: conversion.productId,
    ownerId: conversion.ownerId,
    status: conversion.status.value,
    sourceAssets: conversion.sourceAssets.map((asset) => ({
      url: asset.url,
      storageKey: asset.storageKey,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
    })),
    outputAsset: conversion.outputAsset
      ? {
          url: conversion.outputAsset.url,
          storageKey: conversion.outputAsset.storageKey,
          mimeType: conversion.outputAsset.mimeType,
          sizeBytes: conversion.outputAsset.sizeBytes,
        }
      : undefined,
    errorMessage: conversion.errorMessage,
    provider: conversion.provider,
    qualityReport: conversion.qualityReport?.toJSON(),
    approvedAt: conversion.approvedAt?.toISOString(),
    rejectionReason: conversion.rejectionReason,
    createdAt: conversion.createdAt.toISOString(),
    updatedAt: conversion.updatedAt.toISOString(),
  };
}

async function getOwnedProduct(ctx: RequestContext, productId: string): Promise<Product> {
  const productRepo = new SupabaseProductRepository(ctx.admin);
  const product = await productRepo.findById(productId);
  if (!product || !product.isOwnedBy(ctx.user.id)) {
    throw new Error('Not found');
  }
  return product;
}

async function getOwnedConversion(ctx: RequestContext, conversionId: string): Promise<Conversion> {
  const conversionRepo = new SupabaseConversionRepository(ctx.admin);
  const conversion = await conversionRepo.findById(conversionId);
  if (!conversion || !conversion.isAccessibleBy(ctx.user.id)) {
    throw new Error('Not found');
  }
  return conversion;
}

async function getLatestConversionForProduct(ctx: RequestContext, productId: string): Promise<Conversion | null> {
  const conversionRepo = new SupabaseConversionRepository(ctx.admin);
  const conversions = await conversionRepo.findByProductId(productId);
  return [...conversions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null;
}

function mergeAnalysis(product: Product, patch: Partial<ProductAiAnalysis>): ProductAiAnalysis {
  return {
    materials: [],
    confidenceScore: 0,
    missingVisuals: [],
    suggestedCopy: null,
    returnRiskFactors: [],
    qualityRecommendations: [],
    merchantRecommendations: [],
    ...(product.aiAnalysis ?? {}),
    ...patch,
    lastUpdatedAt: new Date().toISOString(),
  };
}

async function analyzeProductWithGemini(ctx: RequestContext, product: Product, sourceAsset?: MediaAsset): Promise<ProductAiAnalysis> {
  const model = createGenerativeModel(ctx.env.geminiApiKey, ANALYSIS_MODEL_ID);
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    {
      text:
        `Analyze this commerce product for a seller dashboard and respond with JSON only.\n` +
        `Schema:\n` +
        `{\n` +
        `  "categorySuggestion": "furniture | home-decor | bags | accessories | other",\n` +
        `  "materials": ["string"],\n` +
        `  "confidenceScore": 0.0,\n` +
        `  "missingVisuals": ["string"],\n` +
        `  "returnRiskFactors": [{"risk":"string","fix":"string"}],\n` +
        `  "qualityRecommendations": ["string"],\n` +
        `  "merchantRecommendations": ["string"],\n` +
        `  "readinessScore": 0\n` +
        `}\n` +
        `Product name: ${product.name}\nCategory: ${product.category}\nDescription: ${product.description || 'n/a'}`,
    },
  ];

  if (sourceAsset) {
    parts.push({ inlineData: await fetchAssetBase64(sourceAsset) });
  }

  const result = await model.generateContent(parts);
  const parsed = parseJsonText<{
    categorySuggestion?: string;
    materials?: string[];
    confidenceScore?: number;
    missingVisuals?: string[];
    returnRiskFactors?: Array<{ risk: string; fix: string }>;
    qualityRecommendations?: string[];
    merchantRecommendations?: string[];
    readinessScore?: number;
  }>(result.response.text());

  return {
    categorySuggestion: parsed.categorySuggestion
      ? migrateLegacyProductCategory(parsed.categorySuggestion)
      : undefined,
    materials: parsed.materials ?? [],
    confidenceScore: parsed.confidenceScore ?? 0,
    missingVisuals: parsed.missingVisuals ?? [],
    suggestedCopy: product.aiAnalysis?.suggestedCopy ?? null,
    returnRiskFactors: parsed.returnRiskFactors ?? [],
    qualityRecommendations: parsed.qualityRecommendations ?? [],
    merchantRecommendations: parsed.merchantRecommendations ?? [],
    readinessScore: parsed.readinessScore,
    lastUpdatedAt: new Date().toISOString(),
  };
}

async function generateSuggestedHotspots(ctx: RequestContext, product: Product, sourceAsset?: MediaAsset): Promise<SuggestedHotspot[]> {
  const model = createGenerativeModel(ctx.env.geminiApiKey, ANALYSIS_MODEL_ID);
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    {
      text:
        `Suggest 3 to 5 commerce hotspots for this product and respond with JSON only.\n` +
        `Schema: [{"title":"string","description":"string","type":"material|dimension|feature|warning|assembly"}]\n` +
        `Product: ${product.name}\nCategory: ${product.category}\nDescription: ${product.description || 'n/a'}`,
    },
  ];
  if (sourceAsset) {
    parts.push({ inlineData: await fetchAssetBase64(sourceAsset) });
  }
  const result = await model.generateContent(parts);
  const parsed = parseJsonText<Array<{ title: string; description: string; type: string }>>(result.response.text());
  return parsed.slice(0, 5).map((item) => ({
    id: generateId(),
    title: item.title,
    description: item.description,
    type: toSuggestedHotspotType(item.type),
    status: 'pending',
  }));
}

async function generateSuggestedCopy(ctx: RequestContext, product: Product): Promise<ProductAiCopy | null> {
  const model = createGenerativeModel(ctx.env.geminiApiKey, ANALYSIS_MODEL_ID);
  const result = await model.generateContent(
    `Write ecommerce copy for this product and respond with JSON only.\n` +
      `Schema: {"seoTitle":"string","bullets":["string"],"description":"string"}\n` +
      `Product: ${product.name}\nCategory: ${product.category}\nDescription: ${product.description || 'n/a'}`,
  );
  return parseJsonText<ProductAiCopy>(result.response.text());
}

async function generateReturnRisk(ctx: RequestContext, product: Product): Promise<Array<{ risk: string; fix: string }>> {
  const model = createGenerativeModel(ctx.env.geminiApiKey, ANALYSIS_MODEL_ID);
  const result = await model.generateContent(
    `Analyze return-risk for this ecommerce product and respond with JSON only.\n` +
      `Schema: [{"risk":"string","fix":"string"}]\n` +
      `Product: ${product.name}\nCategory: ${product.category}\nDescription: ${product.description || 'n/a'}`,
  );
  return parseJsonText<Array<{ risk: string; fix: string }>>(result.response.text());
}

async function handleCreateConversion(ctx: RequestContext, req: CreateConversionRequest): Promise<CreateConversionResponse> {
  if (!req.product?.name || !req.sourceAssets?.length) {
    throw new Error('Invalid request');
  }

  const productRepo = new SupabaseProductRepository(ctx.admin);
  const conversionRepo = new SupabaseConversionRepository(ctx.admin);
  const jobRepo = new SupabaseGenerationJobRepository(ctx.admin);

  const now = new Date();
  const product = await productRepo.save(
    new Product({
      id: generateId(),
      name: req.product.name,
      description: req.product.description ?? '',
      category: migrateLegacyProductCategory(req.product.category),
      ownerId: ctx.user.id,
      hotspots: [],
      hotspotsSuggested: [],
      aiAnalysis: null,
      createdAt: now,
      updatedAt: now,
    }),
  );

  const sourceAssets = req.sourceAssets.map((asset) => toMediaAsset(asset, 'source-image'));
  let conversion = Conversion.create(generateId(), product.id, ctx.user.id, sourceAssets[0], sourceAssets);
  conversion = await conversionRepo.save(conversion);
  conversion = await conversionRepo.save(conversion.markProcessing(req.manualModelAsset ? 'mock' : 'gemini'));

  let job = new GenerationJob({
    id: generateId(),
    conversionId: conversion.id,
    ownerId: ctx.user.id,
    provider: req.manualModelAsset ? 'mock' : 'gemini',
    status: 'running',
    attempt: 1,
    requestPayload: req,
    startedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  job = await jobRepo.save(job);

  try {
    let outputAsset: MediaAsset;
    if (req.manualModelAsset) {
      outputAsset = toMediaAsset(req.manualModelAsset, 'generated-model');
      job = await jobRepo.save(
        updateJob(job, {
          status: 'succeeded',
          responsePayload: { outputStorageKey: outputAsset.storageKey, source: 'manual-upload' },
          finishedAt: new Date(),
        }),
      );
    } else {
      const generator = new GeminiModelGenerator(createGenerativeModel(ctx.env.geminiApiKey));
      const generated = await generator.generate({
        sourceAsset: sourceAssets[0],
        productCategory: product.category,
        qualityHint: req.qualityHint,
      });
      outputAsset = await uploadGeneratedModel(ctx.admin, ctx.user.id, generated.outputAsset, product.name);
      job = await jobRepo.save(
        updateJob(job, {
          status: 'succeeded',
          costCredits: Math.ceil(generated.tokensUsed / 1000),
          responsePayload: { tokensUsed: generated.tokensUsed, outputStorageKey: outputAsset.storageKey },
          finishedAt: new Date(),
        }),
      );

      if (generated.generatedPrimitive) {
        const sourceImageUrls = sourceAssets.map((a) => a.url);
        const visualQa = new GeminiVisualQa(createGenerativeModel(ctx.env.geminiApiKey, ANALYSIS_MODEL_ID));
        let qaResult: GeminiQaResult | undefined;
        try {
          qaResult = await visualQa.evaluate({
            sourceImageUrls,
            productCategory: product.category,
            generatedPrimitive: generated.generatedPrimitive,
          });
        } catch {
          // Visual QA failure is non-fatal — proceed without it
        }
        const quality = createQualityReport(outputAsset, sourceAssets.length, qaResult, true);
        if (quality.score() < 40) {
          const reason =
            `Visual QA score ${quality.score()}/100 — primitive mesh does not represent the product adequately. ` +
            (qaResult?.recommendedActions.join(' ') ?? 'Upload a manual GLB or regenerate with better source images.');
          conversion = await conversionRepo.save(conversion.markFailed(reason));
        } else {
          conversion = await conversionRepo.save(conversion.markAwaitingApproval(outputAsset, quality));
        }
        return {
          productId: product.id,
          conversionId: conversion.id,
          jobId: job.id,
          status: conversion.status.value,
        };
      }
    }

    const quality = createQualityReport(outputAsset, sourceAssets.length);
    conversion = await conversionRepo.save(conversion.markAwaitingApproval(outputAsset, quality));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Conversion failed';
    conversion = await conversionRepo.save(conversion.markFailed(message));
    job = await jobRepo.save(
      updateJob(job, {
        status: 'failed',
        errorMessage: message,
        finishedAt: new Date(),
      }),
    );
  }

  return {
    productId: product.id,
    conversionId: conversion.id,
    jobId: job.id,
    status: conversion.status.value,
  };
}

async function handleGetConversion(ctx: RequestContext, conversionId: string): Promise<ConversionResponse> {
  const conversion = await getOwnedConversion(ctx, conversionId);
  return { conversion: toConversionSnapshot(conversion) };
}

async function handleApproveConversion(ctx: RequestContext, conversionId: string): Promise<ConversionResponse> {
  const conversionRepo = new SupabaseConversionRepository(ctx.admin);
  const eventsRepo = new SupabaseEventsRepository(ctx.admin);
  const conversion = await getOwnedConversion(ctx, conversionId);
  const approved = await conversionRepo.save(conversion.approve(ctx.user.id));
  await eventsRepo.track(approved.productId, ctx.user.id, 'conversion_approved');
  await eventsRepo.track(approved.productId, ctx.user.id, 'product_published');
  return { conversion: toConversionSnapshot(approved) };
}

async function handleRejectConversion(
  ctx: RequestContext,
  conversionId: string,
  req: RejectConversionRequest,
): Promise<ConversionResponse> {
  const conversionRepo = new SupabaseConversionRepository(ctx.admin);
  const eventsRepo = new SupabaseEventsRepository(ctx.admin);
  const conversion = await getOwnedConversion(ctx, conversionId);
  const rejected = await conversionRepo.save(conversion.reject(req.reason));
  await eventsRepo.track(rejected.productId, ctx.user.id, 'conversion_rejected', { reason: req.reason });
  return { conversion: toConversionSnapshot(rejected) };
}

async function handleAnalyzeProduct(ctx: RequestContext, req: AnalyzeProductRequest): Promise<AnalyzeProductResponse> {
  const productRepo = new SupabaseProductRepository(ctx.admin);
  const eventsRepo = new SupabaseEventsRepository(ctx.admin);
  const product = await getOwnedProduct(ctx, req.productId);
  const conversion = await getLatestConversionForProduct(ctx, product.id);
  await eventsRepo.track(product.id, ctx.user.id, 'ai_analysis_started');
  const analysis = await analyzeProductWithGemini(ctx, product, conversion?.sourceAssets[0]);
  const saved = await productRepo.save(product.withAiAnalysis(analysis));
  await eventsRepo.track(product.id, ctx.user.id, 'ai_analysis_completed');
  return { analysis: saved.aiAnalysis ?? analysis };
}

async function handleGenerateHotspots(
  ctx: RequestContext,
  req: GenerateHotspotsRequest,
): Promise<GenerateHotspotsResponse> {
  const productRepo = new SupabaseProductRepository(ctx.admin);
  const product = await getOwnedProduct(ctx, req.productId);
  const conversion = await getLatestConversionForProduct(ctx, product.id);
  const hotspots = await generateSuggestedHotspots(ctx, product, conversion?.sourceAssets[0]);
  const saved = await productRepo.save(product.withSuggestedHotspots(hotspots));
  return { hotspots: saved.hotspotsSuggested };
}

async function handleGenerateDescription(
  ctx: RequestContext,
  req: GenerateDescriptionRequest,
): Promise<GenerateDescriptionResponse> {
  const productRepo = new SupabaseProductRepository(ctx.admin);
  const product = await getOwnedProduct(ctx, req.productId);
  const suggestedCopy = await generateSuggestedCopy(ctx, product);
  const saved = await productRepo.save(product.withAiAnalysis(mergeAnalysis(product, { suggestedCopy })));
  return { suggestedCopy: saved.aiAnalysis?.suggestedCopy ?? suggestedCopy };
}

async function handleReturnRisk(ctx: RequestContext, req: ReturnRiskRequest): Promise<ReturnRiskResponse> {
  const productRepo = new SupabaseProductRepository(ctx.admin);
  const product = await getOwnedProduct(ctx, req.productId);
  const returnRiskFactors = await generateReturnRisk(ctx, product);
  await productRepo.save(product.withAiAnalysis(mergeAnalysis(product, { returnRiskFactors })));
  return { returnRiskFactors };
}

async function handleQualityCheck(ctx: RequestContext, req: QualityCheckRequest): Promise<QualityCheckResponse> {
  const productRepo = new SupabaseProductRepository(ctx.admin);
  const product = await getOwnedProduct(ctx, req.productId);
  const conversion = await getLatestConversionForProduct(ctx, product.id);

  let qaRecommendations: string[] = conversion?.qualityReport?.geminiQaReport?.recommendedActions ?? [];

  // If the stored quality report lacks a Gemini QA result but we have source assets
  // and an output asset, try to re-run visual QA now (best-effort).
  if (
    conversion?.outputAsset &&
    conversion.sourceAssets.length > 0 &&
    conversion.qualityReport &&
    conversion.qualityReport.geminiQaScore === undefined
  ) {
    try {
      // We don't have the original shape params at this point, so we send a
      // generic "primitive mesh" description via a simplified QA call.
      const model = createGenerativeModel(ctx.env.geminiApiKey, ANALYSIS_MODEL_ID);
      const genericPrimitive = {
        shape: 'box' as const,
        widthM: 0.3,
        heightM: 0.3,
        depthM: 0.3,
        baseColor: [0.8, 0.8, 0.8, 1.0] as [number, number, number, number],
        roughness: 0.5,
        metalness: 0.0,
      };
      const visualQa = new GeminiVisualQa(model);
      const qaResult = await visualQa.evaluate({
        sourceImageUrls: conversion.sourceAssets.map((a) => a.url),
        productCategory: product.category,
        generatedPrimitive: genericPrimitive,
      });
      qaRecommendations = qaResult.recommendedActions;
    } catch {
      // Non-fatal — fall through
    }
  }

  const recommendations = [
    ...(conversion?.sourceAssets.length && conversion.sourceAssets.length < 3
      ? ['Add more source angles before publishing to improve 3D fidelity.']
      : []),
    ...(conversion?.qualityReport?.warnings ?? []),
    ...qaRecommendations,
  ];
  const readinessScore = conversion?.qualityReport?.score() ?? product.aiAnalysis?.readinessScore;

  await productRepo.save(
    product.withAiAnalysis(
      mergeAnalysis(product, {
        readinessScore,
        qualityRecommendations: recommendations,
      }),
    ),
  );

  return {
    readinessScore,
    qualityRecommendations: recommendations,
  };
}

function notFound(): never {
  throw new Error('Not found');
}

export function createApiServer(env = getEnv()) {
  return createServer(async (req, res) => {
    if (!req.url || !req.method) {
      sendJson(res, 400, { error: 'Bad request' }, env.corsOrigin);
      return;
    }

    if (req.method === 'OPTIONS') {
      sendNoContent(res, env.corsOrigin);
      return;
    }

    if (req.method === 'GET' && req.url === '/health') {
      sendJson(res, 200, { ok: true }, env.corsOrigin);
      return;
    }

    try {
      const ctx = await authenticate(req, env);
      const url = new URL(req.url, `http://localhost:${env.port}`);
      const pathname = url.pathname;

      if (req.method === 'POST' && pathname === '/api/conversions') {
        const body = await readJson<CreateConversionRequest>(req);
        sendJson(res, 200, await handleCreateConversion(ctx, body), env.corsOrigin);
        return;
      }

      const conversionMatch = pathname.match(/^\/api\/conversions\/([^/]+)$/);
      if (req.method === 'GET' && conversionMatch) {
        sendJson(res, 200, await handleGetConversion(ctx, conversionMatch[1]), env.corsOrigin);
        return;
      }

      const approveMatch = pathname.match(/^\/api\/conversions\/([^/]+)\/approve$/);
      if (req.method === 'POST' && approveMatch) {
        sendJson(res, 200, await handleApproveConversion(ctx, approveMatch[1]), env.corsOrigin);
        return;
      }

      const rejectMatch = pathname.match(/^\/api\/conversions\/([^/]+)\/reject$/);
      if (req.method === 'POST' && rejectMatch) {
        const body = await readJson<RejectConversionRequest>(req);
        sendJson(res, 200, await handleRejectConversion(ctx, rejectMatch[1], body), env.corsOrigin);
        return;
      }

      if (req.method === 'POST' && pathname === '/api/ai/analyze-product') {
        const body = await readJson<AnalyzeProductRequest>(req);
        sendJson(res, 200, await handleAnalyzeProduct(ctx, body), env.corsOrigin);
        return;
      }

      if (req.method === 'POST' && pathname === '/api/ai/generate-hotspots') {
        const body = await readJson<GenerateHotspotsRequest>(req);
        sendJson(res, 200, await handleGenerateHotspots(ctx, body), env.corsOrigin);
        return;
      }

      if (req.method === 'POST' && pathname === '/api/ai/generate-description') {
        const body = await readJson<GenerateDescriptionRequest>(req);
        sendJson(res, 200, await handleGenerateDescription(ctx, body), env.corsOrigin);
        return;
      }

      if (req.method === 'POST' && pathname === '/api/ai/return-risk') {
        const body = await readJson<ReturnRiskRequest>(req);
        sendJson(res, 200, await handleReturnRisk(ctx, body), env.corsOrigin);
        return;
      }

      if (req.method === 'POST' && pathname === '/api/ai/quality-check') {
        const body = await readJson<QualityCheckRequest>(req);
        sendJson(res, 200, await handleQualityCheck(ctx, body), env.corsOrigin);
        return;
      }

      notFound();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      const status = message === 'Unauthorized' ? 401 : message === 'Not found' ? 404 : message === 'Invalid request' ? 400 : 500;
      sendJson(res, status, { error: message }, env.corsOrigin);
    }
  });
}
