"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/brand";

/**
 * L'ampoule suspendue — l'élément signature du site.
 *
 * La marque est une ampoule ; plutôt que de le dire, on la rend
 * manipulable. Elle pend au bout d'un fil, on peut l'attraper et la faire
 * balancer, et sa cordelette allume ou éteint la pièce.
 *
 * Le balancement est un vrai pendule amorti, intégré image par image :
 *   θ'' = −(g/L)·sin θ − c·θ'
 * Un simple ressort CSS ne donne pas ça — il revient au repos sans
 * dépasser, alors qu'un pendule oscille de part et d'autre en
 * s'épuisant. C'est cette oscillation qu'on reconnaît comme « physique ».
 *
 * Accessibilité : l'interrupteur est un vrai <button>, atteignable au
 * clavier et annoncé. Le balancement est un agrément — sous
 * prefers-reduced-motion l'ampoule reste immobile et le bouton marche.
 */
export function HangingBulb({
  lit,
  onToggle,
  className = "",
}: {
  lit: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const rig = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(0);

  // L'état physique vit dans des refs : il change à chaque image et n'a
  // pas à déclencher un rendu React par image.
  const theta = useRef(0);
  const omega = useRef(0);
  const dragging = useRef(false);
  const still = useRef(false);

  useEffect(() => {
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still.current) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      // Pas de temps borné : un onglet revenu d'arrière-plan livre un
      // delta énorme qui ferait exploser l'intégration.
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      if (!dragging.current) {
        const G = 9.81;
        const L = 1.15; // longueur du fil, en mètres
        const DAMPING = 0.9;
        const acc = -(G / L) * Math.sin(theta.current) - DAMPING * omega.current;
        omega.current += acc * dt;
        theta.current += omega.current * dt;

        // Au repos, on arrête net plutôt que de laisser traîner un
        // frémissement invisible qui garde la boucle vivante.
        if (Math.abs(theta.current) < 0.0015 && Math.abs(omega.current) < 0.0015) {
          theta.current = 0;
          omega.current = 0;
        }
      }

      setAngle(theta.current);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  /** Convertit la position du pointeur en angle du fil. */
  const aimAt = useCallback((clientX: number, clientY: number) => {
    const el = rig.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pivotX = r.left + r.width / 2;
    const pivotY = r.top;
    const next = Math.atan2(clientX - pivotX, Math.max(clientY - pivotY, 1));
    // On borne : au-delà, le fil remonterait au-dessus du point d'accroche.
    theta.current = Math.max(-1.1, Math.min(1.1, next));
    omega.current = 0;
  }, []);

  useEffect(() => {
    if (still.current) return;

    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      aimAt(e.clientX, e.clientY);
    };
    const up = () => {
      dragging.current = false;
    };

    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [aimAt]);

  const deg = (angle * 180) / Math.PI;

  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <div
        ref={rig}
        className="origin-top"
        style={{ transform: `rotate(${deg}deg)`, willChange: "transform" }}
      >
        {/* Le fil */}
        <span
          aria-hidden
          className="mx-auto block w-px"
          style={{ height: "clamp(4rem, 14vh, 9rem)", background: "var(--line-strong)" }}
        />

        {/* L'ampoule, attrapable */}
        <span
          className="pointer-events-auto mx-auto block w-fit cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => {
            if (still.current) return;
            dragging.current = true;
            aimAt(e.clientX, e.clientY);
          }}
        >
          <span
            className="block rounded-full transition-[filter,opacity] duration-500"
            style={{
              filter: lit
                ? "drop-shadow(0 0 2.5rem rgba(201,174,132,0.55)) drop-shadow(0 0 7rem rgba(201,174,132,0.3))"
                : "none",
            }}
          >
            <BrandMark
              className="size-24 md:size-32"
              outline={lit ? "var(--brand-soft)" : "var(--muted)"}
              glyph={lit ? "var(--brand)" : "var(--muted)"}
            />
          </span>
        </span>

        {/* La cordelette : c'est elle, l'interrupteur */}
        <span aria-hidden className="mx-auto mt-1 block h-10 w-px" style={{ background: "var(--line-strong)" }} />
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={lit}
          className="tap pointer-events-auto mx-auto -mt-1 flex items-center justify-center rounded-full"
          style={{ width: 44, height: 44 }}
        >
          <span className="sr-only">{lit ? "Turn the lights off" : "Turn the lights on"}</span>
          <span
            aria-hidden
            className="block size-3 rounded-full transition-colors duration-300"
            style={{ background: lit ? "var(--brand)" : "var(--line-strong)" }}
          />
        </button>
      </div>
    </div>
  );
}
