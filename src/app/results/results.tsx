"use client";

import { Crown, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { Mascot } from "@/components/mascot";
import { Skeleton } from "@/components/skeleton";
import { getSupabase } from "@/lib/supabase/client";
import type { ResultRow } from "@/lib/types";

function List() {
  const [state, setState] = useState<{ rows: ResultRow[] } | { error: string } | null>(null);

  useEffect(() => {
    let alive = true;
    void getSupabase().rpc("contest_results").then(({ data, error }) => {
      if (!alive) return;
      setState(error ? { error: error.message } : { rows: (data as ResultRow[]) ?? [] });
    });
    return () => { alive = false; };
  }, []);

  if (!state) return <Skeleton rows={4} />;
  if ("error" in state) {
    return (
      <div className="card-3d p-6">
        <p className="font-bold">Results are not switched on yet.</p>
        <p className="mt-2 text-sm text-muted">For the organisers: run supabase/005_results.sql. ({state.error})</p>
      </div>
    );
  }
  if (state.rows.length === 0) {
    return (
      <div className="card-3d flex items-center gap-5 p-6">
        <Mascot size={72} mood="focused" />
        <p className="text-muted">No contest has been closed yet. The first one is the week of 5 October.</p>
      </div>
    );
  }

  const byContest = new Map<number, ResultRow[]>();
  for (const r of state.rows) byContest.set(r.contest_number, [...(byContest.get(r.contest_number) ?? []), r]);

  return (
    <>
      {[...byContest.entries()].map(([n, rows]) => (
        <section key={n} aria-labelledby={`r-${n}`} className="mb-16">
          <p className="eyebrow text-accent-strong">Contest {n}</p>
          <h2 id={`r-${n}`} className="mt-2 font-display text-display-md font-extrabold">{rows[0].contest_title}</h2>
          <ol className="mt-8 grid gap-4">
            {rows.map((r) => (
              <li key={`${n}-${r.rank}-${r.project_title}`} className={`card-3d p-6 ${r.is_winner ? "card-3d--streak" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">
                      #{r.rank}{r.is_winner ? <Crown role="img" aria-label="Winner" className="ml-2 inline size-5" /> : null}
                      {r.mention ? <span className="pill pill--xp ml-3 min-h-0 py-0.5 text-xs">{r.mention}</span> : null}
                    </p>
                    <p className="mt-1 font-display text-2xl font-extrabold">{r.project_title}</p>
                    <p className="font-bold">{r.display_name}</p>
                    {r.note ? <p className="mt-2 max-w-measure">{r.note}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a className="btn-3d btn-3d--ghost min-h-[44px] text-sm" href={r.live_url} target="_blank" rel="noreferrer noopener">Live <ExternalLink aria-hidden className="size-4" /></a>
                    <a className="btn-3d btn-3d--ghost min-h-[44px] text-sm" href={r.repo_url} target="_blank" rel="noreferrer noopener">Repo <ExternalLink aria-hidden className="size-4" /></a>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}

export function ResultsView() {
  return <AuthGate>{() => <List />}</AuthGate>;
}
