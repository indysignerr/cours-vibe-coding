import Link from "next/link";
import team from "@content/team.json";
import partners from "@content/partners.json";
import { fill, href, t, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/**
 * L'équipe et les partenaires.
 *
 * Sept lignes, pas sept portraits : un nom, un rôle. Les partenaires
 * sont affichés par leur NOM tant qu'aucun logo n'est fourni
 * (content/partners.json → logo), avec ce que le plan dit qu'on leur
 * demande — on ne leur prête pas un rôle qu'ils n'ont pas accepté.
 * Si `url` est renseignée, le nom ou le logo devient un lien.
 */

// Le fichier ne contient encore que des `null` : sans ce type, TypeScript
// en déduirait que `logo` et `url` ne seront jamais des chaînes.
type Partner = {
  id: string;
  name: Record<Locale, string>;
  ask: Record<Locale, string>;
  logo: string | null;
  url: string | null;
};

export function TeamBlock({
  lang,
  full = false,
}: {
  lang: Locale;
  full?: boolean;
}) {
  const d = t(lang);
  const Title = full ? "h2" : "h3";

  return (
    <section className="team" aria-labelledby={full ? undefined : "team-title"}>
      <span className="wire" data-wire aria-hidden />
      <div className="container">
        {full ? null : (
          <header className="section-head">
            <p className="eyebrow eyebrow--accent" data-reveal>
              {d.team.eyebrow}
            </p>
            <h2 className="display-1" id="team-title" data-reveal>
              {fill(d.team.title, { n: team.board.length })}
            </h2>
            <p className="lede" data-reveal>
              {d.team.lede}
            </p>
          </header>
        )}

        <ol className="board">
          {team.board.map((m, i) => (
            <li key={m.name} className="board__row" data-reveal>
              <span className="board__n">{String(i + 1).padStart(2, "0")}</span>
              <span className="board__name">{m.name}</span>
              <span className="board__role">{m.role[lang]}</span>
              <span className="board__focus">{m.focus ? m.focus[lang] : ""}</span>
            </li>
          ))}
        </ol>
        <p className="team__founders" data-reveal>
          {fill(d.team.founders, { names: SITE.founders.join(", ") })}
        </p>

        <div className="partners" id="partners">
          <p className="eyebrow eyebrow--accent" data-reveal>
            {d.team.partnersEyebrow}
          </p>
          <Title className="display-2 partners__title" data-reveal>
            {d.team.partnersTitle}
          </Title>
          <ul className="partners__grid">
            {(partners.partners as Partner[]).map((p) => {
              const mark = p.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="partner__logo" src={p.logo} alt={p.name[lang]} loading="lazy" />
              ) : (
                <span className="partner__name">{p.name[lang]}</span>
              );
              return (
                <li key={p.id} className="partner" data-reveal>
                  {p.url ? (
                    <a className="partner__link" href={p.url} rel="noopener">
                      {mark}
                    </a>
                  ) : (
                    mark
                  )}
                  <span className="partner__ask">{p.ask[lang]}</span>
                </li>
              );
            })}
          </ul>

          {full ? (
            <div className="partners__offer" data-reveal>
              <div>
                <p className="eyebrow">{d.team.getsTitle}</p>
                <ul className="rows">
                  {d.team.gets.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <p className="partners__asks">{d.team.asks}</p>
            </div>
          ) : (
            <div data-reveal>
              <Link className="btn btn--ghost" href={href("team", lang)} data-magnetic>
                {d.team.more}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
