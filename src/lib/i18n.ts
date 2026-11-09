import en from "@content/i18n/en.json";
import es from "@content/i18n/es.json";
import fr from "@content/i18n/fr.json";
import it from "@content/i18n/it.json";

/**
 * Les quatre langues du site.
 *
 * L'ANGLAIS EST LA LANGUE D'ARRIVÉE. Il est à la racine : qui ouvre
 * albertlight.com lit l'anglais, quelle que soit la langue de son
 * navigateur. L'italien, le français et l'espagnol vivent sous /it/, /fr/
 * et /es/, avec leurs propres noms de pages, et ne s'ouvrent que si on
 * les choisit. Tout est du HTML statique : pas de détection, pas de
 * redirection selon le navigateur, pas de JavaScript pour lire une autre
 * langue.
 *
 * L'ordre de cette liste est celui du sélecteur.
 */
export const LOCALES = ["en", "it", "fr", "es"] as const;
export type Locale = (typeof LOCALES)[number];
/** La langue de la racine, et celle que l'on sert à qui n'a rien choisi. */
export const DEFAULT_LOCALE: Locale = "en";

export type Dict = typeof en;
const DICTS: Record<Locale, Dict> = { en, it, fr, es };

/** Le dictionnaire d'une langue. Lu au build : rien n'en part au client sans y être envoyé. */
export const t = (lang: Locale): Dict => DICTS[lang];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  it: "Italiano",
  fr: "Français",
  es: "Español",
};

/** Les locales passées à Intl pour les dates. */
export const INTL: Record<Locale, string> = {
  en: "en-GB",
  it: "it-IT",
  fr: "fr-FR",
  es: "es-ES",
};

export const OG_LOCALE: Record<Locale, string> = {
  en: "en_GB",
  it: "it_IT",
  fr: "fr_FR",
  es: "es_ES",
};

/** Les pages qui existent dans les quatre langues. */
export type RouteKey = "home" | "programme" | "team" | "join";

const PATHS: Record<RouteKey | "event", Record<Locale, string>> = {
  home: { en: "/", it: "/it/", fr: "/fr/", es: "/es/" },
  programme: {
    en: "/events/",
    it: "/it/programma/",
    fr: "/fr/programme/",
    es: "/es/programa/",
  },
  event: { en: "/events/", it: "/it/eventi/", fr: "/fr/evenements/", es: "/es/eventos/" },
  team: { en: "/team/", it: "/it/team/", fr: "/fr/equipe/", es: "/es/equipo/" },
  join: { en: "/join/", it: "/it/unisciti/", fr: "/fr/rejoindre/", es: "/es/unete/" },
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

/**
 * La canonical et les hreflang d'une page : Google relie ainsi ses quatre
 * versions. `x-default` — ce qu'il sert à qui ne parle aucune d'elles —
 * est l'anglais.
 */
export function alternates(page: PageRef, lang: Locale) {
  return {
    canonical: pagePath(page, lang),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, pagePath(page, l)])),
      "x-default": pagePath(page, DEFAULT_LOCALE),
    },
  };
}

/** Remplace {n}, {date}, {names}… dans une chaîne du dictionnaire. */
export const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
