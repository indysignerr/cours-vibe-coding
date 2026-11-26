import team from "@content/team.json";
import { BUILD_LAB_DATES, EVENTS } from "@/lib/events";
import { t, type Locale } from "@/lib/i18n";
import { PILLARS } from "@/lib/pillars";

/**
 * Quatre chiffres, sous le haut de page.
 *
 * Aucun n'est écrit à la main : le nombre de dates se compte dans
 * content/events.json (les événements, plus les séances du Build Lab), les
 * piliers dans content/pillars.json, le bureau dans content/team.json.
 * Chaque chiffre est dans le HTML ; le compte animé n'est qu'un habillage.
 */
export function KeyFacts({ lang }: { lang: Locale }) {
  const d = t(lang);
  const facts: { figure: string; count?: number; label: string }[] = [
    { figure: String(EVENTS.length + BUILD_LAB_DATES.length), count: EVENTS.length + BUILD_LAB_DATES.length, label: d.facts.dates },
    { figure: String(PILLARS.length), count: PILLARS.length, label: d.facts.pillars },
    { figure: String(team.board.length), count: team.board.length, label: d.facts.board },
    { figure: d.facts.freeFigure, label: d.facts.free },
  ];

  return (
    <section className="keyfacts" aria-label={d.facts.label}>
      <div className="container">
        <dl className="keyfacts__row">
          {facts.map((f) => (
            <div className="fact" key={f.label} data-reveal>
              <dt className="fact__label">{f.label}</dt>
              <dd className="fact__figure" data-count={f.count}>
                {f.figure}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
