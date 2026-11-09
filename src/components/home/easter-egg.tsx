"use client";

import { useSyncExternalStore } from "react";
import { playIgnite, playOff } from "@/lib/sound";
import { litStore } from "@/lib/stage";

/**
 * L'easter egg : l'interrupteur.
 *
 * Deux façons d'allumer — cliquer l'ampoule du haut de page, ou
 * basculer cet interrupteur. Allumée, la page change : `is-lit` sur
 * <html> pousse la lueur de l'ampoule, fait briller le fil qui court le
 * long des sections, et un mot du bureau vient s'épingler en bas de
 * l'écran (voir LightNote, monté une fois pour tout le site).
 */
export function EasterEgg({
  labels,
}: {
  labels: {
    eyebrow: string;
    title: string;
    body: string;
    on: string;
    off: string;
  };
}) {
  const lit = useSyncExternalStore(litStore.subscribe, litStore.get, () => false);

  const set = (next: boolean) => {
    litStore.set(next);
    if (next) playIgnite();
    else playOff();
  };

  return (
    <section className="egg" aria-labelledby="egg-title">
      <span className="wire" data-wire aria-hidden />
      <div className="container egg__in">
        <div className="egg__text">
          <p className="eyebrow eyebrow--accent" data-reveal>
            {labels.eyebrow}
          </p>
          <h2 className="display-1" id="egg-title" data-reveal>
            {labels.title}
          </h2>
          <p className="lede" data-reveal>
            {labels.body}
          </p>
        </div>

        <button
          type="button"
          className="switch"
          aria-pressed={lit}
          onClick={() => set(!lit)}
          data-parallax="8"
        >
          <span className="switch__plate" aria-hidden>
            <span className="switch__lever" />
          </span>
          <span className="switch__label">{lit ? labels.off : labels.on}</span>
        </button>
      </div>

    </section>
  );
}
