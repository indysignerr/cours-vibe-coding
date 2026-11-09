"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { playOff } from "@/lib/sound";
import { litStore } from "@/lib/stage";

export type NoteLabels = {
  messageTitle: string;
  message: string;
  signature: string;
  off: string;
};

/**
 * Le mot du bureau : un billet épinglé sous la lampe.
 *
 * Quand la lumière s'allume — par l'ampoule du haut de page ou par
 * l'interrupteur de la dernière section — un billet de papier vient se
 * balancer sur sa punaise, en bas de l'écran. Il est écrit à l'encre
 * sympathique : c'est la chaleur de l'ampoule qui la fait monter, lettre
 * après lettre, du jaune pâle au brun. On éteint, la punaise lâche.
 *
 * Il est monté une fois par document, hors des pages : il suit le visiteur
 * d'une page à l'autre tant que la lumière est allumée, et c'est lui qui
 * porte de quoi l'éteindre partout.
 *
 * Le texte est provisoire (content/i18n/*.json → egg.message).
 */
export function LightNote({ labels }: { labels: NoteLabels }) {
  const lit = useSyncExternalStore(litStore.subscribe, litStore.get, () => false);

  // Le billet reste dans la page le temps de tomber : sans cela il se
  // viderait d'un coup, et c'est une feuille blanche qu'on verrait partir.
  const [falling, setFalling] = useState(false);
  useEffect(() => {
    let timer = 0;
    const off = litStore.subscribe(() => {
      window.clearTimeout(timer);
      if (litStore.get()) {
        setFalling(false);
      } else {
        setFalling(true);
        timer = window.setTimeout(() => setFalling(false), 700);
      }
    });
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, []);

  const letters = Array.from(labels.messageTitle);

  return (
    <div className="note" role="status" aria-live="polite" data-open={lit}>
      {lit || falling ? (
        <div className="note__paper" style={{ "--n": letters.length } as React.CSSProperties}>
          <div className="note__sheet">
            <span className="note__pin" aria-hidden />
            <p className="note__title">
              {/* Un lecteur d'écran lit la phrase, pas vingt lettres. */}
              <span className="sr-only">{labels.messageTitle}</span>
              <span aria-hidden>
                {letters.map((letter, i) => (
                  <span key={i} className="note__ink" style={{ "--k": i } as React.CSSProperties}>
                    {letter}
                  </span>
                ))}
              </span>
            </p>
            <p className="note__text">{labels.message}</p>
            <p className="note__sign">— {labels.signature}</p>
            <button
              type="button"
              className="note__close"
              onClick={() => {
                litStore.set(false);
                playOff();
              }}
            >
              {labels.off}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
