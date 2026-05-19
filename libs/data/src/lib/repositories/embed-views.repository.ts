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
    const { data } = await this.client.rpc('get_embed_domains_for_owner', {
      p_owner_id: ownerId,
      p_limit: 10,
    });
    if (!data) return [];
    return (data as { domain: string; view_count: number }[]).map(({ domain, view_count }) => ({
      domain,
      count: view_count,
    }));
  }
}
