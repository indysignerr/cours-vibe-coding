"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { BulbMark } from "@/components/bulb-mark";

/**
 * LA LUMIÈRE.
 *
 * Un mode, pas une condition de lecture. Le site arrive entier après
 * l'ouverture — la plonger dans le noir gâchait la fin de la séquence —
 * et un cordon pend en haut à droite. On le tire : la pièce s'éteint,
 * une ampoule descend du plafond jusqu'au curseur, et seul ce qu'elle
 * touche apparaît. On n'y défile plus pour lire : on y éclaire pour
 * découvrir. La mécanique sort du nom — Lab of Intelligent, Generative,
 * Hands-on Technology.
 *
 * L'ampoule EST le curseur : elle suit la souris, elle se balance quand
 * on l'emporte — comme une lampe qu'on tient au bout du bras — et le
 * halo tombe d'elle, légèrement en dessous. Sans la source visible,
 * l'effet n'était qu'un trou qui se déplace.
 *
 * ET ELLE S'ÉTEINT AUSSI VITE. Un clic n'importe où — hors d'un lien,
 * d'un bouton, d'un champ — remonte la lampe et rallume la pièce. Au
 * bout d'un moment l'effet fatigue, et c'est au visiteur de décider
 * quand. Le choix tient le temps de la session, d'une page à l'autre.
 *
 * TECHNIQUE. Le voile est un immense disque percé — un dégradé radial
 * transparent au centre, opaque au bord — bien plus grand que l'écran,
 * qu'on déplace en `transform`. C'est le point important : un
 * `transform` reste sur le compositeur, alors qu'animer la position
 * d'un `mask` repeindrait l'écran entier à chaque image. La boucle
 * s'endort dès que la lumière a rejoint le curseur, et ne tourne pas du
 * tout tant que la lampe est éteinte — c'est-à-dire par défaut.
 *
 * CE QUI REND LE MODE UTILISABLE, et qui n'est pas négociable :
 *
 * - Au clavier, la lumière saute sur l'élément qui prend le focus. Sans
 *   cela, naviguer au Tab reviendrait à lire dans le noir. Échap éteint.
 * - Sans souris fine (téléphone, tablette), la lumière se pose au
 *   centre et s'élargit beaucoup : on lit normalement, l'ambiance reste.
 * - `prefers-reduced-motion` : ni voile, ni cordon. Pas d'effet du tout.
 * - Le voile est `aria-hidden` et `pointer-events: none` : il ne change
 *   rien au contenu, ni pour un lecteur d'écran, ni pour un robot.
 */

const KEY = "albert-light:lamp";

/*
 * L'état vit hors de React : la boucle d'animation le lit à chaque image
 * et le cordon l'affiche. Un petit store partagé évite de faire rendre le
 * composant à chaque mouvement de souris. `used` retient si le visiteur a
 * déjà touché au cordon : tant que non, l'invitation reste affichée.
 */
