"use client";

import { useState } from "react";
import { configurationProblem, getSupabase } from "@/lib/supabase/client";
import { Onboarding } from "@/components/onboarding";
import { Skeleton } from "@/components/skeleton";
import { humanError, useAuth, type AuthState } from "@/lib/use-auth";

/** Écran affiché tant que la configuration Supabase n'est pas exploitable. */
function NotConfigured() {
  const problem = configurationProblem();

  return (
    <div className="card-3d max-w-measure p-6 md:p-8">
      <h2 className="font-display text-2xl font-extrabold">Accounts are not switched on yet</h2>
      <p className="mt-3 text-base text-muted">
        The database for this club has not been connected. Session material and contest submissions
        will live here once it is. Nothing is broken on your side.
      </p>
      {problem ? (
        <p className="mt-5 rounded-lg bg-sunken p-4 font-mono text-sm text-muted">
          For the organisers: {problem}
        </p>
      ) : null}
    </div>
  );
}

function SignInForm({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = getSupabase();
    const { error: err } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setBusy(false);
    if (err) return setError(humanError(err.message));
    onDone();
  }

  return (
    <form className="max-w-md" onSubmit={submit} noValidate>
      <h2 className="font-display text-display-md font-extrabold">
        {mode === "signin" ? "Sign in" : "Create my password"}
      </h2>
      <p className="mt-3 text-base text-muted">
        Places are handed out by hand. If your email is not on the invite list, ask an organiser to
        add it first.
      </p>

      <label className="mt-8 block text-sm font-medium" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="tap mt-2 w-full rounded-2xl border-2 border-line bg-surface px-4 text-base focus:border-accent-line"
      />

      <label className="mt-5 block text-sm font-medium" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="tap mt-2 w-full rounded-2xl border-2 border-line bg-surface px-4 text-base focus:border-accent-line"
      />

      {error ? (
        <p role="alert" className="mt-5 rounded-lg border border-accent bg-surface p-4 text-base">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className="btn-3d mt-7 w-full text-lg">
        {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create my password"}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
        }}
        className="tap mt-4 inline-flex w-full items-center justify-center text-sm font-medium text-accent-strong hover:underline"
      >
        {mode === "signin" ? "First time here? Create my password" : "I already have a password"}
      </button>
    </form>
  );
}

/** Rend ses enfants seulement pour un membre connecté. */
export function AuthGate({
  children,
  requireAdmin = false,
}: {
  children: (state: Extract<AuthState, { status: "ready" }>) => React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { state, reload } = useAuth();

  if (state.status === "unconfigured") return <NotConfigured />;
  if (state.status === "loading") return <Skeleton rows={3} />;
  if (state.status === "anonymous") return <SignInForm onDone={reload} />;

  // Première connexion : trois écrans avant d'entrer. La colonne
  // onboarded_at n'existe qu'après 002_gamification.sql ; si elle manque,
  // le profil n'a pas la clé et on n'impose rien.
  if (state.profile && "onboarded_at" in state.profile && !state.profile.onboarded_at && !requireAdmin) {
    return <Onboarding profile={state.profile} onDone={reload} />;
  }

  if (requireAdmin && state.profile?.role !== "admin") {
    return (
      <div className="card-3d max-w-measure p-6 md:p-8">
        <h2 className="font-display text-2xl">Organisers only</h2>
        <p className="mt-3 text-base text-muted">
          This page is for the two people running the club. Your account is signed in as a member.
        </p>
      </div>
    );
  }

  return <>{children(state)}</>;
}

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void getSupabase().auth.signOut()}
      className="tap inline-flex items-center text-sm font-medium text-muted hover:text-accent-strong"
    >
      Sign out
    </button>
  );
}
