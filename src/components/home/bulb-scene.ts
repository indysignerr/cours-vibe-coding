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
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Quaternion,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * L'ampoule du haut de page : des pièces éparses qui volent et
 * s'assemblent, puis l'ampoule éclate et laisse voir ce qu'elle
 * contenait, un « L » allumé.
 *
 * Trois temps.
 *   1. L'assemblage. Des centaines de tuiles marine arrivent de partout
 *      en tournant et pavent la silhouette du logo : le globe, le col, la
 *      barre et le culot. Au centre, le « L » se monte en même temps,
 *      éteint, puis les tuiles l'enferment.
 *   2. L'éclat. L'ampoule se serre un instant, puis s'ouvre d'un coup :
 *      chaque tuile part vers l'extérieur, celles de devant s'écartent
 *      comme un iris, et le « L » s'allume au milieu.
 *   3. Le repos. Les tuiles flottent autour du « L ». Quand on fait
 *      défiler la page elles s'éloignent encore, et reviennent si on
 *      remonte ; la souris fait tourner l'ensemble de quelques degrés.
 *
 * La forme est celle du logo, mise en volume : toutes les cotes
 * ci-dessous sont relevées sur `brand-shapes.json`, le rayon du globe
 * ramené à 1.
 *
 * Le dessin coûte trois appels : les tuiles (une seule géométrie, une
 * matrice et une couleur par pièce), le « L », et le noyau sombre qui
 * bouche les joints tant que l'ampoule est fermée. Rien n'est
 * téléchargé : ni modèle, ni image, et le reflet des tuiles vient d'une
 * pièce calculée sur place.
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
/** Le milieu du « L » : il grandit autour de ce point. */
const HEART = { x: 0.045, y: -0.14 };
const BAR = { y: -1.639, r: 0.364 };
const CAP = { y: -1.956, r: 0.318 };

// ---- Les tuiles ----
const TILE = 0.185; // côté visé d'une tuile
const JOINT = 0.018;
const THICK = 0.08;

// ---- Le temps, en secondes ----
const ASSEMBLED = 2.45;
/** L'ampoule reste entière près d'une seconde, puis éclate. */
const BURST = 3.3;
const OPEN = BURST + 1.05;

const NAVY = ["#0e1a2b", "#101f33", "#0b1522", "#14263d", "#0e1a2b"];
const BASE = "#8a6a3e";
const GOLD = "#b58f52";
const WARM = "#ffd9a0";

