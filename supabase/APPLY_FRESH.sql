-- =============================================================================
-- TRESSÉ HAIR — ONE-SHOT fresh apply (reset + full schema)
-- Paste this ENTIRE file into SQL Editor and Run once.
-- =============================================================================

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- =============================================================================
-- TRESSÃ‰ HAIR â€” Database Extensions & Custom Types
-- Run in Supabase SQL Editor or via: supabase db push
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- fuzzy search

-- Product & merchandising
CREATE TYPE product_badge AS ENUM ('new', 'sale', 'bestseller', 'trending');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');

-- Orders & fulfillment
CREATE TYPE order_status AS ENUM (
  'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'partially_refunded'
);
CREATE TYPE payment_status AS ENUM ('pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE fulfillment_status AS ENUM ('unfulfilled', 'partial', 'fulfilled', 'returned');
CREATE TYPE return_status AS ENUM ('requested', 'approved', 'rejected', 'received', 'refunded');

-- Staff & support
CREATE TYPE staff_role AS ENUM ('admin', 'customer_service', 'warehouse', 'marketing');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');

-- Marketing
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed_amount', 'free_shipping');
CREATE TYPE discount_target AS ENUM ('order', 'product', 'collection', 'shipping');

-- Content
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TYPE address_type AS ENUM ('shipping', 'billing', 'both');

-- Wig-specific enums
CREATE TYPE hair_type AS ENUM ('human_hair', 'synthetic', 'blend');
CREATE TYPE hair_origin AS ENUM ('brazilian', 'vietnamese', 'burmese', 'indian', 'peruvian', 'malaysian', 'other');
CREATE TYPE hair_texture AS ENUM (
  'straight', 'body_wave', 'deep_wave', 'curly', 'kinky_straight',
  'water_wave', 'loose_wave', 'pixie_curls', 'burmese_curls', 'bone_straight', 'other'
);
CREATE TYPE lace_type AS ENUM ('hd_lace', 'swiss_lace', 'full_lace', 'lace_front', 'transparent_lace', 'none');


-- >>> END 00001_extensions_and_enums.sql <<<

-- =============================================================================
-- TRESSÃ‰ HAIR â€” Core Tables: Users, Catalog, Wig Specs
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PROFILES (extends auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  accepts_marketing BOOLEAN NOT NULL DEFAULT false,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  store_credit_cents INTEGER NOT NULL DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_blacklisted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);

-- ---------------------------------------------------------------------------
-- STAFF ROLES
-- ---------------------------------------------------------------------------
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  role staff_role NOT NULL DEFAULT 'customer_service',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_logs_staff ON activity_logs(staff_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- ---------------------------------------------------------------------------
-- CATEGORIES (nested navigation)
-- ---------------------------------------------------------------------------
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- ---------------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------------
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  base_price_cents INTEGER NOT NULL,
  compare_at_price_cents INTEGER,
  sku TEXT UNIQUE,
  badge product_badge,
  status product_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  sales_count INTEGER NOT NULL DEFAULT 0,
  popularity_score INTEGER NOT NULL DEFAULT 0,
  care_instructions TEXT,
  return_policy TEXT,
  video_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_badge ON products(badge);
CREATE INDEX idx_products_price ON products(base_price_cents);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'')));

-- ---------------------------------------------------------------------------
-- WIG-SPECIFIC PRODUCT SPECS
-- ---------------------------------------------------------------------------
CREATE TABLE product_specs (
  product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  hair_type hair_type,
  hair_origin hair_origin,
  hair_grade TEXT, -- e.g. 10A, 9A
  texture hair_texture,
  material TEXT DEFAULT '100% Virgin Remy',
  brand TEXT DEFAULT 'TressÃ© Hair',
  lace_type lace_type,
  lace_size TEXT, -- e.g. 13x4, 13x6
  lace_color_options TEXT[] DEFAULT '{}',
  cap_construction TEXT,
  cap_size_options TEXT[] DEFAULT '{}',
  length_options TEXT[] DEFAULT '{}',
  density_options TEXT[] DEFAULT '{}',
  color_options TEXT[] DEFAULT '{}',
  bleached_knots BOOLEAN DEFAULT false,
  pre_plucked BOOLEAN DEFAULT false,
  glueless BOOLEAN DEFAULT false,
  beginner_friendly BOOLEAN DEFAULT false,
  ready_to_wear BOOLEAN DEFAULT false,
  baby_hair BOOLEAN DEFAULT false,
  elastic_band BOOLEAN DEFAULT false,
  adjustable_strap BOOLEAN DEFAULT false,
  color_customization BOOLEAN DEFAULT false,
  custom_sizing BOOLEAN DEFAULT false,
  processing_time TEXT DEFAULT '2-3 business days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_specs_hair_type ON product_specs(hair_type);
CREATE INDEX idx_product_specs_texture ON product_specs(texture);
CREATE INDEX idx_product_specs_glueless ON product_specs(glueless) WHERE glueless = true;

-- ---------------------------------------------------------------------------
-- PRODUCT VARIANTS
-- ---------------------------------------------------------------------------
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  length TEXT,
  density TEXT,
  color TEXT,
  cap_size TEXT,
  lace_color TEXT,
  price_cents INTEGER NOT NULL,
  compare_at_price_cents INTEGER,
  weight_grams INTEGER,
  barcode TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, length, density, color, cap_size, lace_color)
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);

