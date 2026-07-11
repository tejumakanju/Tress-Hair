import { unstable_cache, unstable_noStore } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/types/product";
import type { ShopFilters } from "@/types/product";
import { allProducts as mockProducts } from "@/lib/data/products";
import {
  mergeCatalog,
  type StorefrontProductRow,
} from "@/lib/data/map-storefront-product";
import { CacheTag, productSlugTag } from "@/lib/cache-tags";
import { stableHash } from "@/lib/stable-hash";
import { filterProducts } from "@/lib/shop-utils";
import type { Database } from "@/types/database";

export const CATALOG_REVALIDATE_SECONDS = 60;

function createPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function fetchStorefrontRows(): Promise<StorefrontProductRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.from("storefront_products").select("*");

  if (error) {
    console.error("[catalog] storefront_products:", error.message);
    return [];
  }

  return (data ?? []) as unknown as StorefrontProductRow[];
}

async function loadCatalogUncached(): Promise<Product[]> {
  const rows = await fetchStorefrontRows();
  if (rows.length === 0) {
    return mockProducts;
  }
  return mergeCatalog(rows, mockProducts);
}

/** Tagged catalog cache — invalidated via revalidateTag("products", "max"). */
export const getCachedCatalog = unstable_cache(
  loadCatalogUncached,
  ["product-catalog"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CacheTag.PRODUCTS] }
);

export async function getCachedProductBySlug(
  slug: string
): Promise<Product | undefined> {
  const cached = unstable_cache(
    async () => {
      const catalog = await loadCatalogUncached();
      return catalog.find((p) => p.slug === slug) ?? null;
    },
    ["product-by-slug", slug],
    {
      revalidate: CATALOG_REVALIDATE_SECONDS,
      tags: [CacheTag.PRODUCTS, productSlugTag(slug)],
    }
  );
  const product = await cached();
  return product ?? undefined;
}

export async function getCachedProductSlugs(): Promise<string[]> {
  const catalog = await getCachedCatalog();
  return catalog.map((p) => p.slug);
}

/**
 * Server-side filtered catalog keyed by a stable hash of filters.
 * Shop UI still filters client-side; this is for future RSC / API use.
 */
export async function getCachedFilteredCatalog(
  filters: ShopFilters
): Promise<Product[]> {
  const key = stableHash(filters);
  const cached = unstable_cache(
    async () => {
      const catalog = await loadCatalogUncached();
      return filterProducts(catalog, filters);
    },
    ["product-catalog-filtered", key],
    {
      revalidate: CATALOG_REVALIDATE_SECONDS,
      tags: [CacheTag.PRODUCTS, `products:filter:${key}`],
    }
  );
  return cached();
}

export type LiveAvailability = {
  productId: string;
  inStock: boolean;
  source: "supabase" | "catalog" | "unavailable";
};

/**
 * Live stock check — never cached. Use at checkout / add-to-bag confirmation.
 */
export async function getLiveAvailability(
  productId: string
): Promise<LiveAvailability> {
  unstable_noStore();

  const supabase = createPublicSupabase();
  if (!supabase) {
    const catalog = await loadCatalogUncached();
    const product = catalog.find((p) => p.id === productId);
    return {
      productId,
      inStock: product?.inStock ?? false,
      source: product ? "catalog" : "unavailable",
    };
  }

  const { data, error } = await supabase
    .from("storefront_products")
    .select("id, in_stock")
    .eq("id", productId)
    .maybeSingle();

  if (error || !data) {
    const catalog = await loadCatalogUncached();
    const product = catalog.find((p) => p.id === productId);
    return {
      productId,
      inStock: product?.inStock ?? false,
      source: product ? "catalog" : "unavailable",
    };
  }

  const row = data as { id: string; in_stock: boolean | null };
  return {
    productId: row.id,
    inStock: Boolean(row.in_stock),
    source: "supabase",
  };
}

export function getFeaturedFromCatalog(products: Product[]): Product[] {
  return products
    .filter((p) => p.badge === "bestseller" || p.badge === "trending")
    .slice(0, 4);
}

export function getNewArrivalsFromCatalog(products: Product[]): Product[] {
  return products.filter((p) => p.badge === "new").slice(0, 4);
}
