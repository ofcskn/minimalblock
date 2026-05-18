import { generateId } from '../../utils/id-generator.js';
import { ProductWorkflowStatus, type ProductWorkflowStatusValue } from '../value-objects/product-workflow-status.vo.js';
import type { SourceImageEntry } from '../value-objects/source-image-readiness.vo.js';
import type { MediaAssetType } from '../value-objects/media-asset.vo.js';

export type ProductCategory = 'furniture' | 'home-decor' | 'bags' | 'accessories' | 'electronics' | 'other';
export type SuggestedHotspotType = 'material' | 'dimension' | 'feature' | 'warning' | 'assembly';
export type SuggestedHotspotStatus = 'pending' | 'accepted' | 'rejected';
export type ProductInputMethod = 'url_import' | 'manual_upload' | 'manual_glb';
export type ImportSupportLevel = 'supported' | 'best_effort' | 'mock';
export type ImportFieldConfidence = 'high' | 'medium' | 'low';
export type ImportExtractionMethod = 'live_scraper' | 'mock_scraper' | 'ai_extraction' | 'manual_fallback';

export interface ImportedField<T> {
  value: T;
  confidence: ImportFieldConfidence;
  source: 'scraper' | 'ai' | 'seller';
  aiSuggested?: boolean;
  editedBySeller?: boolean;
  originalValue?: T;
}

export interface ImportedImageCandidate {
  id: string;
  sourceUrl: string;
  url?: string;
  storageKey?: string;
  mimeType?: MediaAssetType;
  sizeBytes?: number;
  ordinal: number;
  selected: boolean;
  warnings: string[];
  failureReasons?: string[];
  confidence: ImportFieldConfidence;
  widthPx?: number;
  heightPx?: number;
  alt?: string;
  title?: string;
}

export interface ProductImportData {
  sourceUrl: string;
  domain: string;
  scrapeTimestamp?: string;
  extractionMethod: ImportExtractionMethod;
  supportLevel: ImportSupportLevel;
  overallConfidence: number;
  categoryHint?: string;
  price?: string;
  warnings: string[];
  failureReasons: string[];
  fields: {
    title?: ImportedField<string>;
    description?: ImportedField<string>;
    category?: ImportedField<ProductCategory>;
    materials?: ImportedField<string[]>;
    dimensions?: ImportedField<string>;
  };
  imageCandidates: ImportedImageCandidate[];
  selectedImageIds: string[];
  sellerEditedFields: string[];
  sellerConfirmedText: boolean;
  sellerConfirmedImages: boolean;
  missingFields?: string[];
  raw?: Record<string, unknown>;
}

export interface Hotspot {
  id: string;
  label: string;
  description?: string;
  type?: SuggestedHotspotType;
  position?: string;
  normal?: string;
  /** F.5 — seller-approved for public display */
  approved?: boolean;
}

export interface SuggestedHotspot {
  id: string;
  title: string;
  description: string;
  type: SuggestedHotspotType;
  status: SuggestedHotspotStatus;
  acceptedHotspotId?: string;
}

export interface ProductAiCopy {
  seoTitle: string;
  bullets: string[];
  description: string;
}

export interface ReturnRiskFactor {
  risk: string;
  fix: string;
}

export type AiConversionResult = 'pass' | 'warning' | 'fail';

export interface AiDiagnosisAttempt {
  timestamp: string;
  version: string;
  readinessScore: number;
  visualMatchScore: number;
  commerceReadinessScore: number;
  finalQualityScore: number;
}

