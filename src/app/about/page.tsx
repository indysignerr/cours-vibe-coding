import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { Timeline } from "@/components/motion/timeline";
import { PageShell } from "@/components/page-shell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Who we are",
  description: `${SITE.name} is a student-run association at ${SITE.school} ${SITE.campus}. We automate repetitive work inside companies and hand them the file that lets them deploy it.`,
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

const STORY = [
  {
    when: "September 2026",
    title: "A way to learn in public",
    body: `Students at ${SITE.school} wanted to build software rather than read about it. We tried a weekly course; it did not hold. A room, a deadline, and something that has to work by the end of it does.`,
  },
  {
    when: "November 2026",
    title: "Companies kept asking the same question",
    body: "Not \u201ccan you build us a model\u201d but \u201care we allowed to use the tools our staff already use?\u201d In Italy, getting that wrong is a criminal matter, not a fine.",
  },
  {
    when: "January 2027",
    title: "The association took on client work",
    body: "Members who have shipped something real take the engagements. Selection is on work delivered, never on an interview.",
  },
];

const RUNS = [
  ["Hackathons", "A weekend, teams of three, one brief. Something that runs at the end, or it does not count."],
  ["Workshops", "Three hours on one tool, on your own machine. You leave with it working."],
  ["Talks", "One speaker, one hour, open to the whole campus."],
  ["Company evenings", "Directors see what students actually ship, and ask the awkward questions."],
];

const FACTS: [string, string][] = [
  ["Campus", `${SITE.school} ${SITE.campus}`],
  ["Founded", "September 2026"],
  ["Members", `${SITE.team.length} active`],
  ["What we run", "Hackathons, workshops, talks, company evenings"],
  ["Client work since", "January 2027"],
  ["Working languages", "English and Italian, French on request"],
  ["Legal form", "Student-run association, not a company"],
];

