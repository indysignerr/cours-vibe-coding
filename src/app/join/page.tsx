import type { Metadata } from "next";
import Link from "next/link";
import { AddToCalendar } from "@/components/add-to-calendar";
import { PageShell } from "@/components/page-shell";
import { EVENT_KINDS, upcoming } from "@/lib/events";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Join us",
  description: `For students at ${SITE.school} ${SITE.campus}: how the association works, what we run, and how members end up on paid client work.`,
};

const EXPECT = [
  {
    n: "01",
    title: "Come to one thing",
    body: "A workshop, a talk, or a hackathon. You sign up on the events page, you turn up, and that is the whole entry process. No application, no interview, no account.",
  },
  {
    n: "02",
    title: "Build something you can show",
    body: "Everything we run ends with a thing that works and a URL with your name on it. That is the point of the format: nobody leaves with notes.",
  },
  {
    n: "03",
    title: "Help run the next one",
    body: "Members write the briefs, set up the room, and answer questions during a hackathon. This is where you actually learn, and it is how we know who to trust.",
  },
  {
    n: "04",
    title: "Take on paid client work",
    body: "Members who have shipped something real take the client engagements. Selection is on work delivered, never on how long you have been around.",
  },
];

const BRING: [string, string][] = [
  ["A laptop", "Any machine that runs a browser and a terminal. macOS, Windows or Linux."],
  ["An AI subscription", "You already need one at school. Everyone works on their own account; we never share keys."],
  ["No code experience", "None is assumed. Most members come from business and data tracks, which is the point."],
  ["A few hours, not a term", "There is no weekly commitment. You come to what is useful to you."],
];

export default function JoinPage() {
  const next = upcoming();

  return (
    <PageShell
      eyebrow={`For students at ${SITE.school} ${SITE.campus}`}
      title="Learn to build the thing, not to talk about it."
      lede="No syllabus, no attendance sheet, nothing weekly. We run hackathons, workshops and talks, and the members who ship something take on the paid client work."
    >
      <ol className="rows">
        {EXPECT.map((e) => (
          <li key={e.n} className="grid gap-4 py-9 first:pt-0 md:grid-cols-12 md:gap-8">
            <span className="counter md:col-span-1">{e.n}</span>
            <h2 className="display-3 md:col-span-4">{e.title}</h2>
            <p className="text-body md:col-span-6 md:col-start-6">{e.body}</p>
          </li>
        ))}
      </ol>

      {/* Le prochain rendez-vous, puisque c'est la seule porte d'entrée */}
      {next.length > 0 ? (
        <section className="card card--ink mt-20 px-7 py-12 md:px-14 md:py-16">
          <p className="eyebrow eyebrow--on-ink">The door is the next event</p>
          <h2 className="display-2 mt-4 max-w-[22ch]" style={{ color: "var(--on-ink)" }}>
            {EVENT_KINDS[next[0].kind].label}: {next[0].title}.
          </h2>
          <p className="lede mt-5 max-w-measure" style={{ color: "var(--on-ink-muted)" }}>
            {next[0].summary}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link className="btn btn--brand" href="/events/">
              Sign up for it
            </Link>
            <AddToCalendar event={next[0]} variant="outline" label="Add the date" />
          </div>
        </section>
      ) : null}

      <section className="card card--sand mt-20 p-7 md:p-10">
        <p className="eyebrow">What to bring</p>
        <dl className="rows mt-8">
          {BRING.map(([term, detail]) => (
            <div key={term} className="grid gap-2 py-6 md:grid-cols-12 md:gap-8">
              <dt className="text-sm font-semibold text-ink md:col-span-3">{term}</dt>
              <dd className="text-body md:col-span-8">{detail}</dd>
            </div>
          ))}
        </dl>
        <Link className="btn btn--ghost mt-8" href="/setup/">
          Get your machine ready first
        </Link>
      </section>

      <section className="mt-20 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow">Being honest about it</p>
          <h2 className="display-2 mt-4">This is work, not a club.</h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="lede">
            A hackathon is a weekend, and nobody will chase you to finish. People who treat the
            association as somewhere to have something finished with their name on it get a lot out of
            it. People who treat it as a line on a CV drift away by November.
          </p>
          <p className="mt-5">
            The client work is the same bargain. It is paid, it is real, and it is held to a client
            deadline rather than a school one.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="btn btn--primary" href="/events/">
              See what is coming up
            </Link>
            <Link className="btn btn--quiet" href="/about/">
              Who we are
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
