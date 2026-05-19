import type { IPageScraperAdapter, ScrapedPageData } from '@minimalblock/core';

function normalizeDomain(url: URL): string {
  return url.hostname.toLowerCase().replace(/^www\./, '');
}

function buildMockDataUrl(label: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" font-family="Arial" font-size="84" text-anchor="middle" fill="#ffffff">${label}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export class MockAdapter implements IPageScraperAdapter {
  readonly supportLevel = 'mock' as const;

  canHandle(url: URL): boolean {
    return normalizeDomain(url) === 'minimalblock.demo';
  }

  async scrape(url: URL): Promise<ScrapedPageData> {
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
        categoryHint: 'electronics',
        materials: ['aluminum'],
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

    if (pathname.includes('multi-product')) {
      return {
        sourceUrl: url.toString(),
        domain: normalizeDomain(url),
        extractionMethod: 'mock_scraper',
        supportLevel: 'mock',
        overallConfidence: 0.88,
        scrapeTimestamp: now,
        title: 'Home Office Bundle — Desk & Chair',
        description: 'Complete home office setup featuring a solid oak desk and ergonomic mesh chair.',
        categoryHint: 'furniture',
        materials: ['wood', 'metal', 'mesh fabric'],
        dimensions: 'Desk: 140 cm x 70 cm x 75 cm | Chair: 60 cm x 60 cm x 110 cm',
        price: '$699',
        warnings: ['Page contains multiple distinct products.'],
        failureReasons: [],
        images: [
          { sourceUrl: buildMockDataUrl('Desk Front', '#3d405b'), ordinal: 0, confidence: 'high', warnings: [], widthPx: 1200, heightPx: 1200 },
          { sourceUrl: buildMockDataUrl('Desk Side', '#4f5d75'), ordinal: 1, confidence: 'high', warnings: [], widthPx: 1200, heightPx: 1200 },
          { sourceUrl: buildMockDataUrl('Chair Front', '#81b29a'), ordinal: 2, confidence: 'high', warnings: [], widthPx: 1200, heightPx: 1200 },
          { sourceUrl: buildMockDataUrl('Chair Side', '#a8c5b5'), ordinal: 3, confidence: 'high', warnings: [], widthPx: 1200, heightPx: 1200 },
        ],
        raw: { mockScenario: 'multi-product-desk-chair' },
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
