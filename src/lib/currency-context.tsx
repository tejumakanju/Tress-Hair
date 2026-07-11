"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  COUNTRY_CURRENCY,
  CURRENCIES,
  FALLBACK_RATES,
  SELECTABLE_CURRENCIES,
  formatMoney,
  type CurrencyCode,
} from "@/lib/currency";
import { RATES_CLIENT_TTL_MS } from "@/lib/rates-shared";

const STORAGE_KEY = "tresse-currency";
const RATES_STORAGE_KEY = "tresse-fx-rates";

type CachedRatesBlob = {
  rates: Record<CurrencyCode, number>;
  live: boolean;
  fetchedAt: number;
};

type CurrencyContextType = {
  currency: CurrencyCode;
  countryCode: string | null;
  rate: number;
  ready: boolean;
  /** False when using offline FALLBACK_RATES only */
  ratesLive: boolean;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountUsd: number) => string;
  selectable: CurrencyCode[];
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

async function detectCountry(): Promise<string | null> {
  try {
    const res = await fetch("https://api.country.is/", {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { country?: string };
    return data.country?.toUpperCase() ?? null;
  } catch {
    try {
      const res = await fetch("https://ipapi.co/country_code/", {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return null;
      const text = (await res.text()).trim().toUpperCase();
      return text.length === 2 ? text : null;
    } catch {
      return null;
    }
  }
}

function readRatesCache(): CachedRatesBlob | null {
  try {
    const raw = localStorage.getItem(RATES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRatesBlob;
    if (!parsed?.rates || !parsed.fetchedAt) return null;
    if (Date.now() - parsed.fetchedAt > RATES_CLIENT_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeRatesCache(blob: CachedRatesBlob) {
  try {
    localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(blob));
  } catch {
    // quota / private mode
  }
}

async function fetchRates(): Promise<{
  rates: Partial<Record<CurrencyCode, number>>;
  live: boolean;
}> {
  const cached = readRatesCache();
  if (cached) {
    return { rates: cached.rates, live: cached.live };
  }

  try {
    const res = await fetch("/api/rates", {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error("rate fetch failed");
    const data = (await res.json()) as {
      rates?: Record<CurrencyCode, number>;
      live?: boolean;
    };
    if (!data.rates) throw new Error("bad rates");

    const rates = { ...FALLBACK_RATES, ...data.rates };
    writeRatesCache({
      rates,
      live: Boolean(data.live),
      fetchedAt: Date.now(),
    });
    return { rates, live: Boolean(data.live) };
  } catch {
    return { rates: { ...FALLBACK_RATES }, live: false };
  }
}

function currencyFromLocale(): CurrencyCode {
  if (typeof navigator === "undefined") return "NGN";
  const lang = navigator.language || "";
  if (lang.includes("NG") || lang.toLowerCase().includes("en-ng")) return "NGN";
  if (lang.startsWith("en-GB")) return "GBP";
  if (lang.startsWith("en-CA")) return "CAD";
  if (lang.startsWith("en-AU")) return "AUD";
  if (lang.startsWith("fr") || lang.startsWith("de") || lang.startsWith("es"))
    return "EUR";
  if (lang.startsWith("en-US")) return "USD";
  return "NGN";
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("NGN");
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [rates, setRates] =
    useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
  const [ready, setReady] = useState(false);
  const [ratesLive, setRatesLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      const hasManual = stored && stored in FALLBACK_RATES;

      const [country, rateResult] = await Promise.all([
        detectCountry(),
        fetchRates(),
      ]);
      if (cancelled) return;

      setRates({ ...FALLBACK_RATES, ...rateResult.rates });
      setRatesLive(rateResult.live);

      if (hasManual) {
        setCurrencyState(stored);
      } else if (country && COUNTRY_CURRENCY[country]) {
        setCountryCode(country);
        setCurrencyState(COUNTRY_CURRENCY[country]);
      } else if (country) {
        setCountryCode(country);
        setCurrencyState(currencyFromLocale());
      } else {
        setCurrencyState(currencyFromLocale());
      }

      setReady(true);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 1;

  const formatPrice = useCallback(
    (amountUsd: number) => formatMoney(amountUsd, currency, rate),
    [currency, rate]
  );

  const value = useMemo(
    () => ({
      currency,
      countryCode,
      rate,
      ready,
      ratesLive,
      setCurrency,
      formatPrice,
      selectable: SELECTABLE_CURRENCIES,
    }),
    [currency, countryCode, rate, ready, ratesLive, setCurrency, formatPrice]
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

export function useFormatPrice() {
  return useCurrency().formatPrice;
}

export { CURRENCIES };
