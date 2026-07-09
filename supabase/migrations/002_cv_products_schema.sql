-- Compraventa Harry — esquema con prefijo cv_
-- El proyecto Supabase se comparte con otra app que ya usa las tablas
-- products / categories / orders, por eso todas las tablas de esta app
-- llevan el prefijo cv_ y el bucket se llama cv-product-images.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE cv_product_status AS ENUM ('borrador', 'publicado', 'vendido', 'reservado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE cv_product_type AS ENUM ('vehiculo', 'oro', 'tramite', 'divisa', 'servicio');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS cv_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type cv_product_type NOT NULL DEFAULT 'vehiculo',
  status cv_product_status NOT NULL DEFAULT 'borrador',
  price TEXT,
  price_numeric NUMERIC(14, 2),
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cv_product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES cv_products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cv_admin_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE cv_admin_users IS 'Allowlist de emails admin de Compraventa Harry. Insertar: INSERT INTO cv_admin_users (email) VALUES (''tu@email.com'');';

CREATE INDEX IF NOT EXISTS idx_cv_products_status ON cv_products(status);
CREATE INDEX IF NOT EXISTS idx_cv_products_type ON cv_products(type);
CREATE INDEX IF NOT EXISTS idx_cv_products_created_at ON cv_products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cv_product_images_product_id ON cv_product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_cv_product_images_sort ON cv_product_images(product_id, sort_order);

CREATE OR REPLACE FUNCTION cv_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cv_products_updated_at ON cv_products;
CREATE TRIGGER cv_products_updated_at
  BEFORE UPDATE ON cv_products
  FOR EACH ROW EXECUTE FUNCTION cv_set_updated_at();

CREATE OR REPLACE FUNCTION cv_is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM cv_admin_users
    WHERE email = (auth.jwt() ->> 'email')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

ALTER TABLE cv_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published cv products" ON cv_products;
CREATE POLICY "Public read published cv products" ON cv_products
  FOR SELECT USING (status = 'publicado');

DROP POLICY IF EXISTS "Public read images of published cv products" ON cv_product_images;
CREATE POLICY "Public read images of published cv products" ON cv_product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cv_products p
      WHERE p.id = cv_product_images.product_id AND p.status = 'publicado'
    )
  );

DROP POLICY IF EXISTS "CV admin full access products" ON cv_products;
CREATE POLICY "CV admin full access products" ON cv_products
  FOR ALL TO authenticated USING (cv_is_admin()) WITH CHECK (cv_is_admin());

DROP POLICY IF EXISTS "CV admin full access images" ON cv_product_images;
CREATE POLICY "CV admin full access images" ON cv_product_images
  FOR ALL TO authenticated USING (cv_is_admin()) WITH CHECK (cv_is_admin());

DROP POLICY IF EXISTS "CV admin read allowlist" ON cv_admin_users;
CREATE POLICY "CV admin read allowlist" ON cv_admin_users
  FOR SELECT TO authenticated USING (true);

-- Storage bucket propio
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-product-images', 'cv-product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read cv product images" ON storage.objects;
CREATE POLICY "Public read cv product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'cv-product-images');

DROP POLICY IF EXISTS "CV admin upload product images" ON storage.objects;
CREATE POLICY "CV admin upload product images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cv-product-images' AND cv_is_admin());

DROP POLICY IF EXISTS "CV admin delete product images" ON storage.objects;
CREATE POLICY "CV admin delete product images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'cv-product-images' AND cv_is_admin());
