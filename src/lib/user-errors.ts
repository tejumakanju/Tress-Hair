/**
 * User-facing error catalog for Tressé Hair.
 * APIs return `code`; UI maps via `getUserError`. Raw provider messages stay in server logs only.
 */

export const UserErrorCode = {
  UNEXPECTED: "UNEXPECTED",
  OFFLINE: "OFFLINE",
  NETWORK: "NETWORK",

  PAYMENT_INIT_FAILED: "PAYMENT_INIT_FAILED",
  PAYMENT_INVALID_REQUEST: "PAYMENT_INVALID_REQUEST",
  PAYMENT_CANCELLED: "PAYMENT_CANCELLED",
  PAYMENT_SESSION_EXPIRED: "PAYMENT_SESSION_EXPIRED",
  PAYMENT_REF_MISMATCH: "PAYMENT_REF_MISMATCH",
  PAYMENT_MISSING_TX: "PAYMENT_MISSING_TX",
  PAYMENT_NOT_CONFIRMED: "PAYMENT_NOT_CONFIRMED",
  PAYMENT_VERIFY_FAILED: "PAYMENT_VERIFY_FAILED",
  PAYMENT_VERIFY_NETWORK: "PAYMENT_VERIFY_NETWORK",

  CART_EMPTY: "CART_EMPTY",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  STOCK_LIMIT: "STOCK_LIMIT",
  CART_ITEMS_UNAVAILABLE: "CART_ITEMS_UNAVAILABLE",

  VALIDATION_EMAIL: "VALIDATION_EMAIL",
  VALIDATION_PHONE: "VALIDATION_PHONE",
  VALIDATION_REQUIRED: "VALIDATION_REQUIRED",
  VALIDATION_SHIPPING: "VALIDATION_SHIPPING",

  AUTH_INVALID: "AUTH_INVALID",
  AUTH_SESSION: "AUTH_SESSION",
  AUTH_EXISTS: "AUTH_EXISTS",
  AUTH_WEAK_PASSWORD: "AUTH_WEAK_PASSWORD",
  AUTH_EMAIL_UNCONFIRMED: "AUTH_EMAIL_UNCONFIRMED",
  ORDERS_LOAD_FAILED: "ORDERS_LOAD_FAILED",

  WISHLIST_UPDATE_FAILED: "WISHLIST_UPDATE_FAILED",
  CONTACT_SEND_FAILED: "CONTACT_SEND_FAILED",
  RATES_OFFLINE: "RATES_OFFLINE",
} as const;

export type UserErrorCode =
  (typeof UserErrorCode)[keyof typeof UserErrorCode];

export type UserErrorAction = {
  label: string;
  href?: string;
};

export type UserError = {
  code: UserErrorCode;
  title: string;
  description: string;
  /** Short line for inline banners / toasts */
  inline: string;
  action?: UserErrorAction;
  secondaryAction?: UserErrorAction;
};

const CONTACT = { label: "Contact support", href: "/contact" } as const;
const CHECKOUT = { label: "Back to checkout", href: "/checkout" } as const;
const CART = { label: "View cart", href: "/cart" } as const;
const SHOP = { label: "Shop", href: "/shop" } as const;

