import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  DynamicDrawUsage,
  Group,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Quaternion,
  Ray,
  Raycaster,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * L'ampoule du haut de page : le logo, en volume, comme une maquette de
 * précision.
 *
 * C'est le dessin du logo tourné autour de son axe, posé dans le noir
 * comme sur l'en-tête du site. Une enveloppe de verre, découpée en
 * panneaux courbes aux joints fins ; au cœur le « L » doré ; dessous la
 * bague du col, la barre et le culot, en métal clair ; autour, les cinq
 * rayons. Vu de face, le verre s'efface au centre et s'éclaire sur les
 * bords : on retrouve le trait clair du logo. Toutes les cotes sont
 * relevées sur `brand-shapes.json`, le rayon du globe ramené à 1.
 *
 * La scène est réglée comme un plan de cinéma : la caméra part de près,
 * de biais, et recule lentement pendant que les pièces arrivent.
 *
 *   1. L'assemblage. Les éclats dérivent dans le noir, puis se
 *      rejoignent et s'ajustent, panneau contre panneau.
 *   2. L'allumage. Le « L » prend, hésite, tient ; sa lumière se répand
 *      dans le verre, les rayons sortent.
 *   3. Ensuite l'ampoule reste entière. Elle ne s'ouvre ni toute seule
 *      ni au défilement : seulement sur deux gestes voulus.
 *      — la souris passe sur les panneaux, ils s'écartent, puis
 *        reviennent ;
 *      — on clique sur l'ampoule (ou on la touche, sans glisser) :
 *        l'enveloppe s'ouvre en vue éclatée, tient un instant, et se
 *        referme.
 *
 * Rien n'est téléchargé : ni modèle, ni image, et les reflets viennent
 * d'une pièce calculée sur place. Chaque rang de panneaux est une seule
 * géométrie, dessinée autant de fois qu'il a de panneaux.
 *
 * Une fois allumée, l'ampoule se balance à peine, comme tenue à la
 * main : la boucle ne tourne que tant qu'elle est à l'écran.
 */

// ---- Le logo, en cotes (rayon du globe = 1, centre du globe = origine) ----
/** Là où le globe laisse place au col. */
const NECK: [number, number][] = [
  [0.794, -0.608],
  [0.469, -1.033],
  [0.411, -1.14],
  [0.411, -1.321],
];
/** Le trait du logo : son épaisseur, et la moitié. */
const STROKE = 0.205;
const HALF = STROKE / 2;
const LETTER = { x: -0.182, top: 0.316, bottom: -0.593, right: 0.272 };
const RAYS = { from: 1.406, to: 1.773, angles: [-60, -30, 0, 30, 60] };
const BAR = { y: -1.639, r: 0.364 };
const CAP = { y: -1.956, r: 0.318 };

// ---- Le verre ----
/** L'épaisseur d'un panneau, et le jeu entre deux panneaux. */
const GLASS = 0.045;
const JOINT = 0.013;
/** Combien de panneaux par rang, du sommet au bas du col. */
const SECTORS = [6, 9, 12, 15, 18, 18, 18, 15, 12, 10, 8];
const GLOBE_BANDS = 8;

// ---- La souris ----
/** Jusqu'où un panneau sent le curseur, et de combien il s'en écarte. */
const REACH = 0.62;
const PUSH = 0.4;

// ---- Le temps, en secondes ----
const ASSEMBLED = 3.1;
const ON = 3.45;
const END = ON + 1.5;
/** L'éclat au clic : le temps de s'ouvrir, de tenir, de se refermer. */
const BURST = { out: 0.45, hold: 0.9, back: 0.9 };

const GLASS_TINT = "#dfe7f3";
const STEEL = "#d8d4ca";
const GOLD = "#c7a160";

type Sample = { r: number; y: number; nr: number; ny: number };
type Kind = "panel" | "letter" | "ray";
type Piece = {
  kind: Kind;
  /** La place dans l'ampoule. */
  pos: Vector3;
  quat: Quaternion;
  /** D'où la pièce arrive. */
  from: Vector3;
  fromQuat: Quaternion;
  /** Où elle se tient dans la vue éclatée. */
  far: Vector3;
  farQuat: Quaternion;
  normal: Vector3;
  delay: number;
  dur: number;
  swirl: number;
  phase: number;
  /** Les panneaux ne s'écartent pas tous au même moment du défilement. */
  lag: number;
};
type Lot = { geometry: BufferGeometry; skin: "glass" | "metal" | "gold"; pieces: Piece[] };

