import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { ScrollFX } from "@/components/motion/scroll-fx";
import { PageFrame } from "@/components/page-frame";
import { PageHead } from "@/components/page-head";
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
          <div className="rail">
            <div className="rail__main">
              {getFaq(lang).map((g) => (
                <section className="faq__group" key={g.id} aria-labelledby={`faq-${g.id}`} data-reveal>
                  <h2 className="eyebrow eyebrow--accent faq__group-title" id={`faq-${g.id}`}>
                    {g.title}
                  </h2>
                  <FaqList items={g.items} name="faq" anchors />
                </section>
              ))}

              <div className="faq__still" data-reveal>
                <h2 className="display-2">{d.faq.stillTitle}</h2>
                <p>{d.faq.stillBody}</p>
                <a className="btn btn--ghost" href={SITE.social.linkedin} target="_blank" rel="noopener noreferrer">
                  {d.footer.linkedin}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand lang={lang} />
    </PageFrame>
  );
}
