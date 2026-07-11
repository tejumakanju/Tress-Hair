"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useFormatPrice } from "@/lib/currency-context";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/states";
import { useCatalog } from "@/lib/catalog-context";
import { shippingCostUsd } from "@/lib/shipping";

export function CartDrawer() {
  const { products: allProducts } = useCatalog();
  const {
    items,
    isCartOpen,
    closeCart,
    subtotal,
    updateQuantity,
    removeItem,
    lastAddedName,
    couponDiscount,
    couponCode,
  } = useCart();
  const formatPrice = useFormatPrice();

  const shipping = shippingCostUsd("nigeria_nationwide");
  const tax = (subtotal - couponDiscount) * 0.075;
  const total = subtotal - couponDiscount + shipping + tax;

  const upsells = allProducts
    .filter((p) => p.inStock && !items.some((i) => i.productId === p.id))
    .slice(0, 2);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-noir/40" onClick={closeCart} />
      <aside className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-ivory shadow-2xl flex flex-col animate-slide-in-right safe-pt">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="font-serif text-lg tracking-[0.1em] uppercase">Your Bag</h2>
            {lastAddedName && items.length > 0 && (
              <p className="text-[10px] text-champagne-dark mt-0.5 tracking-wide">
                Added · {lastAddedName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="touch-target inline-flex items-center justify-center p-2 hover:text-champagne-dark"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 bg-cream border-b border-border">
          <p className="text-[11px] text-muted">
            Shipping calculated at checkout · Lagos from {formatPrice(5)} · Nationwide {formatPrice(10)}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <EmptyState
              title="Your bag is empty"
              description="Add a piece you love and it will show up here."
              action={{ label: "Continue Shopping", href: "/shop", onClick: closeCart }}
              className="py-12"
            />
          ) : (
            items.map((item) => (
              <div key={item.variantId} className="flex gap-3">
                <Link href={`/products/${item.slug}`} onClick={closeCart} className="relative w-20 aspect-[4/5] shrink-0 bg-cream overflow-hidden">
                  <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`} onClick={closeCart}>
                    <h3 className="text-xs tracking-wide uppercase line-clamp-2 hover:text-champagne-dark">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-[10px] text-muted mt-1">
                    {item.length} · {item.color}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="inline-flex items-center border border-border">
                      <button type="button" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-1.5 hover:bg-cream" disabled={item.quantity <= 1}>
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="p-1.5 hover:bg-cream">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                  <button type="button" onClick={() => removeItem(item.variantId)} className="text-[10px] text-muted hover:text-crimson mt-2 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            ))
          )}

          {items.length > 0 && upsells.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-3">Complete the look</p>
              <div className="space-y-3">
                {upsells.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={closeCart}
                    className="flex gap-3 group"
                  >
                    <div className="relative w-14 aspect-[4/5] shrink-0 bg-cream overflow-hidden">
                      <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] tracking-wide uppercase line-clamp-2 group-hover:text-champagne-dark">
                        {p.name}
                      </p>
                      <p className="text-xs mt-1">{formatPrice(p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3 bg-white safe-pb">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-crimson">
                <span>{couponCode}</span>
                <span>-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-medium">
              <span>Est. Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Button href="/checkout" variant="primary" size="lg" className="w-full" onClick={closeCart}>
              Checkout
            </Button>
            <Button href="/cart" variant="outline" size="md" className="w-full" onClick={closeCart}>
              View Bag
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
