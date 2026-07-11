"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Star } from "lucide-react";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useWishlist } from "@/lib/wishlist-context";
import { useToast } from "@/lib/toast-context";
import { useFormatPrice } from "@/lib/currency-context";
import { UserCopy } from "@/lib/user-errors";
import { QuickAddModal } from "@/components/product/QuickAddModal";

const badgeStyles = {
  new: "bg-champagne text-noir",
  sale: "bg-crimson text-white",
  bestseller: "bg-noir text-white",
  trending: "bg-champagne-dark text-white",
};

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { isWishlisted, toggle } = useWishlist();
  const { toast } = useToast();
  const formatPrice = useFormatPrice();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(product.id);
    toast(added ? UserCopy.WISHLIST_SAVED : UserCopy.WISHLIST_REMOVED);
  };

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-cream mb-4">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
          {product.hoverImage && (
            <Image
              src={product.hoverImage}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>

        {product.badge && (
          <span
            className={cn(
              "absolute top-3 left-3 px-2.5 py-1 text-[9px] tracking-[0.15em] uppercase",
              badgeStyles[product.badge]
            )}
          >
            {product.badge}
          </span>
        )}

        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlist}
          className={cn(
            "absolute top-3 right-3 w-9 h-9 bg-white/90 flex items-center justify-center transition-opacity hover:text-crimson sm:opacity-0 sm:group-hover:opacity-100",
            wishlisted && "opacity-100 text-crimson"
          )}
        >
          <Heart className={cn("w-4 h-4", wishlisted && "fill-crimson")} strokeWidth={1.5} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 max-sm:translate-y-0 max-sm:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setQuickAddOpen(true);
            }}
            className="w-full bg-white/95 text-noir border border-white hover:bg-noir hover:text-white hover:border-noir px-4 py-2 text-xs tracking-widest uppercase transition-all duration-300"
          >
            Quick Add
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-3 h-3",
                i < Math.floor(product.rating)
                  ? "fill-champagne text-champagne"
                  : "text-border"
              )}
              strokeWidth={0}
            />
          ))}
          <span className="text-[10px] text-muted ml-1">
            ({product.reviewCount})
          </span>
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="text-xs tracking-wide uppercase leading-snug hover:text-champagne-dark transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        <Button
          href={`/products/${product.slug}`}
          variant="outline"
          size="sm"
          className="w-full mt-2"
        >
          Choose Options
        </Button>
      </div>

      <QuickAddModal
        product={product}
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />
    </article>
  );
}
