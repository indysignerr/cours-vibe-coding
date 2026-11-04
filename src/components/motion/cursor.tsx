"use client";

import { useEffect, useRef } from "react";

/**
 * Le curseur personnalisé.
 *
 * Présent sur les deux Sites of the Day que j'ai inspectés — OFFF Forum
 * et Grids — et c'est à peu près la seule chose qu'ils ont en commun avec
 * un budget d'animation modeste.
 *
 * Trois règles pour qu'il reste agréable :
 *   — il ne remplace jamais le curseur système, il l'accompagne. Masquer
 *     la flèche rend le site pénible dès que l'anneau prend du retard ;
 *   — il grossit au-dessus de ce qui est cliquable, ce qui en fait une
 *     information et pas une décoration ;
 *   — pas de mix-blend-mode : une couche fusionnée oblige le compositeur
 *     à refaire l'écran à chaque image, et c'est l'une des causes du
 *     défilement saccadé qu'on vient de corriger ;
 *   — rien sur tactile et rien sous prefers-reduced-motion.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ring.current;
    if (!el) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || still) return;

    const target = { x: -100, y: -100 };
    const at = { x: -100, y: -100 };
    let scale = 1;
    let wanted = 1;
    let frame = 0;
    let shown = false;

    const move = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!shown) {
        shown = true;
        at.x = target.x;
        at.y = target.y;
        el.style.opacity = "1";
      }
      // Au-dessus d'un élément actionnable, l'anneau s'ouvre.
      const over = (e.target as HTMLElement)?.closest?.(
        "a[href], button, [role=button], input, textarea, select, summary",
      );
      wanted = over ? 2.1 : 1;
      wake();
    };

    const leave = () => {
      el.style.opacity = "0";
      shown = false;
    };

    /*
     * La boucle s'arrête d'elle-même quand l'anneau a rattrapé le
     * curseur. Une rAF qui tourne en permanence empêche le navigateur de
     * se mettre au repos et vole des images au défilement, pour animer
     * un élément immobile.
     */
    const tick = () => {
      const dx = target.x - at.x;
      const dy = target.y - at.y;
      const ds = wanted - scale;

      at.x += dx * 0.2;
      at.y += dy * 0.2;
      scale += ds * 0.15;
      el.style.transform = `translate3d(${at.x}px, ${at.y}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;

      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1 && Math.abs(ds) < 0.002) {
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);

    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ring}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] opacity-0 transition-opacity duration-300 max-[767px]:hidden"
      style={{
        width: 22,
        height: 22,
        borderRadius: 999,
        border: "1px solid var(--brand)",
        willChange: "transform",
      }}
    />
  );
}
