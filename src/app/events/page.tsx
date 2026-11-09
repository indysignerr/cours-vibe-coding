import type { Metadata } from "next";
import Link from "next/link";
import { Stage } from "@/components/stage";
import { Wall } from "@/components/wall";
import { eventListSchema } from "@/lib/event-schema";
import {
  BUILD_LAB_DATES,
  past,
  readableDate,
  shortDate,
  upcoming,
  type SiteEvent,
} from "@/lib/events";
import { PILLARS } from "@/lib/pillars";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Every Albert LIGHT date from November 2026 to May 2027: tournaments, workshops, crash courses, Build Lab and open nights in Milan. Free, and you sign up here.",
  openGraph: {
    images: [
      {
        url: "/og/events.png",
        width: 1200,
        height: 630,
        alt: "Something on at least every two weeks",
      },
    ],
  },
};

const PILLAR_BY_KEY = Object.fromEntries(PILLARS.map((p) => [p.key, p]));

/** « 21 » et « Nov », séparés : le jour en très grand, le mois en mono. */
function parts(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  return {
    day: String(d.getUTCDate()).padStart(2, "0"),
    month: d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }),
    weekday: d.toLocaleDateString("en-GB", {
      weekday: "long",
      timeZone: "UTC",
    }),
  };
}

/**
 * La page Events : le mur de l'année.
 *
 * Une carte par date, en rangée, qu'on traverse à l'horizontale — le
 * jour en chiffres de six centimètres, le mois, le titre, le format. La
 * prochaine est en tête et cerclée de beige. Le reste de la page tient
 * sous le mur : le rythme du Build Lab, le fichier calendrier, ce qui a
 * déjà eu lieu. Un écran, et chaque chose dite une fois.
 */
export default function EventsPage() {
  const next = upcoming();
  const before = past();
  const [first] = next;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventListSchema()) }}
      />
      <Stage className="stage--events">
        <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <div>
            <p className="eyebrow eyebrow--accent rise">The year</p>
            <h1 className="display-1 rise mt-3 [animation-delay:80ms]">
              {next.length} dates, November to May.
            </h1>
          </div>
          <p className="lede rise max-w-[30ch] [animation-delay:160ms]">
            Free. Beginners welcome. Open events need nothing but a sign-up.
          </p>
        </header>

        <Wall label="Upcoming events" className="mt-6">
          {next.map((e, i) => (
            <Tile key={e.slug} e={e} i={i} isNext={e.slug === first?.slug} />
          ))}
        </Wall>

        <div className="trio mt-auto">
          {/* Build Lab : un rythme plus qu'une date. */}
          <section className="trio__cell rise [animation-delay:500ms]">
            <p className="eyebrow">Every other Tuesday · Members</p>
            <h2 className="display-3 mt-2">Build Lab</h2>
            <p className="mt-2 text-body">
              One hour on your own project, with an experienced member there.
              First session {shortDate("2026-12-15")}, then:
            </p>
            <ul className="trio__dates tnum mt-3">
              {BUILD_LAB_DATES.map((d) => (
                <li key={d}>{shortDate(d)}</li>
              ))}
            </ul>
          </section>

          {/* Le calendrier. */}
          <section className="trio__cell rise [animation-delay:580ms]">
            <p className="eyebrow">Keep it in your calendar</p>
            <h2 className="display-3 mt-2">The whole year, one file.</h2>
            <p className="mt-2 text-body">
              Every date, for Google, Apple or Outlook. Each event page also
              adds itself on its own.
            </p>
            <a className="btn btn--outline mt-4" href="/albert-light.ics" download>
              Download the calendar (.ics)
            </a>
          </section>

          {/* Ce qui a eu lieu, et par où commencer. */}
          <section className="trio__cell rise [animation-delay:660ms]">
            {before.length > 0 ? (
              <>
                <p className="eyebrow">Already happened</p>
                <ul className="mt-2">
                  {before.map((e) => (
                    <li key={e.slug} className="flex items-baseline gap-3 py-1">
                      <span className="tnum text-sm text-muted">
                        {shortDate(e.date)}
                      </span>
                      <span className="text-body">{e.title}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <p className="eyebrow mt-5">Never been?</p>
            <p className="mt-2 text-body">
              Start with an open one. Tournaments and Build Lab are for
              members — and membership is a tick on the sign-up form.
            </p>
            <Link className="btn btn--ghost mt-4" href="/join/">
              How to join
            </Link>
          </section>
        </div>
      </Stage>
    </>
  );
}

function Tile({ e, i, isNext }: { e: SiteEvent; i: number; isNext: boolean }) {
  const { day, month, weekday } = parts(e.date);
  const pillar = PILLAR_BY_KEY[e.kind];
  return (
    <li
      className={`tile${isNext ? " tile--next" : ""}`}
      style={{ "--i": i } as React.CSSProperties}
    >
      <Link href={`/events/${e.slug}/`} className="tile__link">
        <span className="tile__top">
          <span className="tile__month">
            {month}
            {isNext ? " · Next" : ""}
          </span>
          <span className="tile__pillar">{pillar?.title}</span>
        </span>
        <span className="tile__day tnum" aria-hidden>
          {day}
        </span>
        <span className="sr-only">{readableDate(e.date)}</span>
        <span className="tile__body">
          <span className="tile__title">{e.title}</span>
          <span className="tile__meta">
            {weekday}
            {e.start ? ` · ${e.start}` : ""} · {e.audience}
          </span>
        </span>
        <span className="tile__format eyebrow">{e.format}</span>
      </Link>
    </li>
  );
}
