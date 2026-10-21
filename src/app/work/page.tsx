import type { Metadata } from "next";
import Link from "next/link";
import { Counter } from "@/components/motion/counter";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { Tilt } from "@/components/motion/tilt";
import { PageShell } from "@/components/page-shell";
import { WorkIndex } from "@/components/work-index";
import { SITE } from "@/lib/site";
import { WORK } from "@/lib/work";

export const metadata: Metadata = {
  title: "Work",
  description: `Sites built and shipped by members of ${SITE.name}. Every one is live on a public URL you can open right now.`,
};

const HOW: [string, string][] = [
  ["Scoped to finish", "One process, one audience, one promise. A scope that cannot be demonstrated in ten minutes is a scope we have not understood yet."],
  ["Built in the open", "The client sees the thing working from week one, not a slide of what it will look like."],
  ["Handed over clean", "Code, accounts and licences in their name from the first day. Ending an engagement takes an afternoon, not a negotiation."],
];

export default function WorkPage() {
  return (
    <PageShell
      eyebrow="Work"
      title="Live URLs, not a portfolio of mock-ups."
      lede="Every site below is online and open to anyone. Click one. That is the only credential a student association can honestly offer, so it is the one we lead with."
    >
      <Reveal>
        <WorkIndex />
      </Reveal>

      <Reveal className="mt-20 grid gap-8 border-t border-line pt-10 sm:grid-cols-3" stagger y={18}>
        <div>
          <p className="display-2">
            <Counter to={WORK.length} />
          </p>
          <p className="mt-2 text-sm text-body">Sites online right now, built by our members.</p>
        </div>
        <div>
          <p className="display-2">
            <Counter to={3} suffix=" weeks" />
          </p>
          <p className="mt-2 text-sm text-body">The longest any of them took from brief to live.</p>
        </div>
        <div>
          <p className="display-2">
            <Counter to={0} />
          </p>
          <p className="mt-2 text-sm text-body">
            Of them are hosted by us. Every client owns their own infrastructure.
          </p>
        </div>
      </Reveal>

      <section className="mt-20">
        <Reveal stagger y={20}>
          <p className="eyebrow">How they got built</p>
          <h2 className="display-2 mt-4 max-w-[22ch]">Three rules, and they are not negotiable.</h2>
        </Reveal>
        <Reveal className="mt-10 grid gap-5 md:grid-cols-3" stagger y={26}>
          {HOW.map(([title, body]) => (
            <Tilt key={title} className="h-full">
              <article className="card card--sand lift-on-hover h-full p-7">
                <span aria-hidden className="rule--brand block" />
                <h3 className="display-3 mt-5">{title}</h3>
                <p className="mt-3 text-body">{body}</p>
              </article>
            </Tilt>
          ))}
        </Reveal>
      </section>

      <Reveal className="mt-20" y={30}>
        <div className="card card--ink px-7 py-12 md:px-14 md:py-16">
          <p className="eyebrow eyebrow--on-ink">Yours next</p>
          <h2 className="display-2 mt-4 max-w-[20ch]" style={{ color: "var(--on-ink)" }}>
            We would rather show you than tell you.
          </h2>
          <p className="lede mt-5 max-w-measure" style={{ color: "var(--on-ink-muted)" }}>
            Bring the process that annoys you most. In forty-five minutes you get a written read on
            whether it is worth automating — including, sometimes, that it is not.
          </p>
          <Magnetic>
            <Link className="btn btn--brand mt-8" href="/contact/">
              Book a first conversation
            </Link>
          </Magnetic>
        </div>
      </Reveal>
    </PageShell>
  );
}
