import type { Metadata } from "next";
import Link from "next/link";
import { AddToCalendar } from "@/components/add-to-calendar";
import { EventSchedule } from "@/components/event-schedule";
import { EventSignup } from "@/components/event-signup";
import { PageShell } from "@/components/page-shell";
import { embedUrl, icalFeedUrl, subscribeUrl } from "@/lib/calendar";
import { BUILD_LAB_DATES, past, readableDate, readableSpan, shortDate, upcoming } from "@/lib/events";
import { PILLARS } from "@/lib/pillars";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
  description: `Every Albert LIGHT date from November 2026 to May 2027: tournaments, workshops, crash courses, Build Lab and open nights at ${SITE.school} ${SITE.campus}. Free, and you sign up here.`,
  openGraph: { images: [{ url: "/og/events.png", width: 1200, height: 630, alt: "Nobody here is only listening" }] },
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
      {/* Le repère rapide : tout le calendrier sur un écran. */}
      <section aria-label="Calendar at a glance" className="scroll-in">
        <p className="eyebrow">At a glance</p>
        <ol className="rows mt-6">
          {next.map((e) => (
            <li key={e.slug}>
              <a
                href={`#${e.slug}`}
                className="group grid items-baseline gap-2 py-4 md:grid-cols-12 md:gap-6"
              >
                <span className="tnum text-sm text-accent md:col-span-2">{shortDate(e.date)}</span>
                <span className="underline-grow text-ink md:col-span-6">{e.title}</span>
                <span className="eyebrow md:col-span-2">{e.format}</span>
                <span className="text-sm text-muted md:col-span-2 md:text-right">{e.audience}</span>
              </a>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-muted">
          Build Lab also runs every other Tuesday: {BUILD_LAB_DATES.length} more sessions from
          January to May.
        </p>
      </section>

      {/* Chaque évènement, en détail. */}
      <ul className="mt-24 grid gap-14">
        {next.map((e) => {
          const pillar = PILLAR_BY_KEY[e.kind];
          return (
            <li key={e.slug} id={e.slug} className="scroll-in scroll-mt-28">
              <article className="card card--raised overflow-hidden">
                <div className="grid md:grid-cols-12">
                  {/* La fiche */}
                  <div className="on-ink p-7 md:col-span-5 md:p-10">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="eyebrow eyebrow--accent">{pillar?.title}</span>
                      <span className="eyebrow">{e.format}</span>
                    </div>

                    <h2 className="display-2 mt-5">{e.title}</h2>

                    <dl className="mt-8 grid gap-3 text-sm">
                      {(
                        [
                          ["When", readableSpan(e)],
                          ...(e.start
                            ? ([["Time", `${e.start}${e.end ? `–${e.end}` : ""}`]] as [string, string][])
                            : []),
                          ["Where", e.location],
                          ["For", e.audience],
                          ["Seats", e.capacity ? `${e.capacity} max` : "No cap"],
                          ...(e.partner ? ([["With", e.partner]] as [string, string][]) : []),
                        ] as [string, string][]
                      ).map(([term, detail]) => (
                        <div key={term} className="flex gap-3">
                          <dt className="w-16 shrink-0 text-accent">{term}</dt>
                          <dd className="tnum">{detail}</dd>
                        </div>
                      ))}
                    </dl>

                    <p className="mt-8 text-ink">{e.summary}</p>

                    <div className="mt-9">
                      <AddToCalendar event={e} variant="outline" label="Add the date" />
                    </div>
                  </div>

                  {/* Ce qu'on en repart avec, le déroulé, l'inscription */}
                  <div className="p-7 md:col-span-7 md:p-10">
                    {e.takeaways ? (
                      <>
                        <p className="eyebrow">What you leave with</p>
                        <ul className="mt-4 grid gap-2.5">
                          {e.takeaways.map((t) => (
                            <li key={t} className="grid grid-cols-[auto_1fr] gap-3 text-body">
                              <span
                                aria-hidden
                                className="mt-[0.72em] h-0.5 w-4 shrink-0 rounded-full bg-brand"
                              />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                        {e.bring ? (
                          <p className="mt-5 text-sm text-muted">
                            <strong className="text-ink">Bring:</strong> {e.bring}
                          </p>
                        ) : null}
                        <div className="rule my-8" />
                      </>
                    ) : null}

                    {e.schedule ? (
                      <>
                        <EventSchedule event={e} />
                        <div className="rule my-8" />
                      </>
                    ) : null}

                    <p className="eyebrow">Sign up</p>
                    <h3 className="display-3 mt-3">
                      {e.kind === "compete" ? "Put your name down." : "Tell us you are coming."}
                    </h3>
                    <div className="mt-7">
                      <EventSignup event={e} />
                    </div>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {/* Build Lab, qui est un rythme plutôt qu'une date. */}
      <section className="card card--sand mt-24 p-7 md:p-10 scroll-in">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow">Every other Tuesday</p>
            <h2 className="display-2 mt-5">Build Lab</h2>
            <p className="mt-5 text-body">
              One hour. Bring your own project, and an experienced member is there to unblock you.
              Members only, and it runs all year.
            </p>
          </div>
          <ol className="md:col-span-6 md:col-start-7">
            <li className="tnum border-b border-line py-3 text-ink">
              {readableDate("2026-12-15")} <span className="text-muted">· first session</span>
            </li>
            {BUILD_LAB_DATES.map((d) => (
              <li key={d} className="tnum border-b border-line py-3 text-muted last:border-0">
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
            <h2 className="display-2 mt-5 max-w-[22ch]">Subscribe once, stay in sync.</h2>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a className="btn btn--primary" href={subscribeUrl()!} target="_blank" rel="noopener noreferrer">
                Add to my Google Calendar
              </a>
              {icalFeedUrl() ? (
                <a className="tap inline-flex items-center text-sm text-muted underline underline-offset-4 hover:text-ink" href={icalFeedUrl()!}>
                  iCal feed for Apple or Outlook
                </a>
              ) : null}
            </div>
            {embedUrl() ? (
              <div className="card card--raised mt-10 overflow-hidden">
                <iframe title={`${SITE.name} calendar`} src={embedUrl()!} className="h-[520px] w-full border-0" loading="lazy" />
              </div>
            ) : null}
          </>
        ) : (
          <div className="card card--sand mt-5 p-7">
            <h2 className="display-3">One calendar for everything, soon.</h2>
            <p className="mt-3 text-body">
              Every date above adds itself to your own calendar, and{" "}
              <a className="text-accent underline underline-offset-4" href="/albert-light.ics" download>
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
              <li key={e.slug} className="grid gap-2 py-5 md:grid-cols-12 md:items-baseline md:gap-6">
                <span className="tnum text-sm text-muted md:col-span-2">{shortDate(e.date)}</span>
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
            Workshops, crash courses and the big nights are open to anyone at {SITE.school} —
            including people who have never written a line of code. Tournaments and Build Lab are
            for members, and becoming one takes a form.
          </p>
          <Link className="btn btn--primary mt-8" href="/join/">
            How to join
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
