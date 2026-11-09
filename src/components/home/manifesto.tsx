import { t, type Locale } from "@/lib/i18n";

/**
 * Le manifeste : cinq phrases, sur ivoire.
 *
 * C'est la première rupture de la page — on sort du marine. Les mots
 * s'allument un à un au défilement, comme une phrase qu'on dit à voix
 * haute. Chaque mot est dans son propre <span>, mais le texte reste du
 * texte : un lecteur d'écran lit les phrases entières, et sans
 * JavaScript tout est déjà à pleine encre.
 */
export function Manifesto({ lang }: { lang: Locale }) {
  const d = t(lang);

  return (
    <section className="manifesto on-light" data-manifesto aria-labelledby="manifesto-title">
      <span className="wire" data-wire aria-hidden />
      <div className="container manifesto__in">
        <p className="eyebrow eyebrow--accent" id="manifesto-title">
          {d.manifesto.eyebrow}
        </p>
        <div className="manifesto__lines">
          {d.manifesto.lines.map((line, i) => (
            <p key={line} className={`manifesto__line${i === 0 ? " manifesto__line--lead" : ""}`}>
              {line.split(" ").map((word, j) => (
                <span key={`${word}-${j}`} className="mw">
                  {word}{" "}
                </span>
              ))}
            </p>
          ))}
        </div>
        <p className="manifesto__note" data-reveal>
          {d.manifesto.note}
        </p>
      </div>
    </section>
  );
}
