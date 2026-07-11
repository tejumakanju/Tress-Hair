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

const STORAGE_KEY = "tresse-currency";

type CurrencyContextType = {
  currency: CurrencyCode;
  countryCode: string | null;
  rate: number;
  ready: boolean;
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

async function fetchRates(): Promise<Partial<Record<CurrencyCode, number>>> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error("rate fetch failed");
    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
    };
    if (data.result !== "success" || !data.rates) throw new Error("bad rates");
    const next: Partial<Record<CurrencyCode, number>> = { USD: 1 };
    (Object.keys(FALLBACK_RATES) as CurrencyCode[]).forEach((code) => {
      if (data.rates?.[code]) next[code] = data.rates[code];
    });
    return next;
  } catch {
    return { ...FALLBACK_RATES };
  }
}

function currencyFromLocale(): CurrencyCode {
  if (typeof navigator === "undefined") return "NGN";
  const lang = navigator.language || "";
  if (lang.includes("NG") || lang.toLowerCase().includes("en-ng")) return "NGN";
  if (lang.startsWith("en-GB")) return "GBP";
  if (lang.startsWith("en-CA")) return "CAD";
  if (lang.startsWith("en-AU")) return "AUD";
  if (lang.startsWith("fr") || lang.startsWith("de") || lang.startsWith("es")) return "EUR";
  if (lang.startsWith("en-US")) return "USD";
  // Default for Tressé (Nigeria-based brand) when unknown
  return "NGN";
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("NGN");
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
  const [ready, setReady] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      const hasManual = stored && stored in FALLBACK_RATES;

      const [country, liveRates] = await Promise.all([detectCountry(), fetchRates()]);
      if (cancelled) return;

      setRates({ ...FALLBACK_RATES, ...liveRates });

      if (hasManual) {
        setManual(true);
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
    setManual(true);
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
      setCurrency,
      formatPrice,
      selectable: SELECTABLE_CURRENCIES,
    }),
    [currency, countryCode, rate, ready, setCurrency, formatPrice]
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
