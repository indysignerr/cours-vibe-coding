import type { SiteEvent } from "@/lib/events";
import { SITE } from "@/lib/site";

/**
 * Google Agenda sans serveur.
 *
 * L'export est statique : aucun appel d'API, aucune clé. On s'appuie sur
 * trois URL publiques de Google — le gabarit d'évènement, l'abonnement à
 * un agenda, l'intégration en iframe — et sur un fichier .ics généré au
 * build pour tous ceux qui ne sont pas chez Google.
 */

/** « 2026-11-21 » + « 18:00 » → « 20261121T180000 », l'heure locale attendue avec ctz. */
export function stamp(date: string, time: string) {
  return `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
}

/** Le lien « Ajouter à Google Agenda ». Ouvre le formulaire pré-rempli. */
export function googleCalendarUrl(e: SiteEvent) {
  const end = e.endDate ?? e.date;
  // Sans horaire arrêté, on crée un évènement « journée entière » : la
  // date de fin d'un all-day est exclusive, d'où le lendemain. Quand le
  // plan donne une fenêtre (« dans la semaine du… »), le bloc couvre toute
  // la fenêtre, comme dans le fichier .ics.
  const allDay = !e.start || !e.end;
  const dates = allDay
    ? `${e.date.replaceAll("-", "")}/${nextDay(end)}`
    : `${stamp(e.date, e.start!)}/${stamp(end, e.end!)}`;

  const params = new URLSearchParams({
    text: `${SITE.name} — ${e.title}`,
    dates,
    ctz: SITE.timezone,
    details: e.summary,
    // Le plan ne nomme pas toujours la salle : on ne met rien plutôt qu'un lieu inventé.
    location: e.location ?? "",
    action: "TEMPLATE",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** AAAA-MM-JJ → AAAAMMJJ du lendemain. */
function nextDay(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replaceAll("-", "");
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
