"use client";

import { useEffect, useState } from "react";
import { AuthGate, SignOutButton } from "@/components/auth-gate";
import { getSupabase } from "@/lib/supabase/client";
import Link from "next/link";
import { ClassBoard } from "./class-board";
import { ContestsAdmin } from "./contests-admin";
import { Skeleton } from "@/components/skeleton";
import type { Invitation, Session } from "@/lib/types";


function Locks() {
  const [rows, setRows] = useState<Session[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error: err } = await getSupabase().from("sessions").select("*").order("number");
    if (err) return setError(err.message);
    setRows((data as Session[]) ?? []);
  }

  useEffect(() => {
    queueMicrotask(() => void load());
  }, []);

  async function toggle(row: Session) {
    setBusy(row.id);
    const { error: err } = await getSupabase().from("sessions").update({ is_unlocked: !row.is_unlocked }).eq("id", row.id);
    if (err) setError(err.message);
    await load();
    setBusy(null);
  }

  if (error) return <p role="alert" className="rounded-2xl border-2 border-accent-line bg-surface p-4">{error}</p>;
  if (rows === null) return <Skeleton rows={4} />;

  return (
    <ul className="grid gap-4">
      {rows.map((row) => (
        <li
          key={row.id}
          className="card-3d flex flex-wrap items-center justify-between gap-4 p-5 md:p-6"
        >
          <div>
            <span className="font-mono text-sm tabular-nums text-muted">
              {String(row.number).padStart(2, "0")}
            </span>
            <span className="ml-4 font-display text-2xl font-extrabold">{row.title}</span>
          </div>

          <button
            type="button"
            disabled={busy === row.id}
            onClick={() => void toggle(row)}
            aria-pressed={row.is_unlocked}
            className={`btn-3d min-h-[44px] whitespace-nowrap text-sm ${row.is_unlocked ? "btn-3d--done" : "btn-3d--ghost"}`}
          >
            {row.is_unlocked ? "Open to members" : "Locked · open it"}
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
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  async function load() {
    const { data, error: err } = await getSupabase()
      .from("invitations")
      .select("email, full_name, code, claimed_at")
      .order("created_at", { ascending: false });
    if (err) return setError(err.message);
    setRows((data as Invitation[]) ?? []);
  }

  useEffect(() => {
    queueMicrotask(() => void load());
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
    setStatus("Invitation added. Send the code with the link to the site.");
    await load();
  }

  async function remove(target: string) {
    if (confirming !== target) return setConfirming(target);
    const { error: err } = await getSupabase().from("invitations").delete().eq("email", target);
    setConfirming(null);
    if (err) return setError(err.message);
    setStatus("Invitation removed.");
    await load();
  }

  return (
    <>
      <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={add} noValidate>
        <div>
          <label className="block font-bold" htmlFor="invite-email">
            Email
          </label>
          <input
            id="invite-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="tap mt-2 w-full rounded-2xl border-2 border-line-strong bg-surface px-4 text-base focus:border-accent-line"
          />
        </div>
        <div>
          <label className="block font-bold" htmlFor="invite-name">
            First name and surname
          </label>
          <input
            id="invite-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="tap mt-2 w-full rounded-2xl border-2 border-line-strong bg-surface px-4 text-base focus:border-accent-line"
          />
        </div>
        <button type="submit" disabled={busy} className="btn-3d btn-3d--ink whitespace-nowrap">
          {busy ? "Adding…" : "Invite"}
        </button>
      </form>

      {error ? (
        <p role="alert" className="mt-5 rounded-2xl border-2 border-accent-line bg-surface p-4">{error}</p>
      ) : null}
      <p role="status" aria-live="polite" className={status ? "mt-5 rounded-2xl border-2 border-line bg-surface p-4" : "sr-only"}>
        {status ?? ""}
      </p>

      {rows === null ? (
        <div className="mt-8"><Skeleton rows={3} /></div>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-base text-muted">
          Nobody invited yet. Add yourself and your co-organiser first.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4">
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

          <section aria-labelledby="class" className="mt-14">
            <h2 id="class" className="font-display text-display-md font-extrabold">
              The class, at a glance
            </h2>
            <p className="mt-3 max-w-measure text-base text-muted">
              One ring per student and step. Green is complete. Use it during the hour to see who is stuck.
            </p>
            <div className="mt-8">
              <ClassBoard />
            </div>
          </section>

          <section aria-labelledby="locks" className="mt-20">
            <h2 id="locks" className="font-display text-display-md font-extrabold">
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

          <section aria-labelledby="contests" className="mt-20">
            <h2 id="contests" className="font-display text-display-md font-extrabold">Contests</h2>
            <p className="mt-3 max-w-measure text-muted">
              Draft: write the brief and three constraints. Open: students submit until the deadline. Judging: the jury scores at{" "}
              <Link className="font-bold text-accent-strong underline underline-offset-4" href="/judge/">/judge/</Link>, then you publish here. Results appear at{" "}
              <Link className="font-bold text-accent-strong underline underline-offset-4" href="/results/">/results/</Link>.
            </p>
            <div className="mt-8"><ContestsAdmin /></div>
          </section>

          <section aria-labelledby="invites" className="mt-20">
            <h2 id="invites" className="font-display text-display-md font-extrabold">
              Invitations
            </h2>
            <p className="mt-3 max-w-measure text-base text-muted">
              Nobody can create an account without being on this list and typing the six-character
              code next to their name. Add the students before the session, then send each one the
              link to the site and their code.
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
