/** Catalog prices are stored in USD and converted for display. */

export type CurrencyCode =
  | "USD"
  | "NGN"
  | "GBP"
  | "EUR"
  | "CAD"
  | "AUD"
  | "GHS"
  | "KES"
  | "ZAR"
  | "XOF"
  | "AED"
  | "INR";

export type CurrencyInfo = {
  code: CurrencyCode;
  locale: string;
  name: string;
  countryHint?: string;
};

/** Country ISO → currency (Nigeria-first markets + common shoppers) */
export const COUNTRY_CURRENCY: Record<string, CurrencyCode> = {
  NG: "NGN",
  US: "USD",
  GB: "GBP",
  IE: "EUR",
  FR: "EUR",
  DE: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  PT: "EUR",
  AT: "EUR",
  CA: "CAD",
  AU: "AUD",
  NZ: "AUD",
  GH: "GHS",
  KE: "KES",
  ZA: "ZAR",
  SN: "XOF",
  CI: "XOF",
  BJ: "XOF",
  TG: "XOF",
  BF: "XOF",
  ML: "XOF",
  AE: "AED",
  IN: "INR",
};

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: "USD", locale: "en-US", name: "US Dollar" },
  NGN: { code: "NGN", locale: "en-NG", name: "Nigerian Naira", countryHint: "NG" },
  GBP: { code: "GBP", locale: "en-GB", name: "British Pound" },
  EUR: { code: "EUR", locale: "de-DE", name: "Euro" },
  CAD: { code: "CAD", locale: "en-CA", name: "Canadian Dollar" },
  AUD: { code: "AUD", locale: "en-AU", name: "Australian Dollar" },
  GHS: { code: "GHS", locale: "en-GH", name: "Ghanaian Cedi" },
  KES: { code: "KES", locale: "en-KE", name: "Kenyan Shilling" },
  ZAR: { code: "ZAR", locale: "en-ZA", name: "South African Rand" },
  XOF: { code: "XOF", locale: "fr-SN", name: "West African CFA" },
  AED: { code: "AED", locale: "en-AE", name: "UAE Dirham" },
  INR: { code: "INR", locale: "en-IN", name: "Indian Rupee" },
};

/** Offline fallback rates: 1 USD = X local (approx.) */
export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  NGN: 1600,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.36,
  AUD: 1.53,
  GHS: 15.5,
  KES: 129,
  ZAR: 18.2,
  XOF: 605,
  AED: 3.67,
  INR: 83.5,
};

export const SELECTABLE_CURRENCIES: CurrencyCode[] = [
  "NGN",
  "USD",
  "GBP",
  "EUR",
  "CAD",
  "GHS",
  "KES",
  "ZAR",
];

export function formatMoney(
  amountUsd: number,
  currency: CurrencyCode,
  rate: number
): string {
  const converted = amountUsd * rate;
  const info = CURRENCIES[currency];
  const zeroDecimal = currency === "XOF";

  try {
    return new Intl.NumberFormat(info.locale, {
      style: "currency",
      currency,
      maximumFractionDigits: zeroDecimal ? 0 : currency === "NGN" ? 0 : 2,
      minimumFractionDigits: zeroDecimal || currency === "NGN" ? 0 : 2,
    }).format(converted);
  } catch {
    return `${currency} ${converted.toFixed(currency === "NGN" ? 0 : 2)}`;
  }
}
