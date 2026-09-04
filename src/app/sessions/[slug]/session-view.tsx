"use client";

import { Check, Copy, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AuthGate, SignOutButton } from "@/components/auth-gate";
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
      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-ink px-5 py-4 font-mono text-xl text-paper">
        <code>{prompt.body}</code>
      </pre>
    </li>
  );
}

function Checklist({ checks, done, userId }: { checks: SessionCheck[]; done: Set<string>; userId: string }) {
  const [ticked, setTicked] = useState(done);

  async function toggle(id: string) {
    const supabase = getSupabase();
    const next = new Set(ticked);

    if (next.has(id)) {
      next.delete(id);
      setTicked(next);
      await supabase.from("check_completions").delete().eq("profile_id", userId).eq("check_id", id);
    } else {
      next.add(id);
      setTicked(next);
      await supabase.from("check_completions").insert({ profile_id: userId, check_id: id });
    }
  }

  return (
    <ul className="grid gap-3">
      {checks.map((c) => (
        <li key={c.id}>
          <label className="tap flex cursor-pointer items-center gap-4 rounded-lg border border-line bg-surface px-5 py-4">
            <input
              type="checkbox"
              checked={ticked.has(c.id)}
              onChange={() => void toggle(c.id)}
              className="size-5 shrink-0 accent-[var(--accent)]"
            />
            <span className="text-base">
              {c.label}
              {c.is_bonus ? (
                <span className="ml-3 font-mono text-xs uppercase tracking-wider text-accent-strong">
                  bonus
                </span>
              ) : null}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}

function Content({ slug, userId }: { slug: string; userId: string }) {
  const [data, setData] = useState<Payload | null | "locked">(null);

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

      setData({
        session: s,
        prompts: (prompts.data as SessionPrompt[]) ?? [],
        checks: (checks.data as SessionCheck[]) ?? [],
        solution: (solution.data as SessionSolution) ?? null,
        done: new Set(((done.data as { check_id: string }[]) ?? []).map((d) => d.check_id)),
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

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="max-w-measure text-project">{session.promise}</p>
        <SignOutButton />
      </div>

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
        <section aria-labelledby="support" className="mt-16">
          <h2 id="support" className="font-display text-display-md">
            The idea
          </h2>
          <div className="prose mt-6">
            <Markdown remarkPlugins={[remarkGfm]}>{session.support_md}</Markdown>
          </div>
        </section>
      ) : null}

      {prompts.length ? (
        <section aria-labelledby="prompts" className="mt-16">
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
        <section aria-labelledby="brief" className="mt-16">
          <h2 id="brief" className="font-display text-display-md">
            What you build
          </h2>
          <div className="prose mt-6">
            <Markdown remarkPlugins={[remarkGfm]}>{session.brief_md}</Markdown>
          </div>
        </section>
      ) : null}

      {checks.length ? (
        <section aria-labelledby="dod" className="mt-16">
          <h2 id="dod" className="font-display text-display-md">
            Done means
          </h2>
          <p className="mt-3 max-w-measure text-base text-muted">
            Every line is something another person can check without reading your code.
          </p>
          <div className="mt-6">
            <Checklist checks={checks} done={done} userId={userId} />
          </div>
        </section>
      ) : null}

      {solution?.is_unlocked ? (
        <section aria-labelledby="solution" className="mt-16">
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
