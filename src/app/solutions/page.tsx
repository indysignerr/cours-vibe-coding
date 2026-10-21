import type { Metadata } from "next";
import Link from "next/link";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { PageShell } from "@/components/page-shell";
import { OfferCards } from "@/components/offer-cards";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Five fixed-price engagements, each three weeks long: AI audit and compliance file, workplace-ready AI, an assistant on your documents, an internal tool, and one automated chain of steps.",
  openGraph: { images: [{ url: "/og/solutions.png", width: 1200, height: 630, alt: "Five engagements, fixed price" }] },
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
      lede="Each one is scoped to finish. Each one says what it does not include — the part most proposals leave out."
    >
      <OfferCards />

      {/* Ce qu'on refuse : dit tôt, c'est un argument de sérieux */}
      <section className="mt-20 grid gap-10 md:grid-cols-12">
        <Reveal className="md:col-span-5" y={24}>
          <p className="eyebrow">What we refuse</p>
          <h2 className="display-2 mt-4">Anything that decides about a person.</h2>
        </Reveal>
        <Reveal className="md:col-span-6 md:col-start-7" stagger y={24}>
          <p className="lede">
            CV screening, employee scoring, credit, health. Article 25 of the European AI regulation
            turns an integrator into a <em>provider</em> the moment they configure a model for one of
            them — conformity assessment, CE marking, the lot.
          </p>
          <p className="mt-5">We say so in the first meeting, not in month three.</p>
        </Reveal>
      </section>

      {/* Conditions commerciales */}
      <section className="card card--sand mt-20 p-7 md:p-10">
        <p className="eyebrow">Terms, the same for everyone</p>
        <Reveal as="dl" className="rows mt-8" stagger y={18}>
          {TERMS.map(([term, detail]) => (
            <div key={term} className="grid gap-3 py-6 md:grid-cols-12 md:gap-8">
              <dt className="text-sm font-semibold text-ink md:col-span-3">{term}</dt>
              <dd className="text-body md:col-span-8">{detail}</dd>
            </div>
          ))}
        </Reveal>
      </section>

      <Reveal as="section" className="mt-20" y={30}>
        <div className="card card--ink px-7 py-12 md:px-14 md:py-16">
          <h2 className="display-2 max-w-[20ch]">
            Not sure which one you need?
          </h2>
          <p className="lede mt-5 max-w-measure">
            Most start with the audit. It is the one that tells you whether the other four are worth
            doing.
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
