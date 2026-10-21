"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RailCard = { n: string; title: string; body: string };

/**
 * Rail de cartes qui défile latéralement.
 *
 * Volontairement construit sur le défilement natif plutôt que sur un
 * épinglage GSAP. L'épinglage casse dès qu'un ancêtre porte un transform
 * — il s'appuie sur position: fixed — il entre en conflit avec le
 * défilement inertiel, et il confisque la molette du visiteur. Un
 * conteneur en overflow-x avec scroll-snap n'a aucun de ces défauts :
 * le doigt le balaye tout seul sur mobile, le clavier l'atteint, et il
 * survit au redimensionnement sans recalcul.
 *
 * data-lenis-prevent empêche le défilement inertiel global d'avaler la
 * molette quand le curseur est au-dessus du rail.
 */
export function CardRail({ cards }: { cards: RailCard[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max <= 0 ? 1 : el.scrollLeft / max);
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft >= max - 8);
  }, []);

  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  /** Avance ou recule d'une carte, en lisant la largeur réelle. */
  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const width = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * width, behavior: "smooth" });
  };

  // Glisser-déposer à la souris. Le tactile a déjà son geste natif.
  // L'état sert uniquement au curseur, qui doit changer au rendu ; la
  // position de départ vit dans une ref, elle n'a pas à redessiner.
  const drag = useRef<{ x: number; left: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div className="relative">
      <ul
        ref={track}
        data-lenis-prevent
        onScroll={measure}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") return;
          drag.current = { x: e.clientX, left: track.current?.scrollLeft ?? 0 };
          setDragging(true);
          track.current?.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current || !track.current) return;
          track.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
        }}
        onPointerUp={(e) => {
          drag.current = null;
          setDragging(false);
          track.current?.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scroll-padding-inline-start:0]"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
      >
        {cards.map((c) => (
          <li
            key={c.n}
            className="card flex w-[min(84vw,26rem)] shrink-0 snap-start flex-col p-8 md:p-10"
          >
            <span className="counter text-base">{c.n}</span>
            <h3 className="display-3 mt-10">{c.title}</h3>
            <p className="mt-4 text-body">{c.body}</p>
          </li>
        ))}
      </ul>

      {/* Avancement et commandes. Le rail reste utilisable sans eux. */}
      <div className="mt-8 flex items-center gap-5">
        <span aria-hidden className="h-0.5 flex-1 overflow-hidden rounded-full bg-line">
          <span
            className="block h-full origin-left rounded-full bg-brand transition-transform duration-200"
            style={{ transform: `scaleX(${Math.max(0.08, progress)})` }}
          />
        </span>

        <span className="flex gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={atStart}
            aria-label="Previous step"
            className="btn btn--ghost size-11 p-0 disabled:opacity-35"
          >
            <span aria-hidden>&larr;</span>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label="Next step"
            className="btn btn--ghost size-11 p-0 disabled:opacity-35"
          >
            <span aria-hidden>&rarr;</span>
          </button>
        </span>
      </div>
    </div>
  );
}
