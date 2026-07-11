"use client";

import { Heart } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/states";
import { useWishlist } from "@/lib/wishlist-context";
import { useCatalog } from "@/lib/catalog-context";

export default function WishlistPage() {
  const { productIds } = useWishlist();
  const { products: allProducts } = useCatalog();
  const products = allProducts.filter((p) => productIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl tracking-[0.15em] uppercase">Wishlist</h1>
        {products.length > 0 && (
          <p className="text-sm text-muted mt-2">
            {products.length} {products.length === 1 ? "item" : "items"}
          </p>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Wishlist is empty"
          description="Save pieces you love — tap the heart on any product to build your list."
          action={{ label: "Shop Now", href: "/shop" }}
        />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
