-- 002_hotspots.sql
-- Adds JSONB hotspot annotations to products.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS hotspots JSONB NOT NULL DEFAULT '[]';
