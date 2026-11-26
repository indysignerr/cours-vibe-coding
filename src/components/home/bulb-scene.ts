import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  DynamicDrawUsage,
  Group,
  HemisphereLight,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  Quaternion,
  Ray,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * L'ampoule du haut de page : des pièces éparses qui volent et
 * s'assemblent en une ampoule, qui s'allume. Elle n'éclate que si on le
 * lui demande.
 *
 *   1. L'assemblage. Des centaines de tuiles laquées arrivent de partout
 *      en tournant et pavent la silhouette du logo : le globe, le col, la
 *      barre et le culot. Le « L » se pose en relief sur la face avant.
 *   2. L'allumage. Le cœur de l'ampoule s'éclaire : la lumière passe par
 *      les joints, le « L » et les cinq rayons s'allument.
 *   3. Ensuite l'ampoule reste entière, et répond à trois gestes :
 *      — la souris passe sur les tuiles, elles s'écartent et laissent
 *        voir la lumière dessous, puis reviennent ;
 *      — on clique ou on touche l'ampoule, toutes les tuiles sautent ;
 *      — on fait défiler la page, la coque éclate à mesure : les tuiles
 *        s'envolent et il reste la lumière. On remonte, elle se reforme.
 *
 * La forme est celle du logo, mise en volume : toutes les cotes
 * ci-dessous sont relevées sur `brand-shapes.json`, le rayon du globe
 * ramené à 1.
 *
 * Le dessin coûte trois appels, plus leur ombre : les tuiles (une seule
 * géométrie, une matrice et une couleur par pièce), le « L » avec ses
 * rayons, et le cœur lumineux. Rien n'est téléchargé : ni modèle, ni
 * image, et le reflet des tuiles vient d'une pièce calculée sur place.
 *
 * Rien n'est redessiné tant que rien ne bouge : la boucle s'arrête après
 * l'allumage et ne repart qu'au geste suivant.
 */

// ---- Le logo, en cotes (rayon du globe = 1, centre du globe = origine) ----
/** Là où le globe laisse place au col. */
const NECK: [number, number][] = [
  [0.794, -0.608],
  [0.469, -1.033],
  [0.411, -1.14],
  [0.411, -1.321],
];
const LETTER = { x: -0.182, top: 0.316, bottom: -0.593, right: 0.272, width: 0.2 };
const RAYS = { from: 1.406, to: 1.773, width: 0.2, angles: [-60, -30, 0, 30, 60] };
const BAR = { y: -1.639, r: 0.364 };
const CAP = { y: -1.956, r: 0.318 };

// ---- Les tuiles ----
const TILE = 0.142; // côté visé d'une tuile : six à sept cents sur l'ampoule
const JOINT = 0.02;
/** Épaisseur d'une tuile, en part de son côté. */
const DEEP = 0.58;

// ---- La souris ----
/** Jusqu'où une tuile sent le curseur, et de combien elle s'en écarte. */
const REACH = 0.6;
const PUSH = 0.42;

// ---- Le temps, en secondes ----
const ASSEMBLED = 2.45;
const ON = 2.75;
const END = ON + 1.3;

const NAVY = ["#0e1a2b", "#14263d", "#0a1320", "#0e1a2b", "#1b3350", "#30475f"];
const BRASS = "#8a6a3e";
const GOLD = "#b58f52";

type Kind = "tile" | "letter" | "ray";
type Piece = {
  kind: Kind;
  /** La place dans l'ampoule. */
  pos: Vector3;
  quat: Quaternion;
  scale: Vector3;
  /** D'où la pièce arrive. */
  from: Vector3;
  fromQuat: Quaternion;
  /** Où elle part quand la coque éclate. */
  far: Vector3;
  farQuat: Quaternion;
  normal: Vector3;
  delay: number;
  dur: number;
  swirl: number;
  phase: number;
  /** Les tuiles n'éclatent pas toutes au même moment du défilement. */
  lag: number;
  color: Color;
};

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

