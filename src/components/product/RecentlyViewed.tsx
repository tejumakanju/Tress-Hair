"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { useRecentlyViewed } from "@/lib/recently-viewed-context";
import { useCatalog } from "@/lib/catalog-context";

type RecentlyViewedProps = {
  excludeSlug?: string;
};

export function RecentlyViewed({ excludeSlug }: RecentlyViewedProps) {
  const { slugs } = useRecentlyViewed();
  const { getBySlug } = useCatalog();
  const products = slugs
    .filter((s) => s !== excludeSlug)
    .map((s) => getBySlug(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-20 px-4 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-xl md:text-2xl tracking-[0.15em] uppercase text-center mb-8">
          Recently Viewed
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
