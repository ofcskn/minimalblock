import { Buffer } from 'node:buffer';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { URL } from 'node:url';
import {
  Conversion,
  Product,
  GenerationJob,
  MediaAsset,
  ProductWorkflowStatus,
  QualityReport,
  SourceImageReadiness,
  deriveViewLabel,
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
  type ImportProductUrlRequest,
  type ImportProductUrlResponse,
  type ProductAiAnalysis,
  type ProductAiCopy,
  type ProductImportSnapshot,
  type QualityCheckRequest,
  type QualityCheckResponse,
  type RejectConversionRequest,
  type AcceptProductClusterRequest,
  type AcceptProductClusterResponse,
  type RetryImportedProductResponse,
  type ReturnRiskRequest,
  type ReturnRiskResponse,
  type SaveImportedReviewRequest,
  type SaveImportedReviewResponse,
  type SuggestedHotspot,
  type SuggestedHotspotType,
} from '@minimalblock/core';
import {
  SupabaseConversionRepository,
  SupabaseEventsRepository,
  SupabaseGenerationJobRepository,
  SupabaseProductRepository,
} from '@minimalblock/data';
import { createGenerativeModel, ANALYSIS_MODEL_ID, GeminiModelGenerator, GeminiVisualQa, buildTrendyolListingPrompt } from '@minimalblock/ai';
import { TrendyolClient } from '@minimalblock/trendyol';
import { ProductImportService } from './product-import.service.js';
import type {
  BatchResult as TrendyolBatchResult,
  ShipmentPackagesParams,
  TrendyolBuyboxResult,
  TrendyolPackage,
  TrendyolProduct,
  TrendyolProductDraft,
  TrendyolUnapprovedProduct,
} from '@minimalblock/trendyol';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { Database } from '@minimalblock/data';

export interface ApiEnv {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  geminiApiKey: string;
  port: number;
  corsOrigin: string;
  trendyolMerchantId: string;
  trendyolApiKey: string;
  trendyolApiSecret: string;
  trendyolMock: boolean;
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
    trendyolMerchantId: process.env['TRENDYOL_MERCHANT_ID'] ?? '',
    trendyolApiKey: process.env['TRENDYOL_API_KEY'] ?? '',
    trendyolApiSecret: process.env['TRENDYOL_API_SECRET'] ?? '',
    trendyolMock: process.env['TRENDYOL_MOCK'] === 'true' || !process.env['TRENDYOL_MERCHANT_ID'],
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
    'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
    'access-control-allow-headers': 'authorization,content-type',
  });
  res.end(JSON.stringify(body));
}

