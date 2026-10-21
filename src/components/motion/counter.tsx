"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, reducedMotion } from "@/components/motion/gsap";

/** Un nombre qui compte jusqu'à sa valeur quand il entre dans la fenêtre. */
export function Counter({
  to,
  prefix = "",
  suffix = "",
  className = "",
  duration = 1.6,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // On part de la valeur finale : si le JavaScript ne tourne pas, ou si le
  // système demande moins de mouvement, le nombre juste est déjà affiché.
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const box = { n: 0 };
    const ctx = gsap.context(() => {
      gsap.set(box, { n: 0 });
      setValue(0);
      gsap.to(box, {
        n: to,
        duration,
        ease: "power2.out",
        onUpdate: () => setValue(Math.round(box.n)),
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [to, duration]);

  return (
    <span ref={ref} className={`tnum ${className}`}>
      {prefix}
      {value.toLocaleString("en-GB")}
      {suffix}
    </span>
  );
}
