import { EVENTS, type SiteEvent, shortDate } from "@/lib/events";
import { SITE } from "@/lib/site";

/**
 * Le JSON-LD d'un évènement.
 *
 * C'est ce qui rend une date éligible aux résultats enrichis
 * « Évènements » de Google. Sans lui, dix dates ne sont qu'un bloc de
 * texte parmi d'autres.
 *
 * On ne déclare que ce qu'on sait. Pas de lieu inventé : quand le plan
 * ne nomme pas la salle, le lieu reste l'école, qui est vraie.
 */
export function eventSchema(e: SiteEvent) {
  const start = e.start ? `${e.date}T${e.start}:00+01:00` : e.date;
  const end = e.end ? `${e.date}T${e.end}:00+01:00` : (e.endDate ?? undefined);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: e.summary,
    startDate: start,
    ...(end ? { endDate: end } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      e.format === "Crash course"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
    location:
      e.format === "Crash course"
        ? { "@type": "VirtualLocation", url: `${SITE.url}/events/${e.slug}/` }
        : {
            "@type": "Place",
            name: e.location ?? `${SITE.school} ${SITE.campus}`,
            address: {
              "@type": "PostalAddress",
              addressLocality: e.location ?? SITE.campus,
              addressCountry: "IT",
            },
          },
    organizer: {
      "@type": "Organization",
      name: SITE.name,
      alternateName: "Albert LIGHT",
      url: SITE.url,
    },
    ...(e.partner
      ? { performer: { "@type": "Organization", name: e.partner } }
      : {}),
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/events/${e.slug}/`,
      validFrom: "2026-11-04",
    },
    ...(e.capacity ? { maximumAttendeeCapacity: e.capacity } : {}),
    inLanguage: "en",
    url: `${SITE.url}/events/${e.slug}/`,
  };
}

/** La liste, pour la page qui les porte toutes. */
export function eventListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE.name} events, November 2026 to May 2027`,
    itemListElement: EVENTS.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: eventSchema(e),
    })),
  };
}

/** Le fil d'Ariane : Google l'affiche à la place de l'URL nue. */
export function breadcrumb(e: SiteEvent) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Events",
        item: `${SITE.url}/events/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: e.title,
        item: `${SITE.url}/events/${e.slug}/`,
      },
    ],
  };
}

/** Le titre d'onglet d'une date : le nom et le jour. Google coupe vers 60 signes. */
export function eventTitle(e: SiteEvent) {
  // Certains noms sont longs par nature (« Crash course #3: cloud credits
  // for student projects ») : on coupe le nom, jamais la date.
  return `${clip(e.title, 50)} — ${shortDate(e.date)}`;
}

/** Coupe un texte à `max` signes sur un mot entier, avec une ellipse. */
export function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/** La description d'une page évènement, bornée à 160 signes. */
export function eventDescription(e: SiteEvent) {
  const tail = ` ${e.audience === "Members" ? "Members" : "Open to all"}, free, ${SITE.school} ${SITE.campus}.`;
  return clip(e.summary, 160 - tail.length) + tail;
}
