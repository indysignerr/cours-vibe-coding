import { SITE } from "@/lib/site";

/**
 * Le programme d'évènements.
 *
 * C'EST ICI QU'ON ÉDITE. Les dates vivent dans le dépôt pour que l'affiche
 * soit lisible sans compte et indexable par Google. Les inscriptions, elles,
 * vivent dans Supabase : le `slug` ci-dessous est la clé commune, identique
 * à supabase/007_events.sql. Changer un slug ici sans le changer là-bas
 * casse l'inscription de cet évènement, et rien d'autre.
 */
export type EventKind = "hackathon" | "workshop" | "talk" | "company";

export type SiteEvent = {
  slug: string;
  kind: EventKind;
  title: string;
  /** La promesse en une phrase, à la première personne du pluriel. */
  summary: string;
  /** AAAA-MM-JJ */
  date: string;
  /** AAAA-MM-JJ, pour un évènement qui court sur plusieurs jours. */
  endDate?: string;
  /** HH:MM */
  start: string;
  end: string;
  location: string;
  /** Jauge annoncée. null quand il n'y en a pas. */
  capacity: number | null;
  /** À qui ça s'adresse, dit franchement. */
  audience: string;
  /** Ce qu'on en repart avec. Trois lignes au plus. */
  takeaways: string[];
  /** Ce qu'il faut apporter, le cas échéant. */
  bring?: string;
};

export const EVENT_KINDS: Record<EventKind, { label: string; blurb: string }> = {
  hackathon: {
    label: "Hackathon",
    blurb: "A weekend, teams of three, one theme, something that runs at the end.",
  },
  workshop: {
    label: "Workshop",
    blurb: "Three hours on one tool. You leave with it working on your own machine.",
  },
  talk: {
    label: "Talk",
    blurb: "One speaker, one hour, open to the whole campus.",
  },
  company: {
    label: "For companies",
    blurb: "Where directors see what students actually ship, and ask us the awkward questions.",
  },
};

export const EVENTS: SiteEvent[] = [
  {
    slug: "hackathon-ship-in-24",
    kind: "hackathon",
    title: "Ship in 24",
    summary:
      "Twenty-four hours, teams of three, one brief handed out at the start. At 6 p.m. on Sunday everything is demonstrated live, from a public URL, or it does not count.",
    date: "2026-11-21",
    endDate: "2026-11-22",
    start: "10:00",
    end: "18:00",
    location: `${SITE.school}, ${SITE.campus}`,
    capacity: 60,
    audience: "Open to everyone on campus. No code experience assumed — half the room never has.",
    takeaways: [
      "One thing that works, on a public URL, with your name on it.",
      "A team of three you did not know on Friday.",
      "The habit of cutting scope until something ships.",
    ],
    bring: "A laptop and your own AI subscription. We bring the rest, and the food.",
  },
  {
    slug: "workshop-idea-to-url",
    kind: "workshop",
    title: "From an idea to a live URL",
    summary:
      "Three hours, from an empty folder to a page anyone in the world can open. We do it together, on your machine, and you leave with it working.",
    date: "2026-11-05",
    start: "18:00",
    end: "21:00",
    location: `${SITE.school}, ${SITE.campus}`,
    capacity: 25,
    audience: "Beginners first. If you have already deployed something, come to the hackathon instead.",
    takeaways: [
      "A working environment: editor, agent, version control.",
      "One page of your own, live, opened from your phone.",
      "The two commands you will use every time after that.",
    ],
    bring: "A laptop. Any operating system.",
  },
  {
    slug: "talk-what-the-law-says",
    kind: "talk",
    title: "What the law actually says about AI at work",
    summary:
      "An hour on the three texts that decide whether a company may use the tools its staff are already using — and why getting it wrong in Italy is a criminal matter, not a fine.",
    date: "2026-12-03",
    start: "19:00",
    end: "20:00",
    location: `${SITE.school}, ${SITE.campus}`,
    capacity: 100,
    audience: "Open to the whole campus, and to anyone from a company who wants to come.",
    takeaways: [
      "Why it is the capability that triggers the rule, not the tool.",
      "What a works council can and cannot block, country by country.",
      "The one question to ask your own employer on Monday.",
    ],
  },
  {
    slug: "company-demo-night",
    kind: "company",
    title: "Demo night",
    summary:
      "Students show what they built, directors say whether they would have paid for it, and nobody shows a slide. The honest version of our credentials.",
    date: "2027-02-11",
    start: "18:30",
    end: "21:30",
    location: `${SITE.school}, ${SITE.campus}`,
    capacity: 80,
    audience: "Companies, students, and anyone deciding whether to work with us.",
    takeaways: [
      "Eight projects, four minutes each, questions allowed.",
      "A straight answer on what a student team can and cannot deliver.",
      "The people who would actually do your work, in the room.",
    ],
  },
];

/** Les évènements encore à venir, les plus proches d'abord. */
export function upcoming(from = new Date()): SiteEvent[] {
  const today = from.toISOString().slice(0, 10);
  return EVENTS.filter((e) => (e.endDate ?? e.date) >= today).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

/** Les évènements passés, les plus récents d'abord. */
export function past(from = new Date()): SiteEvent[] {
  const today = from.toISOString().slice(0, 10);
  return EVENTS.filter((e) => (e.endDate ?? e.date) < today).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

/** « 2026-11-21 » → « Saturday 21 November 2026 ». */
export function readableDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** « 21–22 November 2026 » pour un évènement sur deux jours, sinon la date longue. */
export function readableSpan(e: SiteEvent) {
  if (!e.endDate) return readableDate(e.date);
  const d1 = new Date(`${e.date}T12:00:00Z`);
  const d2 = new Date(`${e.endDate}T12:00:00Z`);
  const month = (d: Date) => d.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
  const sameMonth = month(d1) === month(d2);
  return sameMonth
    ? `${d1.getUTCDate()}–${d2.getUTCDate()} ${month(d2)} ${d2.getUTCFullYear()}`
    : `${d1.getUTCDate()} ${month(d1)} – ${d2.getUTCDate()} ${month(d2)} ${d2.getUTCFullYear()}`;
}
