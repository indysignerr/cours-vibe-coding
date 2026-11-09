import {
  BUILD_LAB_DATES,
  dateParts,
  getEvents,
  shortDate,
  timeRange,
  type Audience,
  type FormatKey,
} from "@/lib/events";
import { eventHref, fill, t, type Locale } from "@/lib/i18n";

/**
 * Le calendrier, préparé pour l'affichage.
 *
 * La frise est un composant client (elle filtre, et elle recalcule
 * « passé » avec la date du navigateur). On lui passe donc des chaînes
 * déjà traduites et déjà formatées : ni dictionnaire ni Intl ne partent
 * dans le JavaScript de la page.
 */
export type TimelineItem = {
  slug: string;
  href: string;
  title: string;
  formatKey: FormatKey;
  format: string;
  audience: Audience;
  audienceLabel: string;
  date: string;
  endDate?: string;
  /** « 21 », ou « 25–31 » pour une date à fixer dans la semaine. */
  day: string;
  month: string;
  year: string;
  weekday: string;
  time: string;
  place: string;
  placeKind: "tbc" | "online" | "place";
  seats?: string;
  backup?: string;
  /** Les dates suivantes du Build Lab, sur sa propre ligne. */
  then?: { label: string; dates: string[] };
};

export type TimelineLabels = {
  filterLabel: string;
  all: string;
  open: string;
  members: string;
  past: string;
  next: string;
  shown: string;
  none: string;
  formatLabel: string;
  formatAll: string;
  formats: { key: FormatKey; label: string }[];
};

export function timelineItems(lang: Locale): TimelineItem[] {
  const d = t(lang);
  return getEvents(lang)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => {
      const p = dateParts(e.date, lang);
      const endDay = e.endDate ? dateParts(e.endDate, lang).day : null;
      return {
        slug: e.slug,
        href: eventHref(e.slug, lang),
        title: e.title,
        formatKey: e.formatKey,
        format: e.format,
        audience: e.audience,
        audienceLabel: e.audienceLabel,
        date: e.date,
        endDate: e.endDate,
        day: endDay ? `${p.day}–${endDay}` : p.day,
        month: p.month,
        year: p.year,
        weekday: e.endDate ? "" : p.weekday,
        time: timeRange(e),
        place: e.online ? d.timeline.online : (e.location ?? d.timeline.tbc),
        placeKind: e.online ? "online" : e.location ? "place" : "tbc",
        seats: e.capacity ? fill(d.timeline.seats, { n: e.capacity }) : undefined,
        backup: e.backup
          ? fill(d.timeline.backup, { date: shortDate(e.backup, lang) })
          : undefined,
        then:
          e.formatKey === "build-lab"
            ? {
                label: d.timeline.buildLabThen,
                dates: BUILD_LAB_DATES.map((x) => shortDate(x, lang)),
              }
            : undefined,
      };
    });
}

export function timelineLabels(lang: Locale): TimelineLabels {
  const d = t(lang);
  const order: FormatKey[] = [
    "workshop",
    "crash-course",
    "build-lab",
    "tournament",
    "open-event",
  ];
  return {
    filterLabel: d.timeline.filterLabel,
    all: d.timeline.all,
    open: d.timeline.open,
    members: d.timeline.members,
    past: d.timeline.past,
    next: d.timeline.next,
    shown: d.timeline.shown,
    none: d.programme.none,
    formatLabel: d.programme.formatLabel,
    formatAll: d.programme.formatAll,
    formats: order.map((key) => ({ key, label: d.formats[key] })),
  };
}