function sendNoContent(res: ServerResponse, origin: string): void {
  res.writeHead(204, {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
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

function toProductImportSnapshot(product: Product): ProductImportSnapshot {
  return {
    productId: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    workflowStatus: product.workflowStatus,
    inputMethod: product.inputMethod,
    importData: product.importData,
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

function getImportedSourceAssets(product: Product): MediaAsset[] {
  return ProductImportService.toImportedMediaAssets(product.importData);
}

async function analyzeProductWithGemini(ctx: RequestContext, product: Product, sourceAssets: MediaAsset[] = []): Promise<ProductAiAnalysis> {
  const model = createGenerativeModel(ctx.env.geminiApiKey, ANALYSIS_MODEL_ID);
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    {
      text:
        `Analyze this commerce product for a seller dashboard and respond with JSON only.\n` +
        `Schema:\n` +
        `{\n` +
        `  "categorySuggestion": "furniture | home-decor | bags | accessories | electronics | other",\n` +
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

  const GEMINI_SUPPORTED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
  for (const sourceAsset of sourceAssets.filter((a) => GEMINI_SUPPORTED_MIME.has(a.mimeType)).slice(0, 3)) {
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

async function generateSuggestedHotspots(ctx: RequestContext, product: Product, sourceAssets: MediaAsset[] = []): Promise<SuggestedHotspot[]> {
  const model = createGenerativeModel(ctx.env.geminiApiKey, ANALYSIS_MODEL_ID);
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    {
      text:
        `Suggest 3 to 5 commerce hotspots for this product and respond with JSON only.\n` +
        `Schema: [{"title":"string","description":"string","type":"material|dimension|feature|warning|assembly"}]\n` +
        `Product: ${product.name}\nCategory: ${product.category}\nDescription: ${product.description || 'n/a'}`,
    },
  ];
  const GEMINI_SUPPORTED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
  for (const sourceAsset of sourceAssets.filter((a) => GEMINI_SUPPORTED_MIME.has(a.mimeType)).slice(0, 2)) {
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

function importedReadiness(product: Product): SourceImageReadiness | null {
  if (!product.importData) return null;
  const entries = product.importData.imageCandidates
    .filter((candidate) => candidate.selected && candidate.storageKey && candidate.url && candidate.sizeBytes !== undefined)
    .map((candidate) => ({
      storageKey: candidate.storageKey!,
      url: candidate.url!,
      sizeBytes: candidate.sizeBytes!,
      viewLabel: deriveViewLabel(candidate.storageKey!),
      widthPx: candidate.widthPx,
      heightPx: candidate.heightPx,
      warnings: candidate.warnings.filter((warning) =>
        warning === 'low_resolution'
        || warning === 'likely_duplicate'
        || warning === 'likely_cropped'
        || warning === 'background_inconsistent'
        || warning === 'angle_unclear',
      ) as Array<'low_resolution' | 'likely_duplicate' | 'likely_cropped' | 'background_inconsistent' | 'angle_unclear'>,
    }));

  return entries.length > 0 ? SourceImageReadiness.fromEntries(entries) : null;
}

async function handleImportProductUrl(ctx: RequestContext, req: ImportProductUrlRequest): Promise<ImportProductUrlResponse> {
  if (!req.url?.trim()) throw new Error('Invalid request');

  const productRepo = new SupabaseProductRepository(ctx.admin);
  const eventsRepo = new SupabaseEventsRepository(ctx.admin);
  const now = new Date();

  let product = await productRepo.save(
    new Product({
      id: generateId(),
      name: 'Importing product…',
      description: '',
      category: 'other',
      ownerId: ctx.user.id,
      hotspots: [],
      hotspotsSuggested: [],
      aiAnalysis: null,
      workflowStatus: 'url_submitted',
      inputMethod: 'url_import',
      importData: null,
      createdAt: now,
      updatedAt: now,
    }),
  );

  await eventsRepo.track(product.id, ctx.user.id, 'import_url_submitted', { source_url: req.url });
  product = await productRepo.save(product.withWorkflowStatus('scraping'));
  await eventsRepo.track(product.id, ctx.user.id, 'import_scrape_started');

  const service = new ProductImportService({
    admin: ctx.admin,
    ownerId: ctx.user.id,
    geminiApiKey: ctx.env.geminiApiKey,
  });
  const imported = await service.importFromUrl(req.url);

  product = await productRepo.save(
    product
      .withUpdatedMeta({
        name: imported.productName,
        description: imported.productDescription,
        category: imported.productCategory,
      })
      .withImportData(imported.importData)
      .withWorkflowStatus(imported.workflowStatus),
  );

  if (imported.workflowStatus === 'scrape_failed') {
    await eventsRepo.track(product.id, ctx.user.id, 'import_scrape_failed', { reasons: imported.importData.failureReasons });
  } else {
    await eventsRepo.track(product.id, ctx.user.id, 'import_scrape_completed', { confidence: imported.importData.overallConfidence });
    await eventsRepo.track(product.id, ctx.user.id, 'import_images_extracted', { count: imported.importData.imageCandidates.length });
    await eventsRepo.track(product.id, ctx.user.id, 'import_autofill_completed', { missing_fields: imported.importData.missingFields ?? [] });
  }

  return { product: toProductImportSnapshot(product) };
}

async function handleSaveImportedReview(
  ctx: RequestContext,
  productId: string,
  req: SaveImportedReviewRequest,
): Promise<SaveImportedReviewResponse> {
  if (!req.title?.trim() || !req.selectedImageIds?.length || !req.sellerConfirmedText || !req.sellerConfirmedImages) {
    throw new Error('Invalid request');
  }

  const productRepo = new SupabaseProductRepository(ctx.admin);
  const eventsRepo = new SupabaseEventsRepository(ctx.admin);
  const product = await getOwnedProduct(ctx, productId);
  if (!product.importData) throw new Error('Invalid request');

  const reviewed = product.withImportedReview({
    name: req.title.trim(),
    description: req.description.trim(),
    category: req.category,
    materials: req.materials,
    dimensions: req.dimensions.trim(),
    selectedImageIds: req.selectedImageIds,
    sellerConfirmedText: req.sellerConfirmedText,
    sellerConfirmedImages: req.sellerConfirmedImages,
  }).withWorkflowStatus('source_readiness_pending');

  const sourceAssets = getImportedSourceAssets(reviewed);
  if (sourceAssets.length === 0) throw new Error('Invalid request');

  const readiness = importedReadiness(reviewed) ?? SourceImageReadiness.fromMediaAssets(sourceAssets);
  const aiAnalysis = await analyzeProductWithGemini(ctx, reviewed, sourceAssets);
  const combinedReadinessScore = Math.round(((aiAnalysis.readinessScore ?? readiness.score) + readiness.score) / 2);
  const normalizedReadinessScore = readiness.hasEnoughUniqueViews ? combinedReadinessScore : Math.min(combinedReadinessScore, 65);
  const merged = mergeAnalysis(reviewed, {
    ...aiAnalysis,
    materials: req.materials,
    readinessScore: normalizedReadinessScore,
    finalQualityScore: aiAnalysis.finalQualityScore ?? normalizedReadinessScore,
    visualMatchScore: aiAnalysis.visualMatchScore ?? normalizedReadinessScore,
    commerceReadinessScore: aiAnalysis.commerceReadinessScore ?? normalizedReadinessScore,
    missingVisuals: readiness.missingViews.map((view) => `${view} view`),
    qualityRecommendations: Array.from(new Set([
      ...readiness.weakImages.flatMap((image) => image.warnings.map((warning) => `Fix ${warning.replace(/_/g, ' ')} on ${image.storageKey.split('/').pop()}`)),
      ...aiAnalysis.qualityRecommendations,
    ])),
    merchantRecommendations: Array.from(new Set([
      ...(reviewed.importData?.warnings ?? []),
      ...aiAnalysis.merchantRecommendations,
    ])),
    sourceImageEntries: readiness.entries,
  });

  const saved = await productRepo.save(
    reviewed
      .withAiAnalysis(merged)
      .withWorkflowStatus(ProductWorkflowStatus.deriveFromAiAnalysis(merged).value),
  );

  await eventsRepo.track(saved.id, ctx.user.id, 'import_images_selected', { count: req.selectedImageIds.length });
  if (saved.importData?.sellerEditedFields.length) {
    await eventsRepo.track(saved.id, ctx.user.id, 'import_fields_edited', { fields: saved.importData.sellerEditedFields });
  }
  await eventsRepo.track(saved.id, ctx.user.id, 'import_moved_to_source_readiness', { readiness_score: normalizedReadinessScore });

  return {
    product: toProductImportSnapshot(saved),
    selectedImages: saved.importData?.imageCandidates.filter((candidate) => candidate.selected) ?? [],
    readinessScore: normalizedReadinessScore,
  };
}

async function handleAcceptProductCluster(
  ctx: RequestContext,
  productId: string,
  req: AcceptProductClusterRequest,
): Promise<AcceptProductClusterResponse> {
  if (!req.clusterId) throw new Error('Invalid request');

  const productRepo = new SupabaseProductRepository(ctx.admin);
  const product = await getOwnedProduct(ctx, productId);

  if (!product.importData?.multiProductDetected || !product.importData.productClusters?.length) {
    throw new Error('Product does not have multi-product clusters');
  }

  const cluster = product.importData.productClusters.find((c) => c.clusterId === req.clusterId);
  if (!cluster) throw new Error('Cluster not found');

  const clusterImageIds = new Set(cluster.imageIds);
  const scopedCandidates = product.importData.imageCandidates.map((candidate) => ({
    ...candidate,
    selected: clusterImageIds.has(candidate.id),
  }));

  const scopedImportData = {
    ...product.importData,
    fields: {
      ...product.importData.fields,
      ...(cluster.fields.title ? { title: cluster.fields.title } : {}),
      ...(cluster.fields.description ? { description: cluster.fields.description } : {}),
      ...(cluster.fields.category ? { category: cluster.fields.category } : {}),
      ...(cluster.fields.materials ? { materials: cluster.fields.materials } : {}),
      ...(cluster.fields.dimensions ? { dimensions: cluster.fields.dimensions } : {}),
    },
    imageCandidates: scopedCandidates,
    selectedImageIds: cluster.imageIds,
    multiProductDetected: false,
    productClusters: undefined,
    primaryClusterId: cluster.clusterId,
    ...(cluster.materialFinish ? { inferredMaterialFinish: cluster.materialFinish } : {}),
    ...(cluster.geometryComplexity ? { inferredGeometryComplexity: cluster.geometryComplexity } : {}),
  };

  const clusterName = cluster.fields.title?.value ?? product.name;
  const clusterCategory = cluster.fields.category?.value ?? product.category;
  const saved = await productRepo.save(
    product
      .withImportData(scopedImportData)
      .withUpdatedMeta({ name: clusterName, category: clusterCategory }),
  );

  return { product: toProductImportSnapshot(saved) };
}

async function handleRetryImportedProduct(ctx: RequestContext, productId: string): Promise<RetryImportedProductResponse> {
  const productRepo = new SupabaseProductRepository(ctx.admin);
  const eventsRepo = new SupabaseEventsRepository(ctx.admin);
  const existing = await getOwnedProduct(ctx, productId);
  const sourceUrl = existing.importData?.sourceUrl;
  if (!sourceUrl) throw new Error('Invalid request');

  await eventsRepo.track(existing.id, ctx.user.id, 'import_scrape_started', { retry: true });
  let product = await productRepo.save(existing.withWorkflowStatus('scraping'));
  const service = new ProductImportService({
    admin: ctx.admin,
    ownerId: ctx.user.id,
    geminiApiKey: ctx.env.geminiApiKey,
  });
  const imported = await service.importFromUrl(sourceUrl);
  product = await productRepo.save(
    product
      .withUpdatedMeta({
        name: imported.productName,
        description: imported.productDescription,
        category: imported.productCategory,
      })
      .withImportData(imported.importData)
      .withWorkflowStatus(imported.workflowStatus),
  );

  if (imported.workflowStatus === 'scrape_failed') {
    await eventsRepo.track(product.id, ctx.user.id, 'import_scrape_failed', { reasons: imported.importData.failureReasons, retry: true });
  } else {
    await eventsRepo.track(product.id, ctx.user.id, 'import_scrape_completed', { confidence: imported.importData.overallConfidence, retry: true });
    await eventsRepo.track(product.id, ctx.user.id, 'import_images_extracted', { count: imported.importData.imageCandidates.length, retry: true });
    await eventsRepo.track(product.id, ctx.user.id, 'import_autofill_completed', { missing_fields: imported.importData.missingFields ?? [], retry: true });
  }

  return { product: toProductImportSnapshot(product) };
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

async function createConversionForProduct(
  ctx: RequestContext,
  product: Product,
  req: Pick<CreateConversionRequest, 'sourceAssets' | 'manualModelAsset' | 'qualityHint'>,
): Promise<CreateConversionResponse> {
  const conversionRepo = new SupabaseConversionRepository(ctx.admin);
  const jobRepo = new SupabaseGenerationJobRepository(ctx.admin);
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
        conversion = await conversionRepo.save(conversion.markAwaitingApproval(outputAsset, quality));
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

async function handleCreateConversion(ctx: RequestContext, req: CreateConversionRequest): Promise<CreateConversionResponse> {
  if (!req.product?.name || !req.sourceAssets?.length) {
    throw new Error('Invalid request');
  }

  const productRepo = new SupabaseProductRepository(ctx.admin);

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
      inputMethod: req.manualModelAsset ? 'manual_glb' : 'manual_upload',
      createdAt: now,
      updatedAt: now,
    }),
  );

  return createConversionForProduct(ctx, product, req);
}

async function handleTryImportedProduct3d(ctx: RequestContext, productId: string): Promise<CreateConversionResponse> {
  const product = await getOwnedProduct(ctx, productId);
  const sourceAssets = getImportedSourceAssets(product);
  if (sourceAssets.length === 0) throw new Error('Invalid request');

  return createConversionForProduct(ctx, product, {
    sourceAssets: sourceAssets.map((asset) => ({
      url: asset.url,
      storageKey: asset.storageKey,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
    })),
  });
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
  const sourceAssets = getImportedSourceAssets(product);
  await eventsRepo.track(product.id, ctx.user.id, 'ai_analysis_started');
  const analysis = await analyzeProductWithGemini(ctx, product, sourceAssets.length > 0 ? sourceAssets : [...(conversion?.sourceAssets ?? [])]);
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
  const sourceAssets = getImportedSourceAssets(product);
  const hotspots = await generateSuggestedHotspots(ctx, product, sourceAssets.length > 0 ? sourceAssets : [...(conversion?.sourceAssets ?? [])]);
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
  const importReadiness = importedReadiness(product);

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
        detectedType: 'other',
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
    ...(importReadiness && !importReadiness.hasEnoughUniqueViews
      ? ['Add more unique imported product angles before publishing.']
      : []),
    ...(conversion?.qualityReport?.warnings ?? []),
    ...qaRecommendations,
  ];
  const readinessScore = conversion?.qualityReport?.score() ?? importReadiness?.score ?? product.aiAnalysis?.readinessScore;

  await productRepo.save(
    product.withAiAnalysis(
      mergeAnalysis(product, {
        readinessScore,
        sourceImageEntries: importReadiness?.entries ?? product.aiAnalysis?.sourceImageEntries,
        qualityRecommendations: recommendations,
      }),
    ),
  );

  return {
    readinessScore,
    qualityRecommendations: recommendations,
  };
}

// --- Trendyol helpers ---

function createTrendyolClient(env: ApiEnv): TrendyolClient {
  return new TrendyolClient({
    sellerId: env.trendyolMerchantId,
    apiKey: env.trendyolApiKey,
    apiSecret: env.trendyolApiSecret,
    mock: env.trendyolMock,
  });
}

// --- Trendyol: Gemini listing generation ---

async function handleTrendyolListing(
  ctx: RequestContext,
  req: { productId: string },
): Promise<{ draft: TrendyolProductDraft }> {
  const product = await getOwnedProduct(ctx, req.productId);
  const conversion = await getLatestConversionForProduct(ctx, product.id);

  const model = createGenerativeModel(ctx.env.geminiApiKey, ANALYSIS_MODEL_ID);
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: buildTrendyolListingPrompt({ productName: product.name, productCategory: product.category }) },
  ];

  if (conversion?.sourceAssets[0]) {
    parts.push({ inlineData: await fetchAssetBase64(conversion.sourceAssets[0]) });
  }

  const result = await model.generateContent(parts);
  const raw = parseJsonText<{
    title?: string;
    description?: string;
    categoryId?: number;
    brandName?: string;
    listPrice?: number;
    salePrice?: number;
    attributes?: Array<{ name: string; value: string }>;
  }>(result.response.text());

  const draft: TrendyolProductDraft = {
    title: raw.title ?? product.name,
    description: raw.description ?? product.description ?? '',
    categoryId: raw.categoryId ?? 2356,
    brandName: raw.brandName ?? 'Generic',
    listPrice: raw.listPrice ?? 299,
    salePrice: raw.salePrice ?? 249,
    attributes: raw.attributes ?? [],
  };

  return { draft };
}

// --- Trendyol: product catalog ---

async function handleTrendyolCreateProducts(
  ctx: RequestContext,
  req: { items: TrendyolProduct[] },
): Promise<{ batchRequestId: string }> {
  if (!req.items?.length) throw new Error('Invalid request');
  const client = createTrendyolClient(ctx.env);
  return client.createProducts(req.items);
}

async function handleTrendyolPollBatch(
  ctx: RequestContext,
  batchRequestId: string,
): Promise<{ batch: TrendyolBatchResult }> {
  const client = createTrendyolClient(ctx.env);
  const batch = await client.pollBatchResult(batchRequestId);
  return { batch };
}

async function handleTrendyolUnapproved(
  ctx: RequestContext,
  page: number,
): Promise<{ content: TrendyolUnapprovedProduct[]; totalElements: number }> {
  const client = createTrendyolClient(ctx.env);
  return client.filterUnapprovedProducts({ page, size: 20 });
}

async function handleTrendyolBuybox(
  ctx: RequestContext,
  req: { barcodes: string[] },
): Promise<{ result: TrendyolBuyboxResult[] }> {
  if (!req.barcodes?.length) throw new Error('Invalid request');
  const client = createTrendyolClient(ctx.env);
  return client.getBuyboxInformation(req.barcodes.slice(0, 10));
}

// --- Trendyol: orders ---

async function handleTrendyolOrders(
  ctx: RequestContext,
  params: ShipmentPackagesParams,
): Promise<{ content: TrendyolPackage[]; totalPages: number; totalElements: number }> {
  const client = createTrendyolClient(ctx.env);
  return client.getShipmentPackages(params);
}

async function handleTrendyolUpdateOrderStatus(
  ctx: RequestContext,
  packageId: string,
  req: { status: 'Picking' | 'Invoiced'; invoiceNumber?: string },
): Promise<{ ok: true }> {
  if (!req.status) throw new Error('Invalid request');
  const client = createTrendyolClient(ctx.env);
  await client.updatePackageStatus(packageId, req.status, req.invoiceNumber);
  return { ok: true };
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

      if (req.method === 'POST' && pathname === '/api/products/import-url') {
        const body = await readJson<ImportProductUrlRequest>(req);
        sendJson(res, 200, await handleImportProductUrl(ctx, body), env.corsOrigin);
        return;
      }

      const importReviewMatch = pathname.match(/^\/api\/products\/([^/]+)\/import\/review$/);
      if (req.method === 'POST' && importReviewMatch) {
        const body = await readJson<SaveImportedReviewRequest>(req);
        sendJson(res, 200, await handleSaveImportedReview(ctx, importReviewMatch[1], body), env.corsOrigin);
        return;
      }

      const importRetryMatch = pathname.match(/^\/api\/products\/([^/]+)\/import\/retry$/);
      if (req.method === 'POST' && importRetryMatch) {
        sendJson(res, 200, await handleRetryImportedProduct(ctx, importRetryMatch[1]), env.corsOrigin);
        return;
      }

      const acceptClusterMatch = pathname.match(/^\/api\/products\/([^/]+)\/import\/accept-cluster$/);
      if (req.method === 'POST' && acceptClusterMatch) {
        const body = await readJson<AcceptProductClusterRequest>(req);
        sendJson(res, 200, await handleAcceptProductCluster(ctx, acceptClusterMatch[1], body), env.corsOrigin);
        return;
      }

      const import3dMatch = pathname.match(/^\/api\/products\/([^/]+)\/try-3d$/);
      if (req.method === 'POST' && import3dMatch) {
        sendJson(res, 200, await handleTryImportedProduct3d(ctx, import3dMatch[1]), env.corsOrigin);
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

      // --- Trendyol: AI listing ---
      if (req.method === 'POST' && pathname === '/api/ai/trendyol-listing') {
        const body = await readJson<{ productId: string }>(req);
        sendJson(res, 200, await handleTrendyolListing(ctx, body), env.corsOrigin);
        return;
      }

      // --- Trendyol: products ---
      if (req.method === 'POST' && pathname === '/api/trendyol/products') {
        const body = await readJson<{ items: TrendyolProduct[] }>(req);
        sendJson(res, 200, await handleTrendyolCreateProducts(ctx, body), env.corsOrigin);
        return;
      }

      const batchMatch = pathname.match(/^\/api\/trendyol\/products\/batch\/([^/]+)$/);
      if (req.method === 'GET' && batchMatch) {
        sendJson(res, 200, await handleTrendyolPollBatch(ctx, batchMatch[1]), env.corsOrigin);
        return;
      }

      if (req.method === 'GET' && pathname === '/api/trendyol/unapproved') {
        const page = Number(url.searchParams.get('page') ?? '0');
        sendJson(res, 200, await handleTrendyolUnapproved(ctx, page), env.corsOrigin);
        return;
      }

      if (req.method === 'POST' && pathname === '/api/trendyol/buybox') {
        const body = await readJson<{ barcodes: string[] }>(req);
        sendJson(res, 200, await handleTrendyolBuybox(ctx, body), env.corsOrigin);
        return;
      }

      // --- Trendyol: orders ---
      if (req.method === 'GET' && pathname === '/api/trendyol/orders') {
        const params: ShipmentPackagesParams = {
          page: Number(url.searchParams.get('page') ?? '0'),
          size: Number(url.searchParams.get('size') ?? '50'),
          status: url.searchParams.get('status') ?? undefined,
        };
        sendJson(res, 200, await handleTrendyolOrders(ctx, params), env.corsOrigin);
        return;
      }

      const orderStatusMatch = pathname.match(/^\/api\/trendyol\/orders\/([^/]+)\/status$/);
      if (req.method === 'PUT' && orderStatusMatch) {
        const body = await readJson<{ status: 'Picking' | 'Invoiced'; invoiceNumber?: string }>(req);
        sendJson(res, 200, await handleTrendyolUpdateOrderStatus(ctx, orderStatusMatch[1], body), env.corsOrigin);
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
