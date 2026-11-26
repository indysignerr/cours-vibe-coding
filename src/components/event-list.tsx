"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import type { TimelineItem, TimelineLabels } from "@/lib/timeline";

/**
 * Le calendrier : une liste réglée, une ligne par date.
 *
 * Le même composant sert trois fois : sur l'accueil (les prochaines
 * dates), sur la page Événements (toute l'année, avec les filtres) et
 * dans le haut de page (le prochain événement, voir NextEvent).
 *
 * Deux précautions :
 *   — sans JavaScript tout est affiché, les filtres ne font simplement
 *     rien : aucune date n'est cachée par défaut ;
 *   — « passé » et « prochain » sont recalculés avec la date du
 *     navigateur. Le site est statique : sans cela, un événement resterait
 *     « à venir » jusqu'au prochain déploiement.
 */
const noop = () => () => {};
const browserDay = () => new Date().toISOString().slice(0, 10);

/** Le jour courant : celui du build au premier rendu, puis celui du navigateur. */
export const useDay = (buildDay: string) =>
  useSyncExternalStore(noop, browserDay, () => buildDay);

export const isPast = (it: Pick<TimelineItem, "date" | "endDate">, day: string) =>
  (it.endDate ?? it.date) < day;

type Who = "all" | "open" | "members";

export function EventList({
  items,
  labels,
  buildDay,
  filters = false,
  upcomingOnly = false,
  limit,
  heading = "h3",
}: {
  items: TimelineItem[];
  labels: TimelineLabels;
  /** Le jour du build, pour que le premier rendu du navigateur soit identique au HTML. */
  buildDay: string;
  /** Les filtres par public et par format : la page Événements. */
  filters?: boolean;
  /** Ne montrer que ce qui vient : l'accueil. */
  upcomingOnly?: boolean;
  limit?: number;
  /** Le niveau de titre d'une date : h3 sous le h2 de l'accueil, h2 sur la page Événements. */
  heading?: "h2" | "h3";
}) {
  const Title = heading;
  const day = useDay(buildDay);
  const [who, setWho] = useState<Who>("all");
  const [format, setFormat] = useState<string>("all");

  const coming = items.filter((it) => !isPast(it, day));
  const gone = items.filter((it) => isPast(it, day)).reverse();
  const nextSlug = coming[0]?.slug;
  const matches = (it: TimelineItem) =>
    (who === "all" || it.audience === who) &&
    (format === "all" || it.formatKey === format);

  const row = (it: TimelineItem, past: boolean) => (
    <li key={it.slug} className={past ? "ev is-past" : "ev"} hidden={!matches(it)}>
      <div className="ev__date">
        <time dateTime={it.date}>
          <span className="ev__day">{it.day}</span>
          <span className="ev__mon">
            {it.month} {it.year}
          </span>
        </time>
        {it.weekday || it.time ? (
          <span className="ev__when">{[it.weekday, it.time].filter(Boolean).join(" · ")}</span>
        ) : null}
      </div>
      <div className="ev__main">
        <p className="ev__badges">
          {past ? (
            <span className="badge badge--past">{labels.past}</span>
          ) : it.slug === nextSlug ? (
            <span className="badge badge--next">{labels.next}</span>
          ) : null}
          <span className={`badge badge--${it.audience}`}>{it.audienceLabel}</span>
          <span className="badge badge--format">{it.format}</span>
        </p>
        <Title className="ev__title">
          {/* Pas de préchargement : une page d'événement tire avec elle le
              client des inscriptions, et la liste en compte dix. */}
          <Link className="ev__link" href={it.href} prefetch={false}>
            {it.title}
          </Link>
        </Title>
        {it.then ? (
          <p className="ev__then">
            {it.then.label} {it.then.dates.join(" · ")}
          </p>
        ) : null}
      </div>
      <p className={`ev__place ev__place--${it.placeKind}`}>
        {[it.place, it.seats, it.backup].filter(Boolean).join(" · ")}
      </p>
    </li>
  );

  if (upcomingOnly) {
    const list = limit ? coming.slice(0, limit) : coming;
    return list.length === 0 ? (
      <p className="ev__none">{labels.noneSoon}</p>
    ) : (
      <ol className="evlist">{list.map((it) => row(it, false))}</ol>
    );
  }

  const shown = items.filter(matches).length;
  const chip = (key: string, label: string, on: boolean, pick: () => void) => (
    <button key={key} type="button" className="chip" aria-pressed={on} onClick={pick}>
      {label}
    </button>
  );

  return (
    <div>
      {filters ? (
        <div className="filters">
          <div className="filters__group" role="group" aria-label={labels.filterLabel}>
            {(["all", "open", "members"] as Who[]).map((key) =>
              chip(key, labels[key], who === key, () => setWho(key)),
            )}
          </div>
          <div className="filters__group" role="group" aria-label={labels.formatLabel}>
            {chip("all", labels.formatAll, format === "all", () => setFormat("all"))}
            {labels.formats.map((f) =>
              chip(f.key, f.label, format === f.key, () => setFormat(f.key)),
            )}
          </div>
          <p className="filters__count" aria-live="polite">
            {labels.shown.replace("{n}", String(shown))}
          </p>
        </div>
      ) : null}

      {coming.some(matches) ? (
        <section className="evgroup" aria-labelledby="ev-coming">
          <p className="eyebrow evgroup__title" id="ev-coming">
            {labels.upcoming}
          </p>
          <ol className="evlist">{coming.map((it) => row(it, false))}</ol>
        </section>
      ) : null}
      {gone.some(matches) ? (
        <section className="evgroup" aria-labelledby="ev-gone">
          <p className="eyebrow evgroup__title" id="ev-gone">
            {labels.pastTitle}
          </p>
          <ol className="evlist">{gone.map((it) => row(it, true))}</ol>
        </section>
      ) : null}

      {shown === 0 ? <p className="ev__none">{labels.none}</p> : null}
    </div>
  );
}
