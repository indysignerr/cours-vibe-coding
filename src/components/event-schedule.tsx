"use client";

import { useState } from "react";
import type { SiteEvent } from "@/lib/events";
import { readableDate } from "@/lib/events";

/**
 * Le déroulé d'un évènement, heure par heure.
 *
 * Patron repris du programme d'OFFF Forum, primé Site of the Day le
 * 16 octobre 2026 : des onglets de journée, une colonne d'heures, un
 * intitulé par créneau et une étiquette de type. Rien d'exotique — ce
 * qui a été récompensé là-bas, c'est du contenu réel bien mis en scène,
 * pas un effet.
 *
 * L'intérêt n'est pas décoratif : voir à quoi ressemble la journée avant
 * de s'inscrire est ce qui fait franchir le pas, surtout à quelqu'un qui
 * n'est jamais venu.
 */
export function EventSchedule({ event }: { event: SiteEvent }) {
  const days = event.schedule ?? [];
  const [active, setActive] = useState(0);

  if (days.length === 0) return null;
  const day = days[active];

  return (
    <section aria-label={`Run of show for ${event.title}`}>
      <p className="eyebrow">The day, hour by hour</p>

      {/* Les journées. Un seul jour : pas d'onglets, ils ne choisiraient rien. */}
      {days.length > 1 ? (
        <div role="tablist" aria-label="Days" className="mt-5 flex flex-wrap gap-2">
          {days.map((d, i) => (
            <button
              key={d.date}
              role="tab"
              type="button"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className="tap rounded-btn px-4 text-sm font-medium transition-colors"
              style={{
                background: i === active ? "var(--brand)" : "transparent",
                color: i === active ? "var(--on-brand)" : "var(--muted)",
                boxShadow: i === active ? "none" : "inset 0 0 0 1px var(--line-strong)",
              }}
            >
              {d.day}
            </button>
          ))}
        </div>
      ) : null}

      <p className="tnum mt-5 text-sm text-muted">{readableDate(day.date)}</p>

      <ol className="rows mt-6">
        {day.slots.map((slot) => (
          <li
            key={`${day.date}-${slot.at}-${slot.title}`}
            className="group grid grid-cols-[4.5rem_1fr] gap-5 py-5 transition-colors"
          >
            <span className="tnum pt-0.5 text-sm text-accent">{slot.at}</span>

            <span>
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                <span className="display-3">{slot.title}</span>
                {slot.tag ? (
                  <span
                    className="eyebrow rounded-btn px-2 py-0.5"
                    style={{ background: "var(--accent-tint)", color: "var(--accent)" }}
                  >
                    {slot.tag}
                  </span>
                ) : null}
              </span>
              {slot.note ? (
                <span className="mt-1.5 block text-sm text-muted">{slot.note}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
