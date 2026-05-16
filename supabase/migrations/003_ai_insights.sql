-- 003_ai_insights.sql
-- Stores AI-generated return-risk recommendations on products.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS ai_insights JSONB;
