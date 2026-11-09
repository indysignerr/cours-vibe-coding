import data from "@content/events.json";
import { INTL, t, type Locale } from "@/lib/i18n";
import type { PillarKey } from "@/lib/pillars";

/**
 * Le calendrier 2026/27, lu dans content/events.json.
 *
 * RÈGLE : rien ici n'est inventé. Chaque champ vient du plan annuel.
 * Quand le plan ne dit pas, le champ est absent et le site affiche
 * « lieu à confirmer » — jamais une valeur plausible.
 *
 * Les inscriptions vivent dans Supabase : le `slug` est la clé commune,
 * identique à supabase/007_events.sql. Il ne change jamais.
 */
export type EventKind = PillarKey;
export type FormatKey =
  | "workshop"
  | "crash-course"
  | "build-lab"
  | "tournament"
  | "open-event";
export type Audience = "open" | "members";

export type SiteEvent = {
  slug: string;
  kind: EventKind;
  formatKey: FormatKey;
  /** Le format, dans la langue demandée. */
  format: string;
  title: string;
  summary: string;
  /** AAAA-MM-JJ. */
  date: string;
  endDate?: string;
  /** HH:MM, seulement quand le plan fixe l'heure. */
  start?: string;
  end?: string;
  /** Seulement quand le plan nomme le lieu. */
  location?: string;
  online: boolean;
  audience: Audience;
  audienceLabel: string;
  /** Seulement quand le plan donne une jauge. */
  capacity: number | null;
  partner?: string;
  /** Une date de repli, quand le plan en réserve une. */
  backup?: string;
  /** Les photos, une fois l'événement passé. */
  gallery: string[];
};

export function getEvents(lang: Locale = "en"): SiteEvent[] {
  const d = t(lang);
  return data.events.map((e) => ({
    slug: e.slug,
    kind: e.pillar as EventKind,
    formatKey: e.format as FormatKey,
    format: d.formats[e.format as FormatKey],
    title: e.title[lang],
    summary: e.summary[lang],
    date: e.date,
    endDate: e.endDate ?? undefined,
    start: e.start ?? undefined,
    end: e.end ?? undefined,
    location: e.location ? e.location[lang] : undefined,
    online: e.online,
    audience: e.audience as Audience,
    audienceLabel: d.audience[e.audience as Audience],
    capacity: e.capacity,
    partner: e.partner ?? undefined,
    backup: e.backup ?? undefined,
    gallery: e.gallery as string[],
  }));
}

/** En anglais : pour le tableau des inscriptions, le plan du site, le fichier .ics. */
export const EVENTS = getEvents("en");

export const BUILD_LAB_FIRST = data.buildLab.first;
export const BUILD_LAB_DATES = data.buildLab.dates;

/** Le jour du build, AAAA-MM-JJ. Le navigateur recalcule le sien. */
export const today = (from = new Date()) => from.toISOString().slice(0, 10);

export const isPast = (e: Pick<SiteEvent, "date" | "endDate">, day = today()) =>
  (e.endDate ?? e.date) < day;

export const upcoming = (lang: Locale = "en", day = today()) =>
  getEvents(lang)
    .filter((e) => !isPast(e, day))
    .sort((a, b) => a.date.localeCompare(b.date));

export const past = (lang: Locale = "en", day = today()) =>
  getEvents(lang)
    .filter((e) => isPast(e, day))
    .sort((a, b) => b.date.localeCompare(a.date));

const at = (date: string) => new Date(`${date}T12:00:00Z`);

/** « Saturday 21 November 2026 ». */
export function readableDate(date: string, lang: Locale = "en") {
  return at(date).toLocaleDateString(INTL[lang], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Une date, ou une plage quand l'événement tombe « dans la semaine du ». */
export function readableSpan(
  e: Pick<SiteEvent, "date" | "endDate">,
  lang: Locale = "en",
) {
  if (!e.endDate) return readableDate(e.date, lang);
  const d1 = at(e.date);
  const d2 = at(e.endDate);
  const month = (d: Date) =>
    d.toLocaleDateString(INTL[lang], { month: "long", timeZone: "UTC" });
  return month(d1) === month(d2)
    ? `${d1.getUTCDate()}–${d2.getUTCDate()} ${month(d2)} ${d2.getUTCFullYear()}`
    : `${d1.getUTCDate()} ${month(d1)} – ${d2.getUTCDate()} ${month(d2)} ${d2.getUTCFullYear()}`;
}

/** « Sat 21 Nov », pour les listes denses. */
export function shortDate(date: string, lang: Locale = "en") {
  return at(date).toLocaleDateString(INTL[lang], {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/** Le jour, le mois et l'année séparés, pour les dates dessinées en grand. */
export function dateParts(date: string, lang: Locale = "en") {
  const d = at(date);
  return {
    day: String(d.getUTCDate()).padStart(2, "0"),
    month: d.toLocaleDateString(INTL[lang], { month: "short", timeZone: "UTC" }),
    monthLong: d.toLocaleDateString(INTL[lang], { month: "long", timeZone: "UTC" }),
    weekday: d.toLocaleDateString(INTL[lang], { weekday: "long", timeZone: "UTC" }),
    year: String(d.getUTCFullYear()),
  };
}

/** « 14:00–18:00 », « 18:30 », ou rien. */
export const timeRange = (e: Pick<SiteEvent, "start" | "end">) =>
  e.start ? `${e.start}${e.end ? `–${e.end}` : ""}` : "";

/**
 * L'instant de début, en millisecondes, dans le fuseau de Milan.
 *
 * Le décalage est lu pour LA date concernée : +01:00 en hiver, +02:00
 * après le dernier dimanche de mars. Sans heure arrêtée, la cible est minuit.
 */
export function eventStartMs(e: Pick<SiteEvent, "date" | "start">): number {
  const time = e.start ?? "00:00";
  const naive = new Date(`${e.date}T${time}:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Rome",
    timeZoneName: "longOffset",
  }).formatToParts(naive);
  const label =
    parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+01:00";
  const m = label.match(/([+-])(\d{2}):(\d{2})/);
  const minutes = m
    ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]))
    : 60;
  return naive.getTime() - minutes * 60_000;
}
