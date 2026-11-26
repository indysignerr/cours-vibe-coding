import Link from "next/link";
import { NextEvent } from "@/components/next-event";
import { today } from "@/lib/events";
import { href, t, type Locale } from "@/lib/i18n";
import { timelineItems } from "@/lib/timeline";

/**
 * Le haut de page.
 *
 * Simple, à la demande du bureau : la phrase de l'affiche de
 * l'association en grand, la phrase de son texte officiel dessous, deux
 * actions, et le prochain événement à droite. Pas d'image : les quatre
 * chiffres qui suivent ferment le premier écran.
 *
 * Rien ici n'attend de JavaScript : tout est dans le HTML. Le dernier mot
 * du titre, « light », prend sa couleur un instant après les autres
 * (globals.css) : c'est le seul effet.
 */
export function Hero({ lang }: { lang: Locale }) {
  const d = t(lang);

  return (
    <section className="hero">
      <div className="container">
        <div className="hero__grid">
          <div className="hero__text">
            <p className="eyebrow eyebrow--accent rise" style={{ "--i": 0 } as React.CSSProperties}>
              {d.hero.eyebrow}
            </p>
            <h1 className="hero__title rise rise--solid" style={{ "--i": 1 } as React.CSSProperties}>
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

          <NextEvent label={d.hero.next} items={timelineItems(lang)} buildDay={today()} />
        </div>
      </div>
    </section>
  );
}
