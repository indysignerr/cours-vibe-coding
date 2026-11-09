import type { gsap as Gsap } from "gsap";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

/**
 * Le rendez-vous des animations.
 *
 * GSAP, ScrollTrigger et Lenis sont chargés une seule fois, en différé,
 * par <MotionRoot>. Tout composant qui veut animer attend cette promesse
 * dans son effet : il n'importe rien lui-même, donc rien de tout cela
 * n'entre dans le JavaScript initial de la page.
 *
 * En mouvement réduit la promesse ne se résout jamais — et c'est le
 * comportement voulu : personne n'anime.
 */
export type Motion = {
  gsap: typeof Gsap;
  ScrollTrigger: typeof ST;
  /** Le défilement lissé ; null au doigt, où le natif est meilleur. */
  lenis: Lenis | null;
};

let resolve!: (m: Motion) => void;
const ready = new Promise<Motion>((r) => {
  resolve = r;
});

export const whenMotion = () => ready;
export const provideMotion = (m: Motion) => resolve(m);

/** Les animations peuvent-elles tourner ? Lu sur la classe posée avant la peinture. */
export const motionOn = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("motion");

/** Grand écran à souris : là où vivent la 3D, le curseur et le défilement lissé. */
export const fineOn = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("fine");
