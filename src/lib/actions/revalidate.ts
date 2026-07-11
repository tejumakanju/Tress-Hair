"use server";

import { revalidateTag, updateTag } from "next/cache";
import { CacheTag, productSlugTag } from "@/lib/cache-tags";

/** Stale-while-revalidate bust after catalog edits (preferred for public CDN). */
export async function revalidateProductCatalog() {
  revalidateTag(CacheTag.PRODUCTS, "max");
}

/** Immediate refresh for admin read-your-own-writes. */
export async function refreshProductCatalog() {
  updateTag(CacheTag.PRODUCTS);
}

export async function revalidateProductSlug(slug: string) {
  revalidateTag(productSlugTag(slug), "max");
  revalidateTag(CacheTag.PRODUCTS, "max");
}

export async function revalidateRatesCache() {
  revalidateTag(CacheTag.RATES, "max");
}
