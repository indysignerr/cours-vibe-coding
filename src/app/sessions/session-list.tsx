"use client";

import { useEffect, useState } from "react";
import { AuthGate, SignOutButton } from "@/components/auth-gate";
import { Mascot } from "@/components/mascot";
import { Path } from "@/components/path";
import { StatPills } from "@/components/stat-pills";
import { Countdown } from "@/components/countdown";
import { loadStats, type Stats } from "@/lib/progress";

function Board({ userId, userName }: { userId: string; userName: string }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void loadStats(userId).then(setStats);
  }, [userId]);

  if (!stats) return <p className="text-base text-muted">Loading your path…</p>;

  const current = stats.nodes.find((n) => n.state === "current");

  return (
    <>
      <div className="card-3d relative flex flex-wrap items-center justify-between gap-6 overflow-hidden p-6 md:p-8">
        <div className="flex items-center gap-5">
          <Mascot size={88} mood={stats.streak >= 3 ? "party" : "happy"} className="anim-float" />
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-muted">Signed in as</p>
            <p className="font-display text-2xl font-extrabold">{userName}</p>
            <p className="mt-1 text-sm text-muted">
              {current ? `Next up: ${current.title}` : stats.badges.length === 0 ? "Your first step opens on 14 September." : "Path complete. Demo Day awaits."}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <StatPills streak={stats.streak} xp={stats.xp} badges={stats.badges.length} />
          <SignOutButton />
        </div>
      </div>

      <div className="mt-6">
        <Countdown compact />
      </div>

      <div className="mt-10">
        <Path nodes={stats.nodes} />
      </div>
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
