import type { Product, ProductBadge, ProductSpecs } from "@/types/product";
import { allProducts as mockProducts } from "@/lib/data/products";

/** Row shape from `storefront_products` (+ optional nested fields we may join later). */
export type StorefrontProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  base_price_cents: number;
  compare_at_price_cents: number | null;
  sku: string | null;
  badge: string | null;
  status: string;
  is_featured: boolean | null;
  rating_avg: number | null;
  review_count: number | null;
  sales_count: number | null;
  popularity_score: number | null;
  care_instructions: string | null;
  return_policy: string | null;
  video_url: string | null;
  published_at: string | null;
  created_at: string | null;
  category_name: string | null;
  category_slug: string | null;
  hair_type: string | null;
  hair_origin: string | null;
  texture: string | null;
  material: string | null;
  brand: string | null;
  lace_type: string | null;
  glueless: boolean | null;
  beginner_friendly: boolean | null;
  ready_to_wear: boolean | null;
  primary_image: string | null;
  hover_image: string | null;
  in_stock: boolean | null;
};

const DEFAULT_SPECS: ProductSpecs = {
  hairType: "Human Hair",
  hairOrigin: "—",
  texture: "—",
  material: "100% Virgin Remy",
  brand: "Tressé Hair",
  glueless: false,
  beginnerFriendly: false,
  readyToWear: false,
  processingTime: "2-3 business days",
};

function badgeFromDb(badge: string | null): ProductBadge | undefined {
  if (
    badge === "new" ||
    badge === "sale" ||
    badge === "bestseller" ||
    badge === "trending"
  ) {
    return badge;
  }
  return undefined;
}

function labelize(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Map a Supabase storefront row onto the storefront Product shape.
 * When a mock product shares the slug, keep rich PDP fields (variants, reviews, images).
 */
export function mapStorefrontRow(
  row: StorefrontProductRow,
  mockBySlug: Map<string, Product>
): Product {
  const mock = mockBySlug.get(row.slug);
  const price = row.base_price_cents / 100;
  const compareAt = row.compare_at_price_cents
    ? row.compare_at_price_cents / 100
    : undefined;
  const image =
    row.primary_image ||
    mock?.image ||
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=1000&fit=crop";
  const hoverImage = row.hover_image || mock?.hoverImage;

  if (mock) {
    return {
      ...mock,
      id: row.id,
      name: row.name,
      slug: row.slug,
      price,
      compareAtPrice: compareAt ?? mock.compareAtPrice,
      image,
      hoverImage,
      images: mock.images?.length ? mock.images : [image],
      videoUrl: row.video_url || mock.videoUrl,
      category: row.category_name || mock.category,
      subcategory: mock.subcategory,
      badge: badgeFromDb(row.badge) ?? mock.badge,
      rating: Number(row.rating_avg ?? mock.rating),
      reviewCount: row.review_count ?? mock.reviewCount,
      sku: row.sku || mock.sku,
      description: row.description || mock.description,
      inStock: row.in_stock ?? mock.inStock,
      careInstructions: row.care_instructions || mock.careInstructions,
      returnPolicy: row.return_policy || mock.returnPolicy,
      createdAt: row.created_at?.slice(0, 10) || mock.createdAt,
      salesCount: row.sales_count ?? mock.salesCount,
      popularity: row.popularity_score ?? mock.popularity,
      specs: {
        ...mock.specs,
        hairType: labelize(row.hair_type, mock.specs.hairType),
        hairOrigin: labelize(row.hair_origin, mock.specs.hairOrigin),
        texture: labelize(row.texture, mock.specs.texture),
        material: row.material || mock.specs.material,
        brand: row.brand || mock.specs.brand,
        laceType: labelize(row.lace_type, mock.specs.laceType || ""),
        glueless: row.glueless ?? mock.specs.glueless,
        beginnerFriendly: row.beginner_friendly ?? mock.specs.beginnerFriendly,
        readyToWear: row.ready_to_wear ?? mock.specs.readyToWear,
      },
    };
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price,
    compareAtPrice: compareAt,
    image,
    hoverImage,
    images: [image, hoverImage].filter(Boolean) as string[],
    videoUrl: row.video_url || undefined,
    category: row.category_name || "Wigs",
    badge: badgeFromDb(row.badge),
    rating: Number(row.rating_avg ?? 0),
    reviewCount: row.review_count ?? 0,
    sku: row.sku || row.slug.toUpperCase(),
    description: row.description || row.short_description || "",
    inStock: row.in_stock ?? true,
    specs: {
      ...DEFAULT_SPECS,
      hairType: labelize(row.hair_type, DEFAULT_SPECS.hairType),
      hairOrigin: labelize(row.hair_origin, DEFAULT_SPECS.hairOrigin),
      texture: labelize(row.texture, DEFAULT_SPECS.texture),
      material: row.material || DEFAULT_SPECS.material,
      brand: row.brand || DEFAULT_SPECS.brand,
      laceType: row.lace_type ? labelize(row.lace_type, "") : undefined,
      glueless: row.glueless ?? false,
      beginnerFriendly: row.beginner_friendly ?? false,
      readyToWear: row.ready_to_wear ?? false,
    },
    variants: [],
    lengths: [],
    densities: [],
    colors: [],
    capSizes: [],
    laceColors: [],
    careInstructions: row.care_instructions || "",
    returnPolicy: row.return_policy || "",
    reviews: [],
    relatedSlugs: [],
    createdAt: row.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    salesCount: row.sales_count ?? 0,
    popularity: row.popularity_score ?? 0,
  };
}

export function mergeCatalog(
  rows: StorefrontProductRow[],
  mocks: Product[] = mockProducts
): Product[] {
  const mockBySlug = new Map(mocks.map((p) => [p.slug, p]));
  const bySlug = new Map(mocks.map((p) => [p.slug, p]));

  for (const row of rows) {
    bySlug.set(row.slug, mapStorefrontRow(row, mockBySlug));
  }

  return Array.from(bySlug.values());
}
