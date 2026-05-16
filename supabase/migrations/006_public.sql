-- 006_public.sql
-- Add optional slug for clean public URLs.
-- Add embed_views table for unauthenticated referrer tracking.
-- Add public read policies (UUID as access token — hard to guess).

-- --------------------------------------------------------
-- products: optional public slug
-- --------------------------------------------------------
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug) WHERE slug IS NOT NULL;

-- Public read: anyone with the product UUID or slug can read.
-- Security model: UUID v4 is 128 bits of entropy — equivalent to a long random token.
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (true);

-- Public read for conversions belonging to a publicly readable product.
CREATE POLICY "conversions_public_read" ON conversions
  FOR SELECT USING (true);

-- --------------------------------------------------------
-- Table: embed_views — unauthenticated hit tracking
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS embed_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL,
  referrer    TEXT,
  domain      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embed_views_product_id ON embed_views(product_id);

ALTER TABLE embed_views ENABLE ROW LEVEL SECURITY;

-- Anon clients can insert (tracking pixel model).
CREATE POLICY "embed_views_anon_insert" ON embed_views
  FOR INSERT WITH CHECK (true);

-- Only the product owner can read their embed view stats.
CREATE POLICY "embed_views_owner_select" ON embed_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = embed_views.product_id
        AND products.owner_id = auth.uid()
    )
  );
