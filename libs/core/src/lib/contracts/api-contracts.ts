import type {
  ImportedImageCandidate,
  ProductImportData,
  ProductAiAnalysis,
  ProductAiCopy,
  ProductCategory,
  ProductInputMethod,
  ReturnRiskFactor,
  SuggestedHotspot,
} from '../domain/entities/product.entity.js';
import type { ConversionStatusValue } from '../domain/value-objects/conversion-status.vo.js';
import type { MediaAssetProps, MediaAssetType } from '../domain/value-objects/media-asset.vo.js';
import type { ProductWorkflowStatusValue } from '../domain/value-objects/product-workflow-status.vo.js';
import type { QualityReportProps } from '../domain/value-objects/quality-report.vo.js';
import type { ProviderId, ModelSource } from '../domain/aggregates/conversion.aggregate.js';

export interface ApiMediaAssetInput extends Pick<MediaAssetProps, 'url' | 'storageKey' | 'sizeBytes'> {
  mimeType: MediaAssetType;
}

export interface CreateConversionRequest {
  product: {
    name: string;
    description: string;
    category: ProductCategory;
  };
  sourceAssets: ApiMediaAssetInput[];
  manualModelAsset?: ApiMediaAssetInput;
  qualityHint?: 'fast' | 'balanced' | 'quality';
}

export interface CreateConversionResponse {
  productId: string;
  conversionId: string;
  jobId?: string;
  status: ConversionStatusValue;
}

export interface ConversionSnapshot {
  id: string;
  productId: string;
  ownerId: string;
  status: ConversionStatusValue;
  sourceAssets: ApiMediaAssetInput[];
  outputAsset?: ApiMediaAssetInput;
  errorMessage?: string;
  provider?: ProviderId;
  qualityReport?: QualityReportProps;
  modelSource?: ModelSource;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversionResponse {
  conversion: ConversionSnapshot;
}

export interface RejectConversionRequest {
  reason: string;
}

export interface AnalyzeProductRequest {
  productId: string;
}

export interface AnalyzeProductResponse {
  analysis: ProductAiAnalysis;
}

export interface GenerateHotspotsRequest {
  productId: string;
}

export interface GenerateHotspotsResponse {
  hotspots: SuggestedHotspot[];
}

export interface GenerateDescriptionRequest {
  productId: string;
}

export interface GenerateDescriptionResponse {
  suggestedCopy: ProductAiCopy | null;
}

export interface ReturnRiskRequest {
  productId: string;
}

export interface ReturnRiskResponse {
  returnRiskFactors: ReturnRiskFactor[];
}

export interface QualityCheckRequest {
  productId: string;
}

export interface QualityCheckResponse {
  readinessScore?: number;
  qualityRecommendations: string[];
}

export interface ProductImportSnapshot {
  productId: string;
  name: string;
  description: string;
  category: ProductCategory;
  workflowStatus: ProductWorkflowStatusValue;
  inputMethod: ProductInputMethod;
  importData: ProductImportData | null;
}

export interface ImportProductUrlRequest {
  url: string;
}

export interface ImportProductUrlResponse {
  product: ProductImportSnapshot;
}

export interface SaveImportedReviewRequest {
  title: string;
  description: string;
  category: ProductCategory;
  materials: string[];
  dimensions: string;
  selectedImageIds: string[];
  sellerConfirmedText: boolean;
  sellerConfirmedImages: boolean;
}

export interface SaveImportedReviewResponse {
  product: ProductImportSnapshot;
  selectedImages: ImportedImageCandidate[];
  readinessScore: number;
}

export interface RetryImportedProductResponse {
  product: ProductImportSnapshot;
}

export interface AcceptProductClusterRequest {
  clusterId: string;
}

export interface AcceptProductClusterResponse {
  product: ProductImportSnapshot;
}
