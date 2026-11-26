import type { Object3D } from "three";
import { C, back, ball, box, clamp01, cyl, place, smooth, span, type Piece, type Vec3 } from "@/components/lab/kit";
import type { PillarKey } from "@/lib/pillars";

/**
 * Les quatre pièces du labo, une par pilier.
 *
 * Chaque pièce est un quart de plateau. Son repère : le coin (là où les
 * deux murs se rejoignent, au centre du plateau) est à l'origine, les
 * murs sont les plans x = 0 et z = 0, la pièce occupe x ≥ 0 et z ≥ 0, et
 * on la regarde depuis la diagonale. Un rayon de 4,9 la borne.
 *
 * `pieces` est le décor immobile, fondu en un seul objet. `movers` sont
 * les quelques objets qui bougent : chacun a un pivot, ses pièces, et une
 * fonction qui le pose à l'instant `t` (en secondes) d'une boucle de
 * `period` secondes. `rest` est l'instant montré quand la pièce n'a
 * encore jamais été devant.
 *
 * Rien ici ne représente un écran d'ordinateur imité ni un texte : ce
 * sont des volumes, des barres et des gestes.
 */
export type Mover = {
  at: Vec3;
  /** L'orientation du repère du mobile, autour de la verticale. */
  rot?: number;
  pieces: Piece[];
  move: (o: Object3D, t: number) => void;
};

export type Burst = { at: Vec3; t0: number; count: number };

export type Room = {
  key: PillarKey;
  pieces: Piece[];
  movers: Mover[];
  period: number;
  rest: number;
  /** Une pluie de confettis, à l'instant `t0` de la boucle. */
  burst?: Burst;
};

const R = 4.9;
const H = Math.PI / 2;

// ---- Le mobilier commun --------------------------------------------------

const floor = (c: string): Piece => cyl(R, 0.06, [0, 0.03, 0], c, { seg: 28, arc: [0, H] });

/** Une table, long côté sur X, centrée. */
const desk = (w: number, d: number, top: string = C.oak): Piece[] => [
  box([w, 0.07, d], [0, 0.7, 0], top),
  box([0.07, 0.66, d - 0.14], [-(w / 2 - 0.12), 0.33, 0], C.navy2),
  box([0.07, 0.66, d - 0.14], [w / 2 - 0.12, 0.33, 0], C.navy2),
];

/** Un portable ouvert, posé à hauteur de table. Celui qui s'en sert est du côté +Z. */
const laptop = (): Piece[] => [
  box([0.44, 0.03, 0.3], [0, 0.752, 0], C.navy3, { r: 0.01 }),
  box([0.44, 0.3, 0.03], [0, 0.9, -0.17], C.navy3, { rot: [-0.25, 0, 0], r: 0.01 }),
  box([0.38, 0.24, 0.012], [0, 0.9, -0.152], C.glow, { rot: [-0.25, 0, 0], r: 0, glow: true }),
];

type Arms = "both" | "left" | "right" | "none";

/** Un personnage debout, tourné vers +Z. Les bras qu'on lui retire sont des mobiles. */
const standing = (shirt: string, arms: Arms = "both"): Piece[] => [
  box([0.13, 0.42, 0.15], [-0.085, 0.21, 0], C.navy2, { r: 0.03 }),
  box([0.13, 0.42, 0.15], [0.085, 0.21, 0], C.navy2, { r: 0.03 }),
  box([0.36, 0.46, 0.22], [0, 0.65, 0], shirt, { r: 0.07 }),
  ball(0.17, [0, 1.07, 0], C.ivory),
  ...(arms === "both" || arms === "left"
    ? [box([0.1, 0.4, 0.1], [-0.24, 0.66, 0], shirt, { r: 0.04 })]
    : []),
  ...(arms === "both" || arms === "right"
    ? [box([0.1, 0.4, 0.1], [0.24, 0.66, 0], shirt, { r: 0.04 })]
    : []),
];

