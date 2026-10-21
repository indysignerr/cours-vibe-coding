"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "@/components/motion/gsap";
import { scrollToTop, setLenis } from "@/components/motion/lenis";

/**
 * Défilement inertiel global.
 *
 * Posé une fois dans le layout. Il se désactive de lui-même quand le
 * système demande moins de mouvement : dans ce cas le navigateur reprend
 * son défilement natif, ce qui est exactement ce qu'on veut.
 */
export function SmoothScroll() {
  const pathname = usePathname();

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
    setLenis(lenis);
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
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  /**
   * Remise à zéro à chaque changement de page.
   *
   * Next remet la fenêtre en haut après une navigation, mais Lenis tient
   * sa propre position : au premier coup de molette il ramenait le
   * visiteur là où il était sur la page précédente. On lui dit donc
   * explicitement que la nouvelle page commence en haut.
   */
  useEffect(() => {
    // Sauf si l'URL vise une ancre : quelqu'un qui arrive sur /page/#section
    // veut cette section, pas le haut de la page.
    if (window.location.hash) return;
    scrollToTop({ immediate: true });
  }, [pathname]);

  return null;
}
