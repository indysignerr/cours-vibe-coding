import { LabStage } from "@/components/lab/lab-stage";
import { fill, t, type Locale } from "@/lib/i18n";
import { getPillars, type Pillar } from "@/lib/pillars";

/**
 * Les quatre piliers, autour de la maquette du labo.
 *
 * La maquette est une scène 3D : un plateau tournant, quatre pièces, une
 * par pilier, autour d'une seule lampe. Pendant que les piliers défilent,
 * le plateau tourne et la pièce du pilier courant vient devant.
 *
 * Trois états, du plus pauvre au plus riche :
 *   — sans JavaScript ou en mouvement réduit : chaque pilier montre
 *     l'image de sa pièce, l'un sous l'autre (c'est le HTML d'ici) ;
 *   — avec JavaScript : la maquette colle à l'écran et montre l'image de
 *     la pièce courante (LabStage) ;
 *   — et dès que la scène 3D est chargée, elle prend la place de l'image.
 *
 * La maquette est décorative (`aria-hidden`) : tout ce qu'elle dit est
 * écrit dans les piliers.
 */
export const roomImage = (key: Pillar["key"]) => `/images/lab/room-${key}.webp`;

export function PillarText({
  pillar,
  index,
  formatsLabel,
  as: Title = "h3",
}: {
  pillar: Pillar;
  index: number;
  formatsLabel: string;
  as?: "h2" | "h3";
}) {
  return (
    <div>
      <p className="pillar__n">{String(index + 1).padStart(2, "0")}</p>
      <Title className="pillar__title">{pillar.title}</Title>
      <p className="pillar__line">{pillar.line}</p>
      <p className="pillar__promise">{pillar.promise}</p>
      <ul className="pillar__formats" aria-label={formatsLabel}>
        {pillar.formats.map((f) => (
          <li key={f.name}>
            <span className="pillar__format">{f.name}</span>
            <span>{f.what}</span>
            <span className="pillar__length">{f.length}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Pillars({ lang, n }: { lang: Locale; n?: string }) {
  const d = t(lang);
  const pillars = getPillars(lang);

  return (
    <section className="pillars on-navy" aria-labelledby="pillars-title">
      <div className="container">
        <header className="sec-head" data-rule>
          <p className="sec-head__label" data-reveal>
            {n ? <span className="sec-head__n">{n}</span> : null}
            <span>{d.pillars.eyebrow}</span>
          </p>
          <div>
            <h2 className="display-1 sec-head__title" id="pillars-title" data-reveal>
              {d.pillars.title}
            </h2>
            <p className="lede sec-head__lede" data-reveal>
              {d.pillars.lede}
              <span className="only-motion"> {d.pillars.ledeMotion}</span>
            </p>
          </div>
        </header>

        <div className="pillars__grid">
          <LabStage
            rooms={pillars.map((p, i) => ({
              key: p.key,
              poster: roomImage(p.key),
              caption: fill(d.pillars.figure, { n: i + 1, title: p.title }),
            }))}
          />
          <ol className="pillars__steps">
            {pillars.map((p, i) => (
              <li key={p.key} id={p.key} className="pillar" data-step={i}>
                <figure className="pillar__poster">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={roomImage(p.key)}
                    width={1200}
                    height={900}
                    alt={fill(d.pillars.roomAlt, { title: p.title })}
                    loading="lazy"
                  />
                </figure>
                <PillarText pillar={p} index={i} formatsLabel={d.pillars.formats} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
