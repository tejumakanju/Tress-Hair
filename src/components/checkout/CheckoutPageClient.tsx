"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CreditCard, Truck, Lock, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useCurrency, useFormatPrice } from "@/lib/currency-context";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/states";
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
import {
  getUserError,
  paymentInitFailureCode,
  resolveApiErrorCode,
  UserErrorCode,
} from "@/lib/user-errors";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { FormField, FormSelect } from "@/components/ui/FormField";
import {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
  requiredMessage,
} from "@/lib/form-utils";
import { cn } from "@/lib/utils";

const GIFT_MAX = 200;
const NOTES_MAX = 500;

type FieldErrors = Partial<
  Record<
    | "email"
    | "firstName"
    | "lastName"
    | "phone"
    | "address"
    | "city"
    | "state"
    | "zip",
    string | null
  >
>;

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
  const { user, profile, ready: authReady } = useAuth();
  const [isGuest, setIsGuest] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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

  useEffect(() => {
    if (!authReady || prefilled) return;
    if (user) {
      setIsGuest(false);
      setForm((f) => ({
        ...f,
        email: user.email || f.email,
        firstName: profile?.firstName || f.firstName,
        lastName: profile?.lastName || f.lastName,
        phone: profile?.phone || f.phone,
      }));
      setPrefilled(true);
    }
  }, [authReady, user, profile, prefilled]);

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

  const update = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: null }));
  };

  const setFieldError = (field: keyof FieldErrors, message: string | null) => {
    setFieldErrors((e) => ({ ...e, [field]: message }));
  };

  const validateEmailField = () => {
    if (!form.email.trim()) {
      setFieldError("email", requiredMessage());
      return false;
    }
    if (!isValidEmail(form.email)) {
      setFieldError(
        "email",
        getUserError(UserErrorCode.VALIDATION_EMAIL).inline
      );
      return false;
    }
    setFieldError("email", null);
    return true;
  };

  const validatePhoneField = () => {
    if (!form.phone.trim()) {
      setFieldError("phone", requiredMessage());
      return false;
    }
    if (!isValidPhone(form.phone)) {
      setFieldError(
        "phone",
        getUserError(UserErrorCode.VALIDATION_PHONE).inline
      );
      return false;
    }
    setFieldError("phone", null);
    return true;
  };

  const validateRequired = (field: keyof FieldErrors, value: string) => {
    if (!value.trim()) {
      setFieldError(field, requiredMessage());
      return false;
    }
    setFieldError(field, null);
    return true;
  };

  const contactValid =
    isValidEmail(form.email) &&
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    isValidPhone(form.phone);

  const shippingValid =
    form.address.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.state.trim().length > 0 &&
    form.zip.trim().length > 0 &&
    form.country.trim().length > 0 &&
    Boolean(form.shippingMethod);

  const formValid = contactValid && shippingValid;
  const canPay = formValid && !processing;

  const missingHint = useMemo(() => {
    if (canPay || processing) return null;
    const missing: string[] = [];
    if (!isValidEmail(form.email)) missing.push("a valid email");
    if (!form.firstName.trim() || !form.lastName.trim())
      missing.push("your name");
    if (!isValidPhone(form.phone)) missing.push("a phone number");
    if (!shippingValid) missing.push("shipping details");
    if (missing.length === 0) return null;
    return `Add ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")} to continue.`;
  }, [canPay, processing, form, shippingValid]);

  if (items.length === 0) {
    const empty = getUserError(UserErrorCode.CART_EMPTY);
    return (
      <EmptyState
        title={empty.title}
        description={empty.description}
        action={
          empty.action?.href
            ? { label: empty.action.label, href: empty.action.href }
            : undefined
        }
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailOk = validateEmailField();
    const phoneOk = validatePhoneField();
    const firstOk = validateRequired("firstName", form.firstName);
    const lastOk = validateRequired("lastName", form.lastName);
    const addressOk = validateRequired("address", form.address);
    const cityOk = validateRequired("city", form.city);
    const stateOk = validateRequired("state", form.state);
    const zipOk = validateRequired("zip", form.zip);

    if (
      !emailOk ||
      !phoneOk ||
      !firstOk ||
      !lastOk ||
      !addressOk ||
      !cityOk ||
      !stateOk ||
      !zipOk ||
      !formValid
    ) {
      return;
    }

    setProcessing(true);

    const cleanEmail = normalizeEmail(form.email);
    const cleanPhone = normalizePhone(form.phone);

    const txRef = makeTxRef();
    const pending = {
      txRef,
      amount: totalLocal,
      currency: payCurrency,
      amountUsd: totalUsd,
      customer: {
        email: cleanEmail,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: cleanPhone,
      },
      shipping: {
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
        country: form.country,
        method: form.shippingMethod,
      },
      items: [...items],
      subtotal,
      shippingCost: shipping,
      tax,
      discount: couponDiscount,
      total: totalUsd,
      notes:
        [form.giftMessage, form.orderNotes].filter(Boolean).join("\n") ||
        undefined,
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
          email: cleanEmail,
          name: `${form.firstName} ${form.lastName}`.trim(),
          phone: cleanPhone || undefined,
          meta: {
            country: form.country,
            shipping_method: form.shippingMethod,
            courier: suggestedCourier(form.shippingMethod),
          },
        }),
      });

      const data = (await res.json()) as {
        link?: string;
        code?: string;
        error?: string;
      };

      if (!res.ok || !data.link) {
        const code = resolveApiErrorCode(
          data,
          res.status === 400
            ? UserErrorCode.PAYMENT_INVALID_REQUEST
            : UserErrorCode.PAYMENT_INIT_FAILED
        );
        setProcessing(false);
        setError(getUserError(code).inline);
        return;
      }

      window.location.href = data.link;
    } catch (err) {
      setProcessing(false);
      setError(getUserError(paymentInitFailureCode(err)).inline);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-12 pb-28 lg:pb-12">
      <h1 className="font-serif text-2xl sm:text-3xl tracking-[0.12em] sm:tracking-[0.15em] uppercase mb-6 md:mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4 mb-6 md:mb-8">
        <button
          type="button"
          onClick={() => setIsGuest(true)}
          className={`min-h-11 text-[10px] sm:text-xs tracking-[0.12em] sm:tracking-[0.15em] uppercase px-3 sm:px-4 py-2.5 border ${isGuest ? "border-noir bg-noir text-white" : "border-border"}`}
        >
          Guest Checkout
        </button>
        <button
          type="button"
          onClick={() => setIsGuest(false)}
          className={`min-h-11 text-[10px] sm:text-xs tracking-[0.12em] sm:tracking-[0.15em] uppercase px-3 sm:px-4 py-2.5 border ${!isGuest ? "border-noir bg-noir text-white" : "border-border"}`}
        >
          Account Checkout
        </button>
      </div>

      {!isGuest && authReady && !user ? (
        <div className="mb-8 border border-border bg-white p-6 text-center">
          <p className="text-sm text-muted mb-4 leading-relaxed">
            Sign in or create an account to prefill your details. You can still
            checkout as a guest.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              href="/account/login?next=/checkout"
              variant="primary"
              size="md"
            >
              Sign in
            </Button>
            <Button
              href="/account/signup?next=/checkout"
              variant="outline"
              size="md"
            >
              Create account
            </Button>
            <button
              type="button"
              onClick={() => setIsGuest(true)}
              className="text-xs tracking-[0.15em] uppercase text-muted hover:text-noir py-2"
            >
              Continue as guest
            </button>
          </div>
        </div>
      ) : null}

      {!isGuest && user ? (
        <p className="text-xs text-muted mb-6">
          Signed in as {user.email}.{" "}
          <Link href="/account" className="underline underline-offset-2">
            Manage account
          </Link>
        </p>
      ) : null}

      {(isGuest || user) && (
      <>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <section className="bg-white border border-border p-4 sm:p-6">
            <h2 className="text-xs tracking-[0.15em] uppercase mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                id="checkout-email"
                label="Email"
                required
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                onBlur={validateEmailField}
                autoComplete="email"
                error={fieldErrors.email}
                className="col-span-full"
              />
              <FormField
                id="checkout-first-name"
                label="First name"
                required
                value={form.firstName}
                onChange={(v) => update("firstName", v)}
                onBlur={() => validateRequired("firstName", form.firstName)}
                autoComplete="given-name"
                error={fieldErrors.firstName}
              />
              <FormField
                id="checkout-last-name"
                label="Last name"
                required
                value={form.lastName}
                onChange={(v) => update("lastName", v)}
                onBlur={() => validateRequired("lastName", form.lastName)}
                autoComplete="family-name"
                error={fieldErrors.lastName}
              />
              <FormField
                id="checkout-phone"
                label="Phone"
                required
                type="tel"
                value={form.phone}
                onChange={(v) => update("phone", v)}
                onBlur={() => {
                  const normalized = normalizePhone(form.phone);
                  update("phone", normalized);
                  if (!normalized) {
                    setFieldError("phone", requiredMessage());
                  } else if (!isValidPhone(normalized)) {
                    setFieldError(
                      "phone",
                      getUserError(UserErrorCode.VALIDATION_PHONE).inline
                    );
                  } else {
                    setFieldError("phone", null);
                  }
                }}
                autoComplete="tel"
                hint="WhatsApp preferred — any format is fine."
                error={fieldErrors.phone}
                className="col-span-full"
              />
            </div>
          </section>

          <section className="bg-white border border-border p-4 sm:p-6">
            <h2 className="text-xs tracking-[0.15em] uppercase mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4" /> Shipping Address
            </h2>
            <div className="space-y-4">
              <FormField
                id="checkout-address"
                label="Address"
                required
                value={form.address}
                onChange={(v) => update("address", v)}
                onBlur={() => validateRequired("address", form.address)}
                autoComplete="street-address"
                error={fieldErrors.address}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  id="checkout-city"
                  label="City"
                  required
                  value={form.city}
                  onChange={(v) => update("city", v)}
                  onBlur={() => validateRequired("city", form.city)}
                  autoComplete="address-level2"
                  error={fieldErrors.city}
                />
                {isNigeria(form.country) ? (
                  <FormSelect
                    id="checkout-state"
                    label="State"
                    required
                    value={form.state}
                    onChange={(v) => update("state", v)}
                    onBlur={() => validateRequired("state", form.state)}
                    error={fieldErrors.state}
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </FormSelect>
                ) : (
                  <FormField
                    id="checkout-state"
                    label="State / Province"
                    required
                    value={form.state}
                    onChange={(v) => update("state", v)}
                    onBlur={() => validateRequired("state", form.state)}
                    autoComplete="address-level1"
                    error={fieldErrors.state}
                  />
                )}
                <FormField
                  id="checkout-zip"
                  label={isNigeria(form.country) ? "LGA / ZIP" : "ZIP"}
                  required
                  value={form.zip}
                  onChange={(v) => update("zip", v)}
                  onBlur={() => validateRequired("zip", form.zip)}
                  autoComplete="postal-code"
                  error={fieldErrors.zip}
                />
              </div>
              <FormSelect
                id="checkout-country"
                label="Country"
                required
                value={form.country}
                onChange={(country) => {
                  update("country", country);
                  if (isNigeria(country) && !form.state) {
                    update("state", "Lagos");
                  }
                }}
              >
                <option>Nigeria</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Canada</option>
                <option>Ghana</option>
                <option>Kenya</option>
                <option>South Africa</option>
              </FormSelect>
            </div>
            <div className="mt-6 space-y-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted mb-1">
                Delivery method <span className="text-crimson">*</span>
              </p>
              {methods.map((method) => {
                const cost = shippingCostUsd(method.id);
                return (
                  <label
                    key={method.id}
                    className="flex items-center gap-3 p-3.5 min-h-[3.25rem] border border-border cursor-pointer hover:border-champagne active:bg-cream/50"
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

          <section className="bg-white border border-border p-4 sm:p-6">
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

          <section className="bg-white border border-border p-4 sm:p-6">
            <h2 className="text-xs tracking-[0.15em] uppercase mb-4">
              Gift Message & Notes
            </h2>
            <FormField
              as="textarea"
              id="checkout-gift"
              label="Gift message"
              value={form.giftMessage}
              onChange={(v) => update("giftMessage", v)}
              maxLength={GIFT_MAX}
              showCount
              rows={3}
              className="mb-3"
            />
            <FormField
              as="textarea"
              id="checkout-notes"
              label="Order notes"
              value={form.orderNotes}
              onChange={(v) => update("orderNotes", v)}
              maxLength={NOTES_MAX}
              showCount
              rows={3}
            />
          </section>
        </div>

        <div className="bg-white border border-border p-4 sm:p-6 h-fit lg:sticky lg:top-24">
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
            <p className="text-xs text-crimson mb-4 leading-relaxed" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canPay}
            className={cn(
              "hidden lg:flex w-full py-4 bg-noir text-white text-xs tracking-[0.2em] uppercase hover:bg-charcoal transition-colors disabled:opacity-50 items-center justify-center gap-2",
              !canPay && "cursor-not-allowed"
            )}
          >
            <Lock className="w-4 h-4" />
            {processing
              ? "Redirecting to Flutterwave…"
              : `Pay ${formatPrice(totalUsd)}`}
          </button>
          {missingHint ? (
            <p className="hidden lg:block text-xs text-muted text-center mt-2">
              {missingHint}
            </p>
          ) : null}
        </div>
      </form>

      {/* Mobile sticky pay — always reachable while scrolling the form */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-ivory/95 backdrop-blur border-t border-border px-4 pt-3 safe-pb">
        {error ? (
          <p className="text-xs text-crimson mb-2 leading-relaxed" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          disabled={!canPay}
          onClick={() => {
            const formEl = document.querySelector(
              "form"
            ) as HTMLFormElement | null;
            formEl?.requestSubmit();
          }}
          className={cn(
            "w-full min-h-12 py-3.5 bg-noir text-white text-xs tracking-[0.2em] uppercase disabled:opacity-50 flex items-center justify-center gap-2",
            !canPay && "cursor-not-allowed"
          )}
        >
          <Lock className="w-4 h-4" />
          {processing
            ? "Redirecting…"
            : `Pay ${formatPrice(totalUsd)}`}
        </button>
        {missingHint ? (
          <p className="text-[11px] text-muted text-center mt-2">{missingHint}</p>
        ) : null}
      </div>
      </>
      )}
    </div>
  );
}
