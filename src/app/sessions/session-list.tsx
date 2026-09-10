"use client";

import { useEffect, useState } from "react";
import { AuthGate, SignOutButton } from "@/components/auth-gate";
import { Countdown } from "@/components/countdown";
import { Mascot } from "@/components/mascot";
import { Path } from "@/components/path";
import { Skeleton } from "@/components/skeleton";
import { StatPills } from "@/components/stat-pills";
import { loadStats, type Stats } from "@/lib/progress";

const WEEK = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: "Europe/Paris" });

function Board({ userId, userName }: { userId: string; userName: string }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let alive = true;
    void loadStats(userId).then((s) => alive && setStats(s));
    return () => { alive = false; };
  }, [userId]);

  if (!stats) return <div className="min-h-[9rem]"><Skeleton rows={2} /></div>;

  const current = stats.nodes.find((n) => n.state === "current");
  const nextLocked = stats.nodes.find((n) => n.state === "locked");
  const line = current
    ? `Next up: ${current.title}`
    : nextLocked
      ? `Next step opens the week of ${WEEK.format(new Date(`${nextLocked.weekOf}T12:00:00`))}.`
      : "Path complete. Demo Day awaits.";

  return (
    <>
      {stats.error ? (
        <p role="alert" className="mb-6 rounded-2xl border-2 border-accent-line bg-surface p-4">
          Some of your progress could not be loaded ({stats.error}). Reload the page, or sign out and in again.
        </p>
      ) : null}

      <div className="card-3d relative flex flex-wrap items-center justify-between gap-6 overflow-hidden p-6 md:p-8">
        <div className="flex items-center gap-5">
          <Mascot size={88} mood={stats.streak >= 3 ? "party" : "happy"} className="anim-float" />
          <div>
            <p className="eyebrow text-muted">Signed in as</p>
            <p className="font-display text-2xl font-extrabold">{userName}</p>
            <p className="mt-1 text-muted">{line}</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <StatPills streak={stats.streak} xp={stats.xp} badges={stats.badges.length} />
          <SignOutButton />
        </div>
      </div>

      <div className="mt-6"><Countdown compact /></div>
      <div className="mt-10"><Path nodes={stats.nodes} /></div>
    </>
  );
}

export function SessionList() {
  return (
    <AuthGate>
      {(state) => <Board userId={state.userId} userName={state.profile?.full_name ?? state.email ?? "member"} />}
    </AuthGate>
  );
}
