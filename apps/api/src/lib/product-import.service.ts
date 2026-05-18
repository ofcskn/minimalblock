import { Buffer } from 'node:buffer';
import {
  MediaAsset,
  generateId,
  migrateLegacyProductCategory,
  type ImportedField,
  type ImportedImageCandidate,
  type ImportSupportLevel,
  type ProductCategory,
  type ProductImportData,
} from '@minimalblock/core';
import { ANALYSIS_MODEL_ID, createGenerativeModel } from '@minimalblock/ai';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@minimalblock/data';

interface SupportedDomainInfo {
  supportLevel: ImportSupportLevel;
  label: string;
  isMock: boolean;
}

interface ScrapedImageCandidate {
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

interface ScrapeResult {
  sourceUrl: string;
  domain: string;
  extractionMethod: ProductImportData['extractionMethod'];
  supportLevel: ImportSupportLevel;
  overallConfidence: number;
  scrapeTimestamp: string;
  title?: string;
  description?: string;
  categoryHint?: string;
  materials?: string[];
  dimensions?: string;
  price?: string;
  warnings: string[];
  failureReasons: string[];
  images: ScrapedImageCandidate[];
  raw?: Record<string, unknown>;
}

interface AutofillResult {
  title?: string;
  category?: ProductCategory;
  materials?: string[];
  dimensions?: string;
  description?: string;
  missingFields: string[];
  confidenceByField: Partial<Record<'title' | 'category' | 'materials' | 'dimensions' | 'description', 'high' | 'medium' | 'low'>>;
}

interface UploadedImportImage extends ImportedImageCandidate {
  mimeType?: ImportedImageCandidate['mimeType'];
}

export interface ProductImportServiceOptions {
  admin: SupabaseClient<Database>;
  ownerId: string;
  geminiApiKey: string;
}

function normalizeUrl(raw: string): URL {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('Please paste a product URL.');
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withProtocol);
}

function normalizeDomain(url: URL): string {
  return url.hostname.toLowerCase().replace(/^www\./, '');
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48) || 'product';
}

function mimeExtension(mimeType: string): string {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/svg+xml':
      return 'svg';
    case 'image/webp':
      return 'webp';
    case 'image/jpeg':
    default:
      return 'jpg';
  }
}

function cleanText(value: string | undefined, maxLength = 800): string | undefined {
  if (!value) return undefined;
  const compact = value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b(cookie|accept all|privacy policy|free shipping|subscribe)\b/gi, ' ')
    .replace(/\s+\|\s+/g, ' ')
    .trim();
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

function dedupeUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of urls) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
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
  const match = value.match(/(\d+(?:\.\d+)?\s?(?:cm|mm|in|inch|inches|m)\s?(?:x|×)\s?\d+(?:\.\d+)?\s?(?:cm|mm|in|inch|inches|m)(?:\s?(?:x|×)\s?\d+(?:\.\d+)?\s?(?:cm|mm|in|inch|inches|m))?)/i)
    ?? value.match(/(\d+(?:\.\d+)?\s?(?:cm|mm|in|inch|inches|m)\s?(?:wide|width|tall|height|deep|depth))/i);
  return match?.[1];
}

function parseJsonLd(html: string): unknown[] {
  const matches = Array.from(html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
  return matches.flatMap((match) => {
    try {
      const parsed = JSON.parse(match[1].trim()) as unknown;
      if (Array.isArray(parsed)) return parsed;
      return [parsed];
    } catch {
      return [];
    }
  });
}

function pickProductJsonLd(entries: unknown[]): Record<string, unknown> | null {
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    if (record['@type'] === 'Product') return record;
    const graph = record['@graph'];
    if (Array.isArray(graph)) {
      const found = graph.find((item) => item && typeof item === 'object' && (item as Record<string, unknown>)['@type'] === 'Product');
      if (found && typeof found === 'object') return found as Record<string, unknown>;
    }
  }
  return null;
}

function extractMeta(html: string, property: string): string | undefined {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  return pattern.exec(html)?.[1];
}

function extractTitleTag(html: string): string | undefined {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
}

