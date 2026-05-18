-- ============================================================
-- Phase 0 — URL import workflow + provenance on products
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS workflow_status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS input_method TEXT NOT NULL DEFAULT 'manual_upload',
  ADD COLUMN IF NOT EXISTS import_data JSONB;
