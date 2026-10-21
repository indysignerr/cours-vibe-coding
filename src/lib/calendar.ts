import { CURRICULUM } from "@/lib/curriculum";
import { SITE } from "@/lib/site";

/**
 * Google Agenda sans serveur.
 *
 * L'export est statique : aucun appel d'API, aucune clé. On s'appuie sur
 * trois URL publiques de Google — le gabarit d'évènement, l'abonnement à
 * un agenda, l'intégration en iframe — et sur un fichier .ics généré au
 * build pour tous ceux qui ne sont pas chez Google.
 */

const WEEKDAY: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};
const RRULE_DAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

const pad = (n: number) => String(n).padStart(2, "0");

/** « 2026-09-16 » + « 18:00 » → « 20260916T180000 », l'heure locale attendue avec ctz. */
export function stamp(date: string, time: string) {
  return `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
}

/** Le premier jour de la semaine donnée qui tombe sur le jour voulu. */
export function dateOfWeekday(weekOf: string, weekday: string) {
  const [y, m, d] = weekOf.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  const shift = (WEEKDAY[weekday] - start.getUTCDay() + 7) % 7;
  const out = new Date(start.getTime() + shift * 86_400_000);
  return `${out.getUTCFullYear()}-${pad(out.getUTCMonth() + 1)}-${pad(out.getUTCDate())}`;
}

export type CalendarEvent = {
  title: string;
  date: string;      // AAAA-MM-JJ
  start: string;     // HH:MM
  end: string;       // HH:MM
  details?: string;
  location?: string;
  /** Jour de récurrence hebdomadaire, ex. « Wednesday ». Omis = évènement unique. */
  repeatsOn?: string;
  /** Dernier jour de la récurrence, AAAA-MM-JJ. */
  until?: string;
};

/** Le lien « Ajouter à Google Agenda ». Ouvre le formulaire pré-rempli. */
export function googleCalendarUrl(e: CalendarEvent) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${stamp(e.date, e.start)}/${stamp(e.date, e.end)}`,
    ctz: SITE.timezone,
  });
  if (e.details) params.set("details", e.details);
  if (e.location) params.set("location", e.location);
  if (e.repeatsOn) {
    const until = e.until ? `;UNTIL=${e.until.replaceAll("-", "")}T235959Z` : "";
    params.set("recur", `RRULE:FREQ=WEEKLY;BYDAY=${RRULE_DAY[WEEKDAY[e.repeatsOn]]}${until}`);
  }
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Ajouter l'agenda public de l'association au sien. */
export function subscribeUrl() {
  if (!SITE.calendarId) return null;
  return `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(SITE.calendarId)}`;
}

/** Le flux iCal du même agenda, pour Apple Calendar, Outlook et le reste. */
export function icalFeedUrl() {
  if (!SITE.calendarId) return null;
  return `https://calendar.google.com/calendar/ical/${encodeURIComponent(SITE.calendarId)}/public/basic.ics`;
}

/** L'iframe d'intégration, mois courant, langue anglaise. */
export function embedUrl() {
  if (!SITE.calendarId) return null;
  const params = new URLSearchParams({
    src: SITE.calendarId,
    ctz: SITE.timezone,
    mode: "MONTH",
    showTitle: "0",
    showPrint: "0",
    showCalendars: "0",
    showTz: "0",
    hl: "en",
  });
  return `https://calendar.google.com/calendar/embed?${params}`;
}

/** L'heure d'entraide, en évènement récurrent, du lancement à la Demo Day. */
export function peerHour(): CalendarEvent {
  const last = CURRICULUM[CURRICULUM.length - 1];
  return {
    title: SITE.weekly.title,
    date: dateOfWeekday(SITE.startsWeekOf, SITE.weekly.day),
    start: SITE.weekly.start,
    end: SITE.weekly.end,
    details: SITE.weekly.details,
    location: SITE.weekly.location,
    repeatsOn: SITE.weekly.day,
    until: dateOfWeekday(last.weekOf, SITE.weekly.day),
  };
}

/** Les trois concours, en évènements isolés : ce sont les dates qui comptent. */
export function contestEvents(): (CalendarEvent & { number: number; slug: string })[] {
  return CURRICULUM.filter((e) => e.kind === "contest").map((e) => ({
    number: e.number,
    slug: e.slug,
    title: `${SITE.name} — ${e.title}`,
    date: dateOfWeekday(e.weekOf, "Sunday"),
    start: "20:00",
    end: "23:59",
    details: `${e.promise} Submissions close at midnight.`,
    location: SITE.url,
  }));
}
