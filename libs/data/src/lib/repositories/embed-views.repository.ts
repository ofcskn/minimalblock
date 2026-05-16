import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/database.types.js';

export interface EmbedDomainStat {
  domain: string;
  count: number;
}

export class SupabaseEmbedViewsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async track(productId: string, referrer: string | null): Promise<void> {
    let domain: string | null = null;
    if (referrer) {
      try { domain = new URL(referrer).hostname; } catch { /* invalid referrer URL */ }
    }
    await this.client.from('embed_views').insert({ product_id: productId, referrer, domain });
  }

  async getDomainsForOwner(ownerId: string): Promise<EmbedDomainStat[]> {
    const { data: products } = await this.client
      .from('products')
      .select('id')
      .eq('owner_id', ownerId);

    if (!products || products.length === 0) return [];

    const productIds = products.map(p => p.id);
    const { data } = await this.client
      .from('embed_views')
      .select('domain')
      .in('product_id', productIds)
      .not('domain', 'is', null);

    if (!data) return [];

    const counts: Record<string, number> = {};
    for (const row of data) {
      if (row.domain) counts[row.domain] = (counts[row.domain] ?? 0) + 1;
    }

    return Object.entries(counts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}
