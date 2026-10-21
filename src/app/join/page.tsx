import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Join us",
  description: `For students at ${SITE.school} ${SITE.campus}: how the association works, what you need before the first week, and how members end up on real client engagements.`,
};

const EXPECT = [
  {
    n: "01",
    title: "A path you walk at your own pace",
    body: `${SITE.weeks} modules on this site, each unlocked when the one before it is done. There is no lecture and no attendance. The test for every module is the same: could you do this with nobody in the room?`,
  },
  {
    n: "02",
    title: "One hour a week, together",
    body: "You bring what is blocking you. Someone who already cleared it shows you how. No presentation, no slides, no one at the front of the room.",
  },
  {
    n: "03",
    title: "A contest you can actually win",
    body: `Build something real, submit it in the app, and it gets graded against a published grid. The prize is €${SITE.prizeEur}, which matters less than having one finished thing with your name on it.`,
  },
  {
    n: "04",
    title: "From January, paid client work",
    body: "Members who have shipped something real take on the client engagements. Selection is on work delivered, not on an interview or on how long you have been a member.",
  },
];

const BRING = [
  ["A laptop", "Any machine that runs a browser and a terminal. macOS, Windows or Linux."],
  ["A paid AI subscription", "You already need one at school. Everyone works on their own account; we never share keys."],
  ["A GitHub account", "Free. We set it up with you in the first module if you do not have one."],
  ["No code experience", "None is assumed. Most members come from business and data tracks, which is the point."],
];

export default function JoinPage() {
  return (
    <PageShell
      eyebrow={`For students at ${SITE.school} ${SITE.campus}`}
      title="Learn to build the thing, not to talk about it."
      lede="No lectures, no attendance sheet, no one at the front of the room. A path you walk at your own pace, one hour a week where the room helps you past what is blocking you, and from January, real client work for the members who have shipped something."
    >
      <ol className="rows">
        {EXPECT.map((e) => (
          <li key={e.n} className="grid gap-4 py-9 first:pt-0 md:grid-cols-12 md:gap-8">
            <span className="font-mono text-sm text-muted md:col-span-1">{e.n}</span>
            <h2 className="display-3 md:col-span-4">{e.title}</h2>
            <p className="text-body md:col-span-6 md:col-start-6">{e.body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-20">
        <p className="eyebrow">What to bring</p>
        <dl className="rows mt-8">
          {BRING.map(([term, detail]) => (
            <div key={term} className="grid gap-2 py-6 md:grid-cols-12 md:gap-8">
              <dt className="font-mono text-sm text-ink md:col-span-3">{term}</dt>
              <dd className="text-body md:col-span-8">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-20 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow">Being honest about it</p>
          <h2 className="display-2 mt-4">This is work, not a club.</h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="lede">
            A module takes two to three hours, and nobody will chase you to finish it. Members who treat
            it as a weekly obligation drift away by November, and members who treat it as a way to have
            something finished with their name on it do not.
          </p>
          <p className="mt-5">
            The client work from January is the same bargain. It is paid, it is real, and it is held to
            a client deadline rather than a school one.
          </p>
        </div>
      </section>

      <section className="mt-20">
        <div className="card card--ink px-7 py-12 md:px-14 md:py-16">
          <p className="eyebrow" style={{ color: "var(--on-ink-muted)" }}>
            Getting started
          </p>
          <h2 className="display-2 mt-4 max-w-[22ch]" style={{ color: "var(--on-ink)" }}>
            Create an account, then do the setup module.
          </h2>
          <p className="lede mt-5 max-w-measure" style={{ color: "var(--on-ink-muted)" }}>
            Accounts are created with an invite code from a member. The setup module takes about forty
            minutes and leaves you with a working environment, which is further than most people get on
            their own.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link className="btn btn--accent" href="/setup/">
              Start the setup module
            </Link>
            <Link className="btn btn--ghost" href="/programme/">
              See the whole path
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
