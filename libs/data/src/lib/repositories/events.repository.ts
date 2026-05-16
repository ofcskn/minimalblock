import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/database.types.js';

export type EventType =
  | 'viewer_loaded'
  | 'model_rotated'
  | 'ar_opened'
  | 'hotspot_clicked'
  | 'embed_copied'
  | 'session_started'
  | 'session_ended'
  | 'ai_analysis_started'
  | 'ai_analysis_completed'
  | 'hotspot_suggestion_accepted'
  | 'conversion_approved'
  | 'conversion_rejected'
  | 'product_published';

export interface ProductStats {
  productId: string;
  counts: Record<EventType, number>;
  total: number;
}

export interface HotspotStat {
  label: string;
  count: number;
}

export class SupabaseEventsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async track(
    productId: string,
    ownerId: string,
    eventType: EventType,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.client.from('events').insert({
      product_id: productId,
      owner_id: ownerId,
      event_type: eventType,
      ...(metadata ? { metadata: metadata as import('../supabase/database.types.js').Json } : {}),
    });
  }

  async getViewCount(productId: string): Promise<number> {
    const { count } = await this.client
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('event_type', 'viewer_loaded');
    return count ?? 0;
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

  async getHotspotStatsForOwner(ownerId: string): Promise<Record<string, HotspotStat[]>> {
    const { data } = await this.client
      .from('events')
      .select('product_id, metadata')
      .eq('owner_id', ownerId)
      .eq('event_type', 'hotspot_clicked');

    if (!data) return {};

    const byProduct: Record<string, Record<string, number>> = {};
    for (const row of data) {
      const label = (row.metadata as Record<string, string> | null)?.hotspot_label;
      if (!label) continue;
      if (!byProduct[row.product_id]) byProduct[row.product_id] = {};
      byProduct[row.product_id][label] = (byProduct[row.product_id][label] ?? 0) + 1;
    }

    const result: Record<string, HotspotStat[]> = {};
    for (const [pid, labelCounts] of Object.entries(byProduct)) {
      result[pid] = Object.entries(labelCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);
    }
    return result;
  }

  async getAvgSessionDuration(ownerId: string): Promise<Record<string, number>> {
    const { data } = await this.client
      .from('events')
      .select('product_id, metadata')
      .eq('owner_id', ownerId)
      .eq('event_type', 'session_ended');

    if (!data) return {};

    const totals: Record<string, { sum: number; count: number }> = {};
    for (const row of data) {
      const ms = (row.metadata as Record<string, number> | null)?.duration_ms;
      if (!ms) continue;
      if (!totals[row.product_id]) totals[row.product_id] = { sum: 0, count: 0 };
      totals[row.product_id].sum += ms;
      totals[row.product_id].count += 1;
    }

    return Object.fromEntries(
      Object.entries(totals).map(([pid, { sum, count }]) => [pid, Math.round(sum / count)])
    );
  }
}
