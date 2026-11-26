"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { BrandMark } from "@/components/brand";
import type { TimelineItem, TimelineLabels } from "@/lib/timeline";

/**
 * Le calendrier : une carte de niveaux.
 *
 * Chaque événement est une case numérotée, et un chemin les relie dans
 * l'ordre des dates, en serpentant d'un rang à l'autre. Ce qui est passé
 * est derrière soi (case estompée, chemin plein), le prochain événement
 * est la case à l'encre, avec l'ampoule posée dessus, et le reste de
 * l'année est devant (chemin en tirets).
 *
 * Le même composant sert sur l'accueil et sur la page Événements, où il
 * prend en plus les filtres : une case filtrée s'estompe et sort de la
 * navigation au clavier, mais reste à sa place, pour que le chemin ne se
 * rompe pas.
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
export const useDay = (buildDay: string) => useSyncExternalStore(noop, browserDay, () => buildDay);

export const isPast = (it: Pick<TimelineItem, "date" | "endDate">, day: string) =>
  (it.endDate ?? it.date) < day;

type Who = "all" | "open" | "members";

export function EventPath({
  items,
  labels,
  buildDay,
  filters = false,
  heading = "h3",
}: {
  items: TimelineItem[];
  labels: TimelineLabels;
  /** Le jour du build, pour que le premier rendu du navigateur soit identique au HTML. */
  buildDay: string;
  /** Les filtres par public et par format : la page Événements. */
  filters?: boolean;
  /** Le niveau de titre d'une date : h3 sous le h2 de l'accueil, h2 sur la page Événements. */
  heading?: "h2" | "h3";
}) {
  const Title = heading;
  const day = useDay(buildDay);
  const [who, setWho] = useState<Who>("all");
  const [format, setFormat] = useState<string>("all");

  const nextSlug = items.find((it) => !isPast(it, day))?.slug;
  const matches = (it: TimelineItem) =>
    (who === "all" || it.audience === who) && (format === "all" || it.formatKey === format);
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
            {shown === 0 ? labels.none : labels.shown.replace("{n}", String(shown))}
          </p>
        </div>
      ) : null}

      <ol className="path">
        {items.map((it, i) => {
          const past = isPast(it, day);
          const next = it.slug === nextSlug;
          const off = !matches(it);
          const cls = [
            "stop",
            past ? "is-past" : "",
            next ? "is-next on-navy" : "",
            off ? "is-off" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <li key={it.slug} className={cls} inert={off}>
              <span className="stop__n" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              {next ? (
                <BrandMark className="stop__here" outline="var(--ink)" glyph="var(--brand)" />
              ) : null}
              <div className="stop__date">
                <time dateTime={it.date}>
                  <span className="stop__day">{it.day}</span>{" "}
                  <span className="stop__mon">
                    {it.month} {it.year}
                  </span>
                </time>
                {it.weekday || it.time ? (
                  <span className="stop__when">
                    {[it.weekday, it.time].filter(Boolean).join(" · ")}
                  </span>
                ) : null}
              </div>
              <Title className="stop__title">
                {/* Pas de préchargement : une page d'événement tire avec elle le
                    client des inscriptions, et la carte en compte dix. */}
                <Link className="stop__link" href={it.href} prefetch={false}>
                  {it.title}
                </Link>
              </Title>
              <p className="stop__badges">
                {past ? (
                  <span className="badge badge--past">{labels.past}</span>
                ) : next ? (
                  <span className="badge badge--next">{labels.next}</span>
                ) : null}
                <span className={`badge badge--${it.audience}`}>{it.audienceLabel}</span>
                <span className="badge badge--format">{it.format}</span>
              </p>
              <p className={`stop__place stop__place--${it.placeKind}`}>
                {[it.place, it.seats, it.backup].filter(Boolean).join(" · ")}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
