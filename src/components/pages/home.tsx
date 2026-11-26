import Link from "next/link";
import { CtaBand } from "@/components/cta-band";
import { EventList } from "@/components/event-list";
import { Acronym } from "@/components/home/acronym";
import { FaqBlock } from "@/components/home/faq-block";
import { Hero } from "@/components/home/hero";
import { JoinBlock } from "@/components/home/join-block";
import { Mission } from "@/components/home/mission";
import { Pillars } from "@/components/home/pillars";
import { TeamBlock } from "@/components/home/team-block";
import { ScrollFX } from "@/components/motion/scroll-fx";
import { PageFrame } from "@/components/page-frame";
import { SectionHead } from "@/components/section-head";
import { today } from "@/lib/events";
import { href, t, type Locale } from "@/lib/i18n";
import { timelineItems, timelineLabels } from "@/lib/timeline";

/**
 * L'accueil : ce qu'est l'association, ce que son nom veut dire, sa
 * mission, ses quatre piliers autour de la maquette, le calendrier,
 * comment entrer, qui s'en occupe, les questions qu'on se pose avant de
 * venir.
 * Les sections sont numérotées, comme les chapitres d'un rapport.
 */
export function HomePage({ lang }: { lang: Locale }) {
  const d = t(lang);

  return (
    <PageFrame lang={lang} page="home">
      <ScrollFX />
      <Hero lang={lang} />
      <Acronym lang={lang} />
      <Mission lang={lang} n="01" />
      <Pillars lang={lang} n="02" />

      <section className="section calendar" aria-labelledby="calendar-title">
        <div className="container">
          <SectionHead n="03" label={d.timeline.eyebrow} title={d.timeline.title} id="calendar-title" />
          <div className="rail">
            <div className="rail__main" data-reveal>
              <EventList
                items={timelineItems(lang)}
                labels={timelineLabels(lang)}
                buildDay={today()}
                upcomingOnly
                limit={4}
              />
              <div className="calendar__more">
                <Link className="btn" href={href("programme", lang)}>
                  {d.timeline.full}
                </Link>
                <a className="link link--block" href="/albert-light.ics" download>
                  {d.programme.download}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <JoinBlock lang={lang} n="04" />
      <TeamBlock lang={lang} n="05" />
      <FaqBlock lang={lang} n="06" />
      <CtaBand lang={lang} />
    </PageFrame>
  );
}
