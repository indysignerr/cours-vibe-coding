import type { Metadata } from "next";
import Link from "next/link";
import { PageHead, Shell } from "@/components/shell";
import { eventListSchema } from "@/lib/event-schema";
import {
  BUILD_LAB_DATES,
  past,
  readableDate,
  readableSpan,
  shortDate,
  upcoming,
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

export default function EventsPage() {
  const next = upcoming();
  const before = past();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventListSchema()) }}
      />
      <Shell>
        <PageHead
          eyebrow="Events"
          title="Something on at least every two weeks."
          lede="From the first tournament on 21 November through Demo Day in May. Free, and beginners welcome."
        />

        <ol className="rows">
          {next.map((e) => (
            <li key={e.slug} id={e.slug} className="py-5">
              <p className="text-sm text-muted">
                <time dateTime={e.date}>{readableSpan(e)}</time>
                {e.start ? ` · ${e.start}${e.end ? `–${e.end}` : ""}` : ""}
              </p>
              <h2 className="mt-1 text-xl">
                <Link className="underline underline-offset-4" href={`/events/${e.slug}/`}>
                  {e.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-muted">
                {PILLAR_BY_KEY[e.kind]?.title} · {e.format} · {e.audience}
                {e.location ? ` · ${e.location}` : ""}
                {e.capacity ? ` · ${e.capacity} seats` : ""}
              </p>
              <p className="mt-2 max-w-[60ch]">{e.summary}</p>
            </li>
          ))}
        </ol>

        <section className="mt-14">
          <h2>Build Lab</h2>
          <p className="mt-3 max-w-[60ch]">
            Every other Tuesday, one hour, members only. Bring your own project
            and an experienced member is there to unblock you. First session{" "}
            {readableDate("2026-12-15")}, then:
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
            {BUILD_LAB_DATES.map((d) => (
              <li key={d}>
                <time dateTime={d}>{shortDate(d)}</time>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2>Keep it in your calendar</h2>
          <p className="mt-3 max-w-[60ch]">
            Every date, for Google, Apple or Outlook. Each event page also adds
            itself on its own.
          </p>
          <a className="btn btn--ghost mt-4" href="/albert-light.ics" download>
            Download the calendar (.ics)
          </a>
        </section>

        {before.length > 0 ? (
          <section className="mt-14">
            <h2>Already happened</h2>
            <ul className="rows mt-3">
              {before.map((e) => (
                <li key={e.slug} className="flex flex-wrap gap-x-4 py-3">
                  <time className="text-sm text-muted" dateTime={e.date}>
                    {shortDate(e.date)}
                  </time>
                  <span>{e.title}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-14">
          <h2>Never been?</h2>
          <p className="mt-3 max-w-[60ch]">
            Start with an open one. Workshops, crash courses and the big nights
            are open to anyone at Albert School; tournaments and Build Lab are
            for members.{" "}
            <Link className="text-accent underline underline-offset-4" href="/join/">
              How to join
            </Link>
          </p>
        </section>
      </Shell>
    </>
  );
}