const CATALOG: Record<UserErrorCode, Omit<UserError, "code">> = {
  [UserErrorCode.UNEXPECTED]: {
    title: "Something went wrong",
    description:
      "We hit an unexpected issue loading this page. Try again or continue shopping.",
    inline: "Something went wrong. Please try again.",
    action: { label: "Try again" },
    secondaryAction: SHOP,
  },
  [UserErrorCode.OFFLINE]: {
    title: "You’re offline",
    description: "Check your connection, then try again.",
    inline: "You’re offline. Check your connection and try again.",
    action: { label: "Try again" },
  },
  [UserErrorCode.NETWORK]: {
    title: "Connection issue",
    description: "Check your network and try again.",
    inline: "Connection issue. Check your network and try again.",
    action: { label: "Try again" },
  },

  [UserErrorCode.PAYMENT_INIT_FAILED]: {
    title: "Couldn’t start payment",
    description:
      "We couldn’t start payment. Please try again in a moment.",
    inline: "We couldn’t start payment. Please try again in a moment.",
    action: CHECKOUT,
    secondaryAction: CART,
  },
  [UserErrorCode.PAYMENT_INVALID_REQUEST]: {
    title: "Couldn’t start payment",
    description:
      "Some checkout details look incomplete. Please review your information and try again.",
    inline:
      "Some checkout details look incomplete. Please review and try again.",
    action: CHECKOUT,
  },
  [UserErrorCode.PAYMENT_CANCELLED]: {
    title: "Payment not completed",
    description:
      "Payment wasn’t completed. Your card wasn’t charged for this attempt.",
    inline:
      "Payment wasn’t completed. Your card wasn’t charged for this attempt.",
    action: CHECKOUT,
    secondaryAction: CART,
  },
  [UserErrorCode.PAYMENT_SESSION_EXPIRED]: {
    title: "Checkout expired",
    description:
      "Your checkout session expired. Please place the order again.",
    inline: "Your checkout session expired. Please place the order again.",
    action: CART,
    secondaryAction: CHECKOUT,
  },
  [UserErrorCode.PAYMENT_REF_MISMATCH]: {
    title: "Payment not confirmed",
    description:
      "We couldn’t confirm this payment. If you were charged, contact support with your bank receipt.",
    inline:
      "We couldn’t confirm this payment. If you were charged, contact support with your receipt.",
    action: CONTACT,
    secondaryAction: CHECKOUT,
  },
  [UserErrorCode.PAYMENT_MISSING_TX]: {
    title: "Payment not confirmed",
    description:
      "We couldn’t confirm this payment. If you were charged, contact support with your bank receipt.",
    inline:
      "We couldn’t confirm this payment. If you were charged, contact support with your receipt.",
    action: CONTACT,
    secondaryAction: CHECKOUT,
  },
  [UserErrorCode.PAYMENT_NOT_CONFIRMED]: {
    title: "Payment not confirmed",
    description:
      "Payment not confirmed. If you were charged, contact support with your receipt — don’t pay again.",
    inline:
      "Payment not confirmed. If you were charged, contact support with your receipt — don’t pay again.",
    action: CONTACT,
    secondaryAction: CHECKOUT,
  },
  [UserErrorCode.PAYMENT_VERIFY_FAILED]: {
    title: "Payment not confirmed",
    description:
      "We couldn’t verify your payment. If you were charged, contact support with your receipt — don’t pay again.",
    inline:
      "We couldn’t verify your payment. If you were charged, contact support with your receipt — don’t pay again.",
    action: CONTACT,
    secondaryAction: CHECKOUT,
  },
  [UserErrorCode.PAYMENT_VERIFY_NETWORK]: {
    title: "Couldn’t verify payment",
    description:
      "We couldn’t verify payment just now. Don’t pay again — contact support if you were charged.",
    inline:
      "We couldn’t verify payment just now. Don’t pay again — contact support if you were charged.",
    action: CONTACT,
    secondaryAction: CHECKOUT,
  },

  [UserErrorCode.CART_EMPTY]: {
    title: "Nothing to checkout",
    description: "Your cart is empty. Add something beautiful first.",
    inline: "Your cart is empty.",
    action: { label: "Shop Now", href: "/shop" },
  },
  [UserErrorCode.OUT_OF_STOCK]: {
    title: "Unavailable",
    description: "This piece is currently unavailable.",
    inline: "This piece is currently unavailable.",
    action: SHOP,
  },
  [UserErrorCode.STOCK_LIMIT]: {
    title: "Limited stock",
    description: "Only a few left — quantity was updated to match availability.",
    inline: "Only a few left — quantity updated.",
  },
  [UserErrorCode.CART_ITEMS_UNAVAILABLE]: {
    title: "Bag updated",
    description:
      "Some items are no longer available. Review your bag before continuing.",
    inline: "Some items are no longer available. Review your bag.",
    action: CART,
  },

  [UserErrorCode.VALIDATION_EMAIL]: {
    title: "Invalid email",
    description: "Enter a valid email address.",
    inline: "Enter a valid email address.",
  },
  [UserErrorCode.VALIDATION_PHONE]: {
    title: "Invalid phone",
    description: "Enter a valid phone number.",
    inline: "Enter a valid phone number.",
  },
  [UserErrorCode.VALIDATION_REQUIRED]: {
    title: "Required",
    description: "This field is required.",
    inline: "This field is required.",
  },
  [UserErrorCode.VALIDATION_SHIPPING]: {
    title: "Shipping required",
    description: "Choose a shipping option.",
    inline: "Choose a shipping option.",
  },

  [UserErrorCode.AUTH_INVALID]: {
    title: "Sign in failed",
    description: "Email or password doesn’t match.",
    inline: "Email or password doesn’t match.",
  },
  [UserErrorCode.AUTH_SESSION]: {
    title: "Session expired",
    description: "Please sign in again to continue.",
    inline: "Please sign in again to continue.",
  },
  [UserErrorCode.AUTH_EXISTS]: {
    title: "Account exists",
    description:
      "An account with this email already exists. Sign in instead.",
    inline:
      "An account with this email already exists. Sign in instead.",
  },
  [UserErrorCode.AUTH_WEAK_PASSWORD]: {
    title: "Password too weak",
    description: "Choose a stronger password that meets the rules below.",
    inline: "Choose a stronger password that meets the rules below.",
  },
  [UserErrorCode.AUTH_EMAIL_UNCONFIRMED]: {
    title: "Confirm your email",
    description:
      "Check your inbox for a confirmation link, then sign in.",
    inline: "Check your inbox for a confirmation link, then sign in.",
  },
  [UserErrorCode.ORDERS_LOAD_FAILED]: {
    title: "Couldn’t load orders",
    description: "We couldn’t load your orders. Try again.",
    inline: "We couldn’t load your orders. Try again.",
    action: { label: "Try again" },
  },

  [UserErrorCode.WISHLIST_UPDATE_FAILED]: {
    title: "Wishlist",
    description: "Couldn’t update wishlist — try again.",
    inline: "Couldn’t update wishlist — try again.",
  },
  [UserErrorCode.CONTACT_SEND_FAILED]: {
    title: "Message not sent",
    description:
      "Message couldn’t send. Try again or email us directly.",
    inline: "Message couldn’t send. Try again or email us directly.",
  },
  [UserErrorCode.RATES_OFFLINE]: {
    title: "Estimated rates",
    description: "Showing estimated conversion.",
    inline: "Showing estimated conversion.",
  },
};

