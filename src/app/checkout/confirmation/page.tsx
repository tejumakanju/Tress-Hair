"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SuccessState, LoadingState } from "@/components/ui/states";
import { useCart } from "@/lib/cart-context";
import { useFormatPrice } from "@/lib/currency-context";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const { orders } = useCart();
  const formatPrice = useFormatPrice();
  const order = orders.find((o) => o.id === orderId);

  return (
    <SuccessState
      title="Order Confirmed"
      description="Thank you for your purchase. We’re preparing your order for dispatch."
      actions={[
        { label: "Continue Shopping", href: "/shop" },
        { label: "Track Order", href: "/account/orders" },
      ]}
    >
      {orderId && (
        <p className="text-sm mb-2">
          Order <strong>{orderId}</strong>
          {order && <> · {formatPrice(order.total)}</>}
        </p>
      )}
      <p className="text-xs text-muted">
        A confirmation email has been sent to {order?.customer.email ?? "your email"}.
      </p>
    </SuccessState>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading confirmation…" />}>
      <ConfirmationContent />
    </Suspense>
  );
}
