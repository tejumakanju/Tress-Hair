"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Grid3X3, LayoutList, SlidersHorizontal } from "lucide-react";
import { useCatalog } from "@/lib/catalog-context";
import { sortOptions, resolveShopPath } from "@/lib/constants/filters";
import { filterProducts, sortProducts, parseFiltersFromSearchParams } from "@/lib/shop-utils";
import { ShopFiltersPanel } from "@/components/shop/ShopFilters";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductListItem } from "@/components/shop/ProductListItem";
import type { ShopFilters, SortOption } from "@/types/product";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils";

type ShopPageClientProps = {
  pathSegments?: string[];
};

export function ShopPageClient({ pathSegments = [] }: ShopPageClientProps) {
  const { products: allProducts } = useCatalog();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [visibleCount, setVisibleCount] = useState(8);

  const sort = (searchParams.get("sort") as SortOption) || "featured";
  const pathInfo = useMemo(() => resolveShopPath(pathSegments), [pathSegments]);
  const basePath = pathSegments.length ? `/shop/${pathSegments.join("/")}` : "/shop";

  const filters: ShopFilters = useMemo(() => {
    const parsed = parseFiltersFromSearchParams(
      Object.fromEntries(searchParams.entries())
    );
    if (pathInfo.category) parsed.category = pathInfo.category;
    if (pathInfo.subcategory) parsed.subcategory = pathInfo.subcategory;
    return parsed;
  }, [searchParams, pathInfo]);

  const filtered = useMemo(
    () => sortProducts(filterProducts(allProducts, filters), sort),
    [allProducts, filters, sort]
  );

  const visible = filtered.slice(0, visibleCount);

  const updateFilters = useCallback(
    (newFilters: ShopFilters) => {
      const params = new URLSearchParams();
      if (sort !== "featured") params.set("sort", sort);
      if (filters.query) params.set("q", filters.query);
      const entries: [string, string | number | boolean | string[] | undefined][] = [
        ["priceMin", newFilters.priceMin],
        ["priceMax", newFilters.priceMax],
        ["hairType", newFilters.hairType],
        ["hairOrigin", newFilters.hairOrigin],
        ["texture", newFilters.texture],
        ["length", newFilters.length],
        ["density", newFilters.density],
        ["capSize", newFilters.capSize],
        ["laceType", newFilters.laceType],
        ["laceColor", newFilters.laceColor],
        ["color", newFilters.color],
        ["brand", newFilters.brand],
        ["material", newFilters.material],
        ["availability", newFilters.availability],
        ["rating", newFilters.rating],
      ];
      entries.forEach(([key, val]) => {
        if (val == null) return;
        if (Array.isArray(val) && val.length) params.set(key, val.join(","));
        else if (typeof val === "number") params.set(key, String(val));
        else if (typeof val === "string") params.set(key, val);
      });
      if (newFilters.beginnerFriendly) params.set("beginnerFriendly", "true");
      if (newFilters.glueless) params.set("glueless", "true");
      if (newFilters.readyToWear) params.set("readyToWear", "true");
      router.push(`${basePath}?${params.toString()}`);
    },
    [router, sort, basePath, filters.query]
  );

  const updateSort = useCallback(
    (newSort: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", newSort);
      router.push(`${basePath}?${params.toString()}`);
    },
    [router, searchParams, basePath]
  );

  const pageTitle = filters.query
    ? `Results for “${filters.query}”`
    : pathInfo.title;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl md:text-4xl tracking-[0.15em] uppercase">
          {pageTitle}
        </h1>
        <p className="text-sm text-muted mt-2">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block">
          <ShopFiltersPanel
            filters={filters}
            onChange={updateFilters}
            productCount={filtered.length}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 text-xs tracking-[0.15em] uppercase"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn("p-2", viewMode === "grid" ? "text-champagne-dark" : "text-muted")}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn("p-2", viewMode === "list" ? "text-champagne-dark" : "text-muted")}
                aria-label="List view"
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>

            <select
              value={sort}
              onChange={(e) => updateSort(e.target.value)}
              className="text-xs tracking-wide border border-border px-3 py-2 bg-white focus:outline-none focus:border-champagne"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No matches"
              description="No products match your filters. Clear filters or browse the full shop."
              action={{ label: "View all", href: "/shop" }}
              className="py-20"
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {visible.map((product) => (
                <ProductListItem key={product.id} product={product} />
              ))}
            </div>
          )}

          {visibleCount < filtered.length && (
            <div className="text-center mt-10">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + 8)}
                className="px-8 py-3 text-xs tracking-[0.2em] uppercase border border-noir hover:bg-noir hover:text-white transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-noir/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[min(100%,22rem)] bg-ivory overflow-y-auto overscroll-contain p-5 sm:p-6 safe-pt safe-pb">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg tracking-[0.12em] uppercase">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="touch-target inline-flex items-center justify-center text-xs tracking-[0.15em] uppercase text-muted"
              >
                Close
              </button>
            </div>
            <ShopFiltersPanel
              filters={filters}
              onChange={(f) => {
                updateFilters(f);
                setMobileFiltersOpen(false);
              }}
              productCount={filtered.length}
            />
          </div>
        </div>
      )}
    </div>
  );
}
