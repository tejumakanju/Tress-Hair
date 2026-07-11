"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CreditCard, Truck, Lock, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useCurrency, useFormatPrice } from "@/lib/currency-context";
import { Button } from "@/components/ui/Button";
import {
  makeTxRef,
  savePendingCheckout,
} from "@/lib/pending-checkout";
import {
  FLW_SUPPORTED_CURRENCIES,
  type FlwCurrency,
} from "@/lib/flutterwave-shared";
import { FALLBACK_RATES } from "@/lib/currency";
import {
  availableShippingMethods,
  defaultShippingMethodId,
  isNigeria,
  NIGERIAN_STATES,
  shippingCostUsd,
  suggestedCourier,
} from "@/lib/shipping";

function chargeCurrencyFor(display: string): FlwCurrency {
  const upper = display.toUpperCase();
  if ((FLW_SUPPORTED_CURRENCIES as readonly string[]).includes(upper)) {
    return upper as FlwCurrency;
  }
  return "NGN";
}

export function CheckoutPageClient() {
  const { items, subtotal, couponDiscount, couponCode } = useCart();
  const formatPrice = useFormatPrice();
  const { currency, rate } = useCurrency();
  const [isGuest, setIsGuest] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "Lagos",
    zip: "",
    country: "Nigeria",
    shippingMethod: "lagos_metro",
    giftMessage: "",
    orderNotes: "",
  });

  const methods = useMemo(
    () => availableShippingMethods(form.country, form.city, form.state),
    [form.country, form.city, form.state]
  );

  useEffect(() => {
    const next = defaultShippingMethodId(form.country, form.city, form.state);
    setForm((f) =>
      methods.some((m) => m.id === f.shippingMethod)
        ? f
        : { ...f, shippingMethod: next }
    );
  }, [form.country, form.city, form.state, methods]);

  const shipping = shippingCostUsd(form.shippingMethod);
  const taxRate = isNigeria(form.country) ? 0.075 : 0.08;
  const tax = (subtotal - couponDiscount) * taxRate;
  const totalUsd = subtotal - couponDiscount + shipping + tax;
  const payCurrency = chargeCurrencyFor(currency);
  const payRate =
    payCurrency === currency
      ? rate
      : (FALLBACK_RATES[payCurrency] ?? FALLBACK_RATES.NGN);
  const totalLocal = totalUsd * payRate;

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl tracking-[0.15em] uppercase mb-4">
          Checkout
        </h1>
        <p className="text-muted mb-8">Your cart is empty.</p>
        <Button href="/shop" variant="primary" size="lg">
          Shop Now
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProcessing(true);

    const txRef = makeTxRef();
    const pending = {
      txRef,
      amount: totalLocal,
      currency: payCurrency,
      amountUsd: totalUsd,
      customer: {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      },
      shipping: {
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country,
        method: form.shippingMethod,
      },
      items: [...items],
      subtotal,
      shippingCost: shipping,
      tax,
      discount: couponDiscount,
      total: totalUsd,
      notes: [form.giftMessage, form.orderNotes].filter(Boolean).join("\n") || undefined,
      createdAt: new Date().toISOString(),
    };

    savePendingCheckout(pending);

    try {
      const res = await fetch("/api/payments/flutterwave/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txRef,
          amountUsd: totalUsd,
          amount: totalLocal,
          currency: payCurrency,
          email: form.email,
          name: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone || undefined,
          meta: {
            country: form.country,
            shipping_method: form.shippingMethod,
            courier: suggestedCourier(form.shippingMethod),
          },
        }),
      });

      const data = (await res.json()) as { link?: string; error?: string };

      if (!res.ok || !data.link) {
        throw new Error(data.error || "Could not start Flutterwave checkout");
      }

      window.location.href = data.link;
    } catch (err) {
      setProcessing(false);
      setError(err instanceof Error ? err.message : "Payment failed to start");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <h1 className="font-serif text-3xl tracking-[0.15em] uppercase mb-8">
        Checkout
      </h1>

      <div className="flex gap-4 mb-8">
        <button
          type="button"
          onClick={() => setIsGuest(true)}
          className={`text-xs tracking-[0.15em] uppercase px-4 py-2 border ${isGuest ? "border-noir bg-noir text-white" : "border-border"}`}
        >
          Guest Checkout
        </button>
        <button
          type="button"
          onClick={() => setIsGuest(false)}
          className={`text-xs tracking-[0.15em] uppercase px-4 py-2 border ${!isGuest ? "border-noir bg-noir text-white" : "border-border"}`}
        >
          Account Checkout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white border border-border p-6">
            <h2 className="text-xs tracking-[0.15em] uppercase mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="col-span-full px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-champagne"
              />
              <input
                required
                type="text"
                placeholder="First name"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className="px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-champagne"
              />
              <input
                required
                type="text"
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className="px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-champagne"
              />
              <input
                required
                type="tel"
                placeholder="Phone (WhatsApp preferred)"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="col-span-full px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-champagne"
              />
            </div>
          </section>

          <section className="bg-white border border-border p-6">
            <h2 className="text-xs tracking-[0.15em] uppercase mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4" /> Shipping Address
            </h2>
            <div className="space-y-4">
              <input
                required
                type="text"
                placeholder="Address"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-champagne"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <input
                  required
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-champagne"
                />
                {isNigeria(form.country) ? (
                  <select
                    required
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    className="px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-champagne"
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    type="text"
                    placeholder="State / Province"
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    className="px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-champagne"
                  />
                )}
                <input
                  required
                  type="text"
                  placeholder={isNigeria(form.country) ? "LGA / ZIP" : "ZIP"}
                  value={form.zip}
                  onChange={(e) => update("zip", e.target.value)}
                  className="px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-champagne"
                />
              </div>
              <select
                value={form.country}
                onChange={(e) => {
                  const country = e.target.value;
                  update("country", country);
                  if (isNigeria(country) && !form.state) {
                    update("state", "Lagos");
                  }
                }}
                className="w-full px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-champagne"
              >
                <option>Nigeria</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Canada</option>
                <option>Ghana</option>
                <option>Kenya</option>
                <option>South Africa</option>
              </select>
            </div>
            <div className="mt-6 space-y-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted mb-1">
                Delivery method
              </p>
              {methods.map((method) => {
                const cost = shippingCostUsd(method.id);
                return (
                  <label
                    key={method.id}
                    className="flex items-center gap-3 p-3 border border-border cursor-pointer hover:border-champagne"
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={form.shippingMethod === method.id}
                      onChange={() => update("shippingMethod", method.id)}
                    />
                    <div className="flex-1 text-sm min-w-0">
                      <span className="font-medium">{method.label}</span>
                      <span className="text-muted block text-xs">
                        {method.eta} · {method.courier}
                      </span>
                      <span className="text-muted block text-[11px] mt-0.5">
                        {method.description}
                      </span>
                    </div>
                    <span className="text-sm shrink-0">{formatPrice(cost)}</span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="bg-white border border-border p-6">
            <h2 className="text-xs tracking-[0.15em] uppercase mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Payment
            </h2>
            <div className="border border-noir bg-noir text-white px-4 py-3 text-xs tracking-[0.15em] uppercase mb-4 inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-champagne" />
              Pay securely with Flutterwave
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-lg">
              You’ll complete payment on Flutterwave’s secure page — card, bank
              transfer, or USSD. You’ll return here automatically after paying.
            </p>
            <ul className="mt-4 text-xs text-muted space-y-1.5">
              <li>· Cards (local & international)</li>
              <li>· Bank transfer</li>
              <li>· USSD</li>
            </ul>
          </section>

          <section className="bg-white border border-border p-6">
            <h2 className="text-xs tracking-[0.15em] uppercase mb-4">
              Gift Message & Notes
            </h2>
            <textarea
              placeholder="Gift message (optional)"
              value={form.giftMessage}
              onChange={(e) => update("giftMessage", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border focus:outline-none focus:border-champagne resize-none h-16 mb-3"
            />
            <textarea
              placeholder="Order notes (optional)"
              value={form.orderNotes}
              onChange={(e) => update("orderNotes", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border focus:outline-none focus:border-champagne resize-none h-16"
            />
          </section>
        </div>

        <div className="bg-white border border-border p-6 h-fit sticky top-24">
          <h2 className="text-xs tracking-[0.15em] uppercase mb-4">
            Your Order
          </h2>
          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-3">
                <div className="relative w-14 aspect-[4/5] shrink-0 bg-cream overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                  <span className="absolute -top-1 -right-1 bg-noir text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs tracking-wide uppercase truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-muted">
                    {item.length} · {item.color}
                  </p>
                </div>
                <span className="text-xs shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-border pt-4 mb-6">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-crimson">
                <span>{couponCode}</span>
                <span>-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>
                {formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">
                {isNigeria(form.country) ? "VAT (7.5%)" : "Tax"}
              </span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between font-medium text-base pt-2 border-t border-border">
              <span>Total</span>
              <span>{formatPrice(totalUsd)}</span>
            </div>
            <p className="text-[10px] text-muted pt-1">
              Charged via Flutterwave in {payCurrency}
              {payCurrency !== currency ? ` (from ${currency})` : ""}
            </p>
          </div>

          {error && (
            <p className="text-xs text-crimson mb-4 leading-relaxed">{error}</p>
          )}

          <button
            type="submit"
            disabled={processing}
            className="w-full py-4 bg-noir text-white text-xs tracking-[0.2em] uppercase hover:bg-charcoal transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {processing
              ? "Redirecting to Flutterwave…"
              : `Pay ${formatPrice(totalUsd)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