/** Un personnage assis sur un tabouret, tourné vers +Z. `desk` : mains sur la table. */
const seated = (shirt: string, hands: "desk" | "lap" | "none" = "desk"): Piece[] => [
  cyl(0.2, 0.42, [0, 0.21, -0.02], C.navy3),
  box([0.13, 0.13, 0.38], [-0.085, 0.485, 0.17], C.navy2, { r: 0.03 }),
  box([0.13, 0.13, 0.38], [0.085, 0.485, 0.17], C.navy2, { r: 0.03 }),
  box([0.13, 0.42, 0.13], [-0.085, 0.21, 0.31], C.navy2, { r: 0.03 }),
  box([0.13, 0.42, 0.13], [0.085, 0.21, 0.31], C.navy2, { r: 0.03 }),
  box([0.36, 0.46, 0.22], [0, 0.71, 0], shirt, { r: 0.07 }),
  ball(0.17, [0, 1.13, 0], C.ivory),
  ...(hands === "desk"
    ? [
        box([0.1, 0.1, 0.38], [-0.22, 0.79, 0.2], shirt, { r: 0.04 }),
        box([0.1, 0.1, 0.38], [0.22, 0.79, 0.2], shirt, { r: 0.04 }),
      ]
    : hands === "lap"
      ? [
          box([0.1, 0.34, 0.1], [-0.23, 0.68, 0.06], shirt, { rot: [-0.5, 0, 0], r: 0.04 }),
          box([0.1, 0.34, 0.1], [0.23, 0.68, 0.06], shirt, { rot: [-0.5, 0, 0], r: 0.04 }),
        ]
      : []),
];

/** Un bras, pendu à son épaule : le pivot est en haut. */
const arm = (shirt: string): Piece[] => [box([0.1, 0.42, 0.1], [0, -0.21, 0], shirt, { r: 0.04 })];

/** L'épaule d'un personnage posé en (x, z) et tourné de `rot` : là où pivote son bras. */
const shoulder = (x: number, z: number, rot: number, side: 1 | -1, y = 0.86): Vec3 => [
  x + side * 0.24 * Math.cos(rot),
  y,
  z - side * 0.24 * Math.sin(rot),
];

/** L'angle qui tourne un personnage en (x, z) vers le point (tx, tz). */
const facing = (x: number, z: number, tx: number, tz: number) => Math.atan2(tx - x, tz - z);

const plant = (): Piece[] => [
  cyl(0.2, 0.3, [0, 0.21, 0], C.beige, { r2: 0.24 }),
  ball(0.3, [0, 0.62, 0], C.slate, { seg: 10 }),
  ball(0.22, [0.16, 0.86, 0.05], C.slate, { seg: 10 }),
  ball(0.19, [-0.14, 0.9, -0.06], C.navy3, { seg: 10 }),
];

/** Fait grandir une barre depuis son pivot, le long d'un axe. */
const grow = (axis: "x" | "y" | "z", k: number) => (o: Object3D) => {
  o.scale[axis] = Math.max(0.0001, k);
};

// ---- LEARN : la salle de workshop ----------------------------------------

const BOARD = [
  { y: 2.08, len: 1.5, c: C.warm, t: 0.4 },
  { y: 1.86, len: 2.25, c: C.glow, t: 1.3 },
  { y: 1.64, len: 1.8, c: C.glow, t: 2.2 },
  { y: 1.42, len: 2.3, c: C.glow, t: 3.1 },
  { y: 1.2, len: 1.1, c: C.warm, t: 4.0 },
];

