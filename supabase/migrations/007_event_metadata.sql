-- 007_event_metadata.sql
-- Add JSONB metadata column to events for rich per-event context
-- (hotspot id/label, session id, duration_ms, etc.).

ALTER TABLE events ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Index for querying hotspot click metadata efficiently.
CREATE INDEX IF NOT EXISTS idx_events_type_product ON events(event_type, product_id);
