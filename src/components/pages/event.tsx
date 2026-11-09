import Link from "next/link";
import { AddToCalendar } from "@/components/add-to-calendar";
import { EventSignup } from "@/components/event-signup";
import { ScrollFX } from "@/components/motion/scroll-fx";
import { PageFrame } from "@/components/page-frame";
import {
  dateParts,
  getEvents,
  isPast,
  readableSpan,
  shortDate,
  timeRange,
  upcoming,
} from "@/lib/events";
import { breadcrumb, eventSchema } from "@/lib/event-schema";
import { eventHref, fill, href, t, type Locale } from "@/lib/i18n";
import { getPillars } from "@/lib/pillars";

/**
 * Une page par événement.
 *
 * Google indexe une URL par chose : dix dates sur une seule page se
 * partagent une seule chance de se classer, dix pages peuvent sortir
 * chacune sur sa requête — et chacune porte son schema.org/Event, sans
 * lequel aucune n'est éligible aux résultats enrichis.
 *
 * La page est un billet : la date en très grand, les faits, et
 * l'inscription. La galerie n'apparaît qu'une fois des photos ajoutées
 * dans content/events.json.
 */
export function EventPage({ lang, slug }: { lang: Locale; slug: string }) {
  const d = t(lang);
  const e = getEvents(lang).find((x) => x.slug === slug);
  if (!e) return null;

  const p = dateParts(e.date, lang);
  const endDay = e.endDate ? dateParts(e.endDate, lang).day : null;
  const pillar = getPillars(lang).find((x) => x.key === e.kind);
  const done = isPast(e);
  const others = upcoming(lang)
    .filter((o) => o.slug !== slug)
    .slice(0, 3);
  const time = timeRange(e);
  const place = e.online ? d.timeline.online : (e.location ?? d.timeline.tbc);

  const facts: [string, string][] = [
    [d.event.when, readableSpan(e, lang)],
    ...(time ? ([[d.event.time, time]] as [string, string][]) : []),
    // Le plan ne donne ni salle ni jauge pour la plupart des dates : on le
    // dit, on ne l'invente pas.
    [d.event.where, place],
    [d.event.for, e.audienceLabel],
    ...(e.capacity
      ? ([[d.event.seats, fill(d.event.seatsMax, { n: e.capacity })]] as [string, string][])
      : []),
    ...(e.partner ? ([[d.event.with, e.partner]] as [string, string][]) : []),
    ...(e.backup
      ? ([[d.event.backup, shortDate(e.backup, lang)]] as [string, string][])
      : []),
    [d.event.price, d.event.free],
  ];

  return (
    <PageFrame lang={lang} page={{ event: slug }}>
      <ScrollFX />
      <script
        type="application/ld+json"
        // Les données viennent de nos propres fichiers, pas d'une saisie.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema(e, lang)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb(e, lang)) }}
      />

      <article className="event">
        <div className="container">
          <nav aria-label={d.event.breadcrumb} className="crumbs">
            <ol>
              <li>
                <Link className="link" href={href("home", lang)}>
                  {d.nav.home}
                </Link>
              </li>
              <li>
                <Link className="link" href={href("programme", lang)}>
                  {d.nav.programme}
                </Link>
              </li>
              <li aria-current="page">{shortDate(e.date, lang)}</li>
            </ol>
          </nav>

          <header className="event__head">
            <p className="event__date page-head__in" style={{ "--i": 0 } as React.CSSProperties}>
              <time dateTime={e.date}>
                <span className="event__day">{endDay ? `${p.day}–${endDay}` : p.day}</span>
                <span className="event__month">
                  <span>
                    {p.monthLong} {p.year}
                  </span>
                  <span>{[e.endDate ? "" : p.weekday, time].filter(Boolean).join(" · ")}</span>
                </span>
              </time>
            </p>
            <div className="event__title">
              <p className="tl__badges page-head__in" style={{ "--i": 1 } as React.CSSProperties}>
                {done ? <span className="badge badge--past">{d.timeline.past}</span> : null}
                <span className={`badge badge--${e.audience}`}>{e.audienceLabel}</span>
                <span className="badge badge--format">
                  {pillar?.title} · {e.format}
                </span>
              </p>
              <h1 className="display-1 page-head__in" style={{ "--i": 2 } as React.CSSProperties}>
                {e.title}
              </h1>
              <p className="lede page-head__in" style={{ "--i": 3 } as React.CSSProperties}>
                {e.summary}
              </p>
            </div>
          </header>

          <div className="event__grid">
            <div data-reveal>
              <dl className="facts">
                {facts.map(([term, detail]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{detail}</dd>
                  </div>
                ))}
              </dl>
              {done ? null : (
                <AddToCalendar event={e} label={d.event.addDate} icsLabel={d.event.ics} />
              )}
            </div>

            <section className="event__signup" data-reveal>
              <h2 className="display-2">
                {done
                  ? d.event.happened
                  : e.kind === "compete"
                    ? d.event.signupCompete
                    : d.event.signupOpen}
              </h2>
              {done ? null : (
                <>
                  {/* Sans JavaScript le formulaire ne peut rien envoyer : on
                      le dit, et la feuille de style le retire (scripting: none). */}
                  <noscript>
                    <p className="card card--sand p-6">{d.form.noJs}</p>
                  </noscript>
                  <EventSignup event={e} labels={d.form} />
                </>
              )}
            </section>
          </div>

          {e.gallery.length > 0 ? (
            <section className="gallery" data-reveal>
              <h2 className="display-2">{d.event.gallery}</h2>
              <ul>
                {e.gallery.map((src) => (
                  <li key={src}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={fill(d.event.galleryAlt, { title: e.title })}
                      loading="lazy"
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {others.length > 0 ? (
            <nav className="also" aria-label={d.event.also} data-reveal>
              <p className="eyebrow">{d.event.also}</p>
              <ul className="rows">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link className="also__link" href={eventHref(o.slug, lang)}>
                      <time dateTime={o.date}>{shortDate(o.date, lang)}</time>
                      <span>{o.title}</span>
                      <span aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link className="btn btn--ghost" href={href("programme", lang)} data-magnetic>
                {d.event.wholeYear}
              </Link>
            </nav>
          ) : null}
        </div>
      </article>
    </PageFrame>
  );
}
