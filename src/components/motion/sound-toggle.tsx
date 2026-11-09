"use client";

import { useEffect, useSyncExternalStore } from "react";
import { playIgnite } from "@/lib/sound";
import { SOUND_KEY, soundStore } from "@/lib/stage";

/**
 * Le bouton du son. Coupé par défaut, et le choix est retenu.
 *
 * L'activer joue l'allumage une fois : c'est à la fois la confirmation
 * et le geste qui autorise le navigateur à produire du son ensuite.
 */
export function SoundToggle({
  label,
  on,
  off,
}: {
  label: string;
  on: string;
  off: string;
}) {
  const active = useSyncExternalStore(
    soundStore.subscribe,
    soundStore.get,
    () => false,
  );

  useEffect(() => {
    try {
      soundStore.set(window.localStorage.getItem(SOUND_KEY) === "on");
    } catch {
      // Stockage indisponible (navigation privée) : le son reste coupé.
    }
  }, []);

  const toggle = () => {
    const next = !soundStore.get();
    soundStore.set(next);
    try {
      window.localStorage.setItem(SOUND_KEY, next ? "on" : "off");
    } catch {
      // Tant pis pour la mémoire, le réglage vaut pour cette visite.
    }
    if (next) playIgnite();
  };

  return (
    <button
      type="button"
      className="sound"
      aria-pressed={active}
      aria-label={label}
      title={active ? on : off}
      onClick={toggle}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
        <path
          d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {active ? (
          <path
            d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.6 7.6 0 0 1 0 11"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="m16 9.5 5 5m0-5-5 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
}