-- ---------------------------------------------------------------------------
-- PRODUCT MEDIA
-- ---------------------------------------------------------------------------
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  storage_path TEXT,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

CREATE TABLE product_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  thumbnail_url TEXT,
  title TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- TAGS & COLLECTIONS
-- ---------------------------------------------------------------------------
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE product_tags (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE collection_products (
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

CREATE TABLE product_relations (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL DEFAULT 'related', -- related, upsell, cross_sell, frequently_bought
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, related_product_id),
  CHECK (product_id != related_product_id)
);

-- ---------------------------------------------------------------------------
-- INVENTORY
-- ---------------------------------------------------------------------------
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address_line1 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  country TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE inventory_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(variant_id, warehouse_id),
  CHECK (quantity >= 0),
  CHECK (reserved_quantity >= 0)
);

CREATE INDEX idx_inventory_variant ON inventory_levels(variant_id);

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  total_cents INTEGER,
  notes TEXT,
  ordered_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE inventory_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  change_quantity INTEGER NOT NULL,
  reason TEXT NOT NULL, -- sale, return, restock, adjustment, damage
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- >>> END 00002_core_catalog.sql <<<

-- =============================================================================
-- TRESSÃ‰ HAIR â€” Commerce: Cart, Checkout, Orders, Payments
-- =============================================================================

-- ---------------------------------------------------------------------------
-- CUSTOMER ADDRESSES
-- ---------------------------------------------------------------------------
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type address_type NOT NULL DEFAULT 'shipping',
  is_default BOOLEAN NOT NULL DEFAULT false,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ---------------------------------------------------------------------------
-- CARTS
-- ---------------------------------------------------------------------------
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT, -- guest cart
  coupon_code TEXT,
  gift_card_code TEXT,
  notes TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cart_id, variant_id)
);

CREATE TABLE saved_for_later (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, variant_id)
);

-- ---------------------------------------------------------------------------
-- WISHLISTS
-- ---------------------------------------------------------------------------
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Wishlist',
  is_default BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(wishlist_id, product_id, variant_id)
);

-- ---------------------------------------------------------------------------
-- COUPONS & GIFT CARDS
-- ---------------------------------------------------------------------------
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  type coupon_type NOT NULL,
  value NUMERIC(10,2) NOT NULL, -- percentage (0-100) or cents
  target discount_target NOT NULL DEFAULT 'order',
  min_order_cents INTEGER DEFAULT 0,
  max_uses INTEGER,
  uses_count INTEGER NOT NULL DEFAULT 0,
  max_uses_per_user INTEGER DEFAULT 1,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  order_id UUID, -- FK added after orders table
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gift_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  initial_balance_cents INTEGER NOT NULL,
  balance_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  recipient_email TEXT,
  sender_name TEXT,
  message TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  purchased_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  order_id UUID, -- FK added after orders
  amount_cents INTEGER NOT NULL,
  type TEXT NOT NULL, -- purchase, redemption, refund
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------------------
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status order_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  fulfillment_status fulfillment_status NOT NULL DEFAULT 'unfulfilled',

  -- Totals (cents)
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  shipping_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,

  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  coupon_code TEXT,
  gift_card_id UUID REFERENCES gift_cards(id) ON DELETE SET NULL,
  gift_card_amount_cents INTEGER DEFAULT 0,

  -- Shipping address snapshot
  shipping_first_name TEXT,
  shipping_last_name TEXT,
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  shipping_country TEXT,
  shipping_method TEXT,
  shipping_carrier TEXT,
  tracking_number TEXT,

  -- Billing address snapshot
  billing_first_name TEXT,
  billing_last_name TEXT,
  billing_address_line1 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_zip TEXT,
  billing_country TEXT,

  gift_message TEXT,
  customer_notes TEXT,
  internal_notes TEXT,
  ip_address INET,
  user_agent TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',

  placed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_placed ON orders(placed_at DESC);

