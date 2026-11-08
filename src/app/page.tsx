import type { Metadata } from "next";
import Link from "next/link";
import { HomeHero } from "@/components/home-hero";
import { Magnetic } from "@/components/motion/magnetic";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Split } from "@/components/split";
import { shortDate, upcoming } from "@/lib/events";
import { PILLARS } from "@/lib/pillars";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description:
    "Albert School's student lab for AI and code, in Milan. Workshops, crash courses, Build Lab, vibe coding tournaments and open nights — something on at least every two weeks. Beginners welcome.",
};

/**
 * La page d'accueil est une bobine, plus une colonne.
 *
 * Chaque chapitre occupe l'écran entier, reste collé pendant qu'on le
 * lit, puis recule pendant que le suivant glisse par-dessus. L'année ne
 * se lit plus de haut en bas mais latéralement : on traverse le
 * calendrier.
 *
 * Rien de tout cela n'écoute le défilement. L'empilement est du
 * `position: sticky`, le recul et la course horizontale sont des
 * timelines de défilement évaluées par le moteur de rendu.
 */
export default function Home() {
  const next = upcoming();

  return (
    <>
      <SiteHeader />

      <main id="main" className="reel">
        {/* I — Le nom */}
        <HomeHero />

        {/* II — Ce qu'on fait, en quatre mots qui tiennent l'écran */}
        <section className="chapter on-ink" id="pillars">
          <div className="chapter__inner">
            <p className="eyebrow eyebrow--accent scroll-fade">How it works</p>

            <ol className="pillars mt-10 scroll-stagger">
              {PILLARS.map((p, i) => (
                <li key={p.key} id={p.key}>
                  <Link className="pillar" href="/events/">
                    <span className="counter pillar__n">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="pillar__name">{p.title}</span>
                    <span className="pillar__verb">{p.verb}</span>
                    <span className="pillar__formats">
                      {p.formats.map((f) => (
                        <span key={f.name} className="tag">
                          {f.name}
                        </span>
                      ))}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* III — L'année, qu'on traverse latéralement */}
        <div className="hreel">
          <div className="hreel__stage on-ink">
            <div className="chapter__inner pb-0 pt-0">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="eyebrow eyebrow--accent">The year</p>
                  <h2 className="display-2 mt-4 max-w-[18ch]">
                    <Split>November to May, without a gap.</Split>
                  </h2>
                </div>
                <Link className="btn btn--ghost" href="/events/">
                  Every date
                </Link>
              </div>
            </div>

            <ol className="hreel__rail mt-12">
              {next.map((e, i) => (
                <li key={e.slug} className="card-date">
                  <Link href={`/events/${e.slug}/`} className="card-date__link">
                    <span className="card-date__n">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="card-date__when tnum">
                      {shortDate(e.date)}
                    </span>
                    <span className="card-date__title">{e.title}</span>
                    <span className="card-date__meta">
                      <span className="eyebrow">{e.format}</span>
                      <span className="text-sm text-muted">{e.audience}</span>
                    </span>
                    <span aria-hidden className="card-date__go">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* IV — Qui le fait */}
        <section className="chapter">
          <div className="chapter__inner">
            <p className="eyebrow scroll-fade">Who runs it</p>
            <h2 className="display-1 mt-6 max-w-[16ch]">
              <Split>A board of seven students.</Split>
            </h2>
            <p className="lede mt-8 max-w-measure scroll-fade">
              Students who run the workshops, book the rooms and bring in the
              partners. Every event is free.
            </p>
            <Link
              className="btn btn--quiet underline-grow mt-8 -ml-2"
              href="/about/"
            >
              Meet the board
            </Link>
          </div>
        </section>

        {/* V — L'appel */}
        <section className="chapter chapter--deep on-ink">
          <div className="chapter__inner">
            <p className="eyebrow eyebrow--accent scroll-fade">Coming along</p>
            <h2 className="display-1 mt-6 max-w-[13ch]">
              <Split>You do not have to join anything.</Split>
            </h2>
            <p className="lede mt-8 max-w-measure scroll-fade">
              Put your name down for one event. No account, no application, no
              fee.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Magnetic>
                <Link className="btn btn--primary" href="/events/">
                  See what is on
                </Link>
              </Magnetic>
              <Link className="btn btn--ghost" href="/join/">
                What membership means
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
