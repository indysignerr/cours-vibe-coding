import team from "@content/team.json";
import { CtaBand } from "@/components/cta-band";
import { Acronym } from "@/components/home/acronym";
import { Mission } from "@/components/home/mission";
import { PillarText } from "@/components/home/pillars";
import { ScrollFX } from "@/components/motion/scroll-fx";
import { PageFrame } from "@/components/page-frame";
import { PageHead } from "@/components/page-head";
import { Chapter, SectionHead } from "@/components/section-head";
import { fill, t, type Locale } from "@/lib/i18n";
import { getPillars } from "@/lib/pillars";

/**
 * À propos : la mission dans son texte entier, comment l'association
 * fonctionne, et ses quatre piliers format par format.
 *
 * Chaque phrase vient du texte officiel de l'association ou du plan
 * annuel : rien n'est ajouté ici.
 */
export function AboutPage({ lang }: { lang: Locale }) {
  const d = t(lang);
  const how: [string, string][] = [
    [d.about.openLabel, d.about.openText],
    [d.audience.members, d.about.membersText],
    [d.about.rhythmLabel, d.about.rhythmText],
    [d.event.price, d.about.priceText],
    [d.about.runLabel, fill(d.about.runText, { n: team.board.length })],
  ];

  return (
    <PageFrame lang={lang} page="about">
      <ScrollFX />
      <PageHead eyebrow={d.about.eyebrow} title={d.mission.quote} lede={d.hero.lede} />
      <Acronym lang={lang} />
      <Mission lang={lang} full />

      <section className="section" aria-labelledby="how-title">
        <div className="container">
          <Chapter label={d.about.howEyebrow} title={d.cta.title} id="how-title">
            <dl className="how" data-reveal>
              {how.map(([term, detail]) => (
                <div className="how__row" key={term}>
                  <dt>{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>
          </Chapter>
        </div>
      </section>

      <section className="section" aria-labelledby="formats-title">
        <div className="container">
          <SectionHead label={d.pillars.eyebrow} title={d.about.pillarsTitle} id="formats-title" />
          {/* Les quatre piliers prennent toute la largeur, deux par rang. */}
          <div className="pgroups">
            {getPillars(lang).map((p, i) => (
              <div className="pgroup" key={p.key} data-reveal>
                <PillarText pillar={p} index={i} formatsLabel={d.pillars.formats} as="h3" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand lang={lang} />
    </PageFrame>
  );
}