/** Le profil du verre, de haut en bas : un rang de tuiles par étape. */
function glassRings() {
  const rings: { r: number; y: number; nr: number; ny: number }[] = [];
  const end = Math.acos(NECK[0][1]);
  const count = Math.round(end / TILE);
  const step = end / (count + 0.5);
  for (let k = 1; k <= count; k++) {
    const a = k * step;
    rings.push({ r: Math.sin(a), y: Math.cos(a), nr: Math.sin(a), ny: Math.cos(a) });
  }
  // Le col : on avance à pas égaux le long de la courbe.
  const samples = 200;
  const lengths = [0];
  let prev = neck(0);
  for (let i = 1; i <= samples; i++) {
    const p = neck(i / samples);
    lengths.push(lengths[i - 1] + Math.hypot(p.r - prev.r, p.y - prev.y));
    prev = p;
  }
  const total = lengths[samples];
  const n = Math.max(1, Math.round(total / step));
  for (let j = 0; j < n; j++) {
    const target = ((j + 0.5) / n) * total;
    let i = 1;
    while (i < samples && lengths[i] < target) i++;
    const p = neck(i / samples);
    const len = Math.hypot(p.dr, p.dy) || 1;
    rings.push({ r: p.r, y: p.y, nr: -p.dy / len, ny: p.dr / len });
  }
  return { rings, step };
}

/** Une tuile posée sur une surface de révolution, face vers l'extérieur. */
function onRing(r: number, y: number, nr: number, ny: number, phi: number) {
  const normal = new Vector3(nr * Math.cos(phi), ny, nr * Math.sin(phi)).normalize();
  const around = new Vector3(-Math.sin(phi), 0, Math.cos(phi));
  const up = new Vector3().crossVectors(normal, around);
  const pos = new Vector3(r * Math.cos(phi), y, r * Math.sin(phi));
  const quat = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(around, up, normal));
  return { pos, quat, normal };
}