/** Un générateur à graine : l'ampoule s'assemble pareil à chaque visite. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => v * v * (3 - 2 * v);
const inOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
const outCubic = (v: number) => 1 - Math.pow(1 - v, 3);
const outBack = (v: number) => 1 + 2.2 * Math.pow(v - 1, 3) + 1.2 * Math.pow(v - 1, 2);
/** Une ampoule qu'on allume : elle prend, hésite, puis tient. */
const flicker = (v: number) => {
  if (v <= 0) return 0;
  if (v < 0.14) return v / 0.14;
  if (v < 0.24) return 1 - ((v - 0.14) / 0.1) * 0.75;
  if (v < 0.4) return 0.25 + ((v - 0.24) / 0.16) * 0.75;
  return 1;
};
const nextFrame = () => new Promise<void>((done) => requestAnimationFrame(() => done()));

/** Un point du col, sur sa courbe de Bézier, et sa tangente. */
function neck(t: number) {
  const [a, b, c, d] = NECK;
  const u = 1 - t;
  const f = (i: 0 | 1) =>
    u * u * u * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i] + t * t * t * d[i];
  const g = (i: 0 | 1) =>
    3 * u * u * (b[i] - a[i]) + 6 * u * t * (c[i] - b[i]) + 3 * t * t * (d[i] - c[i]);
  return { r: f(0), y: f(1), dr: g(0), dy: g(1) };
}

/**
 * Le profil du verre, du sommet au bas du col, repéré par la distance
 * parcourue le long de la courbe : le globe d'abord (un arc de cercle),
 * puis le col.
 */
function glassProfile() {
  const arc = Math.acos(NECK[0][1]);
  const steps = 240;
  const along = [0];
  const pts = [neck(0)];
  for (let i = 1; i <= steps; i++) {
    const p = neck(i / steps);
    along.push(along[i - 1] + Math.hypot(p.r - pts[i - 1].r, p.y - pts[i - 1].y));
    pts.push(p);
  }
  const neckLength = along[steps];
  const at = (s: number): Sample => {
    if (s <= arc) return { r: Math.sin(s), y: Math.cos(s), nr: Math.sin(s), ny: Math.cos(s) };
    const want = Math.min(neckLength, s - arc);
    let i = 1;
    while (i < steps && along[i] < want) i++;
    const p = pts[i];
    const len = Math.hypot(p.dr, p.dy) || 1;
    return { r: p.r, y: p.y, nr: -p.dy / len, ny: p.dr / len };
  };
  return { at, arc, neckLength };
}

/** Le repère d'une pièce posée sur une surface de révolution, face vers l'extérieur. */
function onRing(c: Sample, phi: number) {
  const normal = new Vector3(c.nr * Math.cos(phi), c.ny, c.nr * Math.sin(phi)).normalize();
  const around = new Vector3(-Math.sin(phi), 0, Math.cos(phi));
  const up = new Vector3().crossVectors(normal, around);
  const pos = new Vector3(c.r * Math.cos(phi), c.y, c.r * Math.sin(phi));
  const quat = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(around, up, normal));
  return { pos, quat, normal };
}

/**
 * Un panneau : le morceau d'une surface de révolution compris entre deux
 * hauteurs (`s0`, `s1`) et sur un angle `sweep`, avec son épaisseur et
 * ses quatre chants. Il est écrit dans son propre repère (celui de
 * `onRing` au milieu du panneau) : chaque panneau du rang est alors la
 * même géométrie, simplement posée ailleurs.
 */
