/** Client-safe Flutterwave helpers (no secrets). */

export const FLW_SUPPORTED_CURRENCIES = [
  "NGN",
  "USD",
  "GBP",
  "EUR",
  "GHS",
  "KES",
  "ZAR",
] as const;

export type FlwCurrency = (typeof FLW_SUPPORTED_CURRENCIES)[number];

export function resolveChargeCurrency(displayCurrency: string): FlwCurrency {
  const upper = displayCurrency.toUpperCase();
  if ((FLW_SUPPORTED_CURRENCIES as readonly string[]).includes(upper)) {
    return upper as FlwCurrency;
  }
  return "NGN";
}
