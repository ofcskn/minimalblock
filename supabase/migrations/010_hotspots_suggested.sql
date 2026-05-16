-- ============================================================
-- Phase 2 — AI-suggested hotspots on products
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS hotspots_suggested    JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hotspots_suggested_at TIMESTAMPTZ;
