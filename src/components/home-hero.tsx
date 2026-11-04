"use client";

import Link from "next/link";
import { useState } from "react";
import { HangingBulb } from "@/components/hanging-bulb";
import { Magnetic } from "@/components/motion/magnetic";
import { EVENT_KINDS, readableSpan, upcoming } from "@/lib/events";
import { SITE } from "@/lib/site";

/**
 * Le haut de page : une pièce, une ampoule, une affiche.
 *
 * L'accueil a un seul travail — remplir le prochain évènement — donc
 * c'est son affiche qu'on lit en premier : format, titre, date, lieu,
 * places, bouton.
 *
 * L'ampoule est l'élément signature. On peut l'attraper et la faire
 * balancer, et sa cordelette allume la pièce : le fond bascule du marine
 * à l'ivoire. C'est la marque rendue manipulable au lieu d'être
 * expliquée, et ça se fait avec les deux peaux qui existent déjà.
 */
export function HomeHero() {
  const [lit, setLit] = useState(false);
  const next = upcoming()[0];

  return (
    <section
      /*
       * Bascule instantanée, pas de fondu.
       *
       * Les variables CSS ne se transitionnent pas : le fond aurait fondu
       * pendant que le texte, lui, sautait d'un coup. Et un interrupteur
       * est instantané — c'est le filament qui met un instant à chauffer,
       * ce que fait déjà la lueur de l'ampoule sur 500 ms.
       */
      className={`relative overflow-hidden border-b border-line ${lit ? "" : "on-ink"}`}
      aria-label="Next event"
    >
      <div className="mx-auto grid max-w-stage gap-10 px-5 pb-20 pt-6 md:grid-cols-12 md:px-8 md:pb-28">
        {/* L'ampoule, suspendue au bord haut */}
        <div className="flex justify-center md:col-span-4 md:order-2 md:justify-end">
          <HangingBulb lit={lit} onToggle={() => setLit((v) => !v)} />
        </div>

        {/* L'affiche */}
        <div className="md:col-span-7 md:order-1 md:self-center md:pb-10">
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

      {/* Ce que fait la cordelette, dit une fois. */}
      <p className="pb-6 text-center text-sm text-muted">
        <span aria-hidden>Pull the cord. Swing the bulb.</span>
      </p>
    </section>
  );
}