-- Add deferred FKs
ALTER TABLE coupon_redemptions ADD CONSTRAINT fk_coupon_redemptions_order
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
ALTER TABLE gift_card_transactions ADD CONSTRAINT fk_gift_card_transactions_order
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_sku TEXT NOT NULL,
  length TEXT,
  density TEXT,
  color TEXT,
  cap_size TEXT,
  lace_color TEXT,
  image_url TEXT,
  unit_price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_cents INTEGER NOT NULL,
  fulfillment_status fulfillment_status NOT NULL DEFAULT 'unfulfilled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE order_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  is_customer_visible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- PAYMENTS & REFUNDS
-- ---------------------------------------------------------------------------
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- stripe, klarna, afterpay, paypal
  provider_payment_id TEXT,
  method TEXT NOT NULL, -- card, apple_pay, klarna, afterpay
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'pending',
  last4 TEXT,
  brand TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order ON payments(order_id);

CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  provider_refund_id TEXT,
  processed_by UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- SHIPMENTS & RETURNS
-- ---------------------------------------------------------------------------
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL,
  tracking_number TEXT,
  tracking_url TEXT,
  status TEXT NOT NULL DEFAULT 'label_created',
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  label_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE return_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status return_status NOT NULL DEFAULT 'requested',
  reason TEXT NOT NULL,
  notes TEXT,
  refund_amount_cents INTEGER,
  return_label_url TEXT,
  approved_by UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE return_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id UUID NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  condition TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- SAVED PAYMENT METHODS
-- ---------------------------------------------------------------------------
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_method_id TEXT NOT NULL,
  type TEXT NOT NULL, -- card
  brand TEXT,
  last4 TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);


-- >>> END 00003_commerce.sql <<<

-- =============================================================================
-- TRESSÃ‰ HAIR â€” Reviews, Marketing, Content, Support
-- =============================================================================

-- ---------------------------------------------------------------------------
-- REVIEWS & Q&A
-- ---------------------------------------------------------------------------
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT NOT NULL,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_approved ON reviews(product_id, is_approved) WHERE is_approved = true;

CREATE TABLE review_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  type media_type NOT NULL DEFAULT 'image',
  url TEXT NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE review_votes (
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);

CREATE TABLE product_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  question TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES product_questions(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_official BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- LOYALTY & REFERRALS
-- ---------------------------------------------------------------------------
CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type TEXT NOT NULL, -- earn, redeem, expire, bonus, birthday
  description TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_loyalty_user ON loyalty_transactions(user_id);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referred_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, rewarded
  reward_cents INTEGER,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  total_earnings_cents INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  commission_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- MARKETING & CMS
-- ---------------------------------------------------------------------------
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  source TEXT,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  storage_path TEXT,
  link_url TEXT,
  link_text TEXT,
  placement TEXT NOT NULL DEFAULT 'homepage', -- homepage, category, checkout
  sort_order INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE flash_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  discount_percent NUMERIC(5,2),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE flash_sale_products (
  flash_sale_id UUID NOT NULL REFERENCES flash_sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (flash_sale_id, product_id)
);

CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name TEXT NOT NULL,
  location TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  body TEXT NOT NULL,
  product_name TEXT,
  image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL DEFAULT 'general',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  body TEXT NOT NULL,
  cover_image_url TEXT,
  storage_path TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lookbook_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE navigation_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- CUSTOMER SUPPORT
-- ---------------------------------------------------------------------------
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'normal',
  assigned_to UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);

CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE support_macros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  created_by UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS & ABANDONED CART
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

CREATE TABLE abandoned_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT,
  recovery_sent_at TIMESTAMPTZ,
  recovered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- RECENTLY VIEWED & PERSONALIZATION
-- ---------------------------------------------------------------------------
CREATE TABLE recently_viewed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE UNIQUE INDEX idx_recently_viewed_user_product ON recently_viewed(user_id, product_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_recently_viewed_session_product ON recently_viewed(session_id, product_id) WHERE session_id IS NOT NULL;

CREATE TABLE search_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  results_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_queries_query ON search_queries USING gin(query gin_trgm_ops);


-- >>> END 00004_reviews_marketing_support.sql <<<

-- =============================================================================
-- TRESSÃ‰ HAIR â€” Functions & Triggers
-- =============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_product_specs_updated BEFORE UPDATE ON product_specs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_variants_updated BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_orders_updated BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_carts_updated BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  -- Default wishlist
  INSERT INTO wishlists (user_id, name, is_default)
  VALUES (NEW.id, 'My Wishlist', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'TH-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(NEW.id::text, '-', ''), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_order_number BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := 'TKT-' || upper(substr(replace(NEW.id::text, '-', ''), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_ticket_number BEFORE INSERT ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- Update product rating when review approved
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET
    rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_approved = true),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_approved = true)
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_review_rating AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Deduct inventory on order placement
CREATE OR REPLACE FUNCTION deduct_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
  wh_id UUID;
