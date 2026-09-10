"use client";

import type { Session } from "@supabase/supabase-js";
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

  // Charge le profil pour une session donnée. Un seul appel réseau, pas de
  // getSession en double : la session arrive avec l'événement.
  const apply = useCallback(async (session: Session | null) => {
    const user = session?.user;
    if (!user) return setState({ status: "anonymous" });

    const { data: profile, error } = await getSupabase()
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    setState({
      status: "ready",
      userId: user.id,
      email: user.email ?? null,
      profile: error ? null : ((profile as Profile) ?? null),
    });
  }, []);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const { data } = await getSupabase().auth.getSession();
    await apply(data.session);
  }, [apply]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    // INITIAL_SESSION est émis à l'abonnement : il remplace l'appel initial.
    const { data } = getSupabase().auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return; // rien à recharger, même utilisateur
      void apply(session);
    });
    return () => data.subscription.unsubscribe();
  }, [apply]);

  return { state, reload };
}

/** Les messages bruts de Supabase sont illisibles pour un étudiant. */
export function humanError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("not been invited")) return "This email is not on the invite list. Ask an organiser to add it.";
  if (m.includes("invite code missing")) return "The invite code is missing or wrong. It is the six characters an organiser sent you.";
  if (m.includes("already been used")) return "This invitation was already used. If that was not you, tell an organiser now.";
  if (m.includes("database error saving new user")) {
    return "The database refused to create the account. Check your invite code, or ask an organiser.";
  }
  if (m.includes("invalid login credentials")) return "Wrong email or password. First time here? Use Create my password.";
  if (m.includes("already registered") || m.includes("already been registered")) return "You already have a password. Use Sign in instead.";
  if (m.includes("password should be at least")) return "Your password needs at least 6 characters.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts for now. Wait a minute and try again.";
  return message;
}
