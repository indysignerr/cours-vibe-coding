"use client";

import { ArrowLeft, Check, Copy, Lock, Presentation } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AuthGate, SignOutButton } from "@/components/auth-gate";
import { ProgressRing } from "@/components/progress-ring";
import { RewardLayer, reward } from "@/components/rewards";
import { Skeleton } from "@/components/skeleton";
import { badgeForSession } from "@/lib/badges";
import { bySlug } from "@/lib/curriculum";
import { XP_PER_CHECK } from "@/lib/progress";
import { getSupabase } from "@/lib/supabase/client";
import type { Session, SessionCheck, SessionPrompt, SessionSolution } from "@/lib/types";

type Payload = {
  session: Session;
  prompts: SessionPrompt[];
  checks: SessionCheck[];
  solution: SessionSolution | null;
  done: Set<string>;
};

function CopyablePrompt({ prompt, index, announce }: { prompt: SessionPrompt; index: number; announce: (t: string) => void }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt.body);
      setCopied(true);
      announce(`Prompt ${index + 1} copied`);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      announce("Copy failed. Select the text and copy it by hand.");
    }
  }

  return (
    <li className="card-3d min-w-0 p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono font-bold tabular-nums text-accent-strong">{String(index + 1).padStart(2, "0")}</span>
        <button type="button" onClick={() => void copy()} className={`btn-3d min-h-[44px] text-sm ${copied ? "btn-3d--done" : "btn-3d--ghost"}`}>
          {copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {prompt.label ? <p className="mt-3 font-bold">{prompt.label}</p> : null}
      <pre className="code-block projector-code mt-3 overflow-x-auto whitespace-pre-wrap px-5 py-4 font-mono text-xl">
        <code>{prompt.body}</code>
      </pre>
    </li>
  );
}

/**
 * Checklist contrôlée. L'écriture est confirmée avant toute récompense :
 * une insertion refusée remet la case à zéro et explique pourquoi.
 */
