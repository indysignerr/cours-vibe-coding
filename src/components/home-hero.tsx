"use client";

import Link from "next/link";
import { Magnetic } from "@/components/motion/magnetic";
import { EVENT_KINDS, readableSpan, upcoming } from "@/lib/events";
import { SITE } from "@/lib/site";

/**
 * Le haut de page : l'affiche du prochain évènement.
 *
 * L'accueil a un seul travail — remplir le prochain évènement — donc
 * c'est son affiche qu'on lit en premier : format, titre, date, lieu,
 * places, bouton.
 *
 * Pas d'objet décoratif à côté : sur les Sites of the Day que j'ai
 * inspectés, les prix d'interaction vont au contenu lui-même — le
 * programme, la line-up, le survol — jamais à un jouet posé à côté.
 */
export function HomeHero() {
  const next = upcoming()[0];

  return (
    <section
      className="on-ink relative overflow-hidden border-b border-line"
      aria-label="Next event"
    >
      <div className="mx-auto max-w-stage px-5 pb-24 pt-16 md:px-8 md:pb-32 md:pt-24">
        {/* L'affiche */}
        <div className="max-w-[52rem]">
          <p className="eyebrow eyebrow--accent rise">{SITE.eyebrow}</p>

          {next ? (
            <>
              <p className="eyebrow rise mt-8 [animation-delay:60ms]">
                Next · {EVENT_KINDS[next.kind].label}
              </p>
              <h1 className="display-1 rise mt-4 max-w-[14ch] [animation-delay:120ms]">
                {next.title}
              </h1>

              <dl className="rise mt-9 flex flex-wrap gap-x-10 gap-y-4 [animation-delay:180ms]">
                {(
                  [
                    ["When", readableSpan(next)],
                    ["Time", `${next.start}–${next.end}`],
                    ["Where", next.location],
                    ["Seats", next.capacity ? `${next.capacity} max` : "No cap"],
                  ] as [string, string][]
                ).map(([term, detail]) => (
                  <div key={term}>
                    <dt className="eyebrow">{term}</dt>
                    <dd className="tnum mt-1.5 text-body">{detail}</dd>
                  </div>
                ))}
              </dl>

              <p className="lede rise mt-9 max-w-measure [animation-delay:220ms]">
                {next.summary}
              </p>

              <div className="rise mt-10 flex flex-wrap items-center gap-3 [animation-delay:280ms]">
                <Magnetic>
                  <Link className="btn btn--primary" href="/events/">
                    Put my name down
                  </Link>
                </Magnetic>
                <Link className="btn btn--ghost" href="/about/">
                  Who we are
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="display-1 rise mt-8 max-w-[14ch] [animation-delay:120ms]">
                {SITE.tagline}
              </h1>
              <p className="lede rise mt-8 max-w-measure [animation-delay:180ms]">
                The next run of events is being put together. Write to us and we will tell you when
                the dates are out.
              </p>
              <div className="rise mt-10 [animation-delay:240ms]">
                <Magnetic>
                  <Link className="btn btn--primary" href="/contact/">
                    Tell me when
                  </Link>
                </Magnetic>
              </div>
            </>
          )}
        </div>
      </div>

    </section>
  );
}
