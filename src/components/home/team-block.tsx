import Link from "next/link";
import team from "@content/team.json";
import { SectionHead } from "@/components/section-head";
import { fill, href, t, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/**
 * L'équipe : un annuaire, pas des portraits.
 *
 * Un nom, un rôle, sur deux colonnes réglées. Sur l'accueil le bloc porte
 * son titre et renvoie vers la page de l'équipe ; sur cette page (`full`),
 * c'est l'en-tête de page qui fait le titre.
 */
export function TeamBlock({
  lang,
  n,
  full = false,
}: {
  lang: Locale;
  n?: string;
  full?: boolean;
}) {
  const d = t(lang);

  return (
    <section className="section team" aria-labelledby={full ? undefined : "team-title"}>
      <div className="container">
        {full ? null : (
          <SectionHead
            n={n}
            label={d.team.eyebrow}
            title={fill(d.team.title, { n: team.board.length })}
            id="team-title"
            lede={d.team.lede}
          />
        )}
        <div className="rail">
          <div className="rail__main">
            <ol className="board" data-reveal>
              {team.board.map((m, i) => (
                <li key={m.name} className="board__row">
                  <span className="board__n" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
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
              <p className="team__more" data-reveal>
                <Link className="link link--block" href={href("team", lang)}>
                  {d.team.more}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
