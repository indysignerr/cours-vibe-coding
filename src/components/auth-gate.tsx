"use client";

import { useId, useState } from "react";
import { Onboarding } from "@/components/onboarding";
import { Skeleton } from "@/components/skeleton";
import { configurationProblem, getSupabase } from "@/lib/supabase/client";
import { SITE } from "@/lib/site";
import { humanError, useAuth, type AuthState } from "@/lib/use-auth";

/** Écran affiché tant que la configuration Supabase n'est pas exploitable. */
function NotConfigured() {
  const problem = configurationProblem();
  return (
    <div className="card-3d max-w-measure p-6 md:p-8">
      <h2 className="font-display text-2xl font-extrabold">Accounts are not switched on yet</h2>
      <p className="mt-3 text-muted">
        The database for this club has not been connected. Session material and contest submissions
        will live here once it is. Nothing is broken on your side.
      </p>
      {problem ? <p className="mt-5 rounded-2xl bg-sunken p-4 font-mono text-sm text-muted">For the organisers: {problem}</p> : null}
    </div>
  );
}

const FIELD = "tap mt-2 w-full rounded-2xl border-2 border-line-strong bg-surface px-4 text-base focus:border-accent-line";

type Mode = "signup" | "signin" | "reset";

function SignInForm({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const id = useId();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = getSupabase();

    if (mode === "reset") {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${SITE.url}/sessions/` });
      setBusy(false);
      if (err) return setError(humanError(err.message));
      return setNotice("If this email has an account, a reset link is on its way. It can take a few minutes. Still nothing? Ask an organiser.");
    }

    if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (err) return setError(humanError(err.message));
      return onDone();
    }

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { invite_code: code.trim().toUpperCase() } },
    });
    setBusy(false);
    if (err) return setError(humanError(err.message));
    // Sans session, soit l'email attend une confirmation, soit le compte existait déjà.
    if (!data.session) {
      return setNotice("No session was opened. If you already have a password, use Sign in. Otherwise an organiser needs to check email confirmation is off.");
    }
    onDone();
  }

  const title = mode === "signup" ? "Create my password" : mode === "signin" ? "Sign in" : "Reset my password";

  return (
    <form className="max-w-md" onSubmit={submit} noValidate aria-describedby={error ? `${id}-error` : undefined}>
      <h2 className="font-display text-display-md font-extrabold">{title}</h2>
      <p className="mt-3 text-muted">
        {mode === "signup"
          ? "Places are handed out by hand. You need the six-character invite code an organiser sent you."
          : mode === "signin"
            ? "Welcome back."
            : "We send a link to your email. It can be slow: the club mailer is small."}
      </p>

      <label className="mt-8 block font-bold" htmlFor={`${id}-email`}>Email</label>
      <input id={`${id}-email`} name="email" type="email" autoComplete="email" required value={email}
        onChange={(e) => setEmail(e.target.value)} className={FIELD} aria-invalid={error ? true : undefined} />

      {mode !== "reset" ? (
        <>
          <label className="mt-5 block font-bold" htmlFor={`${id}-password`}>Password</label>
          <input id={`${id}-password`} name="password" type="password" required minLength={6} value={password}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            onChange={(e) => setPassword(e.target.value)} className={FIELD} aria-invalid={error ? true : undefined} />
        </>
      ) : null}

      {mode === "signup" ? (
        <>
          <label className="mt-5 block font-bold" htmlFor={`${id}-code`}>Invite code</label>
          <p id={`${id}-code-hint`} className="mt-1 text-sm text-muted">Six characters, sent by an organiser. Letters and digits.</p>
          <input id={`${id}-code`} name="invite_code" inputMode="text" autoCapitalize="characters" required maxLength={6}
            value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
            className={`${FIELD} font-mono uppercase tracking-[0.3em]`} aria-describedby={`${id}-code-hint`} />
        </>
      ) : null}

      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-5 rounded-2xl border-2 border-accent-line bg-surface p-4">{error}</p>
      ) : null}
      {notice ? (
        <p role="status" className="mt-5 rounded-2xl border-2 border-line bg-surface p-4">{notice}</p>
      ) : null}

      <button type="submit" disabled={busy} className="btn-3d mt-7 w-full text-lg">
        {busy ? "One moment…" : title}
      </button>

      <div className="mt-4 grid gap-2 text-center">
        {mode !== "signup" ? (
          <button type="button" className="btn-3d btn-3d--ghost min-h-[44px] text-sm" onClick={() => { setMode("signup"); setError(null); setNotice(null); }}>
            First time here? Create my password
          </button>
        ) : null}
        {mode !== "signin" ? (
          <button type="button" className="btn-3d btn-3d--ghost min-h-[44px] text-sm" onClick={() => { setMode("signin"); setError(null); setNotice(null); }}>
            I already have a password
          </button>
        ) : null}
        {mode !== "reset" ? (
          <button type="button" className="tap text-sm font-bold text-accent-strong underline underline-offset-4" onClick={() => { setMode("reset"); setError(null); setNotice(null); }}>
            Forgot my password
          </button>
        ) : null}
      </div>
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

  // Première connexion : trois écrans avant d'entrer. La colonne onboarded_at
  // n'existe qu'après 002 ; si elle manque, le profil n'a pas la clé et on n'impose rien.
  if (state.profile && "onboarded_at" in state.profile && !state.profile.onboarded_at && !requireAdmin) {
    return <Onboarding profile={state.profile} onDone={reload} />;
  }

  if (requireAdmin && state.profile?.role !== "admin") {
    return (
      <div className="card-3d max-w-measure p-6 md:p-8">
        <h2 className="font-display text-2xl font-extrabold">Organisers only</h2>
        <p className="mt-3 text-muted">This page is for the two people running the club. Your account is signed in as a member.</p>
      </div>
    );
  }

  return <>{children(state)}</>;
}

export function SignOutButton() {
  return (
    <button type="button" onClick={() => void getSupabase().auth.signOut()} className="btn-3d btn-3d--ghost min-h-[44px] text-sm">
      Sign out
    </button>
  );
}
