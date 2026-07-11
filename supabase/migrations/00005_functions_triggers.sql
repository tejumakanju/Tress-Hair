-- =============================================================================
-- TRESSÉ HAIR — Functions & Triggers
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
