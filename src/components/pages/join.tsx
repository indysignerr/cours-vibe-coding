import { JoinBlock } from "@/components/home/join-block";
import { ScrollFX } from "@/components/motion/scroll-fx";
import { PageFrame } from "@/components/page-frame";
import { PageHead } from "@/components/page-head";
import { t, type Locale } from "@/lib/i18n";

/** Rejoindre : les deux voies d'entrée, et ce que l'adhésion ouvre. */
export function JoinPage({ lang }: { lang: Locale }) {
  const d = t(lang);
  return (
    <PageFrame lang={lang} page="join">
      <ScrollFX />
      <PageHead eyebrow={d.join.eyebrow} title={d.join.title} lede={d.join.lede} />
      <JoinBlock lang={lang} full />
    </PageFrame>
  );
}
