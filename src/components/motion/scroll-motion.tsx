"use client";

import { useEffect } from "react";

/**
 * Le cintrage au défilement.
 *
 * Les sections s'inclinent et s'étirent selon la VITESSE du
 * défilement, pas selon la position : on accélère, la page se cintre ;
 * on s'arrête, elle se redresse. C'est la signature la plus reconnaissable
 * du motion dense, et c'est ce qui donne de la matière à un scroll qui
 * serait sinon une simple translation.
 *
 * Deux décisions qui tiennent la promesse de fluidité :
 *
 * 1. La boucle S'ENDORT. Tant que la vitesse résiduelle est nulle, il
 *    n'y a aucune image calculée — le scroll ne coûte alors rien. Un
 *    rAF qui tourne en permanence est exactement ce qui faisait ramer
 *    ce site avant.
 * 2. Le cintrage est posé sur chaque SECTION, jamais sur un conteneur
 *    global. Un `transform` sur un ancêtre ferait de lui le bloc
 *    conteneur de tout `position: fixed` descendant : l'en-tête collant
 *    et le menu plein écran cesseraient de fonctionner.
 */
export function ScrollMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const panels = Array.from(
      document.querySelectorAll<HTMLElement>("#main > section"),
    );
    if (panels.length === 0) return;

    let last = window.scrollY;
    let velocity = 0;
    let frame = 0;
    let idle = 0;

    const apply = (skew: number, squash: number) => {
      for (const p of panels) {
        p.style.transform = `skewY(${skew}deg) scaleY(${squash})`;
      }
    };

    const tick = () => {
      const now = window.scrollY;
      const delta = now - last;
      last = now;

      // Lissage : la vitesse brute saute, l'œil veut une inertie.
      velocity += (delta - velocity) * 0.16;
      idle = Math.abs(delta) > 0.5 ? 0 : idle + 1;

      const skew = Math.max(-5, Math.min(5, velocity * 0.055));
      const squash = 1 + Math.min(0.035, Math.abs(velocity) * 0.0007);
      apply(skew, squash);

      // On laisse toujours quelques images à la détente, sinon un
      // à-coup très court se termine avant d'être visible.
      if (Math.abs(velocity) > 0.08 || idle < 6) {
        frame = requestAnimationFrame(tick);
      } else {
        // Au repos, on retire le transform : pas de couche inutile, et
        // surtout pas de bloc conteneur qui traîne.
        for (const p of panels) p.style.transform = "";
        frame = 0;
      }
    };

    const wake = () => {
      // On NE réinitialise PAS `last` ici : ce serait annuler le
      // déplacement qui vient justement de déclencher ce réveil, et la
      // vitesse resterait nulle — la boucle s'arrêtait aussitôt après
      // avoir démarré, sans jamais rien incliner.
      if (!frame) frame = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", wake, { passive: true });

    return () => {
      window.removeEventListener("scroll", wake);
      if (frame) cancelAnimationFrame(frame);
      for (const p of panels) p.style.transform = "";
    };
  }, []);

  return null;
}
