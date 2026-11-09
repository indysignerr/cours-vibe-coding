"use client";

import { useEffect } from "react";
import { motionOn, whenMotion } from "@/lib/motion";

/**
 * Les animations au défilement d'une page.
 *
 * Un composant sans rendu, monté par chaque page. Il branche ce que le
 * HTML déclare par attribut, en deux étages.
 *
 * TOUT DE SUITE, sans rien charger — un IntersectionObserver :
 *   [data-reveal]   le bloc monte et apparaît en entrant dans la fenêtre
 *   [data-anim]     la scène d'un pilier joue tant qu'elle est à l'écran
 *   .tl__item       un nœud de la frise s'allume quand on le dépasse
 * Du contenu ne doit jamais attendre un script différé pour se montrer.
 *
 * PUIS, quand GSAP est arrivé — ce qui suit le défilement au pixel :
 *   [data-wire]       le fil du bord de section se déroule
 *   [data-manifesto]  les mots du manifeste s'allument un à un
 *   [data-rail]       le fil de la frise se déroule
 *   [data-parallax]   le bloc dérive un peu plus lentement que la page
 *
 * Les états de départ vivent dans le CSS, sous `html.motion` : sans
 * JavaScript rien n'est caché. Et tout est défait au démontage — changer
 * de page ne laisse ni observateur ni déclencheur derrière soi.
 */
declare global {
  interface Window {
    __motionNet?: number;
  }
}

export function ScrollFX() {
  useEffect(() => {
    if (!motionOn()) return;
    const main = document.getElementById("main");
    if (!main) return;

    let dead = false;
    let revert = () => {};

    // ---- Étage 1 : les apparitions ------------------------------------
    const reveal = new IntersectionObserver(
      (entries) => {
        let i = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          // Ceux qui entrent ensemble se suivent, à 70 ms d'écart.
          el.style.setProperty("--rd", `${Math.min(i++, 6) * 70}ms`);
          el.classList.add("is-in");
          reveal.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    main.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));

    const scenes = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("is-in", entry.isIntersecting);
        }
      },
      { rootMargin: "-12% 0px -18% 0px" },
    );
    main.querySelectorAll("[data-anim]").forEach((el) => scenes.observe(el));

    // Un nœud s'allume quand son haut passe la ligne des deux tiers, et ne
    // s'éteint que s'il repasse dessous — pas quand il sort par le haut.
    const nodes = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("is-on");
          else if (
            entry.rootBounds &&
            entry.boundingClientRect.top >= entry.rootBounds.bottom - 1
          ) {
            entry.target.classList.remove("is-on");
          }
        }
      },
      { rootMargin: "0px 0px -34% 0px" },
    );
    main.querySelectorAll(".tl__item").forEach((el) => nodes.observe(el));

    // Les apparitions ont pris la main : le filet n'a plus lieu d'être.
    window.clearTimeout(window.__motionNet);

    // ---- Étage 2 : ce qui suit le défilement --------------------------
    void whenMotion().then(({ gsap, ScrollTrigger, lenis }) => {
      if (dead) return;
      if (!window.location.hash) lenis?.scrollTo(0, { immediate: true, force: true });

      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-wire]").forEach((el) => {
          gsap.fromTo(
            el,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement,
                start: "top 78%",
                end: "bottom 62%",
                scrub: true,
              },
            },
          );
        });

        const manifesto = main.querySelector<HTMLElement>("[data-manifesto]");
        if (manifesto) {
          gsap.to(manifesto.querySelectorAll(".mw"), {
            opacity: 1,
            ease: "none",
            stagger: 0.5,
            scrollTrigger: {
              trigger: manifesto,
              start: "top 72%",
              end: "bottom 68%",
              scrub: true,
            },
          });
        }

        main.querySelectorAll<HTMLElement>("[data-rail]").forEach((rail) => {
          const fill = rail.querySelector(".tl__fill");
          if (!fill) return;
          gsap.fromTo(
            fill,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: rail,
                start: "top 66%",
                end: "bottom 66%",
                scrub: true,
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const amount = Number(el.dataset.parallax) || 10;
          gsap.fromTo(
            el,
            { yPercent: amount },
            {
              yPercent: -amount,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });
      }, main);

      // Les polices changent les hauteurs : on recale une fois qu'elles sont là.
      void document.fonts?.ready.then(() => !dead && ScrollTrigger.refresh());
      revert = () => ctx.revert();
    });

    return () => {
      dead = true;
      reveal.disconnect();
      scenes.disconnect();
      nodes.disconnect();
      revert();
    };
  }, []);

  return null;
}
