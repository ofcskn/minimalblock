import type { ScrapedPageData } from '@minimalblock/core';
import { GenericHtmlAdapter } from './generic.adapter.js';

export class AmazonAdapter extends GenericHtmlAdapter {
  override readonly supportLevel = 'supported' as const;

  override canHandle(url: URL): boolean {
    return /amazon\.(com|co\.uk|de|fr|it|es|co\.jp|ca|com\.au)$/.test(url.hostname.toLowerCase().replace(/^www\./, ''));
  }

  override async scrape(url: URL): Promise<ScrapedPageData> {
    const base = await super.scrape(url);
    return base;
  }
}
