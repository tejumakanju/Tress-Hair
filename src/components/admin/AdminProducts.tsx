"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useCatalog } from "@/lib/catalog-context";
import { cn } from "@/lib/utils";
import { useFormatPrice } from "@/lib/currency-context";
import { Search, Plus, RefreshCw } from "lucide-react";
import { refreshProductCatalog } from "@/lib/actions/revalidate";
import { useToast } from "@/lib/toast-context";

export function AdminProducts() {
  const formatPrice = useFormatPrice();
  const { products: allProducts } = useCatalog();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  const filtered = allProducts.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const handleRefreshCache = () => {
    startTransition(async () => {
      try {
        await refreshProductCatalog();
        toast("Product cache refreshed", "success");
      } catch {
        toast("Couldn’t refresh cache", "error");
      }
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <h1 className="font-serif text-2xl tracking-[0.15em] uppercase">
          Products
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefreshCache}
            disabled={pending}
            className="flex items-center gap-2 px-4 py-2 border border-border text-xs tracking-[0.15em] uppercase disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", pending && "animate-spin")} />
            Refresh cache
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-noir text-white text-xs tracking-[0.15em] uppercase"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-border bg-white focus:outline-none focus:border-champagne"
        />
      </div>

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-4 text-[10px] tracking-[0.15em] uppercase text-muted font-normal">
                Product
              </th>
              <th className="p-4 text-[10px] tracking-[0.15em] uppercase text-muted font-normal">
                Category
              </th>
              <th className="p-4 text-[10px] tracking-[0.15em] uppercase text-muted font-normal">
                SKU
              </th>
              <th className="p-4 text-[10px] tracking-[0.15em] uppercase text-muted font-normal">
                Price
              </th>
              <th className="p-4 text-[10px] tracking-[0.15em] uppercase text-muted font-normal">
                Stock
              </th>
              <th className="p-4 text-[10px] tracking-[0.15em] uppercase text-muted font-normal">
                Sold
              </th>
              <th className="p-4 text-[10px] tracking-[0.15em] uppercase text-muted font-normal">
                Rating
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr
                key={product.id}
                className="border-b border-border hover:bg-cream/50"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-12 bg-cream overflow-hidden shrink-0">
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs tracking-wide uppercase max-w-[200px] truncate">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-xs text-muted">{product.category}</td>
                <td className="p-4 text-xs font-mono">{product.sku}</td>
                <td className="p-4">{formatPrice(product.price)}</td>
                <td className="p-4">
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5",
                      product.inStock
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-crimson"
                    )}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="p-4 text-muted">{product.salesCount}</td>
                <td className="p-4">{product.rating} ★</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