function build() {
  const rand = seeded(20261126);
  const tiles: Piece[] = [];
  const marks: Piece[] = [];
  const spin = () =>
    new Quaternion().setFromAxisAngle(
      new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
      rand() * Math.PI * 2,
    );

  const piece = (
    kind: Kind,
    pos: Vector3,
    quat: Quaternion,
    scale: Vector3,
    normal: Vector3,
    color: string,
    late = 0,
  ): Piece => {
    // D'où vient la pièce : quelque part dans un grand volume, jamais au centre.
    const from = new Vector3();
    do {
      from.set((rand() - 0.5) * 15, (rand() - 0.5) * 11 - 0.3, rand() * 10 - 5.5);
    } while (from.length() < 2.6);
    // Où elle part si la coque éclate : droit devant elle, plus ou moins
    // loin, avec un écart de côté. Une sur cinq file bien plus loin.
    const reach = 0.9 + rand() * 1.9 + (rand() < 0.2 ? 1.2 + rand() * 1.8 : 0);
    const far = pos
      .clone()
      .addScaledVector(normal, reach)
      .add(new Vector3((rand() - 0.5) * 1.1, (rand() - 0.5) * 1.1 + 0.25, (rand() - 0.5) * 1.1));
    return {
      kind,
      pos,
      quat,
      scale,
      from,
      fromQuat: spin(),
      far,
      farQuat: spin(),
      normal,
      delay: late + rand() * 0.55,
      dur: 1.3 + rand() * 0.5,
      swirl: 1.5 + rand() * 1.3,
      phase: rand() * Math.PI * 2,
      lag: rand() * 0.32,
      color: new Color(color),
    };
  };

  const tile = (
    at: { pos: Vector3; quat: Quaternion; normal: Vector3 },
    w: number,
    h: number,
    color: string,
    late = 0,
  ) => {
    tiles.push(
      piece(
        "tile",
        at.pos,
        at.quat,
        new Vector3(w, h, ((w + h) / 2) * DEEP),
        at.normal,
        color,
        late,
      ),
    );
  };
  const navy = () => NAVY[Math.floor(rand() * rand() * NAVY.length)];

  // Le verre : une tuile au sommet, puis des rangs jusqu'au bas du col.
  const { rings, step } = glassRings();
  tile(
    {
      pos: new Vector3(0, 1, 0),
      quat: new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2),
      normal: new Vector3(0, 1, 0),
    },
    TILE - JOINT,
    TILE - JOINT,
    navy(),
  );
  rings.forEach((ring, k) => {
    const n = Math.max(5, Math.round((2 * Math.PI * ring.r) / TILE));
    const width = (2 * Math.PI * ring.r) / n - JOINT;
    for (let i = 0; i < n; i++) {
      const phi = ((i + (k % 2) * 0.5) / n) * Math.PI * 2;
      tile(onRing(ring.r, ring.y, ring.nr, ring.ny, phi), width, step - JOINT, navy());
    }
  });

  // La barre : un anneau qui flotte sous le col, comme sur le logo.
  {
    const n = Math.round((2 * Math.PI * BAR.r) / TILE);
    for (let i = 0; i < n; i++) {
      tile(
        onRing(BAR.r, BAR.y, 1, 0, (i / n) * Math.PI * 2),
        (2 * Math.PI * BAR.r) / n - JOINT,
        0.19,
        BRASS,
        0.15,
      );
    }
  }
  // Le culot : une demi-boule, en deux rangs et une tuile au fond.
  for (const deg of [17, 53]) {
    const a = (deg * Math.PI) / 180;
    const r = CAP.r * Math.cos(a);
    const n = Math.max(4, Math.round((2 * Math.PI * r) / TILE));
    for (let i = 0; i < n; i++) {
      tile(
        onRing(
          r,
          CAP.y - CAP.r * Math.sin(a),
          Math.cos(a),
          -Math.sin(a),
          ((i + 0.5) / n) * Math.PI * 2,
        ),
        (2 * Math.PI * r) / n - JOINT,
        0.18,
        BRASS,
        0.2,
      );
    }
  }
  tile(
    {
      pos: new Vector3(0, CAP.y - CAP.r, 0),
      quat: new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2),
      normal: new Vector3(0, -1, 0),
    },
    0.19,
    0.19,
    BRASS,
    0.2,
  );

  // Le « L » : des tronçons posés sur la face avant du globe, en relief.
  const lift = 1 + (TILE * DEEP) / 2 + 0.045;
  const letter = (x: number, y: number, dx: number, dy: number, length: number) => {
    const normal = new Vector3(x, y, Math.sqrt(Math.max(0.04, 1 - x * x - y * y))).normalize();
    const along = new Vector3(dx, dy, 0)
      .addScaledVector(normal, -(dx * normal.x + dy * normal.y))
      .normalize();
    const across = new Vector3().crossVectors(along, normal);
    const quat = new Quaternion().setFromRotationMatrix(
      new Matrix4().makeBasis(across, along, normal),
    );
    marks.push(
      piece(
        "letter",
        normal.clone().multiplyScalar(lift),
        quat,
        new Vector3(LETTER.width, length, 0.085),
        normal,
        GOLD,
        0.5,
      ),
    );
  };
  const seg = 0.152;
  const tall = LETTER.top - LETTER.bottom + LETTER.width;
  const rows = Math.round(tall / seg);
  for (let i = 0; i < rows; i++) {
    letter(
      LETTER.x,
      LETTER.top + LETTER.width / 2 - ((i + 0.5) / rows) * tall,
      0,
      1,
      tall / rows - 0.008,
    );
  }
  const wide = LETTER.right - LETTER.x;
  const cols = Math.round(wide / seg);
  for (let i = 0; i < cols; i++) {
    letter(
      LETTER.x + LETTER.width / 2 + ((i + 0.5) / cols) * wide,
      LETTER.bottom,
      1,
      0,
      wide / cols - 0.008,
    );
  }

  // Les cinq rayons : ils ne volent pas, ils sortent quand la lampe s'allume.
  RAYS.angles.forEach((deg, i) => {
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
      new Vector3(RAYS.width, RAYS.to - RAYS.from + RAYS.width, 0.17),
      out,
      GOLD,
    );
    ray.from = out.clone().multiplyScalar(RAYS.from - 0.05);
    ray.delay = ON + 0.15 + Math.abs(i - 2) * 0.07;
    ray.dur = 0.55;
    marks.push(ray);
  });
  return { tiles, marks };
}

