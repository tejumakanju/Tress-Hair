"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useFormatPrice } from "@/lib/currency-context";
import { getShippingMethod } from "@/lib/shipping";
import { EmptyState } from "@/components/ui/states";
import { useAuth } from "@/lib/auth-context";

export default function AccountOrdersPage() {
  const { orders } = useCart();
  const formatPrice = useFormatPrice();
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl tracking-[0.15em] uppercase mb-4">Your Orders</h1>
      <p className="text-muted text-sm mb-10">
        {user
          ? "Orders saved on this device. New purchases stay linked while you’re signed in."
          : "Orders from this device. Sign in to keep them across devices soon."}
      </p>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="When you complete a purchase, your orders and tracking will appear here."
          action={{ label: "Shop Now", href: "/shop" }}
          className="py-12 border border-border bg-white"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const method = getShippingMethod(order.shipping.method);
            return (
              <div key={order.id} className="border border-border bg-white p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                  <p className="font-mono text-sm">{order.id}</p>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-muted">
                    {order.status}
                  </p>
                </div>
                <p className="text-xs text-muted mb-2">
                  {new Date(order.date).toLocaleDateString()} · {formatPrice(order.total)}
                </p>
                <p className="text-xs text-muted mb-3">
                  {method?.label ?? order.shipping.method}
                  {order.courier ? ` · ${order.courier}` : ""}
                </p>
                {order.trackingNumber ? (
                  <p className="text-sm">
                    Tracking:{" "}
                    {order.trackingUrl ? (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-champagne-dark underline underline-offset-2"
                      >
                        {order.trackingNumber}
                      </a>
                    ) : (
                      <span className="font-mono">{order.trackingNumber}</span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-muted">Tracking will appear once your order ships.</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center mt-10">
        <Link href="/shipping-returns" className="text-xs tracking-wide uppercase text-muted hover:text-champagne-dark">
          Shipping & returns
        </Link>
      </p>
    </div>
  );
}
