/** Shared form helpers — forgiving validation & normalization (Good UX Part 6). */

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

/**
 * Accept any common phone paste format; store digits (optional leading +).
 */
export function normalizePhone(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  return hasPlus ? `+${digits}` : digits;
}

/** 7–15 digits after stripping formatting (ITU E.164 range). */
export function isValidPhone(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export function requiredMessage(): string {
  return "This field is required.";
}