/** Le cœur : la même silhouette, un peu plus petite. C'est lui qui éclaire. */
function coreGeometry() {
  const inset = 0.945;
  const pts: Vector2[] = [];
  const end = Math.acos(NECK[0][1]);
  for (let i = 0; i <= 30; i++) {
    const a = (i / 30) * end;
    pts.push(new Vector2(Math.max(0.0001, Math.sin(a) * inset), Math.cos(a) * inset));
  }
  for (let i = 1; i <= 14; i++) {
    const p = neck(i / 14);
    pts.push(new Vector2(p.r * inset - 0.015, p.y));
  }
  // Sous le verre, le profil passe par l'axe : pas de tige entre les corps.
  // La barre n'a pas de cœur (on voit l'intérieur de l'anneau), et celui
  // du culot commence plus bas que son bord, comme le fond d'une coupe.
  const axis = 0.0001;
  const hold = (r: number, y: number) => pts.push(new Vector2(r, y));
  const bowl = CAP.r - 0.05;
  const sunk = 0.42;
  hold(axis, -1.335);
  hold(axis, CAP.y - bowl * Math.sin(sunk));
  for (let i = 0; i <= 8; i++) {
    const a = sunk + (i / 8) * (Math.PI / 2 - sunk);
    hold(Math.max(0.0001, bowl * Math.cos(a)), CAP.y - bowl * Math.sin(a));
  }
  return new LatheGeometry(pts, 56);
}

