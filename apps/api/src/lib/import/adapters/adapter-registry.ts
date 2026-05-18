import type { IPageScraperAdapter } from '@minimalblock/core';
import { MockAdapter } from './mock.adapter.js';
import { AmazonAdapter } from './amazon.adapter.js';
import { IkeaAdapter } from './ikea.adapter.js';
import { GenericHtmlAdapter } from './generic.adapter.js';

function normalizeDomain(url: URL): string {
  return url.hostname.toLowerCase().replace(/^www\./, '');
}

const SUPPORTED_DOMAINS = new Set(['amazon.com', 'etsy.com', 'ikea.com', 'trendyol.com']);

export class ScraperAdapterRegistry {
  private readonly adapters: IPageScraperAdapter[];

  constructor() {
    this.adapters = [
      new MockAdapter(),
      new AmazonAdapter(),
      new IkeaAdapter(),
    ];
  }

  resolve(url: URL): IPageScraperAdapter {
    const found = this.adapters.find((adapter) => adapter.canHandle(url));
    if (found) return found;
    const domain = normalizeDomain(url);
    const level = SUPPORTED_DOMAINS.has(domain) ? 'supported' : 'best_effort';
    return new GenericHtmlAdapter(level);
  }
}
