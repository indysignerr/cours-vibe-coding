import { t, type Locale } from "@/lib/i18n";
import { getPillars, type PillarKey } from "@/lib/pillars";

/**
 * La planche : l'ampoule de l'association, en dessin technique.
 *
 * C'est le dessin de l'affiche que le bureau a retenue (le « plan »),
 * porté à l'écran : une ampoule dont le filament est un L, cotée comme
 * une pièce d'atelier, et quatre repères, un par pilier. Les cotes disent
 * deux faits : ce que ça coûte, et à quel rythme.
 *
 * Tout le dessin est calculé ici, en millimètres de l'affiche : une cote
 * déplacée ne demande qu'un nombre. Il est écrit dans le HTML : rien
 * n'attend de JavaScript, et il n'y a aucune image à charger.
 *
 * À l'ouverture, la planche se trace : les axes, le verre, le culot, les
 * cotes, les repères, et pour finir le filament s'allume. Ce tracé vit
 * dans globals.css, sous `html.motion` ; sans lui le dessin est là,
 * entier, dès le premier affichage.
 *
 * Les noms des piliers sont des liens vers leur section. Au survol ou au
 * focus d'un nom, la pièce qu'il désigne passe au bronze.
 */

const n = (v: number) => +v.toFixed(2);

/** Le cadre de la vue. */
const VIEW = { x: 42, y: 88, w: 184, h: 254 };

// L'ampoule : centre et rayon du globe, col, culot.
const cx = 135;
const cy = 178;
const R = 64;
const neck = 25;
const yBase = 282;
const pitch = 5.6;
const turns = 5;
const yThread = yBase + 6.5;
const yEnd = yThread + pitch * turns;
const yTip = yEnd + 14;

const glass = (r: number, k: number, d: number) =>
  `M${cx - k} ${yBase}C${cx - k} ${yBase - 30 + d} ${cx - r} ${cy + 54 + d} ${cx - r} ${cy}` +
  `A${r} ${r} 0 1 1 ${cx + r} ${cy}C${cx + r} ${cy + 54 + d} ${cx + k} ${yBase - 30 + d} ${cx + k} ${yBase}`;

const GLASS = glass(R, neck, 0);
const GLASS_INNER = glass(R - 2.5, neck - 2.5, 1.2);
// Le pied de verre, son queusot (caché, donc en tirets), les fils.
const STEM =
  `M${cx - 14} ${yBase}C${cx - 14} 263 ${cx - 5.5} 257 ${cx - 5.5} 241V225.5` +
  `Q${cx - 5.5} 220 ${cx} 220Q${cx + 5.5} 220 ${cx + 5.5} 225.5V241` +
  `C${cx + 5.5} 257 ${cx + 14} 263 ${cx + 14} ${yBase}`;
const TUBE = `M${cx - 1.8} ${yBase}V237Q${cx} 234.4 ${cx + 1.8} 237V${yBase}`;
const WIRES = `M${cx - 3.5} 221.2L${cx - 14} 199.4M${cx + 3.5} 221.2L${cx + 22} 199.4M${cx} 220V199.2`;
// Le filament : un L. La seule couleur du dessin.
const FILAMENT = `M${cx - 14} 146V196H${cx + 22}`;

// Le culot : bague, filets, isolant hachuré, plot de contact.
const RING = `M${cx - 26.5} ${yBase}h53v6.5h-53z`;
const THREAD = (() => {
  let left = `M${cx - neck} ${yThread}`;
  let right = `M${cx + neck} ${yThread}`;
  let lines = "";
  for (let k = 0; k < turns; k++) {
    left += `q-3.4 ${pitch / 2} 0 ${pitch}`;
    right += `q3.4 ${pitch / 2} 0 ${pitch}`;
    const y = yThread + pitch * k;
    if (k) lines += `M${cx - neck} ${n(y + 0.9)}L${cx + neck} ${n(y - 0.9)}`;
    lines += `M${n(cx - neck - 1.7)} ${n(y + pitch / 2 + 0.9)}L${n(cx + neck + 1.7)} ${n(y + pitch / 2 - 0.9)}`;
  }
  return {
    sides: `${left}${right}M${cx - neck} ${n(yEnd)}H${cx + neck}`,
    lines,
  };
})();
const INSULATOR = `M${cx - 23.5} ${n(yEnd)}L${cx - 14} ${n(yEnd + 9.5)}H${cx + 14}L${cx + 23.5} ${n(yEnd)}Z`;
const CONTACT = `M${cx - 9} ${n(yEnd + 9.5)}h18v4.5h-18z`;