export type BulbHandle = {
  /** Lance ou reprend l'animation. */
  play: () => void;
  pause: () => void;
  resize: () => void;
  /** La souris, de -1 à 1 sur chaque axe : l'ampoule tourne un peu vers elle. */
  pointer: (x: number, y: number) => void;
  /** Le curseur, en pixels de la fenêtre : les tuiles s'en écartent. `null` quand il s'en va. */
  hover: (at: { x: number; y: number } | null) => void;
  /** Un clic ou un toucher sur l'ampoule : toutes les tuiles sautent. */
  pop: () => void;
  /** Le défilement, de 0 (haut de page) à 1 : la coque éclate à mesure. */
  spread: (amount: number) => void;
  /** Montre l'ampoule à un instant donné, en secondes. Pour les réglages. */
  seek: (t: number, spread?: number) => void;
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
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1, 0.1, 80);
  await nextFrame();

  // Le reflet des tuiles : une pièce aux murs clairs, calculée ici.
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.03);
  scene.environment = env.texture;
  scene.environmentIntensity = 1.15;
  await nextFrame();

  scene.add(new HemisphereLight("#f2f4f8", "#0e1a2b", 0.55));
  const key = new DirectionalLight("#fff4e2", 2.3);
  key.position.set(-4.2, 6.5, 7.5);
  key.castShadow = true;
  key.shadow.mapSize.set(fine ? 2048 : 1024, fine ? 2048 : 1024);
  key.shadow.camera.left = -3.4;
  key.shadow.camera.right = 3.4;
  key.shadow.camera.top = 3.4;
  key.shadow.camera.bottom = -3.4;
  key.shadow.camera.near = 2;
  key.shadow.camera.far = 22;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.018;
  key.shadow.radius = 5;
  scene.add(key);
  const rim = new DirectionalLight("#dfe6f3", 0.8);
  rim.position.set(6, 2, -6);
  scene.add(rim);

  const { tiles, marks } = build();

  // Une tuile : un pavé aux arêtes rondes, laqué. Le vernis fait le reflet net.
  const box = new RoundedBoxGeometry(1, 1, 1, 4, 0.2);
  const tileMaterial = new MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: 0.34,
    metalness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.09,
  });
  const markMaterial = new MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: 0.3,
    metalness: 0.35,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    emissive: new Color("#c98f3a"),
    emissiveIntensity: 0,
  });
  const tileMesh = new InstancedMesh(box, tileMaterial, tiles.length);
  const markMesh = new InstancedMesh(box, markMaterial, marks.length);
  for (const mesh of [tileMesh, markMesh]) {
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }
  const tint = new Color();
  tiles.forEach((it, i) => tileMesh.setColorAt(i, it.color));
  marks.forEach((it, i) => markMesh.setColorAt(i, tint.copy(it.color).multiplyScalar(0.6)));

  // Le cœur : sombre tant que la lampe est éteinte, lumineux ensuite.
  const coreGeo = coreGeometry();
  const dark = new Color("#070d17");
  const glow = new Color("#ffcf87");
  const coreMaterial = new MeshStandardMaterial({
    color: "#070d17",
    roughness: 0.55,
    metalness: 0,
    emissive: glow.clone(),
    emissiveIntensity: 0,
  });
  const core = new Mesh(coreGeo, coreMaterial);
  core.receiveShadow = true;

  const group = new Group();
  group.add(core, tileMesh, markMesh);
  group.position.y = 0.28;
  scene.add(group);
  await nextFrame();

  const raycaster = new Raycaster();
  const cursor = new Vector2();
  const beam = new Ray();
  const inverse = new Matrix4();
  const gap = new Float32Array(tiles.length * 3);
  const d = new Vector3();
  const m = new Matrix4();
  const p = new Vector3();
  const q = new Quaternion();
  const s = new Vector3();

  let time = 0;
  let last = 0;
  let frame = 0;
  let playing = false;
  let dead = false;
  let lit = false;
  let hovering = false;
  let follow = 1;
  /** Le saut des tuiles au clic : il monte d'un coup et retombe. */
  let hop = 0;
  let hopSpeed = 0;
  let restless = 0;
  const aim = { x: 0, y: 0, spread: 0 };
  const now = { x: 0, y: 0, spread: 0 };

  const place = (mesh: InstancedMesh, list: Piece[], t: number, shell: boolean) => {
    let moved = 0;
    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      const k = clamp01((t - it.delay) / it.dur);
      if (it.kind === "ray") {
        // Le rayon pousse depuis l'ampoule.
        const g = k <= 0 ? 0 : outBack(k);
        p.copy(it.from).lerp(it.pos, Math.min(1, g));
        s.set(it.scale.x * Math.min(1, k * 3), it.scale.y * g, it.scale.z * Math.min(1, k * 3));
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
      s.copy(it.scale).multiplyScalar(smooth(clamp01(t / 0.45 - it.phase / 20)));

      if (shell && k >= 1) {
        // Le défilement : la coque éclate, tuile après tuile.
        const out = smooth(clamp01((now.spread - it.lag * 0.5) / (1 - it.lag * 0.5)));
        if (out > 0) {
          p.lerp(it.far, out * out * 0.25 + out * 0.75);
          q.slerp(it.farQuat, out);
        }
        // Le clic : un saut, droit devant soi.
        if (hop > 0.0005) p.addScaledVector(it.normal, hop * (0.22 + (it.phase % 1) * 0.2));
        // Le curseur passe : la tuile s'écarte de son rayon, puis revient.
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
            gx = d.x * force + it.normal.x * near * 0.1;
            gy = d.y * force + it.normal.y * near * 0.1;
            gz = d.z * force + it.normal.z * near * 0.1;
          }
        }
        const j = i * 3;
        gap[j] += (gx - gap[j]) * follow;
        gap[j + 1] += (gy - gap[j + 1]) * follow;
        gap[j + 2] += (gz - gap[j + 2]) * follow;
        p.x += gap[j];
        p.y += gap[j + 1];
        p.z += gap[j + 2];
        moved += Math.abs(gap[j]) + Math.abs(gap[j + 1]) + Math.abs(gap[j + 2]);
      }
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    return moved;
  };

  const draw = (t: number) => {
    restless = place(tileMesh, tiles, t, true);
    place(markMesh, marks, t, false);

    // L'allumage : le cœur s'éclaire, le « L » et les rayons avec lui.
    const power = flicker(clamp01((t - ON) / 0.85));
    coreMaterial.color.copy(dark).lerp(glow, power * 0.9);
    coreMaterial.emissiveIntensity = power * 1.5;
    markMaterial.emissiveIntensity = power * 0.42;
    for (let i = 0; i < marks.length; i++) {
      markMesh.setColorAt(i, tint.copy(marks[i].color).multiplyScalar(0.6 + power * 0.4));
    }
    if (markMesh.instanceColor) markMesh.instanceColor.needsUpdate = true;

    // Le cœur grossit à mesure que les tuiles arrivent : jamais de forme seule.
    core.scale.setScalar(Math.max(0.0001, smooth(clamp01((t - 0.9) / (ASSEMBLED - 0.9)))));

    const arrive = outCubic(clamp01(t / (ASSEMBLED + 0.2)));
    group.rotation.y = (1 - arrive) * -0.9 + now.x;
    group.rotation.x = (1 - arrive) * 0.16 + now.y;
    renderer.render(scene, camera);
  };

  const tick = (stamp: number) => {
    frame = 0;
    if (dead) return;
    const dt = Math.min(0.05, last ? (stamp - last) / 1000 : 0);
    last = stamp;
    if (time < END) time = Math.min(END, time + dt);
    if (!lit && time >= ON) {
      lit = true;
      onLit();
    }
    const ease = 1 - Math.exp(-dt * 5);
    now.x += (aim.x - now.x) * ease;
    now.y += (aim.y - now.y) * ease;
    now.spread += (aim.spread - now.spread) * (1 - Math.exp(-dt * 8));
    follow = 1 - Math.exp(-dt * 9);
    // Le saut : un ressort amorti.
    hopSpeed += (-hop * 120 - hopSpeed * 11) * dt;
    hop = Math.max(0, hop + hopSpeed * dt);
    if (hovering) {
      raycaster.setFromCamera(cursor, camera);
      inverse.copy(group.matrixWorld).invert();
      beam.copy(raycaster.ray).applyMatrix4(inverse);
    }
    draw(time);

    // Tant que quelque chose bouge encore, on redessine ; sinon on s'arrête.
    const busy =
      time < END ||
      hovering ||
      restless > 0.002 ||
      hop > 0.0005 ||
      Math.abs(hopSpeed) > 0.002 ||
      Math.abs(aim.x - now.x) + Math.abs(aim.y - now.y) > 0.0005 ||
      Math.abs(aim.spread - now.spread) > 0.0005;
    if (playing && busy) frame = requestAnimationFrame(tick);
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
    const tall = (4.25 / 0.95) * (fullH / Math.max(1, area.height));
    const wide = ((3.5 / 0.95) * (fullW / Math.max(1, area.width))) / camera.aspect;
    camera.position.set(0, 0, Math.max(tall, wide) / (2 * tan));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    if (!frame) draw(time);
  };

  const lost = (event: Event) => {
    event.preventDefault();
    dead = true;
    cancelAnimationFrame(frame);
    onLost();
  };
  canvas.addEventListener("webglcontextlost", lost);

  resize();
  // Les programmes se compilent à part, sans bloquer la page, avant la première image.
  await renderer.compileAsync(scene, camera);
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
      if (time < END) return;
      hopSpeed = 9;
      wake();
    },
    spread(amount) {
      aim.spread = time < END ? 0 : clamp01(amount);
      wake();
    },
    seek(t, spread) {
      time = t;
      if (spread !== undefined) now.spread = aim.spread = spread;
      draw(time);
    },
    dispose() {
      dead = true;
      cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost", lost);
      box.dispose();
      coreGeo.dispose();
      tileMaterial.dispose();
      markMaterial.dispose();
      coreMaterial.dispose();
      tileMesh.dispose();
      markMesh.dispose();
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
