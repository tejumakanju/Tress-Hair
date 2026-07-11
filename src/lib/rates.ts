import { unstable_cache } from "next/cache";
import {
  FALLBACK_RATES,
  type CurrencyCode,
} from "@/lib/currency";
import { CacheTag } from "@/lib/cache-tags";
import {
  RATES_REVALIDATE_SECONDS,
  type RatesPayload,
} from "@/lib/rates-shared";

export {
  RATES_REVALIDATE_SECONDS,
  RATES_CLIENT_TTL_MS,
  type RatesPayload,
} from "@/lib/rates-shared";

async function fetchLiveRates(): Promise<RatesPayload> {
  const fetchedAt = new Date().toISOString();
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: RATES_REVALIDATE_SECONDS, tags: [CacheTag.RATES] },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`rate HTTP ${res.status}`);
    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
    };
    if (data.result !== "success" || !data.rates) {
      throw new Error("bad rates payload");
    }

    const rates = { ...FALLBACK_RATES } as Record<CurrencyCode, number>;
    (Object.keys(FALLBACK_RATES) as CurrencyCode[]).forEach((code) => {
      if (data.rates?.[code]) rates[code] = data.rates[code];
    });

    return { rates, live: true, fetchedAt, source: "live" };
  } catch (err) {
    console.error("[rates]", err instanceof Error ? err.message : err);
    return {
      rates: { ...FALLBACK_RATES },
      live: false,
      fetchedAt,
      source: "fallback",
    };
  }
}

/** Server-cached USD FX rates (shared across requests). */
export const getCachedRates = unstable_cache(
  fetchLiveRates,
  ["usd-fx-rates"],
  { revalidate: RATES_REVALIDATE_SECONDS, tags: [CacheTag.RATES] }
);

export function rateFor(
  rates: Record<CurrencyCode, number>,
  currency: string
): number {
  const code = currency.toUpperCase() as CurrencyCode;
  return rates[code] ?? FALLBACK_RATES[code] ?? FALLBACK_RATES.NGN;
}
