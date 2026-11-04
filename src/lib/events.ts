import type { Pillar } from "@/lib/pillars";

/**
 * Le calendrier 2026/27, tel qu'il figure au plan annuel.
 *
 * C'EST ICI QU'ON ÉDITE. Les dates vivent dans le dépôt pour que
 * l'affiche soit lisible sans compte et indexable. Les inscriptions
 * vivent dans Supabase : le `slug` est la clé commune, identique à
 * supabase/007_events.sql.
 *
 * La promesse du plan — « quelque chose au moins toutes les deux
 * semaines » — n'est vraie que si cette liste reste à jour. Elle est
 * donc la source de la frise comme du compteur.
 */
export type EventKind = Pillar["key"];

export type ScheduleSlot = { at: string; title: string; tag?: string; note?: string };

export type SiteEvent = {
  slug: string;
  kind: EventKind;
  /** Le format, tel que nommé dans le plan. */
  format: string;
  title: string;
  summary: string;
  /** AAAA-MM-JJ */
  date: string;
  endDate?: string;
  /** HH:MM. Vide quand l'heure n'est pas arrêtée. */
  start?: string;
  end?: string;
  location: string;
  /** « Open » ou « Members ». Le plan distingue les deux pour chaque format. */
  audience: "Open to all" | "Members";
  capacity: number | null;
  /** Qui porte l'évènement. « To assign » tant que ce n'est pas tranché. */
  lead: string;
  takeaways?: string[];
  bring?: string;
  partner?: string;
  schedule?: { day: string; date: string; slots: ScheduleSlot[] }[];
};

