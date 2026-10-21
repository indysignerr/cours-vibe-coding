"use client";

import { useEffect, useRef } from "react";
import { gsap, reducedMotion } from "@/components/motion/gsap";

/**
 * Apparition à l'arrivée dans la fenêtre.
 *
 * `stagger` anime les enfants directs les uns après les autres, ce qui
 * donne le rythme sans qu'on ait à poser un délai à la main partout.
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
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Sans mouvement : on montre tout, tout de suite.
    if (reducedMotion()) {
      gsap.set(stagger ? Array.from(el.children) : el, { opacity: 1, y: 0 });
      return;
    }

    const targets = stagger ? Array.from(el.children) : el;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          delay,
          ease: "power3.out",
          stagger: stagger ? 0.09 : 0,
          scrollTrigger: { trigger: el, start: "top 86%", once },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [stagger, delay, y, once]);

  return (
    <Tag ref={ref} className={className} data-reveal>
      {children}
    </Tag>
  );
}
