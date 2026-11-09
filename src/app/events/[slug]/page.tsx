import type { Metadata } from "next";
import Link from "next/link";
import { AddToCalendar } from "@/components/add-to-calendar";
import { EventSignup } from "@/components/event-signup";
import { PageHead, Shell } from "@/components/shell";
import {
  breadcrumb,
  eventDescription,
  eventSchema,
  eventTitle,
} from "@/lib/event-schema";
import { EVENTS, readableSpan, shortDate, upcoming } from "@/lib/events";
import { PILLARS } from "@/lib/pillars";

/**
 * Une page par évènement : une URL par chose pour Google, et un
 * schema.org/Event par date, sans lequel aucune n'est éligible aux
 * résultats enrichis.
 */
export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

const PILLAR_BY_KEY = Object.fromEntries(PILLARS.map((p) => [p.key, p]));

function find(slug: string) {
  return EVENTS.find((e) => e.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = find(slug);
  if (!e) return { title: "Event" };

  return {
    title: { absolute: eventTitle(e) },
    description: eventDescription(e),
    alternates: { canonical: `/events/${e.slug}/` },
    openGraph: {
      title: eventTitle(e),
      description: e.summary,
      type: "article",
      images: [
        { url: "/og/events.png", width: 1200, height: 630, alt: e.title },
      ],
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = find(slug);
  if (!e) return null;

  const pillar = PILLAR_BY_KEY[e.kind];
  const others = upcoming()
    .filter((o) => o.slug !== e.slug)
    .slice(0, 3);

  const facts: [string, string][] = [
    ["When", readableSpan(e)],
    ...(e.start
      ? ([["Time", `${e.start}${e.end ? `–${e.end}` : ""}`]] as [
          string,
          string,
        ][])
      : []),
    // Le plan ne donne ni salle ni jauge pour la plupart des dates : on le
    // dit, on ne l'invente pas.
    ["Where", e.location ?? "To be confirmed"],
    ["For", e.audience],
    ...(e.capacity
      ? ([["Seats", `${e.capacity} max`]] as [string, string][])
      : []),
    ["Lead", e.lead],
    ...(e.partner ? ([["With", e.partner]] as [string, string][]) : []),
    ["Price", "Free"],
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // Les données viennent de notre propre fichier, pas d'une saisie.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema(e)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb(e)) }}
      />

      <Shell>
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link className="hover:text-ink" href="/">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link className="hover:text-ink" href="/events/">
                Events
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>{shortDate(e.date)}</li>
          </ol>
        </nav>

        <PageHead
          eyebrow={`${pillar?.title} · ${e.format}`}
          title={e.title}
          lede={e.summary}
        />

        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {facts.map(([term, detail]) => (
            <div key={term}>
              <dt className="text-sm text-muted">{term}</dt>
              <dd className="tnum text-ink">{detail}</dd>
            </div>
          ))}
        </dl>

        {e.prep ? (
          <p className="mt-6 max-w-[60ch] text-sm text-muted">
            <strong>Before it:</strong> {e.prep}
          </p>
        ) : null}

        <div className="mt-6">
          <AddToCalendar event={e} variant="ghost" label="Add the date" />
        </div>

        <section className="mt-12">
          <h2>
            {e.kind === "compete" ? "Put your name down" : "Tell us you are coming"}
          </h2>
          <div className="mt-5 max-w-xl">
            <EventSignup event={e} />
          </div>
        </section>

        {others.length > 0 ? (
          <section className="mt-14">
            <h2>Also coming up</h2>
            <ul className="rows mt-3">
              {others.map((o) => (
                <li key={o.slug} className="flex flex-wrap gap-x-4 py-3">
                  <time className="text-sm text-muted" dateTime={o.date}>
                    {shortDate(o.date)}
                  </time>
                  <Link className="underline underline-offset-4" href={`/events/${o.slug}/`}>
                    {o.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link className="btn btn--ghost mt-6" href="/events/">
              The whole year
            </Link>
          </section>
        ) : null}
      </Shell>
    </>
  );
}
