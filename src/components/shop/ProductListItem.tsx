"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { useFormatPrice } from "@/lib/currency-context";
import { Button } from "@/components/ui/Button";

type ProductListItemProps = {
  product: Product;
};

export function ProductListItem({ product }: ProductListItemProps) {
  const formatPrice = useFormatPrice();
  return (
    <article className="flex gap-4 md:gap-6 bg-white border border-border p-4 group">
      <Link href={`/products/${product.slug}`} className="relative w-24 md:w-32 aspect-[4/5] shrink-0 overflow-hidden bg-cream">
        <Image src={product.image} alt={product.name} fill sizes="128px" className="object-cover" />
      </Link>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-1 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn("w-3 h-3", i < Math.floor(product.rating) ? "fill-champagne text-champagne" : "text-border")}
                strokeWidth={0}
              />
            ))}
            <span className="text-[10px] text-muted">({product.reviewCount})</span>
          </div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm tracking-wide uppercase hover:text-champagne-dark transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-muted mt-1 line-clamp-2">{product.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-[10px] px-2 py-0.5 bg-cream">{product.specs.texture}</span>
            <span className="text-[10px] px-2 py-0.5 bg-cream">{product.specs.hairOrigin}</span>
            {product.specs.glueless && (
              <span className="text-[10px] px-2 py-0.5 bg-champagne/20">Glueless</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
          <Button href={`/products/${product.slug}`} variant="outline" size="sm">
            View Product
          </Button>
        </div>
      </div>
    </article>
  );
}
