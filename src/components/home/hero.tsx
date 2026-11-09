import Link from "next/link";
import { BulbStage } from "@/components/hero/bulb-stage";
import { href, t, type Locale } from "@/lib/i18n";

/**
 * Le haut de page.
 *
 * À gauche le nom, la phrase du plan et deux actions ; à droite
 * l'ampoule. Sur grand écran la section fait deux écrans et demi de
 * haut et son contenu reste collé : pendant qu'on défile, le texte
 * s'efface, l'ampoule vient au centre et son filament se plie en L —
 * puis le nom développé apparaît sous elle, lettre après lettre.
 *
 * Tout ce mouvement tient à UNE variable, `--p`, que le défilement fait
 * aller de 0 à 1 ; le CSS en déduit le reste. Sans JavaScript, sur
 * téléphone ou en mouvement réduit, la section a sa hauteur naturelle
 * et montre simplement le texte et l'image.
 */
export function Hero({ lang }: { lang: Locale }) {
  const d = t(lang);

  return (
    <section className="hero" data-hero>
      <div className="hero__sticky">
        <div className="hero__copy">
          <p className="eyebrow eyebrow--accent hero__in" style={{ "--i": 0 } as React.CSSProperties}>
            {d.hero.eyebrow}
          </p>
          <h1 className="hero__name hero__in" style={{ "--i": 1 } as React.CSSProperties}>
            Albert{" "}
            <span className="hero__light">
              L<i>.</i>I<i>.</i>G<i>.</i>H<i>.</i>T<i>.</i>
            </span>
          </h1>
          <p className="hero__expansion hero__in" style={{ "--i": 2 } as React.CSSProperties}>
            {d.hero.words.map((w, i) => (
              <span key={w}>
                <b>{w[0]}</b>
                {w.slice(1)}
                {i === 0 ? " of " : i < d.hero.words.length - 1 ? (i === 3 ? " " : ", ") : ""}
              </span>
            ))}
          </p>
          <p className="lede hero__tagline hero__in" style={{ "--i": 3 } as React.CSSProperties}>
            {d.hero.tagline}
          </p>
          <div className="hero__cta hero__in" style={{ "--i": 4 } as React.CSSProperties}>
            <Link className="btn btn--primary" href={href("programme", lang)} data-magnetic>
              {d.hero.ctaPrimary}
              <span aria-hidden className="btn__arrow">
                →
              </span>
            </Link>
            <Link className="btn btn--ghost" href={href("join", lang)} data-magnetic>
              {d.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        <div className="hero__stage">
          <BulbStage alt={d.hero.bulbAlt} buttonLabel={d.hero.bulbButton} />
        </div>

        {/* Ce que le filament vient d'écrire. Décoratif : le h1 et la ligne
            au-dessus disent déjà le nom à qui ne voit pas la scène. */}
        <p className="hero__spelled" aria-hidden>
          <span className="hero__spelled-l">{d.hero.spelled}</span>
          <span className="hero__spelled-words">
            {d.hero.words.map((w, i) => (
              <span key={w} style={{ "--w": i } as React.CSSProperties}>
                <b>{w[0]}</b>
                {w.slice(1)}
              </span>
            ))}
          </span>
        </p>

        <p className="hero__scroll" aria-hidden>
          <span className="hero__scroll-line" />
          {d.hero.scroll}
        </p>
      </div>
    </section>
  );
}
