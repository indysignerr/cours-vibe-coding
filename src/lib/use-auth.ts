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

/** Les messages bruts de Supabase sont illisibles. */
export function humanError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Wrong email or password.";
  if (m.includes("email not confirmed")) return "This account still has to confirm its email address.";
  if (m.includes("password should be at least")) return "That password is too short.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts for now. Wait a minute and try again.";
  return message;
}
