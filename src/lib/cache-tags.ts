/** Shared cache tag names for Next.js revalidateTag / unstable_cache. */
export const CacheTag = {
  PRODUCTS: "products",
  RATES: "rates",
} as const;

export type CacheTag = (typeof CacheTag)[keyof typeof CacheTag];

export function productSlugTag(slug: string) {
  return `product:${slug}` as const;
}
