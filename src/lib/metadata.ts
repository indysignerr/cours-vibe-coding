import type { Metadata } from "next";
import { getEvents } from "@/lib/events";
import { eventDescription, eventTitle } from "@/lib/event-schema";
import {
  OG_LOCALE,
  alternates,
  eventHref,
  href,
  t,
  type Locale,
  type RouteKey,
} from "@/lib/i18n";
import { SITE } from "@/lib/site";

/**
 * Les métadonnées d'une page, dans sa langue.
 *
 * Chaque page déclare sa canonical ET ses deux jumelles (hreflang) :
 * c'est ce qui dit à Google que /events/, /it/programma/ et
 * /fr/programme/ sont la même page en trois langues, et laquelle servir
 * à qui.
 */
const OG_IMAGE: Record<RouteKey, string> = {
  home: "/og.png",
  programme: "/og/events.png",
  team: "/og/team.png",
  join: "/og/join.png",
};

const og = (lang: Locale, title: string, description: string, url: string, image: string) => ({
  type: "website" as const,
  siteName: SITE.name,
  locale: OG_LOCALE[lang],
  title,
  description,
  url,
  images: [{ url: image, width: 1200, height: 630, alt: title }],
});

export function pageMetadata(page: RouteKey, lang: Locale): Metadata {
  const m = t(lang).meta[page];
  return {
    // L'accueil porte déjà le nom dans son titre : pas de suffixe en plus.
    title: page === "home" ? { absolute: m.title } : m.title,
    description: m.description,
    alternates: alternates(page, lang),
    openGraph: og(lang, m.title, m.description, href(page, lang), OG_IMAGE[page]),
  };
}

export const eventParams = () => getEvents("en").map((e) => ({ slug: e.slug }));

export function eventMetadata(slug: string, lang: Locale): Metadata {
  const e = getEvents(lang).find((x) => x.slug === slug);
  if (!e) return { title: t(lang).nav.programme };
  const title = eventTitle(e, lang);
  const description = eventDescription(e, lang);
  return {
    title: { absolute: title },
    description,
    alternates: alternates({ event: slug }, lang),
    openGraph: og(lang, title, description, eventHref(slug, lang), "/og/events.png"),
  };
}