function panel(
  at: (s: number) => Sample,
  s0: number,
  s1: number,
  sweep: number,
  thick: number,
  nu: number,
  nv: number,
) {
  const centre = at((s0 + s1) / 2);
  const ax = new Vector3(0, 0, 1);
  const az = new Vector3(centre.nr, centre.ny, 0).normalize();
  const ay = new Vector3().crossVectors(az, ax);
  const origin = new Vector3(centre.r, centre.y, 0);
  const local = (v: Vector3) => {
    const d = v.clone().sub(origin);
    return [d.dot(ax), d.dot(ay), d.dot(az)];
  };
  const turn = (v: Vector3) => [v.dot(ax), v.dot(ay), v.dot(az)];

  const position: number[] = [];
  const normal: number[] = [];
  const inside: number[] = [];
  const rim: number[] = [];
  const index: number[] = [];
  const outer: Vector3[][] = [];
  const inner: Vector3[][] = [];
  const a0 = s0 + JOINT / 2;
  const a1 = s1 - JOINT / 2;
  for (let iv = 0; iv <= nv; iv++) {
    const smp = at(a0 + ((a1 - a0) * iv) / nv);
    // Le jeu entre deux panneaux garde la même largeur du haut en bas.
    const half = Math.max(0.0005, sweep / 2 - JOINT / 2 / Math.max(0.03, smp.r));
    const rowOut: Vector3[] = [];
    const rowIn: Vector3[] = [];
    for (let iu = 0; iu <= nu; iu++) {
      const d = -half + (2 * half * iu) / nu;
      const n = new Vector3(smp.nr * Math.cos(d), smp.ny, smp.nr * Math.sin(d)).normalize();
      const w = new Vector3(smp.r * Math.cos(d), smp.y, smp.r * Math.sin(d));
      rowOut.push(w.clone().addScaledVector(n, thick / 2));
      rowIn.push(w.clone().addScaledVector(n, -thick / 2));
      // Les deux faces : leurs normales sont celles de la surface, exactes.
      position.push(...local(rowOut[iu]));
      normal.push(...turn(n));
      inside.push(0);
      rim.push(0);
    }
    outer.push(rowOut);
    inner.push(rowIn);
  }
  const face = (nu + 1) * (nv + 1);
  for (let iv = 0; iv <= nv; iv++) {
    const smp = at(a0 + ((a1 - a0) * iv) / nv);
    const half = Math.max(0.0005, sweep / 2 - JOINT / 2 / Math.max(0.03, smp.r));
    for (let iu = 0; iu <= nu; iu++) {
      const d = -half + (2 * half * iu) / nu;
      const n = new Vector3(smp.nr * Math.cos(d), smp.ny, smp.nr * Math.sin(d)).normalize();
      position.push(...local(inner[iv][iu]));
      normal.push(...turn(n.multiplyScalar(-1)));
      inside.push(1);
      rim.push(0);
    }
  }
  for (let iv = 0; iv < nv; iv++) {
    for (let iu = 0; iu < nu; iu++) {
      const a = iv * (nu + 1) + iu;
      const b = a + 1;
      const c = a + nu + 1;
      const d = c + 1;
      index.push(a, b, d, a, d, c);
      index.push(face + a, face + d, face + b, face + a, face + c, face + d);
    }
  }
  // Les chants : quatre bandes plates entre la face du dehors et celle du dedans.
  const edge = (p0: Vector3, p1: Vector3, q0: Vector3, q1: Vector3) => {
    const n = new Vector3().crossVectors(p1.clone().sub(p0), q0.clone().sub(p0)).normalize();
    const start = position.length / 3;
    for (const v of [p0, p1, q0, q1]) {
      position.push(...local(v));
      normal.push(...turn(n));
      inside.push(0);
      rim.push(1);
    }
    index.push(start, start + 1, start + 3, start, start + 3, start + 2);
  };
  for (let iu = 0; iu < nu; iu++) {
    edge(outer[0][iu + 1], outer[0][iu], inner[0][iu + 1], inner[0][iu]);
    edge(outer[nv][iu], outer[nv][iu + 1], inner[nv][iu], inner[nv][iu + 1]);
  }
  for (let iv = 0; iv < nv; iv++) {
    edge(outer[iv][0], outer[iv + 1][0], inner[iv][0], inner[iv + 1][0]);
    edge(outer[iv + 1][nu], outer[iv][nu], inner[iv + 1][nu], inner[iv][nu]);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(position), 3));
  geometry.setAttribute("normal", new BufferAttribute(new Float32Array(normal), 3));
  geometry.setAttribute("aInside", new BufferAttribute(new Float32Array(inside), 1));
  geometry.setAttribute("aRim", new BufferAttribute(new Float32Array(rim), 1));
  geometry.setIndex(index);
  return { geometry, centre };
}

