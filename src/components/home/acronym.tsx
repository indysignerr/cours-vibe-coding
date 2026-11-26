import { t, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/**
 * Ce que LIGHT veut dire : cinq mots, cinq initiales allumées.
 *
 * Un bandeau marine, juste sous le haut de page de l'accueil et de la
 * page À propos. Chaque mot porte son initiale en très grand ; à
 * l'arrivée du bandeau les cinq s'allument l'une après l'autre, et se
 * lisent L, I, G, H, T.
 *
 * Chaque mot est écrit deux fois : une fois entier, pour les lecteurs
 * d'écran, et une fois coupé en deux (l'initiale, puis le reste), pour
 * l'œil. Sans cela « Lab » serait lu « L », « ab ».
 */
export function Acronym({ lang }: { lang: Locale }) {
  const d = t(lang);

  return (
    <section className="acro on-navy" aria-labelledby="acro-label">
      <div className="container">
        <p className="eyebrow acro__label" id="acro-label">
          {d.hero.stands}
          <span className="sr-only"> {SITE.expansion}</span>
        </p>
        <ul className="acro__row" data-reveal>
          {d.hero.words.map((w, i) => (
            <li key={w} className="acro__word" style={{ "--k": i } as React.CSSProperties}>
              <span className="sr-only">{w}</span>
              <span className="acro__split" aria-hidden="true">
                <b className="acro__initial" data-l={w[0]}>
                  {w[0]}
                </b>
                <span className="acro__rest">{w.slice(1)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
