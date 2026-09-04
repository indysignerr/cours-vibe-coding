"use client";

import { Crown, Send, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { Mascot } from "@/components/mascot";
import { ProgressRing } from "@/components/progress-ring";
import { Skeleton } from "@/components/skeleton";
import { CURRICULUM } from "@/lib/curriculum";
import { getSupabase } from "@/lib/supabase/client";
import type { LeaderboardRow } from "@/lib/types";

const PODIUM = ["card-3d--streak", "card-3d", "card-3d"];

function Rows({ me }: { me: string }) {
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getSupabase()
      .rpc("leaderboard")
      .then(({ data, error: err }) => {
        if (err) return setError(err.message);
        setRows((data as LeaderboardRow[]) ?? []);
      });
  }, []);

  if (error) {
    return (
      <div className="card-3d p-6">
        <p className="font-bold">The season board is not switched on yet.</p>
        <p className="mt-2 text-sm text-muted">For the organisers: run supabase/002_gamification.sql. ({error})</p>
      </div>
    );
  }
  if (!rows) return <Skeleton rows={5} />;
  if (rows.length === 0) {
    return (
      <div className="card-3d flex items-center gap-5 p-6">
        <Mascot size={72} mood="focused" />
        <p className="text-muted">Nobody has scored yet. The first step opens the board.</p>
      </div>
    );
  }

  const top = rows.slice(0, 3);
  const rest = rows.slice(3);
  const total = CURRICULUM.length;

  return (
    <>
      <ol className="grid gap-4 md:grid-cols-3">
        {top.map((r, i) => (
          <li key={r.profile_id} className={`${PODIUM[i]} anim-pop relative p-6`} style={{ animationDelay: `${i * 90}ms` }}>
            {i === 0 ? <Crown aria-label="First place" className="absolute right-5 top-5 size-7 text-streak-strong" /> : null}
            <p className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-muted">#{i + 1}</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{r.full_name}{r.profile_id === me ? " (you)" : ""}</p>
            <div className="mt-4 flex items-center gap-4">
              <ProgressRing value={r.steps_done / total} size={64} stroke={8} tone="done">
                <span className="font-display text-sm font-extrabold">{r.steps_done}</span>
              </ProgressRing>
              <span className="pill border-xp-line bg-xp"><Zap aria-hidden className="size-4" /> {r.xp}</span>
              <span className="pill"><Send aria-hidden className="size-4" /> {r.submissions}</span>
            </div>
          </li>
        ))}
      </ol>

      {rest.length ? (
        <ol className="card-3d mt-6 divide-y-2 divide-line" start={4}>
          {rest.map((r, i) => (
            <li key={r.profile_id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <span className="flex items-center gap-4">
                <span className="font-mono text-sm font-bold text-muted">#{i + 4}</span>
                <span className="font-bold">{r.full_name}{r.profile_id === me ? " (you)" : ""}</span>
              </span>
              <span className="flex items-center gap-3 text-sm">
                <span className="pill border-xp-line bg-xp"><Zap aria-hidden className="size-4" /> {r.xp}</span>
                <span className="text-muted">{r.steps_done}/{total} steps</span>
              </span>
            </li>
          ))}
        </ol>
      ) : null}
    </>
  );
}

export function Board() {
  return <AuthGate>{(state) => <Rows me={state.userId} />}</AuthGate>;
}