const learn: Room = {
  key: "learn",
  period: 9,
  rest: 6.4,
  pieces: [
    floor(C.oak),
    box([2.7, 0.03, 2.5], [2.9, 0.075, 2.3], C.navy3, { r: 0.012 }),
    // Le tableau, sur le mur de gauche.
    box([0.07, 1.56, 2.9], [0.15, 1.6, 2.35], C.navy),
    box([0.03, 1.36, 2.7], [0.2, 1.6, 2.35], C.navy2, { r: 0 }),
    box([0.16, 0.05, 2.7], [0.22, 0.8, 2.35], C.beige),
    // Celui qui présente, un bras vers le tableau.
    ...place(standing(C.beige, "left"), [0.95, 0.06, 4.05], 2.3),
    // Deux rangées de tables, face au tableau.
    ...place(desk(2.0, 0.72), [2.25, 0.06, 2.3], H),
    ...place(desk(1.15, 0.72), [3.65, 0.06, 2.3], H),
    ...place(seated(C.ivory), [2.85, 0.06, 1.75], -H),
    ...place(seated(C.navy3), [2.85, 0.06, 2.85], -H),
    ...place(seated(C.beige), [4.25, 0.06, 2.3], -H),
    ...place(laptop(), [2.2, 0.06, 1.75], H),
    ...place(laptop(), [2.2, 0.06, 2.85], H),
    ...place(laptop(), [3.6, 0.06, 2.3], H),
    // La bibliothèque, sur le mur de droite.
    box([1.7, 1.9, 0.3], [1.4, 1.01, 0.27], C.oak),
    box([1.54, 0.5, 0.26], [1.4, 0.4, 0.3], C.navy2, { r: 0 }),
    box([1.54, 0.5, 0.26], [1.4, 1.0, 0.3], C.navy2, { r: 0 }),
    box([1.54, 0.5, 0.26], [1.4, 1.6, 0.3], C.navy2, { r: 0 }),
    ...[0.75, 0.87, 1.0, 1.16, 1.29, 1.52, 1.66, 1.8, 1.96].flatMap((x, i) => [
      box([0.1, 0.36 - (i % 3) * 0.04, 0.2], [x, 0.36 - (i % 3) * 0.02, 0.36], [C.ivory, C.beige, C.slate, C.bronze][i % 4], { r: 0.008 }),
      box([0.1, 0.34 - ((i + 1) % 3) * 0.05, 0.2], [x + 0.02, 0.95 - ((i + 1) % 3) * 0.025, 0.36], [C.beige, C.slate, C.ivory, C.navy3][i % 4], { r: 0.008 }),
    ]),
    ...[0.8, 0.95, 1.1, 1.75, 1.9].map((x, i) =>
      box([0.11, 0.34, 0.2], [x, 1.55, 0.36], [C.bronze, C.ivory, C.beige, C.slate, C.ivory][i], { r: 0.008 }),
    ),
    // L'horloge et la plante.
    cyl(0.3, 0.05, [3.35, 1.95, 0.15], C.navy, { rot: [H, 0, 0], seg: 24 }),
    cyl(0.25, 0.06, [3.35, 1.95, 0.16], C.paper, { rot: [H, 0, 0], seg: 24 }),
    box([0.03, 0.2, 0.012], [3.35, 2.03, 0.2], C.navy, { r: 0 }),
    box([0.14, 0.03, 0.012], [3.41, 1.95, 0.2], C.navy, { r: 0 }),
    ...place(plant(), [4.3, 0.06, 0.62]),
  ],
  movers: [
    // Les lignes s'écrivent au tableau, l'une après l'autre, puis s'effacent.
    ...BOARD.map(
      (l): Mover => ({
        at: [0.222, l.y, 1.12],
        pieces: [box([0.012, 0.075, l.len], [0, 0, l.len / 2], l.c, { r: 0, glow: true })],
        move: (o, t) => grow("z", smooth(span(t, l.t, l.t + 0.8)) * (1 - span(t, 8.2, 8.7)))(o),
      }),
    ),
    // Le bras qui montre.
    {
      at: shoulder(0.95, 4.05, 2.3, 1, 0.92),
      rot: 2.3,
      pieces: arm(C.beige),
      move: (o, t) => {
        o.rotation.z = 1.3 + 0.2 * Math.sin(t * 2.1);
      },
    },
    // L'idée qui s'allume au-dessus d'une tête.
    {
      at: [2.85, 1.7, 2.85],
      pieces: [
        ball(0.15, [0, 0.15, 0], C.warm, { glow: true, seg: 14 }),
        cyl(0.065, 0.08, [0, -0.02, 0], C.navy3, { seg: 10 }),
      ],
      move: (o, t) => {
        o.scale.setScalar(Math.max(0.0001, back(span(t, 5.0, 5.5)) * (1 - span(t, 7.8, 8.2))));
        o.position.y = 0.06 * Math.sin(t * 2.6);
      },
    },
  ],
};

// ---- BUILD : l'atelier ----------------------------------------------------

/** La fusée s'assemble étage par étage, décolle, puis la boucle reprend. */
const lift = (t: number) => 1.5 * smooth(span(t, 5.5, 7.6));
const gone = (t: number) => 1 - span(t, 7.3, 7.9);
const stage =
  (base: number, t0: number) =>
  (o: Object3D, t: number) => {
    const landed = smooth(span(t, t0, t0 + 0.65));
    o.position.y = base + (1 - landed) * 2.4 + lift(t);
    const settle = Math.sin(Math.PI * span(t, t0 + 0.65, t0 + 0.9));
    o.scale.set(1 + 0.08 * settle, 1 - 0.1 * settle, 1 + 0.08 * settle);
    o.scale.multiplyScalar(Math.max(0.0001, t < t0 ? 0 : gone(t)));
  };

