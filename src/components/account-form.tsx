"use client";

import { useId, useState } from "react";
import { configurationProblem, getSupabase } from "@/lib/supabase/client";
import { SITE } from "@/lib/site";
import { humanError } from "@/lib/use-auth";

export type Mode = "signin" | "reset";

/**
 * Le formulaire de connexion des organisateurs.
 *
 * Il n'y a plus d'inscription publique : venir à un évènement ne demande
 * aucun compte, et les seuls comptes qui existent sont créés à la main
 * dans Supabase pour les gens qui tiennent les listes.
 */
export function AccountForm({
  defaultMode = "signin",
  onDone,
}: {
  defaultMode?: Mode;
  onDone?: () => void;
}) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const id = useId();

  const problem = configurationProblem();
  if (problem) {
    return (
      <div className="card card--sand p-7">
        <h2 className="display-3">Accounts are not switched on yet</h2>
        <p className="mt-3 text-body">
          The database has not been connected. Nothing is broken on your side.
        </p>
        <p className="mt-5 rounded-btn bg-canvas p-4 text-sm text-muted">
          For the organisers: {problem}
        </p>
      </div>
    );
  }

  function switchTo(next: Mode) {
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
        redirectTo: `${SITE.url}/admin/`,
      });
      setBusy(false);
      if (err) return setError(humanError(err.message));
      return setNotice(
        "If this email has an account, a reset link is on its way. It can take a few minutes.",
      );
    }

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) return setError(humanError(err.message));
    return onDone?.();
  }

  const title = mode === "signin" ? "Sign in" : "Reset my password";

  return (
    <form className="max-w-md" onSubmit={submit} noValidate>
      <h2 className="display-2">{title}</h2>
      <p className="mt-4 text-body">
        {mode === "signin"
          ? "For the people who run the association. Coming to an event needs no account."
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

      {mode === "signin" ? (
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
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            className="field mt-2"
            aria-invalid={error ? true : undefined}
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

      <button
        type="submit"
        disabled={busy}
        className="btn btn--primary mt-8 w-full disabled:opacity-55"
      >
        {busy ? "One moment…" : title}
      </button>

      <div className="mt-5 grid justify-items-start gap-1">
        <button
          type="button"
          className="tap text-sm text-muted underline underline-offset-4"
          onClick={() => switchTo(mode === "signin" ? "reset" : "signin")}
        >
          {mode === "signin" ? "I forgot my password" : "Back to sign in"}
        </button>
      </div>
    </form>
  );
}
