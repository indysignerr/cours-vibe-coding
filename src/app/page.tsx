import type { Metadata } from "next";
import Link from "next/link";
import { Bento } from "@/components/bento";
import { BrandMark } from "@/components/brand";
import { Doors } from "@/components/doors";
import { AutomationScene } from "@/components/motion/automation-scene";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { SplitLines } from "@/components/motion/split-lines";
import { OfferCards } from "@/components/offer-cards";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToolRail } from "@/components/tool-rail";
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

        {/*
          La phrase, décalée et sans conteneur centré. Le pictogramme sort
          dans la marge : c'est le premier endroit où la grille se rompt.
        */}
        <section className="relative border-b border-line px-5 py-28 md:px-8 md:py-40">
          <BrandMark
            className="pointer-events-none absolute right-[-4rem] top-10 size-[22rem] opacity-[0.05] md:right-4 md:size-[30rem]"
            outline="var(--ink)"
            glyph="var(--brand)"
          />
          <div className="relative mx-auto max-w-stage">
            <div className="md:pl-[8%]">
              <SplitLines
                text="AI your lawyer can sign off on."
                className="display-1 max-w-[13ch]"
              />
              <Reveal className="mt-12 flex flex-wrap items-center gap-3" delay={0.5} y={16}>
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
          </div>
        </section>

        {/* La démonstration, bord à bord, sur le marine le plus profond. */}
        <section aria-labelledby="demo" className="border-b border-line bg-sunken">
          <div className="px-5 pt-24 md:px-12 md:pt-32">
            <Reveal stagger y={18} className="max-w-[46rem]">
              <p className="eyebrow">What we actually do</p>
              <h2 id="demo" className="display-2 mt-5">
                One week of someone&rsquo;s time. Given back.
              </h2>
            </Reveal>
          </div>
          <div className="mt-12">
            <AutomationScene />
          </div>
        </section>

        {/*
          Les offres, décalées à droite et sur une colonne plus étroite que
          le reste. Une liste de prix n'a pas besoin de toute la largeur.
        */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-stage px-5 py-24 md:px-8 md:py-32">
            <div className="md:ml-[16%] md:max-w-[52rem]">
              <Reveal className="flex flex-wrap items-end justify-between gap-6" stagger y={18}>
                <h2 className="display-2">Five engagements.</h2>
                <Magnetic strength={0.2}>
                  <Link className="btn btn--ghost" href="/solutions/">
                    What each one includes
                  </Link>
                </Magnetic>
              </Reveal>

              <div className="mt-14">
                <OfferCards />
              </div>
            </div>
          </div>
        </section>

        {/*
          La question, pleine largeur sur ivoire et sans gouttière. C'est le
          seul écran clair du site : il doit frapper.
        */}
        <section className="on-paper border-b border-line">
          <div className="px-5 py-28 md:px-12 md:py-40">
            <Reveal stagger y={22} className="max-w-[58rem]">
              <p className="eyebrow">The question we open with</p>
              <h2 className="display-1 mt-6 max-w-[15ch]">
                Has anyone agreed to the AI already running in your company?
              </h2>
              <p className="lede mt-10 max-w-measure">
                Probably not. Almost nobody knows that is a problem.
              </p>
              <p className="mt-5 max-w-measure">
                Since 2025, Italian law has required an agreement before any tool that{" "}
                <em>could</em> monitor staff. Not one that does. One that could.
              </p>
              <p className="mt-5 max-w-measure">
                The breach is criminal. Not a fine.
              </p>
              <Link className="btn btn--outline underline-grow mt-10" href="/approach/">
                How we handle it
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Les principes, en grille. Chaque tuile montre au lieu d'écrire. */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-stage px-5 py-24 md:px-8 md:py-32">
            <Reveal stagger y={18}>
              <p className="eyebrow">How we work</p>
              <h2 className="display-2 mt-5 max-w-[18ch]">The method is the product.</h2>
            </Reveal>
            <div className="mt-14">
              <Bento />
            </div>
          </div>
        </section>

        {/* Les outils, bord à bord. Ce qui remplace la preuve sociale. */}
        <section className="border-b border-line bg-sunken">
          <div className="px-5 py-20 md:px-12 md:py-24">
            <Reveal stagger y={18} className="mb-12 max-w-[40rem]">
              <p className="eyebrow">What we build with</p>
              <h2 className="display-2 mt-5">Four tools. Fast in all four.</h2>
            </Reveal>
            <ToolRail />
          </div>
        </section>

        {/* Qui nous sommes. Trois lignes, pas trois paragraphes. */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-stage gap-10 px-5 py-24 md:grid-cols-12 md:px-8 md:py-32">
            <Reveal className="md:col-span-5" y={22}>
              <p className="eyebrow">Who you are hiring</p>
              <h2 className="display-2 mt-5 max-w-[12ch]">Students. We say so first.</h2>
            </Reveal>
            <Reveal className="md:col-span-6 md:col-start-7" stagger y={22}>
              <p className="lede">
                An association at {SITE.school} {SITE.campus}. We cost a fraction of an agency, and
                that is the only reason we do.
              </p>
              <p className="mt-5">
                We also refuse anything that decides about a person. CV screening. Employee scoring.
                Credit. Health. Under the European AI regulation those turn an integrator into a
                provider, and that is not a student&rsquo;s job.
              </p>
              <Link className="btn btn--quiet underline-grow mt-7 -ml-2" href="/about/">
                Meet the team
              </Link>
            </Reveal>
          </div>
        </section>

        {/*
          L'appel final déborde sur le pied de page : la marge négative le
          fait chevaucher la section suivante au lieu de s'empiler sagement.
        */}
        <section className="relative z-10 -mb-24">
          <div className="mx-auto max-w-stage px-5 pt-24 md:px-8 md:pt-32">
            <Reveal y={30}>
              <div className="card card--raised relative overflow-hidden bg-surface px-7 py-16 md:px-16 md:py-24">
                <BrandMark
                  className="pointer-events-none absolute -bottom-24 -right-16 size-80 opacity-[0.07] md:size-[30rem]"
                  outline="var(--ink)"
                  glyph="var(--brand)"
                />
                <div className="relative max-w-[42rem]">
                  <p className="eyebrow eyebrow--accent">First step</p>
                  <h2 className="display-1 mt-6 max-w-[14ch]">
                    Forty-five minutes. We do not talk about AI.
                  </h2>
                  <p className="lede mt-8">Bring the task that annoys you most.</p>
                  <p className="mt-4">
                    You leave with a written read on whether it is worth automating. Sometimes the
                    answer is no, and we say so.
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
