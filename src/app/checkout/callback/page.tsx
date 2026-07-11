"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import {
  clearPendingCheckout,
  loadPendingCheckout,
} from "@/lib/pending-checkout";
import { suggestedCourier } from "@/lib/shipping";
import { ErrorState, LoadingState } from "@/components/ui/states";
import {
  getUserError,
  resolveApiErrorCode,
  UserCopy,
  UserErrorCode,
  type UserError,
} from "@/lib/user-errors";

type VerifyResponse = {
  paid?: boolean;
  code?: string;
  error?: string;
  txRef?: string;
  amount?: number;
  currency?: string;
};

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { placeOrder } = useCart();
  const [userError, setUserError] = useState<UserError | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const status = searchParams.get("status");
      const txRef = searchParams.get("tx_ref");
      const transactionId = searchParams.get("transaction_id");

      if (status === "cancelled" || status === "failed") {
        setUserError(getUserError(UserErrorCode.PAYMENT_CANCELLED));
        return;
      }

      const pending = loadPendingCheckout();
      if (!pending) {
        setUserError(getUserError(UserErrorCode.PAYMENT_SESSION_EXPIRED));
        return;
      }

      if (txRef && pending.txRef !== txRef) {
        setUserError(getUserError(UserErrorCode.PAYMENT_REF_MISMATCH));
        return;
      }

      if (!transactionId) {
        setUserError(getUserError(UserErrorCode.PAYMENT_MISSING_TX));
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
          setUserError(
            getUserError(
              resolveApiErrorCode(data, UserErrorCode.PAYMENT_NOT_CONFIRMED)
            )
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
      } catch (err) {
        if (!cancelled) {
          const code =
            typeof navigator !== "undefined" && !navigator.onLine
              ? UserErrorCode.OFFLINE
              : err instanceof TypeError
                ? UserErrorCode.PAYMENT_VERIFY_NETWORK
                : UserErrorCode.PAYMENT_VERIFY_FAILED;
          setUserError(getUserError(code));
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams, placeOrder, router]);

  if (userError) {
    return (
      <ErrorState
        title={userError.title}
        description={userError.description}
        action={
          userError.action?.href
            ? {
                label: userError.action.label,
                href: userError.action.href,
              }
            : userError.action
              ? { label: userError.action.label, href: "/checkout" }
              : { label: "Back to checkout", href: "/checkout" }
        }
        secondaryAction={
          userError.secondaryAction?.href
            ? {
                label: userError.secondaryAction.label,
                href: userError.secondaryAction.href,
              }
            : undefined
        }
      />
    );
  }

  return <LoadingState label={UserCopy.PAYMENT_CONFIRMING} />;
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <CallbackContent />
    </Suspense>
  );
}
