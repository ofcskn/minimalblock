-- 001_initial_schema.sql
-- Core schema for 3D generative media app

CREATE TYPE conversion_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE conversions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  owner_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_asset_url    TEXT NOT NULL,
  source_asset_key    TEXT NOT NULL,
  source_asset_mime   TEXT NOT NULL,
  source_asset_size   BIGINT NOT NULL,
  output_asset_url    TEXT,
  output_asset_key    TEXT,
  output_asset_mime   TEXT,
  output_asset_size   BIGINT,
  status              conversion_status NOT NULL DEFAULT 'pending',
  error_message       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_products_owner_id ON products(owner_id);
CREATE INDEX idx_conversions_owner_id ON conversions(owner_id);
CREATE INDEX idx_conversions_product_id ON conversions(product_id);
CREATE INDEX idx_conversions_status ON conversions(status);

-- RLS: Users can only access their own rows
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_owner_select" ON products FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "products_owner_insert" ON products FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "products_owner_update" ON products FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "products_owner_delete" ON products FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "conversions_owner_select" ON conversions FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "conversions_owner_insert" ON conversions FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "conversions_owner_update" ON conversions FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "conversions_owner_delete" ON conversions FOR DELETE USING (auth.uid() = owner_id);

-- Storage: media-assets bucket (owner-scoped)
INSERT INTO storage.buckets (id, name, public) VALUES ('media-assets', 'media-assets', true);

CREATE POLICY "media_assets_owner_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "media_assets_owner_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'media-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "media_assets_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'media-assets');