export function getUserError(code: UserErrorCode | string | null | undefined): UserError {
  const key =
    code && code in CATALOG
      ? (code as UserErrorCode)
      : UserErrorCode.UNEXPECTED;
  return { code: key, ...CATALOG[key] };
}

export function isUserErrorCode(value: unknown): value is UserErrorCode {
  return typeof value === "string" && value in CATALOG;
}

/** Soft success / status lines (toasts, subtle UI) — not errors. */
export const UserCopy = {
  CONTACT_SENT: "Message sent — we’ll reply soon.",
  WISHLIST_SAVED: "Saved to wishlist",
  WISHLIST_REMOVED: "Removed from wishlist",
  ADDED_TO_BAG: (name: string) => `Added ${name}`,
  LINK_COPIED: "Link copied",
  PAYMENT_CONFIRMING: "Confirming your payment…",
  AUTH_SIGNED_IN: "Welcome back",
  AUTH_SIGNED_UP: "Account created — check your email to confirm",
  AUTH_SIGNED_UP_READY: "Account created — you’re signed in",
  AUTH_RESET_SENT: "Password reset link sent — check your email",
  AUTH_SIGNED_OUT: "Signed out",
} as const;

/**
 * Map API JSON (`code` preferred; ignore raw `error` strings that aren't codes).
 */
export function resolveApiErrorCode(
  data: { code?: string; error?: string } | null | undefined,
  fallback: UserErrorCode
): UserErrorCode {
  if (data?.code && isUserErrorCode(data.code)) return data.code;
  if (data?.error && isUserErrorCode(data.error)) return data.error;
  return fallback;
}

/** Classify thrown/network failures for payment init. */
export function paymentInitFailureCode(err: unknown): UserErrorCode {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return UserErrorCode.OFFLINE;
  }
  if (err instanceof TypeError) {
    return UserErrorCode.NETWORK;
  }
  return UserErrorCode.PAYMENT_INIT_FAILED;
}
