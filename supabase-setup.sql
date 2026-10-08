-- ============================================================================
--  Leo's — Supabase setup script
--  Paste this into: Supabase Dashboard → SQL Editor → New query → Run
--
--  This creates all 4 tables. You only need to run it ONCE.
--  (Alternative: run `npx drizzle-kit push` from your computer — both work.)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. PRODUCTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "products" (
  "id"                 serial PRIMARY KEY,
  "slug"               varchar(200) NOT NULL UNIQUE,
  "name"               text NOT NULL,
  "description"        text NOT NULL DEFAULT '',
  "category"           varchar(50)  NOT NULL DEFAULT 'tshirt', -- tshirt | hoodie
  "price"              integer NOT NULL,                         -- in DZD
  "compare_at_price"   integer,                                  -- original price (for -X% badge)
  "images"             jsonb NOT NULL DEFAULT '[]'::jsonb,        -- array of image URLs
  "sizes"              jsonb NOT NULL DEFAULT '[]'::jsonb,        -- ["S","M","L","XL","2XL"]
  "colors"             jsonb NOT NULL DEFAULT '[]'::jsonb,        -- ["Black","White",...]
  "stock"              integer NOT NULL DEFAULT 0,
  "featured"           boolean NOT NULL DEFAULT false,            -- show on home page
  "active"             boolean NOT NULL DEFAULT true,             -- visible in store
  "is_combo"           boolean NOT NULL DEFAULT false,            -- is a bundle
  "combo_product_ids"  jsonb NOT NULL DEFAULT '[]'::jsonb,        -- products included in the combo
  "combo_price"        integer,                                   -- combo price
  "upsell_product_id"  integer,                                   -- offered as an add-on checkbox
  "created_at"         timestamptz NOT NULL DEFAULT now(),
  "updated_at"         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "products_active_idx"      ON "products" ("active");
CREATE INDEX IF NOT EXISTS "products_category_idx"    ON "products" ("category");
CREATE INDEX IF NOT EXISTS "products_featured_idx"    ON "products" ("featured");

-- ---------------------------------------------------------------------------
-- 2. ORDERS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "orders" (
  "id"              serial PRIMARY KEY,
  "order_number"    varchar(40) NOT NULL UNIQUE,
  "customer_name"   text NOT NULL,
  "phone"           varchar(40) NOT NULL,
  "wilaya"          varchar(120) NOT NULL,
  "address"         text NOT NULL,
  "items"           jsonb NOT NULL DEFAULT '[]'::jsonb,  -- snapshot of ordered items
  "subtotal"        integer NOT NULL DEFAULT 0,
  "shipping_fee"    integer NOT NULL DEFAULT 0,
  "discount"        integer NOT NULL DEFAULT 0,
  "coupon_code"     varchar(60),
  "total"           integer NOT NULL DEFAULT 0,
  "status"          varchar(30) NOT NULL DEFAULT 'pending',
  -- pending | confirmed | shipped | delivered | cancelled
  "payment_method"  varchar(30) NOT NULL DEFAULT 'cod',
  "whatsapp_sent"   boolean NOT NULL DEFAULT false,
  "notes"           text NOT NULL DEFAULT '',
  "created_at"      timestamptz NOT NULL DEFAULT now(),
  "updated_at"      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "orders_status_idx"   ON "orders" ("status");
CREATE INDEX IF NOT EXISTS "orders_created_idx"  ON "orders" ("created_at" DESC);

-- ---------------------------------------------------------------------------
-- 3. COUPONS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "coupons" (
  "id"           serial PRIMARY KEY,
  "code"         varchar(60) NOT NULL UNIQUE,
  "type"         varchar(20) NOT NULL DEFAULT 'percent', -- percent | amount
  "value"        integer NOT NULL,
  "min_order"    integer NOT NULL DEFAULT 0,
  "usage_limit"  integer,
  "used_count"   integer NOT NULL DEFAULT 0,
  "active"       boolean NOT NULL DEFAULT true,
  "expires_at"   timestamptz,
  "created_at"   timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 4. SETTINGS (single row, id = 1)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "settings" (
  "id"                       integer PRIMARY KEY, -- always 1
  "store_name"               text NOT NULL DEFAULT 'Leo''s',
  "store_tagline"            text NOT NULL DEFAULT 'Fits oversized. Livraison dans toute l''Algérie.',
  "whatsapp_number"          varchar(40) NOT NULL DEFAULT '213550000000',
  "delivery_company"         text NOT NULL DEFAULT 'Leo''s Delivery',
  "delivery_base_fee"        integer NOT NULL DEFAULT 800,
  "free_shipping_threshold"  integer NOT NULL DEFAULT 12000,
  "wilaya_fees"              jsonb NOT NULL DEFAULT '{}'::jsonb,
  "currency"                 varchar(10) NOT NULL DEFAULT 'DZD',
  "facebook_pixel_id"        varchar(40) NOT NULL DEFAULT '',
  "tiktok_pixel_id"          varchar(40) NOT NULL DEFAULT '',
  "announcement"             text NOT NULL DEFAULT '',
  "updated_at"               timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
--  5. STARTER DATA
--     A settings row + a demo coupon so the store works right away.
--     (Run the app's /api/seed afterwards to also add 8 demo products,
--      or add your own products from the admin panel.)
-- ============================================================================

INSERT INTO "settings" (
  "id", "store_name", "store_tagline", "whatsapp_number",
  "delivery_company", "delivery_base_fee", "free_shipping_threshold",
  "wilaya_fees", "currency", "announcement"
)
VALUES (
  1,
  'Leo''s',
  'Fits oversized. Livraison dans toute l''Algérie.',
  '213550000000',
  'Leo''s Delivery',
  800,
  12000,
  '{"Alger":600,"Blida":600,"Boumerdès":600,"Tipaza":650,"Tizi Ouzou":650,"Oran":700,"Constantine":700,"Sétif":700,"Annaba":750,"Batna":750}'::jsonb,
  'DZD',
  '🚚 Livraison offerte dès 12 000 DA — dans les 58 wilayas !'
)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "coupons" ("code", "type", "value", "min_order", "usage_limit", "active")
VALUES ('LEO10', 'percent', 10, 0, 200, true)
ON CONFLICT ("code") DO NOTHING;

-- ============================================================================
--  DONE ✅
--  Next: add your real products in the admin panel (/admin).
-- ============================================================================
