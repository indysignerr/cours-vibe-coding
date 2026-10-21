import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { OFFERS } from "@/lib/offers";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Five fixed-price engagements, each three weeks long: AI audit and compliance file, workplace-ready AI, an assistant on your documents, an internal tool, and one automated chain of steps.",
};

const TERMS = [
  ["Pricing", "Fixed price, never time and materials. A fixed price caps the risk on both sides."],
  ["Deposit", "Thirty per cent on signature, the balance on acceptance."],
  ["Licences", "You hold your own licences and your own infrastructure. We bill the implementation."],
  ["Ownership", "Code and accounts are in your name from the first day, not at the end."],
];

export default function ServicesPage() {
  return (
    <PageShell
      eyebrow="Solutions"
      title="Five engagements. Fixed price, three weeks."
      lede="Each one is scoped tightly enough to finish, and written down precisely enough that you know what you are not getting. That second part is the one most proposals leave out."
    >
      <ul className="rows">
        {OFFERS.map((o) => (
          <li key={o.slug} className="grid gap-8 py-12 first:pt-0 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-4">
              <p className="counter">{o.n}</p>
              <h2 className="display-2 mt-3">{o.title}</h2>
              <p className="tnum mt-5 text-2xl font-semibold tracking-[-0.02em] text-ink">{o.price}</p>
              <p className="mt-1 text-sm text-muted">{o.duration}</p>
              {o.market ? (
                <p className="mt-4 inline-block rounded-btn bg-accent-tint px-3 py-1 text-sm font-medium text-accent">
                  {o.market}
                </p>
              ) : null}
            </div>

            <div className="md:col-span-7 md:col-start-6">
              <p className="lede">{o.summary}</p>

              <h3 className="eyebrow mt-9">What you receive</h3>
              <ul className="mt-4 grid gap-3">
                {o.delivers.map((d) => (
                  <li key={d} className="grid grid-cols-[auto_1fr] gap-3 text-body">
                    <span aria-hidden className="mt-[0.72em] h-0.5 w-4 shrink-0 rounded-full bg-brand" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>

              <h3 className="eyebrow mt-9">Why it holds</h3>
              <p className="mt-3 text-body">{o.why}</p>

              <h3 className="eyebrow mt-9">Not included</h3>
              <p className="mt-3 text-body">{o.excludes}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Ce qu'on refuse : dit tôt, c'est un argument de sérieux */}
      <section className="mt-20 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow">What we refuse</p>
          <h2 className="display-2 mt-4">Anything that decides about a person.</h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="lede">
            CV screening, employee scoring, customer rating, credit decisions, health. The European AI
            regulation classes these as high risk from December 2027.
          </p>
          <p className="mt-5">
            There is a reason beyond the moral one. Article 25 of the regulation turns you into a{" "}
            <em>provider</em> if you change the intended purpose of a general-purpose system to make it
            high risk, or if you ship it under your own name. Configuring a model to sort job
            applications is enough. You then inherit the conformity assessment, the risk-management
            system, the technical documentation and the CE marking.
          </p>
          <p className="mt-5">
            We say this in the first meeting rather than discovering it in month three.
          </p>
        </div>
      </section>

      {/* Conditions commerciales */}
      <section className="card card--sand mt-20 p-7 md:p-10">
        <p className="eyebrow">Terms, the same for everyone</p>
        <dl className="rows mt-8">
          {TERMS.map(([term, detail]) => (
            <div key={term} className="grid gap-3 py-6 md:grid-cols-12 md:gap-8">
              <dt className="text-sm font-semibold text-ink md:col-span-3">{term}</dt>
              <dd className="text-body md:col-span-8">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-20">
        <div className="card card--ink px-7 py-12 md:px-14 md:py-16">
          <h2 className="display-2 max-w-[20ch]" style={{ color: "var(--on-ink)" }}>
            Not sure which one you need?
          </h2>
          <p className="lede mt-5 max-w-measure" style={{ color: "var(--on-ink-muted)" }}>
            Most companies start with the audit, because it is the one that tells you whether the other
            four are worth doing. Forty-five minutes is enough to find out.
          </p>
          <Link className="btn btn--accent mt-8" href="/contact/">
            Book a first conversation
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
