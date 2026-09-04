import type { NodeState, PathNode } from "@/components/path";
import { CURRICULUM } from "@/lib/curriculum";
import { getSupabase } from "@/lib/supabase/client";
import type { Session, SessionCheck } from "@/lib/types";

export const XP_PER_CHECK = 10;
export const XP_PER_SUBMISSION = 40;

export type Stats = {
  nodes: PathNode[];
  streak: number;
  xp: number;
  badges: string[];
  checksDone: number;
  submissions: number;
};

/**
 * Tout se calcule côté client à partir de ce que la RLS laisse lire :
 * les séances ouvertes, leurs cases, les cases cochées par CET étudiant
 * et ses rendus. Partagé par l'en-tête, le chemin et la page de séance.
 */
export async function loadStats(userId: string): Promise<Stats> {
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
  let polished = false;
  const badges: string[] = [];

  const nodes: PathNode[] = CURRICULUM.map((entry) => {
    const id = open.get(entry.slug);
    const all = id ? bySession.get(id) ?? [] : [];
    const required = all.filter((c) => !c.is_bonus);
    const bonus = all.filter((c) => c.is_bonus);
    const ticked = required.filter((c) => doneIds.has(c.id)).length;
    const progress = required.length ? ticked / required.length : 0;

    let state: NodeState;
    if (!id) state = "locked";
    else if (required.length && ticked === required.length) state = "done";
    else if (!currentAssigned) { state = "current"; currentAssigned = true; }
    else state = "open";

    if (state === "done") {
      badges.push(`session-${entry.number}`);
      if (streakAlive) streak += 1;
      if (bonus.length && bonus.every((c) => doneIds.has(c.id))) polished = true;
    } else if (id) {
      streakAlive = false;
    }

    return { ...entry, state, progress: state === "done" ? 1 : progress, href: id ? `/sessions/${entry.slug}/` : undefined };
  });

  const submissions = ((subs.data as { id: string }[]) ?? []).length;
  if (submissions > 0) badges.push("first-submission");
  if (streak >= 3) badges.push("streak-3");
  if (streak >= 6) badges.push("streak-6");
  if (nodes.every((n) => n.state === "done")) badges.push("all-twelve");
  if (polished) badges.push("polish");

  return {
    nodes,
    streak,
    xp: doneIds.size * XP_PER_CHECK + submissions * XP_PER_SUBMISSION,
    badges,
    checksDone: doneIds.size,
    submissions,
  };
}
