import Link from "next/link";
import { NextEvent } from "@/components/next-event";
import { today } from "@/lib/events";
import { href, t, type Locale } from "@/lib/i18n";
import { timelineItems } from "@/lib/timeline";

/**
 * Le haut de page.
 *
 * En haut, sur toute la largeur, la phrase qui dit ce qu'est l'association
 * (celle de son texte officiel). Dessous, à gauche, la phrase du plan, deux
 * actions et le prochain événement ; à droite, la maquette du labo : une
 * image fixe de la scène 3D des piliers, posée sur un pan marine qui va
 * jusqu'au bord de l'écran.
 *
 * Rien ici n'attend de JavaScript : le titre et l'image sont dans le HTML.
 */
export function Hero({ lang }: { lang: Locale }) {
  const d = t(lang);

  return (
    <section className="hero">
      <div className="container">
        <div className="hero__grid">
          <div className="hero__head">
            <p className="eyebrow eyebrow--accent rise" style={{ "--i": 0 } as React.CSSProperties}>
              {d.hero.eyebrow}
            </p>
            <h1 className="hero__title rise rise--solid" style={{ "--i": 1 } as React.CSSProperties}>
              {d.hero.title}
            </h1>
          </div>

          <div className="hero__side">
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
            <NextEvent label={d.hero.next} items={timelineItems(lang)} buildDay={today()} />
          </div>

          <figure className="hero__figure rise rise--solid" style={{ "--i": 2 } as React.CSSProperties}>
            <div className="hero__plate on-navy">
              {/* Un <img> et non next/image : l'export est statique (pas
                  d'optimiseur), et on tient ici le srcset à la main. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/lab/lab-hero.webp"
                srcSet="/images/lab/lab-hero-800.webp 800w, /images/lab/lab-hero.webp 1600w"
                sizes="(min-width: 1000px) 58vw, 100vw"
                width={1600}
                height={1000}
                alt={d.hero.figureAlt}
                fetchPriority="high"
              />
            </div>
            <figcaption className="figcap">{d.hero.figure}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
