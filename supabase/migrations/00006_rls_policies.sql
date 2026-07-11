-- =============================================================================
-- TRESSÉ HAIR — Row Level Security Policies
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