export interface ProductAiAnalysis {
  categorySuggestion?: ProductCategory;
  materials: string[];
  confidenceScore: number;
  missingVisuals: string[];
  suggestedCopy: ProductAiCopy | null;
  returnRiskFactors: ReturnRiskFactor[];
  qualityRecommendations: string[];
  merchantRecommendations: string[];
  readinessScore?: number;
  lastUpdatedAt?: string;
  // Phase 3 — AI Diagnosis Panel
  visualMatchScore?: number;
  commerceReadinessScore?: number;
  finalQualityScore?: number;
  detectedCategory?: ProductCategory;
  expectedCategory?: ProductCategory;
  conversionResult?: AiConversionResult;
  blockingReasons?: string[];
  missingParts?: string[];
  sellerExplanation?: string;
  analysisVersion?: string;
  analysisHistory?: AiDiagnosisAttempt[];
  // Phase 4 — Source Image Readiness: pre-computed entries for demo / AI-enriched data
  sourceImageEntries?: SourceImageEntry[];
}

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  ownerId: string;
  slug?: string | null;
  hotspots: Hotspot[];
  hotspotsSuggested?: SuggestedHotspot[];
  aiAnalysis?: ProductAiAnalysis | null;
  workflowStatus?: ProductWorkflowStatusValue;
  inputMethod?: ProductInputMethod;
  importData?: ProductImportData | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ProductCategory;
  readonly ownerId: string;
  readonly slug: string | null;
  readonly hotspots: Hotspot[];
  readonly hotspotsSuggested: SuggestedHotspot[];
  readonly aiAnalysis: ProductAiAnalysis | null;
  readonly workflowStatus: ProductWorkflowStatusValue;
  readonly inputMethod: ProductInputMethod;
  readonly importData: ProductImportData | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ProductProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.category = props.category;
    this.ownerId = props.ownerId;
    this.slug = props.slug ?? null;
    this.hotspots = props.hotspots;
    this.hotspotsSuggested = props.hotspotsSuggested ?? [];
    this.aiAnalysis = props.aiAnalysis ?? null;
    this.workflowStatus = props.workflowStatus ?? 'draft';
    this.inputMethod = props.inputMethod ?? 'manual_upload';
    this.importData = props.importData ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isOwnedBy(userId: string): boolean {
    return this.ownerId === userId;
  }

  isPublishable(): boolean {
    return ProductWorkflowStatus.from(this.workflowStatus).isPublishable();
  }

  withWorkflowStatus(s: ProductWorkflowStatusValue): Product {
    return new Product({ ...this, workflowStatus: s, updatedAt: new Date() });
  }

  withInputMethod(inputMethod: ProductInputMethod): Product {
    return new Product({ ...this, inputMethod, updatedAt: new Date() });
  }

  withImportData(importData: ProductImportData | null): Product {
    return new Product({ ...this, importData, updatedAt: new Date() });
  }

  get publicUrl(): string {
    return `/p/${this.slug ?? this.id}`;
  }

  withUpdatedName(name: string): Product {
    return new Product({ ...this, name, updatedAt: new Date() });
  }

  withUpdatedMeta(patch: { name?: string; description?: string; category?: ProductCategory }): Product {
    return new Product({
      ...this,
      name: patch.name ?? this.name,
      description: patch.description ?? this.description,
      category: patch.category ?? this.category,
      updatedAt: new Date(),
    });
  }

  withImportedReview(patch: {
    name?: string;
    description?: string;
    category?: ProductCategory;
    materials?: string[];
    dimensions?: string;
    selectedImageIds?: string[];
    sellerConfirmedText?: boolean;
    sellerConfirmedImages?: boolean;
  }): Product {
    const importData = this.importData
      ? {
          ...this.importData,
          fields: {
            ...this.importData.fields,
            ...(patch.name !== undefined
              ? {
                  title: {
                    value: patch.name,
                    confidence: this.importData.fields.title?.confidence ?? 'high',
                    source: 'seller' as const,
                    editedBySeller: true,
                    originalValue: this.importData.fields.title?.value,
                  },
                }
              : {}),
            ...(patch.description !== undefined
              ? {
                  description: {
                    value: patch.description,
                    confidence: this.importData.fields.description?.confidence ?? 'high',
                    source: 'seller' as const,
                    editedBySeller: true,
                    originalValue: this.importData.fields.description?.value,
                  },
                }
              : {}),
            ...(patch.category !== undefined
              ? {
                  category: {
                    value: patch.category,
                    confidence: this.importData.fields.category?.confidence ?? 'high',
                    source: 'seller' as const,
                    editedBySeller: true,
                    originalValue: this.importData.fields.category?.value,
                  },
                }
              : {}),
            ...(patch.materials !== undefined
              ? {
                  materials: {
                    value: patch.materials,
                    confidence: this.importData.fields.materials?.confidence ?? 'high',
                    source: 'seller' as const,
                    editedBySeller: true,
                    originalValue: this.importData.fields.materials?.value,
                  },
                }
              : {}),
            ...(patch.dimensions !== undefined
              ? {
                  dimensions: {
                    value: patch.dimensions,
                    confidence: this.importData.fields.dimensions?.confidence ?? 'high',
                    source: 'seller' as const,
                    editedBySeller: true,
                    originalValue: this.importData.fields.dimensions?.value,
                  },
                }
              : {}),
          },
          imageCandidates: this.importData.imageCandidates.map((candidate) => ({
            ...candidate,
            selected: patch.selectedImageIds
              ? patch.selectedImageIds.includes(candidate.id)
              : candidate.selected,
          })),
          selectedImageIds: patch.selectedImageIds ?? this.importData.selectedImageIds,
          sellerEditedFields: Array.from(
            new Set([
              ...this.importData.sellerEditedFields,
              ...(patch.name !== undefined ? ['title'] : []),
              ...(patch.description !== undefined ? ['description'] : []),
              ...(patch.category !== undefined ? ['category'] : []),
              ...(patch.materials !== undefined ? ['materials'] : []),
              ...(patch.dimensions !== undefined ? ['dimensions'] : []),
            ]),
          ),
          sellerConfirmedText: patch.sellerConfirmedText ?? this.importData.sellerConfirmedText,
          sellerConfirmedImages: patch.sellerConfirmedImages ?? this.importData.sellerConfirmedImages,
        }
      : null;

    return new Product({
      ...this,
      name: patch.name ?? this.name,
      description: patch.description ?? this.description,
      category: patch.category ?? this.category,
      importData,
      updatedAt: new Date(),
    });
  }

  withSlug(slug: string | null): Product {
    return new Product({ ...this, slug, updatedAt: new Date() });
  }

  withUpdatedHotspots(hotspots: Hotspot[]): Product {
    return new Product({ ...this, hotspots, updatedAt: new Date() });
  }

  withAiAnalysis(aiAnalysis: ProductAiAnalysis | null): Product {
    return new Product({ ...this, aiAnalysis, updatedAt: new Date() });
  }

  withSuggestedHotspots(hotspotsSuggested: SuggestedHotspot[]): Product {
    return new Product({ ...this, hotspotsSuggested, updatedAt: new Date() });
  }

  acceptSuggestedHotspot(suggestedHotspotId: string): Product {
    const suggestion = this.hotspotsSuggested.find((item) => item.id === suggestedHotspotId);
    if (!suggestion || suggestion.status !== 'pending') {
      return this;
    }

    const newHotspotId = generateId();
    const nextHotspots = [
      ...this.hotspots,
      {
        id: newHotspotId,
        label: suggestion.title,
        description: suggestion.description,
        type: suggestion.type,
      },
    ];

    const nextSuggestions = this.hotspotsSuggested.map((item) =>
      item.id === suggestedHotspotId
        ? { ...item, status: 'accepted' as const, acceptedHotspotId: newHotspotId }
        : item,
    );

    return new Product({
      ...this,
      hotspots: nextHotspots,
      hotspotsSuggested: nextSuggestions,
      updatedAt: new Date(),
    });
  }

  rejectSuggestedHotspot(suggestedHotspotId: string): Product {
    return new Product({
      ...this,
      hotspotsSuggested: this.hotspotsSuggested.map((item) =>
        item.id === suggestedHotspotId ? { ...item, status: 'rejected' as const } : item,
      ),
      updatedAt: new Date(),
    });
  }

  // Phase 6 — Hotspot QA and Editor

  /** F.2/F.3/F.4/F.5 — update label, description, type, or approved on a single hotspot */
  withHotspotUpdate(id: string, patch: Partial<Omit<Hotspot, 'id'>>): Product {
    return new Product({
      ...this,
      hotspots: this.hotspots.map((h) => (h.id === id ? { ...h, ...patch } : h)),
      updatedAt: new Date(),
    });
  }

  /** F.5 — toggle approval for a hotspot */
  withHotspotApproved(id: string, approved: boolean): Product {
    return this.withHotspotUpdate(id, { approved });
  }

  /** F.6 — remove a hotspot by id */
  withHotspotRemoved(id: string): Product {
    return new Product({
      ...this,
      hotspots: this.hotspots.filter((h) => h.id !== id),
      updatedAt: new Date(),
    });
  }

  /** F.15 — true when every hotspot carries an explicit seller approval */
  allHotspotsApproved(): boolean {
    return this.hotspots.length > 0 && this.hotspots.every((h) => h.approved === true);
  }
}
