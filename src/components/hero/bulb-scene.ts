import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  CanvasTexture,
  BufferAttribute,
  BufferGeometry,
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PMREMGenerator,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  SRGBColorSpace,
  Scene,
  SphereGeometry,
  SplineCurve,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

/**
 * L'ampoule, en trois dimensions.
 *
 * C'est le logo rendu réel : une enveloppe de verre, un culot de laiton,
 * et un filament. Trois choses s'y passent.
 *
 *   — Le filament CHAUFFE. À l'arrivée il passe du tungstène froid à la
 *     braise, en hésitant comme une vraie ampoule ; allumée (l'easter
 *     egg), il monte au blanc et les cinq rayons du logo sortent.
 *   — Le filament SE PLIE. Au défilement, le boudin tendu entre ses deux
 *     supports se déroule et dessine le L du logo, en s'épaississant.
 *     Les deux courbes ont le même nombre de points : on interpole, et
 *     on réécrit les sommets en place (voir LiveTube).
 *   — L'ampoule REGARDE. Elle tourne de quelques degrés vers le curseur.
 *
 * Ce fichier n'est chargé qu'en différé, sur grand écran à souris, hors
 * mouvement réduit.
 *
 * Coût : une dizaine de maillages, pas de post-traitement (la lueur est
 * faite de deux sprites, pas d'un bloom plein écran), un rendu par image
 * tant que l'ampoule est à l'écran, zéro sinon.
 */

export type BulbHandle = {
  /** 0 → 1 : le filament passe du boudin au L. */
  setProgress(p: number): void;
  /** Le curseur, de -1 à 1 sur chaque axe. */
  setPointer(x: number, y: number): void;
  setLit(on: boolean): void;
  setHover(on: boolean): void;
  /** Rejoue l'allumage depuis le froid. */
  ignite(): void;
  /** Met la boucle en pause quand l'ampoule n'est pas à l'écran. */
  setRunning(on: boolean): void;
  resize(): void;
  /** Une image fixe de la scène sur fond marine, pour l'affiche mobile. */
  snapshot(): Promise<Blob | null>;
  dispose(): void;
};

const MARINE = 0x0e1a2b;
const WARM = 0xffc27a;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** La couleur du tungstène selon sa température : froid, rouge, orange, blanc chaud. */
const RAMP: [number, Color][] = [
  [0, new Color(0x2b2420)],
  [0.22, new Color(0x7c2a10)],
  [0.48, new Color(0xe2661b)],
  [0.74, new Color(0xffb65e)],
  [1, new Color(0xfff3da)],
];
function heatColor(h: number, out: Color) {
  for (let i = 1; i < RAMP.length; i++) {
    if (h <= RAMP[i][0]) {
      const [a, ca] = RAMP[i - 1];
      const [b, cb] = RAMP[i];
      return out.lerpColors(ca, cb, (h - a) / (b - a));
    }
  }
  return out.copy(RAMP[RAMP.length - 1][1]);
}

