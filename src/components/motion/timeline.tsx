"use client";

import { useEffect, useRef } from "react";
import { gsap, reducedMotion } from "@/components/motion/gsap";

export type Beat = { when: string; title: string; body: string };

/**
 * Frise verticale : le trait se dessine au défilement, chaque point
 * s'allume quand on arrive dessus. Remplace trois paragraphes d'histoire.
 */
export function Timeline({ beats }: { beats: Beat[] }) {
  const root = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;

    const ctx = gsap.context(() => {
      // Le trait se remplit sur toute la hauteur de la frise.
      gsap.fromTo(
        "[data-track]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 70%", scrub: 0.5 },
        },
      );

      // Chaque point et son texte arrivent à leur tour.
      for (const item of gsap.utils.toArray<HTMLElement>("[data-beat]")) {
        gsap.fromTo(
          item,
          { opacity: 0.25, x: 14 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: item, start: "top 78%", once: true },
          },
        );
        gsap.fromTo(
          item.querySelector("[data-dot]"),
          { scale: 0.4, backgroundColor: "var(--line-strong)" },
          {
            scale: 1,
            backgroundColor: "var(--brand)",
            duration: 0.45,
            ease: "back.out(2.4)",
            scrollTrigger: { trigger: item, start: "top 78%", once: true },
          },
        );
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <ol ref={root} className="relative pl-10">
      {/* Le rail, et le trait qui se remplit par-dessus */}
      <span aria-hidden className="absolute bottom-0 left-[7px] top-2 w-px bg-line" />
      <span
        aria-hidden
        data-track
        className="absolute bottom-0 left-[7px] top-2 w-px bg-brand"
      />

      {beats.map((b) => (
        <li key={b.title} data-beat className="relative pb-12 last:pb-0">
          <span
            aria-hidden
            data-dot
            className="absolute -left-10 top-1.5 size-3.5 rounded-full bg-brand"
          />
          <p className="eyebrow eyebrow--accent">{b.when}</p>
          <h3 className="display-3 mt-3">{b.title}</h3>
          <p className="mt-2.5 max-w-measure text-body">{b.body}</p>
        </li>
      ))}
    </ol>
  );
}
