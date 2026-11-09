import { t, type Locale } from "@/lib/i18n";
import { getPillars, type PillarKey } from "@/lib/pillars";

/**
 * Les quatre piliers, chacun avec son animation.
 *
 * Quatre petites scènes en SVG, dessinées au trait dans les couleurs du
 * site, qui disent le pilier sans le répéter :
 *
 *   Learn    — un terminal où une commande se tape et où les acquis se cochent ;
 *   Build    — une interface qui s'assemble pièce par pièce, puis se déploie ;
 *   Compete  — un chrono qui se vide pendant que trois équipes font la course ;
 *   Connect  — un réseau dont les liens se tirent, et où des signaux circulent.
 *
 * Tout est en CSS : une scène se joue quand son pilier entre dans la
 * fenêtre (la classe `is-in`, posée par ScrollFX), garde un mouvement
 * discret tant qu'elle y est, et s'arrête dès qu'elle en sort. L'état de
 * base du SVG est l'état FINAL : sans JavaScript ou en mouvement réduit,
 * on voit l'illustration terminée, immobile. Les SVG sont décoratifs
 * (`aria-hidden`) : aucun texte utile n'y vit.
 */

const d = (delay: number) => ({ "--d": `${delay}s` }) as React.CSSProperties;

function LearnAnim() {
  return (
    <svg viewBox="0 0 400 280" className="anim" aria-hidden focusable="false">
      <rect x="18" y="18" width="364" height="244" rx="14" className="s-frame" />
      <path d="M18 58h364" className="s-line" />
      <circle cx="42" cy="38" r="5" className="f-brand" />
      <circle cx="60" cy="38" r="5" className="f-dim" />
      <circle cx="78" cy="38" r="5" className="f-dim" />

      <text x="42" y="98" className="t-mono a a-type" style={d(0.2)}>
        › learn llms --in python
      </text>
      <g className="a a-rise" style={d(1.3)}>
        <path d="m44 126 6 6 11-12" className="s-brand" />
        <text x="74" y="133" className="t-mono t-dim">tokens · prompts</text>
      </g>
      <g className="a a-rise" style={d(1.7)}>
        <path d="m44 158 6 6 11-12" className="s-brand" />
        <text x="74" y="165" className="t-mono t-dim">api keys · docker</text>
      </g>
      <g className="a a-rise" style={d(2.1)}>
        <path d="m44 190 6 6 11-12" className="s-brand" />
        <text x="74" y="197" className="t-mono t-dim">ci/cd · cloud credits</text>
      </g>
      <text x="42" y="234" className="t-mono a a-rise" style={d(2.6)}>
        ›
      </text>
      <g className="a a-rise" style={d(2.6)}>
        <rect x="58" y="220" width="11" height="18" className="f-brand a-blink" />
      </g>
    </svg>
  );
}

function BuildAnim() {
  return (
    <svg viewBox="0 0 400 280" className="anim" aria-hidden focusable="false">
      <rect x="18" y="18" width="364" height="244" rx="14" className="s-frame" />
      {/* L'en-tête tombe, la colonne glisse, les cartes montent. */}
      <rect x="34" y="34" width="332" height="26" rx="7" className="f-panel a a-down" style={d(0.15)} />
      <rect x="34" y="72" width="84" height="174" rx="9" className="f-panel a a-left" style={d(0.45)} />
      <rect x="132" y="72" width="108" height="78" rx="9" className="f-panel a a-rise" style={d(0.8)} />
      <rect x="252" y="72" width="114" height="78" rx="9" className="f-panel a a-rise" style={d(1.0)} />
      <rect x="132" y="162" width="234" height="84" rx="9" className="f-panel a a-rise" style={d(1.2)} />
      {/* Le contenu se trace. */}
      <path d="M146 96h60M146 112h38" className="s-ink a a-draw" style={{ ...d(1.5), "--len": 100 } as React.CSSProperties} />
      <path d="M266 96h66M266 112h44" className="s-ink a a-draw" style={{ ...d(1.7), "--len": 112 } as React.CSSProperties} />
      <path d="m150 226 34-30 28 18 40-34 40 24 34-28" className="s-brand a a-draw" style={{ ...d(1.9), "--len": 260 } as React.CSSProperties} />
      {/* Et ça part en ligne. */}
      <g className="a a-pop" style={d(2.6)}>
        <rect x="288" y="38" width="70" height="18" rx="9" className="f-brand" />
        <text x="323" y="51" textAnchor="middle" className="t-mono t-on-brand t-xs">
          live
        </text>
      </g>
      <g className="a a-pop" style={d(2.8)}>
        <circle cx="296" cy="47" r="3" className="f-on-brand a-pulse" />
      </g>
    </svg>
  );
}