function Checklist({
  checks, ticked, userId, sessionNumber, onChange, announce,
}: {
  checks: SessionCheck[]; ticked: Set<string>; userId: string; sessionNumber: number;
  onChange: (next: Set<string>) => void; announce: (t: string) => void;
}) {
  const [pending, setPending] = useState<Set<string>>(new Set());
  const required = checks.filter((c) => !c.is_bonus);

  async function toggle(id: string) {
    if (pending.has(id)) return;
    setPending((p) => new Set(p).add(id));
    const supabase = getSupabase();
    const wasComplete = required.length > 0 && required.every((c) => ticked.has(c.id));
    const next = new Set(ticked);
    const turningOn = !next.has(id);
    if (turningOn) next.add(id); else next.delete(id);
    onChange(next);

    const { error } = turningOn
      ? await supabase.from("check_completions").insert({ profile_id: userId, check_id: id })
      : await supabase.from("check_completions").delete().eq("profile_id", userId).eq("check_id", id);

    setPending((p) => { const q = new Set(p); q.delete(id); return q; });

    if (error) {
      onChange(ticked); // retour à l'état confirmé
      announce(`Could not save that line: ${error.message}`);
      return;
    }
    if (!turningOn) return;

    reward.xp(XP_PER_CHECK);
    const nowComplete = required.length > 0 && required.every((c) => next.has(c.id));
    if (nowComplete && !wasComplete) {
      reward.confetti();
      const badge = badgeForSession(sessionNumber);
      if (badge) setTimeout(() => reward.badge(badge), 700);
    }
  }

  return (
    <ul className="grid gap-3">
      {checks.map((c) => {
        const on = ticked.has(c.id);
        return (
          <li key={c.id}>
            <label className={`tap flex cursor-pointer items-center gap-4 rounded-2xl border-2 px-5 py-4 transition-colors duration-200 ${
              on ? "border-done-line bg-done fill-text" : "border-line-strong bg-surface hover:border-accent-line"
            } ${pending.has(c.id) ? "opacity-70" : ""}`}>
              <input type="checkbox" checked={on} disabled={pending.has(c.id)} onChange={() => void toggle(c.id)} className="size-6 shrink-0 accent-[var(--done-line)]" />
              <span className={on ? "font-bold" : ""}>
                {c.label}
                {c.is_bonus ? <span className="pill pill--xp ml-3 min-h-0 px-2 py-0.5 font-mono text-xs uppercase tracking-wider">bonus</span> : null}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Mode projecteur, mémorisé, mais posé sur <html> UNIQUEMENT pendant que
 * cette page est montée : en la quittant, l'en-tête et le pied reviennent.
 */
const projectorListeners = new Set<() => void>();
const subscribeProjector = (cb: () => void) => { projectorListeners.add(cb); return () => projectorListeners.delete(cb); };
const readProjector = () => { try { return localStorage.getItem("projector") === "1"; } catch { return false; } };

function useProjector() {
  const on = useSyncExternalStore(subscribeProjector, readProjector, () => false);

  // L'attribut n'existe sur <html> que pendant que cette page est montée :
  // en la quittant, l'en-tête et le pied de page reviennent partout ailleurs.
  useEffect(() => {
    if (on) document.documentElement.dataset.projector = "1";
    else delete document.documentElement.dataset.projector;
    return () => { delete document.documentElement.dataset.projector; };
  }, [on]);

  useEffect(() => {
    if (!on) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      // Un bouton, un lien ou un champ garde ses touches : on ne vole que celles du document.
      if (target && target !== document.body && target.closest("button, a, input, textarea, select, [contenteditable]")) return;
      const forward = ["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key);
      const back = ["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key);
      if (!forward && !back) return;
      e.preventDefault();
      const list = [...document.querySelectorAll<HTMLElement>(".projector-section")];
      const y = window.scrollY + 8;
      const next = forward ? list.find((el) => el.offsetTop > y + 40) : [...list].reverse().find((el) => el.offsetTop < y - 40);
      next?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on]);

  function toggle() {
    try { localStorage.setItem("projector", on ? "0" : "1"); } catch {}
    projectorListeners.forEach((cb) => cb());
  }
  return { on, toggle };
}

function Content({ slug, userId }: { slug: string; userId: string }) {
  const projector = useProjector();
  const [data, setData] = useState<Payload | null | "locked">(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [live, setLive] = useState("");
  const entry = bySlug(slug);
  const liveId = useId();

  useEffect(() => {
    let alive = true;
    async function load() {
      const supabase = getSupabase();
      const { data: session, error } = await supabase.from("sessions").select("*").eq("slug", slug).maybeSingle();
      if (!alive) return;
      if (error) return setLoadError(error.message);
      if (!session) return setData("locked");
      const s = session as Session;
      const [prompts, checks, solution, done] = await Promise.all([
        supabase.from("session_prompts").select("*").eq("session_id", s.id).order("position"),
        supabase.from("session_checks").select("*").eq("session_id", s.id).order("position"),
        supabase.from("session_solutions").select("*").eq("session_id", s.id).maybeSingle(),
        supabase.from("check_completions").select("check_id").eq("profile_id", userId),
      ]);
      if (!alive) return;
      const firstError = prompts.error ?? checks.error ?? done.error;
      if (firstError) return setLoadError(firstError.message);
      const doneSet = new Set(((done.data as { check_id: string }[]) ?? []).map((d) => d.check_id));
      setTicked(doneSet);
      setData({
        session: s,
        prompts: (prompts.data as SessionPrompt[]) ?? [],
        checks: (checks.data as SessionCheck[]) ?? [],
        solution: (solution.data as SessionSolution) ?? null,
        done: doneSet,
      });
    }
    void load();
    return () => { alive = false; };
  }, [slug, userId]);

  if (loadError) {
    return <p role="alert" className="rounded-2xl border-2 border-accent-line bg-surface p-4">This session could not be loaded ({loadError}). Reload the page.</p>;
  }
  if (data === null) return <Skeleton rows={4} />;
  if (data === "locked") {
    return (
      <div className="card-3d max-w-measure p-6 md:p-8">
        <Lock aria-hidden className="size-5 text-muted" />
        <h2 className="mt-4 font-display text-2xl font-extrabold">This session is not open yet</h2>
        <p className="mt-3 text-muted">It opens on the day it is taught, and stays open afterwards.</p>
        <Link className="btn-3d btn-3d--ghost mt-6" href="/sessions/"><ArrowLeft aria-hidden className="size-4" />Back to all sessions</Link>
      </div>
    );
  }

  const { session, prompts, checks, solution } = data;
  const required = checks.filter((c) => !c.is_bonus);
  const tickedRequired = required.filter((c) => ticked.has(c.id)).length;
  const progress = required.length ? tickedRequired / required.length : 0;
  const complete = required.length > 0 && tickedRequired === required.length;

  return (
    <>
      <RewardLayer />
      <p id={liveId} role="status" aria-live="polite" className="sr-only">{live}</p>

      <div className="card-3d flex flex-wrap items-center justify-between gap-6 p-6 md:p-8">
        <div className="flex items-center gap-5">
          <ProgressRing value={progress} size={96} stroke={10} tone={complete ? "done" : "accent"} label={required.length ? `${tickedRequired} of ${required.length} required lines done` : "No checklist yet"}>
            <span className="font-display text-xl font-extrabold">{required.length ? `${tickedRequired}/${required.length}` : "—"}</span>
          </ProgressRing>
          <div>
            <p className="eyebrow text-muted">{complete ? "Step complete" : "Your progress"}</p>
            <p className="max-w-measure text-project font-bold">{session.promise}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={projector.toggle} aria-pressed={projector.on} className={`btn-3d min-h-[44px] text-sm ${projector.on ? "" : "btn-3d--ghost"}`}>
            <Presentation aria-hidden className="size-4" />
            Projector mode
          </button>
          <Link className="btn-3d btn-3d--ghost projector-hide min-h-[44px] text-sm" href="/sessions/"><ArrowLeft aria-hidden className="size-4" />Path</Link>
          <span className="projector-hide"><SignOutButton /></span>
        </div>
      </div>
      {projector.on ? <p className="eyebrow mt-3 text-muted">Arrow keys or space move between sections. Press the button again to leave.</p> : null}

      {session.concept ? <p className="mt-6 max-w-measure border-l-4 border-accent-line pl-5 text-muted">{session.concept}</p> : null}

      {session.starter_repo ? (
        <pre className="code-block projector-code mt-10 overflow-x-auto px-5 py-4 font-mono text-xl"><code>git clone {session.starter_repo}</code></pre>
      ) : null}

      {session.support_md ? (
        <section aria-labelledby="support" className="projector-section mt-16">
          <h2 id="support" className="font-display text-display-md font-extrabold">The idea</h2>
          <div className="prose mt-6"><Markdown remarkPlugins={[remarkGfm]}>{session.support_md}</Markdown></div>
        </section>
      ) : null}

      {prompts.length ? (
        <section aria-labelledby="prompts" className="projector-section mt-16">
          <h2 id="prompts" className="font-display text-display-md font-extrabold">Prompts for this session</h2>
          <p className="mt-3 max-w-measure text-muted">Replace everything between &lt; and &gt; before you press Enter.</p>
          <ol className="mt-6 grid gap-4">
            {prompts.map((p, i) => <CopyablePrompt key={p.id} prompt={p} index={i} announce={setLive} />)}
          </ol>
        </section>
      ) : null}

      {session.brief_md ? (
        <section aria-labelledby="brief" className="projector-section mt-16">
          <h2 id="brief" className="font-display text-display-md font-extrabold">What you build</h2>
          <div className="prose mt-6"><Markdown remarkPlugins={[remarkGfm]}>{session.brief_md}</Markdown></div>
        </section>
      ) : null}

      {checks.length ? (
        <section aria-labelledby="dod" className="projector-section mt-16">
          <h2 id="dod" className="font-display text-display-md font-extrabold">Done means</h2>
          <p className="mt-3 max-w-measure text-muted">Every line is something another person can check without reading your code.</p>
          <div className="mt-6">
            <Checklist checks={checks} ticked={ticked} userId={userId} sessionNumber={entry?.number ?? 0} onChange={setTicked} announce={setLive} />
          </div>
        </section>
      ) : null}

      {solution?.is_unlocked ? (
        <section aria-labelledby="solution" className="projector-section mt-16">
          <h2 id="solution" className="font-display text-display-md font-extrabold">How it was done</h2>
          <div className="prose mt-6"><Markdown remarkPlugins={[remarkGfm]}>{solution.body_md}</Markdown></div>
        </section>
      ) : null}
    </>
  );
}

export function SessionView({ slug }: { slug: string }) {
  return <AuthGate>{(state) => <Content slug={slug} userId={state.userId} />}</AuthGate>;
}
