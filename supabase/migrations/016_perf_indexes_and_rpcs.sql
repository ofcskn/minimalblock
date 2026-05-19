-- Performance indexes and PostgreSQL RPC functions to replace client-side JS aggregation.

-- Composite index: speeds up getStatsForOwner and getHotspotStatsForOwner
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_owner_type_created
  ON events(owner_id, event_type, created_at DESC);

-- Composite index for generation_feedback lookups by conversion
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_generation_feedback_conversion
  ON generation_feedback(conversion_id);

-- ---------------------------------------------------------------------------
-- RPC: get_stats_for_owner
-- Replaces JS aggregation in SupabaseEventsRepository.getStatsForOwner
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_stats_for_owner(p_owner_id uuid)
RETURNS TABLE(product_id uuid, event_type text, event_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    e.product_id,
    e.event_type,
    COUNT(*)::bigint AS event_count
  FROM events e
  WHERE e.owner_id = p_owner_id
  GROUP BY e.product_id, e.event_type;
$$;

-- ---------------------------------------------------------------------------
-- RPC: get_hotspot_stats_for_owner
-- Replaces JS aggregation in SupabaseEventsRepository.getHotspotStatsForOwner
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_hotspot_stats_for_owner(p_owner_id uuid)
RETURNS TABLE(product_id uuid, hotspot_label text, click_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    e.product_id,
    (e.metadata->>'hotspot_label') AS hotspot_label,
    COUNT(*)::bigint AS click_count
  FROM events e
  WHERE e.owner_id = p_owner_id
    AND e.event_type = 'hotspot_clicked'
    AND e.metadata->>'hotspot_label' IS NOT NULL
  GROUP BY e.product_id, e.metadata->>'hotspot_label';
$$;

-- ---------------------------------------------------------------------------
-- RPC: get_avg_session_duration
-- Replaces JS aggregation in SupabaseEventsRepository.getAvgSessionDuration
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_avg_session_duration(p_owner_id uuid)
RETURNS TABLE(product_id uuid, avg_duration_ms bigint)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    e.product_id,
    AVG((e.metadata->>'duration_ms')::bigint)::bigint AS avg_duration_ms
  FROM events e
  WHERE e.owner_id = p_owner_id
    AND e.event_type = 'session_ended'
    AND e.metadata->>'duration_ms' IS NOT NULL
  GROUP BY e.product_id;
$$;

-- ---------------------------------------------------------------------------
-- RPC: get_embed_domains_for_owner
-- Replaces 2-query + JS aggregation in SupabaseEmbedViewsRepository.getDomainsForOwner
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_embed_domains_for_owner(p_owner_id uuid, p_limit integer DEFAULT 10)
RETURNS TABLE(domain text, view_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    ev.domain,
    COUNT(*)::bigint AS view_count
  FROM embed_views ev
  JOIN products p ON p.id = ev.product_id
  WHERE p.owner_id = p_owner_id
    AND ev.domain IS NOT NULL
  GROUP BY ev.domain
  ORDER BY view_count DESC
  LIMIT p_limit;
$$;
