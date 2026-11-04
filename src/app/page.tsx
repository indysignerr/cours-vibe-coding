import type { Metadata } from "next";
import Link from "next/link";
import { HomeHero } from "@/components/home-hero";
import { PhotoSlot } from "@/components/photo-slot";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { YearTimeline } from "@/components/year-timeline";
import { upcoming } from "@/lib/events";
import { PILLARS } from "@/lib/pillars";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description:
    "Albert School's student lab for AI and code, in Milan. Workshops, crash courses, Build Lab, vibe coding tournaments and open nights — something on at least every two weeks. Beginners welcome.",
};

export default function Home() {
  const next = upcoming();

  return (
    <>
      <SiteHeader />

      <main id="main">
        <HomeHero />

        {/* Le nom, déplié. Il explique l'association mieux qu'un paragraphe. */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-stage px-5 py-24 md:px-8 md:py-32">
            <p className="eyebrow scroll-fade">The name</p>
            <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-5 scroll-stagger">
              {[
                ["L", "Lab", "A place to work, not a club to join"],
                [
                  "I",
                  "Intelligent",
                  "The tools are the subject, not the decoration",
                ],
                [
                  "G",
                  "Generative",
                  "Models that make things, used to make things",
                ],
                ["H", "Hands-on", "Nobody here is only listening"],
                ["T", "Technology", "It has to run, or it does not count"],
              ].map(([letter, word, line]) => (
                <li key={letter}>
                  <span className="display-1 block text-accent">{letter}</span>
                  <span className="display-3 mt-3 block">{word}</span>
                  <span className="mt-2 block text-sm text-body">{line}</span>
                </li>
              ))}
            </ul>

            <p className="lede mt-16 max-w-measure scroll-in">
              A student association at {SITE.school} in {SITE.campus},
              recognised by the school.
            </p>
          </div>
        </section>

        {/* Les quatre piliers : le concept, expliqué par sa structure. */}
        <section className="on-ink border-b border-line" id="pillars">
          <div className="mx-auto max-w-stage px-5 py-24 md:px-8 md:py-36">
            <div className="max-w-[48rem] scroll-in">
              <p className="eyebrow eyebrow--accent">How it works</p>
              <h2 className="display-1 mt-6 max-w-[16ch]">
                Four pillars. Five formats.
              </h2>
              <p className="lede mt-8">
                Each pillar delivers one part of what we promise. Together they
                are the whole year.
              </p>
            </div>

            <ol className="mt-20 grid gap-px overflow-hidden rounded-card bg-line md:grid-cols-2 scroll-stagger">
              {PILLARS.map((p, i) => (
                <li key={p.key} id={p.key} className="bg-canvas p-8 md:p-10">
                  <div className="flex items-baseline gap-4">
                    <span className="counter">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="display-2">{p.title}</h3>
                  </div>
                  <p className="mt-4 text-accent">{p.verb}</p>
                  <p className="mt-3 max-w-measure text-body">{p.delivers}</p>

                  <dl className="rows mt-8">
                    {p.formats.map((f) => (
                      <div key={f.name} className="py-4 first:pt-0">
                        <dt className="display-3">{f.name}</dt>
                        <dd className="mt-1.5 text-sm text-body">{f.what}</dd>
                        <dd className="tnum mt-2 text-sm text-muted">
                          {f.who} · {f.length}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* La frise. La promesse des deux semaines, rendue visible. */}
        <section className="border-b border-line bg-sunken">
          <div className="mx-auto max-w-stage px-5 py-24 md:px-8 md:py-32">
            <div className="flex flex-wrap items-end justify-between gap-6 scroll-in">
              <div className="max-w-[34rem]">
                <p className="eyebrow">The year</p>
                <h2 className="display-2 mt-5">
                  November to May, without a gap.
                </h2>
              </div>
              <Link className="btn btn--ghost" href="/events/">
                Every date, and sign-up
              </Link>
            </div>

            <div className="mt-16">
              <YearTimeline events={next} />
            </div>

            <p className="mt-10 text-sm text-muted scroll-fade">
              Plus Build Lab every other Tuesday, from December through May.
            </p>
          </div>
        </section>

        {/* Qui tient tout ça. */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-stage gap-12 px-5 py-24 md:grid-cols-12 md:px-8 md:py-32">
            <div className="md:col-span-5 scroll-in">
              <p className="eyebrow">Who runs it</p>
              <h2 className="display-2 mt-5 max-w-[14ch]">
                {SITE.team.length} students. No staff.
              </h2>
              <p className="lede mt-7">
                We write the briefs, book the rooms and find the partners.
                Nobody is paid and everything is free.
              </p>
              <Link
                className="btn btn--quiet underline-grow mt-7 -ml-2"
                href="/about/"
              >
                Meet the board
              </Link>
            </div>

            <div className="md:col-span-6 md:col-start-7 scroll-in">
              <PhotoSlot
                ratio="4 / 3"
                label="The board at the campus, during a tournament. Taken on a phone, not bought."
              />
            </div>
          </div>
        </section>

        {/* L'appel final. */}
        <section className="on-ink">
          <div className="mx-auto max-w-stage px-5 py-28 md:px-8 md:py-40">
            <div className="max-w-[44rem] scroll-in">
              <p className="eyebrow eyebrow--accent">Coming along</p>
              <h2 className="display-1 mt-6 max-w-[13ch]">
                You do not have to join anything.
              </h2>
              <p className="lede mt-8">
                Put your name down for one event. No account, no application, no
                fee.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link className="btn btn--primary" href="/events/">
                  See what is on
                </Link>
                <Link className="btn btn--outline" href="/join/">
                  What membership means
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
