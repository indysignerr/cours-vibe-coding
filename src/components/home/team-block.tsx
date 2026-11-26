import Link from "next/link";
import team from "@content/team.json";
import { Chapter } from "@/components/section-head";
import { fill, href, t, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/**
 * L'équipe : un annuaire, pas des portraits.
 *
 * Un nom, un rôle, en colonnes réglées. Sur l'accueil le bloc porte son
 * titre à gauche, avec les fondateurs et le lien vers la page de
 * l'équipe ; sur cette page (`full`), c'est l'en-tête de page qui fait le
 * titre, et l'annuaire prend toute la largeur.
 */
export function TeamBlock({ lang, n, full = false }: { lang: Locale; n?: string; full?: boolean }) {
  const d = t(lang);
  const founders = fill(d.team.founders, { names: SITE.founders.join(", ") });
  const board = (
    <ol className={full ? "board board--wide" : "board"} data-reveal>
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
  );

  return (
    <section className="section team" aria-labelledby={full ? undefined : "team-title"}>
      <div className="container">
        {full ? (
          <>
            {board}
            <p className="team__founders" data-reveal>
              {founders}
            </p>
          </>
        ) : (
          <Chapter
            n={n}
            label={d.team.eyebrow}
            title={fill(d.team.title, { n: team.board.length })}
            id="team-title"
            lede={d.team.lede}
            foot={
              <>
                <p className="team__founders">{founders}</p>
                <p className="team__more">
                  <Link className="link link--block" href={href("team", lang)}>
                    {d.team.more}
                  </Link>
                </p>
              </>
            }
          >
            {board}
          </Chapter>
        )}
      </div>
    </section>
  );
}
