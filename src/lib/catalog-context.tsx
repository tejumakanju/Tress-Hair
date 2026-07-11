"use client";

import { createContext, useContext, useMemo } from "react";
import type { Product } from "@/types/product";
import { allProducts as mockProducts } from "@/lib/data/products";

type CatalogContextType = {
  products: Product[];
  getBySlug: (slug: string) => Product | undefined;
  getById: (id: string) => Product | undefined;
};

const CatalogContext = createContext<CatalogContextType | null>(null);

export function CatalogProvider({
  products,
  children,
}: {
  products: Product[];
  children: React.ReactNode;
}) {
  const value = useMemo<CatalogContextType>(() => {
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    const byId = new Map(products.map((p) => [p.id, p]));
    return {
      products,
      getBySlug: (slug) => bySlug.get(slug),
      getById: (id) => byId.get(id),
    };
  }, [products]);

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    // Fallback for isolated stories / early render — prefer provider.
    return {
      products: mockProducts,
      getBySlug: (slug: string) => mockProducts.find((p) => p.slug === slug),
      getById: (id: string) => mockProducts.find((p) => p.id === id),
    };
  }
  return ctx;
}
