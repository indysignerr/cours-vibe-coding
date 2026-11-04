import Link from "next/link";
import { EVENTS, type SiteEvent } from "@/lib/events";
import { PILLARS } from "@/lib/pillars";

/**
 * La frise de l'année. Le trait se dessine au défilement — mais par
 * `animation-timeline: view()`, donc sur le compositeur : aucun
 * écouteur de scroll, aucun état React, zéro coût sur le thread
 * principal. Le composant reste un composant serveur.
 *
 * Chaque ligne s'ouvre au survol et au focus clavier (grid-template-rows
 * 0fr → 1fr), pour que la frise se lise aussi sans souris.
 */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function monthKey(date: string) {
  const [y, m] = date.split("-");
  return `${y}-${m}`;
}

function monthLabel(date: string) {
  const [y, m] = date.split("-");
  return `${MONTHS[Number(m) - 1]} ${y.slice(2)}`;
}

function day(date: string) {
  return date.split("-")[2];
}

const KIND_LABEL = new Map(PILLARS.map((p) => [p.key, p.title]));

export function YearTimeline({ events = EVENTS }: { events?: SiteEvent[] }) {
  const ordered = [...events].sort((a, b) => a.date.localeCompare(b.date));
  // Le mois n'est annoncé qu'au premier évènement qui l'ouvre. On le
  // calcule avant le rendu : pas de variable mutée pendant le map.
  const opensMonth = ordered.map(
    (e, i) => i === 0 || monthKey(e.date) !== monthKey(ordered[i - 1].date),
  );

  return (
    <div className="timeline">
      <span aria-hidden className="timeline__rail" />
      <span aria-hidden className="timeline__draw" />

      <ol className="timeline__list">
        {ordered.map((e, i) => (
          <li key={e.slug} className="timeline__row">
            {opensMonth[i] ? (
              <p className="timeline__month" aria-hidden>
                {monthLabel(e.date)}
              </p>
            ) : null}

            <Link className="timeline__item" href={`/events/#${e.slug}`}>
              <span aria-hidden className="timeline__dot" />

              <span className="timeline__day tnum">
                <span className="sr-only">{monthLabel(e.date)} </span>
                {day(e.date)}
              </span>

              <span className="timeline__body">
                <span className="timeline__head">
                  <span className="display-3 underline-grow">{e.title}</span>
                  <span className="timeline__meta">
                    <span className="eyebrow">{e.format}</span>
                    <span className="timeline__sep" aria-hidden>
                      ·
                    </span>
                    <span className="text-sm text-muted">{e.audience}</span>
                  </span>
                </span>

                {/* Se déplie au survol et au focus. Lisible pour les lecteurs d'écran en toutes circonstances. */}
                <span className="timeline__more">
                  <span className="timeline__moreInner">
                    <span className="block text-balance">{e.summary}</span>
                    <span className="mt-3 block text-sm text-muted">
                      {KIND_LABEL.get(e.kind)} · {e.location}
                      {e.partner ? ` · with ${e.partner}` : ""}
                    </span>
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
