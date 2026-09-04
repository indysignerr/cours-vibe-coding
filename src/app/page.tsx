import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { CURRICULUM, PROOF } from "@/lib/curriculum";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
};

const NUMBERS = [
  { value: "1 h", label: "per week, one evening" },
  { value: String(SITE.weeks), label: "weeks, September to November" },
  { value: `${SITE.prizeEur} €`, label: "prize, every month" },
];

const OUTCOMES = [
  {
    title: "Three apps with your name on them",
    body: "Not exercises in a folder. Public URLs you can send to anyone, including a recruiter.",
  },
  {
    title: "A GitHub profile with real history",
    body: "Commits, branches, a revert that saved you. The kind of profile that reads as evidence.",
  },
  {
    title: "A way of working with agents",
    body: "How to brief one, when to stop it, and how to tell good output from confident nonsense.",
  },
];

export default function Home() {
  const first = CURRICULUM[0];

  return (
    <>
      <header className="mx-auto flex max-w-stage items-center justify-between px-6 py-6 md:px-10">
        <span className="font-display text-2xl leading-none">{SITE.name}</span>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm">
          <a className="tap flex items-center px-3 font-medium hover:text-accent" href="/programme/">
            Programme
          </a>
          <a className="tap flex items-center px-3 font-medium hover:text-accent" href="/setup/">
            Setup
          </a>
          <a
            className="tap ml-2 flex items-center rounded-full bg-ink px-5 font-medium text-paper transition-colors duration-200 ease-swift hover:bg-accent hover:text-accent-ink"
            href="/sessions/"
          >
            Sign in
          </a>
        </nav>
      </header>

      <main id="main">
        {/* Hero. Une seule action primaire dans le premier écran. */}
        <section className="mx-auto max-w-stage px-6 pb-24 pt-10 md:px-10 md:pb-32 md:pt-20">
          <p className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            {SITE.legalMention}
          </p>

          <h1 className="max-w-[18ch] font-display text-display-xl">
            Ship something real, every week.
          </h1>

          <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-12">
            <p className="max-w-measure text-project md:col-span-6 md:col-start-1">
              One hour a week, you build and deploy an actual app using AI agents, then put it
              online where people can open it. No prior code required, and no promise that you
              will become a developer. The promise is narrower and more useful: you will ship.
            </p>

            <dl className="grid grid-cols-3 gap-6 md:col-span-5 md:col-start-8 md:self-end">
              {NUMBERS.map((n) => (
                <div key={n.label}>
                  <dt className="font-display text-display-md">{n.value}</dt>
                  <dd className="mt-1 text-sm text-muted">{n.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-4">
            {SITE.whatsapp ? (
              <a
                className="tap inline-flex items-center gap-2 rounded-full bg-accent px-7 font-medium text-accent-ink transition-transform duration-200 ease-swift hover:-translate-y-0.5"
                href={SITE.whatsapp}
              >
                Ask for an invite
                <ArrowUpRight aria-hidden className="size-4" />
              </a>
            ) : (
              <span className="tap inline-flex items-center rounded-full border border-line px-7 text-muted">
                Invite link coming
              </span>
            )}
            <p className="text-sm text-muted">
              Places are handed out by hand. We add your email, then send you the link.
            </p>
          </div>
        </section>

        {/* L'heure, décomposée. */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-stage px-6 py-20 md:px-10 md:py-28">
            <h2 className="font-display text-display-lg">How the hour goes</h2>

            <ol className="mt-12 grid gap-px overflow-hidden rounded-lg bg-line md:grid-cols-3">
              <li className="bg-surface p-8">
                <span className="font-mono text-sm text-accent">00:00 — 00:30</span>
                <h3 className="mt-3 font-display text-2xl">One idea, shown breaking</h3>
                <p className="mt-3 text-base text-muted">
                  We start from the failure, then explain the fix. Never a slide of code. Everything
                  happens in a real editor, with the real errors.
                </p>
              </li>
              <li className="bg-surface p-8">
                <span className="font-mono text-sm text-accent">00:30 — 00:57</span>
                <h3 className="mt-3 font-display text-2xl">You build</h3>
                <p className="mt-3 text-base text-muted">
                  A short brief, a starter repo that already runs, and a checklist that someone else
                  can verify. Nobody codes it for you.
                </p>
              </li>
              <li className="bg-surface p-8">
                <span className="font-mono text-sm text-accent">00:57 — 01:00</span>
                <h3 className="mt-3 font-display text-2xl">Two people show</h3>
                <p className="mt-3 text-base text-muted">
                  Screens shared, working or broken. A bug explained out loud teaches the room more
                  than a blank screen.
                </p>
              </li>
            </ol>

            <p className="mt-10 max-w-measure text-base text-muted">
              Once a month the hour becomes a contest. Three constraints, one evening, and{" "}
              {SITE.prizeEur} euros for the project that survives the grid. The grid is published
              before the contest, always.
            </p>
          </div>
        </section>

        {/* Ce qu'on emporte. */}
        <section className="mx-auto max-w-stage px-6 py-20 md:px-10 md:py-28">
          <h2 className="font-display text-display-lg">What you leave with</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {OUTCOMES.map((o) => (
              <article key={o.title}>
                <h3 className="font-display text-2xl">{o.title}</h3>
                <p className="mt-3 text-base text-muted">{o.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Preuve sociale. */}
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-stage gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
            <div className="md:col-span-5">
              <h2 className="font-display text-display-md">Run by someone who ships</h2>
              <p className="mt-4 max-w-measure text-base text-muted">
                This is not a theory club. The sites below are live, paid for, and built with the
                exact stack taught here.
              </p>
            </div>
            <ul className="grid gap-px self-start overflow-hidden rounded-lg bg-line md:col-span-6 md:col-start-7">
              {PROOF.map((host) => (
                <li key={host}>
                  <a
                    className="tap flex items-center justify-between bg-surface px-6 font-mono text-sm transition-colors duration-200 hover:bg-paper"
                    href={`https://${host}`}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    {host}
                    <ArrowUpRight aria-hidden className="size-4 text-muted" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Première séance. */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-stage px-6 py-20 md:px-10 md:py-28">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Session 01 — week of 14 September
            </p>
            <h2 className="mt-4 max-w-[24ch] font-display text-display-lg">{first.title}</h2>
            <p className="mt-6 max-w-measure text-project">{first.promise}</p>
            <a
              className="tap mt-10 inline-flex items-center gap-2 font-medium text-accent hover:underline"
              href="/setup/"
            >
              Do the setup before you come
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-stage px-6 py-14 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8 border-t border-line pt-10">
          <div>
            <p className="font-display text-2xl">{SITE.name}</p>
            <p className="mt-2 max-w-measure text-sm text-muted">{SITE.legalMention}</p>
          </div>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 text-sm">
            <a className="tap flex items-center hover:text-accent" href="/legal/">
              Legal notice
            </a>
            <a className="tap flex items-center hover:text-accent" href="/privacy/">
              Privacy
            </a>
          </nav>
        </div>
      </footer>
    </>
  );
}
