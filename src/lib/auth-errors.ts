import { AuthApiError } from "@supabase/supabase-js";
import { UserErrorCode } from "@/lib/user-errors";

/** Map Supabase auth failures to catalog codes (never leak raw messages). */
export function mapAuthError(err: unknown): UserErrorCode {
  const message =
    err instanceof Error
      ? err.message.toLowerCase()
      : typeof err === "object" &&
          err &&
          "message" in err &&
          typeof (err as { message: unknown }).message === "string"
        ? (err as { message: string }).message.toLowerCase()
        : "";

  const status =
    err instanceof AuthApiError
      ? err.status
      : typeof err === "object" &&
          err &&
          "status" in err &&
          typeof (err as { status: unknown }).status === "number"
        ? (err as { status: number }).status
        : undefined;

  if (
    message.includes("already registered") ||
    message.includes("already been registered") ||
    message.includes("user already exists")
  ) {
    return UserErrorCode.AUTH_EXISTS;
  }

  if (
    message.includes("password") &&
    (message.includes("weak") ||
      message.includes("least") ||
      message.includes("short"))
  ) {
    return UserErrorCode.AUTH_WEAK_PASSWORD;
  }

  if (
    message.includes("invalid login") ||
    message.includes("invalid credentials") ||
    status === 400
  ) {
    return UserErrorCode.AUTH_INVALID;
  }

  if (message.includes("email not confirmed")) {
    return UserErrorCode.AUTH_EMAIL_UNCONFIRMED;
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return UserErrorCode.OFFLINE;
  }

  return UserErrorCode.UNEXPECTED;
}
