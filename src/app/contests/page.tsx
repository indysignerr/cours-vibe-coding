import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { CURRICULUM } from "@/lib/curriculum";
import { BLOCKS, GATE, SCALE } from "@/lib/rubric";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contests",
  description: `Three contests, ${SITE.prizeEur} euros each, and the grid published before you build.`,
};

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" });
const contests = CURRICULUM.filter((e) => e.kind === "contest");

export default function ContestsPage() {
  return (
    <PageShell
      eyebrow={`${SITE.contests} contests · ${SITE.prizeEur} € each`}
      title="The grid is published before the contest, always."
      lede="Once a month the hour becomes a contest. Three constraints, one evening to build, and a grid you can score yourself against before you submit. Nothing is judged on taste alone."
    >
      <section aria-labelledby="dates">
        <h2 id="dates" className="font-display text-display-md">
          When
        </h2>
        <ol className="mt-8 grid gap-px overflow-hidden rounded-lg bg-line md:grid-cols-3">
          {contests.map((c) => (
            <li key={c.slug} className="bg-surface p-6 md:p-8">
              <span className="font-mono text-sm text-accent-strong">
                Week of {DATE.format(new Date(c.weekOf))}
              </span>
              <h3 className="mt-3 font-display text-2xl">{c.title}</h3>
              <p className="mt-3 text-base text-muted">{c.promise}</p>
            </li>
          ))}
        </ol>
        <a
          className="tap mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 font-medium text-accent-ink transition-transform duration-200 ease-swift hover:-translate-y-0.5"
          href="/submit/"
        >
          Submit a project
        </a>
        <p className="mt-8 max-w-measure text-base text-muted">
          Constraints are announced at the start of the hour, in writing, in the club group. You
          build in the room, you finish at home, and you submit before midnight the same day. The
          briefs appear on this site the moment a contest opens.
        </p>
      </section>

      <section aria-labelledby="gate" className="mt-20">
        <h2 id="gate" className="font-display text-display-md">
          The gate
        </h2>
        <div className="mt-8 rounded-lg bg-ink p-6 text-paper md:p-8">
          <p className="font-mono text-sm uppercase tracking-wider text-paper/70">
            Pass or fail · no points
          </p>
          <h3 className="mt-3 font-display text-display-md">{GATE.label}</h3>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {GATE.lines.map((l) => (
              <li key={l.label}>
                <p className="font-medium">{l.label}</p>
                <p className="mt-1 text-base text-paper/70">{l.hint}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-measure text-base text-paper/80">
            A project that does not open is not judged. This is the most important rule of the whole
            programme: shipping is the subject.
          </p>
        </div>
      </section>

      <section aria-labelledby="grid" className="mt-20">
        <h2 id="grid" className="font-display text-display-md">
          The hundred points
        </h2>

        <dl className="mt-8 grid gap-6 sm:grid-cols-3">
          {SCALE.map((s) => (
            <div key={s.value} className="rounded-lg border border-line bg-surface p-5">
              <dt className="font-display text-display-md">{s.value}</dt>
              <dd className="mt-1 text-base text-muted">{s.label}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 max-w-measure text-base text-muted">
          Every line is scored 0, 1 or 2. Nothing else. Three values kill the half point argument and
          cut deliberation time in half.
        </p>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg bg-line">
          {BLOCKS.map((block) => (
            <section key={block.label} className="bg-surface p-6 md:p-8">
              <div className="flex items-baseline justify-between gap-6">
                <h3 className="font-display text-2xl">{block.label}</h3>
                <span className="whitespace-nowrap font-mono text-sm text-accent-strong">
                  {block.weight} pts
                </span>
              </div>
              <ul className="mt-5 grid gap-4 md:grid-cols-3">
                {block.lines.map((l) => (
                  <li key={l.label}>
                    <p className="font-medium">{l.label}</p>
                    <p className="mt-1 text-base text-muted">{l.hint}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section aria-labelledby="rules" className="mt-20">
        <h2 id="rules" className="font-display text-display-md">
          Rules worth stating
        </h2>
        <div className="prose mt-8">
          <p>
            Using an agent is the subject of this club, never cheating. The only fraud possible is
            submitting someone else work.
          </p>
          <p>
            Your repo has to be public, with its commit history. A single giant commit is not
            forbidden, it just raises the Ownership question. Your first commit has to come after the
            announcement.
          </p>
          <p>
            You get thirty seconds to explain your project to the jury. If you cannot say anything
            about it, you lose the ten Ownership points, and that is enough.
          </p>
          <p>
            The winner is published with the three constraints they held best, and every project
            submitted gets one sentence. Nobody who entered goes unmentioned.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
