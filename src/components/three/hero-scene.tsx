"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

/**
 * Le point d'entrée de la 3D.
 *
 * Chargé dynamiquement et sans rendu serveur : Three.js ne doit pas
 * peser sur le premier octet, et la hero est entièrement lisible avant
 * que le canvas n'arrive. S'il n'arrive jamais — WebGL coupé, appareil
 * modeste — il ne manque rien d'autre qu'une texture.
 */
const Scene = dynamic(() => import("@/components/three/scene"), {
  ssr: false,
  loading: () => null,
});

export function HeroScene() {
  // three.js pèse 907 Ko. C'est acceptable en différé sur un ordinateur ;
  // ça ne l'est pas sur un téléphone en 4G, pour une texture de fond que
  // l'image et son voile portent déjà. En dessous de 768 px, la hero garde
  // la photo et rien n'est téléchargé.
  const wide = useSyncExternalStore(subscribeWide, getWide, () => false);
  if (!wide) return null;
  return <Scene />;
}

const wideQuery = () => window.matchMedia("(min-width: 768px)");

function subscribeWide(onChange: () => void) {
  const mq = wideQuery();
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getWide() {
  return wideQuery().matches;
}
