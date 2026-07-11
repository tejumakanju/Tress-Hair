import type { CurrencyCode } from "@/lib/currency";

/** Shared FX constants (safe for client + server). */
export const RATES_REVALIDATE_SECONDS = 3600; // 1 hour
export const RATES_CLIENT_TTL_MS = RATES_REVALIDATE_SECONDS * 1000;

export type RatesPayload = {
  rates: Record<CurrencyCode, number>;
  live: boolean;
  fetchedAt: string;
  source: "live" | "fallback";
};
