import Link from "next/link";
import { FaqList } from "@/components/faq-list";
import { SectionHead } from "@/components/section-head";
import { homeFaq } from "@/lib/faq";
import { href, t, type Locale } from "@/lib/i18n";

/** Les questions les plus utiles avant un premier événement, et le lien vers toutes. */
export function FaqBlock({ lang, n }: { lang: Locale; n?: string }) {
  const d = t(lang);

  return (
    <section className="section faq" aria-labelledby="faq-title">
      <div className="container">
        <SectionHead n={n} label={d.faq.eyebrow} title={d.faq.title} id="faq-title" lede={d.faq.lede} />
        <div className="rail">
          <div className="rail__main" data-reveal>
            <FaqList items={homeFaq(lang)} name="faq-home" />
            <p className="faq__more">
              <Link className="link link--block" href={href("faq", lang)}>
                {d.faq.all}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