// Les cotes. En largeur : ce que ça coûte. En hauteur : à quel rythme.
const xDim = 52;
const yDim = 100;
const arrowH = (x: number, y: number, d: number) => `M${x} ${y}l${4.2 * d} -1.1v2.2z`;
const arrowV = (x: number, y: number, d: number) => `M${x} ${y}l-1.1 ${4.2 * d}h2.2z`;
const DIM_W = `M${cx - R} ${cy - 4}V${yDim - 3}M${cx + R} ${cy - 4}V${yDim - 3}M${cx - R} ${yDim}H${cx + R}`;
const DIM_W_ARROWS = arrowH(cx - R, yDim, 1) + arrowH(cx + R, yDim, -1);
const DIM_H = `M${cx - 4} ${cy - R}H${xDim - 3}M${cx - 11} ${n(yTip)}H${xDim - 3}M${xDim} ${cy - R}V${n(yTip)}`;
const DIM_H_ARROWS = arrowV(xDim, cy - R, 1) + arrowV(xDim, n(yTip), -1);
const yMid = n((cy - R + yTip) / 2);

// Les repères : d'où part le trait, à quelle hauteur. La bulle est au bout.
const BALLOON = { x: 218.4, r: 6.2 };
const PARTS: Record<PillarKey, { y: number; x: number }> = {
  learn: { y: 147, x: cx - 10.6 },
  build: { y: 206, x: cx + 16.4 },
  compete: { y: 254, x: cx + 20 },
  connect: { y: n(yThread + pitch * 2.5 - 0.5), x: cx + neck + 3.6 },
};

/**
 * La cote de hauteur porte une phrase : si une langue l'allonge, le
 * corps baisse pour qu'elle tienne le long du trait. Renvoie undefined
 * tant que le corps de la feuille de style suffit.
 */
const DIM_ROOM = yTip - (cy - R) - 14;
const fitDim = (label: string) => {
  const size = DIM_ROOM / (label.length * 0.74);
  return size < 6.2 ? { fontSize: `${n(size)}px` } : undefined;
};

/** Le moment où le filament s'allume, en secondes après l'ouverture. */
export const PLATE_ON = 2.05;
const at = (s: number, dur?: number) =>
  ({
    "--at": `${s}s`,
    ...(dur ? { "--dur": `${dur}s` } : {}),
  }) as React.CSSProperties;

