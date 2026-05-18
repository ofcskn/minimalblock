import { buildDeepAutofillPrompt } from '@minimalblock/ai';

interface GeminiModel {
  generateContent(prompt: string): Promise<{ response: { text(): string } }>;
}
import type { ProductCategory } from '@minimalblock/core';
import { migrateLegacyProductCategory } from '@minimalblock/core';
import type { ScrapedPageData } from '@minimalblock/core';
import type { UploadedImportImage } from './image-upload.pipeline.js';

function cleanText(value: string | undefined, maxLength = 800): string | undefined {
  if (!value) return undefined;
  const compact = value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!compact) return undefined;
  return compact.length > maxLength ? `${compact.slice(0, maxLength - 1).trim()}…` : compact;
}

function cleanTitle(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const cleaned = value
    .replace(/\s*[|\-]\s*(buy|shop|official|store|online).*/i, '')
    .replace(/\s*[|\-]\s*[A-Z0-9 .,&]+$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || undefined;
}

function inferCategory(value: string | undefined): ProductCategory | undefined {
  if (!value) return undefined;
  const lowered = value.toLowerCase();
  if (/chair|table|desk|sofa|cabinet|shelf|bed/.test(lowered)) return 'furniture';
  if (/lamp|vase|mirror|decor|rug|pillow/.test(lowered)) return 'home-decor';
  if (/bag|tote|wallet|backpack/.test(lowered)) return 'bags';
  if (/watch|belt|jewelry|glasses|accessory/.test(lowered)) return 'accessories';
  if (/laptop|phone|headphone|speaker|tablet|electronic|monitor/.test(lowered)) return 'electronics';
  return migrateLegacyProductCategory(lowered);
}

function extractMaterials(value: string | undefined): string[] {
  if (!value) return [];
  const matches = value.match(/\b(leather|wood|metal|glass|ceramic|plastic|cotton|linen|marble|steel|aluminum|fabric)\b/gi) ?? [];
  return Array.from(new Set(matches.map((item) => item.toLowerCase())));
}

function extractDimensions(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const match = value.match(/(\d+(?:\.\d+)?\s?(?:cm|mm|in|inch|inches|m)\s?(?:x|×)\s?\d+(?:\.\d+)?\s?(?:cm|mm|in|inch|inches|m)(?:\s?(?:x|×)\s?\d+(?:\.\d+)?\s?(?:cm|mm|in|inch|inches|m))?)/i);
  return match?.[1];
}

export interface AutofillResult {
  title?: string;
  category?: ProductCategory;
  materials?: string[];
  dimensions?: string;
  description?: string;
  missingFields: string[];
  confidenceByField: Partial<Record<'title' | 'category' | 'materials' | 'dimensions' | 'description', 'high' | 'medium' | 'low'>>;
}

export class AutofillPipeline {
  constructor(private readonly model: GeminiModel) {}

  async autofill(scrape: ScrapedPageData, images: UploadedImportImage[]): Promise<AutofillResult> {
    try {
      const prompt = buildDeepAutofillPrompt({
        title: scrape.title,
        description: scrape.description,
        longDescription: scrape.longDescription,
        categoryHint: scrape.categoryHint,
        materials: scrape.materials,
        dimensions: scrape.dimensions,
        specTable: scrape.specificationTable,
        imageAlts: images.map((img) => img.alt ?? img.title ?? img.storageKey ?? 'image'),
      });

      const result = await this.model.generateContent(prompt);
      const raw = result.response.text().trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
      const parsed = JSON.parse(raw) as AutofillResult;

      return {
        title: parsed.title ? cleanTitle(parsed.title) : undefined,
        category: parsed.category ? inferCategory(parsed.category) : undefined,
        materials: parsed.materials ?? [],
        dimensions: parsed.dimensions,
        description: parsed.description ? cleanText(parsed.description, 700) : undefined,
        missingFields: parsed.missingFields ?? [],
        confidenceByField: parsed.confidenceByField ?? {},
      };
    } catch {
      return {
        title: cleanTitle(scrape.title),
        category: inferCategory(scrape.categoryHint ?? scrape.title),
        materials: scrape.materials?.length ? scrape.materials : extractMaterials(scrape.description),
        dimensions: scrape.dimensions ?? extractDimensions(scrape.description),
        description: cleanText(scrape.description, 700),
        missingFields: [
          ...(scrape.description ? [] : ['description']),
          ...(images.length > 0 ? [] : ['images']),
          ...(scrape.dimensions ? [] : ['dimensions']),
        ],
        confidenceByField: {
          title: scrape.title ? 'medium' : 'low',
          category: scrape.categoryHint ? 'medium' : 'low',
          materials: scrape.materials?.length ? 'medium' : 'low',
          dimensions: scrape.dimensions ? 'medium' : 'low',
          description: scrape.description ? 'medium' : 'low',
        },
      };
    }
  }
}

export { inferCategory, cleanTitle, cleanText, extractMaterials, extractDimensions };
