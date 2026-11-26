"use client";

import { useEffect } from "react";
import { fineOn, motionOn } from "@/lib/motion";

/**
 * Le défilement lissé, monté une fois par document.
 *
 * Sur grand écran à souris, Lenis adoucit la molette. Il est chargé en
 * différé, quand le navigateur souffle : rien de lui n'est sur le chemin
 * du premier affichage. Au doigt, le défilement natif reste : il est déjà
 * lissé par le système, et le remplacer le dégrade. En mouvement réduit,
 * rien n'est chargé du tout.
 *
 * Lenis fait défiler la fenêtre elle-même : `position: sticky`, les
 * ancres et les observateurs d'intersection marchent comme sans lui.
 */
export function MotionRoot() {
  useEffect(() => {
    if (!motionOn() || !fineOn()) return;
    let dead = false;
    let teardown = () => {};

    const start = async () => {
      const { default: Lenis } = await import("lenis");
      if (dead) return;
      const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, anchors: true });
      let frame = 0;
      const tick = (time: number) => {
        lenis.raf(time);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      teardown = () => {
        cancelAnimationFrame(frame);
        lenis.destroy();
      };
    };

    const idle =
      window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 200));
    const id = idle(() => void start().catch(() => {}), { timeout: 1500 });

    return () => {
      dead = true;
      (window.cancelIdleCallback ?? window.clearTimeout)(id as number);
      teardown();
    };
  }, []);

  return null;
}
