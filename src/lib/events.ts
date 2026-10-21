import { contestEvents, dateOfWeekday, peerHour, type CalendarEvent } from "@/lib/calendar";
import { SITE } from "@/lib/site";

/**
 * Les évènements affichés sur /events/.
 *
 * Les dates vivent dans le dépôt pour que l'affiche soit lisible sans
 * compte et indexable. Les inscriptions, elles, vivent dans Supabase :
 * le `slug` ci-dessous est la clé commune, identique à supabase/006_events.sql.
 */
export type SiteEvent = CalendarEvent & {
  slug: string;
  kind: "peer-hour" | "contest" | "demo-day";
  /** Jauge annoncée, null quand il n'y en a pas. */
  capacity: number | null;
  /** Une phrase qui dit à qui l'évènement s'adresse. */
  audience: string;
};

export function siteEvents(): SiteEvent[] {
  const weekly = peerHour();
  const contests = contestEvents();
  const last = contests[contests.length - 1];

  return [
    {
      ...weekly,
      slug: "peer-hour-weekly",
      kind: "peer-hour",
      capacity: 30,
      audience: `Members and anyone at ${SITE.school} thinking about joining.`,
    },
    ...contests.slice(0, 2).map((c, i) => ({
      ...c,
      slug: `contest-${i + 1}`,
      kind: "contest" as const,
      capacity: null,
      audience: "Members only. Submissions go through the app.",
    })),
    {
      slug: "demo-day",
      kind: "demo-day",
      title: `${SITE.name} — Demo Day`,
      date: dateOfWeekday(last.date, "Sunday"),
      start: "18:00",
      end: "21:00",
      location: SITE.weekly.location,
      details: "Your project, presented to a jury, in four minutes.",
      capacity: 80,
      audience: "Open to everyone, including companies. This is the one to come to.",
    },
  ];
}

/** « 2026-10-11 » → « Sunday 11 October 2026 ». */
export function readableDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