BEGIN
  SELECT id INTO wh_id FROM warehouses WHERE is_active = true LIMIT 1;
  IF wh_id IS NOT NULL AND NEW.variant_id IS NOT NULL THEN
    UPDATE inventory_levels
    SET quantity = quantity - NEW.quantity,
        reserved_quantity = GREATEST(0, reserved_quantity - NEW.quantity)
    WHERE variant_id = NEW.variant_id AND warehouse_id = wh_id;

    INSERT INTO inventory_history (variant_id, warehouse_id, change_quantity, reason, reference_type, reference_id)
    VALUES (NEW.variant_id, wh_id, -NEW.quantity, 'sale', 'order', NEW.order_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_deduct_inventory AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION deduct_inventory_on_order();

-- Check if user is staff/admin
CREATE OR REPLACE FUNCTION is_staff(check_role staff_role DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff_members
    WHERE user_id = auth.uid()
      AND is_active = true
      AND (check_role IS NULL OR role = check_role OR role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Available stock for variant
CREATE OR REPLACE FUNCTION get_variant_stock(variant_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(quantity - reserved_quantity), 0)::INTEGER
  FROM inventory_levels
  WHERE variant_id = variant_uuid;
$$ LANGUAGE sql STABLE;

-- Product list view for storefront (denormalized for performance)
CREATE OR REPLACE VIEW storefront_products AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.description,
  p.short_description,
  p.base_price_cents,
  p.compare_at_price_cents,
  p.sku,
  p.badge,
  p.status,
  p.is_featured,
  p.rating_avg,
  p.review_count,
  p.sales_count,
  p.popularity_score,
  p.care_instructions,
  p.return_policy,
  p.video_url,
  p.published_at,
  p.created_at,
  c.name AS category_name,
  c.slug AS category_slug,
  ps.hair_type,
  ps.hair_origin,
  ps.texture,
  ps.material,
  ps.brand,
  ps.lace_type,
  ps.glueless,
  ps.beginner_friendly,
  ps.ready_to_wear,
  (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS primary_image,
  (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1 OFFSET 1) AS hover_image,
  EXISTS (
    SELECT 1 FROM inventory_levels il
    JOIN product_variants pv ON pv.id = il.variant_id
    WHERE pv.product_id = p.id AND (il.quantity - il.reserved_quantity) > 0
  ) AS in_stock
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
LEFT JOIN product_specs ps ON ps.product_id = p.id
WHERE p.status = 'active';


-- >>> END 00005_functions_triggers.sql <<<

-- =============================================================================
-- TRESSÃ‰ HAIR â€” Row Level Security Policies
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_for_later ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_sale_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_macros ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- PUBLIC READ (catalog, content)
-- ---------------------------------------------------------------------------
CREATE POLICY "Public read active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Public read product specs" ON product_specs FOR SELECT USING (
  EXISTS (SELECT 1 FROM products WHERE id = product_id AND status = 'active')
);
CREATE POLICY "Public read active variants" ON product_variants FOR SELECT USING (
  is_active = true AND EXISTS (SELECT 1 FROM products WHERE id = product_id AND status = 'active')
);
CREATE POLICY "Public read product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read product videos" ON product_videos FOR SELECT USING (true);
CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public read product tags" ON product_tags FOR SELECT USING (true);
CREATE POLICY "Public read active collections" ON collections FOR SELECT USING (is_active = true);
CREATE POLICY "Public read collection products" ON collection_products FOR SELECT USING (true);
CREATE POLICY "Public read product relations" ON product_relations FOR SELECT USING (true);
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Public read review media" ON review_media FOR SELECT USING (true);
CREATE POLICY "Public read approved questions" ON product_questions FOR SELECT USING (is_approved = true);
CREATE POLICY "Public read answers" ON product_answers FOR SELECT USING (true);
CREATE POLICY "Public read active banners" ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active testimonials" ON testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active faqs" ON faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public read published blog" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public read lookbook" ON lookbook_entries FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active flash sales" ON flash_sales FOR SELECT USING (is_active = true);
CREATE POLICY "Public read flash sale products" ON flash_sale_products FOR SELECT USING (true);
CREATE POLICY "Public read navigation" ON navigation_menus FOR SELECT USING (true);
CREATE POLICY "Public read public store settings" ON store_settings FOR SELECT USING (key IN (
  'currency', 'free_shipping_threshold', 'tax_rate', 'store_name', 'announcement_bar'
));

-- ---------------------------------------------------------------------------
-- USER OWN DATA
-- ---------------------------------------------------------------------------
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own carts" ON carts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own cart items" ON cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM carts WHERE id = cart_id AND user_id = auth.uid())
);

CREATE POLICY "Users manage saved for later" ON saved_for_later FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own wishlists" ON wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage wishlist items" ON wishlist_items FOR ALL USING (
  EXISTS (SELECT 1 FROM wishlists WHERE id = wishlist_id AND user_id = auth.uid())
);

CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);

CREATE POLICY "Users manage own reviews" ON reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users vote on reviews" ON review_votes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users ask questions" ON product_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own questions" ON product_questions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users manage payment methods" ON payment_methods FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own returns" ON return_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create returns" ON return_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own loyalty" ON loyalty_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users manage recently viewed" ON recently_viewed FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone subscribe newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Guest cart via session (service role handles session carts in API)
CREATE POLICY "Users create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ---------------------------------------------------------------------------
-- STAFF / ADMIN FULL ACCESS
-- ---------------------------------------------------------------------------
CREATE POLICY "Staff full access profiles" ON profiles FOR ALL USING (is_staff());
CREATE POLICY "Staff read staff table" ON staff_members FOR SELECT USING (is_staff());
CREATE POLICY "Admin manage staff" ON staff_members FOR ALL USING (is_staff('admin'));
CREATE POLICY "Staff read activity logs" ON activity_logs FOR SELECT USING (is_staff());
CREATE POLICY "Staff insert activity logs" ON activity_logs FOR INSERT WITH CHECK (is_staff());

CREATE POLICY "Staff manage categories" ON categories FOR ALL USING (is_staff());
CREATE POLICY "Staff manage products" ON products FOR ALL USING (is_staff());
CREATE POLICY "Staff manage specs" ON product_specs FOR ALL USING (is_staff());
CREATE POLICY "Staff manage variants" ON product_variants FOR ALL USING (is_staff());
CREATE POLICY "Staff manage images" ON product_images FOR ALL USING (is_staff());
CREATE POLICY "Staff manage videos" ON product_videos FOR ALL USING (is_staff());
CREATE POLICY "Staff manage inventory" ON inventory_levels FOR ALL USING (is_staff());
CREATE POLICY "Staff manage warehouses" ON warehouses FOR ALL USING (is_staff());
CREATE POLICY "Staff manage suppliers" ON suppliers FOR ALL USING (is_staff());
CREATE POLICY "Staff manage purchase orders" ON purchase_orders FOR ALL USING (is_staff());
CREATE POLICY "Staff read inventory history" ON inventory_history FOR SELECT USING (is_staff());

CREATE POLICY "Staff manage orders" ON orders FOR ALL USING (is_staff());
CREATE POLICY "Staff manage order items" ON order_items FOR ALL USING (is_staff());
CREATE POLICY "Staff manage order notes" ON order_notes FOR ALL USING (is_staff());
CREATE POLICY "Staff manage payments" ON payments FOR ALL USING (is_staff());
CREATE POLICY "Staff manage refunds" ON refunds FOR ALL USING (is_staff());
CREATE POLICY "Staff manage shipments" ON shipments FOR ALL USING (is_staff());
CREATE POLICY "Staff manage returns" ON return_requests FOR ALL USING (is_staff());
CREATE POLICY "Staff manage return items" ON return_items FOR ALL USING (is_staff());

CREATE POLICY "Staff manage coupons" ON coupons FOR ALL USING (is_staff());
CREATE POLICY "Staff manage gift cards" ON gift_cards FOR ALL USING (is_staff());
CREATE POLICY "Staff manage banners" ON banners FOR ALL USING (is_staff());
CREATE POLICY "Staff manage testimonials" ON testimonials FOR ALL USING (is_staff());
CREATE POLICY "Staff manage faqs" ON faqs FOR ALL USING (is_staff());
CREATE POLICY "Staff manage blog" ON blog_posts FOR ALL USING (is_staff());
CREATE POLICY "Staff manage collections" ON collections FOR ALL USING (is_staff());
CREATE POLICY "Staff manage settings" ON store_settings FOR ALL USING (is_staff());
CREATE POLICY "Staff moderate reviews" ON reviews FOR ALL USING (is_staff());
CREATE POLICY "Staff manage tickets" ON support_tickets FOR ALL USING (is_staff());
CREATE POLICY "Staff manage ticket messages" ON ticket_messages FOR ALL USING (is_staff());
CREATE POLICY "Staff manage macros" ON support_macros FOR ALL USING (is_staff());
CREATE POLICY "Staff read newsletter" ON newsletter_subscribers FOR SELECT USING (is_staff());
CREATE POLICY "Staff read search queries" ON search_queries FOR SELECT USING (is_staff());
CREATE POLICY "Staff read abandoned carts" ON abandoned_carts FOR SELECT USING (is_staff());

-- Active coupons readable for validation
CREATE POLICY "Public read active coupons" ON coupons FOR SELECT USING (
  is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (expires_at IS NULL OR expires_at > now())
);


-- >>> END 00006_rls_policies.sql <<<

-- =============================================================================
-- TRESSÃ‰ HAIR â€” Storage Buckets & Policies
-- =============================================================================

-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'product-images',
    'product-images',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'product-videos',
    'product-videos',
    true,
    104857600, -- 100MB
    ARRAY['video/mp4', 'video/webm', 'video/quicktime']
  ),
  (
    'review-media',
    'review-media',
    true,
    20971520, -- 20MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
  ),
  (
    'user-avatars',
    'user-avatars',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'blog-images',
    'blog-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'lookbook-images',
    'lookbook-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'banner-images',
    'banner-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'brand-assets',
    'brand-assets',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  ),
  (
    'order-documents',
    'order-documents',
    false,
    10485760,
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
  )
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies so re-runs don't fail / roll back the schema
DROP POLICY IF EXISTS "Public read product images bucket" ON storage.objects;
DROP POLICY IF EXISTS "Staff upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Staff update product images" ON storage.objects;
DROP POLICY IF EXISTS "Staff delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public read product videos" ON storage.objects;
DROP POLICY IF EXISTS "Staff manage product videos" ON storage.objects;
DROP POLICY IF EXISTS "Public read review media" ON storage.objects;
DROP POLICY IF EXISTS "Users upload review media" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own review media" ON storage.objects;
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public read blog images" ON storage.objects;
DROP POLICY IF EXISTS "Staff manage cms images" ON storage.objects;
DROP POLICY IF EXISTS "Staff read order documents" ON storage.objects;
DROP POLICY IF EXISTS "Users read own order documents" ON storage.objects;
DROP POLICY IF EXISTS "Staff upload order documents" ON storage.objects;

