"use client";

import { useEffect, useRef } from "react";

/**
 * L'élément signature : le curseur devient une source de lumière.
 *
 * La marque est une ampoule. Plutôt que de le dire, le site se comporte
 * comme une pièce éclairée par un point qu'on déplace — le marine
 * s'éclaircit autour du pointeur, à peine, et la chaleur vient du beige
 * de la charte.
 *
 * Trois précautions qui décident si c'est élégant ou pénible :
 *   — rien sur un écran tactile, où il n'y a pas de pointeur à suivre ;
 *   — rien sous prefers-reduced-motion ;
 *   — le halo suit avec de l'inertie et ne dépasse jamais une opacité
 *     très basse, sinon on obtient un projecteur, pas une ambiance.
 */
export function Lightfall() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || still) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight * 0.35 };
    const current = { ...target };
    let frame = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        current.x = target.x;
        current.y = target.y;
        el.style.opacity = "1";
      }
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      el.style.transform = `translate3d(${Math.round(current.x)}px, ${Math.round(current.y)}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 opacity-0 transition-opacity duration-700"
      style={{
        width: "1px",
        height: "1px",
        // Le halo est centré sur le point, d'où le décalage de moitié.
        boxShadow: "0 0 0 0 transparent",
      }}
    >
      <span
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "46rem",
          height: "46rem",
          background:
            "radial-gradient(circle, rgba(201,174,132,0.085) 0%, rgba(201,174,132,0.035) 32%, transparent 68%)",
        }}
      />
    </div>
  );
}
