import type { Metadata } from "next";
import Link from "next/link";
import { EventSignup } from "@/components/event-signup";
import { PageShell } from "@/components/page-shell";
import { embedUrl, googleCalendarUrl, icalFeedUrl, subscribeUrl } from "@/lib/calendar";
import { readableDate, siteEvents } from "@/lib/events";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
  description: `Sign up for the ${SITE.name} weekly peer hour, the contests and Demo Day at ${SITE.school} ${SITE.campus}. One click adds the date to your Google Calendar.`,
};

const KIND_LABEL: Record<string, string> = {
  "peer-hour": "Every week",
  contest: "One evening",
  "demo-day": "Open to everyone",
};

export default function EventsPage() {
  const events = siteEvents();
  const subscribe = subscribeUrl();
  const feed = icalFeedUrl();
  const embed = embedUrl();

  return (
    <PageShell
      eyebrow="Events"
      title="Put your name down, then put it in your calendar."
      lede="One weekly hour, two contests and a demo day. Signing up tells us how many chairs to put out; the calendar button makes sure you actually turn up."
    >
      <ul className="grid gap-10">
        {events.map((e, i) => (
          <li key={e.slug}>
            <article className="card card--raised overflow-hidden">
              <div className="grid md:grid-cols-12">
                {/* La fiche de l'évènement, sur marine */}
                <div className="bg-ink-surface p-7 md:col-span-5 md:p-10">
                  <div className="flex items-center gap-3">
                    <span className="counter" style={{ color: "var(--brand-soft)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="eyebrow eyebrow--on-ink">{KIND_LABEL[e.kind]}</span>
                  </div>

                  <h2 className="display-2 mt-5" style={{ color: "var(--on-ink)" }}>
                    {e.title.replace(`${SITE.name} — `, "")}
                  </h2>

                  <dl className="mt-7 grid gap-3 text-sm" style={{ color: "var(--on-ink-muted)" }}>
                    <div className="flex gap-3">
                      <dt className="w-20 shrink-0" style={{ color: "var(--brand-soft)" }}>
                        When
                      </dt>
                      <dd className="tnum">
                        {e.repeatsOn
                          ? `${e.repeatsOn}s, ${e.start}–${e.end}`
                          : `${readableDate(e.date)}, ${e.start}`}
                      </dd>
                    </div>
                    {e.repeatsOn ? (
                      <div className="flex gap-3">
                        <dt className="w-20 shrink-0" style={{ color: "var(--brand-soft)" }}>
                          From
                        </dt>
                        <dd className="tnum">{readableDate(e.date)}</dd>
                      </div>
                    ) : null}
                    {e.location ? (
                      <div className="flex gap-3">
                        <dt className="w-20 shrink-0" style={{ color: "var(--brand-soft)" }}>
                          Where
                        </dt>
                        <dd>{e.location}</dd>
                      </div>
                    ) : null}
                    <div className="flex gap-3">
                      <dt className="w-20 shrink-0" style={{ color: "var(--brand-soft)" }}>
                        Seats
                      </dt>
                      <dd className="tnum">{e.capacity ? `${e.capacity} max` : "No cap"}</dd>
                    </div>
                  </dl>

                  <p className="mt-7" style={{ color: "var(--on-ink)" }}>
                    {e.details}
                  </p>
                  <p className="mt-3 text-sm" style={{ color: "var(--on-ink-muted)" }}>
                    {e.audience}
                  </p>

                  <a
                    className="btn btn--outline mt-8"
                    href={googleCalendarUrl(e)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Add to Google Calendar
                  </a>
                </div>

                {/* L'inscription */}
                <div className="p-7 md:col-span-7 md:p-10">
                  <p className="eyebrow">Sign up</p>
                  <h3 className="display-3 mt-3">
                    {e.kind === "contest"
                      ? "Tell us you are entering."
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
      </ul>

      {/* L'agenda partagé */}
      <section className="mt-20">
        <p className="eyebrow">The shared calendar</p>
        {subscribe ? (
          <>
            <h2 className="display-2 mt-4 max-w-[22ch]">Subscribe once, stay in sync.</h2>
            <p className="lede mt-5 max-w-measure">
              Room changes, cancelled hours and extra workshops land in your calendar without anyone
              having to send a message.
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
                the full season downloads as one file
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

      <section className="mt-20 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow">For companies</p>
          <h2 className="display-2 mt-4">Demo Day is the one to come to.</h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="lede">
            You will see what students actually ship in twelve weeks, which is the honest version of
            our credentials. If you would rather not wait, the only date you need is forty-five minutes
            with us.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="btn btn--primary" href="/contact/">
              Book a first conversation
            </Link>
            <Link className="btn btn--ghost" href="/solutions/">
              See the five solutions
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
