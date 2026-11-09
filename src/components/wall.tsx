"use client";

import { useEffect, useRef } from "react";

/**
 * Le mur de l'année : une rangée qui défile à l'horizontale.
 *
 * Le défilement est natif — `overflow-x: auto`, accroche par carte — et
 * la seule chose que fait ce composant est de traduire la molette
 * verticale en déplacement horizontal quand le pointeur est dessus. Un
 * pavé tactile et un doigt n'en ont pas besoin ; une souris, si, sinon
 * le mur ne bouge que par la barre de défilement.
 *
 * L'écouteur ne bloque le défilement de la page que s'il reste du chemin
 * dans la direction demandée : au bout du mur, la page reprend la main.
 */
export function Wall({
  children,
  className = "",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const to = el.scrollLeft + e.deltaY;
      if ((e.deltaY > 0 && el.scrollLeft >= max - 1) || (e.deltaY < 0 && el.scrollLeft <= 0)) {
        return;
      }
      e.preventDefault();
      el.scrollLeft = Math.max(0, Math.min(max, to));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <ol ref={ref} className={`wall ${className}`.trim()} aria-label={label}>
      {children}
    </ol>
  );
}
