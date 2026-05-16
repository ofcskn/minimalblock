-- 004_events.sql
-- Analytics event log for 3D product interactions.

CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_owner_id    ON events(owner_id);
CREATE INDEX IF NOT EXISTS idx_events_product_id  ON events(product_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type  ON events(event_type);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_owner_select" ON events FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "events_owner_insert" ON events FOR INSERT WITH CHECK (auth.uid() = owner_id);