/** Un disque de lumière, pour les sprites de lueur. */
function glowTexture() {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.22, "rgba(255,255,255,0.42)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.1)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

// ---- Le filament : deux courbes de même longueur ----------------------
const N = 240;
const CENTER_Y = 1.0;

/** Le boudin : une hélice serrée, tendue entre deux supports, à peine affaissée. */
const COIL: Vector3[] = [];
/** Le L du logo : une verticale, un angle arrondi, une horizontale. */
const ELL: Vector3[] = [];
{
  // Le L, paramétré à la longueur : la verticale, un quart de cercle (le
  // logo a des angles ronds), l'horizontale.
  const R = 0.05;
  const X0 = -0.16;
  const X1 = 0.22;
  const Y0 = CENTER_Y + 0.3;
  const Y1 = CENTER_Y - 0.32;
  const down = Y0 - Y1 - R;
  const arc = (Math.PI / 2) * R;
  const across = X1 - X0 - R;
  const total = down + arc + across;

  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const turns = 12;
    const a = s * Math.PI * 2 * turns;
    // L'hélice se resserre aux extrémités, là où elle rejoint les supports.
    const r = 0.036 * Math.pow(Math.sin(Math.PI * s), 0.35);
    COIL.push(
      new Vector3(
        lerp(-0.2, 0.2, s),
        CENTER_Y + 0.04 + Math.cos(a) * r - 0.03 * Math.sin(Math.PI * s),
        Math.sin(a) * r,
      ),
    );

    const d = s * total;
    if (d <= down) {
      ELL.push(new Vector3(X0, Y0 - d, 0));
    } else if (d <= down + arc) {
      const t = (d - down) / R; // l'angle parcouru sur le quart de cercle
      ELL.push(new Vector3(X0 + R - R * Math.cos(t), Y1 + R - R * Math.sin(t), 0));
    } else {
      ELL.push(new Vector3(X0 + R + (d - down - arc), Y1, 0));
    }
  }
}

/**
 * Un tube dont on réécrit les sommets EN PLACE.
 *
 * Pendant que le filament se plie, sa forme change à chaque image.
 * Reconstruire une TubeGeometry à chaque fois, c'était une soixantaine de
 * kilo-octets alloués puis jetés soixante fois par seconde — de quoi
 * réveiller le ramasse-miettes en plein défilement. Ici les tampons sont
 * créés une fois ; on y réécrit les positions, et rien n'est alloué.
 *
 * Les anneaux sont orientés par transport parallèle : chaque repère est
 * le précédent, tourné du même angle que la tangente. Pas de torsion.
 */
class LiveTube {
  readonly geometry = new BufferGeometry();
  private readonly position: BufferAttribute;
  private readonly normal: BufferAttribute | null;
  private readonly t = new Vector3();
  private readonly prev = new Vector3();
  private readonly n = new Vector3();
  private readonly b = new Vector3();
  private readonly axis = new Vector3();

  constructor(
    private readonly segments: number,
    private readonly radial: number,
    lit: boolean,
  ) {
    const count = (segments + 1) * radial;
    this.position = new BufferAttribute(new Float32Array(count * 3), 3);
    this.geometry.setAttribute("position", this.position);
    // Un matériau non éclairé n'a pas besoin de normales.
    this.normal = lit ? new BufferAttribute(new Float32Array(count * 3), 3) : null;
    if (this.normal) this.geometry.setAttribute("normal", this.normal);

    const index: number[] = [];
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < radial; j++) {
        const a = i * radial + j;
        const b = i * radial + ((j + 1) % radial);
        const c = (i + 1) * radial + j;
        const d = (i + 1) * radial + ((j + 1) % radial);
        index.push(a, c, b, b, c, d);
      }
    }
    this.geometry.setIndex(index);
  }

  /** `points` doit contenir segments + 1 points. */
  update(points: Vector3[], radius: number) {
    const { segments, radial, t, prev, n, b, axis } = this;
    const pos = this.position.array as Float32Array;
    const nor = this.normal ? (this.normal.array as Float32Array) : null;

    for (let i = 0; i <= segments; i++) {
      t.subVectors(points[Math.min(i + 1, segments)], points[Math.max(i - 1, 0)]).normalize();
      if (i === 0) {
        // Un premier repère, perpendiculaire à la tangente.
        n.set(0, 0, 1);
        if (Math.abs(t.z) > 0.9) n.set(0, 1, 0);
        n.crossVectors(t, n).normalize();
      } else {
        axis.crossVectors(prev, t);
        const len = axis.length();
        if (len > 1e-6) {
          axis.multiplyScalar(1 / len);
          n.applyAxisAngle(axis, Math.acos(Math.min(1, Math.max(-1, prev.dot(t)))));
        }
      }
      b.crossVectors(t, n);
      prev.copy(t);

      const p = points[i];
      for (let j = 0; j < radial; j++) {
        const angle = (j / radial) * Math.PI * 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = n.x * cos + b.x * sin;
        const y = n.y * cos + b.y * sin;
        const z = n.z * cos + b.z * sin;
        const k = (i * radial + j) * 3;
        pos[k] = p.x + x * radius;
        pos[k + 1] = p.y + y * radius;
        pos[k + 2] = p.z + z * radius;
        if (nor) {
          nor[k] = x;
          nor[k + 1] = y;
          nor[k + 2] = z;
        }
      }
    }
    this.position.needsUpdate = true;
    if (this.normal) this.normal.needsUpdate = true;
  }
}

