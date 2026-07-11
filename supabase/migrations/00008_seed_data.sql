-- =============================================================================
-- TRESSÉ HAIR — Seed Data
-- Run after all migrations
-- =============================================================================

-- Store settings
INSERT INTO store_settings (key, value) VALUES
  ('store_name', '"Tressé Hair"'),
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
  'human_hair', 'vietnamese', 'body_wave', '100% Virgin Remy', 'Tressé Hair',
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
  ('Aisha M.', 'Atlanta, GA', 5, 'The HD lace frontal melted like butter. Tressé Hair is officially my go-to.', '13x6 HD Lace Frontal', true, 1),
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
