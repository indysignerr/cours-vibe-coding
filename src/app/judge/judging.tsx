"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { Skeleton } from "@/components/skeleton";
import { getSupabase } from "@/lib/supabase/client";
import type { Contest, ContestConstraint, RubricCriterion, RubricGroup, Score, ScoreValue, Submission } from "@/lib/types";

type Line = { key: string; label: string; hint: string | null; criterionId: string | null; constraintId: string | null; gate: boolean };
type Group = { group: RubricGroup; lines: Line[] };
type Loaded = { contest: Contest; groups: Group[]; submissions: Submission[]; scores: Map<string, Score> };

const scoreKey = (submissionId: string, line: Line) => `${submissionId}:${line.criterionId ?? line.constraintId}`;

/**
 * Notation en aveugle. Chaque juré ne voit que ses propres notes : la RLS
 * l'impose. Une ligne se note 0, 1 ou 2 ; le portillon se note pass ou fail.
 * L'identité de l'étudiant n'est jamais affichée ici.
 */
async function loadContest(c: Contest, judgeId: string): Promise<Loaded> {
  const supabase = getSupabase();
  const [groups, criteria, constraints, submissions, scores] = await Promise.all([
    supabase.from("rubric_groups").select("*").eq("rubric_id", c.rubric_id ?? "").order("position"),
    supabase.from("rubric_criteria").select("*").order("position"),
    supabase.from("contest_constraints").select("*").eq("contest_id", c.id).order("position"),
    supabase.from("submissions").select("*").eq("contest_id", c.id).order("submitted_at"),
    supabase.from("scores").select("*").eq("judge_id", judgeId),
  ]);
  const err = groups.error ?? criteria.error ?? constraints.error ?? submissions.error ?? scores.error;
  if (err) throw new Error(err.message);

  const crit = (criteria.data as RubricCriterion[]) ?? [];
  const built: Group[] = ((groups.data as RubricGroup[]) ?? []).map((g) => ({
    group: g,
    lines: g.from_constraints
      ? ((constraints.data as ContestConstraint[]) ?? []).map((k) => ({ key: k.id, label: k.body, hint: null, criterionId: null, constraintId: k.id, gate: false }))
      : crit.filter((x) => x.group_id === g.id).map((x) => ({ key: x.id, label: x.label, hint: x.hint, criterionId: x.id, constraintId: null, gate: g.is_gate })),
  }));
  const map = new Map<string, Score>();
  for (const s of (scores.data as Score[]) ?? []) map.set(`${s.submission_id}:${s.criterion_id ?? s.constraint_id}`, s);
  return { contest: c, groups: built, submissions: (submissions.data as Submission[]) ?? [], scores: map };
}

