import team from "@content/team.json";
import { TeamBlock } from "@/components/home/team-block";
import { ScrollFX } from "@/components/motion/scroll-fx";
import { PageFrame } from "@/components/page-frame";
import { PageHead } from "@/components/page-head";
import { fill, t, type Locale } from "@/lib/i18n";

/** L'équipe : le bureau, les fondateurs, les partenaires et ce qu'ils y gagnent. */
export function TeamPage({ lang }: { lang: Locale }) {
  const d = t(lang);
  return (
    <PageFrame lang={lang} page="team">
      <ScrollFX />
      <PageHead
        eyebrow={d.team.eyebrow}
        title={fill(d.team.title, { n: team.board.length })}
        lede={d.team.lede}
      />
      <TeamBlock lang={lang} full />
    </PageFrame>
  );
}
