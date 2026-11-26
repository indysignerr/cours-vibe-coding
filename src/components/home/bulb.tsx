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
 * Il lui passe aussi les gestes : la souris et le clic. Pas le
 * défilement : l'ampoule ne s'ouvre que si on le lui demande.
 *
 * Quatre cas où il n'y a pas de 3D, et où le logo dessiné prend la place :
 * sans JavaScript, en mouvement réduit, sans carte graphique (three.js
 * n'est alors même pas chargé), et si WebGL se perd en route.
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
        // Sans carte graphique, WebGL dessinerait au processeur : on s'en
        // assure avant même de charger three.js, et on garde le logo dessiné.
        const probe = document
          .createElement("canvas")
          .getContext("webgl2", { failIfMajorPerformanceCaveat: true });
        if (!probe) throw new Error("no hardware WebGL");
        probe.getExtension("WEBGL_lose_context")?.loseContext();

        const { createBulb } = await import("@/components/home/bulb-scene");
        if (dead) return;
        const made = await createBulb(cv, el, {
          fine,
          onLost: () => setState("failed"),
          // Quand l'ampoule s'allume, le dernier mot du titre s'allume avec elle.
          onLit: () => hero?.setAttribute("data-lit", ""),
        });
        if (dead) {
          made.dispose();
          return;
        }
        handle = made;
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
    // L'ampoule ne réagit ni au défilement ni au doigt qui glisse : elle
    // resterait à s'ouvrir chaque fois qu'on fait défiler la page. Seule la
    // souris la fait tourner un peu et écarte les panneaux qu'elle survole.
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (fine) {
        handle?.pointer(
          (event.clientX / window.innerWidth - 0.5) * 2,
          (event.clientY / window.innerHeight - 0.5) * 2,
        );
      }
      handle?.hover({ x: event.clientX, y: event.clientY });
    };
    const onLeave = () => handle?.hover(null);
    // L'éclat est un geste voulu : un clic sur l'ampoule, ou un toucher
    // bref qui ne glisse pas. Un doigt qui fait défiler ne déclenche rien.
    let press: { x: number; y: number; at: number } | null = null;
    const onDown = (event: PointerEvent) => {
      press = { x: event.clientX, y: event.clientY, at: event.timeStamp };
    };
    const onUp = (event: PointerEvent) => {
      const from = press;
      press = null;
      if (!from) return;
      const still = Math.hypot(event.clientX - from.x, event.clientY - from.y) < 8;
      const brief = event.timeStamp - from.at < 400;
      const box = el.getBoundingClientRect();
      const inside =
        event.clientX > box.left &&
        event.clientX < box.right &&
        event.clientY > box.top &&
        event.clientY < box.bottom;
      const onControl = (event.target as Element | null)?.closest?.("a, button, summary, input");
      if (still && brief && inside && !onControl) handle?.pop();
    };
    const onCancel = () => {
      press = null;
    };
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onCancel, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      dead = true;
      sight.disconnect();
      sized.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
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
