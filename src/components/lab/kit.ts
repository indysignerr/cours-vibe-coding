import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  Euler,
  Matrix4,
  Quaternion,
  SphereGeometry,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * La boîte à pièces de la maquette.
 *
 * Tout le labo est construit en code, à partir de trois formes : le pavé,
 * le cylindre, la boule. Une pièce (`Piece`) dit sa forme, sa place et sa
 * couleur ; `build` fond une liste de pièces en UNE géométrie, colorée
 * sommet par sommet. Cent objets immobiles coûtent ainsi un seul appel de
 * dessin, et le site ne télécharge aucun modèle.
 *
 * Les unités sont des mètres de maquette : un personnage fait 1,25 de haut.
 */
export type Vec3 = [number, number, number];

type Shape =
  | { k: "box"; s: Vec3; r: number }
  | { k: "cyl"; r: number; r2: number; h: number; seg: number; arc?: [number, number] }
  | { k: "ball"; r: number; seg: number };

export type Piece = {
  shape: Shape;
  m: Matrix4;
  c: string;
  /** Une pièce qui émet sa propre lumière : écran, ampoule, guirlande. */
  glow?: boolean;
};

/** La palette de la maquette : le marine, le beige et l'ivoire, et leurs nuances. */
export const C = {
  navy: "#0e1a2b",
  navy2: "#172a42",
  navy3: "#24405f",
  slate: "#3d5674",
  ivory: "#f1eadb",
  paper: "#fbf7ee",
  sand: "#e3d7c0",
  oak: "#d6bf97",
  wood: "#c2a274",
  beige: "#c9ae84",
  beigeSoft: "#e3cfae",
  bronze: "#8a6a3e",
  glow: "#fff0d2",
  warm: "#ffd08a",
} as const;

const at = (p: Vec3, rot: Vec3 = [0, 0, 0]) =>
  new Matrix4().compose(
    new Vector3(...p),
    new Quaternion().setFromEuler(new Euler(...rot)),
    new Vector3(1, 1, 1),
  );

type Opt = { rot?: Vec3; glow?: boolean };

/** Un pavé. `r` adoucit ses arêtes : 0 les laisse vives (et coûte douze triangles). */
export const box = (s: Vec3, p: Vec3, c: string, o: Opt & { r?: number } = {}): Piece => ({
  shape: { k: "box", s, r: o.r ?? 0.025 },
  m: at(p, o.rot),
  c,
  glow: o.glow,
});

/** Un cylindre d'axe vertical ; `r2` en fait un cône, `arc` une part de camembert. */
export const cyl = (
  r: number,
  h: number,
  p: Vec3,
  c: string,
  o: Opt & { r2?: number; seg?: number; arc?: [number, number] } = {},
): Piece => ({
  shape: { k: "cyl", r, r2: o.r2 ?? r, h, seg: o.seg ?? 20, arc: o.arc },
  m: at(p, o.rot),
  c,
  glow: o.glow,
});

export const ball = (r: number, p: Vec3, c: string, o: Opt & { seg?: number } = {}): Piece => ({
  shape: { k: "ball", r, seg: o.seg ?? 16 },
  m: at(p, o.rot),
  c,
  glow: o.glow,
});

/** Pose un objet (une liste de pièces) quelque part, tourné autour de la verticale. */
export const place = (pieces: Piece[], p: Vec3, rotY = 0): Piece[] => {
  const m = at(p, [0, rotY, 0]);
  return pieces.map((x) => ({ ...x, m: m.clone().multiply(x.m) }));
};

function geometry(shape: Shape): BufferGeometry {
  if (shape.k === "box") {
    const [x, y, z] = shape.s;
    const r = Math.min(shape.r, x / 2, y / 2, z / 2);
    return r > 0.004 ? new RoundedBoxGeometry(x, y, z, 2, r) : new BoxGeometry(x, y, z);
  }
  if (shape.k === "cyl") {
    return shape.arc
      ? new CylinderGeometry(shape.r2, shape.r, shape.h, shape.seg, 1, false, shape.arc[0], shape.arc[1])
      : new CylinderGeometry(shape.r2, shape.r, shape.h, shape.seg);
  }
  return new SphereGeometry(shape.r, shape.seg, Math.max(8, Math.round(shape.seg * 0.7)));
}

/**
 * Fond des pièces en une géométrie. Chaque sommet porte la couleur de sa
 * pièce : un seul matériau suffit pour toute une salle.
 */
export function build(pieces: Piece[]): BufferGeometry | null {
  if (pieces.length === 0) return null;
  const color = new Color();
  const parts = pieces.map((p) => {
    const raw = geometry(p.shape);
    const g = raw.index ? raw.toNonIndexed() : raw;
    if (g !== raw) raw.dispose();
    g.deleteAttribute("uv");
    g.applyMatrix4(p.m);
    color.set(p.c);
    const n = g.getAttribute("position").count;
    const colors = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    g.setAttribute("color", new BufferAttribute(colors, 3));
    return g;
  });
  const merged = mergeGeometries(parts, false);
  parts.forEach((g) => g.dispose());
  return merged;
}

/** Sépare ce qui est éclairé de ce qui éclaire, et fond chaque lot. */
export const split = (pieces: Piece[]) => ({
  solid: build(pieces.filter((p) => !p.glow)),
  glow: build(pieces.filter((p) => p.glow)),
});

// ---- Le mouvement : quelques fonctions de temps -------------------------

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
/** La part du chemin parcourue entre `a` et `b`, bornée à 0…1. */
export const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
/** Arrive en dépassant un peu, puis revient : un objet qui se pose. */
export const back = (x: number) => {
  const k = 1.70158;
  const u = x - 1;
  return 1 + (k + 1) * u * u * u + k * u * u;
};