function SubmissionCard({ sub, loaded, judgeId, onSaved }: { sub: Submission; loaded: Loaded; judgeId: string; onSaved: (s: Score) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function rate(line: Line, value: ScoreValue) {
    const key = scoreKey(sub.id, line);
    setBusy(key);
    setError(null);
    const supabase = getSupabase();
    const existing = loaded.scores.get(key);
    const row = { submission_id: sub.id, judge_id: judgeId, criterion_id: line.criterionId, constraint_id: line.constraintId, value };
    const { data, error: err } = existing
      ? await supabase.from("scores").update({ value }).eq("id", existing.id).select().single()
      : await supabase.from("scores").insert(row).select().single();
    setBusy(null);
    if (err) return setError(err.message);
    onSaved(data as Score);
  }

  const gateFailed = loaded.groups.some((g) => g.group.is_gate && g.lines.some((l) => loaded.scores.get(scoreKey(sub.id, l))?.value === 0));
  const total = loaded.groups.filter((g) => !g.group.is_gate).reduce((acc, g) => {
    const vals = g.lines.map((l) => loaded.scores.get(scoreKey(sub.id, l))?.value);
    if (!g.lines.length || vals.some((v) => v === undefined)) return acc;
    const sum = vals.reduce<number>((a, v) => a + (v ?? 0), 0);
    return acc + (sum / (2 * g.lines.length)) * g.group.weight;
  }, 0);
  const allRated = loaded.groups.every((g) => g.lines.every((l) => loaded.scores.has(scoreKey(sub.id, l))));

  return (
    <article className={`card-3d p-6 md:p-8 ${gateFailed ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-extrabold">{sub.title}</h3>
          <p className="mt-2 flex flex-wrap gap-3">
            <a className="btn-3d min-h-[44px] text-sm" href={sub.live_url} target="_blank" rel="noreferrer noopener">Open live <ExternalLink aria-hidden className="size-4" /></a>
            <a className="btn-3d btn-3d--ghost min-h-[44px] text-sm" href={sub.repo_url} target="_blank" rel="noreferrer noopener">Repository <ExternalLink aria-hidden className="size-4" /></a>
          </p>
        </div>
        <div className="text-right">
          <p className="eyebrow text-muted">{allRated ? "Your total" : "Rated so far"}</p>
          <p className="font-display text-display-md font-extrabold">{gateFailed ? "Gate" : Math.round(total)}<span className="text-base text-muted">{gateFailed ? " failed" : " / 100"}</span></p>
        </div>
      </div>
      {sub.note ? <blockquote className="mt-4 max-w-measure border-l-4 border-line-strong pl-4 text-muted">{sub.note}</blockquote> : null}

      {loaded.groups.map(({ group, lines }) => (
        <section key={group.id} className="mt-6" aria-labelledby={`${sub.id}-${group.id}`}>
          <div className="flex items-baseline justify-between gap-4">
            <h4 id={`${sub.id}-${group.id}`} className="font-display text-xl font-extrabold">{group.label}</h4>
            <span className="pill min-h-0 py-1 text-sm">{group.is_gate ? "pass / fail" : `${group.weight} pts`}</span>
          </div>
          {lines.length === 0 ? <p className="mt-2 text-muted">No line for this contest.</p> : null}
          <ul className="mt-3 grid gap-2">
            {lines.map((line) => {
              const key = scoreKey(sub.id, line);
              const current = loaded.scores.get(key)?.value;
              const options: { v: ScoreValue; label: string }[] = line.gate ? [{ v: 0, label: "Fail" }, { v: 2, label: "Pass" }] : [{ v: 0, label: "0" }, { v: 1, label: "1" }, { v: 2, label: "2" }];
              return (
                <li key={key} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-line bg-surface px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{line.label}</p>
                    {line.hint ? <p className="text-sm text-muted">{line.hint}</p> : null}
                  </div>
                  <div role="radiogroup" aria-label={line.label} className="flex gap-2">
                    {options.map((o) => (
                      <button key={o.v} type="button" role="radio" aria-checked={current === o.v} disabled={busy === key}
                        onClick={() => void rate(line, o.v)}
                        className={`btn-3d min-h-[44px] min-w-[52px] text-sm ${current === o.v ? (o.v === 0 ? "" : "btn-3d--done") : "btn-3d--ghost"}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {error ? <p role="alert" className="mt-4 rounded-2xl border-2 border-accent-line bg-surface p-4">{error}</p> : null}
    </article>
  );
}

function Judging({ judgeId }: { judgeId: string }) {
  const [state, setState] = useState<{ items: Loaded[] } | { error: string } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await getSupabase().from("contests").select("*").eq("status", "judging").order("number");
      if (!alive) return;
      if (error) return setState({ error: error.message });
      try {
        const items = await Promise.all(((data as Contest[]) ?? []).map((c) => loadContest(c, judgeId)));
        if (alive) setState({ items });
      } catch (e) {
        if (alive) setState({ error: (e as Error).message });
      }
    })();
    return () => { alive = false; };
  }, [judgeId]);

  if (!state) return <Skeleton rows={4} />;
  if ("error" in state) return <p role="alert" className="rounded-2xl border-2 border-accent-line bg-surface p-4">{state.error}</p>;
  if (state.items.length === 0) {
    return (
      <div className="card-3d max-w-measure p-6 md:p-8">
        <h2 className="font-display text-2xl font-extrabold">Nothing to judge right now</h2>
        <p className="mt-3 text-muted">A contest appears here once an organiser moves it to judging, after the deadline.</p>
      </div>
    );
  }

  function saved(contestId: string, s: Score) {
    setState((prev) => {
      if (!prev || "error" in prev) return prev;
      return { items: prev.items.map((it) => {
        if (it.contest.id !== contestId) return it;
        const scores = new Map(it.scores);
        scores.set(`${s.submission_id}:${s.criterion_id ?? s.constraint_id}`, s);
        return { ...it, scores };
      }) };
    });
  }

  return (
    <>
      {state.items.map((it) => (
        <section key={it.contest.id} aria-labelledby={`c-${it.contest.id}`} className="mb-16">
          <p className="eyebrow text-accent-strong">Judging · you see only your own scores</p>
          <h2 id={`c-${it.contest.id}`} className="mt-2 font-display text-display-md font-extrabold">{it.contest.title}</h2>
          <p className="mt-3 max-w-measure text-muted">
            Open each project on your phone first. A gate fail ends the evaluation. Names are hidden on purpose.
          </p>
          <div className="mt-8 grid gap-6">
            {it.submissions.length === 0 ? <p className="text-muted">No submission.</p> : null}
            {it.submissions.map((sub) => (
              <SubmissionCard key={sub.id} sub={sub} loaded={it} judgeId={judgeId} onSaved={(s) => saved(it.contest.id, s)} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

export function JudgeView() {
  return (
    <AuthGate>
      {(state) =>
        state.profile && (state.profile.role === "judge" || state.profile.role === "admin") ? (
          <Judging judgeId={state.userId} />
        ) : (
          <div className="card-3d max-w-measure p-6 md:p-8">
            <h2 className="font-display text-2xl font-extrabold">Judges only</h2>
            <p className="mt-3 text-muted">This page is for the jury. Your account is signed in as a member.</p>
          </div>
        )
      }
    </AuthGate>
  );
}