-- ---------------------------------------------------------------------------
-- PRODUCT IMAGES â€” public read, staff write
-- ---------------------------------------------------------------------------
CREATE POLICY "Public read product images bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Staff upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND is_staff());

CREATE POLICY "Staff update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND is_staff());

CREATE POLICY "Staff delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND is_staff());

-- ---------------------------------------------------------------------------
-- PRODUCT VIDEOS
-- ---------------------------------------------------------------------------
CREATE POLICY "Public read product videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-videos');

CREATE POLICY "Staff manage product videos"
ON storage.objects FOR ALL
USING (bucket_id = 'product-videos' AND is_staff());

-- ---------------------------------------------------------------------------
-- REVIEW MEDIA â€” users upload own, public read
-- ---------------------------------------------------------------------------
CREATE POLICY "Public read review media"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-media');

CREATE POLICY "Users upload review media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'review-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users delete own review media"
ON storage.objects FOR DELETE
USING (bucket_id = 'review-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ---------------------------------------------------------------------------
-- USER AVATARS
-- ---------------------------------------------------------------------------
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ---------------------------------------------------------------------------
-- BLOG, LOOKBOOK, BANNERS, BRAND â€” staff write, public read
-- ---------------------------------------------------------------------------
CREATE POLICY "Public read blog images"
ON storage.objects FOR SELECT
USING (bucket_id IN ('blog-images', 'lookbook-images', 'banner-images', 'brand-assets'));

CREATE POLICY "Staff manage cms images"
ON storage.objects FOR ALL
USING (bucket_id IN ('blog-images', 'lookbook-images', 'banner-images', 'brand-assets') AND is_staff());

-- ---------------------------------------------------------------------------
-- ORDER DOCUMENTS â€” private, user + staff only
-- ---------------------------------------------------------------------------
CREATE POLICY "Staff read order documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'order-documents' AND is_staff());

CREATE POLICY "Users read own order documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'order-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Staff upload order documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'order-documents' AND is_staff());


-- >>> END 00007_storage_buckets.sql <<<

-- =============================================================================
-- TRESSÃ‰ HAIR â€” Seed Data
-- Run after all migrations
-- =============================================================================

-- Store settings
INSERT INTO store_settings (key, value) VALUES
  ('store_name', '"TressÃ© Hair"'),
  ('currency', '"USD"'),
  ('free_shipping_threshold', '15000'),
  ('tax_rate', '0.08'),
  ('announcement_bar', '["International shipping now available", "Shop now, pay later with Klarna & Afterpay", "Free shipping on orders over $150"]'),
  ('support_email', '"hello@tressehair.com"'),
  ('support_phone', '""')
ON CONFLICT (key) DO NOTHING;

-- Default warehouse
INSERT INTO warehouses (id, name, code, city, state, country) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Main Warehouse', 'WH-MAIN', 'Atlanta', 'GA', 'US')
ON CONFLICT (code) DO NOTHING;

-- Categories (matches storefront navigation)
INSERT INTO categories (id, name, slug, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Wigs', 'wigs', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Bundles', 'bundles', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Closures & Frontals', 'closures-frontals', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Extensions', 'extensions', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, sort_order) VALUES
  ((SELECT id FROM categories WHERE slug = 'wigs'), 'Glueless', 'glueless', 1),
  ((SELECT id FROM categories WHERE slug = 'wigs'), 'Bob Wigs', 'bob-wigs', 2),
  ((SELECT id FROM categories WHERE slug = 'wigs'), 'Curly Wigs', 'curly-wigs', 3),
  ((SELECT id FROM categories WHERE slug = 'wigs'), 'Straight Wigs', 'straight-wigs', 4),
  ((SELECT id FROM categories WHERE slug = 'wigs'), 'Body Wave', 'body-wave', 5),
  ((SELECT id FROM categories WHERE slug = 'wigs'), 'Deep Wave', 'deep-wave', 6),
  ((SELECT id FROM categories WHERE slug = 'wigs'), 'Colored Wigs', 'colored-wigs', 7),
  ((SELECT id FROM categories WHERE slug = 'wigs'), 'Raw Straight', 'raw-straight', 8),
  ((SELECT id FROM categories WHERE slug = 'wigs'), 'Raw Wavy', 'raw-wavy', 9),
  ((SELECT id FROM categories WHERE slug = 'bundles'), 'Natural Straight', 'natural-straight', 1),
  ((SELECT id FROM categories WHERE slug = 'bundles'), 'Bone Straight', 'bone-straight', 2),
  ((SELECT id FROM categories WHERE slug = 'bundles'), 'Kinky Straight', 'kinky-straight', 3),
  ((SELECT id FROM categories WHERE slug = 'bundles'), 'Burmese Curls', 'burmese-curls', 4),
  ((SELECT id FROM categories WHERE slug = 'bundles'), 'Pixie Curls', 'pixie-curls', 5),
  ((SELECT id FROM categories WHERE slug = 'bundles'), 'Water Wave', 'water-wave', 6),
  ((SELECT id FROM categories WHERE slug = 'bundles'), 'Vietnamese Bodywave', 'vietnamese-bodywave', 7),
  ((SELECT id FROM categories WHERE slug = 'closures-frontals'), 'Lace Front', 'lace-front', 1),
  ((SELECT id FROM categories WHERE slug = 'closures-frontals'), 'HD Lace', 'hd-lace', 2),
  ((SELECT id FROM categories WHERE slug = 'closures-frontals'), 'Full Lace', 'full-lace', 3)
ON CONFLICT (slug) DO NOTHING;

-- Collections
INSERT INTO collections (name, slug, description, sort_order) VALUES
  ('Bestsellers', 'bestsellers', 'Our most-loved pieces', 1),
  ('New Arrivals', 'new-arrivals', 'Fresh drops weekly', 2),
  ('Glueless Collection', 'glueless', 'Zero glue, maximum slay', 3),
  ('Sale', 'sale', 'Limited time offers', 4)
ON CONFLICT (slug) DO NOTHING;

-- Coupons
INSERT INTO coupons (code, description, type, value, min_order_cents, is_active) VALUES
  ('TRESSE10', '10% off your order', 'percentage', 10, 0, true),
  ('WELCOME15', '15% off first order', 'percentage', 15, 5000, true),
  ('GLAM20', '20% off orders over $200', 'percentage', 20, 20000, true),
  ('FREESHIP', 'Free shipping', 'free_shipping', 0, 0, true)
ON CONFLICT (code) DO NOTHING;

-- Sample product: HD Lace Glueless Body Wave Wig
INSERT INTO products (
  id, category_id, name, slug, description, short_description,
  base_price_cents, sku, badge, status, is_featured,
  rating_avg, review_count, sales_count, popularity_score,
  care_instructions, return_policy, published_at
) VALUES (
  'b1000000-0000-0000-0000-000000000001',
  (SELECT id FROM categories WHERE slug = 'glueless'),
  'HD Lace Glueless Body Wave Wig',
  'hd-lace-glueless-body-wave',
  'Zero glue needed. Features an HD lace front, elastic band, and adjustable straps for a secure, natural fit.',
  'Premium glueless body wave wig with HD lace',
  32000, 'TH-WIG-005', 'new', 'active', true,
  5.0, 12, 89, 91,
  'Comb through when wet. Use leave-in conditioner for waves.',
  '30-day return on unworn wigs.',
  now()
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_specs (
  product_id, hair_type, hair_origin, texture, material, brand,
  lace_type, lace_size, cap_construction,
  length_options, density_options, color_options, cap_size_options, lace_color_options,
  bleached_knots, pre_plucked, glueless, beginner_friendly, ready_to_wear,
  baby_hair, elastic_band, adjustable_strap, processing_time
) VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'human_hair', 'vietnamese', 'body_wave', '100% Virgin Remy', 'TressÃ© Hair',
  'hd_lace', '13x6', 'Glueless with combs + elastic band',
  ARRAY['18"', '20"', '22"', '24"', '26"'],
  ARRAY['180%', '200%', '250%'],
  ARRAY['Natural Black (#1B)', 'Dark Brown (#2)'],
  ARRAY['Small (21")', 'Medium (22")', 'Large (23")'],
  ARRAY['Transparent', 'Light Brown'],
  true, true, true, true, true,
  true, true, true, '2-3 business days'
) ON CONFLICT (product_id) DO NOTHING;

INSERT INTO product_variants (product_id, sku, length, density, color, cap_size, price_cents) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'TH-WIG-005-18-180-NB-M', '18"', '180%', 'Natural Black (#1B)', 'Medium (22")', 32000),
  ('b1000000-0000-0000-0000-000000000001', 'TH-WIG-005-20-200-NB-M', '20"', '200%', 'Natural Black (#1B)', 'Medium (22")', 35500),
  ('b1000000-0000-0000-0000-000000000001', 'TH-WIG-005-22-200-NB-L', '22"', '200%', 'Natural Black (#1B)', 'Large (23")', 39000)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory_levels (variant_id, warehouse_id, quantity, low_stock_threshold)
