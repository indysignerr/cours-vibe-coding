import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Team",
  description: `The students behind ${SITE.name}, a student-run association at ${SITE.school} ${SITE.campus}, and how the association is organised.`,
};

/** Initiales pour l'avatar typographique : pas de photo tant qu'elles ne sont pas toutes bonnes. */
function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const FACTS = [
  ["Campus", `${SITE.school} ${SITE.campus}`],
  ["Founded", "September 2026"],
  ["Members", `${SITE.team.length} active, selected on work rather than on interview`],
  ["Working language", "English, with Italian for client meetings"],
];

export default function TeamPage() {
  return (
    <PageShell
      eyebrow="The association"
      title="Students, and we say so first."
      lede={`We are an association run by students of ${SITE.school} in ${SITE.campus}. That is why our prices are a fraction of an agency's, and it is why we are strict about what we take on.`}
    >
      <section>
        <p className="eyebrow">Who you would be working with</p>
        <ul className="mt-8 grid gap-px overflow-hidden rounded-card bg-line sm:grid-cols-2 lg:grid-cols-3">
          {SITE.team.map((m) => (
            <li key={m.name} className="bg-surface p-7">
              <span
                aria-hidden
                className="flex h-11 w-11 items-center justify-center rounded-btn bg-ink-surface font-mono text-sm text-on-ink"
              >
                {initials(m.name)}
              </span>
              <h2 className="display-3 mt-5">{m.name}</h2>
              <p className="mt-1 text-sm text-muted">{m.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow">How the association runs</p>
          <h2 className="display-2 mt-4">No lectures. One hour a week, and a path you walk alone.</h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="lede">
            There is no class. The material sits on this site and each member works through it at their
            own pace. Once a week we sit together for an hour: you bring what is blocking you, someone
            who already cleared it shows you how, and that is the whole format.
          </p>
          <p className="mt-5">
            It works because the test for every module is the same: could you do this with nobody in the
            room? If the answer is no, the module is not finished, and we rewrite it rather than explain
            it live.
          </p>
          <p className="mt-5">
            From January, the members who have shipped something real take the client engagements. That
            selection is on work delivered, not on an interview.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="btn btn--ghost" href="/join/">
              Join the association
            </Link>
            <Link className="btn btn--quiet" href="/programme/">
              See the path
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-20">
        <p className="eyebrow">The association in four lines</p>
        <dl className="rows mt-8">
          {FACTS.map(([term, detail]) => (
            <div key={term} className="grid gap-2 py-6 md:grid-cols-12 md:gap-8">
              <dt className="font-mono text-sm text-ink md:col-span-3">{term}</dt>
              <dd className="text-body md:col-span-8">{detail}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 max-w-measure text-sm text-muted">{SITE.legalMention}</p>
      </section>
    </PageShell>
  );
}