const VALUES = [
  {
    title: "We sort the data before we choose a tool",
    body: "Public, internal, personal, sensitive. One page, one hour. The answer decides whether a project runs on a European service, on your own machines, or not at all.",
  },
  {
    title: "Sometimes the honest answer is no AI",
    body: "On some processes a plain rule is better, and on some the data is too sensitive to touch. Saying so in the first meeting is what separates an advisor from a vendor.",
  },
  {
    title: "We implement, we never certify",
    body: "We work to the rules and we document our choices. Your compliance stays yours and your counsel’s. We are not lawyers and we will not pretend to be.",
  },
];

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="Who we are"
      title="A student association that behaves like a firm."
      lede={`${SITE.name} is run by students of ${SITE.school} in ${SITE.campus}. That is why our prices are a fraction of an agency’s, and it is why we are strict about what we take on.`}
    >
      {/* L'identité, posée sur sable avec le pictogramme en grand */}
      <Reveal as="section" className="card card--ink relative overflow-hidden px-7 py-14 md:px-14 md:py-20" y={30}>
        <BrandMark
          className="pointer-events-none absolute -right-10 -top-10 size-72 opacity-[0.07] md:size-96"
          outline="var(--on-ink)"
          glyph="var(--brand)"
        />
        <div className="relative max-w-measure">
          <p className="eyebrow eyebrow--on-ink">The name</p>
          <h2 className="display-2 mt-4" style={{ color: "var(--on-ink)" }}>
            A bulb, not a brain.
          </h2>
          <p className="lede mt-5" style={{ color: "var(--on-ink-muted)" }}>
            The work we do is rarely clever. It is someone finally writing down which tool touches
            which data, and what happens when it goes wrong. A light switched on in a room nobody had
            looked into.
          </p>
        </div>

        {SITE.acronym.length > 0 ? (
          <dl className="relative mt-12 grid gap-px overflow-hidden rounded-card sm:grid-cols-2 lg:grid-cols-5">
            {SITE.acronym.map((a) => (
              <div key={a.letter} className="bg-ink-surface p-5 shadow-[0_0_0_1px_rgba(248,244,236,0.14)]">
                <dt className="text-3xl font-semibold text-brand-soft">{a.letter}</dt>
                <dd className="mt-2 text-sm font-medium" style={{ color: "var(--on-ink)" }}>
                  {a.word}
                </dd>
                <dd className="mt-1 text-sm" style={{ color: "var(--on-ink-muted)" }}>
                  {a.line}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Reveal>

      {/* L'histoire */}
      <section className="mt-20">
        <p className="eyebrow">How we got here</p>
        <div className="mt-10">
          <Timeline beats={STORY} />
        </div>
      </section>

      {/* L'équipe */}
      <section className="mt-20">
        <p className="eyebrow">Who you would be working with</p>
        <h2 className="display-2 mt-4 max-w-[22ch]">Six people, and you meet the ones who build.</h2>
        <Reveal as="ul" className="mt-10 grid gap-px overflow-hidden rounded-card bg-line sm:grid-cols-2 lg:grid-cols-3" stagger y={24}>
          {SITE.team.map((m) => (
            <li key={m.name} className="bg-surface p-7">
              <span
                aria-hidden
                className="flex size-11 items-center justify-center rounded-btn bg-ink-surface text-sm font-semibold tracking-wide text-brand-soft"
              >
                {initials(m.name)}
              </span>
              <h3 className="display-3 mt-5">{m.name}</h3>
              <p className="mt-1 text-sm text-accent">{m.role}</p>
              <p className="mt-2 text-sm text-muted">{m.focus}</p>
            </li>
          ))}
        </Reveal>
      </section>

      {/* Ce qui ne se négocie pas */}
      <section className="mt-20">
        <p className="eyebrow">What does not get negotiated</p>
        <Reveal className="mt-8 grid gap-px overflow-hidden rounded-card bg-line md:grid-cols-3" stagger y={26}>
          {VALUES.map((v) => (
            <article key={v.title} className="bg-sunken p-7 md:p-8">
              <span aria-hidden className="rule--brand block" />
              <h3 className="display-3 mt-5">{v.title}</h3>
              <p className="mt-3 text-body">{v.body}</p>
            </article>
          ))}
        </Reveal>
      </section>

      {/* Les faits, et l'honnêteté sur ce qu'on refuse */}
      <section className="mt-20 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow">The association in six lines</p>
          <dl className="rows mt-8">
            {FACTS.map(([term, detail]) => (
              <div key={term} className="grid gap-1 py-5 sm:grid-cols-5 sm:gap-4">
                <dt className="text-sm font-semibold text-ink sm:col-span-2">{term}</dt>
                <dd className="text-body sm:col-span-3">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <p className="eyebrow">What we refuse</p>
          <h2 className="display-2 mt-4">Anything that decides about a person.</h2>
          <p className="lede mt-5">
            CV screening, employee scoring, customer rating, credit decisions, health. The European AI
            regulation classes these as high risk from December 2027, and article 25 turns an
            integrator into a <em>provider</em> the moment they configure a general-purpose model for
            one of them.
          </p>
          <p className="mt-5">
            That brings conformity assessment, a risk-management system, technical documentation and CE
            marking. It has no place in a student structure, and we would rather tell you in the first
            meeting than discover it in month three.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <Link className="btn btn--primary" href="/contact/">
                Book a first conversation
              </Link>
            </Magnetic>
            <Link className="btn btn--ghost" href="/solutions/">
              See the five solutions
            </Link>
          </div>
        </div>
      </section>

      {/* Ce qu'on organise */}
      <section className="card card--sand mt-20 p-7 md:p-10">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow">For students</p>
            <h2 className="display-2 mt-4">No syllabus. A room, a deadline, and something that works.</h2>
            <p className="mt-5 text-body">
              There is no weekly course and nothing is graded. You come to what is useful to you, and
              you leave with a thing on a public URL rather than a page of notes.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="btn btn--primary" href="/events/">
                See what is coming up
              </Link>
              <Link className="btn btn--ghost" href="/join/">
                Join the association
              </Link>
            </div>
          </div>
          <dl className="rows md:col-span-6 md:col-start-7">
            {RUNS.map(([term, detail]) => (
              <div key={term} className="py-5 first:pt-0">
                <dt className="display-3">{term}</dt>
                <dd className="mt-2 text-body">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <p className="mt-16 max-w-measure text-sm text-muted">{SITE.legalMention}</p>
    </PageShell>
  );
}
