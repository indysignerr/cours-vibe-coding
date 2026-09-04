import type { Metadata } from "next";
import { ArrowRight, Award, Flame, Rocket, Sparkles, Zap } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { Mascot } from "@/components/mascot";
import { ProgressRing } from "@/components/progress-ring";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CURRICULUM, PROOF } from "@/lib/curriculum";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
};

const HOUR = [
  { time: "30 min", title: "One idea, shown breaking", tone: "card-3d--accent", icon: Sparkles,
    body: "We start from the failure, then fix it live. Never a slide of code." },
  { time: "27 min", title: "You build", tone: "card-3d--done", icon: Rocket,
    body: "A starter that already runs, a short brief, a checklist someone else can verify." },
  { time: "3 min", title: "Two people show", tone: "card-3d--streak", icon: Award,
    body: "Working or broken. A bug explained out loud teaches the room more than a blank screen." },
];

const OUTCOMES = [
  { icon: Rocket, title: "Three apps with your name on them",
    body: "Public URLs you can send to anyone, including a recruiter." },
  { icon: Zap, title: "A GitHub profile with real history",
    body: "Commits, branches, a revert that saved you. Evidence, not claims." },
  { icon: Sparkles, title: "A way of working with agents",
    body: "How to brief one, when to stop it, and how to spot confident nonsense." },
];

const TONES = ["bg-accent border-accent-line", "bg-done border-done-line", "bg-streak border-streak-line", "bg-xp border-xp-line"];

