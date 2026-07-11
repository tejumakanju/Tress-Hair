"use client";

import { useCurrency, CURRENCIES } from "@/lib/currency-context";
import { getUserError, UserErrorCode } from "@/lib/user-errors";

export function CurrencySwitcher() {
  const { currency, setCurrency, selectable, countryCode, ready, ratesLive } =
    useCurrency();

  const ratesNote = getUserError(UserErrorCode.RATES_OFFLINE).inline;

  const title = [
    countryCode ? `Detected: ${countryCode}` : null,
    ratesLive ? "Live FX rates" : ratesNote,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex items-center gap-1" title={title}>
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
      {!ready && <span className="sr-only">Detecting location…</span>}
      {ready && !ratesLive && <span className="sr-only">{ratesNote}</span>}
      <span className="hidden lg:inline text-[9px] text-muted tracking-wide">
        {CURRENCIES[currency].code}
      </span>
    </div>
  );
}
