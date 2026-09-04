"use client";

import { useEffect, useState } from "react";
import { ProgressRing } from "@/components/progress-ring";
import { Skeleton } from "@/components/skeleton";
import { CURRICULUM } from "@/lib/curriculum";
import { getSupabase } from "@/lib/supabase/client";
import type { Profile, Session, SessionCheck } from "@/lib/types";

type Cell = { ticked: number; required: number };

/**
 * Le tableau de classe : une ligne par étudiant, une colonne par séance,
 * un anneau par case. Lisible d'un coup d'œil pendant l'heure.
 */
export function ClassBoard() {
  const [grid, setGrid] = useState<{ students: Profile[]; cells: Map<string, Cell> } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const [profiles, sessions, checks, done] = await Promise.all([
        supabase.from("profiles").select("*").eq("role", "student").order("full_name"),
        supabase.from("sessions").select("id, slug, number"),
        supabase.from("session_checks").select("id, session_id, is_bonus"),
        supabase.from("check_completions").select("profile_id, check_id"),
      ]);

      const sessionByCheck = new Map<string, string>();
      const requiredBySession = new Map<string, number>();
      for (const c of (checks.data as Pick<SessionCheck, "id" | "session_id" | "is_bonus">[]) ?? []) {
        if (c.is_bonus) continue;
        sessionByCheck.set(c.id, c.session_id);
        requiredBySession.set(c.session_id, (requiredBySession.get(c.session_id) ?? 0) + 1);
      }
      const numberById = new Map(((sessions.data as Pick<Session, "id" | "number">[]) ?? []).map((s) => [s.id, s.number]));

      const cells = new Map<string, Cell>();
      for (const p of (profiles.data as Profile[]) ?? []) {
        for (const [sid, required] of requiredBySession) {
          cells.set(`${p.id}:${numberById.get(sid)}`, { ticked: 0, required });
        }
      }
      for (const d of (done.data as { profile_id: string; check_id: string }[]) ?? []) {
        const sid = sessionByCheck.get(d.check_id);
        if (!sid) continue;
        const key = `${d.profile_id}:${numberById.get(sid)}`;
        const cell = cells.get(key);
        if (cell) cell.ticked += 1;
      }
      setGrid({ students: (profiles.data as Profile[]) ?? [], cells });
    }
    void load();
  }, []);

  if (!grid) return <Skeleton rows={4} />;
  if (grid.students.length === 0) return <p className="text-muted">No student account yet.</p>;

  return (
    <div className="card-3d overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 bg-surface px-4 py-3 text-left font-bold">Student</th>
            {CURRICULUM.map((e) => (
              <th key={e.slug} className="px-2 py-3 font-mono text-xs font-bold text-muted" title={e.title}>
                {String(e.number).padStart(2, "0")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.students.map((s) => (
            <tr key={s.id} className="border-t-2 border-line">
              <td className="sticky left-0 whitespace-nowrap bg-surface px-4 py-2 font-bold">{s.full_name}</td>
              {CURRICULUM.map((e) => {
                const cell = grid.cells.get(`${s.id}:${e.number}`);
                const value = cell && cell.required ? cell.ticked / cell.required : 0;
                const complete = cell && cell.required > 0 && cell.ticked === cell.required;
                return (
                  <td key={e.slug} className="px-1 py-2 text-center">
                    {cell ? (
                      <ProgressRing value={value} size={36} stroke={5} tone={complete ? "done" : "accent"}>
                        <span className="sr-only">{cell.ticked} of {cell.required}</span>
                      </ProgressRing>
                    ) : (
                      <span className="inline-block size-3 rounded-full bg-line" aria-label="locked" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
