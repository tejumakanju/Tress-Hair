"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Minus,
  Plus,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  ZoomIn,
} from "lucide-react";
import type { Product } from "@/types/product";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useRecentlyViewed } from "@/lib/recently-viewed-context";
import { useToast } from "@/lib/toast-context";
import { useFormatPrice } from "@/lib/currency-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { getProductBySlug } from "@/lib/data/products";

type ProductDetailClientProps = {
  product: Product;
};

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { track } = useRecentlyViewed();
  const { toast } = useToast();
  const formatPrice = useFormatPrice();
  const [selectedImage, setSelectedImage] = useState(0);
  const [length, setLength] = useState(product.lengths[0]);
  const [density, setDensity] = useState(product.densities[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [capSize, setCapSize] = useState(product.capSizes[0] ?? "One Size");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "care" | "returns" | "reviews">("description");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    track(product.slug);
  }, [product.slug, track]);

  const wishlisted = isWishlisted(product.id);

  const selectedVariant = useMemo(() => {
    return product.variants.find(
      (v) =>
        v.length === length &&
        v.density === density &&
        v.color === color &&
        (product.capSizes.length === 0 || v.capSize === capSize)
    );
  }, [product, length, density, color, capSize]);

  const price = selectedVariant?.price ?? product.price;
  const related = product.relatedSlugs
    .map((slug) => getProductBySlug(slug))
    .filter(Boolean) as Product[];

  const handleAddToCart = (openDrawer = true) => {
    if (!selectedVariant) return;
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: selectedVariant.price,
        quantity,
        length,
        density,
        color,
        capSize: product.capSizes.length ? capSize : undefined,
        sku: selectedVariant.sku,
      },
      { openDrawer }
    );
    setAdded(true);
    toast(`Added ${product.name}`);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart(false);
    router.push("/checkout");
  };

  const handleWishlist = () => {
    const addedWish = toggle(product.id);
    toast(addedWish ? "Saved to wishlist" : "Removed from wishlist");
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast("Link copied");
      }
    } catch {
      /* cancelled */
    }
  };

  const tabs = [
    { id: "description" as const, label: "Description" },
    { id: "specs" as const, label: "Specifications" },
    { id: "care" as const, label: "Care" },
    { id: "returns" as const, label: "Returns" },
    { id: "reviews" as const, label: `Reviews (${product.reviewCount})` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-28 lg:pb-12">
      <nav className="text-xs text-muted mb-8 flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-champagne-dark">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-champagne-dark">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/shop/${product.category.toLowerCase()}`} className="hover:text-champagne-dark">
          {product.category}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-charcoal">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div
            className="relative aspect-[4/5] bg-cream overflow-hidden cursor-zoom-in group"
            onClick={() => setZoomOpen(true)}
          >
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute top-4 right-4 p-2 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-4 h-4" />
            </div>
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 text-[10px] tracking-[0.15em] uppercase bg-noir text-white">
                {product.badge}
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {product.images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "relative w-16 h-20 shrink-0 overflow-hidden border-2 transition-colors",
                  selectedImage === i ? "border-champagne" : "border-transparent"
                )}
              >
                <Image src={img} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="font-serif text-2xl md:text-3xl tracking-wide uppercase leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn("w-4 h-4", i < Math.floor(product.rating) ? "fill-champagne text-champagne" : "text-border")}
                strokeWidth={0}
              />
            ))}
            <span className="text-sm text-muted">{product.rating} ({product.reviewCount} reviews)</span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-2xl font-medium">{formatPrice(price)}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>

          <p className="text-sm text-muted mt-2">SKU: {selectedVariant?.sku ?? product.sku}</p>
          <p className={cn("text-sm mt-1", product.inStock ? "text-green-700" : "text-crimson")}>
            {product.inStock ? `● In Stock — Ships in ${product.specs.processingTime}` : "● Out of Stock"}
          </p>

          <div className="mt-8 space-y-5">
            <VariantSelector label="Length" options={product.lengths} value={length} onChange={setLength} />
            <VariantSelector label="Density" options={product.densities} value={density} onChange={setDensity} />
            <VariantSelector label="Color" options={product.colors} value={color} onChange={setColor} />
            {product.capSizes.length > 0 && (
              <VariantSelector label="Cap Size" options={product.capSizes} value={capSize} onChange={setCapSize} />
            )}
            <div>
              <span className="text-xs tracking-[0.15em] uppercase block mb-2">Quantity</span>
              <div className="inline-flex items-center border border-border">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-cream">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-4 text-sm min-w-[40px] text-center">{quantity}</span>
                <button type="button" onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-cream">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex flex-col sm:flex-row gap-3 mt-8">
            <Button onClick={() => handleAddToCart(true)} variant="primary" size="lg" className="flex-1" disabled={!product.inStock}>
              {added ? "Added to Bag ✓" : "Add to Bag"}
            </Button>
            <Button onClick={handleBuyNow} variant="secondary" size="lg" className="flex-1" disabled={!product.inStock}>
              Buy Now
            </Button>
            <button
              type="button"
              aria-label="Add to wishlist"
              onClick={handleWishlist}
              className={cn("p-4 border border-border hover:border-crimson hover:text-crimson transition-colors", wishlisted && "border-crimson text-crimson")}
            >
              <Heart className={cn("w-5 h-5", wishlisted && "fill-crimson")} strokeWidth={1.5} />
            </button>
            <button type="button" aria-label="Share" onClick={handleShare} className="p-4 border border-border hover:border-champagne transition-colors">
              <Share2 className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="mt-8 p-4 bg-cream space-y-3">
            <div className="flex items-center gap-3 text-xs">
              <Truck className="w-4 h-4 text-champagne-dark shrink-0" />
              <span>Shipping calculated at checkout · Lagos 1–2 days · Nationwide 2–5</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Shield className="w-4 h-4 text-champagne-dark shrink-0" />
              <span>Secure checkout with Flutterwave</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <RotateCcw className="w-4 h-4 text-champagne-dark shrink-0" />
              <span>30-day easy returns on unworn items</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="flex gap-6 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-3 text-xs tracking-[0.15em] uppercase whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.id ? "border-noir text-noir" : "border-transparent text-muted hover:text-charcoal"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="py-8 max-w-3xl">
          {activeTab === "description" && <p className="text-sm leading-relaxed text-muted">{product.description}</p>}
          {activeTab === "specs" && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {Object.entries({
                "Hair Type": product.specs.hairType,
                "Hair Origin": product.specs.hairOrigin,
                Texture: product.specs.texture,
                Material: product.specs.material,
                Brand: product.specs.brand,
                "Lace Type": product.specs.laceType,
                "Lace Size": product.specs.laceSize,
                "Cap Construction": product.specs.capConstruction,
                Glueless: product.specs.glueless ? "Yes" : "No",
                "Ready to Wear": product.specs.readyToWear ? "Yes" : "No",
              }).filter(([, v]) => v).map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted">{key}</dt>
                  <dd>{val}</dd>
                </div>
              ))}
            </dl>
          )}
          {activeTab === "care" && <p className="text-sm leading-relaxed text-muted">{product.careInstructions}</p>}
          {activeTab === "returns" && <p className="text-sm leading-relaxed text-muted">{product.returnPolicy}</p>}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {product.reviews.length === 0 ? (
                <p className="text-muted text-sm">No reviews yet. Be the first!</p>
              ) : (
                product.reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6">
                    <span className="text-sm font-medium">{review.author}</span>
                    <p className="text-sm text-muted mt-2">{review.text}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-xl tracking-[0.15em] uppercase text-center mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed excludeSlug={product.slug} />

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-ivory/95 backdrop-blur border-t border-border p-3 flex gap-2">
        <button type="button" onClick={handleWishlist} className={cn("p-3 border border-border", wishlisted && "border-crimson text-crimson")} aria-label="Wishlist">
          <Heart className={cn("w-5 h-5", wishlisted && "fill-crimson")} strokeWidth={1.5} />
        </button>
        <Button onClick={() => handleAddToCart(true)} variant="primary" size="md" className="flex-1" disabled={!product.inStock}>
          {added ? "Added ✓" : `Add · ${formatPrice(price)}`}
        </Button>
        <Button onClick={handleBuyNow} variant="secondary" size="md" disabled={!product.inStock}>Buy</Button>
      </div>

      {zoomOpen && (
        <div className="fixed inset-0 z-50 bg-noir/90 flex items-center justify-center p-4" onClick={() => setZoomOpen(false)}>
          <div className="relative w-full max-w-3xl aspect-[4/5]">
            <Image src={product.images[selectedImage]} alt={product.name} fill sizes="800px" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

function VariantSelector({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-xs tracking-[0.15em] uppercase block mb-2">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "px-3 py-2 text-xs border transition-colors",
              value === opt ? "border-noir bg-noir text-white" : "border-border hover:border-champagne"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