export default function Home() {
  const preview = CURRICULUM.slice(0, 5);

  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* Hero */}
        <section className="relative mx-auto max-w-stage overflow-hidden px-5 pb-16 pt-6 md:px-10 md:pb-28 md:pt-14">
          <span aria-hidden className="blob -left-24 top-10 size-72 bg-streak opacity-40" />
          <span aria-hidden className="blob -right-16 top-40 size-80 bg-xp opacity-30" />
          <span aria-hidden className="blob bottom-0 left-1/3 size-56 bg-done opacity-30" />

          <div className="relative grid items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="anim-pop inline-flex items-center gap-2 rounded-full border-2 border-line bg-surface px-4 py-1.5 text-sm font-bold">
                <Flame aria-hidden className="size-4 text-streak-strong" />
                {SITE.eyebrow}
              </p>

              <h1 className="anim-pop mt-6 max-w-[14ch] font-display text-display-xl font-extrabold [animation-delay:80ms]">
                Ship something real, every week.
              </h1>

              <p className="anim-pop mt-6 max-w-measure text-project text-muted [animation-delay:160ms]">
                One hour a week, you build and deploy an actual app with AI agents, then put it
                online where people can open it. No prior code required. The promise is narrow and
                useful: you will ship.
              </p>

              <div className="anim-pop mt-8 flex flex-wrap items-center gap-4 [animation-delay:240ms]">
                {SITE.whatsapp ? (
                  <a className="btn-3d text-lg" href={SITE.whatsapp}>
                    Ask for an invite
                    <ArrowRight aria-hidden className="size-5" />
                  </a>
                ) : (
                  <a className="btn-3d text-lg" href="/setup/">
                    Start the setup
                    <ArrowRight aria-hidden className="size-5" />
                  </a>
                )}
                <a className="btn-3d btn-3d--ghost" href="/programme/">
                  See the path
                </a>
              </div>
              <p className="mt-4 text-sm text-muted">
                Places are handed out by hand. We add your email, then send you the link.
              </p>
            </div>

            <div className="relative md:col-span-5">
              <div className="anim-float mx-auto w-fit">
                <Mascot size={260} mood="happy" className="anim-pop [animation-delay:200ms]" />
              </div>
              <div className="anim-pop absolute -left-2 top-6 rotate-[-6deg] [animation-delay:400ms] md:left-2">
                <span className="pill border-streak-line bg-streak">
                  <Flame aria-hidden className="size-5" /> 3 week streak
                </span>
              </div>
              <div className="anim-pop absolute -right-1 bottom-10 rotate-[5deg] [animation-delay:520ms] md:right-4">
                <span className="pill border-xp-line bg-xp">
                  <Zap aria-hidden className="size-5" /> +40 XP
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-12">
            <Countdown />
          </div>

          <dl className="relative mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ["1 h", "per week, one evening", "card-3d--accent"],
              [String(SITE.weeks), "weeks, September to November", "card-3d--done"],
              [`${SITE.prizeEur} €`, "prize, every month", "card-3d--streak"],
            ].map(([v, l, tone], i) => (
              <div key={l} className={`card-3d ${tone} anim-pop p-6`} style={{ animationDelay: `${300 + i * 80}ms` }}>
                <dt className="font-display text-display-md font-extrabold">{v}</dt>
                <dd className="mt-1 font-bold">{l}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Path preview */}
        <section className="bg-sunken">
          <div className="mx-auto max-w-stage px-5 py-16 md:px-10 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h2 className="font-display text-display-lg font-extrabold">Twelve steps. One path.</h2>
                <p className="mt-3 max-w-measure text-project text-muted">
                  Each step opens the day it is taught. Finish its checklist, the ring fills, the next
                  one unlocks. Three of the steps are contests.
                </p>
              </div>
              <a className="btn-3d btn-3d--ink" href="/programme/">See all twelve</a>
            </div>

            <ol className="mt-12 flex flex-wrap items-center gap-6 md:gap-4">
              {preview.map((s, i) => {
                const done = i < 2;
                const current = i === 2;
                return (
                  <li key={s.slug} className="flex items-center gap-4 md:gap-3">
                    <div className="flex flex-col items-center gap-2">
                      <ProgressRing value={done ? 1 : current ? 0.4 : 0} size={88} tone={done ? "done" : "accent"}>
                        <span
                          className={`grid size-[62px] place-items-center rounded-full border-2 font-display text-2xl font-extrabold ${
                            done ? "border-done-line bg-done" : current ? "anim-pulse border-accent-line bg-accent" : "border-line bg-surface text-muted"
                          }`}
                        >
                          {String(s.number).padStart(2, "0")}
                        </span>
                      </ProgressRing>
                      <span className="max-w-[10ch] text-center text-xs font-bold leading-tight">{s.title}</span>
                    </div>
                    {i < preview.length - 1 ? (
                      <span aria-hidden className="hidden h-1.5 w-8 rounded-full bg-line md:block" />
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* The hour */}
        <section className="mx-auto max-w-stage px-5 py-16 md:px-10 md:py-24">
          <h2 className="font-display text-display-lg font-extrabold">How the hour goes</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {HOUR.map((h) => (
              <li key={h.title} className={`card-3d ${h.tone} p-7`}>
                <div className="flex items-center justify-between">
                  <h.icon aria-hidden className="size-7" />
                  <span className="rounded-full bg-surface/70 px-3 py-1 font-mono text-sm font-bold">{h.time}</span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-extrabold">{h.title}</h3>
                <p className="mt-2 font-medium">{h.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-measure text-base text-muted">
            Once a month the hour becomes a contest. Three constraints, one evening, and {SITE.prizeEur} euros
            for the project that survives the grid. The grid is published before the contest, always.
          </p>
        </section>

        {/* Outcomes */}
        <section className="bg-sunken">
          <div className="mx-auto max-w-stage px-5 py-16 md:px-10 md:py-24">
            <h2 className="font-display text-display-lg font-extrabold">What you leave with</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {OUTCOMES.map((o, i) => (
                <article key={o.title} className="card-3d p-7">
                  <span className={`inline-grid size-12 place-items-center rounded-2xl border-2 ${TONES[i]}`}>
                    <o.icon aria-hidden className="size-6" />
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-extrabold">{o.title}</h3>
                  <p className="mt-2 text-muted">{o.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Proof + first session */}
        <section className="mx-auto grid max-w-stage gap-8 px-5 py-16 md:grid-cols-12 md:px-10 md:py-24">
          <div className="card-3d p-7 md:col-span-5">
            <h2 className="font-display text-display-md font-extrabold">Run by someone who ships</h2>
            <p className="mt-3 text-muted">
              Not a theory club. These sites are live, paid for, and built with the exact stack taught here.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {PROOF.map((host) => (
                <li key={host}>
                  <a className="pill text-sm hover:border-accent-line" href={`https://${host}`} rel="noreferrer noopener" target="_blank">
                    {host}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-3d card-3d--accent relative overflow-hidden p-7 md:col-span-7">
            <Mascot size={150} mood="party" className="anim-wiggle absolute -bottom-4 right-2 hidden md:block" />
            <p className="inline-block rounded-full bg-surface/70 px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.15em]">
              Step 01 · week of 14 September
            </p>
            <h2 className="mt-4 max-w-[16ch] font-display text-display-lg font-extrabold">{CURRICULUM[0].title}</h2>
            <p className="mt-4 max-w-[36ch] font-medium">{CURRICULUM[0].promise}</p>
            <a className="btn-3d btn-3d--ink mt-8" href="/setup/">
              Do the setup first
              <ArrowRight aria-hidden className="size-5" />
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
