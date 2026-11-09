"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BulbMark } from "@/components/bulb-mark";
import { VaporCountdown } from "@/components/ui/vapor-countdown";
import { eventStartMs, shortDate, type SiteEvent } from "@/lib/events";
import { PILLARS, type Pillar } from "@/lib/pillars";

/**
 * L'accueil : une seule scène, zéro défilement.
 *
 * Le nom tient l'écran — L, l'ampoule à la place du I, G, H, T — et les
 * quatre piliers gravitent autour, un par quadrant. On ne déroule rien :
 * on clique un pilier et il s'ouvre dans un volet, on survole une lettre
 * et elle dit son mot, et le prochain évènement compte à rebours en bas.
 * Tout le reste vit dans le menu et dans les pages.
 *
 * Pourquoi une scène et pas une bobine : l'ancien accueil disait le
 * prochain évènement dans la hero, puis à nouveau dans le rail de
 * l'année ; les piliers dans le menu, puis sur la page ; et chaque
 * chapitre avait le même dessin. « Full redondant », à juste titre. Ici
 * chaque chose est dite une fois, à un seul endroit.
 *
 * Le mouvement. Au curseur, trois profondeurs : les lettres suivent un
 * peu, les piliers partent à l'opposé, l'ampoule penche vers lui — comme
 * une suspension qu'on effleure. Une seule boucle, deux variables CSS,
 * qui s'endort dès que le curseur s'arrête ; au doigt, elle ne tourne
 * pas. Au repos, l'ampoule se balance d'elle-même et son filament
 * respire : ce sont des keyframes, transform et opacity seulement.
 *
 * L'entrée. Sans l'ouverture (on revient sur l'accueil), l'ampoule
 * descend du plafond au bout de son fil et rebondit. Avec l'ouverture
 * (`html.opened`), elle vient de tomber sur le I du rideau : elle est
 * déjà là, et elle se balance encore. Une seule chute, jamais deux.
 *
 * Le volet est un `<dialog>` natif : le piège à focus, Échap, le fond,
 * le retour du focus au bouton — le navigateur les fait, et mieux.
 */

const GLYPHS: [string, string][] = [
  ["L", "Lab"],
  ["I", "Intelligent"],
  ["G", "Generative"],
  ["H", "Hands-on"],
  ["T", "Technology"],
];

export function HomeScene({ next }: { next?: SiteEvent }) {
  const stage = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<Pillar>(PILLARS[0]);

  const open = (p: Pillar) => {
    setActive(p);
    const d = sheet.current;
    if (d && !d.open) d.showModal();
  };
  const close = () => sheet.current?.close();

  // La parallaxe. Deux nombres entre -0,5 et 0,5 posés sur la scène ; le
  // CSS en fait trois profondeurs. Lissée, et endormie dès l'arrivée.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (still || !fine) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let frame = 0;

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.setProperty("--px", cx.toFixed(4));
      el.style.setProperty("--py", cy.toFixed(4));
      if (Math.abs(tx - cx) > 0.0005 || Math.abs(ty - cy) > 0.0005) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      wake();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      wake();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Un lien vers /#learn, depuis le menu ou une autre page, ouvre le volet
  // de ce pilier. Différé d'un tour pour ne pas poser d'état pendant
  // l'effet lui-même.
  useEffect(() => {
    const fromHash = () => {
      const p = PILLARS.find((x) => `#${x.key}` === window.location.hash);
      if (!p) return;
      setActive(p);
      const d = sheet.current;
      if (d && !d.open) d.showModal();
    };
    const t = window.setTimeout(fromHash, 0);
    window.addEventListener("hashchange", fromHash);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", fromHash);
    };
  }, []);

  const index = PILLARS.indexOf(active);

  return (
    <>
      <h1 className="sr-only">
        Albert L.I.G.H.T. — Lab of Intelligent, Generative, Hands-on
        Technology. Albert School&rsquo;s student lab for AI and code.
      </h1>

      <div ref={stage} className="scene">
        {/* Les quatre piliers, un par quadrant. */}
        <ul className="orbit" role="list" aria-label="What we do">
          {PILLARS.map((p, i) => (
            <li
              key={p.key}
              className={`sat sat--${p.key}`}
              style={{ "--i": i } as CSSProperties}
            >
              <button
                type="button"
                className="sat__btn"
                aria-haspopup="dialog"
                onClick={() => open(p)}
              >
                <span className="sat__n">0{i + 1}</span>
                <span className="sat__title">{p.title}</span>
                <span className="sat__verb">{p.verb}</span>
                <span className="sat__more" aria-hidden>
                  +
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Le nom. L'ampoule est le I ; chaque lettre dit son mot au survol. */}
        <div className="mark-wrap">
          <div className="mark" aria-hidden>
            {GLYPHS.map(([letter, word], i) => (
              <span
                key={letter}
                className={`glyph${letter === "I" ? " glyph--bulb" : ""}`}
                style={{ "--i": i } as CSSProperties}
              >
                {letter === "I" ? (
                  <span className="hang">
                    <span className="hang__drop">
                      <span className="hang__swing">
                        <span className="hang__cord" />
                        <BulbMark
                          className="hang__bulb"
                          raysClassName="hang__rays"
                          filamentClassName="hang__filament"
                        />
                      </span>
                    </span>
                  </span>
                ) : (
                  <span className="glyph__char">{letter}</span>
                )}
                <span className="glyph__w">{word}</span>
              </span>
            ))}
          </div>
          <p className="scene__caption">
            Albert School&rsquo;s student lab for AI and code. Free, in Milan.
          </p>
        </div>

        {/* Le prochain évènement, et les secondes qui tombent en grains. */}
        {next ? (
          <div className="next">
            <Link href={`/events/${next.slug}/`} className="next__link">
              <span className="eyebrow eyebrow--accent">Next</span>
              <span className="next__title">
                {next.title}
                <span className="next__arrow" aria-hidden>
                  {" "}
                  →
                </span>
              </span>
              <span className="next__meta tnum">
                {shortDate(next.date)}
                {next.start ? ` · ${next.start}` : ""} · {next.audience}
              </span>
            </Link>
            <VaporCountdown
              targetDate={eventStartMs(next)}
              size="clamp(1.5rem, 2.6vw, 2.4rem)"
              className="next__count"
            />
          </div>
        ) : null}
      </div>

      {/* Le volet d'un pilier. */}
      <dialog
        ref={sheet}
        className="sheet"
        aria-labelledby="sheet-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onClose={() => {
          if (window.location.hash) {
            window.history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search,
            );
          }
        }}
      >
        <div className="sheet__inner">
          <div className="sheet__head">
            <p className="eyebrow eyebrow--accent">
              0{index + 1} · {active.title}
            </p>
            <button type="button" className="sheet__close tap" onClick={close}>
              Close
              <span aria-hidden className="sheet__x">
                ×
              </span>
            </button>
          </div>

          <h2 id="sheet-title" className="display-2">
            {active.verb}
          </h2>

          <ul className="sheet__formats">
            {active.formats.map((f) => (
              <li key={f.name}>
                <span className="sheet__name">{f.name}</span>
                <span className="sheet__what">{f.what}</span>
                <span className="eyebrow">{f.length}</span>
              </li>
            ))}
          </ul>

          <div className="sheet__actions">
            <Link className="btn btn--primary" href="/events/" onClick={close}>
              See the dates
            </Link>
            <Link className="btn btn--ghost" href="/join/" onClick={close}>
              How to join
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
