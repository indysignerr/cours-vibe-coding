import Link from "next/link";
import { Bulb } from "@/components/home/bulb";
import { NextEvent } from "@/components/next-event";
import { today } from "@/lib/events";
import { href, t, type Locale } from "@/lib/i18n";
import { timelineItems } from "@/lib/timeline";

/**
 * Le haut de page.
 *
 * Une ouverture dans le noir, comme l'affiche de l'association. À
 * gauche, sa phrase en grand, celle de son texte officiel, deux actions
 * et le prochain événement. À droite, l'ampoule du logo en volume : des
 * éclats de verre s'assemblent, puis elle s'allume (Bulb).
 *
 * Le texte n'attend pas de JavaScript : il est dans le HTML. L'ampoule,
 * elle, est chargée après coup ; sans elle, le logo dessiné tient sa
 * place. Le dernier mot du titre prend sa couleur un instant après les
 * autres (globals.css).
 */
export function Hero({ lang }: { lang: Locale }) {
  const d = t(lang);

  return (
    <section className="hero on-navy">
      <div className="container">
        <div className="hero__grid">
          <div className="hero__text">
            <p className="eyebrow eyebrow--accent rise" style={{ "--i": 0 } as React.CSSProperties}>
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

          <Bulb />
          <NextEvent label={d.hero.next} items={timelineItems(lang)} buildDay={today()} />
        </div>
      </div>
    </section>
  );
}