type Piece = {
  /** La place dans l'ampoule fermée. */
  pos: Vector3;
  quat: Quaternion;
  scale: Vector3;
  /** D'où la pièce arrive. */
  from: Vector3;
  fromQuat: Quaternion;
  /** Où elle se tient une fois l'ampoule éclatée. */
  open: Vector3;
  openQuat: Quaternion;
  /** Vers où elle s'éloigne encore quand la page défile. */
  away: Vector3;
  normal: Vector3;
  delay: number;
  dur: number;
  swirl: number;
  phase: number;
  kick: number;
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
/** Part vite, dépasse un peu, revient : le geste d'un éclat. */
const outBack = (v: number) => 1 + 2.7 * Math.pow(v - 1, 3) + 1.7 * Math.pow(v - 1, 2);
/** Une ampoule qu'on allume : elle prend, hésite, puis tient. */
const flicker = (v: number) => {
  if (v <= 0) return 0;
  if (v < 0.14) return v / 0.14;
  if (v < 0.24) return 1 - ((v - 0.14) / 0.1) * 0.75;
  if (v < 0.4) return 0.25 + ((v - 0.24) / 0.16) * 0.75;
  return 1;
};

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
  const letter: Piece[] = [];

  const piece = (
    pos: Vector3,
    quat: Quaternion,
    scale: Vector3,
    normal: Vector3,
    color: string,
    late: number,
    open: Vector3,
    openQuat: Quaternion,
  ): Piece => {
    // D'où vient la pièce : quelque part dans un grand volume, jamais au centre.
    const from = new Vector3();
    do {
      from.set((rand() - 0.5) * 15, (rand() - 0.5) * 11 - 0.3, rand() * 10 - 5.5);
    } while (from.length() < 2.6);
    const axis = new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
    return {
      pos,
      quat,
      scale,
      from,
      fromQuat: new Quaternion().setFromAxisAngle(axis, rand() * Math.PI * 2),
      open,
      openQuat,
      away: open.clone().sub(pos).normalize(),
      normal,
      delay: late + rand() * 0.55,
      dur: 1.3 + rand() * 0.5,
      swirl: 1.5 + rand() * 1.3,
      phase: rand() * Math.PI * 2,
      kick: rand() * 0.14,
      color: new Color(color),
    };
  };

  /** Une tuile de la coque, et la place qu'elle prend quand l'ampoule éclate. */
  const tile = (
    at: { pos: Vector3; quat: Quaternion; normal: Vector3 },
    scale: Vector3,
    color: string,
    late = 0,
    drop = 0,
  ) => {
    const { pos, quat, normal } = at;
    // Elle part droit devant elle. Celles qui font face au visiteur
    // s'écartent en plus sur les côtés : c'est l'iris qui découvre le « L ».
    const front = Math.max(0, normal.z);
    const side = new Vector3(normal.x, normal.y, 0);
    if (side.lengthSq() < 0.0025) side.set(rand() - 0.5, rand() - 0.5, 0);
    side.normalize();
    const open = pos
      .clone()
      .addScaledVector(normal, 0.24 + rand() * 0.32)
      .addScaledVector(side, front * front * (1.08 + rand() * 0.42))
      .add(new Vector3((rand() - 0.5) * 0.12, (rand() - 0.5) * 0.12 - drop, front * 0.3));
    const tilt = new Quaternion().setFromAxisAngle(
      new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
      (rand() - 0.5) * 0.9,
    );
    tiles.push(piece(pos, quat, scale, normal, color, late, open, quat.clone().multiply(tilt)));
  };
  const navy = () =>
    NAVY[Math.min(NAVY.length - 1, Math.floor(rand() * rand() * NAVY.length * 1.25))];

  // Le verre : une tuile au sommet, puis des rangs jusqu'au bas du col.
  const { rings, step } = glassRings();
  tile(
    {
      pos: new Vector3(0, 1, 0),
      quat: new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2),
      normal: new Vector3(0, 1, 0),
    },
    new Vector3(TILE - JOINT, TILE - JOINT, THICK),
    navy(),
  );
  rings.forEach((ring, k) => {
    const n = Math.max(5, Math.round((2 * Math.PI * ring.r) / TILE));
    const width = (2 * Math.PI * ring.r) / n - JOINT;
    for (let i = 0; i < n; i++) {
      const phi = ((i + (k % 2) * 0.5) / n) * Math.PI * 2;
      tile(
        onRing(ring.r, ring.y, ring.nr, ring.ny, phi),
        new Vector3(width, step - JOINT, THICK),
        navy(),
      );
    }
  });

  // La barre : un anneau qui flotte sous le col, comme sur le logo.
  {
    const n = Math.round((2 * Math.PI * BAR.r) / TILE);
    for (let i = 0; i < n; i++) {
      tile(
        onRing(BAR.r, BAR.y, 1, 0, (i / n) * Math.PI * 2),
        new Vector3((2 * Math.PI * BAR.r) / n - JOINT, 0.2, THICK),
        BASE,
        0.15,
        0.16,
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
        new Vector3((2 * Math.PI * r) / n - JOINT, 0.19, THICK),
        BASE,
        0.2,
        0.3,
      );
    }
  }
  tile(
    {
      pos: new Vector3(0, CAP.y - CAP.r, 0),
      quat: new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2),
      normal: new Vector3(0, -1, 0),
    },
    new Vector3(0.2, 0.2, THICK),
    BASE,
    0.2,
    0.3,
  );

  // Le « L », au cœur de l'ampoule : des tronçons bout à bout, face au visiteur.
  const flat = new Quaternion();
  const facing = new Vector3(0, 0, 1);
  const chunk = (x: number, y: number, w: number, h: number) => {
    const pos = new Vector3(x, y, 0);
    letter.push(
      piece(pos, flat.clone(), new Vector3(w, h, 0.2), facing, GOLD, 0, pos.clone(), flat.clone()),
    );
  };
  const seg = 0.152;
  const tall = LETTER.top - LETTER.bottom + LETTER.width;
  const rows = Math.round(tall / seg);
  for (let i = 0; i < rows; i++) {
    chunk(
      LETTER.x,
      LETTER.top + LETTER.width / 2 - ((i + 0.5) / rows) * tall,
      LETTER.width,
      tall / rows + 0.004,
    );
  }
  const wide = LETTER.right - LETTER.x;
  const cols = Math.round(wide / seg);
  for (let i = 0; i < cols; i++) {
    chunk(
      LETTER.x + LETTER.width / 2 + ((i + 0.5) / cols) * wide,
      LETTER.bottom,
      wide / cols + 0.004,
      LETTER.width,
    );
  }
  return { tiles, letter };
}

