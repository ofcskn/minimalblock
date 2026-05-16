-- ============================================================
-- Phase 2 — Commerce-oriented category migration
-- ============================================================

UPDATE products
SET category = CASE category
  WHEN 'house' THEN 'home-decor'
  WHEN 'furniture' THEN 'furniture'
  WHEN 'vehicle' THEN 'other'
  WHEN 'appliance' THEN 'other'
  ELSE 'other'
END
WHERE category IN ('house', 'furniture', 'vehicle', 'appliance', 'other');
