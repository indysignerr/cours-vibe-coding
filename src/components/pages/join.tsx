import Link from "next/link";
import { FaqList } from "@/components/faq-list";
import { JoinBlock } from "@/components/home/join-block";
import { ScrollFX } from "@/components/motion/scroll-fx";
import { PageFrame } from "@/components/page-frame";
import { PageHead } from "@/components/page-head";
import { Chapter } from "@/components/section-head";
import { getFaq } from "@/lib/faq";
import { href, t, type Locale } from "@/lib/i18n";

/**
 * Rejoindre : les deux voies d'entrée, ce que l'adhésion ouvre, et les
 * questions qu'on se pose avant de cocher la case.
 */
export function JoinPage({ lang }: { lang: Locale }) {
  const d = t(lang);
  // Les questions sur l'adhésion et sur la venue à un événement.
  const questions = getFaq(lang)
    .filter((g) => g.id === "membership" || g.id === "events")
    .flatMap((g) => g.items)
    .filter((i) => ["member", "opens", "cost", "code", "prepare"].includes(i.id));

  return (
    <PageFrame lang={lang} page="join">
      <ScrollFX />
      <PageHead eyebrow={d.join.eyebrow} title={d.join.title} lede={d.join.lede} />
      <JoinBlock lang={lang} full />

      <section className="section faq" aria-labelledby="join-faq">
        <div className="container">
          <Chapter
            label={d.faq.eyebrow}
            title={d.faq.title}
            id="join-faq"
            foot={
              <Link className="link link--block" href={href("faq", lang)}>
                {d.faq.all}
              </Link>
            }
          >
            <div data-reveal>
              <FaqList items={questions} name="faq-join" />
            </div>
          </Chapter>
        </div>
      </section>
    </PageFrame>
  );
}