export const EVENTS: SiteEvent[] = [
  {
    slug: "tournament-1",
    kind: "compete",
    format: "Vibe coding tournament",
    title: "Vibe coding tournament #1",
    summary:
      "Teams race the clock to build a working app under a theme. Four hours, one jury, and whatever you can get an AI model to actually produce.",
    date: "2026-11-21",
    start: "14:00",
    end: "18:00",
    location: "Albert School, Milano",
    audience: "Members",
    capacity: 60,
    lead: "To assign",
    takeaways: [
      "A working thing, built in four hours, with two other people.",
      "The habit of cutting scope until something ships.",
      "A jury telling you what they actually saw.",
    ],
    bring: "A laptop and your own AI subscription. We bring the rest.",
    schedule: [
      {
        day: "Saturday",
        date: "2026-11-21",
        slots: [
          { at: "14:00", title: "Doors, teams of three, and the theme" , tag: "brief" },
          { at: "14:30", title: "Scoping. The half hour that decides your afternoon" },
          { at: "15:00", title: "Build" },
          { at: "16:30", title: "Deploy something, however ugly", tag: "checkpoint", note: "If it is not online by now, cut the scope." },
          { at: "17:30", title: "Hands off the keyboard", tag: "checkpoint" },
          { at: "17:40", title: "Demos to the jury, four minutes each", tag: "demo" },
          { at: "18:00", title: "Prizes, then we go for a drink" },
        ],
      },
    ],
  },
  {
    slug: "codemotion-llms-python",
    kind: "learn",
    format: "Workshop",
    title: "Codemotion × Albert LIGHT: LLMs in Python",
    summary:
      "Build an LLM into your own Python code, properly. Free, hands-on, and you leave with a certificate for your CV.",
    date: "2026-12-05",
    start: "10:00",
    end: "14:00",
    location: "Albert School, Milano",
    audience: "Open to all",
    capacity: 30,
    lead: "Benjamin",
    partner: "Codemotion",
    takeaways: [
      "An LLM wired into code you wrote yourself.",
      "A certificate you can put on your CV.",
      "The people from Codemotion, in the room, for four hours.",
    ],
    bring: "A laptop with Python installed. Beginners welcome.",
    schedule: [
      {
        day: "Saturday",
        date: "2026-12-05",
        slots: [
          { at: "10:00", title: "Set-up check. We fix whatever did not install" },
          { at: "10:30", title: "Calling a model from Python", tag: "workshop" },
          { at: "12:00", title: "Break", tag: "break" },
          { at: "12:15", title: "Making it reliable: keys, errors, cost", tag: "workshop" },
          { at: "13:45", title: "Certificates" },
        ],
      },
    ],
  },
  {
    slug: "build-lab-1",
    kind: "build",
    format: "Build Lab",
    title: "Build Lab #1",
    summary:
      "Bring your own project. An experienced member is there for the hour. That is the whole format.",
    date: "2026-12-15",
    location: "Albert School, Milano",
    audience: "Members",
    capacity: 20,
    lead: "Rotates",
    takeaways: ["One hour where someone unblocks you.", "Every other Tuesday, all year."],
  },
  {
    slug: "crash-course-1",
    kind: "learn",
    format: "Crash course",
    title: "Crash course #1: AI coding tools and API keys",
    summary:
      "A speedrun through Cursor, GitHub Copilot and Claude Code — then how API keys actually work, and how not to leak them.",
    date: "2027-01-14",
    start: "18:30",
    location: "Online",
    audience: "Open to all",
    capacity: null,
    lead: "To assign",
  },
  {
    slug: "cinema-night",
    kind: "connect",
    format: "Big open event",
    title: "Cinema night: Artificial",
    summary:
      "The film, then a panel. Run with other universities in Milan. Artificial opens in Italy on 20 January 2027.",
    date: "2027-01-28",
    location: "Milano",
    audience: "Open to all",
    capacity: 120,
    lead: "To assign",
    partner: "Floriano's team",
    takeaways: [
      "A film worth arguing about.",
      "A panel that argues about it.",
      "Students from other universities, which is rarer than it sounds.",
    ],
  },
  {
    slug: "tournament-2",
    kind: "compete",
    format: "Vibe coding tournament",
    title: "Vibe coding tournament #2",
    summary: "Same format, new theme, and the people who came in November know what they are doing now.",
    date: "2027-02-13",
    start: "14:00",
    end: "18:00",
    location: "Albert School, Milano",
    audience: "Members",
    capacity: 60,
    lead: "To assign",
  },
  {
    slug: "crash-course-2",
    kind: "learn",
    format: "Crash course",
    title: "Crash course #2: Docker and CI/CD",
    summary: "Why your thing works on your machine and nowhere else, and how to stop that being true.",
    date: "2027-02-25",
    start: "18:30",
    location: "Online",
    audience: "Open to all",
    capacity: null,
    lead: "To assign",
  },
  {
    slug: "crash-course-3",
    kind: "learn",
    format: "Crash course",
    title: "Crash course #3: cloud credits for student projects",
    summary: "Where the free compute is, how to get it, and how not to wake up to a bill.",
    date: "2027-03-11",
    start: "18:30",
    location: "Online",
    audience: "Open to all",
    capacity: null,
    lead: "To assign",
  },
  {
    slug: "demo-day",
    kind: "connect",
    format: "Big open event",
    title: "Demo Day",
    summary: "Everything built this year, shown in four minutes a project. The evening the whole year becomes visible.",
    date: "2027-05-15",
    location: "Albert School, Milano",
    audience: "Open to all",
    capacity: 120,
    lead: "To assign",
    takeaways: [
      "A year of work, in one room, in one evening.",
      "Industry guests who came to see it.",
      "The easiest place to meet everyone at once.",
    ],
  },
];

/** Les dates de Build Lab qui suivent la première, une ligne par séance. */
export const BUILD_LAB_DATES = [
  "2027-01-12", "2027-01-26", "2027-02-09", "2027-02-23",
  "2027-03-09", "2027-03-23", "2027-04-06", "2027-04-20",
  "2027-05-04", "2027-05-18",
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
  const month = (d: Date) => d.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
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
