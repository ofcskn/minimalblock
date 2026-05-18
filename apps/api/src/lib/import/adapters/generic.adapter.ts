import type { IPageScraperAdapter, ScrapedImageCandidate, ScrapedPageData, ImportSupportLevel } from '@minimalblock/core';

function normalizeDomain(url: URL): string {
  return url.hostname.toLowerCase().replace(/^www\./, '');
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

function extractMaterials(value: string | undefined): string[] {
  if (!value) return [];
  const matches = value.match(/\b(leather|wood|metal|glass|ceramic|plastic|cotton|linen|marble|steel|aluminum|fabric|oak|walnut|brass|velvet|bouclé|boucle|rattan|bamboo)\b/gi) ?? [];
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
    try {
      const absolute = new URL(rawSrc, baseUrl).toString();
      const lowered = absolute.toLowerCase();
      if (/sprite|icon|logo|badge|payment|rating|star/.test(lowered)) return [];
      const alt = block.match(/\salt=["']([^"']*)["']/i)?.[1];
      const title = block.match(/\stitle=["']([^"']*)["']/i)?.[1];
      return [{ sourceUrl: absolute, ordinal: index, confidence: index < 4 ? 'medium' as const : 'low' as const, warnings: [], alt, title }];
    } catch {
      return [];
    }
  });

  const deduped = dedupeUrls(urls.map((entry) => entry.sourceUrl));
  return deduped.map<ScrapedImageCandidate>((sourceUrl, index) => {
    const existing = urls.find((entry) => entry.sourceUrl === sourceUrl);
    return existing ?? { sourceUrl, ordinal: index, confidence: 'low', warnings: [] };
  });
}

function extractSpecificationTable(html: string): Record<string, string> {
  const specs: Record<string, string> = {};

  // Extract <table> rows with th/td pairs
  const tableMatches = Array.from(html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi));
  for (const match of tableMatches) {
    const row = match[1];
    const th = row.match(/<th[^>]*>([\s\S]*?)<\/th>/i)?.[1]?.replace(/<[^>]+>/g, '').trim();
    const td = row.match(/<td[^>]*>([\s\S]*?)<\/td>/i)?.[1]?.replace(/<[^>]+>/g, '').trim();
    if (th && td && th.length < 80 && td.length < 200) {
      specs[th] = td;
    }
  }

  // Extract <dl> definition lists
  const dlMatches = Array.from(html.matchAll(/<dl[^>]*>([\s\S]*?)<\/dl>/gi));
  for (const dl of dlMatches) {
    const dtMatches = Array.from(dl[1].matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>/gi));
    const ddMatches = Array.from(dl[1].matchAll(/<dd[^>]*>([\s\S]*?)<\/dd>/gi));
    for (let i = 0; i < Math.min(dtMatches.length, ddMatches.length); i++) {
      const key = dtMatches[i][1].replace(/<[^>]+>/g, '').trim();
      const value = ddMatches[i][1].replace(/<[^>]+>/g, '').trim();
      if (key && value && key.length < 80) specs[key] = value;
    }
  }

  return specs;
}

function extractLongDescription(html: string): string | undefined {
  // Extract expanded content from details/summary and hidden sections
  const detailMatches = Array.from(html.matchAll(/<details[^>]*>([\s\S]*?)<\/details>/gi));
  const parts: string[] = [];
  for (const match of detailMatches) {
    const content = match[1]
      .replace(/<summary[^>]*>[\s\S]*?<\/summary>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (content.length > 30) parts.push(content);
  }
  const combined = parts.join(' ').slice(0, 1200);
  return combined || undefined;
}

function detectPageRegions(html: string): ScrapedPageData['pageRegions'] {
  return {
    hasGalleryCarousel: /class=["'][^"']*(?:gallery|carousel|slider|swiper)[^"']*["']/i.test(html),
    hasSpecificationTable: /<(?:table|dl)[^>]*>[\s\S]*?(?:specification|dimension|weight|material)/i.test(html),
    hasVariantSelector: /data-(?:variant|option|color|size)|<select[^>]*(?:variant|option|color|size)/i.test(html),
    hasRecommendationWidget: /class=["'][^"']*(?:recommend|related|you-may-also|similar)[^"']*["']/i.test(html),
  };
}

export class GenericHtmlAdapter implements IPageScraperAdapter {
  readonly supportLevel: ImportSupportLevel;

  constructor(supportLevel: ImportSupportLevel = 'best_effort') {
    this.supportLevel = supportLevel;
  }

  canHandle(_url: URL): boolean {
    return true; // fallback — always handles
  }

  async scrape(url: URL): Promise<ScrapedPageData> {
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
      const longDescription = extractLongDescription(html);
      const specificationTable = extractSpecificationTable(html);
      const pageRegions = detectPageRegions(html);

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
          sourceUrl, ordinal: index, confidence: 'high' as const, warnings: [],
        })),
        ...visibleImages,
      ];

      const uniqueImages: ScrapedImageCandidate[] = dedupeUrls(mergedImages.map((entry) => entry.sourceUrl))
        .slice(0, 8)
        .map((sourceUrl, index) => {
          const existing = mergedImages.find((entry) => entry.sourceUrl === sourceUrl);
          return existing ?? { sourceUrl, ordinal: index, confidence: 'low' as const, warnings: [] };
        });

      const materialSource = description ?? html;
      const materials = extractMaterials(materialSource);
      const dimensions = extractDimensions(
        Object.values(specificationTable).find((v) => /\d+\s*(?:cm|mm|in)/.test(v))
        ?? description
        ?? html,
      );
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
        supportLevel: this.supportLevel,
        overallConfidence: Number(confidence.toFixed(2)),
        scrapeTimestamp: new Date().toISOString(),
        title,
        description,
        longDescription,
        categoryHint,
        materials,
        dimensions,
        price,
        images: uniqueImages,
        specificationTable: Object.keys(specificationTable).length > 0 ? specificationTable : undefined,
        pageRegions,
        warnings,
        failureReasons,
        jsonLdRaw: productJsonLd ?? undefined,
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
        supportLevel: this.supportLevel,
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
