"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { humanError, useAuth, type AuthState } from "@/lib/use-auth";

/** Écran affiché tant que le projet Supabase n'existe pas. */
function NotConfigured() {
  return (
    <div className="max-w-measure rounded-lg border border-line bg-surface p-6 md:p-8">
      <h2 className="font-display text-2xl">Accounts are not switched on yet</h2>
      <p className="mt-3 text-base text-muted">
        The database for this club has not been connected. Session material and contest submissions
        will live here once it is. Nothing is broken on your side.
      </p>
    </div>
  );
}

function SignInForm({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
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
      <h2 className="font-display text-display-md">
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
        className="tap mt-2 w-full rounded-lg border border-line bg-surface px-4 text-base"
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
        className="tap mt-2 w-full rounded-lg border border-line bg-surface px-4 text-base"
      />

      {error ? (
        <p role="alert" className="mt-5 rounded-lg border border-accent bg-surface p-4 text-base">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="tap mt-7 inline-flex w-full items-center justify-center rounded-full bg-accent px-7 font-medium text-accent-ink transition-transform duration-200 ease-swift hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
      >
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
  if (state.status === "loading") return <p className="text-base text-muted">Loading…</p>;
  if (state.status === "anonymous") return <SignInForm onDone={reload} />;

  if (requireAdmin && state.profile?.role !== "admin") {
    return (
      <div className="max-w-measure rounded-lg border border-line bg-surface p-6 md:p-8">
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
