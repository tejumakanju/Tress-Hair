"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthProfile, AuthUserSummary } from "@/lib/auth";

type AuthContextType = {
  user: AuthUserSummary | null;
  profile: AuthProfile | null;
  ready: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string, email: string): Promise<AuthProfile> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, phone")
    .eq("id", userId)
    .maybeSingle();

  if (!data) {
    return {
      id: userId,
      email,
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
    email: row.email || email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
  };
}

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
}: {
  children: React.ReactNode;
  initialUser: AuthUserSummary | null;
  initialProfile: AuthProfile | null;
}) {
  const [user, setUser] = useState<AuthUserSummary | null>(initialUser);
  const [profile, setProfile] = useState<AuthProfile | null>(initialProfile);
  const [ready, setReady] = useState(Boolean(initialUser !== undefined));

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const next = await fetchProfile(user.id, user.email);
    setProfile(next);
  }, [user]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u?.email) {
        const summary = { id: u.id, email: u.email };
        setUser(summary);
        fetchProfile(u.id, u.email).then(setProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u?.email) {
        const summary = { id: u.id, email: u.email };
        setUser(summary);
        fetchProfile(u.id, u.email).then(setProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({ user, profile, ready, refreshProfile, signOut }),
    [user, profile, ready, refreshProfile, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
