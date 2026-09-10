"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/skeleton";
import { getSupabase } from "@/lib/supabase/client";
import type { Contest, ContestConstraint, ContestStatus, RubricCriterion, RubricGroup, Score, Submission } from "@/lib/types";

const NEXT: Record<ContestStatus, { label: string; to: ContestStatus } | null> = {
  draft: { label: "Open the contest", to: "open" },
  open: { label: "Close submissions, start judging", to: "judging" },
  judging: null, // fermé par la publication des résultats
  closed: null,
};

type Ranked = { sub: Submission; total: number; gateFailed: boolean; tie: [number, number]; note: string; mention: string };

/**
 * Cycle de vie d'un concours et publication des résultats. Le classement
 * se calcule ici à partir de TOUTES les notes, que seul un admin peut lire :
 * moyenne des jurés par groupe, portillon éliminatoire, départage écrit.
 */
function ContestRow({ contest, onChange }: { contest: Contest; onChange: () => void }) {
  const [constraints, setConstraints] = useState<ContestConstraint[]>([]);
  const [body, setBody] = useState("");
  const [brief, setBrief] = useState(contest.brief_md ?? "");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ranking, setRanking] = useState<Ranked[] | null>(null);

  async function loadConstraints() {
    const { data, error: err } = await getSupabase().from("contest_constraints").select("*").eq("contest_id", contest.id).order("position");
    if (err) return setError(err.message);
    setConstraints((data as ContestConstraint[]) ?? []);
  }
  useEffect(() => { queueMicrotask(() => void loadConstraints()); }, [contest.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function addConstraint(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    if (constraints.length >= 3) return setError("Three constraints, never more. Remove one first.");
    const { error: err } = await getSupabase().from("contest_constraints").insert({ contest_id: contest.id, position: constraints.length + 1, body: body.trim() });
    if (err) return setError(err.message);
    setBody("");
    await loadConstraints();
  }

  async function removeConstraint(id: string) {
    const { error: err } = await getSupabase().from("contest_constraints").delete().eq("id", id);
    if (err) return setError(err.message);
    await loadConstraints();
  }

  async function saveBrief() {
    setBusy(true);
    const { error: err } = await getSupabase().from("contests").update({ brief_md: brief }).eq("id", contest.id);
    setBusy(false);
    if (err) return setError(err.message);
    setStatus("Brief saved.");
  }

  async function move(to: ContestStatus) {
    setBusy(true);
    const patch: Partial<Contest> = { status: to };
    if (to === "open") patch.announced_at = new Date().toISOString();
    const { error: err } = await getSupabase().from("contests").update(patch).eq("id", contest.id);
    setBusy(false);
    if (err) return setError(err.message);
    setStatus(`Contest is now ${to}.`);
    onChange();
  }

  async function computeRanking() {
    setBusy(true);
    setError(null);
    const supabase = getSupabase();
    const [groups, criteria, subs, scores] = await Promise.all([
      supabase.from("rubric_groups").select("*").eq("rubric_id", contest.rubric_id ?? "").order("position"),
      supabase.from("rubric_criteria").select("*"),
      supabase.from("submissions").select("*").eq("contest_id", contest.id),
      supabase.from("scores").select("*"),
    ]);
    setBusy(false);
    const err = groups.error ?? criteria.error ?? subs.error ?? scores.error;
    if (err) return setError(err.message);

    const G = (groups.data as RubricGroup[]) ?? [];
    const C = (criteria.data as RubricCriterion[]) ?? [];
    const S = ((scores.data as Score[]) ?? []).filter((s) => ((subs.data as Submission[]) ?? []).some((x) => x.id === s.submission_id));
    const judges = [...new Set(S.map((s) => s.judge_id))];

    const ranked: Ranked[] = ((subs.data as Submission[]) ?? []).map((sub) => {
      const mine = S.filter((s) => s.submission_id === sub.id);
      const gate = G.find((g) => g.is_gate);
      const gateLines = gate ? C.filter((c) => c.group_id === gate.id).map((c) => c.id) : [];
      const gateFailed = mine.some((s) => s.criterion_id && gateLines.includes(s.criterion_id) && s.value === 0);
      let total = 0;
      const perGroup = new Map<string, number>();
      for (const g of G) {
        if (g.is_gate) continue;
        const lineIds = g.from_constraints ? constraints.map((k) => k.id) : C.filter((c) => c.group_id === g.id).map((c) => c.id);
        if (!lineIds.length) continue;
        // moyenne des jurés : chaque juré donne (somme / (2 × lignes)) × poids
        const perJudge = judges.map((j) => {
          const vals = lineIds.map((id) => mine.find((s) => s.judge_id === j && (s.criterion_id === id || s.constraint_id === id))?.value);
          if (vals.some((v) => v === undefined)) return null;
          return (vals.reduce<number>((a, v) => a + (v ?? 0), 0) / (2 * lineIds.length)) * g.weight;
        }).filter((v): v is number => v !== null);
        const avg = perJudge.length ? perJudge.reduce((a, b) => a + b, 0) / perJudge.length : 0;
        perGroup.set(g.label, avg);
        total += avg;
      }
      return { sub, total, gateFailed, tie: [perGroup.get("Design craft") ?? 0, perGroup.get("Idea and content") ?? 0], note: "", mention: "" };
    });
    ranked.sort((a, b) => (Number(a.gateFailed) - Number(b.gateFailed)) || (b.total - a.total) || (b.tie[0] - a.tie[0]) || (b.tie[1] - a.tie[1]));
    setRanking(ranked);
    if (judges.length < 2) setStatus(`Only ${judges.length} judge has scored so far.`);
  }

  async function publish() {
    if (!ranking) return;
    if (ranking.some((r) => !r.gateFailed && !r.note.trim())) return setError("One sentence on every project, before publishing. Nobody who entered goes unmentioned.");
    setBusy(true);
    const supabase = getSupabase();
    await supabase.from("results").delete().eq("contest_id", contest.id);
    const rows = ranking.map((r, i) => ({ contest_id: contest.id, submission_id: r.sub.id, rank: i + 1, is_winner: i === 0 && !r.gateFailed, mention: r.mention.trim() || null, note: r.note.trim() || null }));
    const { error: err } = await supabase.from("results").insert(rows);
    if (err) { setBusy(false); return setError(err.message); }
    const { error: err2 } = await supabase.from("contests").update({ status: "closed" }).eq("id", contest.id);
    setBusy(false);
    if (err2) return setError(err2.message);
    setStatus("Results published. The contest is closed.");
    onChange();
  }

  const next = NEXT[contest.status];

  return (
    <li className="card-3d p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Contest {contest.number} · {contest.status}</p>
          <h3 className="font-display text-2xl font-extrabold">{contest.title}</h3>
        </div>
        {next ? <button type="button" disabled={busy} className="btn-3d" onClick={() => void move(next.to)}>{next.label}</button> : null}
      </div>

      {contest.status !== "closed" ? (
        <>
          <form className="mt-6" onSubmit={addConstraint}>
            <p className="font-bold">Constraints, three at most</p>
            <ol className="mt-2 grid gap-2">
              {constraints.map((k, i) => (
                <li key={k.id} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-line bg-surface px-4 py-2">
                  <span><span className="font-mono font-bold text-muted">{i + 1}.</span> {k.body}</span>
                  {contest.status === "draft" ? <button type="button" className="btn-3d btn-3d--ghost min-h-[40px] text-sm" onClick={() => void removeConstraint(k.id)}>Remove</button> : null}
                </li>
              ))}
            </ol>
            {contest.status === "draft" ? (
              <div className="mt-3 flex gap-3">
                <input aria-label="New constraint" value={body} onChange={(e) => setBody(e.target.value)} className="tap w-full rounded-2xl border-2 border-line-strong bg-surface px-4 focus:border-accent-line" placeholder="Zero images. Type, colour and layout only." />
                <button type="submit" className="btn-3d btn-3d--ink whitespace-nowrap">Add</button>
              </div>
            ) : null}
          </form>

          <label className="mt-6 block font-bold" htmlFor={`brief-${contest.id}`}>Brief, markdown</label>
          <textarea id={`brief-${contest.id}`} rows={5} value={brief} onChange={(e) => setBrief(e.target.value)} className="mt-2 w-full rounded-2xl border-2 border-line-strong bg-surface px-4 py-3 font-mono text-base focus:border-accent-line" />
          <button type="button" disabled={busy} className="btn-3d btn-3d--ghost mt-3" onClick={() => void saveBrief()}>Save brief</button>
        </>
      ) : null}

      {contest.status === "judging" ? (
        <div className="mt-8 rounded-2xl border-2 border-line bg-sunken p-5">
          <p className="font-bold">Results</p>
          <p className="mt-1 text-sm text-muted">Compute the ranking from every judge&apos;s scores, write one sentence per project, then publish. Publishing closes the contest.</p>
          <button type="button" disabled={busy} className="btn-3d mt-4" onClick={() => void computeRanking()}>Compute the ranking</button>
          {ranking ? (
            <ol className="mt-5 grid gap-4">
              {ranking.map((r, i) => (
                <li key={r.sub.id} className="card-3d p-4">
                  <p className="font-bold">#{i + 1} · {r.sub.title} · {r.gateFailed ? "gate failed" : `${Math.round(r.total)} / 100`}</p>
                  <label className="mt-2 block text-sm font-bold" htmlFor={`note-${r.sub.id}`}>One sentence</label>
                  <input id={`note-${r.sub.id}`} value={r.note} onChange={(e) => setRanking(ranking.map((x) => x.sub.id === r.sub.id ? { ...x, note: e.target.value } : x))} className="tap mt-1 w-full rounded-2xl border-2 border-line-strong bg-surface px-4 focus:border-accent-line" />
                  <label className="mt-2 block text-sm font-bold" htmlFor={`mention-${r.sub.id}`}>Mention, optional</label>
                  <input id={`mention-${r.sub.id}`} value={r.mention} onChange={(e) => setRanking(ranking.map((x) => x.sub.id === r.sub.id ? { ...x, mention: e.target.value } : x))} className="tap mt-1 w-full rounded-2xl border-2 border-line-strong bg-surface px-4 focus:border-accent-line" placeholder="Best copy" />
                </li>
              ))}
              <button type="button" disabled={busy} className="btn-3d btn-3d--done" onClick={() => void publish()}>Publish the results and close</button>
            </ol>
          ) : null}
        </div>
      ) : null}

      {error ? <p role="alert" className="mt-4 rounded-2xl border-2 border-accent-line bg-surface p-4">{error}</p> : null}
      <p role="status" aria-live="polite" className={status ? "mt-4 rounded-2xl border-2 border-line bg-surface p-4" : "sr-only"}>{status ?? ""}</p>
    </li>
  );
}

export function ContestsAdmin() {
  const [contests, setContests] = useState<Contest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error: err } = await getSupabase().from("contests").select("*").order("number");
    if (err) return setError(err.message);
    setContests((data as Contest[]) ?? []);
  }
  useEffect(() => { queueMicrotask(() => void load()); }, []);

  if (error) return <p role="alert" className="rounded-2xl border-2 border-accent-line bg-surface p-4">{error}</p>;
  if (!contests) return <Skeleton rows={3} />;
  return <ul className="grid gap-6">{contests.map((c) => <ContestRow key={c.id} contest={c} onChange={() => void load()} />)}</ul>;
}
