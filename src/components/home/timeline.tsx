"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { whenMotion } from "@/lib/motion";
import type { TimelineItem, TimelineLabels } from "@/lib/timeline";

/**
 * La frise du calendrier.
 *
 * Un fil vertical, une date par nœud. Au défilement le fil se déroule et
 * les nœuds s'allument à son passage (ScrollFX s'en charge) ; les
 * boutons au-dessus filtrent par public — et par format sur la page
 * Programme.
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

type Who = "all" | "open" | "members";

export function Timeline({
  items,
  labels,
  buildDay,
  formatFilter = false,
  heading = "h3",
}: {
  items: TimelineItem[];
  labels: TimelineLabels;
  /** Le jour du build, pour que le premier rendu du navigateur soit identique au HTML. */
  buildDay: string;
  formatFilter?: boolean;
  /** Le niveau de titre d'une date : h3 sous le h2 de l'accueil, h2 sur la page Programme. */
  heading?: "h2" | "h3";
}) {
  const Title = heading;
  const day = useSyncExternalStore(noop, browserDay, () => buildDay);
  const [who, setWho] = useState<Who>("all");
  const [format, setFormat] = useState<string>("all");

  const isPast = (it: TimelineItem) => (it.endDate ?? it.date) < day;
  const nextSlug = items.find((it) => !isPast(it))?.slug;
  const matches = (it: TimelineItem) =>
    (who === "all" || it.audience === who) &&
    (format === "all" || it.formatKey === format);
  const shown = items.filter(matches).length;

  // La page change de hauteur : les déclencheurs de défilement se recalent.
  const refresh = () =>
    void whenMotion().then(({ ScrollTrigger }) =>
      requestAnimationFrame(() => ScrollTrigger.refresh()),
    );

  return (
    <div className="tl-wrap">
      <div className="filters">
        <div className="filters__group" role="group" aria-label={labels.filterLabel}>
          {(["all", "open", "members"] as Who[]).map((key) => (
            <button
              key={key}
              type="button"
              className="chip"
              aria-pressed={who === key}
              onClick={() => {
                setWho(key);
                refresh();
              }}
            >
              {labels[key]}
            </button>
          ))}
        </div>

        {formatFilter ? (
          <div className="filters__group" role="group" aria-label={labels.formatLabel}>
            <button
              type="button"
              className="chip"
              aria-pressed={format === "all"}
              onClick={() => {
                setFormat("all");
                refresh();
              }}
            >
              {labels.formatAll}
            </button>
            {labels.formats.map((f) => (
              <button
                key={f.key}
                type="button"
                className="chip"
                aria-pressed={format === f.key}
                onClick={() => {
                  setFormat(f.key);
                  refresh();
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}

        <p className="filters__count" aria-live="polite">
          {labels.shown.replace("{n}", String(shown))}
        </p>
      </div>

      <div className="tl" data-rail>
        <span className="tl__rail" aria-hidden />
        <span className="tl__fill" aria-hidden />
        <ol className="tl__list">
          {items.map((it) => {
            const past = isPast(it);
            return (
              <li
                key={it.slug}
                className={`tl__item${past ? " is-past" : ""}${it.slug === nextSlug ? " is-next" : ""}`}
                hidden={!matches(it)}
              >
                <span className="tl__node" aria-hidden />
                <div className="tl__date">
                  <time dateTime={it.date}>
                    <span className="tl__day">{it.day}</span>
                    <span className="tl__mon">
                      {it.month} {it.year}
                    </span>
                  </time>
                  {/* Le jour et l'heure sur deux lignes : sur une seule, la
                      colonne des dates coupait l'horaire en deux. */}
                  {it.weekday ? <span className="tl__when">{it.weekday}</span> : null}
                  {it.time ? <span className="tl__when">{it.time}</span> : null}
                </div>
                <div className="tl__body">
                  <p className="tl__badges">
                    {past ? (
                      <span className="badge badge--past">{labels.past}</span>
                    ) : it.slug === nextSlug ? (
                      <span className="badge badge--next">{labels.next}</span>
                    ) : null}
                    <span className={`badge badge--${it.audience}`}>
                      {it.audienceLabel}
                    </span>
                    <span className="badge badge--format">{it.format}</span>
                  </p>
                  <Title className="tl__title">
                    <Link className="tl__link" href={it.href}>
                      {it.title}
                      <span aria-hidden className="tl__arrow">
                        →
                      </span>
                    </Link>
                  </Title>
                  <p className={`tl__place tl__place--${it.placeKind}`}>
                    {it.place}
                    {it.seats ? ` · ${it.seats}` : ""}
                    {it.backup ? ` · ${it.backup}` : ""}
                  </p>
                  {it.then ? (
                    <p className="tl__then">
                      {it.then.label} <span>{it.then.dates.join(" · ")}</span>
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {shown === 0 ? <p className="tl__none">{labels.none}</p> : null}
    </div>
  );
}
