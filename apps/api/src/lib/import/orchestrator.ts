import {
  type ImportedField,
  type ProductCategory,
  type ProductImportData,
} from '@minimalblock/core';
import {
  ANALYSIS_MODEL_ID,
  DEFAULT_MODEL_ID,
  GeminiProductIntelligenceAgent,
  GeminiMaterialInferenceEngine,
  GeminiProductClusterAnalyzer,
  ImageDeduplicationService,
  createGenerativeModel,
} from '@minimalblock/ai';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@minimalblock/data';
import { ScraperAdapterRegistry } from './adapters/adapter-registry.js';
import { ImageUploadPipeline } from './pipeline/image-upload.pipeline.js';
import { ProductIntelligencePipeline } from './pipeline/product-intelligence.pipeline.js';
import { AutofillPipeline, inferCategory, cleanTitle, cleanText } from './pipeline/autofill.pipeline.js';
import { ClusterDetectionPipeline } from './pipeline/cluster.pipeline.js';
import { MaterialInferencePipeline } from './pipeline/material.pipeline.js';

export interface ExtractionOrchestratorOptions {
  admin: SupabaseClient<Database>;
  ownerId: string;
  geminiApiKey: string;
}

export interface OrchestratorResult {
  productName: string;
  productDescription: string;
  productCategory: ProductCategory;
  workflowStatus: 'scrape_failed' | 'autofill_ready';
  importData: ProductImportData;
}

function normalizeUrl(raw: string): URL {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('Please paste a product URL.');
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withProtocol);
}

function buildField<T>(
  resolved: T,
  scraperValue: T | undefined,
  aiValue: T | undefined,
  aiConfidence: ImportedField<T>['confidence'] | undefined,
): ImportedField<T> {
  if (scraperValue !== undefined && scraperValue !== null && `${scraperValue}` !== '') {
    return {
      value: resolved,
      confidence: scraperValue === resolved ? 'high' : 'medium',
      source: scraperValue === resolved ? 'scraper' : 'seller',
      aiSuggested: aiValue !== undefined && aiValue !== scraperValue,
      originalValue: scraperValue,
    };
  }
  return {
    value: resolved,
    confidence: aiConfidence ?? 'low',
    source: aiValue !== undefined ? 'ai' : 'seller',
    aiSuggested: aiValue !== undefined,
    originalValue: aiValue,
  };
}

export class ExtractionOrchestrator {
  private readonly registry: ScraperAdapterRegistry;
  private readonly uploadPipeline: ImageUploadPipeline;
  private readonly intelligencePipeline: ProductIntelligencePipeline;
  private readonly autofillPipeline: AutofillPipeline;
  private readonly clusterPipeline: ClusterDetectionPipeline;
  private readonly materialPipeline: MaterialInferencePipeline;

  constructor(options: ExtractionOrchestratorOptions) {
    const analysisModel = createGenerativeModel(options.geminiApiKey, ANALYSIS_MODEL_ID);
    const flashModel = createGenerativeModel(options.geminiApiKey, DEFAULT_MODEL_ID);

    this.registry = new ScraperAdapterRegistry();
    this.uploadPipeline = new ImageUploadPipeline(options.admin, options.ownerId);
    this.intelligencePipeline = new ProductIntelligencePipeline(
      new GeminiProductIntelligenceAgent(flashModel),
      new ImageDeduplicationService(),
    );
    this.autofillPipeline = new AutofillPipeline(analysisModel);
    this.clusterPipeline = new ClusterDetectionPipeline(new GeminiProductClusterAnalyzer(flashModel));
    this.materialPipeline = new MaterialInferencePipeline(new GeminiMaterialInferenceEngine(flashModel));
  }

