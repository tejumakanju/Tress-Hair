"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Bookmark, Tag } from "lucide-react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useFormatPrice } from "@/lib/currency-context";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/states";
import { shippingCostUsd } from "@/lib/shipping";

export function CartPageClient() {
  const {
    items,
    subtotal,
    couponCode,
    couponDiscount,
    updateQuantity,
    removeItem,
    saveForLater,
    savedForLater,
    moveToCart,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const formatPrice = useFormatPrice();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState(false);
  const [notes, setNotes] = useState("");

  const shipping = shippingCostUsd("nigeria_nationwide");
  const tax = (subtotal - couponDiscount) * 0.075;
  const total = subtotal - couponDiscount + shipping + tax;

  if (items.length === 0 && savedForLater.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Time to treat yourself — browse wigs, bundles, and frontals."
          action={{ label: "Continue Shopping", href: "/shop" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <h1 className="font-serif text-3xl tracking-[0.15em] uppercase mb-8">Your Cart</h1>

      <div className="mb-8 p-4 bg-cream">
        <p className="text-xs text-muted">
          Shipping calculated at checkout · Lagos from {formatPrice(5)} · Nationwide {formatPrice(10)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4 bg-white border border-border p-4">
              <Link href={`/products/${item.slug}`} className="relative w-24 aspect-[4/5] shrink-0 bg-cream overflow-hidden">
                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`}>
                  <h3 className="text-sm tracking-wide uppercase hover:text-champagne-dark">{item.name}</h3>
                </Link>
                <p className="text-xs text-muted mt-1">
                  {item.length} · {item.density} · {item.color}
                  {item.capSize && ` · ${item.capSize}`}
                </p>
                <p className="text-xs text-muted">SKU: {item.sku}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="inline-flex items-center border border-border">
                    <button type="button" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-2 hover:bg-cream" disabled={item.quantity <= 1}>
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="p-2 hover:bg-cream">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
                <div className="flex gap-4 mt-2">
                  <button type="button" onClick={() => saveForLater(item.variantId)} className="text-[10px] text-muted hover:text-champagne-dark flex items-center gap-1">
                    <Bookmark className="w-3 h-3" /> Save for later
                  </button>
                  <button type="button" onClick={() => removeItem(item.variantId)} className="text-[10px] text-muted hover:text-crimson flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {savedForLater.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xs tracking-[0.15em] uppercase mb-4">Saved for Later</h2>
              {savedForLater.map((item) => (
                <div key={item.variantId} className="flex gap-4 bg-cream border border-border p-4 mb-2 opacity-75">
                  <div className="relative w-16 aspect-[4/5] shrink-0 bg-white overflow-hidden">
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs tracking-wide uppercase">{item.name}</h3>
                    <button type="button" onClick={() => moveToCart(item.variantId)} className="text-[10px] text-champagne-dark mt-2 hover:underline">
                      Move to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-border p-6 h-fit sticky top-24">
          <h2 className="text-xs tracking-[0.15em] uppercase mb-6">Order Summary</h2>
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-crimson"><span>Discount ({couponCode})</span><span>-{formatPrice(couponDiscount)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-muted">Shipping (est.)</span><span>{formatPrice(shipping)}</span></div>
            <div className="flex justify-between"><span className="text-muted">VAT (7.5% est.)</span><span>{formatPrice(tax)}</span></div>
            <div className="flex justify-between font-medium text-base pt-3 border-t border-border"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
          <div className="mb-6">
            {couponCode ? (
              <div className="flex items-center justify-between text-xs bg-cream p-3">
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {couponCode}</span>
                <button type="button" onClick={removeCoupon} className="text-crimson hover:underline">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input type="text" value={couponInput} onChange={(e) => { setCouponInput(e.target.value); setCouponError(false); }} placeholder="Coupon code" className="flex-1 px-3 py-2 text-xs border border-border focus:outline-none focus:border-champagne" />
                <button type="button" onClick={() => { if (!applyCoupon(couponInput)) setCouponError(true); }} className="px-4 py-2 text-xs tracking-widest uppercase border border-noir hover:bg-noir hover:text-white transition-colors">Apply</button>
              </div>
            )}
            {couponError && <p className="text-xs text-crimson mt-1">Invalid coupon code</p>}
          </div>
          <Button href="/checkout" variant="primary" size="lg" className="w-full mb-3">Checkout</Button>
          <Button href="/shop" variant="outline" size="md" className="w-full">Continue Shopping</Button>
        </div>
      </div>
    </div>
  );
}
