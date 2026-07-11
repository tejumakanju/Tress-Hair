"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/states";
import { getUserError, UserErrorCode } from "@/lib/user-errors";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  const copy = getUserError(UserErrorCode.UNEXPECTED);

  return (
    <ErrorState
      title={copy.title}
      description={copy.description}
      action={{ label: "Try again", onClick: reset }}
      secondaryAction={
        copy.secondaryAction?.href
          ? {
              label: copy.secondaryAction.label,
              href: copy.secondaryAction.href,
            }
          : { label: "Shop", href: "/shop" }
      }
    />
  );
}
