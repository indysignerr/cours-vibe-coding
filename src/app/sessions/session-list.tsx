"use client";

import { useEffect, useState } from "react";
import { AuthGate, SignOutButton } from "@/components/auth-gate";
import { Mascot } from "@/components/mascot";
import { Path, type NodeState, type PathNode } from "@/components/path";
import { StatPills } from "@/components/stat-pills";
import { CURRICULUM } from "@/lib/curriculum";
import { getSupabase } from "@/lib/supabase/client";
import type { Session, SessionCheck } from "@/lib/types";

export const XP_PER_CHECK = 10;
export const XP_PER_SUBMISSION = 40;

type Stats = { nodes: PathNode[]; streak: number; xp: number; badges: number };

/**
 * Tout se calcule côté client à partir de ce que la RLS laisse lire :
 * les séances ouvertes, leurs cases, et les cases que CET étudiant a cochées.
 * Un badge = une séance dont toutes les cases obligatoires sont cochées.
 */
async function loadStats(userId: string): Promise<Stats> {
  const supabase = getSupabase();

  const [sessions, checks, done, subs] = await Promise.all([
    supabase.from("sessions").select("id, slug"),
    supabase.from("session_checks").select("id, session_id, is_bonus"),
    supabase.from("check_completions").select("check_id").eq("profile_id", userId),
    supabase.from("submissions").select("id").eq("profile_id", userId),
  ]);

  const open = new Map(((sessions.data as Pick<Session, "id" | "slug">[]) ?? []).map((s) => [s.slug, s.id]));
  const doneIds = new Set(((done.data as { check_id: string }[]) ?? []).map((d) => d.check_id));
  const bySession = new Map<string, Pick<SessionCheck, "id" | "is_bonus">[]>();
  for (const c of (checks.data as Pick<SessionCheck, "id" | "session_id" | "is_bonus">[]) ?? []) {
    bySession.set(c.session_id, [...(bySession.get(c.session_id) ?? []), c]);
  }

  let currentAssigned = false;
  let streak = 0;
  let streakAlive = true;
  let badges = 0;

  const nodes: PathNode[] = CURRICULUM.map((entry) => {
    const id = open.get(entry.slug);
    const required = id ? (bySession.get(id) ?? []).filter((c) => !c.is_bonus) : [];
    const ticked = required.filter((c) => doneIds.has(c.id)).length;
    const progress = required.length ? ticked / required.length : 0;

    let state: NodeState;
    if (!id) state = "locked";
    else if (required.length && ticked === required.length) state = "done";
    else if (!currentAssigned) { state = "current"; currentAssigned = true; }
    else state = "open";

    if (state === "done") { badges += 1; if (streakAlive) streak += 1; }
    else if (id) streakAlive = false;

    return {
      ...entry,
      state,
      progress: state === "done" ? 1 : progress,
      href: id ? `/sessions/${entry.slug}/` : undefined,
    };
  });

  const xp = doneIds.size * XP_PER_CHECK + ((subs.data as { id: string }[]) ?? []).length * XP_PER_SUBMISSION;
  return { nodes, streak, xp, badges };
}

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
              {current ? `Next up: ${current.title}` : stats.badges === 0 ? "Your first step opens on 14 September." : "Path complete. Demo Day awaits."}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <StatPills streak={stats.streak} xp={stats.xp} badges={stats.badges} />
          <SignOutButton />
        </div>
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