function build(): Lot[] {
  const rand = seeded(20261126);
  const lots: Lot[] = [];
  const spin = (amount = Math.PI * 2) =>
    new Quaternion().setFromAxisAngle(
      new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
      (rand() - 0.5) * 2 * amount,
    );

  const piece = (
    kind: Kind,
    pos: Vector3,
    quat: Quaternion,
    normal: Vector3,
    late: number,
    reach: number,
  ): Piece => {
    // D'où vient la pièce : quelque part dans un grand volume, jamais au centre.
    const from = new Vector3();
    do {
      from.set((rand() - 0.5) * 15, (rand() - 0.5) * 11 - 0.3, rand() * 10 - 5.5);
    } while (from.length() < 2.6);
    // La vue éclatée : chaque pièce part droit devant elle, sans se
    // retourner, à une distance qui varie un peu de l'une à l'autre.
    const far = pos
      .clone()
      .addScaledVector(normal, reach * (0.75 + rand() * 0.65))
      .add(new Vector3((rand() - 0.5) * 0.22, (rand() - 0.5) * 0.22, (rand() - 0.5) * 0.22));
    return {
      kind,
      pos,
      quat,
      from,
      fromQuat: spin(),
      far,
      farQuat: quat.clone().multiply(spin(0.55)),
      normal,
      delay: late + rand() * 0.6,
      dur: 1.7 + rand() * 0.55,
      swirl: 1.4 + rand() * 1.2,
      phase: rand() * Math.PI * 2,
      lag: rand() * 0.3,
    };
  };

  /** Un rang : une géométrie, et autant de pièces que de secteurs. */
  const ring = (
    at: (s: number) => Sample,
    s0: number,
    s1: number,
    sectors: number,
    thick: number,
    skin: Lot["skin"],
    late: number,
    reach: number,
    offset = 0,
  ) => {
    const sweep = (Math.PI * 2) / sectors;
    const nu = Math.max(2, Math.ceil(sweep / 0.07));
    const { geometry, centre } = panel(at, s0, s1, sweep, thick, nu, 4);
    const pieces: Piece[] = [];
    for (let i = 0; i < sectors; i++) {
      const { pos, quat, normal } = onRing(centre, (i + offset) * sweep);
      pieces.push(piece("panel", pos, quat, normal, late, reach));
    }
    lots.push({ geometry, skin, pieces });
  };

  // Le verre : neuf rangs sur le globe, quatre sur le col.
  const glass = glassProfile();
  const top = 0.045;
  const step = (glass.arc - top) / GLOBE_BANDS;
  const neckBands = SECTORS.length - GLOBE_BANDS;
  SECTORS.forEach((sectors, k) => {
    const s0 =
      k < GLOBE_BANDS
        ? top + k * step
        : glass.arc + ((k - GLOBE_BANDS) * glass.neckLength) / neckBands;
    const s1 =
      k < GLOBE_BANDS
        ? top + (k + 1) * step
        : glass.arc + ((k - GLOBE_BANDS + 1) * glass.neckLength) / neckBands;
    ring(glass.at, s0, s1, sectors, GLASS, "glass", k * 0.03, 1.5, (k % 2) * 0.5);
  });

  // La bague du col : le trait qui ferme l'ampoule, sur le logo.
  const collar = (s: number): Sample => ({
    r: NECK[3][0] + 0.02,
    y: NECK[3][1] + HALF - s,
    nr: 1,
    ny: 0,
  });
  ring(collar, 0, STROKE, 8, 0.2, "metal", 0.2, 1.1);
  // La barre.
  const bar = (s: number): Sample => ({ r: BAR.r, y: BAR.y + HALF - s, nr: 1, ny: 0 });
  ring(bar, 0, STROKE, 8, 0.2, "metal", 0.25, 1.2, 0.5);
  // Le culot : une demi-boule, en deux rangs.
  const bowl = (s: number): Sample => {
    const a = s / CAP.r;
    return {
      r: (CAP.r - 0.06) * Math.cos(a),
      y: CAP.y - (CAP.r - 0.06) * Math.sin(a),
      nr: Math.cos(a),
      ny: -Math.sin(a),
    };
  };
  ring(bowl, 0, CAP.r * 0.82, 8, 0.12, "metal", 0.3, 1.2);
  ring(bowl, CAP.r * 0.82, CAP.r * 1.52, 6, 0.12, "metal", 0.3, 1.3, 0.5);
  // Son dessus, plat, comme sur le logo.
  {
    const lid = new CylinderGeometry(CAP.r - 0.02, CAP.r - 0.02, 0.05, 40);
    const pos = new Vector3(0, CAP.y + 0.02, 0);
    lots.push({
      geometry: lid,
      skin: "metal",
      pieces: [piece("panel", pos, new Quaternion(), new Vector3(0, -1, 0), 0.3, 0.9)],
    });
  }

  // Le « L » : deux barres rondes, en tronçons, au cœur de l'ampoule.
  const flat = new Quaternion();
  const lying = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
  const facing = new Vector3(0, 0, 1);
  const tall = LETTER.top - LETTER.bottom;
  const wide = LETTER.right - LETTER.x;
  const rows = 5;
  const cols = 3;
  const stems: Piece[] = [];
  for (let i = 0; i < rows; i++) {
    const y = LETTER.top - ((i + 0.5) / rows) * tall;
    stems.push(piece("letter", new Vector3(LETTER.x, y, 0), flat.clone(), facing, 0.05, 0));
  }
  lots.push({
    geometry: new CylinderGeometry(HALF, HALF, tall / rows + 0.002, 28),
    skin: "gold",
    pieces: stems,
  });
  const feet: Piece[] = [];
  for (let i = 0; i < cols; i++) {
    const x = LETTER.x + ((i + 0.5) / cols) * wide;
    feet.push(piece("letter", new Vector3(x, LETTER.bottom, 0), lying.clone(), facing, 0.05, 0));
  }
  lots.push({
    geometry: new CylinderGeometry(HALF, HALF, wide / cols + 0.002, 28),
    skin: "gold",
    pieces: feet,
  });
  // Ses trois bouts ronds : le haut, l'angle, la droite.
  lots.push({
    geometry: new SphereGeometry(HALF, 28, 18),
    skin: "gold",
    pieces: [
      [LETTER.x, LETTER.top],
      [LETTER.x, LETTER.bottom],
      [LETTER.right, LETTER.bottom],
    ].map(([x, y]) => piece("letter", new Vector3(x, y, 0), flat.clone(), facing, 0.05, 0)),
  });

  // Les cinq rayons : ils ne volent pas, ils sortent quand la lampe s'allume.
  const rays: Piece[] = RAYS.angles.map((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const out = new Vector3(Math.sin(a), Math.cos(a), 0);
    const side = new Vector3(Math.cos(a), -Math.sin(a), 0);
    const quat = new Quaternion().setFromRotationMatrix(
      new Matrix4().makeBasis(side, out, new Vector3(0, 0, 1)),
    );
    const ray = piece(
      "ray",
      out.clone().multiplyScalar((RAYS.from + RAYS.to) / 2),
      quat,
      out,
      0,
      0,
    );
    ray.from = out.clone().multiplyScalar(RAYS.from - 0.05);
    ray.delay = ON + 0.15 + Math.abs(i - 2) * 0.07;
    ray.dur = 0.55;
    return ray;
  });
  lots.push({
    geometry: new CapsuleGeometry(HALF * 0.8, RAYS.to - RAYS.from, 8, 24),
    skin: "gold",
    pieces: rays,
  });
  return lots;
}

