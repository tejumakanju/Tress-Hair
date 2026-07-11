/** Server-side Flutterwave Standard helpers (v3). */

export {
  FLW_SUPPORTED_CURRENCIES,
  resolveChargeCurrency,
  type FlwCurrency,
} from "@/lib/flutterwave-shared";

const FLW_BASE = "https://api.flutterwave.com/v3";

export type FlutterwaveInitPayload = {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: {
    email: string;
    name: string;
    phonenumber?: string;
  };
  meta?: Record<string, string>;
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  payment_options?: string;
};

export type FlutterwaveInitResult = {
  status: string;
  message: string;
  data?: { link: string };
};

export type FlutterwaveVerifyResult = {
  status: string;
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: string;
    payment_type?: string;
    customer?: { email?: string; name?: string };
  };
};

function secretKey() {
  const key = process.env.FLW_SECRET_KEY;
  if (!key) {
    throw new Error(
      "FLW_SECRET_KEY is not set. Add your Flutterwave secret key to .env.local"
    );
  }
  return key;
}

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export async function initializeFlutterwavePayment(
  payload: FlutterwaveInitPayload
): Promise<FlutterwaveInitResult> {
  const res = await fetch(`${FLW_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      payment_options:
        payload.payment_options ?? "card,banktransfer,ussd,account",
      customizations: {
        title: "Tressé Hair",
        description: "Luxury wigs, bundles & frontals",
        logo: `${siteUrl()}/logo-footer.png`,
        ...payload.customizations,
      },
    }),
  });

  const json = (await res.json()) as FlutterwaveInitResult;
  if (!res.ok || json.status !== "success" || !json.data?.link) {
    throw new Error(json.message || "Failed to initialize Flutterwave payment");
  }
  return json;
}

export async function verifyFlutterwaveTransaction(
  transactionId: string | number
): Promise<FlutterwaveVerifyResult> {
  const res = await fetch(`${FLW_BASE}/transactions/${transactionId}/verify`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
  });

  const json = (await res.json()) as FlutterwaveVerifyResult;
  if (!res.ok) {
    throw new Error(json.message || "Failed to verify Flutterwave payment");
  }
  return json;
}
