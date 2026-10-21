"use client";

import type Lenis from "lenis";

/**
 * L'instance de défilement inertiel, partagée.
 *
 * Elle vit dans le layout et survit aux changements de page, donc le reste
 * du site doit pouvoir lui parler : remettre en haut après une navigation,
 * ou ramener au début quand on clique le logo.
 */
let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

export const getLenis = () => instance;

/**
 * Remonte en haut de page.
 *
 * `immediate` saute l'animation : c'est ce qu'on veut après une
 * navigation, où le visiteur attend d'arriver en haut de la nouvelle
 * page, pas de la voir défiler. Sans Lenis — préférence de mouvement
 * réduit, ou script non encore chargé — on retombe sur le natif.
 */
export function scrollToTop({ immediate = false } = {}) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, { immediate, duration: immediate ? 0 : 0.9 });
    return;
  }
  window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
}
