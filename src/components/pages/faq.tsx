import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { ScrollFX } from "@/components/motion/scroll-fx";
import { PageFrame } from "@/components/page-frame";
import { PageHead } from "@/components/page-head";
import { Chapter } from "@/components/section-head";
import { faqSchema, getFaq } from "@/lib/faq";
import { t, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/**
 * Les questions fréquentes, par groupe.
 *
 * Les mêmes questions sont données aux moteurs de recherche en schéma
 * FAQPage. Elles viennent toutes de content/faq.json.
 */
export function FaqPage({ lang }: { lang: Locale }) {
  const d = t(lang);

  return (
    <PageFrame lang={lang} page="faq">
      <ScrollFX />
      <script
        type="application/ld+json"
        // Les données viennent de nos propres fichiers, pas d'une saisie.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(lang)) }}
      />
      <PageHead eyebrow={d.faq.eyebrow} title={d.faq.title} lede={d.faq.lede} />

      <section className="section faq faq--page">
        <div className="container">
          {getFaq(lang).map((g) => (
            <section className="faq__group" key={g.id} aria-labelledby={`faq-${g.id}`}>
              <Chapter label={d.faq.eyebrow} title={g.title} id={`faq-${g.id}`}>
                <div data-reveal>
                  <FaqList items={g.items} name="faq" anchors />
                </div>
              </Chapter>
            </section>
          ))}

          <div className="faq__group">
            <Chapter label={d.faq.eyebrow} title={d.faq.stillTitle}>
              <div className="faq__still" data-reveal>
                <p>{d.faq.stillBody}</p>
                <a
                  className="btn btn--ghost"
                  href={SITE.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {d.footer.linkedin}
                </a>
              </div>
            </Chapter>
          </div>
        </div>
      </section>

      <CtaBand lang={lang} />
    </PageFrame>
  );
}