const build: Room = {
  key: "build",
  period: 9,
  rest: 4.9,
  pieces: [
    floor(C.sand),
    // Le marquage au sol autour du socle.
    box([2.0, 0.012, 0.06], [2.7, 0.066, 1.72], C.navy3, { r: 0 }),
    box([2.0, 0.012, 0.06], [2.7, 0.066, 3.68], C.navy3, { r: 0 }),
    box([0.06, 0.012, 2.0], [1.72, 0.066, 2.7], C.navy3, { r: 0 }),
    box([0.06, 0.012, 2.0], [3.68, 0.066, 2.7], C.navy3, { r: 0 }),
    // L'établi, le long du mur de gauche.
    box([0.85, 0.09, 3.2], [0.58, 0.86, 2.45], C.oak),
    box([0.72, 0.06, 3.0], [0.55, 0.36, 2.45], C.navy2),
    ...([0.95, 3.95] as const).flatMap((z) => [
      box([0.08, 0.8, 0.08], [0.24, 0.44, z], C.navy2),
      box([0.08, 0.8, 0.08], [0.92, 0.44, z], C.navy2),
    ]),
    // Le panneau d'outils.
    box([0.05, 1.15, 3.0], [0.15, 1.85, 2.45], C.beigeSoft),
    box([0.03, 0.56, 0.08], [0.19, 1.85, 1.25], C.navy3, { r: 0.006 }),
    box([0.03, 0.1, 0.6], [0.19, 2.12, 2.0], C.bronze, { r: 0.006 }),
    cyl(0.16, 0.03, [0.19, 1.75, 2.75], C.navy3, { rot: [0, 0, H], seg: 20 }),
    cyl(0.07, 0.035, [0.2, 1.75, 2.75], C.beigeSoft, { rot: [0, 0, H], seg: 12 }),
    box([0.03, 0.46, 0.07], [0.19, 1.82, 3.3], C.navy3, { rot: [0.5, 0, 0], r: 0.006 }),
    box([0.03, 0.46, 0.07], [0.19, 1.82, 3.58], C.bronze, { rot: [-0.4, 0, 0], r: 0.006 }),
    box([0.03, 0.14, 0.34], [0.19, 1.5, 1.9], C.navy3, { r: 0.006 }),
    // Sur l'établi : une caisse à outils, un étage en attente, des blocs.
    box([0.5, 0.28, 0.32], [0.6, 1.05, 1.35], C.navy3),
    box([0.3, 0.05, 0.05], [0.6, 1.23, 1.35], C.beige),
    cyl(0.26, 0.42, [0.58, 1.12, 3.3], C.ivory),
    box([0.3, 0.2, 0.3], [0.6, 1.01, 3.8], C.beige),
    box([0.22, 0.16, 0.22], [0.62, 1.19, 3.8], C.navy3, { rot: [0, 0.4, 0] }),
    // Le socle où la fusée s'assemble.
    cyl(0.78, 0.14, [2.7, 0.13, 2.7], C.navy2, { seg: 28 }),
    cyl(0.66, 0.04, [2.7, 0.22, 2.7], C.beige, { seg: 28 }),
    // Le poste, le long du mur de droite.
    ...place(desk(1.9, 0.75), [2.75, 0.06, 0.62]),
    box([0.08, 0.34, 0.08], [2.75, 0.96, 0.38], C.navy2),
    box([1.0, 0.6, 0.05], [2.75, 1.4, 0.36], C.navy),
    box([0.9, 0.5, 0.012], [2.75, 1.4, 0.39], C.navy2, { r: 0 }),
    box([0.5, 0.045, 0.012], [2.57, 1.54, 0.4], C.glow, { r: 0, glow: true }),
    box([0.7, 0.045, 0.012], [2.67, 1.45, 0.4], C.glow, { r: 0, glow: true }),
    box([0.38, 0.045, 0.012], [2.51, 1.36, 0.4], C.glow, { r: 0, glow: true }),
    box([0.52, 0.03, 0.17], [2.75, 0.81, 0.82], C.navy3, { r: 0.01 }),
    ...place(seated(C.ivory), [2.75, 0.06, 1.22], Math.PI),
    // Celui qui assemble.
    ...place(standing(C.navy3, "left"), [1.95, 0.06, 3.7], facing(1.95, 3.7, 2.7, 2.7)),
    // Les caisses.
    box([0.62, 0.5, 0.62], [4.2, 0.31, 1.2], C.wood),
    box([0.5, 0.42, 0.5], [4.22, 0.77, 1.24], C.oak, { rot: [0, 0.3, 0] }),
    box([0.46, 0.4, 0.46], [3.55, 0.26, 0.78], C.wood, { rot: [0, -0.2, 0] }),
  ],
  movers: [
    { at: [2.7, 0, 2.7], pieces: [cyl(0.27, 0.46, [0, 0.23, 0], C.ivory)], move: stage(0.24, 0.5) },
    { at: [2.7, 0, 2.7], pieces: [cyl(0.27, 0.46, [0, 0.23, 0], C.beige)], move: stage(0.7, 1.4) },
    { at: [2.7, 0, 2.7], pieces: [cyl(0.27, 0.46, [0, 0.23, 0], C.ivory)], move: stage(1.16, 2.3) },
    { at: [2.7, 0, 2.7], pieces: [cyl(0.27, 0.5, [0, 0.25, 0], C.navy3, { r2: 0.02 })], move: stage(1.62, 3.2) },
    // Les ailerons, qui se déplient une fois la fusée debout.
    {
      at: [2.7, 0, 2.7],
      pieces: [0, 1, 2].map((i) =>
        box([0.05, 0.36, 0.3], [0.36 * Math.sin((i * 2 * Math.PI) / 3), 0.2, 0.36 * Math.cos((i * 2 * Math.PI) / 3)], C.navy3, {
          rot: [0, (i * 2 * Math.PI) / 3, 0],
          r: 0.012,
        }),
      ),
      move: (o, t) => {
        o.position.y = 0.24 + lift(t);
        o.scale.setScalar(Math.max(0.0001, back(span(t, 4.1, 4.5)) * gone(t)));
      },
    },
    // La flamme du décollage.
    {
      at: [2.7, 0, 2.7],
      pieces: [cyl(0.02, 0.5, [0, -0.25, 0], C.warm, { r2: 0.2, glow: true, seg: 12 })],
      move: (o, t) => {
        const on = span(t, 5.4, 5.7) * gone(t);
        o.position.y = 0.26 + lift(t);
        o.scale.set(1, Math.max(0.0001, on * (0.85 + 0.25 * Math.sin(t * 31))), 1);
      },
    },
    // La jauge du poste se remplit pendant l'assemblage.
    {
      at: [2.33, 1.25, 0.4],
      pieces: [box([0.84, 0.06, 0.012], [0.42, 0, 0], C.warm, { r: 0, glow: true })],
      move: (o, t) => grow("x", span(t, 0.5, 4.6) * (1 - span(t, 8.2, 8.7)))(o),
    },
    // Le bras de celui qui assemble : il se lève à chaque étage.
    {
      at: shoulder(1.95, 3.7, facing(1.95, 3.7, 2.7, 2.7), 1, 0.92),
      rot: facing(1.95, 3.7, 2.7, 2.7),
      pieces: arm(C.navy3),
      move: (o, t) => {
        const up = [0.5, 1.4, 2.3, 3.2].reduce((m, t0) => Math.max(m, Math.sin(Math.PI * span(t, t0 - 0.3, t0 + 0.7))), 0);
        o.rotation.x = -0.4 - 1.5 * Math.max(up, span(t, 5.5, 6) * gone(t));
      },
    },
  ],
};

