"use client";

import { useEffect, useState } from "react";
import { AuthGate, SignOutButton } from "@/components/auth-gate";
import { getSupabase } from "@/lib/supabase/client";
import type { Session } from "@/lib/types";

type Invitation = { email: string; full_name: string | null; claimed_at: string | null };

function Locks() {
  const [rows, setRows] = useState<Session[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const { data } = await getSupabase().from("sessions").select("*").order("number");
    setRows((data as Session[]) ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function toggle(row: Session) {
    setBusy(row.id);
    await getSupabase().from("sessions").update({ is_unlocked: !row.is_unlocked }).eq("id", row.id);
    await load();
    setBusy(null);
  }

  if (rows === null) return <p className="text-base text-muted">Loading…</p>;

  return (
    <ul className="grid gap-px overflow-hidden rounded-lg bg-line">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex flex-wrap items-center justify-between gap-4 bg-surface p-5 md:p-6"
        >
          <div>
            <span className="font-mono text-sm tabular-nums text-muted">
              {String(row.number).padStart(2, "0")}
            </span>
            <span className="ml-4 font-display text-2xl">{row.title}</span>
          </div>

          <button
            type="button"
            disabled={busy === row.id}
            onClick={() => void toggle(row)}
            className={`tap inline-flex items-center whitespace-nowrap rounded-full px-6 text-sm font-medium transition-colors duration-200 disabled:opacity-60 ${
              row.is_unlocked
                ? "bg-accent text-accent-ink"
                : "border border-line text-muted hover:border-accent hover:text-accent-strong"
            }`}
          >
            {row.is_unlocked ? "Open to members" : "Locked"}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Invites({ adminId }: { adminId: string }) {
  const [rows, setRows] = useState<Invitation[] | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await getSupabase()
      .from("invitations")
      .select("email, full_name, claimed_at")
      .order("created_at", { ascending: false });
    setRows((data as Invitation[]) ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const { error: err } = await getSupabase().from("invitations").insert({
      email: email.trim().toLowerCase(),
      full_name: name.trim() || null,
      invited_by: adminId,
    });

    setBusy(false);
    if (err) return setError(err.message);
    setEmail("");
    setName("");
    await load();
  }

  async function remove(target: string) {
    await getSupabase().from("invitations").delete().eq("email", target);
    await load();
  }

  return (
    <>
      <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={add} noValidate>
        <div>
          <label className="block text-sm font-medium" htmlFor="invite-email">
            Email
          </label>
          <input
            id="invite-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="tap mt-2 w-full rounded-lg border border-line bg-surface px-4 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="invite-name">
            First name and surname
          </label>
          <input
            id="invite-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="tap mt-2 w-full rounded-lg border border-line bg-surface px-4 text-base"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="tap inline-flex items-center justify-center whitespace-nowrap rounded-full bg-ink px-7 font-medium text-paper disabled:opacity-60"
        >
          {busy ? "Adding…" : "Invite"}
        </button>
      </form>

      {error ? (
        <p role="alert" className="mt-5 rounded-lg border border-accent bg-surface p-4 text-base">
          {error}
        </p>
      ) : null}

      {rows === null ? (
        <p className="mt-8 text-base text-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-base text-muted">
          Nobody invited yet. Add yourself and your co-organiser first.
        </p>
      ) : (
        <ul className="mt-8 grid gap-px overflow-hidden rounded-lg bg-line">
          {rows.map((row) => (
            <li
              key={row.email}
              className="flex flex-wrap items-center justify-between gap-4 bg-surface p-5"
            >
              <div>
                <p className="font-mono text-sm">{row.email}</p>
                <p className="mt-1 text-sm text-muted">
                  {row.full_name ?? "no name"} ·{" "}
                  {row.claimed_at ? "account created" : "not signed in yet"}
                </p>
              </div>
              {row.claimed_at ? null : (
                <button
                  type="button"
                  onClick={() => void remove(row.email)}
                  className="tap inline-flex items-center text-sm font-medium text-muted hover:text-accent-strong"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function AdminPanel() {
  return (
    <AuthGate requireAdmin>
      {(state) => (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <p className="text-base text-muted">
              Signed in as <strong className="font-semibold text-ink">{state.profile?.full_name}</strong>
            </p>
            <SignOutButton />
          </div>

          <section aria-labelledby="locks" className="mt-14">
            <h2 id="locks" className="font-display text-display-md">
              Session locks
            </h2>
            <p className="mt-3 max-w-measure text-base text-muted">
              A locked session is refused by the database, not merely hidden in the page. Open one at
              the start of its hour.
            </p>
            <div className="mt-8">
              <Locks />
            </div>
          </section>

          <section aria-labelledby="invites" className="mt-20">
            <h2 id="invites" className="font-display text-display-md">
              Invitations
            </h2>
            <p className="mt-3 max-w-measure text-base text-muted">
              Nobody can create an account without being on this list. Add the students before the
              session, not during it.
            </p>
            <div className="mt-8">
              <Invites adminId={state.userId} />
            </div>
          </section>
        </>
      )}
    </AuthGate>
  );
}
