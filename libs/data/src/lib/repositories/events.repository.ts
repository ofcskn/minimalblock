import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/database.types.js';

export type EventType =
  | 'viewer_loaded'
  | 'model_rotated'
  | 'ar_opened'
  | 'hotspot_clicked'
  | 'embed_copied';

export interface ProductStats {
  productId: string;
  counts: Record<EventType, number>;
  total: number;
}

export class SupabaseEventsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async track(productId: string, ownerId: string, eventType: EventType): Promise<void> {
    await this.client.from('events').insert({ product_id: productId, owner_id: ownerId, event_type: eventType });
  }

  async getStatsForOwner(ownerId: string): Promise<ProductStats[]> {
    const { data } = await this.client
      .from('events')
      .select('product_id, event_type')
      .eq('owner_id', ownerId);

    if (!data) return [];

    const map = new Map<string, Record<string, number>>();
    for (const row of data) {
      if (!map.has(row.product_id)) map.set(row.product_id, {});
      const counts = map.get(row.product_id)!;
      counts[row.event_type] = (counts[row.event_type] ?? 0) + 1;
    }

    return Array.from(map.entries()).map(([productId, counts]) => ({
      productId,
      counts: counts as Record<EventType, number>,
      total: Object.values(counts).reduce((s, n) => s + n, 0),
    }));
  }
}
