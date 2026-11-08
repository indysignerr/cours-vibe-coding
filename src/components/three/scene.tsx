"use client";

import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Field } from "@/components/three/field";

/**
 * Le canvas de la hero.
 *
 * Deux garde-fous, et ce ne sont pas des détails : le client a déjà vu
 * ce site ramer au défilement.
 *
 * 1. La boucle de rendu s'arrête dès que la hero quitte l'écran. Un
 *    canvas WebGL qui tourne sous une page qu'on lit est du travail
 *    gratuit, et c'est exactement ce qui vole des images au scroll.
 * Le conteneur porte une classe plutôt qu'un utilitaire : `.on-ink > *`
 * impose `position: relative` à ses enfants directs et écrasait
 * `absolute`, ce qui laissait le canvas dans le flux — il poussait la
 * page au lieu de se poser derrière elle.
 *
 * 2. `dpr` plafonné à 1,5. Sur un écran Retina, rendre en 3× revient à
 *    pousser neuf fois les pixels pour un champ de points flous.
 */
const motionQuery = () => window.matchMedia("(prefers-reduced-motion: reduce)");

function subscribeMotion(onChange: () => void) {
  const mq = motionQuery();
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getMotion() {
  return motionQuery().matches;
}

export default function Scene() {
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  // Lu par abonnement plutôt que posé depuis un effet : la préférence est
  // un état du navigateur, pas un état de ce composant.
  const reduced = useSyncExternalStore(subscribeMotion, getMotion, () => false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setLive(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    io.observe(el);

    // Un onglet en arrière-plan ne doit rien calculer non plus.
    const onVisibility = () => {
      if (document.hidden) setLive(false);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={host} className="hero__canvas" aria-hidden>
      <Canvas
        camera={{ position: [0, 1.6, 9.5], fov: 52 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.5]}
        // Rien ne tourne quand la hero est passée, ni quand l'onglet dort.
        frameloop={live ? "always" : "never"}
        style={{ background: "transparent" }}
      >
        <Field reduced={reduced} />
        <Preload all />
      </Canvas>
    </div>
  );
}
