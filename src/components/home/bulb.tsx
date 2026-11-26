"use client";

import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/brand";
import type { BulbHandle } from "@/components/home/bulb-scene";
import { fineOn, motionOn } from "@/lib/motion";

/**
 * Le cadre de l'ampoule du haut de page.
 *
 * Il réserve la place, charge la scène 3D en différé (elle pèse le poids
 * de three.js : rien d'elle n'est sur le chemin du premier affichage), la
 * lance quand elle est à l'écran et la met en pause dès qu'elle en sort.
 *
 * Trois cas où il n'y a pas de 3D, et où le logo dessiné prend la place :
 * sans JavaScript, en mouvement réduit, et si WebGL manque ou se perd.
 * L'ampoule est décorative (`aria-hidden`) : elle ne dit rien que le
 * titre ne dise.
 */
export function Bulb() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"wait" | "live" | "failed">("wait");

  useEffect(() => {
    const el = stage.current;
    const cv = canvas.current;
    if (!el || !cv || !motionOn()) return;

    let dead = false;
    let asked = false;
    let seen = false;
    let handle: BulbHandle | null = null;
    const fine = fineOn();
    const hero = el.closest("section");
    const sync = () => {
      if (!handle) return;
      if (seen && !document.hidden) handle.play();
      else handle.pause();
    };

    const load = async () => {
      try {
        const { createBulb } = await import("@/components/home/bulb-scene");
        if (dead) return;
        handle = createBulb(cv, el, {
          fine,
          onLost: () => setState("failed"),
          // À l'éclat, le dernier mot du titre s'allume avec le « L ».
          onBurst: () => hero?.setAttribute("data-lit", ""),
        });
        // En développement, l'ampoule se pilote depuis la console : __bulb.seek(1.2).
        if (process.env.NODE_ENV !== "production") {
          (window as unknown as { __bulb?: BulbHandle }).__bulb = handle;
        }
        setState("live");
        sync();
      } catch {
        if (dead) return;
        setState("failed");
        hero?.setAttribute("data-lit", "");
      }
    };

    const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 200));
    const sight = new IntersectionObserver(
      ([entry]) => {
        seen = entry.isIntersecting;
        if (seen && !asked) {
          asked = true;
          idle(() => void load(), { timeout: 900 });
        }
        sync();
      },
      { threshold: 0.15 },
    );
    sight.observe(el);

    const sized = new ResizeObserver(() => handle?.resize());
    sized.observe(el);
    // Le défilement : de 0 en haut de page à 1 quand le haut de page est passé.
    const onScroll = () => {
      const span = (hero?.offsetHeight ?? window.innerHeight) * 0.72;
      handle?.spread(window.scrollY / Math.max(1, span));
    };
    // La souris fait deux choses : l'ampoule tourne un peu vers elle, et
    // les tuiles sur lesquelles elle passe s'écartent. Au doigt, seul
    // l'écart joue, le temps du contact.
    const onPointer = (event: PointerEvent) => {
      if (fine) {
        handle?.pointer(
          (event.clientX / window.innerWidth - 0.5) * 2,
          (event.clientY / window.innerHeight - 0.5) * 2,
        );
      }
      handle?.hover({ x: event.clientX, y: event.clientY });
    };
    const onLeave = () => handle?.hover(null);
    const onUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") handle?.hover(null);
    };
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onLeave, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      dead = true;
      sight.disconnect();
      sized.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onLeave);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      handle?.dispose();
    };
  }, []);

  return (
    <div
      ref={stage}
      className={state === "live" ? "bulb is-live" : state === "failed" ? "bulb is-failed" : "bulb"}
      aria-hidden="true"
    >
      <div className="bulb__fallback">
        <BrandMark className="bulb__mark" outline="var(--ink)" glyph="var(--brand)" />
      </div>
      <canvas ref={canvas} className="bulb__canvas" />
    </div>
  );
}
