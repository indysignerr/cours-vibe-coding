"use client";

import { useEffect, useRef } from "react";
import { fineOn, motionOn, provideMotion } from "@/lib/motion";
import { litStore } from "@/lib/stage";

/**
 * Le moteur des animations, monté une fois par document.
 *
 * Il fait trois choses, toutes en différé :
 *
 * 1. Charger GSAP + ScrollTrigger (pour ce qui suit le défilement au
 *    pixel ; les simples apparitions n'en ont pas besoin, voir ScrollFX),
 *    et — sur grand écran à souris — Lenis pour le défilement lissé. Lenis avance sur le ticker de GSAP : une
 *    seule boucle d'animation pour tout le site, pas deux qui se
 *    marchent dessus. Au doigt, le défilement natif reste : il est déjà
 *    lissé par le système et le remplacer le dégrade.
 * 2. Tenir la classe `is-lit` de <html> alignée sur l'easter egg.
 * 3. Dessiner le curseur : un halo beige, une traînée, et l'aimant des
 *    boutons. Rien de tout cela au doigt ni en mouvement réduit.
 */
export function MotionRoot() {
  const halo = useRef<HTMLDivElement>(null);
  const trail = useRef<HTMLDivElement>(null);

  // 1 — GSAP, ScrollTrigger, Lenis.
  useEffect(() => {
    if (!motionOn()) return;
    let dead = false;
    let teardown = () => {};

    const load = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (dead) return;
      gsap.registerPlugin(ScrollTrigger);

      let lenis: import("lenis").default | null = null;
      if (fineOn()) {
        const { default: Lenis } = await import("lenis");
        if (dead) return;
        lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, anchors: true });
        lenis.on("scroll", ScrollTrigger.update);
        const raf = (time: number) => lenis?.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
        teardown = () => {
          gsap.ticker.remove(raf);
          lenis?.destroy();
        };
      }

      provideMotion({ gsap, ScrollTrigger, lenis });
    };

    // Le texte d'abord, le mouvement ensuite — et « ensuite » dépend de
    // l'écran. Sur grand écran, la scène du haut de page a besoin du
    // défilement tout de suite : on charge dès que le navigateur souffle.
    // Au téléphone, rien de ce que GSAP pilote n'est dans le premier écran :
    // on attend le premier geste (ou trois secondes de calme), pour ne rien
    // disputer au réseau et au processeur pendant le chargement.
    // Si GSAP n'arrive pas — réseau coupé, script bloqué — rien ne doit
    // rester à demi caché : `motion-fallback` remet tout à l'état final.
    const giveUp = () => document.documentElement.classList.add("motion-fallback");
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      const net = window.setTimeout(giveUp, 6000);
      load()
        .catch(giveUp)
        .finally(() => window.clearTimeout(net));
    };
    const undo: (() => void)[] = [];

    if (fineOn()) {
      const idle =
        window.requestIdleCallback ??
        ((fn: () => void) => window.setTimeout(fn, 200));
      const id = idle(start, { timeout: 1200 });
      undo.push(() => (window.cancelIdleCallback ?? window.clearTimeout)(id as number));
    } else {
      const gestures = ["scroll", "touchstart", "pointerdown", "keydown"] as const;
      for (const g of gestures) {
        window.addEventListener(g, start, { passive: true, once: true });
      }
      const later = () => {
        const t = window.setTimeout(start, 3000);
        undo.push(() => window.clearTimeout(t));
      };
      if (document.readyState === "complete") later();
      else window.addEventListener("load", later, { once: true });
      undo.push(() => {
        for (const g of gestures) window.removeEventListener(g, start);
        window.removeEventListener("load", later);
      });
    }

    return () => {
      dead = true;
      for (const u of undo) u();
      teardown();
    };
  }, []);

  // 2 — La lumière.
  useEffect(() => {
    const apply = () =>
      document.documentElement.classList.toggle("is-lit", litStore.get());
    apply();
    return litStore.subscribe(apply);
  }, []);

  // 3 — Le curseur.
  useEffect(() => {
    const ring = halo.current;
    const tail = trail.current;
    if (!ring || !tail || !fineOn()) return;

    const dots = Array.from(tail.children) as HTMLElement[];
    const target = { x: -100, y: -100 };
    const at = { x: -100, y: -100 };
    const chain = dots.map(() => ({ x: -100, y: -100 }));
    let scale = 1;
    let wanted = 1;
    let frame = 0;
    let shown = false;
    let pulled: HTMLElement | null = null;

    const tick = () => {
      at.x += (target.x - at.x) * 0.22;
      at.y += (target.y - at.y) * 0.22;
      scale += (wanted - scale) * 0.16;
      ring.style.transform = `translate3d(${at.x}px, ${at.y}px, 0) scale(${scale.toFixed(3)})`;

      // La traînée : chaque point poursuit le précédent.
      let px = at.x;
      let py = at.y;
      let moving = Math.abs(target.x - at.x) + Math.abs(target.y - at.y) > 0.3;
      for (let i = 0; i < chain.length; i++) {
        const c = chain[i];
        c.x += (px - c.x) * 0.34;
        c.y += (py - c.y) * 0.34;
        if (Math.abs(px - c.x) + Math.abs(py - c.y) > 0.3) moving = true;
        dots[i].style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
        px = c.x;
        py = c.y;
      }

      // Arrivé : la boucle s'arrête. Rien ne tourne pour un curseur immobile.
      frame =
        moving || Math.abs(wanted - scale) > 0.004
          ? requestAnimationFrame(tick)
          : 0;
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const release = () => {
      if (!pulled) return;
      pulled.style.transform = "";
      pulled = null;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!shown) {
        shown = true;
        at.x = target.x;
        at.y = target.y;
        for (const c of chain) {
          c.x = target.x;
          c.y = target.y;
        }
        ring.parentElement?.classList.add("is-on");
      }

      const node = e.target as Element | null;
      wanted = node?.closest?.(
        "a, button, summary, label, input, textarea, select, [role='button']",
      )
        ? 1.9
        : 1;

      // L'aimant : le bouton vient vers le curseur, de quelques pixels.
      const mag = node?.closest?.("[data-magnetic]") as HTMLElement | null;
      if (mag !== pulled) release();
      if (mag) {
        pulled = mag;
        const r = mag.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
        mag.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      }
      wake();
    };
    const onLeave = () => {
      shown = false;
      release();
      ring.parentElement?.classList.remove("is-on");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      release();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="cursor" aria-hidden>
      <div ref={trail} className="cursor__trail">
        {Array.from({ length: 7 }, (_, i) => (
          <i key={i} style={{ "--k": i } as React.CSSProperties} />
        ))}
      </div>
      <div ref={halo} className="cursor__halo" />
    </div>
  );
}