function CompeteAnim() {
  return (
    <svg viewBox="0 0 400 280" className="anim" aria-hidden focusable="false">
      <rect x="18" y="18" width="364" height="244" rx="14" className="s-frame" />
      {/* Le chrono : l'anneau se vide. */}
      <circle cx="108" cy="140" r="62" className="s-line" />
      <circle
        cx="108"
        cy="140"
        r="62"
        className="s-brand-thick a-ring"
        transform="rotate(-90 108 140)"
        pathLength={100}
      />
      <path d="M108 140V98" className="s-ink a-hand" />
      <circle cx="108" cy="140" r="5" className="f-ink" />
      {/* Trois équipes, trois allures. */}
      {[
        [96, "a-lane-1", "T1"],
        [140, "a-lane-2", "T2"],
        [184, "a-lane-3", "T3"],
      ].map(([y, cls, label]) => (
        <g key={label as string}>
          <text x="204" y={(y as number) + 5} className="t-mono t-dim t-xs">
            {label}
          </text>
          <rect x="232" y={(y as number) - 6} width="126" height="12" rx="6" className="f-panel" />
          <rect
            x="232"
            y={(y as number) - 6}
            width="126"
            height="12"
            rx="6"
            className={`${cls === "a-lane-2" ? "f-brand" : "f-ink-soft"} a-lane ${cls}`}
          />
        </g>
      ))}
      <path d="M358 76v132" className="s-brand a-finish" strokeDasharray="4 5" />
    </svg>
  );
}

function ConnectAnim() {
  const nodes: [number, number, number][] = [
    [200, 140, 13],
    [92, 78, 8],
    [306, 74, 8],
    [70, 190, 8],
    [326, 196, 8],
    [196, 52, 6],
    [206, 232, 6],
  ];
  const edges = [
    "M200 140 92 78",
    "M200 140 306 74",
    "M200 140 70 190",
    "M200 140 326 196",
    "M200 140 196 52",
    "M200 140 206 232",
    "M92 78 196 52",
    "M306 74 326 196",
  ];
  return (
    <svg viewBox="0 0 400 280" className="anim" aria-hidden focusable="false">
      <rect x="18" y="18" width="364" height="244" rx="14" className="s-frame" />
      {edges.map((path, i) => (
        <path
          key={path}
          d={path}
          className="s-line-strong a a-draw"
          style={{ ...d(0.2 + i * 0.14), "--len": 150 } as React.CSSProperties}
        />
      ))}
      {/* Les signaux : ils suivent deux des liens, en boucle. */}
      <circle r="4" className="f-brand a-signal" style={{ offsetPath: "path('M92 78 200 140 326 196')" }} />
      <circle
        r="4"
        className="f-brand a-signal a-signal--b"
        style={{ offsetPath: "path('M306 74 200 140 70 190')" }}
      />
      {nodes.map(([x, y, r], i) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={r}
          className={`${i === 0 ? "f-brand" : "f-node"} a a-pop`}
          style={d(0.1 + i * 0.12)}
        />
      ))}
    </svg>
  );
}

const ANIMS: Record<PillarKey, () => React.ReactNode> = {
  learn: LearnAnim,
  build: BuildAnim,
  compete: CompeteAnim,
  connect: ConnectAnim,
};

export function Pillars({ lang }: { lang: Locale }) {
  const dict = t(lang);
  const pillars = getPillars(lang);

  return (
    <section className="pillars" aria-labelledby="pillars-title">
      <span className="wire" data-wire aria-hidden />
      <div className="container">
        <header className="section-head">
          <p className="eyebrow eyebrow--accent" data-reveal>
            {dict.pillars.eyebrow}
          </p>
          <h2 className="display-1" id="pillars-title" data-reveal>
            {dict.pillars.title}
          </h2>
        </header>

        <ol className="pillars__list">
          {pillars.map((p, i) => {
            const Anim = ANIMS[p.key];
            return (
              <li key={p.key} id={p.key} className={`pillar pillar--${p.key}`} data-anim>
                {/* La parallaxe est sur l'enveloppe, l'apparition sur la carte :
                    deux mouvements sur le même élément se disputeraient son
                    `transform`. */}
                <div data-parallax="6">
                  <div className="pillar__stage" data-reveal>
                    <Anim />
                  </div>
                </div>
                <div className="pillar__text">
                  <p className="pillar__n" data-reveal>
                    0{i + 1}
                  </p>
                  <h3 className="pillar__title" data-reveal>
                    {p.title}
                  </h3>
                  <p className="lede pillar__promise" data-reveal>
                    {p.promise}
                  </p>
                  <ul className="pillar__formats" aria-label={dict.pillars.formats} data-reveal>
                    {p.formats.map((f) => (
                      <li key={f.name}>
                        <span className="pillar__format">{f.name}</span>
                        <span className="pillar__what">{f.what}</span>
                        <span className="pillar__length">{f.length}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