// ---- COMPETE : le tournoi -------------------------------------------------

const RACE = 7;
const cheer = (t: number) => span(t, 6.5, 6.9) * (1 - span(t, 8.5, 8.9));
/** Un bras posé sur la table, qui se lève quand l'équipe gagne. */
const cheering =
  (phase: number) =>
  (o: Object3D, t: number) => {
    o.rotation.x = -1.25 - 1.5 * cheer(t) + 0.12 * Math.sin(t * 9 + phase) * cheer(t);
  };

const compete: Room = {
  key: "compete",
  period: 9,
  rest: 3.2,
  pieces: [
    floor(C.navy3),
    box([3.7, 0.012, 0.06], [2.5, 0.066, 2.42], C.beige, { r: 0 }),
    // L'horloge, sur le mur de gauche.
    cyl(0.88, 0.05, [0.15, 1.8, 2.4], C.navy, { rot: [0, 0, H], seg: 36 }),
    cyl(0.78, 0.06, [0.17, 1.8, 2.4], C.paper, { rot: [0, 0, H], seg: 36 }),
    ...Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return box([0.012, i % 3 === 0 ? 0.14 : 0.08, 0.03], [0.205, 1.8 + 0.66 * Math.cos(a), 2.4 + 0.66 * Math.sin(a)], C.navy, { rot: [a, 0, 0], r: 0 });
    }),
    cyl(0.05, 0.03, [0.215, 1.8, 2.4], C.navy, { rot: [0, 0, H], seg: 12 }),
    // La jauge du temps, sous l'horloge.
    box([0.05, 0.15, 2.04], [0.15, 0.68, 2.4], C.navy),
    // Le tableau des scores, sur le mur de droite.
    box([2.7, 1.3, 0.06], [2.5, 1.8, 0.15], C.navy),
    ...[2.16, 1.8, 1.44].flatMap((y, i) => [
      box([2.16, 0.17, 0.02], [2.62, y, 0.19], C.navy2, { r: 0 }),
      cyl(0.085, 0.02, [1.36, y, 0.2], [C.warm, C.ivory, C.beige][i], { rot: [H, 0, 0], seg: 14, glow: true }),
    ]),
    // La guirlande de fanions.
    box([4.3, 0.02, 0.02], [2.45, 2.56, 0.15], C.navy, { r: 0 }),
    ...Array.from({ length: 9 }, (_, i) =>
      box([0.2, 0.2, 0.02], [0.5 + i * 0.49, 2.42, 0.17], [C.beige, C.ivory, C.sand][i % 3], { rot: [0, 0, Math.PI / 4], r: 0 }),
    ),
    // Deux équipes, face à face.
    ...place(desk(1.6, 0.7), [2.2, 0.06, 1.4]),
    ...place(desk(1.6, 0.7), [1.95, 0.06, 3.5]),
    ...place(seated(C.beige, "none"), [1.8, 0.06, 0.85]),
    ...place(seated(C.ivory, "none"), [2.6, 0.06, 0.85]),
    ...place(seated(C.slate), [1.55, 0.06, 4.05], Math.PI),
    ...place(seated(C.navy2), [2.35, 0.06, 4.05], Math.PI),
    ...place(laptop(), [1.8, 0.06, 1.42], Math.PI),
    ...place(laptop(), [2.6, 0.06, 1.42], Math.PI),
    ...place(laptop(), [1.55, 0.06, 3.48]),
    ...place(laptop(), [2.35, 0.06, 3.48]),
    // Le podium.
    ...place(
      [
        box([0.6, 0.55, 0.6], [0, 0.275, 0], C.ivory),
        box([0.55, 0.38, 0.6], [-0.58, 0.19, 0], C.sand),
        box([0.55, 0.26, 0.6], [0.58, 0.13, 0], C.sand),
      ],
      [3.65, 0.06, 2.55],
      Math.PI / 4,
    ),
  ],
  movers: [
    // Les aiguilles.
    {
      at: [0.222, 1.8, 2.4],
      pieces: [box([0.012, 0.6, 0.045], [0, 0.27, 0], C.navy, { r: 0 })],
      move: (o, t) => {
        o.rotation.x = (Math.min(t, RACE) / RACE) * Math.PI * 2;
      },
    },
    {
      at: [0.228, 1.8, 2.4],
      pieces: [box([0.012, 0.38, 0.06], [0, 0.16, 0], C.bronze, { r: 0 })],
      move: (o, t) => {
        o.rotation.x = 1 + (Math.min(t, RACE) / RACE) * 0.55;
      },
    },
    // Le temps qui s'écoule.
    {
      at: [0.185, 0.68, 1.4],
      pieces: [box([0.012, 0.09, 2.0], [0, 0, 1.0], C.warm, { r: 0, glow: true })],
      move: (o, t) => grow("z", 1 - span(t, 0, RACE))(o),
    },
    // Trois équipes, trois allures.
    ...[
      { y: 2.16, c: C.warm, p: (t: number) => smooth(span(t, 0.3, 6.5)) },
      { y: 1.8, c: C.glow, p: (t: number) => 0.84 * Math.pow(span(t, 0.3, 7), 0.8) },
      { y: 1.44, c: C.glow, p: (t: number) => 0.66 * smooth(span(t, 0.7, 7.2)) },
    ].map(
      (b): Mover => ({
        at: [1.56, b.y, 0.21],
        pieces: [box([2.1, 0.1, 0.012], [1.05, 0, 0], b.c, { r: 0, glow: true })],
        move: (o, t) => grow("x", b.p(t) * (1 - span(t, 8.5, 8.9)))(o),
      }),
    ),
    // L'équipe qui gagne lève les bras.
    { at: shoulder(1.8, 0.85, 0, 1, 0.98), pieces: arm(C.beige), move: cheering(0) },
    { at: shoulder(1.8, 0.85, 0, -1, 0.98), pieces: arm(C.beige), move: cheering(1.7) },
    { at: shoulder(2.6, 0.85, 0, 1, 0.98), pieces: arm(C.ivory), move: cheering(0.9) },
    { at: shoulder(2.6, 0.85, 0, -1, 0.98), pieces: arm(C.ivory), move: cheering(2.6) },
    // La coupe.
    {
      at: [3.65, 0.61, 2.55],
      pieces: [
        cyl(0.13, 0.06, [0, 0.03, 0], C.navy, { seg: 16 }),
        cyl(0.035, 0.16, [0, 0.14, 0], C.beige, { seg: 10 }),
        cyl(0.09, 0.28, [0, 0.36, 0], C.beige, { r2: 0.2, seg: 18 }),
        box([0.5, 0.05, 0.05], [0, 0.4, 0], C.beige, { r: 0.02 }),
      ],
      move: (o, t) => {
        o.rotation.y = t * 0.9 + cheer(t) * 3;
        o.scale.setScalar(1 + 0.3 * back(clamp01(cheer(t))));
      },
    },
  ],
  burst: { at: [2.2, 1.9, 1.3], t0: 6.5, count: 44 },
};

