"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { WORK } from "@/lib/work";

/**
 * La liste des réalisations, avec un aperçu qui suit le curseur.
 *
 * Patron repris de « Project Showcase » sur 21st.dev (jatin-yadav05) et
 * refait sur nos jetons : l'interpolation du curseur est la même idée,
 * tout le reste — palette, carte d'aperçu, repli tactile — est à nous.
 *
 * L'aperçu n'est pas une capture d'écran : c'est une carte dessinée aux
 * couleurs du site en question. Une capture vieillit mal et ment vite ;
 * le lien, lui, est vérifiable.
 */
export function WorkIndex() {
  const [hovered, setHovered] = useState<number | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  // Au tout premier survol, l'aperçu doit apparaître sous le curseur et non
  // voler depuis le coin haut-gauche : on cale les deux positions d'un coup.
  const primed = useRef(false);

  // L'aperçu rattrape le curseur par interpolation : il traîne un peu,
  // ce qui est exactement ce qui le rend agréable.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.14;
      current.current.y += (target.current.y - current.current.y) * 0.14;
      if (preview.current) {
        preview.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={container}
      className="relative"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = container.current?.getBoundingClientRect();
        if (!r) return;
        target.current = { x: e.clientX - r.left + 28, y: e.clientY - r.top - 112 };
        if (!primed.current) {
          current.current = { ...target.current };
          primed.current = true;
        }
      }}
      onPointerLeave={() => setHovered(null)}
    >
      {/* L'aperçu flottant, masqué au doigt et au clavier */}
      <div
        ref={preview}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block"
        style={{ opacity: hovered === null ? 0 : 1, transition: "opacity 320ms ease" }}
      >
        <div className="relative h-[200px] w-[310px] overflow-hidden rounded-card shadow-lift-lg">
          {WORK.map((w, i) => (
            <div
              key={w.domain}
              className="absolute inset-0 flex flex-col justify-between p-6 transition-all duration-500"
              style={{
                background: w.surface,
                color: w.ink,
                opacity: hovered === i ? 1 : 0,
                transform: hovered === i ? "scale(1)" : "scale(1.06)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[0.7rem] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: w.accent }}
                >
                  {w.sector}
                </span>
                <span className="size-2.5 rounded-full" style={{ background: w.accent }} />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-[-0.02em]">{w.name}</p>
                <p className="mt-1 text-sm opacity-70">{w.domain}</p>
              </div>
              <div className="h-1 w-full rounded-full" style={{ background: w.accent }} />
            </div>
          ))}
        </div>
      </div>

      <ul className="rows">
        {WORK.map((w, i) => (
          <li key={w.domain}>
            <a
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid gap-2 py-7 transition-colors md:grid-cols-12 md:items-baseline md:gap-8"
              onPointerEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
            >
              <span className="counter md:col-span-1">{String(i + 1).padStart(2, "0")}</span>

              <span className="md:col-span-4">
                <span className="display-2 underline-grow inline-flex items-center gap-2">
                  {w.name}
                  <ArrowUpRight
                    aria-hidden
                    className="size-5 shrink-0 -translate-x-2 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                  />
                </span>
                <span className="mt-1.5 block text-sm text-muted">{w.sector}</span>
              </span>

              <span className="text-body md:col-span-5">{w.built}</span>

              <span className="tnum text-sm text-muted md:col-span-2 md:text-right">
                {w.domain}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
