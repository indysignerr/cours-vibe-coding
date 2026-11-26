import Link from "next/link";
import { Chapter } from "@/components/section-head";
import { href, t, type Locale } from "@/lib/i18n";

/**
 * La mission : le texte officiel de l'association, tel qu'elle l'a écrit.
 *
 * `full` (la page À propos) donne les trois paragraphes ; l'accueil en
 * donne deux, et pose sous son titre la devise et le lien vers elle. Ce
 * que LIGHT veut dire a son propre bandeau, juste avant (Acronym).
 */
export function Mission({ lang, n, full = false }: { lang: Locale; n?: string; full?: boolean }) {
  const d = t(lang);

  return (
    <section className="section mission" aria-labelledby="mission-title">
      <div className="container">
        <Chapter
          n={n}
          label={d.mission.eyebrow}
          title={d.mission.title}
          id="mission-title"
          foot={
            full ? null : (
              <>
                <p className="mission__quote">{d.mission.quote}</p>
                <p className="mission__more">
                  <Link className="link link--block" href={href("about", lang)}>
                    {d.mission.more}
                  </Link>
                </p>
              </>
            )
          }
        >
          <p className="mission__lead" data-reveal>
            {full ? d.mission.p1 : d.mission.p2}
          </p>
          <div className="mission__cols">
            {full ? <p data-reveal>{d.mission.p2}</p> : null}
            <p data-reveal>{d.mission.p3}</p>
          </div>
        </Chapter>
      </div>
    </section>
  );
}
