"use client";

import { useEffect, useRef } from "react";

/**
 * Apparition à l'arrivée dans la fenêtre.
 *
 * L'état caché vit dans une classe CSS posée au montage, jamais dans le
 * rendu : une page servie sans JavaScript reste entièrement lisible.
 *
 * Deux déclencheurs, volontairement redondants, après un bug franc où des
 * sections entières restaient à opacité zéro — y compris, sur certaines
 * pages, tout le contenu utile :
 *
 *   — un IntersectionObserver, qui fait le travail dans la vie normale ;
 *   — un filet inconditionnel à cinq secondes, qui révèle tout quoi qu'il
 *     arrive. L'observateur peut ne jamais se déclencher (onglet en
 *     arrière-plan, mise en page recalculée sous lui), et une animation
 *     manquée vaut toujours mieux qu'une page vide.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  stagger = false,
  delay = 0,
  y = 26,
  once = true,
}: {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  stagger?: boolean;
  /** Retard avant l'entrée, en secondes, pour rester cohérent avec GSAP. */
  delay?: number;
  y?: number;
  /** Conservé pour l'appel : une entrée ne se rejoue jamais. */
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  void once;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.setProperty("--reveal-y", `${y}px`);
    el.classList.add("reveal-armed");
    if (stagger) el.classList.add("reveal-stagger");

    /**
     * Deux chemins, et ils ne font pas la même chose.
     *
     * Le chemin normal ajoute « is-in » et laisse la transition jouer.
     * Une seconde plus tard on désarme : la règle qui cache est retirée,
     * et l'élément retrouve son style par défaut.
     *
     * Le filet, lui, désarme directement. Il ne pose pas une règle
     * concurrente — il enlève celle qui cache. C'est la différence entre
     * « demander au navigateur d'animer vers visible », qui suppose que
     * le compositeur tourne, et « ne plus rien cacher du tout », qui ne
     * suppose rien. Un onglet qui ne peint pas laissait sinon le contenu
     * figé au début de sa transition, donc invisible.
     */
    let armed = true;
    const disarm = () => {
      if (!armed) return;
      armed = false;
      el.classList.remove("reveal-armed", "reveal-stagger");
    };

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      el.classList.add("is-in");
      window.setTimeout(disarm, 1200);
    };
    const showAfterDelay = () => {
      if (delay > 0) window.setTimeout(show, delay * 1000);
      else show();
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          showAfterDelay();
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    io.observe(el);

    const net = window.setTimeout(disarm, 5000);

    return () => {
      window.clearTimeout(net);
      io.disconnect();
      el.classList.remove("reveal-armed", "reveal-stagger", "is-in");
    };
  }, [stagger, delay, y]);

  return (
    <Tag ref={ref} className={className} data-reveal>
      {children}
    </Tag>
  );
}
