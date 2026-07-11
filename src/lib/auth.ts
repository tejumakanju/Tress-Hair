/**
 * Client-safe auth helpers and types.
 * Do NOT import supabase/server here — client components use this module.
 */

export {
  isValidEmail,
  normalizeEmail,
} from "@/lib/form-utils";

export type AuthProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
};

export type AuthUserSummary = {
  id: string;
  email: string;
};

/** Password rules shown live on signup (Building with Good UX Part 6). */
export type PasswordRuleId = "length" | "letter" | "number";

export const PASSWORD_RULES: {
  id: PasswordRuleId;
  label: string;
  test: (password: string) => boolean;
}[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (p) => p.length >= 8,
  },
  {
    id: "letter",
    label: "Includes a letter",
    test: (p) => /[a-zA-Z]/.test(p),
  },
  {
    id: "number",
    label: "Includes a number",
    test: (p) => /\d/.test(p),
  },
];

export function passwordRulesMet(password: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(password));
}