export type BulbHandle = {
  /** Lance ou reprend l'animation. */
  play: () => void;
  pause: () => void;
  resize: () => void;
  /** La souris, de -1 à 1 sur chaque axe : l'ampoule tourne un peu vers elle. */
  pointer: (x: number, y: number) => void;
  /** Le curseur, en pixels de la fenêtre : les panneaux s'en écartent. `null` quand il s'en va. */
  hover: (at: { x: number; y: number } | null) => void;
  /** Un clic sur l'ampoule : elle s'ouvre en vue éclatée, puis se referme. */
  pop: () => void;
  /** Montre l'ampoule à un instant donné, en secondes, plus ou moins éclatée (0 à 1). Pour les réglages. */
  seek: (t: number, burst?: number) => void;
  dispose: () => void;
};

export async function createBulb(
  canvas: HTMLCanvasElement,
  stage: HTMLElement,
  { fine, onLost, onLit }: { fine: boolean; onLost: () => void; onLit: () => void },
): Promise<BulbHandle> {
  // Sans carte graphique, la scène se dessinerait au processeur, image par
  // image : on préfère échouer ici, et laisser le logo dessiné.
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1, 0.1, 80);
  await nextFrame();

  // Les reflets : une pièce aux murs clairs, calculée ici.
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.03);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.75;
  await nextFrame();

  scene.add(new HemisphereLight("#9fb2d4", "#0e1a2b", 0.35));
  const key = new DirectionalLight("#ffe9c9", 2.1);
  key.position.set(-4.5, 5.5, 7);
  scene.add(key);
  const rim = new DirectionalLight("#9db8ee", 2.4);
  rim.position.set(5.5, 3, -6.5);
  scene.add(rim);
  // La lumière du « L » : elle réchauffe le verre et le métal qui l'entourent.
  const lamp = new PointLight("#ffc77a", 0, 7, 1.5);
  lamp.position.set(0.04, -0.14, 0.25);

  // Son halo : un disque de lumière douce derrière lui, sans post-traitement.
  const halo = document.createElement("canvas");
  halo.width = halo.height = 128;
  const ink = halo.getContext("2d");
  if (ink) {
    const fade = ink.createRadialGradient(64, 64, 0, 64, 64, 64);
    fade.addColorStop(0, "rgba(255, 205, 130, 0.9)");
    fade.addColorStop(0.35, "rgba(255, 180, 95, 0.32)");
    fade.addColorStop(1, "rgba(255, 170, 80, 0)");
    ink.fillStyle = fade;
    ink.fillRect(0, 0, 128, 128);
  }
  const haloMap = new CanvasTexture(halo);
  const haloMaterial = new SpriteMaterial({
    map: haloMap,
    blending: AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0,
  });
  const haloSprite = new Sprite(haloMaterial);
  haloSprite.position.set(0.045, -0.14, -0.05);
  haloSprite.scale.setScalar(3.1);

  // Le verre : presque invisible de face, lumineux de biais. C'est ce qui
  // redonne, vu de devant, le trait clair du logo sur le bord du globe.
  const glass = {
    center: { value: 0.4 },
    edge: { value: 0.95 },
    power: { value: 2.3 },
    shine: { value: 0.6 },
    back: { value: 0.16 },
    // Les chants des panneaux : pleins en vol, presque effacés une fois posés.
    seam: { value: 1 },
  };
  const glassMaterial = new MeshPhysicalMaterial({
    color: GLASS_TINT,
    roughness: 0.1,
    metalness: 0,
    envMapIntensity: 0.6,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });
  glassMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uCenter = glass.center;
    shader.uniforms.uEdge = glass.edge;
    shader.uniforms.uPower = glass.power;
    shader.uniforms.uShine = glass.shine;
    shader.uniforms.uBack = glass.back;
    shader.uniforms.uSeam = glass.seam;
    shader.vertexShader = shader.vertexShader.replace(
      "void main() {",
      "attribute float aInside;\nattribute float aRim;\nvarying float vInside;\nvarying float vRim;\nvoid main() {\nvInside = aInside;\nvRim = aRim;",
    );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "void main() {",
        "uniform float uCenter;\nuniform float uEdge;\nuniform float uPower;\nuniform float uShine;\nuniform float uBack;\nuniform float uSeam;\nvarying float vInside;\nvarying float vRim;\nvoid main() {",
      )
      .replace(
        "#include <opaque_fragment>",
        [
          "float glassFacing = saturate( abs( dot( normalize( normal ), normalize( vViewPosition ) ) ) );",
          "float glassRim = pow( 1.0 - glassFacing, uPower );",
          "float glassShine = saturate( dot( reflectedLight.directSpecular + reflectedLight.indirectSpecular, vec3( 0.3333 ) ) * uShine );",
          "diffuseColor.a = saturate( mix( uCenter, uEdge, glassRim ) + glassShine ) * mix( 1.0, uBack, vInside ) * mix( 1.0, uSeam, vRim );",
          "#include <opaque_fragment>",
        ].join("\n"),
      );
  };
  const metalMaterial = new MeshPhysicalMaterial({
    color: STEEL,
    roughness: 0.26,
    metalness: 0.92,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
    side: DoubleSide,
  });
  const goldMaterial = new MeshPhysicalMaterial({
    color: GOLD,
    roughness: 0.26,
    metalness: 0.75,
    clearcoat: 0.6,
    clearcoatRoughness: 0.15,
    emissive: new Color("#d9952f"),
    emissiveIntensity: 0,
  });
  const skins = { glass: glassMaterial, metal: metalMaterial, gold: goldMaterial };

  const lots = build();
  const group = new Group();
  const sets = lots.map((lot) => {
    const mesh = new InstancedMesh(lot.geometry, skins[lot.skin], lot.pieces.length);
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.frustumCulled = false;
    // Le métal et l'or d'abord, le verre par-dessus.
    mesh.renderOrder = lot.skin === "glass" ? 2 : 1;
    group.add(mesh);
    return { mesh, pieces: lot.pieces, gap: new Float32Array(lot.pieces.length * 3) };
  });
  group.add(lamp, haloSprite);
  group.position.y = 0.26;
  scene.add(group);
  await nextFrame();

  const raycaster = new Raycaster();
  const cursor = new Vector2();
  const beam = new Ray();
  const inverse = new Matrix4();
  const d = new Vector3();
  const m = new Matrix4();
  const p = new Vector3();
  const q = new Quaternion();
  const s = new Vector3();

  let time = 0;
  /** Le temps qui passe depuis le début, sans s'arrêter : pour le balancement. */
  let life = 0;
  /** La distance de la caméra une fois le plan posé. */
  let distance = 12;
  let last = 0;
  let frame = 0;
  let playing = false;
  let dead = false;
  /** Les programmes sont compilés : on peut dessiner sans figer la page. */
  let ready = false;
  let lit = false;
  let hovering = false;
  let follow = 1;
  /** L'éclat au clic : depuis quand il dure (négatif : pas d'éclat), et où il en est, de 0 à 1. */
  let since = -1;
  let open = 0;
  const aim = { x: 0, y: 0 };
  const now = { x: 0, y: 0 };

  const place = (set: (typeof sets)[number], t: number) => {
    const { mesh, pieces, gap } = set;
    for (let i = 0; i < pieces.length; i++) {
      const it = pieces[i];
      const k = clamp01((t - it.delay) / it.dur);
      if (it.kind === "ray") {
        // Le rayon pousse depuis l'ampoule.
        const g = k <= 0 ? 0 : outBack(k);
        const fat = Math.min(1, k * 3);
        p.copy(it.from).lerp(it.pos, Math.min(1, g));
        s.set(fat, Math.max(0.0001, g), fat);
        m.compose(p, it.quat, s);
        mesh.setMatrixAt(i, m);
        continue;
      }
      const e = inOut(k);
      p.copy(it.from).lerp(it.pos, e);
      // La pièce tourne autour de l'axe en venant, et flotte tant qu'elle attend.
      const a = (1 - e) * it.swirl;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const x = p.x * cos - p.z * sin;
      const z = p.x * sin + p.z * cos;
      p.set(x, p.y + Math.sin(t * 1.1 + it.phase) * 0.22 * (1 - e), z);
      q.copy(it.fromQuat).slerp(it.quat, outCubic(k));
      s.setScalar(Math.max(0.0001, smooth(clamp01(t / 0.45 - it.phase / 20))));

      if (it.kind === "panel" && k >= 1) {
        // Le clic : la vue éclatée, panneau après panneau.
        const out = smooth(clamp01((open - it.lag * 0.45) / (1 - it.lag * 0.45)));
        if (out > 0) {
          p.lerp(it.far, out);
          q.slerp(it.farQuat, out);
        }
        // Le curseur passe : le panneau s'écarte de son rayon, puis revient.
        let gx = 0;
        let gy = 0;
        let gz = 0;
        if (hovering) {
          d.copy(p).sub(beam.origin);
          d.addScaledVector(beam.direction, -d.dot(beam.direction));
          const away = d.length();
          if (away < REACH) {
            const near = 1 - away / REACH;
            const force = (near * near * PUSH) / Math.max(0.05, away);
            gx = d.x * force + it.normal.x * near * 0.16;
            gy = d.y * force + it.normal.y * near * 0.16;
            gz = d.z * force + it.normal.z * near * 0.16;
          }
        }
        const j = i * 3;
        gap[j] += (gx - gap[j]) * follow;
        gap[j + 1] += (gy - gap[j + 1]) * follow;
        gap[j + 2] += (gz - gap[j + 2]) * follow;
        p.x += gap[j];
        p.y += gap[j + 1];
        p.z += gap[j + 2];
      }
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  const draw = (t: number) => {
    for (const set of sets) place(set, t);

    // L'allumage : le « L » prend, sa lumière monte un peu trop puis se pose.
    const power = flicker(clamp01((t - ON) / 0.9));
    const surge = 1 + 0.45 * Math.sin(clamp01((t - ON - 0.35) / 0.9) * Math.PI);
    goldMaterial.emissiveIntensity = power * 0.4 * surge;
    lamp.intensity = power * 6 * surge;
    haloMaterial.opacity = power * 0.55 * surge;
    // En vol les éclats sont pleins, pour qu'on les voie ; assemblé et
    // allumé, le verre s'efface et laisse voir le « L ».
    const clear = smooth(clamp01((t - ASSEMBLED + 0.6) / 1.2));
    glass.center.value = 0.4 - clear * 0.355;
    glass.seam.value = 1 - 0.8 * clear * (1 - open);

    // Le plan : la caméra part de près, l'ampoule de biais ; l'une recule,
    // l'autre se redresse, lentement. Ensuite elle se balance à peine.
    const arrive = inOut(clamp01(t / (ASSEMBLED + 0.9)));
    const sway = clamp01((life - END) / 2);
    group.rotation.y = (1 - arrive) * -1.05 + now.x + Math.sin(life * 0.33) * 0.07 * sway;
    group.rotation.x = (1 - arrive) * 0.3 + now.y + Math.sin(life * 0.21 + 1) * 0.025 * sway;
    camera.position.z = distance * (0.8 + 0.2 * arrive);
    renderer.render(scene, camera);
  };

  const tick = (stamp: number) => {
    frame = 0;
    if (dead) return;
    const dt = Math.min(0.05, last ? (stamp - last) / 1000 : 0);
    last = stamp;
    life += dt;
    if (time < END) time = Math.min(END, time + dt);
    if (!lit && time >= ON) {
      lit = true;
      onLit();
    }
    const ease = 1 - Math.exp(-dt * 5);
    now.x += (aim.x - now.x) * ease;
    now.y += (aim.y - now.y) * ease;
    follow = 1 - Math.exp(-dt * 9);
    // L'éclat : il s'ouvre vite, tient, puis se referme doucement.
    if (since >= 0) {
      since += dt;
      const total = BURST.out + BURST.hold + BURST.back;
      if (since >= total) {
        since = -1;
        open = 0;
      } else if (since < BURST.out) open = outCubic(since / BURST.out);
      else if (since < BURST.out + BURST.hold) open = 1;
      else open = 1 - inOut((since - BURST.out - BURST.hold) / BURST.back);
    }
    if (hovering) {
      raycaster.setFromCamera(cursor, camera);
      inverse.copy(group.matrixWorld).invert();
      beam.copy(raycaster.ray).applyMatrix4(inverse);
    }
    draw(time);

    if (playing) frame = requestAnimationFrame(tick);
    else last = 0;
  };
  const wake = () => {
    if (playing && !frame && !dead) frame = requestAnimationFrame(tick);
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    // Le canevas couvre tout le haut de page : on plafonne ses pixels, pas sa taille.
    const most = fine ? 2.8e6 : 2e6;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(most / (w * h))));
    renderer.setSize(w, h, false);

    // Le cadrage. L'ampoule tient dans son cadre (`stage`), où qu'il soit
    // dans le canevas : la caméra vise une vue entière centrée sur ce
    // cadre, dont le canevas n'est qu'une fenêtre décalée.
    const view = canvas.getBoundingClientRect();
    const area = stage.getBoundingClientRect();
    const cx = area.left + area.width / 2 - view.left;
    const cy = area.top + area.height / 2 - view.top;
    const fullW = 2 * Math.max(cx, w - cx);
    const fullH = 2 * Math.max(cy, h - cy);
    camera.aspect = fullW / fullH;
    camera.setViewOffset(fullW, fullH, fullW / 2 - cx, fullH / 2 - cy, w, h);
    const tan = Math.tan((camera.fov * Math.PI) / 360);
    const tall = (4.3 / 0.95) * (fullH / Math.max(1, area.height));
    const wide = ((3.5 / 0.95) * (fullW / Math.max(1, area.width))) / camera.aspect;
    distance = Math.max(tall, wide) / (2 * tan);
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    if (ready && !frame) draw(time);
  };

  const lost = (event: Event) => {
    event.preventDefault();
    dead = true;
    cancelAnimationFrame(frame);
    onLost();
  };
  canvas.addEventListener("webglcontextlost", lost);

  resize();
  // Les programmes se compilent à part, sans bloquer la page : la première
  // image n'est dessinée qu'ensuite. Dessiner plus tôt les ferait compiler
  // sur place, page figée.
  await renderer.compileAsync(scene, camera);
  ready = true;
  if (!dead) draw(0);

  return {
    play() {
      if (playing || dead) return;
      playing = true;
      last = 0;
      wake();
    },
    pause() {
      playing = false;
      cancelAnimationFrame(frame);
      frame = 0;
    },
    resize,
    pointer(x, y) {
      if (time < END) return;
      aim.x = x * 0.3;
      aim.y = y * 0.14;
      wake();
    },
    hover(at) {
      if (!at) {
        hovering = false;
        wake();
        return;
      }
      const view = canvas.getBoundingClientRect();
      if (!view.width || !view.height) return;
      cursor.set(
        ((at.x - view.left) / view.width) * 2 - 1,
        -(((at.y - view.top) / view.height) * 2 - 1),
      );
      hovering = time >= ASSEMBLED;
      wake();
    },
    pop() {
      if (time < END || since >= 0) return;
      since = 0;
      wake();
    },
    seek(t, burst) {
      time = t;
      life = t;
      if (burst !== undefined) open = burst;
      draw(time);
    },
    dispose() {
      dead = true;
      cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost", lost);
      for (const lot of lots) lot.geometry.dispose();
      for (const set of sets) set.mesh.dispose();
      glassMaterial.dispose();
      metalMaterial.dispose();
      goldMaterial.dispose();
      haloMaterial.dispose();
      haloMap.dispose();
      env.dispose();
      pmrem.dispose();
      room.dispose?.();
      renderer.dispose();
      // Rendre le contexte tout de suite : on revient souvent à l'accueil,
      // et un navigateur n'en garde qu'une poignée.
      renderer.forceContextLoss();
    },
  };
}
