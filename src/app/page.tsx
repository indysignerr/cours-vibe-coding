import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { Bento } from "@/components/bento";
import { Doors } from "@/components/doors";
import { OfferCards } from "@/components/offer-cards";
import { ToolRail } from "@/components/tool-rail";
import { AutomationScene } from "@/components/motion/automation-scene";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { SplitLines } from "@/components/motion/split-lines";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description:
    "We automate the repetitive work inside your company and hand you the file that lets you deploy it. Fixed price, three weeks. A student-run association at Albert School Milano.",
};


export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* Qui est là ? La question avant le discours. */}
        <Doors />

        {/* La phrase, seule sur son écran. */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-stage px-5 py-24 md:px-8 md:py-36">
            <SplitLines
              text="AI your lawyer can sign off on."
              className="display-1 max-w-[14ch]"
            />
            <Reveal className="mt-10 flex flex-wrap items-center gap-3" delay={0.5} y={16}>
              <Magnetic>
                <Link className="btn btn--primary" href="/contact/">
                  Book a first conversation
                </Link>
              </Magnetic>
              <Magnetic strength={0.2}>
                <Link className="btn btn--ghost" href="/approach/">
                  How it works
                </Link>
              </Magnetic>
            </Reveal>
          </div>
        </section>

        {/* La démonstration. Elle remplace trois paragraphes. */}
        <section aria-labelledby="demo" className="border-b border-line">
          <div className="mx-auto max-w-stage px-5 pt-20 md:px-8 md:pt-28">
            <Reveal stagger y={18}>
              <p className="eyebrow">What we actually do</p>
              <h2 id="demo" className="display-2 mt-4 max-w-[18ch]">
                One week of someone&rsquo;s time, given back.
              </h2>
            </Reveal>
          </div>
          <div className="mt-16">
            <AutomationScene />
          </div>
        </section>

        {/* Les offres : cinq lignes, le détail au clic. */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-stage px-5 py-20 md:px-8 md:py-28">
            <Reveal className="flex flex-wrap items-end justify-between gap-6" stagger y={18}>
              <h2 className="display-2 max-w-[14ch]">Five engagements.</h2>
              <Magnetic strength={0.2}>
                <Link className="btn btn--ghost" href="/solutions/">
                  Scope, terms, exclusions
                </Link>
              </Magnetic>
            </Reveal>

            <div className="mt-14">
              <OfferCards />
            </div>
          </div>
        </section>

        {/* La question qui ouvre un rendez-vous. Sur ivoire : elle frappe. */}
        <section className="on-paper border-b border-line">
          <div className="mx-auto max-w-stage px-5 py-24 md:px-8 md:py-32">
            <Reveal stagger y={22}>
              <span aria-hidden className="rule--brand block" />
              <p className="eyebrow mt-6">The question we open with</p>
              <h2 className="display-1 mt-5 max-w-[16ch]">
                Has anyone agreed to the AI already running in your company?
              </h2>
              <p className="lede mt-8 max-w-measure">
                Since 2025, Italian law has required an agreement before any tool that{" "}
                <em>could</em> monitor staff. The breach is criminal. Most directors have never been
                told.
              </p>
              <Link className="btn btn--outline underline-grow mt-9" href="/approach/">
                How we handle it
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Les principes, en grille. Chaque tuile montre au lieu d'écrire. */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-stage px-5 py-20 md:px-8 md:py-28">
            <Reveal stagger y={18}>
              <p className="eyebrow">How we work</p>
              <h2 className="display-2 mt-4 max-w-[20ch]">
                The method is the product.
              </h2>
            </Reveal>
            <div className="mt-14">
              <Bento />
            </div>
          </div>
        </section>

        {/* Les outils, nommés. Ce qui remplace la preuve sociale qu'on n'a pas. */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-stage px-5 py-20 md:px-8 md:py-24">
            <Reveal stagger y={18}>
              <p className="eyebrow">What we build with</p>
              <h2 className="display-2 mt-4 max-w-[20ch]">Four tools, and we are fast in all four.</h2>
            </Reveal>
            <div className="mt-12">
              <ToolRail />
            </div>
          </div>
        </section>

        {/* Qui nous sommes. Trois lignes, pas trois paragraphes. */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-stage gap-10 px-5 py-20 md:grid-cols-12 md:px-8 md:py-28">
            <Reveal className="md:col-span-5" y={22}>
              <p className="eyebrow">Who you are hiring</p>
              <h2 className="display-2 mt-4 max-w-[14ch]">Students, and we say so first.</h2>
            </Reveal>
            <Reveal className="md:col-span-6 md:col-start-7" stagger y={22}>
              <p className="lede">
                An association at {SITE.school} {SITE.campus}. That is why we cost a fraction of an
                agency, and why we refuse anything that decides about a person.
              </p>
              <Link className="btn btn--quiet underline-grow mt-6 -ml-2" href="/about/">
                Meet the team
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Appel final */}
        <section>
          <div className="mx-auto max-w-stage px-5 py-24 md:px-8 md:py-32">
            <Reveal y={30}>
              <div className="card card--ink relative overflow-hidden px-7 py-16 md:px-16 md:py-24">
                <BrandMark
                  className="pointer-events-none absolute -bottom-20 -right-16 size-80 opacity-[0.1] md:size-[28rem]"
                  outline="var(--ink)"
                  glyph="var(--brand)"
                />
                <div className="relative">
                  <p className="eyebrow eyebrow--accent">First step</p>
                  <h2 className="display-1 mt-5 max-w-[15ch]">
                    Forty-five minutes, and we do not talk about AI.
                  </h2>
                  <p className="lede mt-7 max-w-measure">
                    You bring the task that annoys you most. You leave with a written read on whether
                    it is worth automating — including, sometimes, that it is not.
                  </p>
                  <Magnetic>
                    <Link className="btn btn--primary mt-10" href="/contact/">
                      Book the conversation
                    </Link>
                  </Magnetic>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