export function Plate({ lang }: { lang: Locale }) {
  const d = t(lang).hero.plate;
  const pillars = getPillars(lang);
  // Les cotes s'écrivent en capitales, comme sur une planche. Elles le
  // sont ici, dans le texte : tous les navigateurs ne les mettent pas en
  // capitales par le style à l'intérieur d'un SVG.
  const price = d.price.toLocaleUpperCase(lang);
  const rhythm = d.rhythm.toLocaleUpperCase(lang);

  return (
    <div className="plate">
      <figure className="plate__figure">
        <div className="plate__draw">
          <div className="plate__art">
            <svg
              className="plate__svg"
              viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
              role="img"
              aria-label={d.alt}
              focusable="false"
            >
              <defs>
                <pattern
                  id="plate-hatch"
                  width="1.6"
                  height="1.6"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <path d="M0 0V1.6" className="pl-thin" />
                </pattern>
              </defs>

              {/* Le verre s'éclaire : un aplat, posé sous tout le reste. */}
              <g className="pl-part pl-part--compete">
                <path d={`${GLASS}Z`} className="pl-lit" />
              </g>

              {/* Axes et point de construction. */}
              <g className="pl-fade" style={at(0.1, 0.5)}>
                <path d={`M${cx} 104V338M60 ${cy}H210`} className="pl-axis" />
                <circle cx={cx} cy={cy} r="1.1" className="pl-thin" />
              </g>

              {/* Le verre : un trait fort, et son épaisseur en trait fin. */}
              <path d={GLASS} className="pl-outline pl-draw" pathLength={1} style={at(0.2, 1.25)} />
              <path
                d={GLASS_INNER}
                className="pl-thin pl-soft pl-draw"
                pathLength={1}
                style={at(0.5, 1.15)}
              />

              {/* Le pied, les fils : ce qui tient le filament. */}
              <g className="pl-part pl-part--build">
                <path d={STEM} className="pl-mid pl-draw" pathLength={1} style={at(0.75, 0.8)} />
                <path d={TUBE} className="pl-hidden pl-fade" style={at(1.2, 0.4)} />
                <path d={WIRES} className="pl-wire pl-draw" pathLength={1} style={at(1.3, 0.5)} />
              </g>

              {/* Le culot. */}
              <g className="pl-part pl-part--connect">
                <path d={RING} className="pl-mid pl-draw" pathLength={1} style={at(0.9, 0.5)} />
                <path
                  d={THREAD.sides}
                  className="pl-mid pl-draw"
                  pathLength={1}
                  style={at(1.05, 0.7)}
                />
                <path
                  d={THREAD.lines}
                  className="pl-thin pl-draw"
                  pathLength={1}
                  style={at(1.15, 0.8)}
                />
                <g className="pl-fade" style={at(1.5, 0.4)}>
                  <path d={INSULATOR} className="pl-mid pl-hatch" />
                  <path d={CONTACT} className="pl-mid" />
                </g>
              </g>

              {/* Le filament : tracé à l'encre, puis allumé. */}
              <g className="pl-part pl-part--learn">
                <path
                  d={FILAMENT}
                  className="pl-fil-edge pl-draw"
                  pathLength={1}
                  style={at(1.45, 0.6)}
                />
                <path d={FILAMENT} className="pl-fil" />
              </g>

              {/* Les cotes. */}
              <g>
                <path d={DIM_W} className="pl-thin pl-draw" pathLength={1} style={at(1.25, 0.6)} />
                <path d={DIM_W_ARROWS} className="pl-arrow pl-fade" style={at(1.75, 0.3)} />
                <text x={cx} y={n(yDim - 2.6)} className="pl-dim pl-fade" style={at(1.75, 0.4)}>
                  {price}
                </text>
                <path d={DIM_H} className="pl-thin pl-draw" pathLength={1} style={at(1.35, 0.7)} />
                <path d={DIM_H_ARROWS} className="pl-arrow pl-fade" style={at(1.9, 0.3)} />
                <text
                  x={xDim - 2.6}
                  y={yMid}
                  className="pl-dim pl-fade"
                  transform={`rotate(-90 ${xDim - 2.6} ${yMid})`}
                  style={{ ...at(1.9, 0.4), ...fitDim(rhythm) }}
                >
                  {rhythm}
                </text>
              </g>

              {/* Les repères : un point sur la pièce, un trait, une bulle. */}
              {pillars.map((p, i) => {
                const { x, y } = PARTS[p.key];
                const t0 = 1.55 + i * 0.13;
                return (
                  <g key={p.key} className={`pl-part pl-part--${p.key}`}>
                    <path
                      d={`M${x} ${y}H${n(BALLOON.x - BALLOON.r)}`}
                      className="pl-leader pl-draw"
                      pathLength={1}
                      style={at(t0, 0.4)}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="1.05"
                      className="pl-arrow pl-fade"
                      style={at(t0, 0.2)}
                    />
                    <g className="pl-fade" style={at(t0 + 0.3, 0.3)}>
                      <circle cx={BALLOON.x} cy={y} r={BALLOON.r} className="pl-mid" />
                      <text x={BALLOON.x} y={y} className="pl-num">
                        {String(i + 1).padStart(2, "0")}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          <ol className="plate__calls" aria-label={d.legend}>
            {pillars.map((p, i) => (
              <li
                key={p.key}
                className={`plate__call plate__call--${p.key} rise`}
                style={
                  {
                    "--y": `${n(((PARTS[p.key].y - VIEW.y) / VIEW.h) * 100)}%`,
                    "--i": 25 + i * 2,
                  } as React.CSSProperties
                }
              >
                <a className="plate__link" href={`#${p.key}`}>
                  <span className="plate__key" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="plate__name">{p.title}</span>
                  <span className="plate__part">{d.parts[p.key]}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>

        <p className="plate__note rise" style={{ "--i": 4 } as React.CSSProperties}>
          {d.note[0]}
          <br />
          {d.note[1]}
        </p>
        <figcaption className="plate__fig rise" style={{ "--i": 30 } as React.CSSProperties}>
          {d.fig}
        </figcaption>
      </figure>
    </div>
  );
}
