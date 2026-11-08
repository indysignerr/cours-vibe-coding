"use client";

import dynamic from "next/dynamic";

/**
 * Chargement différé du mot en particules.
 *
 * Le composant pèse un shader et une boucle de rendu : il n'a rien à
 * faire dans le premier chargement. S'il n'arrive jamais — WebGL coupé,
 * réseau coupé — la section garde son titre et son bouton.
 */
const ParticleWord = dynamic(
  () => import("@/components/three/particle-word").then((m) => m.ParticleWord),
  { ssr: false, loading: () => null },
);

export function ParticleWordLazy({ word }: { word: string }) {
  return <ParticleWord text={word} mouseForce={190} particleSize={1.5} />;
}
