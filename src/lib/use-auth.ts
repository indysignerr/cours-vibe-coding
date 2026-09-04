"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export type AuthState =
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "ready"; userId: string; email: string | null; profile: Profile | null };

export function useAuth() {
  const [state, setState] = useState<AuthState>(
    isSupabaseConfigured() ? { status: "loading" } : { status: "unconfigured" }
  );

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) return setState({ status: "unconfigured" });

    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) return setState({ status: "anonymous" });

    // Le profil est créé par le trigger. S'il manque, on ne bloque pas la page.
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    setState({
      status: "ready",
      userId: user.id,
      email: user.email ?? null,
      profile: (profile as Profile) ?? null,
    });
  }, []);

  useEffect(() => {
    void load();
    if (!isSupabaseConfigured()) return;

    const { data } = getSupabase().auth.onAuthStateChange(() => void load());
    return () => data.subscription.unsubscribe();
  }, [load]);

  return { state, reload: load };
}

/** Les messages bruts de Supabase sont illisibles pour un étudiant. */
export function humanError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("not been invited")) {
    return "This email is not on the invite list. Ask an organiser to add it.";
  }
  if (m.includes("database error saving new user")) {
    return "The database refused to create the account. Either this email is not on the invite list, or the organisers need to check the sign-up trigger.";
  }
  if (m.includes("invalid login credentials")) {
    return "Wrong email or password. If this is your first time, use Create my password.";
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "You already have a password. Use Sign in instead.";
  }
  if (m.includes("password should be at least")) {
    return "Your password needs at least 6 characters.";
  }
  return message;
}
