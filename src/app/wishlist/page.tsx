"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { useWishlist } from "@/lib/wishlist-context";
import { allProducts } from "@/lib/data/products";

export default function WishlistPage() {
  const { productIds } = useWishlist();
  const products = allProducts.filter((p) => productIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl tracking-[0.15em] uppercase">Wishlist</h1>
        <p className="text-sm text-muted mt-2">
          {products.length} {products.length === 1 ? "item" : "items"}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted mb-6">Your wishlist is empty. Save pieces you love.</p>
          <Button href="/shop" variant="primary" size="lg">
            Shop Now
          </Button>
        </div>
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
