"use client";

import { useEffect, useState } from "react";
import { Mascot } from "@/components/mascot";
import type { Badge } from "@/lib/badges";

/**
 * Le calque de récompenses. Un petit bus d'événements permet à n'importe
 * quel composant de déclencher un « +10 XP », des confettis ou un badge
 * sans remonter d'état. Monté une fois par page.
 */
type RewardEvent =
  | { kind: "xp"; amount: number }
  | { kind: "confetti" }
  | { kind: "badge"; badge: Badge };

const bus = typeof window !== "undefined" ? new EventTarget() : null;

export const reward = {
  xp: (amount: number) => bus?.dispatchEvent(new CustomEvent("reward", { detail: { kind: "xp", amount } })),
  confetti: () => bus?.dispatchEvent(new CustomEvent("reward", { detail: { kind: "confetti" } })),
  badge: (badge: Badge) => bus?.dispatchEvent(new CustomEvent("reward", { detail: { kind: "badge", badge } })),
};

const COLORS = ["var(--accent)", "var(--done)", "var(--streak)", "var(--xp)"];

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function RewardLayer() {
  const [toasts, setToasts] = useState<{ id: number; amount: number }[]>([]);
  const [confetti, setConfetti] = useState<number | null>(null);
  const [badge, setBadge] = useState<Badge | null>(null);

  useEffect(() => {
    if (!bus) return;
    const onReward = (e: Event) => {
      const d = (e as CustomEvent<RewardEvent>).detail;
      if (d.kind === "xp") {
        const id = Date.now() + Math.random();
        setToasts((t) => [...t, { id, amount: d.amount }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1400);
      } else if (d.kind === "confetti") {
        if (reducedMotion()) return;
        setConfetti(Date.now());
        setTimeout(() => setConfetti(null), 2600);
      } else if (d.kind === "badge") {
        setBadge(d.badge);
      }
    };
    bus.addEventListener("reward", onReward);
    return () => bus.removeEventListener("reward", onReward);
  }, []);

  return (
    <>
      {/* +XP qui monte et s'efface */}
      <div aria-live="polite" className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pill mb-2 border-xp-line bg-xp text-lg"
            style={{ animation: "xp-rise 1.4s cubic-bezier(0.22, 1, 0.36, 1) both" }}
          >
            {t.amount > 0 ? `+${t.amount}` : t.amount} XP
          </div>
        ))}
      </div>

      {/* confettis en CSS pur */}
      {confetti ? (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
          {Array.from({ length: 70 }, (_, i) => {
            const seed = (confetti + i * 9973) % 1000;
            return (
              <span
                key={i}
                className="absolute top-[-4%] block h-3 w-2 rounded-sm"
                style={{
                  left: `${(seed * 0.1) % 100}%`,
                  background: COLORS[i % COLORS.length],
                  animation: `confetti-fall ${1.8 + (seed % 9) / 10}s ease-in ${(seed % 6) / 10}s both`,
                  transform: `rotate(${seed % 360}deg)`,
                }}
              />
            );
          })}
        </div>
      ) : null}

      {/* badge qui se retourne */}
      {badge ? (
        <div
          role="dialog"
          aria-modal
          aria-labelledby="badge-title"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-6"
          onClick={() => setBadge(null)}
        >
          <div
            className="card-3d anim-pop w-full max-w-sm p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Mascot size={96} mood="party" className="anim-wiggle mx-auto" />
            <p className="mt-4 font-mono text-xs font-bold uppercase tracking-[0.15em] text-muted">New badge</p>
            <div className={`mx-auto mt-3 grid size-20 place-items-center rounded-3xl border-[3px] border-${badge.tone}-line bg-${badge.tone}`} style={{ animation: "badge-flip 900ms cubic-bezier(0.34, 1.56, 0.64, 1) both" }}>
              <badge.icon aria-hidden className="size-10" />
            </div>
            <h2 id="badge-title" className="mt-4 font-display text-3xl font-extrabold">{badge.label}</h2>
            <p className="mt-2 text-muted">{badge.description}</p>
            <button type="button" className="btn-3d mt-6 w-full" onClick={() => setBadge(null)} autoFocus>
              Nice
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