export function createBulb(
  canvas: HTMLCanvasElement,
  opts: { onHeat?: (heat: number) => void } = {},
): BulbHandle {
  // Canvas OPAQUE, peint du marine de la page. Le verre est transmissif :
  // il montre ce qu'il y a derrière lui, et sur un canvas transparent three
  // remplit ce « derrière » de blanc à moitié opaque — le verre en sortait
  // laiteux. Les bords du canvas sont fondus dans la page par un masque CSS.
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(MARINE, 1);

  const scene = new Scene();

  // ---- Le studio --------------------------------------------------------
  // Ce que le verre reflète. Une pièce blanche le rend laiteux : un verre
  // clair ne se voit que par ses reflets, il lui faut donc du NOIR autour et
  // quelques sources nettes — une grande boîte à lumière chaude, un
  // contre-jour froid, un bandeau au plafond, un rebond bas. La scène ne
  // sert qu'une fois, à cuire la carte d'environnement.
  const pmrem = new PMREMGenerator(renderer);
  const studio = new Scene();
  studio.background = new Color(0x03060a);
  const studioParts: { dispose(): void }[] = [];
  const softbox = (
    w: number,
    h: number,
    color: number,
    power: number,
    x: number,
    y: number,
    z: number,
  ) => {
    const geo = new PlaneGeometry(w, h);
    const mat = new MeshBasicMaterial({
      color: new Color(color).multiplyScalar(power),
      side: DoubleSide,
    });
    const m = new Mesh(geo, mat);
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    studio.add(m);
    studioParts.push(geo, mat);
  };
  softbox(3.2, 6, 0xfff2de, 11, 6, 2.5, 5); // la clé : chaude, haute, à droite
  softbox(2.2, 5, 0xb9cdfa, 4, -7, 1, 2.5); // le contre : froid, à gauche
  softbox(7, 1.1, 0xffffff, 7, 0, 8, -1.5); // le bandeau du plafond
  softbox(3, 2, 0xffd9a3, 2.2, -2.5, -4, 5); // le rebond, bas et chaud
  const env = pmrem.fromScene(studio, 0.045).texture;
  for (const part of studioParts) part.dispose();
  scene.environment = env;
  scene.environmentIntensity = 1;

  const camera = new PerspectiveCamera(26, 1, 0.1, 40);
  camera.position.set(0, 0.66, 7.5);
  camera.lookAt(0, 0.66, 0);

  const bulb = new Group();
  scene.add(bulb);

  const disposables: { dispose(): void }[] = [pmrem, env];
  const track = <T extends { dispose(): void }>(x: T) => {
    disposables.push(x);
    return x;
  };

  // ---- Le verre --------------------------------------------------------
  const profile = new SplineCurve(
    (
      [
        [0.255, 0],
        [0.262, 0.08],
        [0.3, 0.22],
        [0.42, 0.45],
        [0.55, 0.7],
        [0.625, 0.95],
        [0.64, 1.12],
        [0.6, 1.32],
        [0.5, 1.48],
        [0.34, 1.6],
        [0.17, 1.66],
        [0.0001, 1.68],
      ] as [number, number][]
    ).map(([r, y]) => new Vector2(r, y)),
  ).getPoints(56);

  const glassMat = track(
    new MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.02,
      metalness: 0,
      transmission: 1,
      thickness: 0.03,
      ior: 1.48,
      envMapIntensity: 1.15,
      specularIntensity: 1,
      side: DoubleSide,
      transparent: true,
    }),
  );
  const glass = new Mesh(track(new LatheGeometry(profile, 72)), glassMat);
  bulb.add(glass);

  // ---- Le culot : laiton fileté ----------------------------------------
  const thread: Vector2[] = [new Vector2(0.272, 0.02), new Vector2(0.276, -0.03)];
  for (let i = 0; i <= 70; i++) {
    const k = i / 70;
    thread.push(
      new Vector2(
        0.256 + 0.017 * Math.sin(k * Math.PI * 2 * 5.5) - 0.02 * k * k,
        -0.04 - k * 0.42,
      ),
    );
  }
  const brass = track(
    new MeshStandardMaterial({ color: 0xc9ae84, metalness: 1, roughness: 0.3 }),
  );
  bulb.add(new Mesh(track(new LatheGeometry(thread, 56)), brass));

  const insulator = track(
    new MeshStandardMaterial({ color: 0x10161f, metalness: 0.1, roughness: 0.45 }),
  );
  bulb.add(
    new Mesh(
      track(
        new LatheGeometry(
          [
            new Vector2(0.236, -0.46),
            new Vector2(0.2, -0.53),
            new Vector2(0.12, -0.585),
            new Vector2(0.0001, -0.59),
          ],
          40,
        ),
      ),
      insulator,
    ),
  );
  const tip = new Mesh(track(new CylinderGeometry(0.075, 0.06, 0.05, 28)), brass);
  tip.position.y = -0.61;
  bulb.add(tip);

  // ---- La tige de verre et ses deux supports ---------------------------
  const stemMat = track(
    new MeshStandardMaterial({ color: 0xc6d0dc, metalness: 0, roughness: 0.22 }),
  );
  const stem = new Mesh(track(new CylinderGeometry(0.042, 0.075, 0.52, 20)), stemMat);
  stem.position.y = 0.27;
  bulb.add(stem);
  const bead = new Mesh(track(new SphereGeometry(0.062, 20, 16)), stemMat);
  bead.position.y = 0.55;
  bulb.add(bead);

  const wireMat = track(
    new MeshStandardMaterial({
      color: 0x9a927f,
      metalness: 1,
      roughness: 0.38,
      side: DoubleSide,
    }),
  );
  const SUPPORT = 14;
  const supportTubes = [new LiveTube(SUPPORT, 6, true), new LiveTube(SUPPORT, 6, true)];
  const supportPts = [0, 1].map(() =>
    Array.from({ length: SUPPORT + 1 }, () => new Vector3()),
  );
  for (const tube of supportTubes) {
    const m = new Mesh(tube.geometry, wireMat);
    // Les sommets bougent : pas de boîte englobante à tenir à jour.
    m.frustumCulled = false;
    bulb.add(m);
  }

  // ---- Le filament -----------------------------------------------------
  const filamentMat = track(
    new MeshBasicMaterial({ color: 0x2b2420, toneMapped: false, side: DoubleSide }),
  );
  const filamentTube = new LiveTube(N, 10, false);
  const filament = new Mesh(filamentTube.geometry, filamentMat);
  filament.frustumCulled = false;
  bulb.add(filament);

  const points = COIL.map((p) => p.clone());
  let builtAt = -1;

  function buildFilament(e: number) {
    if (Math.abs(e - builtAt) < 0.0015 && builtAt >= 0) return;
    builtAt = e;
    for (let i = 0; i <= N; i++) points[i].lerpVectors(COIL[i], ELL[i], e);
    filamentTube.update(points, lerp(0.0105, 0.044, e));

    // Les supports suivent les deux bouts du filament : une courbe de
    // Bézier du sommet de la tige jusqu'à l'extrémité, légèrement bombée.
    for (let k = 0; k < 2; k++) {
      const side = k === 0 ? -1 : 1;
      const end = points[k === 0 ? 0 : N];
      const fx = side * 0.035;
      const fy = 0.57;
      const mx = lerp(fx, end.x, 0.55) + side * 0.03;
      const my = lerp(fy, end.y, 0.5);
      const pts = supportPts[k];
      for (let i = 0; i <= SUPPORT; i++) {
        const u = i / SUPPORT;
        const v = 1 - u;
        pts[i].set(
          v * v * fx + 2 * v * u * mx + u * u * end.x,
          v * v * fy + 2 * v * u * my + u * u * end.y,
          u * u * end.z,
        );
      }
      supportTubes[k].update(pts, 0.0065);
    }
  }

  // ---- La lumière ------------------------------------------------------
  const inner = new PointLight(WARM, 0, 5, 2);
  inner.position.set(0, CENTER_Y, 0.1);
  bulb.add(inner);

  const glowTex = track(glowTexture());
  const coreMat = track(
    new SpriteMaterial({
      map: glowTex,
      color: WARM,
      blending: AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      toneMapped: false,
      opacity: 0,
    }),
  );
  const core = new Sprite(coreMat);
  core.position.set(0, CENTER_Y, 0);
  bulb.add(core);

  const haloMat = track(coreMat.clone());
  const halo = new Sprite(haloMat);
  halo.position.set(0, CENTER_Y, -0.2);
  bulb.add(halo);

  // Les cinq rayons du logo : ils ne sortent que lumière allumée.
  const rayMat = track(
    new MeshBasicMaterial({ color: 0xe9cfa0, toneMapped: false, transparent: true, opacity: 0 }),
  );
  const rayGeo = track(new CapsuleGeometry(0.03, 0.2, 6, 12));
  const rays = [90, 132, 48, 160, 20].map((deg) => {
    const a = (deg * Math.PI) / 180;
    const m = new Mesh(rayGeo, rayMat);
    m.position.set(Math.cos(a) * 0.98, CENTER_Y + 0.06 + Math.sin(a) * 0.98, 0);
    m.rotation.z = a - Math.PI / 2;
    m.scale.setScalar(0.001);
    bulb.add(m);
    return m;
  });

  // ---- L'état ----------------------------------------------------------
  let progress = 0;
  let progressNow = 0;
  let px = 0;
  let py = 0;
  let pxNow = 0;
  let pyNow = 0;
  let lit = false;
  let litNow = 0;
  let hover = 0;
  let hoverNow = 0;
  let heat = 0;
  /** L'allumage : de 0 à 1 en ~1,5 s, avec deux ratés. */
  let igniteAt = performance.now();
  let lastHeat = -1;
  let running = false;
  let last = performance.now();
  const color = new Color();

  /** Pose la scène dans un état donné. La boucle et l'affiche passent toutes deux par ici. */
  function paint(
    h: number,
    e: number,
    light: number,
    t: number,
    lookX: number,
    lookY: number,
    hov: number,
  ) {
    filamentMat.color.copy(heatColor(h, color));
    inner.intensity = h * h * 5.5 + light * 5;
    // La lueur du cœur suit le filament, et s'efface à mesure que le L se
    // forme : c'est la lettre qui doit se lire, pas un point posé dessus.
    core.position.set(lerp(0, -0.03, e), lerp(CENTER_Y + 0.03, CENTER_Y - 0.08, e), 0.05);
    coreMat.opacity = h * lerp(0.85, 0.3, e) + light * 0.25;
    core.scale.setScalar((lerp(0.4, 1.25, h) + light * 0.5) * lerp(1, 1.5, e));
    haloMat.opacity = h * h * 0.2 + light * 0.4;
    halo.scale.setScalar(lerp(2.2, 3, h) + light * 1.1);

    rayMat.opacity = clamp01(light * 1.4);
    for (let i = 0; i < rays.length; i++) {
      const s = clamp01(light * 1.5 - i * 0.07);
      rays[i].scale.setScalar(Math.max(0.001, s * (1 + 0.04 * Math.sin(t * 3 + i))));
    }

    // Le mouvement : elle oscille un peu, et se tourne vers le curseur.
    // Une fois le L formé elle se tient presque de face, pour qu'il se lise.
    const sway = lerp(0.34, 0.07, e);
    bulb.rotation.y = Math.sin(t * 0.42) * sway + lookX * 0.36;
    bulb.rotation.x = -lookY * 0.14 + Math.sin(t * 0.31) * 0.02;
    bulb.rotation.z = Math.sin(t * 0.5) * 0.015 - lookX * 0.03;
    bulb.position.y = Math.sin(t * 0.8) * 0.025;
    bulb.scale.setScalar(1 + hov * 0.035 + light * 0.02);
  }

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    const k = 1 - Math.pow(0.001, dt); // lissage indépendant du nombre d'images

    progressNow += (progress - progressNow) * Math.min(1, k * 1.4);
    pxNow += (px - pxNow) * k * 0.6;
    pyNow += (py - pyNow) * k * 0.6;
    litNow += ((lit ? 1 : 0) - litNow) * k * 0.9;
    hoverNow += (hover - hoverNow) * k;

    const e = ease(clamp01(progressNow));
    buildFilament(e);

    // La chaleur : la braise de base, plus la lumière, moins l'hésitation du démarrage.
    const since = (now - igniteAt) / 1000;
    const warm = clamp01(since / 1.5);
    const stutter =
      since < 1.3
        ? (Math.sin(since * 34) > 0.25 ? 1 : 0.35) * (0.5 + 0.5 * warm)
        : 1;
    const base = 0.52 + 0.1 * e;
    const target = (base + (1 - base) * litNow) * warm * stutter;
    heat += (target - heat) * Math.min(1, k * 2.4);
    const flicker = 1 + Math.sin(t * 11.3) * 0.012 + Math.sin(t * 27.1) * 0.008;
    const h = clamp01(heat * flicker);

    paint(h, e, litNow, t, pxNow, pyNow, hoverNow);

    if (opts.onHeat && Math.abs(h - lastHeat) > 0.012) {
      lastHeat = h;
      opts.onHeat(h);
    }

    renderer.render(scene, camera);
  }

  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Sur une scène étroite l'ampoule déborderait : on recule la caméra.
    camera.position.z = camera.aspect < 0.7 ? 7.5 * (0.7 / camera.aspect) : 7.5;
    camera.updateProjectionMatrix();
  }
  resize();
  buildFilament(0);

  return {
    setProgress(p) {
      progress = clamp01(p);
    },
    setPointer(x, y) {
      px = x;
      py = y;
    },
    setLit(on) {
      lit = on;
    },
    setHover(on) {
      hover = on ? 1 : 0;
    },
    ignite() {
      igniteAt = performance.now();
      heat = 0;
    },
    setRunning(on) {
      if (on === running) return;
      running = on;
      last = performance.now();
      renderer.setAnimationLoop(on ? frame : null);
    },
    resize,
    snapshot() {
      // L'affiche : le L formé, la braise un peu poussée, de face. La boucle
      // repeint tout à l'image suivante : rien à restaurer.
      buildFilament(1);
      paint(0.7, 1, 0, 0, 0, 0, 0);
      renderer.render(scene, camera);
      return new Promise<Blob | null>((done) => {
        canvas.toBlob((blob) => {
          builtAt = -1;
          done(blob);
        }, "image/png");
      });
    },
    dispose() {
      renderer.setAnimationLoop(null);
      filamentTube.geometry.dispose();
      for (const tube of supportTubes) tube.geometry.dispose();
      for (const d of disposables) d.dispose();
      renderer.dispose();
    },
  };
}