  async run(rawUrl: string): Promise<OrchestratorResult> {
    // 1. Resolve adapter and scrape
    const url = normalizeUrl(rawUrl);
    const adapter = this.registry.resolve(url);
    const scrape = await adapter.scrape(url);

    // 2. Upload images to Supabase storage
    const uploadedImages = await this.uploadPipeline.upload(scrape.images);

    // 3. Image intelligence — classify, deduplicate, score (graceful fallback)
    let imageIntelligenceResult: Awaited<ReturnType<ProductIntelligencePipeline['analyze']>> = {
      candidates: uploadedImages,
      summary: undefined,
    };
    try {
      imageIntelligenceResult = await this.intelligencePipeline.analyze(uploadedImages, scrape.title);
    } catch {
      // Proceed without AI image intelligence
    }
    const enrichedCandidates = imageIntelligenceResult.candidates;

    // 4. Autofill missing product fields
    const autofill = await this.autofillPipeline.autofill(scrape, uploadedImages);
    const productCategory = autofill.category ?? inferCategory(scrape.categoryHint ?? scrape.title) ?? 'other';
    const titleValue = cleanTitle(scrape.title) ?? autofill.title ?? `Imported product from ${scrape.domain}`;
    const descriptionValue = cleanText(scrape.description, 700) ?? autofill.description ?? '';
    const materialsValue = scrape.materials?.length ? scrape.materials : (autofill.materials ?? []);
    const dimensionsValue = scrape.dimensions ?? autofill.dimensions ?? '';

    // 5. Multi-product cluster detection (graceful fallback)
    let clusterResult: Awaited<ReturnType<ClusterDetectionPipeline['detect']>> | undefined;
    try {
      const hasMultiHint = (scrape.title?.includes('&') || scrape.title?.includes('+') || scrape.title?.toLowerCase().includes(' and ') || scrape.title?.toLowerCase().includes('bundle') || scrape.title?.toLowerCase().includes('set'));
      if (hasMultiHint || enrichedCandidates.filter((c) => !c.aiRejected).length >= 3) {
        clusterResult = await this.clusterPipeline.detect(enrichedCandidates, scrape);
      }
    } catch {
      // Proceed without cluster detection
    }

    // 6. Material and geometry inference (graceful fallback)
    let materialResult: Awaited<ReturnType<MaterialInferencePipeline['infer']>> | undefined;
    try {
      if (enrichedCandidates.some((c) => !c.aiRejected && c.url)) {
        materialResult = await this.materialPipeline.infer(enrichedCandidates, scrape);
      }
    } catch {
      // Proceed without material inference
    }

    // 7. Assemble importData
    const selectedImageIds = enrichedCandidates
      .filter((img) => img.storageKey && img.url && !img.failureReasons?.length && !img.aiRejected)
      .slice(0, 6)
      .map((img) => img.id);

    const failureReasons = [
      ...scrape.failureReasons,
      ...(uploadedImages.some((img) => img.storageKey) ? [] : ['no_importable_images']),
    ];

    const importData: ProductImportData = {
      sourceUrl: scrape.sourceUrl,
      domain: scrape.domain,
      scrapeTimestamp: scrape.scrapeTimestamp,
      extractionMethod: scrape.extractionMethod,
      supportLevel: scrape.supportLevel,
      overallConfidence: scrape.overallConfidence,
      categoryHint: scrape.categoryHint,
      price: scrape.price,
      warnings: [
        ...scrape.warnings,
        ...(adapter.supportLevel === 'best_effort' ? ['This domain is in best-effort extraction mode.'] : []),
      ],
      failureReasons,
      fields: {
        title: buildField(titleValue, scrape.title, autofill.title, autofill.confidenceByField.title),
        description: buildField(descriptionValue, scrape.description, autofill.description, autofill.confidenceByField.description),
        category: buildField(productCategory, inferCategory(scrape.categoryHint), autofill.category, autofill.confidenceByField.category),
        materials: buildField(materialsValue, scrape.materials, autofill.materials, autofill.confidenceByField.materials),
        dimensions: buildField(dimensionsValue, scrape.dimensions, autofill.dimensions, autofill.confidenceByField.dimensions),
      },
      imageCandidates: enrichedCandidates,
      selectedImageIds,
      sellerEditedFields: [],
      sellerConfirmedText: false,
      sellerConfirmedImages: false,
      missingFields: autofill.missingFields,
      raw: scrape.raw,
      // APUS fields
      pageRegions: scrape.pageRegions,
      imageIntelligence: imageIntelligenceResult.summary,
      ...(clusterResult?.multiProductDetected ? {
        productClusters: clusterResult.clusters,
        primaryClusterId: clusterResult.primaryClusterId,
        multiProductDetected: true,
      } : {}),
      ...(materialResult ? {
        inferredMaterialFinish: materialResult.inferredMaterialFinish,
        inferredGeometryComplexity: materialResult.inferredGeometryComplexity,
      } : {}),
    };

    return {
      productName: titleValue,
      productDescription: descriptionValue,
      productCategory,
      workflowStatus: failureReasons.length > 0 && selectedImageIds.length === 0 ? 'scrape_failed' : 'autofill_ready',
      importData,
    };
  }
}
