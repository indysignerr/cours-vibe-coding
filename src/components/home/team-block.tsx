import Link from "next/link";
import team from "@content/team.json";
import { fill, href, t, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/**
 * L'équipe.
 *
 * Sept lignes, pas sept portraits : un nom, un rôle. Sur l'accueil le
 * bloc porte son titre et renvoie vers la page de l'équipe ; sur cette
 * page (`full`), c'est l'en-tête de page qui fait le titre.
 */
export function TeamBlock({
  lang,
  full = false,
}: {
  lang: Locale;
  full?: boolean;
}) {
  const d = t(lang);

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

        {full ? null : (
          <div className="team__more" data-reveal>
            <Link className="btn btn--ghost" href={href("team", lang)} data-magnetic>
              {d.team.more}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
