"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import {
  clearPendingCheckout,
  loadPendingCheckout,
} from "@/lib/pending-checkout";
import { suggestedCourier } from "@/lib/shipping";
import { Button } from "@/components/ui/Button";

type VerifyResponse = {
  paid?: boolean;
  error?: string;
  txRef?: string;
  amount?: number;
  currency?: string;
};

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { placeOrder } = useCart();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const status = searchParams.get("status");
      const txRef = searchParams.get("tx_ref");
      const transactionId = searchParams.get("transaction_id");

      if (status === "cancelled" || status === "failed") {
        setError("Payment was cancelled or failed. You can try again from checkout.");
        return;
      }

      const pending = loadPendingCheckout();
      if (!pending) {
        setError("We couldn’t find your checkout session. Please place the order again.");
        return;
      }

      if (txRef && pending.txRef !== txRef) {
        setError("Payment reference mismatch. Please contact support if you were charged.");
        return;
      }

      if (!transactionId) {
        setError("Missing transaction ID from Flutterwave. Please contact support if you were charged.");
        return;
      }

      try {
        const qs = new URLSearchParams({
          transaction_id: transactionId,
          tx_ref: pending.txRef,
          amount: String(pending.amount),
          currency: pending.currency,
        });
        const res = await fetch(`/api/payments/flutterwave/verify?${qs}`);
        const data = (await res.json()) as VerifyResponse;

        if (cancelled) return;

        if (!res.ok || !data.paid) {
          setError(
            data.error ||
              "We couldn’t verify your payment. If you were charged, contact support with your receipt."
          );
          return;
        }

        const order = placeOrder({
          customer: pending.customer,
          shipping: pending.shipping,
          items: pending.items,
          subtotal: pending.subtotal,
          shippingCost: pending.shippingCost,
          tax: pending.tax,
          discount: pending.discount,
          total: pending.total,
          paymentMethod: "flutterwave",
          notes: pending.notes,
          courier: suggestedCourier(pending.shipping.method),
        });

        clearPendingCheckout();
        router.replace(`/checkout/confirmation?order=${order.id}`);
      } catch {
        if (!cancelled) {
          setError("Something went wrong verifying payment. Please try again.");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams, placeOrder, router]);

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <XCircle className="w-14 h-14 text-crimson mx-auto mb-6" strokeWidth={1} />
        <h1 className="font-serif text-2xl tracking-[0.12em] uppercase mb-3">
          Payment not confirmed
        </h1>
        <p className="text-sm text-muted mb-8">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/checkout" variant="primary" size="lg">
            Back to checkout
          </Button>
          <Button href="/cart" variant="outline" size="lg">
            View cart
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <Loader2 className="w-10 h-10 text-champagne mx-auto mb-6 animate-spin" strokeWidth={1.5} />
      <h1 className="font-serif text-2xl tracking-[0.12em] uppercase mb-3">
        Confirming payment
      </h1>
      <p className="text-sm text-muted">
        Please wait while we verify your Flutterwave payment…
      </p>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-muted text-sm">Loading…</div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