type LampState = { lit: boolean; used: boolean };
let state: LampState = { lit: false, used: false };
const SERVER: LampState = { lit: false, used: false };
const listeners = new Set<() => void>();
const lampStore = {
  get: () => state,
  set(next: Partial<LampState>) {
    const merged = { ...state, ...next };
    if (merged.lit === state.lit && merged.used === state.used) return;
    state = merged;
    listeners.forEach((fn) => fn());
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

export function LightReveal() {
  const veil = useRef<HTMLDivElement>(null);
  const lamp = useRef<HTMLDivElement>(null);
  const { lit, used } = useSyncExternalStore(
    lampStore.subscribe,
    lampStore.get,
    () => SERVER,
  );

  useEffect(() => {
    const el = veil.current;
    const bulb = lamp.current;
    if (!el || !bulb) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) return;

    const root = document.documentElement;
    const fine = window.matchMedia("(pointer: fine)").matches;

    // Éteinte par défaut. Allumée plus tôt dans la session : on repart
    // allumé. Les classes sont posées dans le même tour, donc le voile naît
    // directement dans le bon état et rien ne clignote.
    const stored = sessionStorage.getItem(KEY);
    lampStore.set({ lit: stored === "on", used: stored !== null });
    root.classList.add("has-light");
    root.classList.toggle("light-off", !lampStore.get().lit);
    if (!fine) root.classList.add("has-light--wide");

    const GRASPABLE =
      "a, button, summary, [role='button'], input, textarea, select, label";

    // Le clic qui éteint : pas sur ce qu'on peut saisir, pas pendant
    // l'ouverture, pas dans le menu, pas quand on sélectionne du texte, pas
    // au bout d'un glisser. Sinon chaque geste ordinaire éteindrait.
    let down = { x: 0, y: 0 };
    const onPress = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY };
    };
    const onClick = (e: MouseEvent) => {
      if (!lampStore.get().lit) return;
      const node = e.target as Element | null;
      if (!node || node.closest(GRASPABLE)) return;
      if (root.classList.contains("is-opening")) return;
      if (node.closest("[aria-modal='true'], dialog[open]")) return;
      if (window.getSelection()?.isCollapsed === false) return;
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return;
      lampStore.set({ lit: false, used: true });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !lampStore.get().lit) return;
      if (document.querySelector("[aria-modal='true'], dialog[open]")) return;
      lampStore.set({ lit: false, used: true });
    };

    document.addEventListener("pointerdown", onPress, { passive: true });
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);

    const cleanupShared = () => {
      document.removeEventListener("pointerdown", onPress);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      root.classList.remove("has-light", "has-light--wide", "light-off");
    };

    const remember = () => {
      const on = lampStore.get().lit;
      root.classList.toggle("light-off", !on);
      sessionStorage.setItem(KEY, on ? "on" : "off");
    };

    if (!fine) {
      // Au doigt : une lumière large, posée au centre, qui ne poursuit rien.
      const unsubscribe = lampStore.subscribe(remember);
      return () => {
        unsubscribe();
        cleanupShared();
      };
    }

    const target = { x: window.innerWidth / 2, y: window.innerHeight * 0.4 };
    const current = { ...target };
    let frame = 0;

    // Le balancement : l'ampoule penche à l'opposé de son déplacement,
    // puis revient. C'est ce qui lui donne du poids.
    let swing = 0;
    // L'ouverture : sur un lien ou un bouton, le halo s'élargit — la lampe
    // « regarde » ce qu'on peut saisir. Au clic, elle vacille.
    let widen = 0;
    let widenNow = 0;
    let pulse = 0;

    const draw = () => {
      const scale = (1 + 0.34 * widenNow) * (1 - 0.14 * pulse);
      el.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) scale(${scale.toFixed(4)})`;
      // La lampe est posée au-dessus du halo : la lumière tombe d'elle.
      bulb.style.transform =
        `translate3d(${current.x}px, ${current.y}px, 0) rotate(${swing.toFixed(2)}deg)` +
        ` scale(${(1 - 0.07 * pulse).toFixed(4)})`;
    };

    const tick = () => {
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      current.x += dx * 0.16;
      current.y += dy * 0.16;

      // Le retard sur l'axe horizontal donne l'angle, borné à 18°.
      const lean = Math.max(-18, Math.min(18, dx * 0.12));
      swing += (lean - swing) * 0.12;
      widenNow += (widen - widenNow) * 0.12;
      pulse *= 0.86;

      draw();

      // Arrivée : on arrête la boucle. Un rAF qui tourne pour rien, c'est
      // exactement ce qui faisait ramer ce site.
      const settling =
        Math.abs(widen - widenNow) > 0.004 ||
        pulse > 0.01 ||
        Math.abs(swing) > 0.05;
      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4 || settling) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };

    // Éteinte, la boucle ne tourne pas : rien à suivre. On retient quand
    // même où est le curseur, pour que la lampe descende au bon endroit.
    const wake = () => {
      if (!frame && lampStore.get().lit) frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent | MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      wake();
    };

    const onOver = (e: Event) => {
      const node = e.target as Element | null;
      widen = node?.closest?.(GRASPABLE) ? 1 : 0;
      wake();
    };
    const onDown = () => {
      pulse = 1;
      wake();
    };

    // Le clavier : la lumière suit le focus, sinon le Tab navigue à l'aveugle.
    const onFocus = (e: FocusEvent) => {
      const node = e.target as HTMLElement | null;
      if (!node?.getBoundingClientRect) return;
      const r = node.getBoundingClientRect();
      target.x = r.left + r.width / 2;
      target.y = r.top + r.height / 2;
      wake();
    };

    // Allumer / éteindre. À l'allumage la lampe descend là où est le
    // curseur maintenant, pas là où on l'avait laissée.
    const unsubscribe = lampStore.subscribe(() => {
      remember();
      if (lampStore.get().lit) {
        current.x = target.x;
        current.y = target.y;
        swing = 0;
        pulse = 0;
        draw();
        wake();
      } else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });

    draw();
    // Les deux : certains environnements n'émettent que `mousemove`, et
    // perdre le suivi du curseur ferait du site une page noire.
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("focusin", onFocus, true);

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("focusin", onFocus, true);
      cleanupShared();
    };
  }, []);

  return (
    <>
      <div ref={veil} className="veil" aria-hidden />
      <div ref={lamp} className="lamp" aria-hidden>
        {/* Le bras : c'est lui qui descend du plafond quand on allume, et qui
            y remonte quand on éteint, pendant que le parent reste positionné
            par la boucle. */}
        <span className="lamp__arm">
          <span className="lamp__cord" />
          <BulbMark className="lamp__svg" raysClassName="lamp__rays" />
        </span>
      </div>

      {/* Le cordon, en haut à droite : l'interrupteur de la lampe. Il est
          au-dessus du voile, donc toujours visible dans le noir. Seule la
          perle est un bouton — le fil, décoratif, laisse passer les clics
          vers l'en-tête qu'il traverse. Les clés rejouent la secousse et
          le rappel à chaque bascule sans remonter le bouton lui-même, pour
          que le focus clavier n'y soit pas perdu ; tant que personne n'y a
          touché, l'invitation reste. */}
      <div className={`cord${used ? "" : " cord--fresh"}`}>
        <span className="cord__line" key={lit ? "line-on" : "line-off"} aria-hidden />
        <button
          type="button"
          className="cord__switch"
          aria-pressed={lit}
          onClick={() => lampStore.set({ lit: !lampStore.get().lit, used: true })}
        >
          <span className="cord__bead" key={lit ? "bead-on" : "bead-off"} aria-hidden />
          <span className="sr-only">Lamp</span>
          <span className="cord__hint" key={lit ? "hint-on" : "hint-off"} aria-hidden>
            {lit ? "Click anywhere to switch the lamp off" : "Pull to switch the lamp on"}
          </span>
        </button>
      </div>
    </>
  );
}
