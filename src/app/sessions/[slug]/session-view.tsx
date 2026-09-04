"use client";

import { ArrowLeft, Check, Copy, Lock, Presentation } from "lucide-react";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AuthGate, SignOutButton } from "@/components/auth-gate";
import { ProgressRing } from "@/components/progress-ring";
import { RewardLayer, reward } from "@/components/rewards";
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

function CopyablePrompt({ prompt, index }: { prompt: SessionPrompt; index: number }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <li className="bg-surface p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-sm text-accent-strong tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() => void copy()}
          className="tap inline-flex items-center gap-2 rounded-full border border-line px-4 text-sm font-medium hover:border-accent hover:text-accent-strong"
        >
          {copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {prompt.label ? <p className="mt-3 font-medium">{prompt.label}</p> : null}
      <pre className="projector-code mt-3 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-ink px-5 py-4 font-mono text-xl text-paper">
        <code>{prompt.body}</code>
      </pre>
    </li>
  );
}

function Checklist({
  checks,
  done,
  userId,
  sessionNumber,
  onChange,
}: {
  checks: SessionCheck[];
  done: Set<string>;
  userId: string;
  sessionNumber: number;
  onChange: (ticked: Set<string>) => void;
}) {
  const [ticked, setTicked] = useState(done);
  const required = checks.filter((c) => !c.is_bonus);

  async function toggle(id: string) {
    const supabase = getSupabase();
    const next = new Set(ticked);
    const wasComplete = required.every((c) => ticked.has(c.id));

    if (next.has(id)) {
      next.delete(id);
      setTicked(next);
      onChange(next);
      await supabase.from("check_completions").delete().eq("profile_id", userId).eq("check_id", id);
      return;
    }

    next.add(id);
    setTicked(next);
    onChange(next);
    reward.xp(XP_PER_CHECK);
    await supabase.from("check_completions").insert({ profile_id: userId, check_id: id });

    // La dernière case obligatoire : confettis et badge de la séance.
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
            <label
              className={`tap flex cursor-pointer items-center gap-4 rounded-2xl border-2 px-5 py-4 transition-colors duration-200 ${
                on ? "border-done-line bg-done" : "border-line bg-surface hover:border-accent-line"
              }`}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => void toggle(c.id)}
                className="size-6 shrink-0 accent-[var(--done-line)]"
              />
              <span className={`text-base ${on ? "font-bold" : ""}`}>
                {c.label}
                {c.is_bonus ? (
                  <span className="ml-3 rounded-full bg-xp px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider">
                    bonus
                  </span>
                ) : null}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/** Bascule du mode projecteur, mémorisée. Flèches ou espace : section suivante. */
function useProjector() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(document.documentElement.dataset.projector === "1");
  }, []);

  useEffect(() => {
    if (!on) return;
    const sections = () => [...document.querySelectorAll<HTMLElement>(".projector-section")];
    const onKey = (e: KeyboardEvent) => {
      if (!["ArrowDown", "ArrowRight", "PageDown", " ", "ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) return;
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      e.preventDefault();
      const list = sections();
      const y = window.scrollY + 8;
      const forward = ["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key);
      const target = forward
        ? list.find((el) => el.offsetTop > y + 40)
        : [...list].reverse().find((el) => el.offsetTop < y - 40);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on]);

  function toggle() {
    const next = !on;
    setOn(next);
    if (next) document.documentElement.dataset.projector = "1";
    else delete document.documentElement.dataset.projector;
    try { localStorage.setItem("projector", next ? "1" : "0"); } catch {}
  }

  return { on, toggle };
}

function Content({ slug, userId }: { slug: string; userId: string }) {
  const projector = useProjector();
  const [data, setData] = useState<Payload | null | "locked">(null);
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const entry = bySlug(slug);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();

      // Une séance verrouillée ne revient tout simplement pas : c'est la RLS.
      const { data: session } = await supabase
        .from("sessions")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!session) return setData("locked");
      const s = session as Session;

      const [prompts, checks, solution, done] = await Promise.all([
        supabase.from("session_prompts").select("*").eq("session_id", s.id).order("position"),
        supabase.from("session_checks").select("*").eq("session_id", s.id).order("position"),
        supabase.from("session_solutions").select("*").eq("session_id", s.id).maybeSingle(),
        supabase.from("check_completions").select("check_id").eq("profile_id", userId),
      ]);

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
  }, [slug, userId]);

  if (data === null) return <p className="text-base text-muted">Loading…</p>;

  if (data === "locked") {
    return (
      <div className="max-w-measure rounded-lg border border-line bg-surface p-6 md:p-8">
        <Lock aria-hidden className="size-5 text-muted" />
        <h2 className="mt-4 font-display text-2xl">This session is not open yet</h2>
        <p className="mt-3 text-base text-muted">
          It opens on the day it is taught, and stays open afterwards.
        </p>
        <a className="tap mt-6 inline-flex items-center font-medium text-accent-strong hover:underline" href="/sessions/">
          Back to all sessions
        </a>
      </div>
    );
  }

  const { session, prompts, checks, solution, done } = data;
  const required = checks.filter((c) => !c.is_bonus);
  const tickedRequired = required.filter((c) => ticked.has(c.id)).length;
  const progress = required.length ? tickedRequired / required.length : 0;
  const complete = required.length > 0 && tickedRequired === required.length;

  return (
    <>
      <RewardLayer />

      <div className="card-3d flex flex-wrap items-center justify-between gap-6 p-6 md:p-8">
        <div className="flex items-center gap-5">
          <ProgressRing value={progress} size={96} stroke={10} tone={complete ? "done" : "accent"}>
            <span className="font-display text-xl font-extrabold">
              {required.length ? `${tickedRequired}/${required.length}` : "—"}
            </span>
          </ProgressRing>
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-muted">
              {complete ? "Step complete" : "Your progress"}
            </p>
            <p className="max-w-measure text-project font-medium">{session.promise}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={projector.toggle}
            aria-pressed={projector.on}
            className={`btn-3d min-h-[44px] text-sm ${projector.on ? "" : "btn-3d--ghost"}`}
          >
            <Presentation aria-hidden className="size-4" />
            {projector.on ? "Exit projector" : "Projector"}
          </button>
          <a className="btn-3d btn-3d--ghost projector-hide min-h-[44px] text-sm" href="/sessions/">
            <ArrowLeft aria-hidden className="size-4" />
            Path
          </a>
          <span className="projector-hide"><SignOutButton /></span>
        </div>
      </div>
      {projector.on ? (
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted">
          Arrow keys or space move between sections.
        </p>
      ) : null}

      {session.concept ? (
        <p className="mt-6 max-w-measure border-l-2 border-accent pl-5 text-base text-muted">
          {session.concept}
        </p>
      ) : null}

      {session.starter_repo ? (
        <pre className="mt-10 overflow-x-auto rounded-lg bg-ink px-5 py-4 font-mono text-xl text-paper">
          <code>git clone {session.starter_repo}</code>
        </pre>
      ) : null}

      {session.support_md ? (
        <section aria-labelledby="support" className="projector-section mt-16">
          <h2 id="support" className="font-display text-display-md">
            The idea
          </h2>
          <div className="prose mt-6">
            <Markdown remarkPlugins={[remarkGfm]}>{session.support_md}</Markdown>
          </div>
        </section>
      ) : null}

      {prompts.length ? (
        <section aria-labelledby="prompts" className="projector-section mt-16">
          <h2 id="prompts" className="font-display text-display-md">
            Prompts for this session
          </h2>
          <ol className="mt-6 grid gap-px overflow-hidden rounded-lg bg-line">
            {prompts.map((p, i) => (
              <CopyablePrompt key={p.id} prompt={p} index={i} />
            ))}
          </ol>
        </section>
      ) : null}

      {session.brief_md ? (
        <section aria-labelledby="brief" className="projector-section mt-16">
          <h2 id="brief" className="font-display text-display-md">
            What you build
          </h2>
          <div className="prose mt-6">
            <Markdown remarkPlugins={[remarkGfm]}>{session.brief_md}</Markdown>
          </div>
        </section>
      ) : null}

      {checks.length ? (
        <section aria-labelledby="dod" className="projector-section mt-16">
          <h2 id="dod" className="font-display text-display-md">
            Done means
          </h2>
          <p className="mt-3 max-w-measure text-base text-muted">
            Every line is something another person can check without reading your code.
          </p>
          <div className="mt-6">
            <Checklist
              checks={checks}
              done={done}
              userId={userId}
              sessionNumber={entry?.number ?? 0}
              onChange={setTicked}
            />
          </div>
        </section>
      ) : null}

      {solution?.is_unlocked ? (
        <section aria-labelledby="solution" className="projector-section mt-16">
          <h2 id="solution" className="font-display text-display-md">
            How it was done
          </h2>
          <div className="prose mt-6">
            <Markdown remarkPlugins={[remarkGfm]}>{solution.body_md}</Markdown>
          </div>
        </section>
      ) : null}
    </>
  );
}

export function SessionView({ slug }: { slug: string }) {
  return <AuthGate>{(state) => <Content slug={slug} userId={state.userId} />}</AuthGate>;
}
