"use client";

import { useEffect } from "react";
import { motionOn } from "@/lib/motion";

/**
 * Les apparitions au défilement d'une page.
 *
 * Un composant sans rendu, monté par chaque page. Il branche ce que le
 * HTML déclare par attribut, avec un seul IntersectionObserver et sans
 * rien charger :
 *
 *   [data-reveal]   le bloc monte et apparaît en entrant dans la fenêtre
 *   [data-rule]     le filet d'une section se trace à son arrivée
 *   [data-count]    un chiffre compte de zéro jusqu'à sa valeur
 *
 * Les états de départ vivent dans le CSS, sous `html.motion` : sans
 * JavaScript rien n'est caché. Le chiffre, lui, est écrit en entier dans
 * le HTML ; le compte n'est qu'un habillage.
 */
declare global {
  interface Window {
    __motionNet?: number;
  }
}

export function ScrollFX() {
  useEffect(() => {
    if (!motionOn()) return;
    const main = document.getElementById("main");
    if (!main) return;

    const frames = new Set<number>();
    const count = (el: HTMLElement) => {
      const target = Number(el.dataset.count);
      if (!Number.isFinite(target) || target <= 0) return;
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / 900);
        // Décélération : le chiffre ralentit en arrivant.
        el.textContent = String(Math.round(target * (1 - (1 - p) ** 3)));
        if (p < 1) frames.add(requestAnimationFrame(step));
      };
      frames.add(requestAnimationFrame(step));
    };

    const reveal = new IntersectionObserver(
      (entries) => {
        let i = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          // Ceux qui entrent ensemble se suivent, à 95 ms d'écart.
          el.style.setProperty("--rd", `${Math.min(i++, 6) * 95}ms`);
          el.classList.add("is-in");
          if (el.dataset.count) count(el);
          reveal.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    main
      .querySelectorAll("[data-reveal], [data-rule], [data-count]")
      .forEach((el) => reveal.observe(el));

    // Les apparitions ont pris la main : le filet n'a plus lieu d'être.
    window.clearTimeout(window.__motionNet);

    return () => {
      reveal.disconnect();
      frames.forEach((f) => cancelAnimationFrame(f));
    };
  }, []);

  return null;
}
