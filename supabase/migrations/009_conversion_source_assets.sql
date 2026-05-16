-- ============================================================
-- Phase 2 — Multi-image source assets per conversion
-- ============================================================

CREATE TABLE IF NOT EXISTS conversion_source_assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversion_id UUID NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,
  owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  storage_key   TEXT NOT NULL,
  mime          TEXT NOT NULL,
  size_bytes    BIGINT NOT NULL,
  ordinal       INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT conversion_source_assets_ordinal_chk CHECK (ordinal >= 0 AND ordinal < 8)
);

CREATE INDEX IF NOT EXISTS idx_csa_conversion_ordinal
  ON conversion_source_assets(conversion_id, ordinal);

ALTER TABLE conversion_source_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "csa_owner_select" ON conversion_source_assets
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "csa_owner_insert" ON conversion_source_assets
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "csa_owner_update" ON conversion_source_assets
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "csa_owner_delete" ON conversion_source_assets
  FOR DELETE USING (auth.uid() = owner_id);
