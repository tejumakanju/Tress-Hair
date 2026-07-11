"use client";

import { X } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { cn } from "@/lib/utils";

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-4 left-1/2 -translate-x-1/2 z-[70] flex flex-col gap-2 w-[min(92vw,380px)] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 text-xs tracking-wide shadow-lg animate-fade-up",
            t.type === "error"
              ? "bg-crimson text-white"
              : t.type === "info"
                ? "bg-charcoal text-white"
                : "bg-noir text-white border-l-2 border-l-champagne"
          )}
        >
          <span>
            {t.type === "success" ? "✓ " : t.type === "error" ? "! " : ""}
            {t.message}
          </span>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="touch-target inline-flex items-center justify-center opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
