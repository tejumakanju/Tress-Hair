"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCatalog } from "@/lib/catalog-context";
import { useFormatPrice } from "@/lib/currency-context";

const TRENDING = [
  "Glueless wigs",
  "HD lace",
  "Body wave",
  "Bob wig",
  "Bundles",
  "Frontals",
];

type SearchAutocompleteProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchAutocomplete({ open, onClose }: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const formatPrice = useFormatPrice();
  const { products: allProducts } = useCatalog();

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allProducts
      .filter((p) => {
        const hay = [
          p.name,
          p.category,
          p.subcategory,
          p.specs.texture,
          p.specs.hairOrigin,
          p.specs.laceType,
          p.badge,
          p.specs.glueless ? "glueless" : "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q) || q.split(/\s+/).every((word) => hay.includes(word));
      })
      .slice(0, 6);
  }, [query, allProducts]);

  if (!open) return null;

  const goToSearch = (term: string) => {
    onClose();
    router.push(`/shop?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="pb-4 animate-fade-up">
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-muted" strokeWidth={1.5} />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) goToSearch(query.trim());
            if (e.key === "Escape") onClose();
          }}
          placeholder="Search wigs, bundles, frontals..."
          className="w-full pl-11 pr-12 py-3.5 bg-white border border-border text-base md:text-sm focus:outline-none focus:border-champagne transition-colors"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-1/2 -translate-y-1/2 touch-target inline-flex items-center justify-center p-2 text-muted hover:text-noir"
          aria-label="Close search"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border shadow-lg z-50 max-h-[70vh] overflow-y-auto">
          {!query.trim() && (
            <div className="p-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-3">Trending searches</p>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => goToSearch(term)}
                    className="min-h-11 px-3 py-2.5 text-xs border border-border hover:border-champagne hover:text-champagne-dark transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <p className="p-4 text-sm text-muted">No products found for &ldquo;{query}&rdquo;</p>
          )}

          {results.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="flex gap-3 p-3 hover:bg-cream transition-colors border-t border-border first:border-t-0"
            >
              <div className="relative w-12 aspect-[4/5] shrink-0 bg-cream overflow-hidden">
                <Image src={product.image} alt="" fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs tracking-wide uppercase line-clamp-1">{product.name}</p>
                <p className="text-[10px] text-muted mt-0.5">
                  {product.category} · {product.specs.texture}
                </p>
                <p className="text-xs mt-1">{formatPrice(product.price)}</p>
              </div>
            </Link>
          ))}

          {query.trim() && results.length > 0 && (
            <button
              type="button"
              onClick={() => goToSearch(query.trim())}
              className="w-full p-3 text-xs tracking-[0.15em] uppercase border-t border-border hover:bg-cream"
            >
              View all results
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