SELECT pv.id, 'a0000000-0000-0000-0000-000000000001', 25, 5
FROM product_variants pv
WHERE pv.product_id = 'b1000000-0000-0000-0000-000000000001'
ON CONFLICT (variant_id, warehouse_id) DO NOTHING;

-- Testimonials
INSERT INTO testimonials (author_name, location, rating, body, product_name, is_featured, sort_order) VALUES
  ('Aisha M.', 'Atlanta, GA', 5, 'The HD lace frontal melted like butter. TressÃ© Hair is officially my go-to.', '13x6 HD Lace Frontal', true, 1),
  ('Jordan K.', 'Houston, TX', 5, 'The glueless body wave wig changed my morning routine. Ready to wear out of the box.', 'HD Lace Glueless Body Wave Wig', true, 2),
  ('Destiny R.', 'London, UK', 5, 'International shipping was fast and the bundles are true to length.', 'Vietnamese Bodywave Bundle Set', true, 3);

-- FAQs
INSERT INTO faqs (category, question, answer, sort_order) VALUES
  ('shipping', 'How long does shipping take?', 'Standard shipping takes 3-7 business days domestically. International orders typically arrive within 7-14 business days.', 1),
  ('shipping', 'Do you offer free shipping?', 'Yes! Free standard shipping on all orders over $150.', 2),
  ('returns', 'What is your return policy?', 'We offer 30-day returns on unworn wigs with lace intact and unopened bundles.', 3),
  ('products', 'What is HD lace?', 'HD (high definition) lace is an ultra-thin, transparent lace that melts into any skin tone for an undetectable hairline.', 4),
  ('products', 'Are your wigs glueless?', 'Many of our wigs feature glueless construction with elastic bands and adjustable straps. Check individual product specs.', 5);

-- Tags
INSERT INTO tags (name, slug) VALUES
  ('Glueless', 'glueless'),
  ('HD Lace', 'hd-lace'),
  ('Human Hair', 'human-hair'),
  ('Beginner Friendly', 'beginner-friendly'),
  ('Ready to Wear', 'ready-to-wear')
ON CONFLICT (slug) DO NOTHING;


-- >>> END 00008_seed_data.sql <<<

-- =============================================================================
-- TRESSÃ‰ HAIR â€” Grants & Permissions
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant select on all public tables to authenticated/anon (RLS enforces access)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Storefront view
GRANT SELECT ON storefront_products TO anon, authenticated;

-- Default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;


-- >>> END 00009_grants.sql <<<



