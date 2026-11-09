import { Timeline } from "@/components/home/timeline";
import { ScrollFX } from "@/components/motion/scroll-fx";
import { PageFrame } from "@/components/page-frame";
import { PageHead } from "@/components/page-head";
import { BUILD_LAB_DATES, BUILD_LAB_FIRST, shortDate, today } from "@/lib/events";
import { eventListSchema } from "@/lib/event-schema";
import { t, type Locale } from "@/lib/i18n";
import { timelineItems, timelineLabels } from "@/lib/timeline";

/**
 * Le programme : toute l'année sur une frise, filtrable par public et
 * par format.
 */
export function ProgrammePage({ lang }: { lang: Locale }) {
  const d = t(lang);

  return (
    <PageFrame lang={lang} page="programme">
      <ScrollFX />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventListSchema(lang)) }}
      />
      <PageHead eyebrow={d.programme.eyebrow} title={d.programme.title} lede={d.programme.lede} />

      <section className="calendar calendar--page">
        <div className="container">
          <Timeline
            items={timelineItems(lang)}
            labels={timelineLabels(lang)}
            buildDay={today()}
            formatFilter
            heading="h2"
          />
        </div>
      </section>

      <section className="extras on-light">
        <div className="container extras__in">
          <div data-reveal>
            <p className="eyebrow eyebrow--accent">{d.formats["build-lab"]}</p>
            <h2 className="display-2">{d.programme.buildLabTitle}</h2>
            <p>{d.programme.buildLabBody}</p>
            <ul className="extras__dates">
              {[BUILD_LAB_FIRST, ...BUILD_LAB_DATES].map((date) => (
                <li key={date}>
                  <time dateTime={date}>{shortDate(date, lang)}</time>
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal>
            <p className="eyebrow eyebrow--accent">.ics</p>
            <h2 className="display-2">{d.programme.calendarTitle}</h2>
            <p>{d.programme.calendarBody}</p>
            <a className="btn btn--primary" href="/albert-light.ics" download data-magnetic>
              {d.programme.download}
            </a>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
