-- Brand identity tables: one brand per user with logos and colors

CREATE TABLE IF NOT EXISTS brands (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid        NOT NULL,
  name        text        NOT NULL DEFAULT '',
  description text        NOT NULL DEFAULT '',
  website     text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id)
);

CREATE TABLE IF NOT EXISTS brand_logos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id    uuid        NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  owner_id    uuid        NOT NULL,
  storage_key text        NOT NULL,
  public_url  text        NOT NULL,
  name        text        NOT NULL DEFAULT '',
  ordinal     integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS brand_colors (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id    uuid        NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  owner_id    uuid        NOT NULL,
  hex         text        NOT NULL,
  name        text        NOT NULL DEFAULT '',
  ordinal     integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE brands       ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_logos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_brand"
  ON brands FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "own_brand_logos"
  ON brand_logos FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "own_brand_colors"
  ON brand_colors FOR ALL USING (auth.uid() = owner_id);
