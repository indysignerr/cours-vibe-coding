"use client";

import { AlertTriangle, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { CURRICULUM } from "@/lib/curriculum";
import { getSupabase } from "@/lib/supabase/client";
import type { Contest, ContestConstraint, Submission } from "@/lib/types";

const DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

type Loaded = {
  contest: Contest | null;
  constraints: ContestConstraint[];
  mine: Submission | null;
};

/**
 * Le premier critère du jury est éliminatoire : « ça s'ouvre sur un
 * téléphone ». On refuse donc ici tout ce qui ne pourra jamais s'ouvrir.
 */
function checkLiveUrl(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return "That is not a full address. It has to start with https://";
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return "Only http and https addresses can be opened by a judge.";
  }
  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/i.test(url.hostname)) {
    return "This is your own machine. A judge cannot open localhost. Deploy it first.";
  }
  if (/^(github\.com|gitlab\.com)$/i.test(url.hostname)) {
    return "This is your repository, not your live site. The live URL is the one people can use.";
  }
  return null;
}

function checkRepoUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return "The repository link has to start with https://";
  } catch {
    return "That is not a full address. It has to start with https://";
  }
  return null;
}

function Closed() {
  const dates = CURRICULUM.filter((e) => e.kind === "contest");
  return (
    <div className="max-w-measure rounded-lg border border-line bg-surface p-6 md:p-8">
      <h2 className="font-display text-2xl">No contest is open right now</h2>
      <p className="mt-3 text-base text-muted">
        Submissions open when a contest starts, and close at midnight the same day. The next dates
        are below.
      </p>
      <ul className="mt-6 grid gap-2 font-mono text-sm">
        {dates.map((d) => (
          <li key={d.slug}>
            {d.title} · week of{" "}
            {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }).format(
              new Date(d.weekOf)
            )}
          </li>
        ))}
      </ul>
      <a
        className="tap mt-8 inline-flex items-center font-medium text-accent-strong hover:underline"
        href="/contests/"
      >
        Read the judging grid
      </a>
    </div>
  );
}

