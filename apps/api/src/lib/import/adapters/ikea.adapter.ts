import type { ScrapedPageData } from '@minimalblock/core';
import { GenericHtmlAdapter } from './generic.adapter.js';

export class IkeaAdapter extends GenericHtmlAdapter {
  override readonly supportLevel = 'supported' as const;

  override canHandle(url: URL): boolean {
    return /ikea\.(com|co\.uk|de|fr|it|es|se|no|dk|fi|nl|be|at|ch|pl|pt|cz|sk|hu|ro|hr|si|rs|au|cn|jp|kr|ae|sa)$/.test(
      url.hostname.toLowerCase().replace(/^www\./, ''),
    );
  }

  override async scrape(url: URL): Promise<ScrapedPageData> {
    const base = await super.scrape(url);
    return base;
  }
}