/** Le noyau : la même silhouette, un peu plus petite, qui bouche les joints. */
function coreGeometry() {
  const inset = 0.93;
  const pts: Vector2[] = [];
  const end = Math.acos(NECK[0][1]);
  for (let i = 0; i <= 26; i++) {
    const a = (i / 26) * end;
    pts.push(new Vector2(Math.max(0.0001, Math.sin(a) * inset), Math.cos(a) * inset));
  }
  for (let i = 1; i <= 12; i++) {
    const p = neck(i / 12);
    pts.push(new Vector2(p.r * inset - 0.02, p.y));
  }
  // Sous le verre, le profil passe par l'axe : pas de tige entre les corps.
  // La barre n'a pas de noyau (on voit l'intérieur de l'anneau), et celui
  // du culot commence plus bas que son bord, comme le fond d'une coupe.
  const axis = 0.0001;
  const hold = (r: number, y: number) => pts.push(new Vector2(r, y));
  const bowl = CAP.r - 0.045;
  const sunk = 0.42;
  hold(axis, -1.33);
  hold(axis, CAP.y - bowl * Math.sin(sunk));
  for (let i = 0; i <= 8; i++) {
    const a = sunk + (i / 8) * (Math.PI / 2 - sunk);
    hold(Math.max(0.0001, bowl * Math.cos(a)), CAP.y - bowl * Math.sin(a));
  }
  return new LatheGeometry(pts, 40);
}

export type BulbHandle = {
  /** Lance ou reprend l'animation. */
  play: () => void;
  pause: () => void;
  resize: () => void;
  /** La souris, de -1 à 1 sur chaque axe. */
  pointer: (x: number, y: number) => void;
  /** Le défilement, de 0 (haut de page) à 1 : les tuiles s'éloignent. */
  spread: (amount: number) => void;
  /** Montre l'ampoule à un instant donné, en secondes. Pour les réglages. */
  seek: (t: number) => void;
  dispose: () => void;
};

