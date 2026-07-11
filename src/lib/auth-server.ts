import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AuthProfile, AuthUserSummary } from "@/lib/auth";

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
