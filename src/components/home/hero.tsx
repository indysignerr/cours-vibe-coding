import Link from "next/link";
import { Plate, PLATE_ON } from "@/components/home/plate";
import { NextEvent } from "@/components/next-event";
import { today } from "@/lib/events";
import { href, t, type Locale } from "@/lib/i18n";
import { timelineItems } from "@/lib/timeline";

/**
 * Le haut de page : une planche de dessin technique.
 *
 * L'association porte une ampoule pour logo. Sa première page en est le
 * plan : à gauche la phrase de son affiche et celle de son texte
 * officiel, deux actions ; à droite l'ampoule cotée, un repère par
 * pilier ; en pied, le cartouche, comme sur toute planche, qui donne le
 * prochain événement, le niveau attendu et qui a dessiné.
 *
 * Sur grand écran la planche a son cadre et ses repères de zone (1 à 6,
 * A à D). Sur téléphone le cadre tombe : le texte, le dessin, la légende
 * des quatre repères, puis le cartouche, l'un sous l'autre.
 *
 * Rien ici n'attend de JavaScript : le titre et le dessin sont dans le
 * HTML. Le dernier mot du titre est celui qui « s'allume » avec le
 * filament (globals.css).
 */
const COLS = ["1", "2", "3", "4", "5", "6"];
const ROWS = ["A", "B", "C", "D"];

function Zones({ side, marks }: { side: "top" | "right" | "bottom" | "left"; marks: string[] }) {
  return (
    <div className={`sheet__zones sheet__zones--${side}`} aria-hidden="true">
      {marks.map((m) => (
        <span key={m}>{m}</span>
      ))}
    </div>
  );
}

export function Hero({ lang }: { lang: Locale }) {
  const d = t(lang);

  return (
    <section className="hero">
      <div className="container">
        <div className="sheet" style={{ "--on": `${PLATE_ON}s` } as React.CSSProperties}>
          <Zones side="top" marks={COLS} />
          <Zones side="left" marks={ROWS} />
          <Zones side="right" marks={ROWS} />
          <Zones side="bottom" marks={COLS} />

          <div className="sheet__body">
            <div className="sheet__main">
              <div className="hero__text">
                <p
                  className="eyebrow eyebrow--accent rise"
                  style={{ "--i": 0 } as React.CSSProperties}
                >
                  {d.hero.eyebrow}
                </p>
                <h1
                  className="hero__title rise rise--solid"
                  style={{ "--i": 1 } as React.CSSProperties}
                >
                  {d.hero.title} <span className="hero__on">{d.hero.titleOn}</span>
                </h1>
                <p className="lede hero__lede rise" style={{ "--i": 2 } as React.CSSProperties}>
                  {d.hero.lede}
                </p>
                <div className="hero__cta rise" style={{ "--i": 3 } as React.CSSProperties}>
                  <Link className="btn" href={href("programme", lang)}>
                    {d.hero.ctaPrimary}
                  </Link>
                  <Link className="btn btn--ghost" href={href("join", lang)}>
                    {d.hero.ctaSecondary}
                  </Link>
                </div>
              </div>

              <Plate lang={lang} />
            </div>

            <div className="cartouche rise" style={{ "--i": 5 } as React.CSSProperties}>
              <NextEvent label={d.hero.next} items={timelineItems(lang)} buildDay={today()} />
              <div className="cartouche__cell">
                <p className="eyebrow eyebrow--accent">{d.hero.plate.levelLabel}</p>
                <p className="cartouche__value">{d.hero.plate.level}</p>
              </div>
              <div className="cartouche__cell">
                <p className="eyebrow eyebrow--accent">{d.hero.plate.drawnLabel}</p>
                <p className="cartouche__value">{d.hero.plate.drawn}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
