"use client";

import { useEffect, useRef } from "react";
import { gsap, reducedMotion } from "@/components/motion/gsap";

/**
 * Titre révélé mot à mot, chaque mot monté derrière un masque.
 *
 * On découpe par mot et non par lettre : à la taille d'un titre, le mot
 * reste lisible pendant l'animation, et un lecteur d'écran lit le texte
 * d'origine puisqu'on le laisse dans un élément visuellement caché.
 */
export function SplitLines({
  text,
  className = "",
  as: Tag = "h1",
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: React.ElementType;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLElement>("[data-word]");
    if (reducedMotion()) {
      gsap.set(words, { yPercent: 0, opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 115, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          delay,
          ease: "power4.out",
          stagger: 0.055,
        },
      );
    }, el);
    return () => ctx.revert();
  }, [delay, text]);

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="block">
        {text.split(" ").map((word, i) => (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
            <span data-word className="inline-block will-change-transform">
              {word}
              {i < text.split(" ").length - 1 ? " " : ""}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
