-- =============================================================================
-- TRESSÉ HAIR — Database Extensions & Custom Types
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
