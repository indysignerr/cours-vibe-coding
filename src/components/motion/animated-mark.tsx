"use client";

import { useEffect, useRef } from "react";
import { gsap, reducedMotion } from "@/components/motion/gsap";

/**
 * L'ampoule qui s'allume : le verre se dessine au trait, le « L » suit,
 * puis les rayons jaillissent un par un. C'est la seule animation du site
 * qui dure plus d'une seconde, et elle ne joue qu'une fois, en haut de
 * l'accueil.
 */
export function AnimatedMark({
  className = "size-40",
  outline = "var(--ink)",
  glyph = "var(--brand)",
  delay = 0.15,
}: {
  className?: string;
  outline?: string;
  glyph?: string;
  delay?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const bulb = el.querySelector<SVGPathElement>("[data-bulb]");
    const letter = el.querySelector<SVGPathElement>("[data-letter]");
    const rays = el.querySelectorAll<SVGPathElement>("[data-ray]");
    const base = el.querySelectorAll<SVGElement>("[data-base]");
    if (!bulb || !letter) return;

    if (reducedMotion()) return;

    const ctx = gsap.context(() => {
      const strokes = [bulb, letter];
      for (const s of strokes) {
        const len = s.getTotalLength();
        gsap.set(s, { strokeDasharray: len, strokeDashoffset: len });
      }
      gsap.set(rays, { opacity: 0, scale: 0.3, transformOrigin: "50% 50%" });
      gsap.set(base, { opacity: 0, y: 8 });

      gsap
        .timeline({ delay })
        .to(bulb, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" })
        .to(base, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06 }, "-=0.35")
        .to(letter, { strokeDashoffset: 0, duration: 0.55, ease: "power2.out" }, "-=0.45")
        .to(rays, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: "back.out(2)" }, "-=0.2");
    }, el);

    return () => ctx.revert();
  }, [delay]);

  return (
    <svg ref={ref} className={className} viewBox="0 0 200 200" fill="none" aria-hidden focusable="false">
      <g stroke={glyph} strokeWidth="11" strokeLinecap="round">
        <path data-ray d="M100 27V9" />
        <path data-ray d="M56.2 44.2 43.4 31.4" />
        <path data-ray d="M143.8 44.2 156.6 31.4" />
        <path data-ray d="M41.7 66.8 24.8 60.6" />
        <path data-ray d="M158.3 66.8 175.2 60.6" />
      </g>
      <path
        data-bulb
        d="M100 42a46 46 0 0 1 28 82 8 8 0 0 0-3 6v9H75v-9a8 8 0 0 0-3-6 46 46 0 0 1 28-82Z"
        stroke={outline}
        strokeWidth="13"
        strokeLinejoin="round"
      />
      <path
        data-letter
        d="M88 66v46h28"
        stroke={glyph}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect data-base x="72" y="147" width="56" height="13" rx="6.5" fill={outline} />
      <path data-base d="M80 170h40a20 20 0 0 1-40 0Z" fill={outline} />
    </svg>
  );
}
