import type { Pillar } from "@/lib/pillars";

/**
 * Le calendrier 2026/27.
 *
 * RÈGLE DE CE FICHIER : rien ici n'est inventé. Chaque champ vient du
 * plan annuel. Quand le plan ne dit pas, le champ est absent et le site
 * affiche « To be confirmed » — jamais une valeur plausible.
 *
 * Le plan donne, pour chaque date : le nom, le pilier, le public, le
 * responsable, et l'heure quand elle est arrêtée. Il ne donne ni les
 * salles, ni les jauges (sauf Codemotion, « 10–30 people »), ni de
 * déroulé heure par heure. Ces champs ont donc disparu.
 *
 * Les inscriptions vivent dans Supabase : le `slug` est la clé commune,
 * identique à supabase/007_events.sql.
 */
export type EventKind = Pillar["key"];

export type SiteEvent = {
  slug: string;
  kind: EventKind;
  /** Le format, tel que nommé dans le plan. */
  format: string;
  title: string;
  /** Ce que le plan dit de l'évènement. Rien de plus. */
  summary: string;
  /** AAAA-MM-JJ. Absent quand le plan dit « TBC ». */
  date: string;
  endDate?: string;
  /** HH:MM, seulement quand le plan fixe l'heure. */
  start?: string;
  end?: string;
  /** Seulement quand le plan nomme le lieu. */
  location?: string;
  audience: "Open to all" | "Members";
  /** Seulement quand le plan donne une jauge. */
  capacity?: number | null;
  /** Qui porte l'évènement, dans les mots du plan. */
  lead: string;
  partner?: string;
  /** Ce que le plan liste comme travail à faire avant. */
  prep?: string;
  /** Une date de repli, quand le plan en réserve une. */
  backup?: string;
};

export const EVENTS: SiteEvent[] = [
  {
    slug: "ai-discovery-day-maggiore",
    kind: "connect",
    format: "Big open event",
    title: "AI Discovery Day, Lake Maggiore",
    summary:
      "A one to two hour session Albert School asked us to run, on entrepreneurship with some data and AI.",
    date: "2026-11-07",
    location: "Lake Maggiore",
    audience: "Open to all",
    lead: "Whoever is already on it",
    partner: "Albert School",
  },
  {
    slug: "tournament-1",
    kind: "compete",
    format: "Vibe coding tournament",
    title: "Vibe coding tournament #1",
    summary: "The first tournament of the year, and the start of the calendar.",
    date: "2026-11-21",
    start: "14:00",
    end: "18:00",
    audience: "Members",
    lead: "To assign",
    prep: "Room, theme, jury and prizes, then sign-ups open.",
  },
  {
    slug: "codemotion-llms-python",
    kind: "learn",
    format: "Workshop",
    title: "Codemotion × Albert LIGHT: LLMs in Python",
    summary:
      "A half day on large language models in Python, prepared with Leonardo Ciabattini. Attendees get a certificate.",
    date: "2026-12-05",
    start: "10:00",
    end: "14:00",
    audience: "Open to all",
    capacity: 30,
    lead: "Benjamin",
    partner: "Codemotion",
    backup: "2026-12-12",
  },
  {
    slug: "build-lab-1",
    kind: "build",
    format: "Build Lab",
    title: "Build Lab #1",
    summary:
      "The first Build Lab. One fixed room and time, with an experienced member there each session.",
    date: "2026-12-15",
    audience: "Members",
    lead: "Rotates",
  },
  {
    slug: "crash-course-1",
    kind: "learn",
    format: "Crash course",
    title: "Crash course #1: AI coding tools speedrun and API keys",
    summary: "An online evening on AI coding tools and API keys.",
    date: "2027-01-14",
    start: "18:30",
    audience: "Open to all",
    lead: "To assign",
  },
  {
    slug: "cinema-night",
    kind: "connect",
    format: "Big open event",
    title: "Cinema night: Artificial, and a discussion after",
    summary:
      "A screening of Artificial with a discussion after it, open to other universities. The film opens in Italy on 20 January 2027, distributed by I Wonder Pictures.",
    date: "2027-01-25",
    endDate: "2027-01-31",
    audience: "Open to all",
    lead: "To assign, with Floriano's team",
  },
  {
    slug: "tournament-2",
    kind: "compete",
    format: "Vibe coding tournament",
    title: "Vibe coding tournament #2",
    summary: "The second tournament of the year.",
    date: "2027-02-13",
    audience: "Members",
    lead: "To assign",
    prep: "Room, theme, jury and prizes, then sign-ups open.",
  },
  {
    slug: "crash-course-2",
    kind: "learn",
    format: "Crash course",
    title: "Crash course #2: Docker and CI/CD",
    summary: "An online evening on Docker and CI/CD.",
    date: "2027-02-25",
    start: "18:30",
    audience: "Open to all",
    lead: "To assign",
  },
  {
    slug: "crash-course-3",
    kind: "learn",
    format: "Crash course",
    title: "Crash course #3: cloud credits for student projects",
    summary:
      "An online evening on getting and using cloud credits for student projects.",
    date: "2027-03-11",
    start: "18:30",
    audience: "Open to all",
    lead: "To assign",
  },
  {
    slug: "demo-day",
    kind: "connect",
    format: "Big open event",
    title: "Demo Day",
    summary: "Members show what they built this year.",
    date: "2027-05-15",
    audience: "Open to all",
    lead: "To assign",
  },
];

export const BUILD_LAB_DATES = [
  "2027-01-12",
  "2027-01-26",
  "2027-02-09",
  "2027-02-23",
  "2027-03-09",
  "2027-03-23",
  "2027-04-06",
  "2027-04-20",
  "2027-05-04",
  "2027-05-18",
];

export const upcoming = (from = new Date()) => {
  const today = from.toISOString().slice(0, 10);
  return EVENTS.filter((e) => (e.endDate ?? e.date) >= today).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
};

export const past = (from = new Date()) => {
  const today = from.toISOString().slice(0, 10);
  return EVENTS.filter((e) => (e.endDate ?? e.date) < today).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
};

export function readableDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function readableSpan(e: SiteEvent) {
  if (!e.endDate) return readableDate(e.date);
  const d1 = new Date(`${e.date}T12:00:00Z`);
  const d2 = new Date(`${e.endDate}T12:00:00Z`);
  const month = (d: Date) =>
    d.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
  return month(d1) === month(d2)
    ? `${d1.getUTCDate()}–${d2.getUTCDate()} ${month(d2)} ${d2.getUTCFullYear()}`
    : `${d1.getUTCDate()} ${month(d1)} – ${d2.getUTCDate()} ${month(d2)} ${d2.getUTCFullYear()}`;
}

/** « Sat 21 Nov », pour les listes denses. */
export function shortDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}
