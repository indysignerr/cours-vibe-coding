"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "@/components/motion/gsap";

/**
 * Défilement inertiel global.
 *
 * Posé une fois dans le layout. Il se désactive de lui-même quand le
 * système demande moins de mouvement : dans ce cas le navigateur reprend
 * son défilement natif, ce qui est exactement ce qu'on veut.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    // Lenis et ScrollTrigger doivent lire le même défilement : sans ce
    // branchement les apparitions se déclenchent au mauvais endroit, parce
    // que ScrollTrigger échantillonne pendant que Lenis interpole encore.
    lenis.on("scroll", ScrollTrigger.update);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Les polices et les images changent la hauteur de la page après coup.
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 400);

    // Les ancres internes doivent passer par Lenis, sinon elles sautent.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest?.('a[href^="#"]');
      const href = link?.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -96 });
    };
    document.addEventListener("click", onClick);

    return () => {
      clearTimeout(refresh);
      document.removeEventListener("click", onClick);
      lenis.off("scroll", ScrollTrigger.update);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