function extractVisibleImages(html: string, baseUrl: URL): ScrapedImageCandidate[] {
  const matches = Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi));
  const urls: ScrapedImageCandidate[] = matches.flatMap((match, index) => {
    const rawSrc = match[1];
    const block = match[0];
    const absolute = new URL(rawSrc, baseUrl).toString();
    const lowered = absolute.toLowerCase();
    if (/sprite|icon|logo|badge|payment|rating|star/.test(lowered)) return [];
    const alt = block.match(/\salt=["']([^"']*)["']/i)?.[1];
    const title = block.match(/\stitle=["']([^"']*)["']/i)?.[1];
    return [{
      sourceUrl: absolute,
      ordinal: index,
      confidence: index < 4 ? 'medium' as const : 'low' as const,
      warnings: [],
      alt,
      title,
    }];
  });

  const deduped = dedupeUrls(urls.map((entry) => entry.sourceUrl));
  return deduped.map<ScrapedImageCandidate>((sourceUrl, index) => {
    const existing = urls.find((entry) => entry.sourceUrl === sourceUrl);
    if (existing) return existing;
    return {
      sourceUrl,
      ordinal: index,
      confidence: 'low',
      warnings: [],
    };
  });
}

function buildMockDataUrl(label: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" font-family="Arial" font-size="84" text-anchor="middle" fill="#ffffff">${label}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

class SupportedDomainRegistry {
  private readonly supported = new Map<string, string>([
    ['amazon.com', 'Supported'],
    ['etsy.com', 'Supported'],
    ['ikea.com', 'Supported'],
    ['trendyol.com', 'Supported'],
    ['minimalblock.demo', 'Mock'],
  ]);

  resolve(url: URL): SupportedDomainInfo {
    const domain = normalizeDomain(url);
    if (domain === 'minimalblock.demo') {
      return { supportLevel: 'mock', label: 'Mock demo URL', isMock: true };
    }
    if (this.supported.has(domain)) {
      return { supportLevel: 'supported', label: this.supported.get(domain) ?? 'Supported', isMock: false };
    }
    return { supportLevel: 'best_effort', label: 'Best-effort extraction', isMock: false };
  }
}

class MockProductScraper {
  supports(url: URL): boolean {
    return normalizeDomain(url) === 'minimalblock.demo';
  }

  async scrape(url: URL): Promise<ScrapeResult> {
    const pathname = url.pathname.toLowerCase();
    const now = new Date().toISOString();

    if (pathname.includes('fail-laptop')) {
      return {
        sourceUrl: url.toString(),
        domain: normalizeDomain(url),
        extractionMethod: 'mock_scraper',
        supportLevel: 'mock',
        overallConfidence: 0.31,
        scrapeTimestamp: now,
        title: 'UltraSlim Laptop Pro 14"',
        description: undefined,
        categoryHint: 'electronics',
        materials: ['aluminum'],
        dimensions: undefined,
        warnings: ['Product page blocked image gallery access.', 'Description could not be extracted cleanly.'],
        failureReasons: ['blocked_page', 'no_description_found', 'no_product_images_found'],
        images: [],
        raw: { mockScenario: 'fail-laptop' },
      };
    }

    if (pathname.includes('warn-lamp')) {
      return {
        sourceUrl: url.toString(),
        domain: normalizeDomain(url),
        extractionMethod: 'mock_scraper',
        supportLevel: 'mock',
        overallConfidence: 0.68,
        scrapeTimestamp: now,
        title: 'Arc Floor Lamp',
        description: 'Minimal arc floor lamp with marble base and adjustable head for reading corners.',
        categoryHint: 'home-decor',
        materials: ['marble', 'metal'],
        dimensions: '180 cm x 40 cm',
        price: '$249',
        warnings: ['One image looks like a detail crop only.'],
        failureReasons: [],
        images: [
          { sourceUrl: buildMockDataUrl('Lamp Front', '#2d6a4f'), ordinal: 0, confidence: 'high', warnings: [], widthPx: 1200, heightPx: 1200 },
          { sourceUrl: buildMockDataUrl('Lamp Detail', '#40916c'), ordinal: 1, confidence: 'medium', warnings: ['angle_unclear'], widthPx: 1200, heightPx: 1200 },
        ],
        raw: { mockScenario: 'warn-lamp' },
      };
    }

    return {
      sourceUrl: url.toString(),
      domain: normalizeDomain(url),
      extractionMethod: 'mock_scraper',
      supportLevel: 'mock',
      overallConfidence: 0.92,
      scrapeTimestamp: now,
      title: 'Nordic Accent Chair',
      description: 'Scandinavian accent chair with curved oak arms, boucle upholstery, and a compact living-room footprint.',
      categoryHint: 'furniture',
      materials: ['wood', 'fabric'],
      dimensions: '78 cm x 71 cm x 82 cm',
      price: '$319',
      warnings: ['Imported from mock demo data.'],
      failureReasons: [],
      images: [
        { sourceUrl: buildMockDataUrl('Chair Front', '#1d3557'), ordinal: 0, confidence: 'high', warnings: [], widthPx: 1200, heightPx: 1200 },
        { sourceUrl: buildMockDataUrl('Chair Side', '#457b9d'), ordinal: 1, confidence: 'high', warnings: [], widthPx: 1200, heightPx: 1200 },
        { sourceUrl: buildMockDataUrl('Chair Back', '#a8dadc'), ordinal: 2, confidence: 'high', warnings: [], widthPx: 1200, heightPx: 1200 },
      ],
      raw: { mockScenario: 'success-chair' },
    };
  }
}

class GenericHtmlProductScraper {
  async scrape(url: URL, supportLevel: ImportSupportLevel): Promise<ScrapeResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'MinimalBlockBot/1.0 (+https://minimalblock.demo)',
          accept: 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(response.status === 403 || response.status === 429 ? 'blocked_page' : 'page_unreachable');
      }

      const html = await response.text();
      const jsonLdEntries = parseJsonLd(html);
      const productJsonLd = pickProductJsonLd(jsonLdEntries);
      const title = cleanTitle(
        typeof productJsonLd?.name === 'string'
          ? productJsonLd.name
          : extractMeta(html, 'og:title') ?? extractTitleTag(html),
      );
      const description = cleanText(
        typeof productJsonLd?.description === 'string'
          ? productJsonLd.description
          : extractMeta(html, 'og:description'),
      );

      const rawImages: string[] = [];
      const jsonLdImage = productJsonLd?.image;
      if (typeof jsonLdImage === 'string') rawImages.push(new URL(jsonLdImage, url).toString());
      if (Array.isArray(jsonLdImage)) {
        for (const item of jsonLdImage) {
          if (typeof item === 'string') rawImages.push(new URL(item, url).toString());
        }
      }
      const ogImage = extractMeta(html, 'og:image');
      if (ogImage) rawImages.push(new URL(ogImage, url).toString());

      const visibleImages = extractVisibleImages(html, url);
      const mergedImages = [
        ...dedupeUrls(rawImages).map((sourceUrl, index) => ({
          sourceUrl,
          ordinal: index,
          confidence: 'high' as const,
          warnings: [],
        })),
        ...visibleImages,
      ];

      const uniqueImages: ScrapedImageCandidate[] = dedupeUrls(mergedImages.map((entry) => entry.sourceUrl))
        .slice(0, 8)
        .map((sourceUrl, index) => {
          const existing = mergedImages.find((entry) => entry.sourceUrl === sourceUrl);
          if (existing) return existing;
          return {
            sourceUrl,
            ordinal: index,
            confidence: 'low' as const,
            warnings: [],
          };
        });

      const materialSource = description ?? html;
      const materials = extractMaterials(materialSource);
      const dimensions = extractDimensions(description ?? html);
      const categoryHint = typeof productJsonLd?.category === 'string'
        ? productJsonLd.category
        : extractMeta(html, 'product:category') ?? title;
      const price = typeof productJsonLd?.offers === 'object' && productJsonLd.offers
        ? `${(productJsonLd.offers as Record<string, unknown>).price ?? ''}`.trim() || undefined
        : undefined;

      const warnings: string[] = [];
      const failureReasons: string[] = [];
      if (!description) warnings.push('Description was incomplete and may need editing.');
      if (uniqueImages.length === 0) failureReasons.push('no_product_images_found');
      if (!description) failureReasons.push('no_description_found');

      const confidence =
        (title ? 0.3 : 0) +
        (description ? 0.25 : 0) +
        (uniqueImages.length > 0 ? 0.25 : 0) +
        (materials.length > 0 ? 0.1 : 0) +
        (dimensions ? 0.1 : 0);

      return {
        sourceUrl: url.toString(),
        domain: normalizeDomain(url),
        extractionMethod: 'live_scraper',
        supportLevel,
        overallConfidence: Number(confidence.toFixed(2)),
        scrapeTimestamp: new Date().toISOString(),
        title,
        description,
        categoryHint,
        materials,
        dimensions,
        price,
        warnings,
        failureReasons,
        images: uniqueImages,
        raw: {
          titleSource: productJsonLd?.name ? 'jsonld' : extractMeta(html, 'og:title') ? 'og' : 'title',
          imageCount: uniqueImages.length,
        },
      };
    } catch (error) {
      const reason = error instanceof Error && error.message === 'blocked_page'
        ? 'blocked_page'
        : error instanceof Error && error.name === 'AbortError'
          ? 'timeout'
          : 'page_unreachable';
      return {
        sourceUrl: url.toString(),
        domain: normalizeDomain(url),
        extractionMethod: 'live_scraper',
        supportLevel,
        overallConfidence: 0,
        scrapeTimestamp: new Date().toISOString(),
        warnings: ['We could not fully extract this product page.'],
        failureReasons: [reason],
        images: [],
        raw: { error: reason },
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export class ProductImportService {
  private readonly registry = new SupportedDomainRegistry();
  private readonly mockScraper = new MockProductScraper();
  private readonly genericScraper = new GenericHtmlProductScraper();

  constructor(private readonly options: ProductImportServiceOptions) {}

  async importFromUrl(rawUrl: string): Promise<{
    productName: string;
    productDescription: string;
    productCategory: ProductCategory;
    workflowStatus: 'scrape_failed' | 'autofill_ready';
    importData: ProductImportData;
  }> {
    const normalizedUrl = normalizeUrl(rawUrl);
    const support = this.registry.resolve(normalizedUrl);
    const scrape = support.isMock && this.mockScraper.supports(normalizedUrl)
      ? await this.mockScraper.scrape(normalizedUrl)
      : await this.genericScraper.scrape(normalizedUrl, support.supportLevel);

    const uploadedImages = await this.importImages(scrape.images);
    const autofill = await this.autofill(scrape, uploadedImages);
    const productCategory = autofill.category ?? inferCategory(scrape.categoryHint ?? scrape.title) ?? 'other';

    const titleValue = cleanTitle(scrape.title) ?? autofill.title ?? `Imported product from ${scrape.domain}`;
    const descriptionValue = cleanText(scrape.description, 700) ?? autofill.description ?? '';
    const materialsValue = scrape.materials?.length ? scrape.materials : (autofill.materials ?? []);
    const dimensionsValue = scrape.dimensions ?? autofill.dimensions ?? '';

    const selectedImageIds = uploadedImages
      .filter((image) => image.storageKey && image.url && !image.failureReasons?.length)
      .slice(0, 6)
      .map((image) => image.id);

    const failureReasons = [
      ...scrape.failureReasons,
      ...(uploadedImages.some((image) => image.storageKey) ? [] : ['no_importable_images']),
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
        ...(support.supportLevel === 'best_effort' ? ['This domain is in best-effort extraction mode.'] : []),
      ],
      failureReasons,
      fields: {
        title: this.buildField(titleValue, scrape.title, autofill.title, autofill.confidenceByField.title),
        description: this.buildField(descriptionValue, scrape.description, autofill.description, autofill.confidenceByField.description),
        category: this.buildField(productCategory, inferCategory(scrape.categoryHint), autofill.category, autofill.confidenceByField.category),
        materials: this.buildField(materialsValue, scrape.materials, autofill.materials, autofill.confidenceByField.materials),
        dimensions: this.buildField(dimensionsValue, scrape.dimensions, autofill.dimensions, autofill.confidenceByField.dimensions),
      },
      imageCandidates: uploadedImages,
      selectedImageIds,
      sellerEditedFields: [],
      sellerConfirmedText: false,
      sellerConfirmedImages: false,
      missingFields: autofill.missingFields,
      raw: scrape.raw,
    };

    return {
      productName: titleValue,
      productDescription: descriptionValue,
      productCategory,
      workflowStatus: failureReasons.length > 0 && selectedImageIds.length === 0 ? 'scrape_failed' : 'autofill_ready',
      importData,
    };
  }

  private buildField<T>(
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

  private async importImages(images: ScrapedImageCandidate[]): Promise<UploadedImportImage[]> {
    const uploaded: UploadedImportImage[] = [];
    for (const image of images) {
      try {
        const upload = await this.fetchAndUploadImage(image);
        uploaded.push(upload);
      } catch (error) {
        uploaded.push({
          id: generateId(),
          sourceUrl: image.sourceUrl,
          ordinal: image.ordinal,
          selected: false,
          warnings: image.warnings,
          confidence: image.confidence,
          widthPx: image.widthPx,
          heightPx: image.heightPx,
          alt: image.alt,
          title: image.title,
          failureReasons: [error instanceof Error ? error.message : 'image_download_failed'],
        });
      }
    }
    return uploaded;
  }

  private async fetchAndUploadImage(image: ScrapedImageCandidate): Promise<UploadedImportImage> {
    const decoded = this.decodeDataUrl(image.sourceUrl);
    const response = decoded
      ? null
      : await fetch(image.sourceUrl, {
          headers: {
            'user-agent': 'MinimalBlockBot/1.0 (+https://minimalblock.demo)',
            accept: 'image/*',
          },
        });

    const mimeType = decoded?.mimeType ?? response?.headers.get('content-type')?.split(';')[0] ?? '';
    if (!mimeType.startsWith('image/')) {
      throw new Error('non_image_response');
    }
    const normalizedMimeType = mimeType === 'image/png' || mimeType === 'image/webp' || mimeType === 'image/svg+xml'
      ? mimeType
      : 'image/jpeg';
    const bytes = decoded?.buffer ?? Buffer.from(await response!.arrayBuffer());
    const fileName = `${Date.now()}-${slugify(image.title ?? image.alt ?? `import-${image.ordinal}`)}.${mimeExtension(normalizedMimeType)}`;
    const storageKey = `${this.options.ownerId}/imports/${fileName}`;
    const { error } = await this.options.admin.storage.from('media-assets').upload(storageKey, bytes, {
      contentType: normalizedMimeType,
      upsert: false,
    });
    if (error) {
      throw new Error('image_upload_failed');
    }
    const { data } = this.options.admin.storage.from('media-assets').getPublicUrl(storageKey);
    return {
      id: generateId(),
      sourceUrl: image.sourceUrl,
      url: data.publicUrl,
      storageKey,
      mimeType: normalizedMimeType,
      sizeBytes: bytes.byteLength,
      ordinal: image.ordinal,
      selected: true,
      warnings: image.warnings,
      confidence: image.confidence,
      widthPx: image.widthPx,
      heightPx: image.heightPx,
      alt: image.alt,
      title: image.title,
    };
  }

  private decodeDataUrl(raw: string): { mimeType: string; buffer: Buffer } | null {
    if (!raw.startsWith('data:')) return null;
    const match = raw.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;
    return { mimeType: match[1], buffer: Buffer.from(match[2], 'base64') };
  }

  private async autofill(scrape: ScrapeResult, images: UploadedImportImage[]): Promise<AutofillResult> {
    try {
      const model = createGenerativeModel(this.options.geminiApiKey, ANALYSIS_MODEL_ID);
      const prompt = [
        'You are extracting seller-editable ecommerce product data.',
        'Respond with JSON only.',
        '{"title":"string","category":"furniture|home-decor|bags|accessories|electronics|other","materials":["string"],"dimensions":"string","description":"string","missingFields":["string"],"confidenceByField":{"title":"high|medium|low","category":"high|medium|low","materials":"high|medium|low","dimensions":"high|medium|low","description":"high|medium|low"}}',
        `Source title: ${scrape.title ?? 'n/a'}`,
        `Source description: ${scrape.description ?? 'n/a'}`,
        `Source category hint: ${scrape.categoryHint ?? 'n/a'}`,
        `Source materials: ${(scrape.materials ?? []).join(', ') || 'n/a'}`,
        `Source dimensions: ${scrape.dimensions ?? 'n/a'}`,
        `Image hints: ${images.map((image) => image.alt ?? image.title ?? image.storageKey ?? 'image').join(', ') || 'n/a'}`,
      ].join('\n');
      const result = await model.generateContent(prompt);
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

  static toImportedMediaAssets(importData: ProductImportData | null): MediaAsset[] {
    if (!importData) return [];
    return importData.imageCandidates
      .filter((candidate) => candidate.selected && candidate.storageKey && candidate.url && candidate.mimeType && candidate.sizeBytes !== undefined)
      .map((candidate) => new MediaAsset({
        url: candidate.url!,
        storageKey: candidate.storageKey!,
        mimeType: candidate.mimeType!,
        kind: 'source-image',
        sizeBytes: candidate.sizeBytes!,
      }));
  }
}
