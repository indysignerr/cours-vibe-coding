"use client";

import Link from "next/link";
import { isPast, useDay } from "@/components/event-path";
import type { TimelineItem } from "@/lib/timeline";

/**
 * Le prochain événement, calculé avec la date du navigateur.
 *
 * Le site est statique : le « prochain » figé au build serait faux dès le
 * lendemain de la date. Le premier rendu reprend le jour du build (le
 * HTML servi et l'hydratation concordent), puis le navigateur corrige.
 */
const when = (it: TimelineItem) =>
  [[it.weekday, it.day, it.month].filter(Boolean).join(" "), it.time].filter(Boolean).join(", ");

/** L'encart du haut de page de l'accueil. */
export function NextEvent({
  label,
  items,
  buildDay,
}: {
  label: string;
  items: TimelineItem[];
  buildDay: string;
}) {
  const day = useDay(buildDay);
  const next = items.find((it) => !isPast(it, day));
  if (!next) return null;

  return (
    <aside className="next rise" style={{ "--i": 4 } as React.CSSProperties} aria-label={label}>
      <p className="eyebrow eyebrow--accent">{label}</p>
      <p className="next__title">
        <Link className="next__link" href={next.href} prefetch={false}>
          {next.title}
        </Link>
      </p>
      <p className="next__meta">
        {[when(next), next.format, next.audienceLabel, next.place].join(" · ")}
      </p>
    </aside>
  );
}

/** Le bouton d'inscription du bloc Rejoindre : il mène à la prochaine date. */
export function NextSignup({
  label,
  items,
  buildDay,
}: {
  label: string;
  items: TimelineItem[];
  buildDay: string;
}) {
  const day = useDay(buildDay);
  const next = items.find((it) => !isPast(it, day));
  if (!next) return null;

  return (
    <Link className="btn" href={next.href} prefetch={false}>
      {label} · {[next.weekday, next.day, next.month].filter(Boolean).join(" ")}
    </Link>
  );
}
