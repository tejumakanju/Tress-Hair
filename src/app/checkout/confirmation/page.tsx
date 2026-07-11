"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";
import { useFormatPrice } from "@/lib/currency-context";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const { orders } = useCart();
  const formatPrice = useFormatPrice();
  const order = orders.find((o) => o.id === orderId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <CheckCircle className="w-16 h-16 text-champagne mx-auto mb-6" strokeWidth={1} />
      <h1 className="font-serif text-3xl tracking-[0.15em] uppercase mb-4">Order Confirmed</h1>
      <p className="text-muted mb-2">Thank you for your purchase!</p>
      {orderId && (
        <p className="text-sm mb-8">
          Order <strong>{orderId}</strong>
          {order && <> · {formatPrice(order.total)}</>}
        </p>
      )}
      <p className="text-xs text-muted mb-8">
        A confirmation email has been sent to {order?.customer.email ?? "your email"}.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button href="/shop" variant="primary" size="lg">Continue Shopping</Button>
        <Button href="/account/orders" variant="outline" size="lg">Track Order</Button>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
