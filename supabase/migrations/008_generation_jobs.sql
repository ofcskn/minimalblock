-- ============================================================
-- Phase 2 — Generation jobs + approval workflow + quality
-- ============================================================

-- Postgres requires ALTER TYPE ... ADD VALUE to run outside a
-- multi-statement transaction. Each ADD VALUE is its own statement
-- so this migration must be applied with statement-level auto-commit
-- (supabase db push does this by default).

ALTER TYPE conversion_status ADD VALUE IF NOT EXISTS 'awaiting_approval';
ALTER TYPE conversion_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE conversion_status ADD VALUE IF NOT EXISTS 'rejected';

-- --------------------------------------------------------
-- conversions: approval + quality + provider columns
-- --------------------------------------------------------
ALTER TABLE conversions
  ADD COLUMN IF NOT EXISTS provider           TEXT,
  ADD COLUMN IF NOT EXISTS output_storage_key TEXT,
  ADD COLUMN IF NOT EXISTS quality_score      NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS quality_report     JSONB,
  ADD COLUMN IF NOT EXISTS approved_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason   TEXT;

-- Legacy single-asset columns become nullable so multi-image rows
-- can be persisted without a synthetic "primary" source asset.
ALTER TABLE conversions ALTER COLUMN source_asset_url  DROP NOT NULL;
ALTER TABLE conversions ALTER COLUMN source_asset_key  DROP NOT NULL;
ALTER TABLE conversions ALTER COLUMN source_asset_mime DROP NOT NULL;
ALTER TABLE conversions ALTER COLUMN source_asset_size DROP NOT NULL;

-- --------------------------------------------------------
-- Table: generation_jobs
-- One row per provider call. A conversion may have many jobs
-- (retries, provider failover).
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS generation_jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversion_id     UUID NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,
  owner_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL,            -- 'meshy' | 'tripo' | 'gemini' | 'mock'
  provider_job_id   TEXT,                     -- external id, null until submit returns
  status            TEXT NOT NULL DEFAULT 'queued',
                    -- 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'
  attempt           INTEGER NOT NULL DEFAULT 1,
  cost_credits      INTEGER,
  error_message     TEXT,
  request_payload   JSONB,
  response_payload  JSONB,
  started_at        TIMESTAMPTZ,
  finished_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT generation_jobs_status_chk
    CHECK (status IN ('queued','running','succeeded','failed','cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_conversion_id ON generation_jobs(conversion_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_owner_id      ON generation_jobs(owner_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status        ON generation_jobs(status);

ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "generation_jobs_owner_select" ON generation_jobs
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "generation_jobs_owner_insert" ON generation_jobs
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "generation_jobs_owner_update" ON generation_jobs
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "generation_jobs_owner_delete" ON generation_jobs
  FOR DELETE USING (auth.uid() = owner_id);
