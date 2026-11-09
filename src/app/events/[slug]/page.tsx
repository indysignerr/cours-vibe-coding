import type { Metadata } from "next";
import Link from "next/link";
import { AddToCalendar } from "@/components/add-to-calendar";
import { EventSignup } from "@/components/event-signup";
import { Stage } from "@/components/stage";
import {
  breadcrumb,
  eventDescription,
  eventSchema,
  eventTitle,
} from "@/lib/event-schema";
import { EVENTS, readableSpan, shortDate, upcoming } from "@/lib/events";
import { PILLARS } from "@/lib/pillars";

/**
 * Une page par évènement.
 *
 * Google indexe une URL par chose. Dix dates sur une seule page se
 * partagent une seule chance de se classer ; dix pages peuvent sortir
 * chacune sur sa requête — « vibe coding tournament Milano », « LLMs in
 * Python workshop » — et chacune porte son propre schema.org/Event,
 * sans lequel aucune n'est éligible aux résultats enrichis.
 *
 * La page est un billet : la date en très grand à gauche, les faits et
 * l'inscription à droite. Un écran.
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

  const d = new Date(`${e.date}T12:00:00Z`);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = d.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
  const weekday = d.toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });

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

      <Stage className="stage--ticket">
        <nav aria-label="Breadcrumb" className="rise">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <li>
              <Link className="underline-grow" href="/">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link className="underline-grow" href="/events/">
                Events
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-body">{shortDate(e.date)}</li>
          </ol>
        </nav>

        <div className="ticket">
          {/* La date, en monument, et le titre. */}
          <div className="ticket__when">
            <p className="eyebrow eyebrow--accent rise [animation-delay:60ms]">
              {pillar?.title} · {e.format}
            </p>
            <p className="ticket__date rise [animation-delay:120ms]">
              <span className="ticket__day tnum" aria-hidden>
                {day}
              </span>
              <span className="ticket__month">
                <span>{month}</span>
                <span className="text-muted">{weekday}</span>
                {e.start ? (
                  <span className="tnum text-muted">
                    {e.start}
                    {e.end ? `–${e.end}` : ""}
                  </span>
                ) : null}
              </span>
              <span className="sr-only">{readableSpan(e)}</span>
            </p>
            <h1 className="display-1 rise mt-6 max-w-[16ch] [animation-delay:200ms]">
              {e.title}
            </h1>
            <p className="lede rise mt-5 max-w-measure [animation-delay:280ms]">
              {e.summary}
            </p>
            {e.prep ? (
              <p className="rise mt-5 max-w-measure text-sm text-muted [animation-delay:340ms]">
                <strong className="text-ink">Before it:</strong> {e.prep}
              </p>
            ) : null}
            <div className="rise mt-7 [animation-delay:400ms]">
              <AddToCalendar event={e} variant="outline" label="Add the date" />
            </div>
          </div>

          {/* Les faits, puis l'inscription. */}
          <div className="ticket__side rise [animation-delay:320ms]">
            <dl className="ticket__facts">
              {facts.map(([term, detail]) => (
                <div key={term}>
                  <dt className="eyebrow">{term}</dt>
                  <dd className="tnum text-ink">{detail}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8">
              <p className="eyebrow eyebrow--accent">
                {e.kind === "compete"
                  ? "Put your name down"
                  : "Tell us you are coming"}
              </p>
              <div className="mt-4">
                <EventSignup event={e} />
              </div>
            </div>
          </div>
        </div>

        {others.length > 0 ? (
          <nav
            aria-label="Also coming up"
            className="also rise mt-auto [animation-delay:520ms]"
          >
            <p className="eyebrow">Also coming up</p>
            <ul className="also__list">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link className="also__link" href={`/events/${o.slug}/`}>
                    <span className="tnum text-accent">{shortDate(o.date)}</span>
                    <span className="underline-grow text-ink">{o.title}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link className="also__link" href="/events/">
                  <span className="text-accent">→</span>
                  <span className="underline-grow text-ink">The whole year</span>
                </Link>
              </li>
            </ul>
          </nav>
        ) : null}
      </Stage>
    </>
  );
}
