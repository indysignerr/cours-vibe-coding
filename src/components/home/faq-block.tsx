import Link from "next/link";
import { FaqList } from "@/components/faq-list";
import { Chapter } from "@/components/section-head";
import { homeFaq } from "@/lib/faq";
import { href, t, type Locale } from "@/lib/i18n";

/** Les questions les plus utiles avant un premier événement, et le lien vers toutes. */
export function FaqBlock({ lang, n }: { lang: Locale; n?: string }) {
  const d = t(lang);

  return (
    <section className="section faq" aria-labelledby="faq-title">
      <div className="container">
        <Chapter
          n={n}
          label={d.faq.eyebrow}
          title={d.faq.title}
          id="faq-title"
          lede={d.faq.lede}
          foot={
            <Link className="link link--block" href={href("faq", lang)}>
              {d.faq.all}
            </Link>
          }
        >
          <div data-reveal>
            <FaqList items={homeFaq(lang)} name="faq-home" />
          </div>
        </Chapter>
      </div>
    </section>
  );
}
