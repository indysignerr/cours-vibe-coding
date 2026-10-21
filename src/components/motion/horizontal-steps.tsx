"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/components/motion/gsap";
import { useStill } from "@/components/motion/use-still";

export type Step = { n: string; title: string; body: string };

/**
 * Les étapes de la méthode, qui défilent latéralement pendant qu'on scrolle.
 *
 * La page s'épingle, le rail glisse. Quatre étapes tiennent dans un écran
 * de haut au lieu de quatre pavés empilés.
 *
 * Replié en liste verticale sur petit écran et sous prefers-reduced-motion :
 * confisquer trois écrans de défilement sur un téléphone n'est pas un effet,
 * c'est une gêne.
 */
export function HorizontalSteps({ steps }: { steps: Step[] }) {
  const root = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const still = useStill();

  useEffect(() => {
    const el = root.current;
    const track = rail.current;
    if (!el || !track || still) return;

    const ctx = gsap.context(() => {
      const distance = () => track.scrollWidth - el.clientWidth;
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance() + window.innerHeight * 0.6}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [still]);

  if (still) {
    return (
      <ol className="rows">
        {steps.map((s) => (
          <li key={s.n} className="py-8 first:pt-0">
            <span className="counter">{s.n}</span>
            <h3 className="display-3 mt-3">{s.title}</h3>
            <p className="mt-2.5 text-body">{s.body}</p>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div ref={root} className="relative overflow-hidden">
      <div className="flex h-[100svh] items-center">
        <div ref={rail} className="flex gap-6 px-5 will-change-transform md:px-8">
          {steps.map((s) => (
            <article
              key={s.n}
              className="card flex w-[min(78vw,30rem)] shrink-0 flex-col justify-between p-9 md:p-11"
            >
              <span className="counter text-base">{s.n}</span>
              <div className="mt-16">
                <h3 className="display-2">{s.title}</h3>
                <p className="mt-5 text-body">{s.body}</p>
              </div>
            </article>
          ))}

          {/* La dernière carte renvoie quelque part, sinon le rail finit dans le vide. */}
          <div className="flex w-[min(60vw,22rem)] shrink-0 items-center">
            <p className="display-2 text-muted">That is the whole method.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
