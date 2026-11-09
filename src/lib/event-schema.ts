import { getEvents, shortDate, type SiteEvent } from "@/lib/events";
import { eventHref, href, t, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/**
 * Le JSON-LD d'un événement.
 *
 * C'est ce qui rend une date éligible aux résultats enrichis
 * « Événements » de Google. On ne déclare que ce qu'on sait : pas de lieu
 * inventé — quand le plan ne nomme pas la salle, le lieu reste l'école,
 * qui est vraie.
 */
/**
 * Le décalage horaire du site ce jour-là : « +01:00 » l'hiver, « +02:00 »
 * l'été. Écrit en dur, il aurait été faux pour la première date de
 * printemps à recevoir un horaire.
 */
function offset(date: string, time: string) {
  const zone = new Intl.DateTimeFormat("en-GB", {
    timeZone: SITE.timezone,
    timeZoneName: "longOffset",
  })
    .formatToParts(new Date(`${date}T${time}:00Z`))
    .find((part) => part.type === "timeZoneName")?.value;
  // « GMT+01:00 » → « +01:00 » ; « GMT » seul vaut +00:00.
  return zone?.replace("GMT", "") || "+00:00";
}

export function eventSchema(e: SiteEvent, lang: Locale = "en") {
  const stamp = (time: string) => `${e.date}T${time}:00${offset(e.date, time)}`;
  const start = e.start ? stamp(e.start) : e.date;
  const end = e.end ? stamp(e.end) : (e.endDate ?? undefined);
  const url = `${SITE.url}${eventHref(e.slug, lang)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: e.summary,
    startDate: start,
    ...(end ? { endDate: end } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: e.online
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: e.online
      ? { "@type": "VirtualLocation", url }
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
      url,
      validFrom: "2026-11-04",
    },
    ...(e.capacity ? { maximumAttendeeCapacity: e.capacity } : {}),
    inLanguage: lang,
    url,
  };
}

/** La liste, pour la page qui les porte toutes. */
export function eventListSchema(lang: Locale = "en") {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE.name} — ${t(lang).meta.programme.title}`,
    itemListElement: getEvents(lang).map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: eventSchema(e, lang),
    })),
  };
}

/** Le fil d'Ariane : Google l'affiche à la place de l'URL nue. */
export function breadcrumb(e: SiteEvent, lang: Locale = "en") {
  const d = t(lang);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: d.nav.home,
        item: `${SITE.url}${href("home", lang)}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: d.nav.programme,
        item: `${SITE.url}${href("programme", lang)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: e.title,
        item: `${SITE.url}${eventHref(e.slug, lang)}`,
      },
    ],
  };
}

/** Le titre d'onglet d'une date : le nom et le jour. Google coupe vers 60 signes. */
export function eventTitle(e: SiteEvent, lang: Locale = "en") {
  // Certains noms sont longs par nature : on coupe le nom, jamais la date.
  return `${clip(e.title, 48)} — ${shortDate(e.date, lang)}`;
}

/** Coupe un texte à `max` signes sur un mot entier, avec une ellipse. */
export function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/** La description d'une page événement, bornée à 160 signes. */
export function eventDescription(e: SiteEvent, lang: Locale = "en") {
  const tail = ` ${t(lang).meta.eventTail[e.audience]}`;
  return clip(e.summary, 160 - tail.length) + tail;
}
