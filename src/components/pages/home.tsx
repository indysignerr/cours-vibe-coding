import Link from "next/link";
import { EasterEgg } from "@/components/home/easter-egg";
import { Hero } from "@/components/home/hero";
import { JoinBlock } from "@/components/home/join-block";
import { Manifesto } from "@/components/home/manifesto";
import { Pillars } from "@/components/home/pillars";
import { TeamBlock } from "@/components/home/team-block";
import { Timeline } from "@/components/home/timeline";
import { ScrollFX } from "@/components/motion/scroll-fx";
import { PageFrame } from "@/components/page-frame";
import { today } from "@/lib/events";
import { href, t, type Locale } from "@/lib/i18n";
import { timelineItems, timelineLabels } from "@/lib/timeline";

/**
 * L'accueil, dans l'ordre du brief : l'ampoule, le manifeste, les quatre
 * piliers, la frise, l'interrupteur, les deux voies d'entrée, l'équipe.
 */
export function HomePage({ lang }: { lang: Locale }) {
  const d = t(lang);

  return (
    <PageFrame lang={lang} page="home">
      <ScrollFX />
      <Hero lang={lang} />
      <Manifesto lang={lang} />
      <Pillars lang={lang} />

      <section className="calendar" aria-labelledby="calendar-title">
        <div className="container">
          <header className="section-head">
            <p className="eyebrow eyebrow--accent" data-reveal>
              {d.timeline.eyebrow}
            </p>
            <h2 className="display-1" id="calendar-title" data-reveal>
              {d.timeline.title}
            </h2>
          </header>
          <Timeline
            items={timelineItems(lang)}
            labels={timelineLabels(lang)}
            buildDay={today()}
          />
          <div className="calendar__more" data-reveal>
            <Link className="btn btn--primary" href={href("programme", lang)} data-magnetic>
              {d.timeline.full}
              <span aria-hidden className="btn__arrow">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <EasterEgg labels={d.egg} />
      <JoinBlock lang={lang} />
      <TeamBlock lang={lang} />
    </PageFrame>
  );
}