// ---- CONNECT : la soirée ---------------------------------------------------

const AUDIENCE: [number, number, string][] = [
  [3.75, 2.0, C.ivory],
  [3.35, 3.0, C.navy3],
  [2.55, 3.75, C.beige],
  [1.55, 4.1, C.slate],
];
/** Une bulle : elle surgit, tient, se referme. */
const bubble = (from: number, to: number) => (o: Object3D, t: number) => {
  o.scale.setScalar(Math.max(0.0001, back(span(t, from, from + 0.4)) * (1 - span(t, to, to + 0.3))));
};
const bubblePieces = (flip: 1 | -1): Piece[] => [
  box([0.66, 0.38, 0.05], [0, 0.22, 0], C.paper, { r: 0.05 }),
  box([0.13, 0.13, 0.045], [flip * -0.14, 0.03, 0], C.paper, { rot: [0, 0, Math.PI / 4], r: 0.01 }),
  box([0.4, 0.045, 0.012], [-0.06, 0.29, 0.03], C.navy3, { r: 0 }),
  box([0.28, 0.045, 0.012], [-0.12, 0.18, 0.03], C.navy3, { r: 0 }),
];

const connect: Room = {
  key: "connect",
  period: 9,
  rest: 2.4,
  pieces: [
    floor(C.wood),
    // La scène.
    cyl(1.32, 0.14, [1.5, 0.13, 1.5], C.navy2, { seg: 32 }),
    cyl(1.2, 0.03, [1.5, 0.215, 1.5], C.navy3, { seg: 32 }),
    // L'écran, sur le mur de gauche.
    box([0.07, 1.5, 2.5], [0.15, 1.8, 2.3], C.navy),
    box([0.02, 1.34, 2.34], [0.195, 1.8, 2.3], "#bfb7a6", { r: 0, glow: true }),
    // Le pupitre et celui qui parle.
    box([0.42, 0.9, 0.34], [2.1, 0.68, 1.12], C.navy3, { rot: [0, 0.6, 0] }),
    box([0.5, 0.05, 0.42], [2.1, 1.15, 1.12], C.beige, { rot: [0.22, 0.6, 0] }),
    ...place(standing(C.beige, "left"), [1.4, 0.23, 1.6], Math.PI / 4),
    // Le public.
    ...AUDIENCE.flatMap(([x, z, c], i) =>
      place(seated(c, i === 1 ? "none" : "lap"), [x, 0.06, z], facing(x, z, 1.5, 1.5)),
    ),
    // Deux qui discutent, et leur mange-debout.
    ...place(standing(C.ivory), [3.5, 0.06, 0.9], H),
    ...place(standing(C.navy3), [4.3, 0.06, 0.9], -H),
    cyl(0.04, 0.96, [3.9, 0.54, 0.62], C.navy2, { seg: 10 }),
    cyl(0.28, 0.04, [3.9, 1.04, 0.62], C.oak, { seg: 20 }),
    cyl(0.045, 0.1, [3.82, 1.11, 0.6], C.ivory, { seg: 10 }),
    cyl(0.045, 0.1, [3.99, 1.11, 0.66], C.beige, { seg: 10 }),
    // Les affiches et la guirlande, sur le mur de droite.
    box([0.72, 0.98, 0.03], [1.2, 1.6, 0.14], C.navy2),
    box([0.5, 0.3, 0.012], [1.2, 1.78, 0.16], C.beige, { r: 0 }),
    box([0.5, 0.05, 0.012], [1.2, 1.5, 0.16], C.ivory, { r: 0 }),
    box([0.34, 0.05, 0.012], [1.12, 1.4, 0.16], C.ivory, { r: 0 }),
    box([0.72, 0.98, 0.03], [2.15, 1.6, 0.14], C.beigeSoft),
    cyl(0.2, 0.012, [2.15, 1.72, 0.16], C.navy3, { rot: [H, 0, 0], seg: 20 }),
    box([0.46, 0.05, 0.012], [2.15, 1.36, 0.16], C.navy3, { r: 0 }),
    box([4.3, 0.015, 0.015], [2.45, 2.5, 0.15], C.navy, { r: 0 }),
    ...Array.from({ length: 10 }, (_, i) =>
      ball(0.06, [0.45 + i * 0.44, 2.44 - 0.07 * Math.sin((i / 9) * Math.PI), 0.17], i % 2 ? C.warm : C.glow, { glow: true, seg: 8 }),
    ),
  ],
  movers: [
    // Les deux vues qui se succèdent à l'écran.
    {
      at: [0.21, 1.8, 2.3],
      pieces: [
        box([0.012, 0.16, 1.5], [0, 0.4, -0.3], C.navy3, { r: 0 }),
        box([0.012, 0.07, 1.9], [0, 0.08, -0.1], C.slate, { r: 0 }),
        box([0.012, 0.07, 1.4], [0, -0.1, -0.35], C.slate, { r: 0 }),
        box([0.012, 0.07, 1.7], [0, -0.28, -0.2], C.slate, { r: 0 }),
      ],
      move: (o, t) => grow("y", smooth(span(t, 0.2, 0.6)) * (1 - span(t, 4.2, 4.5)))(o),
    },
    {
      at: [0.21, 1.8, 2.3],
      pieces: [
        box([0.012, 0.76, 0.95], [0, 0.02, -0.52], C.navy3, { r: 0 }),
        box([0.012, 0.3, 0.8], [0, 0.25, 0.55], C.bronze, { r: 0 }),
        box([0.012, 0.07, 0.8], [0, -0.08, 0.55], C.slate, { r: 0 }),
        box([0.012, 0.07, 0.6], [0, -0.26, 0.45], C.slate, { r: 0 }),
      ],
      move: (o, t) => grow("y", smooth(span(t, 4.6, 5.0)) * (1 - span(t, 8.4, 8.7)))(o),
    },
    // Le geste de celui qui parle.
    {
      at: shoulder(1.4, 1.6, Math.PI / 4, 1, 1.09),
      rot: Math.PI / 4,
      pieces: arm(C.beige),
      move: (o, t) => {
        o.rotation.x = -0.9 + 0.35 * Math.sin(t * 2.4);
        o.rotation.z = 0.35 + 0.15 * Math.sin(t * 1.7);
      },
    },
    // Une main se lève dans le public.
    {
      at: shoulder(3.35, 3.0, facing(3.35, 3.0, 1.5, 1.5), 1, 0.98),
      rot: facing(3.35, 3.0, 1.5, 1.5),
      pieces: arm(C.navy3),
      move: (o, t) => {
        o.rotation.x = -0.35 - 2.5 * smooth(span(t, 5.3, 5.8)) * (1 - smooth(span(t, 7.6, 8.1)));
      },
    },
    {
      at: shoulder(3.35, 3.0, facing(3.35, 3.0, 1.5, 1.5), -1, 0.98),
      rot: facing(3.35, 3.0, 1.5, 1.5),
      pieces: arm(C.navy3),
      move: (o) => {
        o.rotation.x = -0.35;
      },
    },
    // La conversation : une bulle, puis l'autre.
    { at: [3.5, 1.42, 0.9], rot: Math.PI / 4, pieces: bubblePieces(-1), move: bubble(0.5, 3.4) },
    { at: [4.3, 1.42, 0.9], rot: Math.PI / 4, pieces: bubblePieces(1), move: bubble(3.9, 7.4) },
  ],
};

export const ROOMS: Room[] = [learn, build, compete, connect];

// ---- Le plateau, les murs, le mât de la lampe ----------------------------

export const BASE: Piece[] = [
  cyl(5.35, 0.5, [0, -0.25, 0], C.navy2, { seg: 64 }),
  cyl(5.45, 0.1, [0, -0.5, 0], C.beige, { seg: 64 }),
  cyl(4.7, 0.3, [0, -0.7, 0], C.navy, { seg: 48 }),
  // Les deux murs en croix, et leur couvre-mur.
  box([0.2, 2.6, 10.2], [0, 1.3, 0], C.ivory, { r: 0.02 }),
  box([10.2, 2.6, 0.2], [0, 1.3, 0], C.ivory, { r: 0.02 }),
  box([0.28, 0.06, 10.3], [0, 2.63, 0], C.beige, { r: 0.02 }),
  box([10.3, 0.06, 0.28], [0, 2.63, 0], C.beige, { r: 0.02 }),
  // Le mât, au croisement.
  box([0.44, 3.1, 0.44], [0, 1.55, 0], C.navy2, { r: 0.03 }),
  cyl(0.3, 0.12, [0, 3.16, 0], C.beige, { seg: 20 }),
];
