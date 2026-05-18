import type { ImportExtractionMethod, ImportSupportLevel } from '../../domain/entities/product.entity.js';

export interface ScrapedImageCandidate {
  sourceUrl: string;
  ordinal: number;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
  failureReasons?: string[];
  alt?: string;
  title?: string;
  widthPx?: number;
  heightPx?: number;
}

export interface ScrapedPageData {
  sourceUrl: string;
  domain: string;
  extractionMethod: ImportExtractionMethod;
  supportLevel: ImportSupportLevel;
  overallConfidence: number;
  scrapeTimestamp: string;
  title?: string;
  description?: string;
  longDescription?: string;
  categoryHint?: string;
  materials?: string[];
  dimensions?: string;
  price?: string;
  images: ScrapedImageCandidate[];
  specificationTable?: Record<string, string>;
  variants?: Array<{ type: string; values: string[] }>;
  jsonLdRaw?: Record<string, unknown>;
  warnings: string[];
  failureReasons: string[];
  raw?: Record<string, unknown>;
  pageRegions?: {
    hasGalleryCarousel: boolean;
    hasSpecificationTable: boolean;
    hasVariantSelector: boolean;
    hasRecommendationWidget: boolean;
  };
}

export interface IPageScraperAdapter {
  readonly supportLevel: ImportSupportLevel;
  canHandle(url: URL): boolean;
  scrape(url: URL): Promise<ScrapedPageData>;
}
