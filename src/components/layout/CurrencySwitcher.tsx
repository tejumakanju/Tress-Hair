"use client";

import { useCurrency, CURRENCIES } from "@/lib/currency-context";

export function CurrencySwitcher() {
  const { currency, setCurrency, selectable, countryCode, ready } = useCurrency();

  return (
    <div className="flex items-center gap-1" title={countryCode ? `Detected: ${countryCode}` : "Currency"}>
      <select
        aria-label="Currency"
        value={currency}
        onChange={(e) => setCurrency(e.target.value as typeof currency)}
        className="text-[10px] tracking-wider uppercase bg-transparent border border-border px-1.5 py-1 focus:outline-none focus:border-champagne max-w-[72px]"
      >
        {selectable.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
      {!ready && (
        <span className="sr-only">Detecting location…</span>
      )}
      <span className="hidden lg:inline text-[9px] text-muted tracking-wide">
        {CURRENCIES[currency].code}
      </span>
    </div>
  );
}
