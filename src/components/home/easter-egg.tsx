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
 * long des sections, et un mot du bureau apparaît, épinglé en bas de
 * l'écran où qu'on soit dans la page.
 *
 * Le mot est un texte provisoire (content/i18n/*.json → egg.message).
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
    messageTitle: string;
    message: string;
    signature: string;
    close: string;
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

      {/* Le mot du bureau. Enfant direct de la section : aucun ancêtre
          transformé, donc le `fixed` cadre bien la fenêtre. */}
      <div className="note" role="status" aria-live="polite" data-open={lit}>
        {lit ? (
          <>
            <p className="note__title">{labels.messageTitle}</p>
            <p className="note__text">{labels.message}</p>
            <p className="note__sign">— {labels.signature}</p>
            <button type="button" className="note__close" onClick={() => set(false)}>
              {labels.off}
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
}