export function createBulb(
  canvas: HTMLCanvasElement,
  stage: HTMLElement,
  { fine, onLost, onBurst }: { fine: boolean; onLost: () => void; onBurst: () => void },
): BulbHandle {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.9;

  const camera = new PerspectiveCamera(28, 1, 0.1, 80);
  scene.add(new HemisphereLight("#eef1f6", "#0e1a2b", 0.7));
  const key = new DirectionalLight("#fff6e8", 1.7);
  key.position.set(-4.5, 6, 7);
  scene.add(key);
  const rim = new DirectionalLight("#e6ebf5", 0.7);
  rim.position.set(6, 2, -6);
  scene.add(rim);

  const { tiles, letter } = build();

  const box = new RoundedBoxGeometry(1, 1, 1, 2, 0.16);
  const tileMaterial = new MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.28,
    metalness: 0.32,
  });
  const letterMaterial = new MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.4,
    metalness: 0.05,
    emissive: new Color("#c98f3a"),
    emissiveIntensity: 0,
  });
  const tileMesh = new InstancedMesh(box, tileMaterial, tiles.length);
  const letterMesh = new InstancedMesh(box, letterMaterial, letter.length);
  tileMesh.instanceMatrix.setUsage(DynamicDrawUsage);
  letterMesh.instanceMatrix.setUsage(DynamicDrawUsage);
  tileMesh.frustumCulled = false;
  letterMesh.frustumCulled = false;
  const tint = new Color();
  tiles.forEach((it, i) => tileMesh.setColorAt(i, it.color));
  letter.forEach((it, i) => letterMesh.setColorAt(i, tint.copy(it.color).multiplyScalar(0.55)));

  const coreGeo = coreGeometry();
  const coreMaterial = new MeshBasicMaterial({ color: "#070d17" });
  const core = new Mesh(coreGeo, coreMaterial);

  // La lumière du « L » : elle éclaire de l'intérieur les tuiles qui l'entourent.
  const lamp = new PointLight(WARM, 0, 5.5, 1.5);
  lamp.position.set(0.02, -0.14, -0.22);

  const group = new Group();
  group.add(core, tileMesh, letterMesh, lamp);
  group.position.y = 0.52;
  scene.add(group);

  const m = new Matrix4();
  const p = new Vector3();
  const q = new Quaternion();
  const s = new Vector3();

  let time = 0;
  let last = 0;
  let frame = 0;
  let playing = false;
  let dead = false;
  let burst = false;
  const aim = { x: 0, y: 0, spread: 0 };
  const now = { x: 0, y: 0, spread: 0 };

  /** Où est une pièce à l'instant t : en vol, en place, ou éclatée. */
  const place = (mesh: InstancedMesh, list: Piece[], t: number, shell: boolean) => {
    // Juste avant d'éclater, l'ampoule se serre.
    const squeeze = 1 - 0.04 * smooth(clamp01((t - BURST + 0.4) / 0.4));
    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      const k = clamp01((t - it.delay) / it.dur);
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

      if (shell && t > ASSEMBLED) {
        p.multiplyScalar(squeeze);
        const b = clamp01((t - BURST - it.kick) / 0.95);
        if (b > 0) {
          const out = outBack(b);
          p.lerp(it.open, out);
          q.slerp(it.openQuat, Math.min(1, out));
          // Au repos elle flotte un peu ; au défilement elle s'éloigne.
          const settled = smooth(b);
          p.addScaledVector(it.normal, Math.sin(t * 0.85 + it.phase) * 0.04 * settled);
          p.addScaledVector(it.away, now.spread * (2.4 + it.kick * 9));
        }
      } else if (!shell && t > BURST) {
        // Le « L » grandit en s'allumant : c'est lui qu'on est venu voir.
        const grow = 1 + 0.36 * outBack(clamp01((t - BURST) / 0.8));
        p.set(HEART.x + (p.x - HEART.x) * grow, HEART.y + (p.y - HEART.y) * grow, p.z);
        s.multiplyScalar(grow);
      }
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  const draw = (t: number) => {
    place(tileMesh, tiles, t, true);
    place(letterMesh, letter, t, false);

    // Le « L » s'allume à l'instant où l'ampoule s'ouvre.
    const lit = flicker(clamp01((t - BURST) / 0.8));
    letterMaterial.emissiveIntensity = lit * 0.85;
    lamp.intensity = lit * 8;
    for (let i = 0; i < letter.length; i++) {
      letterMesh.setColorAt(i, tint.copy(letter[i].color).multiplyScalar(0.55 + lit * 0.45));
    }
    if (letterMesh.instanceColor) letterMesh.instanceColor.needsUpdate = true;

    // Le noyau grossit à mesure que les tuiles arrivent, et s'efface quand elles partent.
    const grown = smooth(clamp01((t - 0.9) / (ASSEMBLED - 0.9)));
    const gone = clamp01((t - BURST) / 0.12);
    core.visible = gone < 1;
    core.scale.setScalar(Math.max(0.0001, grown * (1 - gone)));

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
    time += dt;
    if (!burst && time >= BURST) {
      burst = true;
      onBurst();
    }
    const ease = 1 - Math.exp(-dt * 5);
    now.x += (aim.x - now.x) * ease;
    now.y += (aim.y - now.y) * ease;
    now.spread += (aim.spread - now.spread) * (1 - Math.exp(-dt * 7));
    draw(time);
    if (playing) frame = requestAnimationFrame(tick);
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
    const tall = (5.2 / 0.96) * (fullH / Math.max(1, area.height));
    const wide = ((4 / 0.96) * (fullW / Math.max(1, area.width))) / camera.aspect;
    camera.position.set(0, 0, Math.max(tall, wide) / (2 * tan));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    if (!playing) draw(time);
  };

  const lost = (event: Event) => {
    event.preventDefault();
    dead = true;
    cancelAnimationFrame(frame);
    onLost();
  };
  canvas.addEventListener("webglcontextlost", lost);

  resize();
  // Une première image, pour compiler les programmes avant que les pièces ne bougent.
  draw(0);

  return {
    play() {
      if (playing || dead) return;
      playing = true;
      last = 0;
      frame = requestAnimationFrame(tick);
    },
    pause() {
      playing = false;
      cancelAnimationFrame(frame);
      frame = 0;
    },
    resize,
    pointer(x, y) {
      if (time < OPEN) return;
      aim.x = x * 0.3;
      aim.y = y * 0.14;
    },
    spread(amount) {
      aim.spread = time < OPEN ? 0 : clamp01(amount);
    },
    seek(t) {
      time = t;
      draw(time);
    },
    dispose() {
      dead = true;
      cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost", lost);
      box.dispose();
      coreGeo.dispose();
      tileMaterial.dispose();
      letterMaterial.dispose();
      coreMaterial.dispose();
      tileMesh.dispose();
      letterMesh.dispose();
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
