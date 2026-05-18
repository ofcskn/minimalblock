-- Phase I: Generation feedback loop
-- Records approval/rejection signals per generated model to enable future
-- few-shot prompt improvement by subtype.

CREATE TABLE IF NOT EXISTS generation_feedback (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           UUID        NOT NULL,
  conversion_id        UUID        NOT NULL,
  owner_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal               TEXT        NOT NULL CHECK (signal IN ('approved', 'rejected', 'regenerated')),
  rejection_reason     TEXT,
  detected_subtype     TEXT        NOT NULL DEFAULT 'other',
  geometry_family      TEXT        NOT NULL DEFAULT 'hard-surface',
  qa_score             NUMERIC,
  validation_score     NUMERIC,
  scene_graph_snapshot JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generation_feedback_subtype ON generation_feedback (detected_subtype);
CREATE INDEX IF NOT EXISTS idx_generation_feedback_signal  ON generation_feedback (signal);
CREATE INDEX IF NOT EXISTS idx_generation_feedback_owner   ON generation_feedback (owner_id);

-- Row-level security: owners can only see their own feedback records
ALTER TABLE generation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners can read own feedback"
  ON generation_feedback FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "service role can insert feedback"
  ON generation_feedback FOR INSERT
  WITH CHECK (true);
