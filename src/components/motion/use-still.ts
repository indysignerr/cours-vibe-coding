"use client";

import { useSyncExternalStore } from "react";

/**
 * Faut-il se passer d'animation ?
 *
 * Deux cas : le système demande moins de mouvement, ou l'écran est trop
 * étroit pour qu'une scène épinglée soit autre chose qu'une gêne.
 *
 * Lu avec useSyncExternalStore et non useState : le serveur ne connaît ni
 * matchMedia ni la largeur de l'écran. Un useState qui lit `window` rend
 * autre chose au serveur qu'au client, et React casse l'hydratation. Ici
 * l'instantané serveur est explicite — on suppose l'animation — et React
 * relit la vraie valeur juste après, sans erreur.
 */
const QUERIES = ["(prefers-reduced-motion: reduce)", "(max-width: 767px)"];

function subscribe(onChange: () => void) {
  const lists = QUERIES.map((q) => window.matchMedia(q));
  for (const l of lists) l.addEventListener("change", onChange);
  return () => {
    for (const l of lists) l.removeEventListener("change", onChange);
  };
}

const getSnapshot = () => QUERIES.some((q) => window.matchMedia(q).matches);

// Au rendu serveur on suppose un grand écran sans préférence : la version
// animée est le défaut, et le repli arrive après hydratation si besoin.
const getServerSnapshot = () => false;

export function useStill() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
