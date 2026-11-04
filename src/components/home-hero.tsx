import Link from "next/link";
import { AddToCalendar } from "@/components/add-to-calendar";
import { readableDate, shortDate, upcoming } from "@/lib/events";
import { SITE } from "@/lib/site";

/**
 * Le haut de page.
 *
 * Deux choses, dans cet ordre : ce qu'est l'association, et la prochaine
 * date. Le plan annuel promet « quelque chose au moins toutes les deux
 * semaines » — donc le haut de page montre le compte d'évènements à
 * venir, parce que c'est cette promesse qui convainc.
 *
 * Composant serveur : pas une ligne de JavaScript n'est envoyée pour
 * l'afficher.
 */
export function HomeHero() {
  const next = upcoming();
  const first = next[0];

  return (
    <section className="on-ink relative overflow-hidden border-b border-line">
      <div className="mx-auto max-w-stage px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
        <p className="eyebrow eyebrow--accent rise">{SITE.eyebrow}</p>

        <h1 className="display-1 rise mt-7 max-w-[15ch] [animation-delay:60ms]">
          Albert School&rsquo;s student lab for AI and code.
        </h1>

        <p className="lede rise mt-8 max-w-measure [animation-delay:120ms]">
          Something on at least every two weeks. Beginners welcome.
        </p>

        {/* La promesse, chiffrée. */}
        <dl className="rise mt-12 flex flex-wrap gap-x-12 gap-y-6 [animation-delay:180ms]">
          {(
            [
              ["Events booked", `${next.length}`],
              ["Through", "May 2027"],
              ["Price", "Free"],
            ] as [string, string][]
          ).map(([term, detail]) => (
            <div key={term}>
              <dt className="eyebrow">{term}</dt>
              <dd className="tnum mt-2 text-3xl font-semibold tracking-[-0.03em] text-ink">
                {detail}
              </dd>
            </div>
          ))}
        </dl>

        {/* La prochaine date, en carte. */}
        {first ? (
          <div className="rise mt-14 max-w-[46rem] [animation-delay:240ms]">
            <div className="card card--raised bg-surface p-7 md:p-9">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <p className="eyebrow eyebrow--accent">Next · {first.format}</p>
                <p className="tnum text-sm text-muted">{shortDate(first.date)}</p>
              </div>

              <h2 className="display-2 mt-4">{first.title}</h2>
              <p className="mt-4 max-w-measure text-body">{first.summary}</p>

              <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-4 text-sm">
                {(
                  [
                    ["When", readableDate(first.date)],
                    ...(first.start ? ([["Time", `${first.start}–${first.end ?? ""}`]] as [string, string][]) : []),
                    ["Where", first.location],
                    ["For", first.audience],
                  ] as [string, string][]
                ).map(([term, detail]) => (
                  <div key={term}>
                    <dt className="eyebrow">{term}</dt>
                    <dd className="tnum mt-1.5 text-body">{detail}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link className="btn btn--primary" href="/events/">
                  Put my name down
                </Link>
                <AddToCalendar event={first} label="Add the date" />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
