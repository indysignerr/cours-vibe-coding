"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Un filet beige qui suit l'avancement de la page, sous l'en-tête. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-brand"
      style={{ scaleX }}
    />
  );
}
