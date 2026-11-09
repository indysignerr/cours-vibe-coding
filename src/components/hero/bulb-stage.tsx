"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { BulbHandle } from "@/components/hero/bulb-scene";
import { fineOn, whenMotion } from "@/lib/motion";
import { playIgnite, playOff } from "@/lib/sound";
import { litStore } from "@/lib/stage";

/**
 * La scène de l'ampoule.
 *
 * Ce que le serveur envoie est une IMAGE : un rendu fixe de la même
 * ampoule, visible sans JavaScript, sur téléphone, en mouvement réduit,
 * et pendant que le reste charge. La scène 3D ne vient qu'ensuite, et
 * seulement là où elle a un sens — grand écran, souris, mouvement
 * autorisé : Three.js est importé en différé, une fois le texte du haut
 * de page affiché, et le canvas remplace l'image en fondu.
 *
 * Trois liens avec la page :
 *   — le défilement (ScrollTrigger) donne la progression 0 → 1 ; elle
 *     plie le filament et pilote, par deux variables CSS, le texte qui
 *     s'efface et l'ampoule qui vient au centre ;
 *   — le curseur fait tourner l'ampoule de quelques degrés ;
 *   — le clic sur le verre est l'easter egg : il allume. Le « verre »
 *     est un vrai <button>, donc atteignable au clavier.
 */
export function BulbStage({
  alt,
  buttonLabel,
}: {
  alt: string;
  buttonLabel: string;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lit = useSyncExternalStore(litStore.subscribe, litStore.get, () => false);

  useEffect(() => {
    const el = holder.current;
    const cv = canvas.current;
    if (!el || !cv || !fineOn()) return;

    const hero = el.closest<HTMLElement>("[data-hero]");
    let handle: BulbHandle | null = null;
    let dead = false;
    let progress = 0;
    const cleanups: (() => void)[] = [];

    // La progression du défilement : deux variables CSS, et la scène si elle est là.
    const apply = (p: number) => {
      progress = p;
      hero?.style.setProperty("--p", p.toFixed(4));
      // Texte effacé : il sort aussi de l'ordre de tabulation.
      if (hero) hero.dataset.phase = p > 0.24 ? "bulb" : "copy";
      handle?.setProgress((p - 0.16) / 0.56);
    };

    void whenMotion().then(({ ScrollTrigger }) => {
      if (dead || !hero) return;
      const st = ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => apply(self.progress),
      });
      apply(st.progress);
      cleanups.push(() => st.kill());
    });

    const start = async () => {
      let mod: typeof import("@/components/hero/bulb-scene");
      try {
        mod = await import("@/components/hero/bulb-scene");
      } catch {
        return; // Pas de 3D : l'image reste, et la page marche pareil.
      }
      if (dead) return;
      try {
        handle = mod.createBulb(cv, {
          onHeat: (h) => el.style.setProperty("--heat", h.toFixed(3)),
        });
      } catch {
        return; // WebGL indisponible.
      }
      handle.setLit(litStore.get());
      handle.setProgress((progress - 0.16) / 0.56);
      handle.setRunning(true);
      handle.ignite();
      el.classList.add("is-live");
      // Pour refaire l'affiche mobile depuis la console : voir le README.
      (window as unknown as { __bulb?: BulbHandle }).__bulb = handle;

      const onPointer = (e: PointerEvent) =>
        handle?.setPointer(
          (e.clientX / window.innerWidth) * 2 - 1,
          (e.clientY / window.innerHeight) * 2 - 1,
        );
      window.addEventListener("pointermove", onPointer, { passive: true });

      const ro = new ResizeObserver(() => handle?.resize());
      ro.observe(cv);

      // Hors écran ou onglet caché : la boucle s'arrête.
      let seen = true;
      const sync = () => handle?.setRunning(seen && !document.hidden);
      const io = new IntersectionObserver(([entry]) => {
        seen = entry.isIntersecting;
        sync();
      });
      io.observe(el);
      document.addEventListener("visibilitychange", sync);

      const off = litStore.subscribe(() => handle?.setLit(litStore.get()));

      cleanups.push(() => {
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("visibilitychange", sync);
        ro.disconnect();
        io.disconnect();
        off();
      });
    };

    // Après le texte : la scène n'est jamais sur le chemin du premier affichage.
    const idle =
      window.requestIdleCallback ??
      ((fn: () => void) => window.setTimeout(fn, 350));
    const id = idle(() => void start(), { timeout: 1800 });

    return () => {
      dead = true;
      (window.cancelIdleCallback ?? window.clearTimeout)(id as number);
      for (const c of cleanups) c();
      handle?.dispose();
      el.classList.remove("is-live");
    };
  }, []);

  const toggle = () => {
    const next = !litStore.get();
    litStore.set(next);
    if (next) playIgnite();
    else playOff();
  };

  return (
    <div ref={holder} className="bulb">
      <span className="bulb__glow" aria-hidden />
      {/* L'affiche : le rendu fixe. `fetchPriority` parce qu'au téléphone
          c'est elle, le plus grand élément du premier écran. Un <img> et non
          next/image : l'export est statique (pas d'optimiseur), et on tient
          ici le srcset à la main. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="bulb__poster"
        src="/images/bulb-poster.webp"
        srcSet="/images/bulb-poster-640.webp 640w, /images/bulb-poster.webp 1080w"
        sizes="(min-width: 1024px) 40vw, 82vw"
        width={1080}
        height={1440}
        alt={alt}
        fetchPriority="high"
      />
      <canvas ref={canvas} className="bulb__canvas" aria-hidden />
      <button
        type="button"
        className="bulb__switch"
        aria-pressed={lit}
        aria-label={buttonLabel}
        onClick={toggle}
        onPointerEnter={() =>
          (window as unknown as { __bulb?: BulbHandle }).__bulb?.setHover(true)
        }
        onPointerLeave={() =>
          (window as unknown as { __bulb?: BulbHandle }).__bulb?.setHover(false)
        }
      />
    </div>
  );
}
