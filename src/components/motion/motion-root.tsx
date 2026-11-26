"use client";

import type Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { fineOn, motionOn } from "@/lib/motion";

/**
 * Le défilement, monté une fois par document.
 *
 * Sur grand écran à souris, Lenis adoucit la molette. Il est chargé en
 * différé, quand le navigateur souffle : rien de lui n'est sur le chemin
 * du premier affichage. Au doigt, le défilement natif reste : il est déjà
 * lissé par le système, et le remplacer le dégrade. En mouvement réduit,
 * rien n'est chargé du tout.
 *
 * Lenis fait défiler la fenêtre elle-même : `position: sticky`, les
 * ancres et les observateurs d'intersection marchent comme sans lui.
 *
 * Trois règles de navigation vivent ici, avec ou sans Lenis :
 *
 *   — une page neuve s'ouvre en haut. C'est le routeur qui remonte la
 *     fenêtre, d'un coup, grâce à `data-scroll-behavior` posé sur
 *     <html>. Reste à faire taire Lenis à cet instant : s'il glisse
 *     encore, il ramène la fenêtre là où il allait, et la page neuve
 *     s'ouvre au milieu. L'arrêter puis le relancer lui fait lâcher son
 *     élan et reprendre la position réelle, quelle qu'elle soit : le
 *     haut, une ancre, ou la hauteur rendue au retour arrière ;
 *   — un lien vers la page où l'on est déjà (le logo sur l'accueil,
 *     « About » sur À propos) ramène en haut, en glissant ;
 *   — au retour arrière, le navigateur rend à la page sa hauteur d'un
 *     coup : le lissage du CSS est coupé le temps de ce retour, sinon la
 *     page glisserait depuis le haut.
 */
export function MotionRoot() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const shown = useRef(pathname);

  useEffect(() => {
    if (!motionOn() || !fineOn()) return;
    let dead = false;
    let teardown = () => {};

    const start = async () => {
      const { default: Lenis } = await import("lenis");
      if (dead) return;
      const lenis = new Lenis({
        lerp: 0.12,
        wheelMultiplier: 1,
        anchors: true,
        // Au clic sur un lien vers une autre page, l'élan s'arrête net.
        stopInertiaOnNavigate: true,
      });
      lenisRef.current = lenis;
      let frame = 0;
      const tick = (time: number) => {
        lenis.raf(time);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      teardown = () => {
        cancelAnimationFrame(frame);
        lenisRef.current = null;
        lenis.destroy();
      };
    };

    const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 200));
    const id = idle(() => void start().catch(() => {}), { timeout: 1500 });

    return () => {
      dead = true;
      (window.cancelIdleCallback ?? window.clearTimeout)(id as number);
      teardown();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    // Un lien vers la page courante, sans ancre : retour en haut.
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      const link = (event.target as Element | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      const here = window.location;
      if (
        url.origin !== here.origin ||
        url.pathname !== here.pathname ||
        url.search !== here.search
      )
        return;
      if (url.hash) return;
      const lenis = lenisRef.current;
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: motionOn() ? "smooth" : "instant" });
    };

    // Retour arrière, avance : pas de lissage pendant que la hauteur revient.
    let timer = 0;
    const onPop = () => {
      root.style.scrollBehavior = "auto";
      window.clearTimeout(timer);
      timer = window.setTimeout(() => root.style.removeProperty("scroll-behavior"), 1200);
    };

    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
      window.clearTimeout(timer);
      root.style.removeProperty("scroll-behavior");
    };
  }, []);

  // Avant la peinture de la page neuve, pour qu'aucune image ne parte
  // de l'ancienne hauteur.
  useLayoutEffect(() => {
    if (shown.current === pathname) return;
    shown.current = pathname;
    const lenis = lenisRef.current;
    if (!lenis) return;
    lenis.stop();
    lenis.start();
  }, [pathname]);

  return null;
}
