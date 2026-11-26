import Link from "next/link";
import { SectionHead } from "@/components/section-head";
import { href, t, type Locale } from "@/lib/i18n";

/**
 * La mission : le texte officiel de l'association, tel qu'elle l'a écrit.
 *
 * `full` (la page À propos) donne les trois paragraphes ; l'accueil en
 * donne deux, et renvoie vers elle. Ce que LIGHT veut dire a son propre
 * bandeau, juste avant (Acronym).
 */
export function Mission({
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
    <section className="section mission" aria-labelledby="mission-title">
      <div className="container">
        <SectionHead n={n} label={d.mission.eyebrow} title={d.mission.title} id="mission-title" />
        <div className="rail">
          <div className="rail__main">
            <p className="mission__lead" data-reveal>
              {full ? d.mission.p1 : d.mission.p2}
            </p>
            {full ? (
              <div className="mission__cols">
                <p data-reveal>{d.mission.p2}</p>
                <p data-reveal>{d.mission.p3}</p>
              </div>
            ) : (
              <div className="mission__cols">
                <p data-reveal>{d.mission.p3}</p>
              </div>
            )}
            {full ? null : (
              <p className="mission__quote" data-reveal>
                {d.mission.quote}
              </p>
            )}
            {full ? null : (
              <p className="mission__more" data-reveal>
                <Link className="link link--block" href={href("about", lang)}>
                  {d.mission.more}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
