"use client";

import { useEffect, useRef } from "react";
import { BulbMark } from "@/components/bulb-mark";

/**
 * LA LUMIÈRE.
 *
 * Le site est dans le noir. Le curseur est une source de lumière, et
 * seul ce qu'elle touche apparaît. On n'y défile pas pour lire : on y
 * éclaire pour découvrir. La mécanique sort du nom — Lab of
 * Intelligent, Generative, Hands-on Technology.
 *
 * L'ampoule EST le curseur : elle suit la souris, elle se balance quand
 * on l'emporte — comme une lampe qu'on tient au bout du bras — et le
 * halo tombe d'elle, légèrement en dessous. Sans la source visible,
 * l'effet n'était qu'un trou qui se déplace.
 *
 * TECHNIQUE. Le voile est un immense disque percé — un dégradé radial
 * transparent au centre, opaque au bord — bien plus grand que l'écran,
 * qu'on déplace en `transform`. C'est le point important : un
 * `transform` reste sur le compositeur, alors qu'animer la position
 * d'un `mask` repeindrait l'écran entier à chaque image. La boucle
 * s'endort dès que la lumière a rejoint le curseur.
 *
 * CE QUI REND LE SITE UTILISABLE MALGRÉ TOUT, et qui n'est pas
 * négociable :
 *
 * - Au clavier, la lumière saute sur l'élément qui prend le focus. Sans
 *   cela, naviguer au Tab reviendrait à lire dans le noir.
 * - Sans souris fine (téléphone, tablette), la lumière se pose au
 *   centre et s'élargit beaucoup : on lit normalement, l'ambiance reste.
 * - `prefers-reduced-motion` éteint le voile. Pas d'effet du tout.
 * - Le voile est `aria-hidden` et `pointer-events: none` : il ne change
 *   rien au contenu, ni pour un lecteur d'écran, ni pour un robot.
 */
export function LightReveal() {
  const veil = useRef<HTMLDivElement>(null);
  const lamp = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = veil.current;
    const bulb = lamp.current;
    if (!el || !bulb) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    document.documentElement.classList.add("has-light");
    if (!fine) {
      // Au doigt : une lumière large, posée au centre, qui ne poursuit rien.
      document.documentElement.classList.add("has-light--wide");
      return () => {
        document.documentElement.classList.remove(
          "has-light",
          "has-light--wide",
        );
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
    let moved = false;

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

    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent | MouseEvent) => {
      moved = true;
      target.x = e.clientX;
      target.y = e.clientY;
      wake();
    };

    const GRASPABLE =
      "a, button, summary, [role='button'], input, textarea, select, label";
    const onOver = (e: Event) => {
      const node = e.target as Element | null;
      widen = node?.closest?.(GRASPABLE) ? 1 : 0;
      wake();
    };
    const onDown = () => {
      pulse = 1;
      wake();
    };

    // Le relais depuis l'ouverture : la lampe naît là où l'ampoule s'est
    // posée, et y reste tant que la souris n'a pas bougé.
    const onHandoff = (e: Event) => {
      const d = (e as CustomEvent<{ x: number; y: number }>).detail;
      if (!d) return;
      // La lampe est dessinée au-dessus du halo : on décale pour que ce
      // soit l'ampoule, pas le halo, qui coïncide.
      current.x = d.x;
      current.y = d.y + 54;
      if (!moved) {
        target.x = current.x;
        target.y = current.y;
      }
      swing = 16;
      draw();
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

    draw();
    // Les deux : certains environnements n'émettent que `mousemove`, et
    // perdre le suivi du curseur ferait du site une page noire.
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("albert:lamp", onHandoff);
    document.addEventListener("focusin", onFocus, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("albert:lamp", onHandoff);
      document.removeEventListener("focusin", onFocus, true);
      document.documentElement.classList.remove("has-light", "has-light--wide");
    };
  }, []);

  return (
    <>
      <div ref={veil} className="veil" aria-hidden />
      <div ref={lamp} className="lamp" aria-hidden>
        <span className="lamp__cord" />
        <BulbMark className="lamp__svg" raysClassName="lamp__rays" />
      </div>
    </>
  );
}
