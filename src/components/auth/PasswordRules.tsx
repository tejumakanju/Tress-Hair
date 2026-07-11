"use client";

import { Check } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function PasswordRules({ password }: { password: string }) {
  return (
    <ul className="mt-2 space-y-1.5" aria-live="polite">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-2 text-xs",
              met ? "text-champagne-dark" : "text-muted"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 border flex items-center justify-center shrink-0",
                met ? "border-champagne bg-champagne/15" : "border-border"
              )}
              aria-hidden
            >
              {met ? <Check className="w-3 h-3" strokeWidth={2} /> : null}
            </span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
