"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { configurationProblem, getSupabase } from "@/lib/supabase/client";
import { SITE } from "@/lib/site";
import { humanError } from "@/lib/use-auth";

export type Mode = "signup" | "signin" | "reset";

/**
 * Le formulaire de compte, partagé par /signup/ et par le verrou des pages
 * membres. L'inscription demande un code d'invitation : les places sont
 * données à la main, et c'est la base de données qui le vérifie, pas ce
 * formulaire — voir la politique RLS et le déclencheur handle_new_user.
 */
export function AccountForm({
  defaultMode = "signup",
  onDone,
}: {
  defaultMode?: Mode;
  onDone?: () => void;
}) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const id = useId();
  const router = useRouter();

  const problem = configurationProblem();
  if (problem) {
    return (
      <div className="card card--sand p-7">
        <h2 className="display-3">Accounts are not switched on yet</h2>
        <p className="mt-3 text-body">
          The database for this association has not been connected. Course material and contest
          submissions will live here once it is. Nothing is broken on your side.
        </p>
        <p className="mt-5 rounded-btn bg-canvas p-4 text-sm text-muted">
          For the organisers: {problem}
        </p>
      </div>
    );
  }

  function reset(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = getSupabase();

    if (mode === "reset") {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${SITE.url}/sessions/`,
      });
      setBusy(false);
      if (err) return setError(humanError(err.message));
      return setNotice(
        "If this email has an account, a reset link is on its way. It can take a few minutes. Still nothing? Ask an organiser.",
      );
    }

    if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (err) return setError(humanError(err.message));
      return onDone ? onDone() : router.push("/sessions/");
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
      return setNotice(
        "No session was opened. If you already have a password, use Sign in. Otherwise an organiser needs to check email confirmation is off.",
      );
    }
    return onDone ? onDone() : router.push("/sessions/");
  }

  const title =
    mode === "signup" ? "Create my account" : mode === "signin" ? "Sign in" : "Reset my password";

  return (
    <form className="max-w-md" onSubmit={submit} noValidate>
      <h2 className="display-2">{title}</h2>
      <p className="mt-4 text-body">
        {mode === "signup"
          ? "Places are handed out by hand. You need the six-character invite code an organiser sent you."
          : mode === "signin"
            ? "Welcome back."
            : "We send a link to your email. It can be slow: the association's mailer is small."}
      </p>

      <label className="mt-9 block text-sm font-medium text-ink" htmlFor={`${id}-email`}>
        Email
      </label>
      <input
        id={`${id}-email`}
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="field mt-2"
        aria-invalid={error ? true : undefined}
      />

      {mode !== "reset" ? (
        <>
          <label className="mt-6 block text-sm font-medium text-ink" htmlFor={`${id}-password`}>
            Password
          </label>
          <input
            id={`${id}-password`}
            name="password"
            type="password"
            required
            minLength={8}
            value={password}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            onChange={(e) => setPassword(e.target.value)}
            className="field mt-2"
            aria-describedby={mode === "signup" ? `${id}-pw-hint` : undefined}
            aria-invalid={error ? true : undefined}
          />
          {mode === "signup" ? (
            <p id={`${id}-pw-hint`} className="mt-2 text-sm text-muted">
              Eight characters at least. Use your password manager — you will need this every week.
            </p>
          ) : null}
        </>
      ) : null}

      {mode === "signup" ? (
        <>
          <label className="mt-6 block text-sm font-medium text-ink" htmlFor={`${id}-code`}>
            Invite code
          </label>
          <p id={`${id}-code-hint`} className="mt-1 text-sm text-muted">
            Six characters, sent by an organiser. Letters and digits.
          </p>
          <input
            id={`${id}-code`}
            name="invite_code"
            inputMode="text"
            autoCapitalize="characters"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="field mt-2 uppercase tracking-[0.35em]"
            aria-describedby={`${id}-code-hint`}
          />
        </>
      ) : null}

      {error ? (
        <p role="alert" className="card card--tint mt-6 p-4 text-ink">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="card card--sand mt-6 p-4 text-ink">
          {notice}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className="btn btn--primary mt-8 w-full disabled:opacity-55">
        {busy ? "One moment…" : title}
      </button>

      <div className="mt-5 grid justify-items-start gap-1">
        {mode !== "signup" ? (
          <button type="button" className="tap text-sm text-accent underline underline-offset-4" onClick={() => reset("signup")}>
            First time here? Create my account
          </button>
        ) : null}
        {mode !== "signin" ? (
          <button type="button" className="tap text-sm text-accent underline underline-offset-4" onClick={() => reset("signin")}>
            I already have an account
          </button>
        ) : null}
        {mode !== "reset" ? (
          <button type="button" className="tap text-sm text-muted underline underline-offset-4" onClick={() => reset("reset")}>
            I forgot my password
          </button>
        ) : null}
      </div>
    </form>
  );
}
