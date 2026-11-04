import Link from "next/link";
import { shortDate, upcoming } from "@/lib/events";
import { SITE } from "@/lib/site";

/**
 * Le haut de page.
 *
 * Le nom EST l'explication : Lab of Intelligent, Generative, Hands-on
 * Technology. On ne le raconte donc pas en paragraphe, on le montre —
 * cinq lettres qui tiennent l'écran, et le mot de chacune qui se révèle
 * quand on la survole. C'est ce que le plan annuel demande, mot pour
 * mot : « a simple wordmark logo, two colours, one font ».
 *
 * Un écran, une trentaine de mots. L'ancienne version en faisait
 * quatre-vingt-treize sur presque deux écrans, et la grosse carte du
 * prochain évènement volait la vedette au titre ; elle est devenue une
 * barre, en pied de hero.
 *
 * Composant serveur : pas une ligne de JavaScript n'est envoyée.
 */

const GLYPHS: [string, string][] = [
  ["L", "Lab"],
  ["I", "Intelligent"],
  ["G", "Generative"],
  ["H", "Hands-on"],
  ["T", "Technology"],
];

/** Dispersion au défilement : chaque lettre part à sa propre vitesse. */
const DRIFT = [-18, 26, -34, 14, -8];

export function HomeHero() {
  const next = upcoming();
  const first = next[0];

  return (
    <section className="on-ink hero border-b border-line">
      <div className="hero__inner mx-auto w-full max-w-stage px-5 md:px-8">
        <p className="eyebrow eyebrow--accent rise">{SITE.eyebrow}</p>

        <h1 className="hero__h1">
          <span className="sr-only">
            Albert L.I.G.H.T. — Lab of Intelligent, Generative, Hands-on
            Technology. Albert School&rsquo;s lab for AI and code.
          </span>

          <span aria-hidden className="wordmark">
            {GLYPHS.map(([letter, word], i) => (
              <span
                key={letter}
                className="glyph"
                style={
                  { "--i": i, "--d": `${DRIFT[i]}px` } as React.CSSProperties
                }
              >
                <span className="glyph__l">{letter}</span>
                <span className="glyph__w">{word}</span>
              </span>
            ))}

            {/* Une seule ligne sous le nom. Survoler une lettre la remplace par
                le mot de cette lettre : le sigle se découvre en jouant avec, au
                lieu d'être récité en plus. */}
            <span className="wordmark__caption">
              Albert School&rsquo;s lab for AI and code.
            </span>
          </span>
        </h1>
      </div>

      {/* Le pied : la promesse chiffrée, et la prochaine date. */}
      <div className="hero__foot rise [animation-delay:720ms]">
        <div className="mx-auto flex w-full max-w-stage flex-wrap items-center justify-between gap-x-10 gap-y-5 px-5 md:px-8">
          <dl className="flex flex-wrap items-baseline gap-x-8 gap-y-2 text-sm">
            <div className="flex items-baseline gap-2">
              <dt className="eyebrow">Events</dt>
              <dd className="tnum text-ink">{next.length}</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="eyebrow">Through</dt>
              <dd className="tnum text-ink">May 2027</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="eyebrow">Price</dt>
              <dd className="text-ink">Free</dd>
            </div>
          </dl>

          {first ? (
            <Link className="hero__next group" href={`/events/#${first.slug}`}>
              <span className="eyebrow eyebrow--accent">
                Next · {shortDate(first.date)}
              </span>
              <span className="hero__nextTitle">{first.title}</span>
              <span aria-hidden className="hero__arrow">
                →
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
