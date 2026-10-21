"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/components/brand";

/**
 * Les deux portes.
 *
 * Le site s'adresse à deux publics qui n'ont rien à se dire. Plutôt que de
 * mélanger les deux discours dans une même page — ce qui les allongeait
 * tous les deux — on demande d'emblée qui est là.
 *
 * Ce n'est pas un écran bloquant : on peut faire défiler et lire la suite,
 * qui s'adresse aux entreprises. Un interstitiel qui force le clic coûte
 * son référencement et ses visiteurs.
 */
const DOORS = [
  {
    href: "/solutions/",
    eyebrow: "I run a company",
    title: "Automate the work nobody should be doing by hand.",
    line: "Fixed price. Three weeks. A written answer on where your data goes.",
    cta: "See the five solutions",
  },
  {
    href: "/join/",
    eyebrow: "I'm a student",
    title: "Build something real, in a room, against a deadline.",
    line: "Hackathons, workshops, talks. No syllabus and no account needed.",
    cta: "See what is coming up",
  },
];

export function Doors() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      aria-label="Choose your path"
      className="relative grid min-h-[86svh] border-b border-line md:grid-cols-2"
    >
      {DOORS.map((d, i) => (
        <Link
          key={d.href}
          href={d.href}
          className="group relative flex flex-col justify-end overflow-hidden px-5 py-12 transition-colors duration-500 md:px-10 md:py-16"
          style={{
            background: open === i ? "var(--surface)" : "transparent",
            opacity: open === null || open === i ? 1 : 0.42,
          }}
          onPointerEnter={() => setOpen(i)}
          onPointerLeave={() => setOpen(null)}
          onFocus={() => setOpen(i)}
          onBlur={() => setOpen(null)}
        >
          {/* Le filet qui se tire sur toute la largeur de la porte */}
          <span
            aria-hidden
            className="absolute left-0 top-0 h-0.5 bg-brand transition-all duration-700 ease-swift"
            style={{ width: open === i ? "100%" : "0%" }}
          />
          {i === 1 ? (
            <span aria-hidden className="absolute inset-y-0 left-0 hidden w-px bg-line md:block" />
          ) : null}

          <p className="eyebrow eyebrow--accent">{d.eyebrow}</p>
          <h2 className="display-1 mt-5 max-w-[13ch]">{d.title}</h2>
          <p className="mt-6 max-w-[34ch] text-body">{d.line}</p>
          <span className="btn btn--ghost mt-9 w-fit transition-transform duration-500 group-hover:translate-x-1">
            {d.cta}
          </span>
        </Link>
      ))}

      {/* Le pictogramme, posé sur la couture */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full bg-canvas p-5 md:block"
      >
        <BrandMark className="size-10" outline="var(--ink)" glyph="var(--brand)" />
      </span>
    </section>
  );
}
