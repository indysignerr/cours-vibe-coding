import type { Metadata } from "next";
import Link from "next/link";
import { EventSignup } from "@/components/event-signup";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { PageShell } from "@/components/page-shell";
import { embedUrl, googleCalendarUrl, icalFeedUrl, subscribeUrl } from "@/lib/calendar";
import { EVENT_KINDS, past, readableSpan, upcoming } from "@/lib/events";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
  description: `Hackathons, workshops, talks and company evenings run by ${SITE.name} at ${SITE.school} ${SITE.campus}. Sign up, and add the date to your calendar in one click.`,
};

export default function EventsPage() {
  const next = upcoming();
  const before = past();
  const subscribe = subscribeUrl();
  const feed = icalFeedUrl();
  const embed = embedUrl();

  return (
    <PageShell
      eyebrow="Events"
      title="We run the room, not a syllabus."
      lede="Hackathons, workshops, talks and evenings where companies and students end up at the same table. Nothing weekly, nothing graded, and you never need an account to come."
    >
      {/* Les quatre formats, dits une fois */}
      <section>
        <p className="eyebrow">Four formats</p>
        <Reveal as="dl" className="mt-8 grid gap-px overflow-hidden rounded-card bg-line sm:grid-cols-2 lg:grid-cols-4" stagger y={22}>
          {Object.entries(EVENT_KINDS).map(([key, k]) => (
            <div key={key} className="bg-sunken p-6">
              <span aria-hidden className="rule--brand block" />
              <dt className="display-3 mt-4">{k.label}</dt>
              <dd className="mt-2 text-sm text-body">{k.blurb}</dd>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Ce qui arrive */}
      <section className="mt-20">
        <p className="eyebrow">What is coming up</p>
        {next.length === 0 ? (
          <div className="card card--sand mt-6 p-7">
            <h2 className="display-3">Nothing on the calendar right now.</h2>
            <p className="mt-3 text-body">
              The next run of events is being put together. Write to us and we will tell you when the
              dates are out.
            </p>
            <Link className="btn btn--ghost mt-5" href="/contact/">
              Tell me when
            </Link>
          </div>
        ) : (
          <Reveal as="ul" className="mt-8 grid gap-10" stagger y={32}>
            {next.map((e, i) => (
              <li key={e.slug}>
                <article className="card card--raised lift-on-hover overflow-hidden">
                  <div className="grid md:grid-cols-12">
                    {/* La fiche, sur marine */}
                    <div className="bg-ink-surface p-7 md:col-span-5 md:p-10">
                      <div className="flex items-center gap-3">
                        <span className="counter" style={{ color: "var(--brand-soft)" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="eyebrow eyebrow--on-ink">{EVENT_KINDS[e.kind].label}</span>
                      </div>

                      <h2 className="display-2 mt-5" style={{ color: "var(--on-ink)" }}>
                        {e.title}
                      </h2>

                      <dl className="mt-7 grid gap-3 text-sm" style={{ color: "var(--on-ink-muted)" }}>
                        {(
                          [
                            ["When", readableSpan(e)],
                            ["Time", `${e.start}–${e.end}`],
                            ["Where", e.location],
                            ["Seats", e.capacity ? `${e.capacity} max` : "No cap"],
                          ] as [string, string][]
                        ).map(([term, detail]) => (
                          <div key={term} className="flex gap-3">
                            <dt className="w-16 shrink-0" style={{ color: "var(--brand-soft)" }}>
                              {term}
                            </dt>
                            <dd className="tnum">{detail}</dd>
                          </div>
                        ))}
                      </dl>

                      <p className="mt-7" style={{ color: "var(--on-ink)" }}>
                        {e.summary}
                      </p>
                      <p className="mt-3 text-sm" style={{ color: "var(--on-ink-muted)" }}>
                        {e.audience}
                      </p>

                      <a
                        className="btn btn--outline lift-on-hover mt-8"
                        href={googleCalendarUrl(e)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Add to Google Calendar
                      </a>
                    </div>

                    {/* Ce qu'on en repart avec, puis l'inscription */}
                    <div className="p-7 md:col-span-7 md:p-10">
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

                      <p className="eyebrow">Sign up</p>
                      <h3 className="display-3 mt-3">
                        {e.kind === "hackathon"
                          ? "Put your name down, team or no team."
                          : "Tell us you are coming."}
                      </h3>
                      <div className="mt-7">
                        <EventSignup event={e} />
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </Reveal>
        )}
      </section>

      {/* L'agenda partagé */}
      <section className="mt-20">
        <p className="eyebrow">The shared calendar</p>
        {subscribe ? (
          <>
            <h2 className="display-2 mt-4 max-w-[22ch]">Subscribe once, stay in sync.</h2>
            <p className="lede mt-5 max-w-measure">
              New dates, room changes and cancellations land in your calendar without anyone having to
              send a message.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a className="btn btn--primary" href={subscribe} target="_blank" rel="noopener noreferrer">
                Add to my Google Calendar
              </a>
              {feed ? (
                <a
                  className="tap inline-flex items-center text-sm text-muted underline underline-offset-4 hover:text-ink"
                  href={feed}
                >
                  iCal feed for Apple or Outlook
                </a>
              ) : null}
            </div>
            {embed ? (
              <div className="card card--raised mt-10 overflow-hidden">
                <iframe
                  title={`${SITE.name} calendar`}
                  src={embed}
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
              The dates above already work: every button adds the real event to your own calendar, and{" "}
              <a className="text-accent underline underline-offset-4" href="/albert-light.ics" download>
                the whole programme downloads as one file
              </a>
              . A single subscribable calendar will replace them once the association&rsquo;s Google
              account exists.
            </p>
            <p className="mt-4 text-sm text-muted">
              For the organisers: create a public Google calendar, paste its ID into{" "}
              <code className="rounded bg-canvas px-1.5 py-0.5">calendarId</code> in{" "}
              <code className="rounded bg-canvas px-1.5 py-0.5">src/lib/site.ts</code>, and this
              section turns itself on.
            </p>
          </div>
        )}
      </section>

      {/* Ce qui est déjà passé */}
      {before.length > 0 ? (
        <section className="mt-20">
          <p className="eyebrow">Already happened</p>
          <ul className="rows mt-8">
            {before.map((e) => (
              <li key={e.slug} className="grid gap-2 py-6 md:grid-cols-12 md:items-baseline md:gap-8">
                <span className="eyebrow md:col-span-2">{EVENT_KINDS[e.kind].label}</span>
                <h2 className="display-3 md:col-span-5">{e.title}</h2>
                <p className="tnum text-sm text-muted md:col-span-4">{readableSpan(e)}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-20 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow">Want one in your company?</p>
          <h2 className="display-2 mt-4">We run these on site too.</h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="lede">
            A hackathon on a brief you actually care about, or a workshop for the team that will have
            to live with the tools. Same format, your building, your problem.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Magnetic>
              <Link className="btn btn--primary" href="/contact/">
                Talk to us about it
              </Link>
            </Magnetic>
            <Link className="btn btn--ghost" href="/solutions/">
              See the five solutions
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
