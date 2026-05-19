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
  | 'import_url_submitted'
  | 'import_scrape_started'
  | 'import_scrape_completed'
  | 'import_scrape_failed'
  | 'import_images_extracted'
  | 'import_images_selected'
  | 'import_autofill_completed'
  | 'import_fields_edited'
  | 'import_moved_to_source_readiness'
  | 'import_manual_fallback_used'
  | 'hotspot_suggestion_accepted'
  | 'conversion_approved'
  | 'conversion_rejected'
  | 'product_published'
  | 'product_approved'
  | 'product_approved_with_override';

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
    const { data } = await this.client.rpc('get_stats_for_owner', { p_owner_id: ownerId });
    if (!data) return [];

    const map = new Map<string, Record<string, number>>();
    for (const row of data as { product_id: string; event_type: string; event_count: number }[]) {
      if (!map.has(row.product_id)) map.set(row.product_id, {});
      map.get(row.product_id)![row.event_type] = row.event_count;
    }

    return Array.from(map.entries()).map(([productId, counts]) => ({
      productId,
      counts: counts as Record<EventType, number>,
      total: Object.values(counts).reduce((s, n) => s + n, 0),
    }));
  }

  async getHotspotStatsForOwner(ownerId: string): Promise<Record<string, HotspotStat[]>> {
    const { data } = await this.client.rpc('get_hotspot_stats_for_owner', { p_owner_id: ownerId });
    if (!data) return {};

    const byProduct: Record<string, Record<string, number>> = {};
    for (const row of data as { product_id: string; hotspot_label: string; click_count: number }[]) {
      if (!byProduct[row.product_id]) byProduct[row.product_id] = {};
      byProduct[row.product_id][row.hotspot_label] = row.click_count;
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
    const { data } = await this.client.rpc('get_avg_session_duration', { p_owner_id: ownerId });
    if (!data) return {};

    return Object.fromEntries(
      (data as { product_id: string; avg_duration_ms: number }[])
        .map(({ product_id, avg_duration_ms }) => [product_id, avg_duration_ms]),
    );
  }
}
