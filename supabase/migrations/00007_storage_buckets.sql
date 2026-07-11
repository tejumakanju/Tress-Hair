-- =============================================================================
-- TRESSÉ HAIR — Storage Buckets & Policies
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

-- ---------------------------------------------------------------------------
-- PRODUCT IMAGES — public read, staff write
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
-- REVIEW MEDIA — users upload own, public read
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
-- BLOG, LOOKBOOK, BANNERS, BRAND — staff write, public read
-- ---------------------------------------------------------------------------
CREATE POLICY "Public read blog images"
ON storage.objects FOR SELECT
USING (bucket_id IN ('blog-images', 'lookbook-images', 'banner-images', 'brand-assets'));

CREATE POLICY "Staff manage cms images"
ON storage.objects FOR ALL
USING (bucket_id IN ('blog-images', 'lookbook-images', 'banner-images', 'brand-assets') AND is_staff());

-- ---------------------------------------------------------------------------
-- ORDER DOCUMENTS — private, user + staff only
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
