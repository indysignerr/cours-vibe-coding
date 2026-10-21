"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Un seul enregistrement pour toute l'application. registerPlugin est
// idempotent, l'appeler plusieurs fois ne coûte rien.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Vrai quand le système demande à ce qu'on bouge le moins possible. */
export const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger };
