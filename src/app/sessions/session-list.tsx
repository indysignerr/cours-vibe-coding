"use client";

import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthGate, SignOutButton } from "@/components/auth-gate";
import { CURRICULUM } from "@/lib/curriculum";
import { getSupabase } from "@/lib/supabase/client";
import type { Session } from "@/lib/types";

const WEEK = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" });

function Rows({ userName }: { userName: string }) {
  const [open, setOpen] = useState<Set<string> | null>(null);

  useEffect(() => {
    // La RLS ne renvoie que les séances déverrouillées. Les autres n'existent
    // pas côté client : on les rend à partir du programme public.
    void getSupabase()
      .from("sessions")
      .select("slug")
      .then(({ data }) => setOpen(new Set((data as Pick<Session, "slug">[] | null)?.map((s) => s.slug) ?? [])));
  }, []);

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="text-base text-muted">
          Signed in as <strong className="font-semibold text-ink">{userName}</strong>
        </p>
        <SignOutButton />
      </div>

      <ol className="mt-10 grid gap-px overflow-hidden rounded-lg bg-line">
        {CURRICULUM.map((entry) => {
          const unlocked = open?.has(entry.slug) ?? false;
          const number = String(entry.number).padStart(2, "0");

          const inner = (
            <>
              <div className="md:col-span-2">
                <span className="font-mono text-sm tabular-nums">{number}</span>
                <span className="ml-3 font-mono text-xs uppercase tracking-wider text-muted md:ml-0 md:mt-2 md:block">
                  {WEEK.format(new Date(entry.weekOf))}
                </span>
              </div>
              <h2 className="font-display text-display-md md:col-span-5">{entry.title}</h2>
              <p className="text-base text-muted md:col-span-5">
                {unlocked ? entry.promise : "Opens on the day of the session."}
              </p>
            </>
          );

          return (
            <li key={entry.slug} className="bg-surface">
              {unlocked ? (
                <a
                  className="grid gap-4 p-6 transition-colors duration-200 hover:bg-paper md:grid-cols-12 md:items-baseline md:gap-8 md:p-8"
                  href={`/sessions/${entry.slug}/`}
                >
                  {inner}
                </a>
              ) : (
                <div
                  aria-disabled
                  className="grid gap-4 p-6 opacity-55 md:grid-cols-12 md:items-baseline md:gap-8 md:p-8"
                >
                  {inner}
                  <Lock aria-label="Locked" className="size-4 text-muted md:col-span-12" />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {open === null ? <p className="mt-6 text-sm text-muted">Checking what is open…</p> : null}
    </>
  );
}

export function SessionList() {
  return (
    <AuthGate>
      {(state) => <Rows userName={state.profile?.full_name ?? state.email ?? "member"} />}
    </AuthGate>
  );
}
