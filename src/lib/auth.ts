import { createClient } from "@/lib/supabase/server";

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

export async function getAuthUser(): Promise<AuthUserSummary | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return { id: user.id, email: user.email };
}

export async function getAuthProfile(): Promise<AuthProfile | null> {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    return {
      id: user.id,
      email: user.email,
      firstName: null,
      lastName: null,
      phone: null,
    };
  }

  const row = data as {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  };

  return {
    id: row.id,
    email: row.email || user.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
  };
}

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