function Form({ userId }: { userId: string }) {
  const [data, setData] = useState<Loaded | null>(null);
  const [title, setTitle] = useState("");
  const [live, setLive] = useState("");
  const [repo, setRepo] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();

      const { data: contests } = await supabase
        .from("contests")
        .select("*")
        .eq("status", "open")
        .order("number");

      const contest = ((contests as Contest[]) ?? []).find(
        (c) => new Date(c.deadline).getTime() > Date.now()
      );

      if (!contest) return setData({ contest: null, constraints: [], mine: null });

      const [constraints, mine] = await Promise.all([
        supabase
          .from("contest_constraints")
          .select("*")
          .eq("contest_id", contest.id)
          .order("position"),
        supabase
          .from("submissions")
          .select("*")
          .eq("contest_id", contest.id)
          .eq("profile_id", userId)
          .maybeSingle(),
      ]);

      const existing = (mine.data as Submission) ?? null;
      if (existing) {
        setTitle(existing.title);
        setLive(existing.live_url);
        setRepo(existing.repo_url);
        setNote(existing.note ?? "");
      }

      setData({
        contest,
        constraints: (constraints.data as ContestConstraint[]) ?? [],
        mine: existing,
      });
    }
    void load();
  }, [userId]);

  if (data === null) return <p className="text-base text-muted">Loading…</p>;
  if (!data.contest) return <Closed />;

  const { contest, constraints, mine } = data;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);

    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Give it a name.";
    const liveErr = checkLiveUrl(live.trim());
    if (liveErr) next.live = liveErr;
    const repoErr = checkRepoUrl(repo.trim());
    if (repoErr) next.repo = repoErr;
    if (live.trim() && live.trim() === repo.trim()) {
      next.repo = "The live site and the repository cannot be the same link.";
    }
    if (!note.trim()) next.note = "Write the thirty seconds you would say to the jury.";

    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    const supabase = getSupabase();
    const row = {
      contest_id: contest.id,
      profile_id: userId,
      title: title.trim(),
      live_url: live.trim(),
      repo_url: repo.trim(),
      note: note.trim(),
    };

    const { error } = mine
      ? await supabase.from("submissions").update(row).eq("id", mine.id)
      : await supabase.from("submissions").insert(row);

    if (error) {
      setBusy(false);
      return setErrors({ form: error.message });
    }

    // On relit la ligne : après une insertion on n'a pas encore son id, et
    // sans lui la modification suivante viserait `id = undefined`.
    const { data: fresh } = await supabase
      .from("submissions")
      .select("*")
      .eq("contest_id", contest.id)
      .eq("profile_id", userId)
      .maybeSingle();

    setBusy(false);
    setSaved(true);
    setData({ contest, constraints, mine: (fresh as Submission) ?? null });
  }

  const field =
    "tap mt-2 w-full rounded-lg border border-line bg-surface px-4 text-base";

  return (
    <>
      <div className="rounded-lg bg-ink p-6 text-paper md:p-8">
        <p className="font-mono text-sm uppercase tracking-wider text-paper/70">
          {contest.title} · closes {DATE.format(new Date(contest.deadline))}
        </p>
        {constraints.length ? (
          <>
            <h2 className="mt-4 font-display text-display-md">The constraints</h2>
            <ol className="mt-5 grid gap-3">
              {constraints.map((c, i) => (
                <li key={c.id} className="flex gap-4">
                  <span className="font-mono text-sm text-paper/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-project">{c.body}</span>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className="mt-4 text-project">The constraints are announced in the room.</p>
        )}
      </div>

      <form className="mt-14 max-w-xl" onSubmit={submit} noValidate>
        <h2 className="font-display text-display-md">
          {mine ? "Your submission" : "Submit your project"}
        </h2>
        <p className="mt-3 text-base text-muted">
          You can change any of this until the deadline. After that the database refuses it, so do
          not wait for the last minute.
        </p>

        <label className="mt-8 block text-sm font-medium" htmlFor="title">
          Project name
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={field}
        />
        {errors.title ? <p className="mt-2 text-sm text-accent-strong">{errors.title}</p> : null}

        <label className="mt-6 block text-sm font-medium" htmlFor="live">
          Live URL
        </label>
        <p className="mt-1 text-sm text-muted">
          The address a judge opens on a phone. Not localhost, not your repository.
        </p>
        <input
          id="live"
          inputMode="url"
          placeholder="https://"
          value={live}
          onChange={(e) => setLive(e.target.value)}
          className={field}
        />
        {errors.live ? (
          <p className="mt-2 flex items-start gap-2 text-sm text-accent-strong">
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
            {errors.live}
          </p>
        ) : null}

        <label className="mt-6 block text-sm font-medium" htmlFor="repo">
          Repository URL
        </label>
        <p className="mt-1 text-sm text-muted">Public, with its commit history.</p>
        <input
          id="repo"
          inputMode="url"
          placeholder="https://github.com/"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          className={field}
        />
        {errors.repo ? <p className="mt-2 text-sm text-accent-strong">{errors.repo}</p> : null}

        <label className="mt-6 block text-sm font-medium" htmlFor="note">
          Your thirty seconds
        </label>
        <p className="mt-1 text-sm text-muted">
          What you built, and one thing you had to decide yourself. Three sentences is plenty.
        </p>
        <textarea
          id="note"
          rows={5}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-2 w-full rounded-lg border border-line bg-surface px-4 py-3 text-base"
        />
        {errors.note ? <p className="mt-2 text-sm text-accent-strong">{errors.note}</p> : null}

        {errors.form ? (
          <p role="alert" className="mt-6 rounded-lg border border-accent bg-surface p-4 text-base">
            {errors.form}
          </p>
        ) : null}

        {saved ? (
          <p
            role="status"
            className="mt-6 flex items-center gap-2 rounded-lg border border-line bg-surface p-4 text-base"
          >
            <Check aria-hidden className="size-5 text-accent-strong" />
            Saved. You can keep editing until the deadline.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="tap mt-8 inline-flex w-full items-center justify-center rounded-full bg-accent px-7 font-medium text-accent-ink transition-transform duration-200 ease-swift hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
        >
          {busy ? "Saving…" : mine ? "Update my submission" : "Submit"}
        </button>

        <a
          className="tap mt-4 inline-flex w-full items-center justify-center text-sm font-medium text-accent-strong hover:underline"
          href="/contests/"
        >
          Score yourself against the grid first
        </a>
      </form>
    </>
  );
}

export function SubmitForm() {
  return <AuthGate>{(state) => <Form userId={state.userId} />}</AuthGate>;
}
