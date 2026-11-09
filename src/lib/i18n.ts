import en from "@content/i18n/en.json";
import fr from "@content/i18n/fr.json";
import it from "@content/i18n/it.json";

/**
 * Les trois langues du site.
 *
 * L'anglais est à la racine — c'est la langue de l'association et les
 * adresses déjà partagées restent valides ; l'italien et le français
 * vivent sous /it/ et /fr/, avec leurs propres noms de pages. Tout est
 * du HTML statique : pas de détection, pas de redirection, pas de
 * JavaScript pour lire une autre langue.
 */
export const LOCALES = ["en", "it", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export type Dict = typeof en;
const DICTS: Record<Locale, Dict> = { en, it, fr };

/** Le dictionnaire d'une langue. Lu au build : rien n'en part au client sans y être envoyé. */
export const t = (lang: Locale): Dict => DICTS[lang];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  it: "Italiano",
  fr: "Français",
};

/** Les locales passées à Intl pour les dates. */
export const INTL: Record<Locale, string> = {
  en: "en-GB",
  it: "it-IT",
  fr: "fr-FR",
};

export const OG_LOCALE: Record<Locale, string> = {
  en: "en_GB",
  it: "it_IT",
  fr: "fr_FR",
};

/** Les pages qui existent dans les trois langues. */
export type RouteKey = "home" | "programme" | "team" | "join";

const PATHS: Record<RouteKey | "event", Record<Locale, string>> = {
  home: { en: "/", it: "/it/", fr: "/fr/" },
  programme: { en: "/events/", it: "/it/programma/", fr: "/fr/programme/" },
  event: { en: "/events/", it: "/it/eventi/", fr: "/fr/evenements/" },
  team: { en: "/team/", it: "/it/team/", fr: "/fr/equipe/" },
  join: { en: "/join/", it: "/it/unisciti/", fr: "/fr/rejoindre/" },
};

/** Les pages qui n'existent qu'en anglais. */
export const EN_ONLY = {
  setup: "/setup/",
  legal: "/legal/",
  privacy: "/privacy/",
} as const;

export const href = (route: RouteKey, lang: Locale) => PATHS[route][lang];
export const eventHref = (slug: string, lang: Locale) =>
  `${PATHS.event[lang]}${slug}/`;

/** Une page, désignée soit par sa clé, soit par le slug d'un événement. */
export type PageRef = RouteKey | { event: string };

export const pagePath = (page: PageRef, lang: Locale) =>
  typeof page === "string" ? href(page, lang) : eventHref(page.event, lang);

/** La canonical et les hreflang d'une page : Google relie ainsi les trois versions. */
export function alternates(page: PageRef, lang: Locale) {
  return {
    canonical: pagePath(page, lang),
    languages: {
      en: pagePath(page, "en"),
      it: pagePath(page, "it"),
      fr: pagePath(page, "fr"),
      "x-default": pagePath(page, "en"),
    },
  };
}

/** Remplace {n}, {date}, {names}… dans une chaîne du dictionnaire. */
export const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
