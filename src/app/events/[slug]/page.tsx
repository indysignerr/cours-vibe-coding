import type { Metadata } from "next";
import Link from "next/link";
import { AddToCalendar } from "@/components/add-to-calendar";
import { EventSignup } from "@/components/event-signup";
import { PageShell } from "@/components/page-shell";
import { breadcrumb, eventSchema, eventTitle } from "@/lib/event-schema";
import { EVENTS, readableSpan, shortDate, upcoming } from "@/lib/events";
import { PILLARS } from "@/lib/pillars";
import { SITE } from "@/lib/site";

/**
 * Une page par évènement.
 *
 * Google indexe une URL par chose. Dix dates sur une seule page se
 * partagent une seule chance de se classer ; dix pages peuvent sortir
 * chacune sur sa requête — « vibe coding tournament Milano », « LLMs in
 * Python workshop » — et chacune porte son propre schema.org/Event,
 * sans lequel aucune n'est éligible aux résultats enrichis.
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
    title: eventTitle(e),
    description: `${e.summary} ${e.audience === "Members" ? "For members" : "Open to all"}, free, at ${SITE.school} ${SITE.campus}.`,
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

      <PageShell
        eyebrow={`${pillar?.title} · ${e.format}`}
        title={e.title}
        lede={e.summary}
      >
        <nav aria-label="Breadcrumb" className="scroll-fade">
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

        <div className="mt-14 grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5 scroll-in">
            <p className="eyebrow">The details</p>
            <dl className="rows mt-6">
              {facts.map(([term, detail]) => (
                <div key={term} className="flex gap-4 py-3.5">
                  <dt className="w-20 shrink-0 text-sm text-accent">{term}</dt>
                  <dd className="tnum text-body">{detail}</dd>
                </div>
              ))}
            </dl>

            {e.prep ? (
              <p className="mt-7 max-w-measure text-sm text-muted">
                <strong className="text-ink">Before it:</strong> {e.prep}
              </p>
            ) : null}

            <div className="mt-8">
              <AddToCalendar event={e} variant="outline" label="Add the date" />
            </div>
          </div>

          <div className="md:col-span-6 md:col-start-7 scroll-in">
            <p className="eyebrow eyebrow--accent">
              {e.kind === "compete"
                ? "Put your name down"
                : "Tell us you are coming"}
            </p>
            <div className="mt-6">
              <EventSignup event={e} />
            </div>
          </div>
        </div>

        {others.length > 0 ? (
          <section className="mt-24 scroll-in">
            <p className="eyebrow">Also coming up</p>
            <ol className="rows mt-6">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    className="grid items-baseline gap-1 py-5 md:grid-cols-12 md:gap-6"
                    href={`/events/${o.slug}/`}
                  >
                    <span className="tnum text-sm text-accent md:col-span-2">
                      {shortDate(o.date)}
                    </span>
                    <span className="underline-grow display-3 md:col-span-7">
                      {o.title}
                    </span>
                    <span className="eyebrow md:col-span-3 md:text-right">
                      {o.format}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <Link className="btn btn--ghost mt-10" href="/events/">
              The whole year
            </Link>
          </section>
        ) : null}
      </PageShell>
    </>
  );
}
