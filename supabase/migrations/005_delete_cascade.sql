-- 005_delete_cascade.sql
-- Add category indices for efficient gallery filtering.
-- conversions and events already declare ON DELETE CASCADE on products(id).

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_owner_category ON products(owner_id, category);
