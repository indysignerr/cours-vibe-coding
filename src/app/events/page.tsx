import type { Metadata } from "next";
import Link from "next/link";
import { AddToCalendar } from "@/components/add-to-calendar";
import { EventSignup } from "@/components/event-signup";
import { PageShell } from "@/components/page-shell";
import { embedUrl, icalFeedUrl, subscribeUrl } from "@/lib/calendar";
import {
  BUILD_LAB_DATES,
  past,
  readableDate,
  readableSpan,
  shortDate,
  upcoming,
} from "@/lib/events";
import { PILLARS } from "@/lib/pillars";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
  description: `Every Albert LIGHT date from November 2026 to May 2027: tournaments, workshops, crash courses, Build Lab and open nights at ${SITE.school} ${SITE.campus}. Free, and you sign up here.`,
  openGraph: {
    images: [
      {
        url: "/og/events.png",
        width: 1200,
        height: 630,
        alt: "Nobody here is only listening",
      },
    ],
  },
};

const PILLAR_BY_KEY = Object.fromEntries(PILLARS.map((p) => [p.key, p]));

export default function EventsPage() {
  const next = upcoming();
  const before = past();

  return (
    <PageShell
      eyebrow="Events"
      title="Something on at least every two weeks."
      lede="From the first tournament in November through Demo Day in May. Everything is free, and open events welcome people who have never written a line of code."
    >
      {/* Chaque évènement : une ligne, et le détail qui s'ouvre.
          Les neuf fiches dépliées d'un coup faisaient 1 630 mots sur la page.
          `<details>` est natif : le clavier, le mobile et le repli sans
          JavaScript viennent avec, et le contenu reste dans le HTML pour
          l'indexation même quand il est fermé. */}
      <ol className="evs mt-16 scroll-stagger">
        {next.map((e) => {
          const pillar = PILLAR_BY_KEY[e.kind];
          return (
            <li key={e.slug} id={e.slug} className="scroll-mt-28">
              <details className="ev">
                <summary className="ev__head">
                  <span className="ev__date tnum">{shortDate(e.date)}</span>
                  <span className="ev__title">{e.title}</span>
                  <span className="ev__meta">
                    <span className="eyebrow eyebrow--accent">
                      {pillar?.title}
                    </span>
                    <span className="text-sm text-muted">{e.audience}</span>
                  </span>
                  <span aria-hidden className="ev__sign" />
                </summary>

                <div className="ev__body">
                  <div className="grid gap-10 md:grid-cols-12">
                    <div className="md:col-span-5">
                      <dl className="grid gap-2.5 text-sm">
                        {(
                          [
                            ["When", readableSpan(e)],
                            ...(e.start
                              ? ([
                                  [
                                    "Time",
                                    `${e.start}${e.end ? `–${e.end}` : ""}`,
                                  ],
                                ] as [string, string][])
                              : []),
                            // Le plan ne donne ni salle ni jauge pour la plupart
                            // des dates : on le dit, on ne l'invente pas.
                            ["Where", e.location ?? "To be confirmed"],
                            ...(e.capacity
                              ? ([["Seats", `${e.capacity} max`]] as [
                                  string,
                                  string,
                                ][])
                              : []),
                            ["Lead", e.lead],
                            ...(e.partner
                              ? ([["With", e.partner]] as [string, string][])
                              : []),
                            ...(e.prep
                              ? ([["Before it", e.prep]] as [string, string][])
                              : []),
                          ] as [string, string][]
                        ).map(([term, detail]) => (
                          <div key={term} className="flex gap-3">
                            <dt className="w-16 shrink-0 text-accent">
                              {term}
                            </dt>
                            <dd className="tnum text-body">{detail}</dd>
                          </div>
                        ))}
                      </dl>

                      <p className="mt-6 text-body">{e.summary}</p>

                      <div className="mt-7">
                        <AddToCalendar
                          event={e}
                          variant="outline"
                          label="Add the date"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-6 md:col-start-7">
                      <p className="eyebrow">
                        {e.kind === "compete"
                          ? "Put your name down"
                          : "Tell us you are coming"}
                      </p>
                      <div className="mt-5">
                        <EventSignup event={e} />
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ol>

      {/* Build Lab, qui est un rythme plutôt qu'une date. */}
      <section className="card card--sand mt-24 p-7 md:p-10 scroll-in">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow">Every other Tuesday</p>
            <h2 className="display-2 mt-5">Build Lab</h2>
            <p className="mt-5 text-body">
              One hour. Bring your own project, and an experienced member is
              there to unblock you. Members only, and it runs all year.
            </p>
          </div>
          <ol className="md:col-span-6 md:col-start-7">
            <li className="tnum border-b border-line py-3 text-ink">
              {readableDate("2026-12-15")}{" "}
              <span className="text-muted">· first session</span>
            </li>
            {BUILD_LAB_DATES.map((d) => (
              <li
                key={d}
                className="tnum border-b border-line py-3 text-muted last:border-0"
              >
                {readableDate(d)}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* L'agenda partagé. */}
      <section className="mt-24 scroll-in">
        <p className="eyebrow">Keep it in your calendar</p>
        {subscribeUrl() ? (
          <>
            <h2 className="display-2 mt-5 max-w-[22ch]">
              Subscribe once, stay in sync.
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                className="btn btn--primary"
                href={subscribeUrl()!}
                target="_blank"
                rel="noopener noreferrer"
              >
                Add to my Google Calendar
              </a>
              {icalFeedUrl() ? (
                <a
                  className="tap inline-flex items-center text-sm text-muted underline underline-offset-4 hover:text-ink"
                  href={icalFeedUrl()!}
                >
                  iCal feed for Apple or Outlook
                </a>
              ) : null}
            </div>
            {embedUrl() ? (
              <div className="card card--raised mt-10 overflow-hidden">
                <iframe
                  title={`${SITE.name} calendar`}
                  src={embedUrl()!}
                  className="h-[520px] w-full border-0"
                  loading="lazy"
                />
              </div>
            ) : null}
          </>
        ) : (
          <div className="card card--sand mt-5 p-7">
            <h2 className="display-3">One calendar for everything, soon.</h2>
            <p className="mt-3 text-body">
              Every date above adds itself to your own calendar, and{" "}
              <a
                className="text-accent underline underline-offset-4"
                href="/albert-light.ics"
                download
              >
                the whole year downloads as one file
              </a>
              .
            </p>
          </div>
        )}
      </section>

      {before.length > 0 ? (
        <section className="mt-24 scroll-in">
          <p className="eyebrow">Already happened</p>
          <ol className="rows mt-6">
            {before.map((e) => (
              <li
                key={e.slug}
                className="grid gap-2 py-5 md:grid-cols-12 md:items-baseline md:gap-6"
              >
                <span className="tnum text-sm text-muted md:col-span-2">
                  {shortDate(e.date)}
                </span>
                <span className="text-ink md:col-span-6">{e.title}</span>
                <span className="eyebrow md:col-span-4">{e.format}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="mt-24 grid gap-10 md:grid-cols-12 scroll-in">
        <div className="md:col-span-5">
          <p className="eyebrow">Never been?</p>
          <h2 className="display-2 mt-5">Start with an open one.</h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="lede">
            Workshops, crash courses and the big nights are open to anyone.
            Tournaments and Build Lab are for members.
          </p>
          <Link className="btn btn--primary mt-8" href="/join/">
            How to join
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
