import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
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
  RepeatWrapping,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
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
 * C'est le logo rendu réel, et construit comme une vraie lampe à
 * incandescence : une enveloppe de verre mince, un pied de verre pincé
 * d'où sortent les deux fils d'amenée et les crochets de soutien, un
 * boudin de tungstène, et un culot E27 à filet roulé, avec son isolant de
 * verre noir et son plot de soudure. Trois choses s'y passent.
 *
 *   — Le filament CHAUFFE. À l'arrivée il passe du tungstène froid à la
 *     braise, en hésitant comme une vraie ampoule ; allumée (l'easter
 *     egg), il monte au blanc et les cinq rayons du logo sortent.
 *   — Le filament SE PLIE. Au défilement, le boudin tendu entre ses deux
 *     fils se déroule et dessine le L du logo, en s'épaississant. Les
 *     deux courbes ont le même nombre de points : on interpole, et on
 *     réécrit les sommets en place (voir LiveTube).
 *   — L'ampoule REGARDE. Elle tourne de quelques degrés vers le curseur.
 *
 * Ce qui la rend crédible tient moins aux polygones qu'à la lumière :
 *   — un studio de photographe cuit dans la carte d'environnement — une
 *     fenêtre, deux bandeaux en contre-jour qui dessinent le bord du
 *     verre d'un trait, un plafonnier, un rebond ;
 *   — un verre VRAIMENT transparent : le fond que l'on voit au travers
 *     est le marine de la page, pas un marine écrasé par la courbe de
 *     tons (voir `beforeToneMapping`) ;
 *   — une lueur qui épouse le filament au lieu d'un disque posé dessus.
 *
 * Ce fichier n'est chargé qu'en différé, sur grand écran à souris, hors
 * mouvement réduit.
 *
 * Coût : une trentaine de maillages, 75 000 triangles, aucun
 * post-traitement (la lueur est faite d'un tube additif et de deux
 * sprites, pas d'un bloom plein écran), un rendu par image tant que
 * l'ampoule est à l'écran, zéro sinon. Les sommets du filament ne sont
 * réécrits que pendant qu'il se plie. Mesuré sur un portable de 2020 :
 * 60 images par seconde à 3,3 millions de pixels, sans image en retard.
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
const EXPOSURE = 1.08;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
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

// ---- La courbe de tons, à l'envers ------------------------------------

/** La courbe ACES de three, recopiée : même matrices, même ajustement. */
function acesFilmic(r: number, g: number, b: number, exposure: number) {
  const k = exposure / 0.6;
  r *= k;
  g *= k;
  b *= k;
  const fit = (v: number) =>
    (v * (v + 0.0245786) - 0.000090537) / (v * (0.983729 * v + 0.432951) + 0.238081);
  const fr = fit(0.59719 * r + 0.35458 * g + 0.04823 * b);
  const fg = fit(0.076 * r + 0.90834 * g + 0.01566 * b);
  const fb = fit(0.0284 * r + 0.13383 * g + 0.83777 * b);
  return [
    clamp01(1.60475 * fr - 0.53108 * fg - 0.07367 * fb),
    clamp01(-0.10208 * fr + 1.10813 * fg - 0.00605 * fb),
    clamp01(-0.00327 * fr - 0.07276 * fg + 1.07602 * fb),
  ];
}

/**
 * La couleur qu'il faut DONNER pour obtenir `target` après la courbe de
 * tons.
 *
 * Le verre montre ce qu'il y a derrière lui, puis la courbe de tons passe
 * sur le tout. Or elle écrase les teintes sombres : le marine de la page,
 * vu à travers l'ampoule, sortait presque noir — un verre fumé. Le fond de
 * la scène est donc peint d'un marine « d'avant la courbe », qui redevient
 * exactement celui de la page une fois qu'elle est passée. Trouvé par
 * dichotomie, canal par canal.
 */
function beforeToneMapping(target: Color, exposure: number) {
  const want = [target.r, target.g, target.b];
  const c = [target.r, target.g, target.b];
  for (let round = 0; round < 8; round++) {
    for (let ch = 0; ch < 3; ch++) {
      let lo = 0;
      let hi = 2;
      for (let i = 0; i < 28; i++) {
        c[ch] = (lo + hi) / 2;
        if (acesFilmic(c[0], c[1], c[2], exposure)[ch] < want[ch]) lo = c[ch];
        else hi = c[ch];
      }
    }
  }
  return new Color().setRGB(c[0], c[1], c[2]);
}

// ---- Les textures, dessinées une fois ---------------------------------

/** Un disque de lumière, pour les sprites de lueur. */
function glowTexture() {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.16, "rgba(255,255,255,0.5)");
  grad.addColorStop(0.42, "rgba(255,255,255,0.14)");
  grad.addColorStop(0.72, "rgba(255,255,255,0.035)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/**
 * La toile d'une boîte à lumière : pleine au centre, fondue sur les
 * bords. Une source aux bords nets se reflète en rectangle découpé au
 * cutter ; une vraie toile de diffusion s'éteint doucement.
 */
function softboxTexture(featherU: number, featherV: number) {
  const size = 96;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size;
      const v = (y + 0.5) / size;
      const edge =
        smooth(0, featherU, Math.min(u, 1 - u)) * smooth(0, featherV, Math.min(v, 1 - v));
      const du = u - 0.5;
      const dv = v - 0.5;
      const hot = 1 - 0.25 * Math.min(1, (du * du + dv * dv) * 4);
      const k = (y * size + x) * 4;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = Math.round(255 * edge * hot);
      img.data[k + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return new CanvasTexture(c);
}

/**
 * Le satiné d'une tôle roulée : des rayures fines, toutes dans le sens
 * de la circonférence. Sert de carte de rugosité et de relief au culot.
 */
function satinTexture() {
  const w = 256;
  const h = 256;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgb(214,214,214)";
  g.fillRect(0, 0, w, h);
  // Un tirage figé : la même tôle à chaque visite.
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 1500; i++) {
    const y = Math.floor(rnd() * h);
    const x = rnd() * w;
    const len = 30 + rnd() * 190;
    const tone = rnd() < 0.5 ? 255 : 120;
    g.fillStyle = `rgba(${tone},${tone},${tone},${(0.05 + rnd() * 0.16).toFixed(3)})`;
    g.fillRect(x, y, len, 1);
    // La rayure fait le tour : ce qui dépasse à droite revient à gauche.
    if (x + len > w) g.fillRect(0, y, x + len - w, 1);
  }
  const tex = new CanvasTexture(c);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(2, 3);
  return tex;
}

// ---- Le filament : des courbes de même longueur -------------------------
const N = 480;
const CENTER_Y = 1.0;
/** Le rayon du fil de tungstène, et celui du trait du L. */
const WIRE = 0.0056;
const STROKE = 0.044;
/** Le nombre de tronçons de la lueur qui suit le filament. */
const AURA = 60;

/**
 * Le L du logo, à pas réguliers : une verticale, un quart de cercle,
 * une horizontale. `corner` est le rayon de l'angle.
 */
function ellPath(count: number, corner: number) {
  const X0 = -0.16;
  const X1 = 0.22;
  const Y0 = CENTER_Y + 0.3;
  const Y1 = CENTER_Y - 0.32;
  const down = Y0 - Y1 - corner;
  const arc = (Math.PI / 2) * corner;
  const across = X1 - X0 - corner;
  const total = down + arc + across;
  const path: Vector3[] = [];
  for (let i = 0; i <= count; i++) {
    const d = (i / count) * total;
    if (d <= down) {
      path.push(new Vector3(X0, Y0 - d, 0));
    } else if (d <= down + arc) {
      const t = (d - down) / corner; // l'angle parcouru sur le quart de cercle
      path.push(
        new Vector3(X0 + corner - corner * Math.cos(t), Y1 + corner - corner * Math.sin(t), 0),
      );
    } else {
      path.push(new Vector3(X0 + corner + (d - down - arc), Y1, 0));
    }
  }
  return path;
}

/**
 * Le L. Dans le logo son angle intérieur est vif : le rayon reste donc
 * petit, juste assez grand devant celui du trait pour que les anneaux du
 * tube ne se chevauchent pas à l'intérieur du coude.
 */
const ELL = ellPath(N, 0.06);
/**
 * Le tracé que suit la lueur une fois le L formé. Elle est bien plus
 * large que le trait : sur l'angle du L elle se replierait sur elle-même
 * et s'additionnerait en une tache. Elle prend donc le virage plus large.
 */
const AURA_ELL = ellPath(AURA, 0.135);

/** Le boudin : une hélice serrée, tendue entre ses deux fils, à peine affaissée. */
const COIL: Vector3[] = [];
/** L'axe du boudin, sans l'hélice : c'est lui que suit la lueur. */
const AXIS: Vector3[] = [];
for (let i = 0; i <= N; i++) {
  const s = i / N;
  const turns = 18;
  const a = s * Math.PI * 2 * turns;
  // L'hélice se resserre aux extrémités, là où elle rejoint les fils.
  const r = 0.033 * Math.pow(Math.sin(Math.PI * s), 0.35);
  const ax = lerp(-0.2, 0.2, s);
  const ay = CENTER_Y + 0.04 - 0.03 * Math.sin(Math.PI * s);
  AXIS.push(new Vector3(ax, ay, 0));
  COIL.push(new Vector3(ax, ay + Math.cos(a) * r, Math.sin(a) * r));
}

/**
 * Les bouts du L sont ronds, comme ceux du logo : sur la dernière longueur
 * égale au rayon du trait, le tube se referme en demi-sphère. Un facteur
 * de rayon par anneau, calculé une fois.
 */
const ROUND_ENDS = new Float32Array(N + 1);
{
  // Les points du L sont espacés régulièrement : la distance au bout le
  // plus proche se lit sur l'indice.
  let length = 0;
  for (let i = 1; i <= N; i++) length += ELL[i].distanceTo(ELL[i - 1]);
  const step = length / N;
  for (let i = 0; i <= N; i++) {
    const d = Math.min(i, N - i) * step;
    ROUND_ENDS[i] = d >= STROKE ? 1 : Math.sqrt(Math.max(0, 1 - Math.pow(1 - d / STROKE, 2)));
  }
}
/** À combien d'anneaux du bout un fil d'amenée entre dans le trait du L, pour ne pas dépasser. */
const INSET = 30;

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
  private readonly color: BufferAttribute | null;
  private readonly cos: Float32Array;
  private readonly sin: Float32Array;
  private readonly t = new Vector3();
  private readonly prev = new Vector3();
  private readonly n = new Vector3();
  private readonly b = new Vector3();
  private readonly axis = new Vector3();

  constructor(
    private readonly segments: number,
    private readonly radial: number,
    opts: { normals?: boolean; tint?: boolean } = {},
  ) {
    const count = (segments + 1) * radial;
    this.position = new BufferAttribute(new Float32Array(count * 3), 3);
    this.geometry.setAttribute("position", this.position);
    // Un matériau non éclairé n'a pas besoin de normales.
    this.normal = opts.normals ? new BufferAttribute(new Float32Array(count * 3), 3) : null;
    if (this.normal) this.geometry.setAttribute("normal", this.normal);
    this.color = opts.tint ? new BufferAttribute(new Float32Array(count * 3).fill(1), 3) : null;
    if (this.color) this.geometry.setAttribute("aTint", this.color);

    this.cos = new Float32Array(radial);
    this.sin = new Float32Array(radial);
    for (let j = 0; j < radial; j++) {
      this.cos[j] = Math.cos((j / radial) * Math.PI * 2);
      this.sin[j] = Math.sin((j / radial) * Math.PI * 2);
    }

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

  /**
   * `points` doit contenir segments + 1 points. `taper`, s'il est donné,
   * porte un facteur de rayon par anneau (les bouts arrondis du L) ;
   * `amount` dit à quel point l'appliquer, de 0 à 1.
   */
  update(points: Vector3[], radius: number, taper?: Float32Array, amount = 1) {
    const { segments, radial, t, prev, n, b, axis, cos, sin } = this;
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
      const r = taper ? radius * (1 + (taper[i] - 1) * amount) : radius;
      for (let j = 0; j < radial; j++) {
        const x = n.x * cos[j] + b.x * sin[j];
        const y = n.y * cos[j] + b.y * sin[j];
        const z = n.z * cos[j] + b.z * sin[j];
        const k = (i * radial + j) * 3;
        pos[k] = p.x + x * r;
        pos[k + 1] = p.y + y * r;
        pos[k + 2] = p.z + z * r;
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

  /**
   * Teinte chaque anneau, de 0 (le bout du fil, plus froid et plus rouge)
   * à 1 (le plein feu). Le matériau multiplie sa couleur par celle-ci.
   */
  shade(level: (s: number) => number) {
    if (!this.color) return;
    const col = this.color.array as Float32Array;
    const { segments, radial } = this;
    for (let i = 0; i <= segments; i++) {
      const w = clamp01(level(i / segments));
      const r = lerp(0.62, 1, w);
      const g = lerp(0.3, 1, w);
      const bl = lerp(0.16, 1, w);
      for (let j = 0; j < radial; j++) {
        const k = (i * radial + j) * 3;
        col[k] = r;
        col[k + 1] = g;
        col[k + 2] = bl;
      }
    }
    this.color.needsUpdate = true;
  }
}

/**
 * La jupe du culot : une tôle roulée, avec un vrai filet.
 *
 * Un profil tourné autour de l'axe donnerait des anneaux empilés ; un pas
 * de vis est une hélice, et c'est à ses reflets qui montent en biais
 * qu'on reconnaît un culot. Le rayon dépend donc de la hauteur ET de
 * l'angle. Les cotes sont celles d'un E27 ramenées à l'échelle de la
 * scène : un pas de 3,6 mm, un peu plus d'un millimètre de creux.
 */
function threadedShell() {
  const AROUND = 112;
  const ALONG = 150;
  const TOP = 0.036;
  const BOTTOM = -0.468;
  const PITCH = 0.078;
  const DEPTH = 0.0135;

  /** Le rayon moyen : une lèvre roulée contre le verre, un col lisse, le filet, puis la tôle rentre vers l'isolant. */
  const mean = (y: number) => {
    const lip = 0.276 - 0.0125 * smooth(0.02, TOP, y);
    const step = lerp(0.262, lip, smooth(-0.062, -0.04, y));
    const taper = step - 0.005 * smooth(-0.1, -0.4, y);
    return taper - 0.021 * Math.pow(smooth(-0.405, BOTTOM, y), 1.6);
  };
  /** Le filet s'installe sous le col et s'efface avant le fond. */
  const window = (y: number) => smooth(-0.048, -0.082, y) * (1 - smooth(-0.378, -0.412, y));

  const cols = AROUND + 1;
  const rows = ALONG + 1;
  const pos = new Float32Array(cols * rows * 3);
  const uv = new Float32Array(cols * rows * 2);
  for (let i = 0; i < rows; i++) {
    const y = lerp(TOP, BOTTOM, i / ALONG);
    for (let j = 0; j < cols; j++) {
      // La couture est à l'arrière, là où on ne la voit jamais.
      const theta = -Math.PI / 2 + (j / AROUND) * Math.PI * 2;
      const r = mean(y) + DEPTH * window(y) * Math.sin((y / PITCH) * Math.PI * 2 + theta);
      const k = i * cols + j;
      pos[k * 3] = r * Math.cos(theta);
      pos[k * 3 + 1] = y;
      pos[k * 3 + 2] = r * Math.sin(theta);
      uv[k * 2] = j / AROUND;
      uv[k * 2 + 1] = i / ALONG;
    }
  }
  const index: number[] = [];
  for (let i = 0; i < ALONG; i++) {
    for (let j = 0; j < AROUND; j++) {
      const a = i * cols + j;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      index.push(a, b, c, b, d, c);
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setAttribute("uv", new BufferAttribute(uv, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  // La première et la dernière colonne sont le même méridien : on leur
  // donne la même normale, sinon la couture se lirait comme une arête.
  const normal = geo.attributes.normal as BufferAttribute;
  const a = new Vector3();
  const b = new Vector3();
  for (let i = 0; i < rows; i++) {
    a.fromBufferAttribute(normal, i * cols);
    b.fromBufferAttribute(normal, i * cols + AROUND);
    a.add(b).normalize();
    normal.setXYZ(i * cols, a.x, a.y, a.z);
    normal.setXYZ(i * cols + AROUND, a.x, a.y, a.z);
  }
  return geo;
}

/** Un profil tourné, puis aplati d'avant en arrière selon la hauteur : le pincement du pied de verre. */
function pinchedLathe(profile: Vector2[], segments: number, depth: (y: number) => number) {
  // phiStart = π : la couture passe à l'arrière.
  const geo = new LatheGeometry(profile, segments, Math.PI);
  const position = geo.attributes.position as BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    position.setZ(i, position.getZ(i) * depth(position.getY(i)));
  }
  geo.computeVertexNormals();
  return geo;
}

const profileOf = (points: [number, number][]) => points.map(([r, y]) => new Vector2(r, y));

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
  renderer.toneMappingExposure = EXPOSURE;
  renderer.setClearColor(MARINE, 1);

  const scene = new Scene();

  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(x: T) => {
    disposables.push(x);
    return x;
  };

  // ---- Le studio --------------------------------------------------------
  // Ce que le verre et le laiton reflètent. Un verre clair ne se voit que
  // par ses reflets : il lui faut du NOIR autour et des sources nettes,
  // placées comme le ferait un photographe d'objets.
  //
  //   — la fenêtre : une grande toile chaude, haute, à droite. Elle pose
  //     le reflet rectangulaire qu'on attend sur une ampoule ;
  //   — deux bandeaux en contre-jour, DERRIÈRE l'ampoule de part et
  //     d'autre : sous cet angle rasant le verre réfléchit beaucoup, et
  //     ils tracent le contour d'un trait fin. C'est ce trait qui fait
  //     exister un verre transparent sur un fond sombre ;
  //   — un bandeau froid sur le côté gauche, plus doux ;
  //   — un plafonnier, pour l'arc sur le dôme ;
  //   — un rebond bas et une face très faible, pour que le laiton ait une
  //     couleur ailleurs que dans ses éclats.
  //
  // La scène ne sert qu'une fois, à cuire la carte d'environnement.
  const pmrem = track(new PMREMGenerator(renderer));
  const studio = new Scene();
  studio.background = new Color(0x04070b);
  const studioParts: { dispose(): void }[] = [];
  const softbox = (
    w: number,
    h: number,
    color: number,
    power: number,
    x: number,
    y: number,
    z: number,
    feather: [number, number] = [0.14, 0.14],
  ) => {
    const geo = new PlaneGeometry(w, h);
    const map = softboxTexture(feather[0], feather[1]);
    const mat = new MeshBasicMaterial({
      color: new Color(color).multiplyScalar(power),
      map,
      side: DoubleSide,
    });
    const m = new Mesh(geo, mat);
    m.position.set(x, y, z);
    m.lookAt(0, 0.6, 0);
    studio.add(m);
    studioParts.push(geo, mat, map);
  };
  softbox(4.2, 6.4, 0xfff1df, 9.5, 8.2, 4.6, 3.2); // la fenêtre
  softbox(1.15, 15, 0xfff3e2, 10.5, 4.6, 1.2, -8, [0.34, 0.22]); // contre-jour droit
  softbox(1.15, 15, 0xdce8ff, 8.5, -4.6, 1.2, -8, [0.34, 0.22]); // contre-jour gauche
  softbox(1.6, 9, 0xbfd2ff, 3.4, -8.5, 1.4, -2.2, [0.3, 0.2]); // le côté froid
  softbox(9, 0.6, 0xffffff, 6.5, 0, 9, -1.4, [0.2, 0.4]); // le plafonnier
  softbox(6, 2.6, 0xffd9a3, 1.5, 0, -6.5, 4.5); // le rebond
  softbox(9, 6, 0xf4efe6, 0.2, 0, 1.5, 10, [0.3, 0.3]); // la face
  const env = track(pmrem.fromScene(studio, 0, 0.1, 100, { size: 512 }).texture);
  for (const part of studioParts) part.dispose();
  scene.environment = env;
  scene.environmentIntensity = 1;

  const camera = new PerspectiveCamera(26, 1, 0.1, 40);
  camera.position.set(0, 0.66, 7.5);
  camera.lookAt(0, 0.66, 0);

  // Le fond : le marine de la page, tel qu'il doit être AVANT la courbe de
  // tons pour en ressortir intact — à l'écran comme à travers le verre.
  // Il n'est tendu que derrière l'ampoule : ailleurs, la couleur
  // d'effacement du canvas est déjà la bonne, et chaque pixel peint ici
  // l'est deux fois (une pour le verre, une pour l'écran).
  const behind = beforeToneMapping(new Color(MARINE), EXPOSURE);
  const backdrop = new Mesh(
    track(new PlaneGeometry(2.6, 3.8)),
    track(new MeshBasicMaterial({ color: behind })),
  );
  backdrop.position.set(0, 0.55, -1.3);
  scene.add(backdrop);

  const bulb = new Group();
  scene.add(bulb);

  // ---- Le verre --------------------------------------------------------
  // Une enveloppe mince, sans teinte : rugosité nulle, donc des reflets
  // nets. Elle est faite de deux peaux, pour une raison de coût.
  //
  // La face AVANT est transmissive : three rend d'abord tout ce qui est
  // opaque dans une image intermédiaire, que le verre montre ensuite, un
  // peu déviée. Il est seul à l'être — three ne montre pas un objet
  // transmissif à travers un autre, tout ce que l'ampoule contient est
  // donc opaque, y compris son pied « de verre » (voir plus bas).
  //
  // La paroi DU FOND, celle qu'on voit de l'intérieur, pourrait être la
  // même peau en double face : three la rendrait alors une fois de plus
  // dans l'image intermédiaire, avec le matériau le plus cher de la scène,
  // puis recalculerait toute cette image. À la place, c'est une peau
  // opaque qui triche comme le pied : elle émet la couleur du fond et ne
  // garde que ses reflets. Derrière elle il n'y a que ce fond : le
  // résultat est le même, pour un passage de moins.
  const profile = new SplineCurve(
    profileOf([
      [0.249, -0.035],
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
    ]),
  ).getPoints(88);
  const envelope = track(new LatheGeometry(profile, 96));

  /** La teinte du verre : presque rien, juste de quoi lui donner un corps. */
  const TINT = 0xf0f5fa;
  const backWall = track(
    new MeshPhysicalMaterial({
      color: 0x000000,
      emissive: behind.clone().multiply(new Color(TINT)).multiplyScalar(0.95),
      roughness: 0,
      metalness: 0,
      ior: 1.5,
      // Les reflets du fond nous arrivent à travers la face avant : un
      // peu plus faibles que ceux qu'elle porte elle-même.
      envMapIntensity: 0.85,
      side: BackSide,
    }),
  );
  bulb.add(new Mesh(envelope, backWall));

  const glassMat = track(
    new MeshPhysicalMaterial({
      color: TINT,
      roughness: 0,
      metalness: 0,
      transmission: 1,
      thickness: 0.02,
      ior: 1.5,
      envMapIntensity: 1.2,
      specularIntensity: 1,
    }),
  );
  // La source intérieure éclaire le pied, les fils et le haut du culot,
  // mais son éclat direct sur le verre poserait un second point lumineux
  // à côté du filament. On le retire de ces deux matériaux, et d'eux
  // seuls : le verre garde tous les reflets du studio.
  const noPointGlint = (shader: { fragmentShader: string }) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <lights_fragment_maps>",
      "reflectedLight.directSpecular = vec3( 0.0 );\n#include <lights_fragment_maps>",
    );
  };
  glassMat.onBeforeCompile = noPointGlint;
  backWall.onBeforeCompile = noPointGlint;
  bulb.add(new Mesh(envelope, glassMat));

  // ---- Le culot ---------------------------------------------------------
  const satin = track(satinTexture());
  const brass = track(
    new MeshPhysicalMaterial({
      color: 0xc9ae84,
      metalness: 1,
      roughness: 0.36,
      roughnessMap: satin,
      bumpMap: satin,
      bumpScale: 0.35,
      // Une tôle roulée étire ses reflets dans le sens de l'axe.
      anisotropy: 0.4,
      anisotropyRotation: Math.PI / 2,
    }),
  );
  bulb.add(new Mesh(track(threadedShell()), brass));

  // L'isolant : un verre noir, brillant.
  const vitrite = track(
    new MeshPhysicalMaterial({
      color: 0x07090c,
      metalness: 0,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }),
  );
  bulb.add(
    new Mesh(
      track(
        new LatheGeometry(
          new SplineCurve(
            profileOf([
              [0.238, -0.45],
              [0.232, -0.478],
              [0.205, -0.522],
              [0.155, -0.562],
              [0.105, -0.588],
              [0.078, -0.6],
            ]),
          ).getPoints(18),
          56,
        ),
      ),
      vitrite,
    ),
  );

  // Le plot : un œillet de laiton et sa goutte de soudure.
  const smoothBrass = track(
    new MeshStandardMaterial({ color: 0xc9ae84, metalness: 1, roughness: 0.3 }),
  );
  bulb.add(
    new Mesh(
      track(
        new LatheGeometry(
          profileOf([
            [0.072, -0.594],
            [0.092, -0.598],
            [0.094, -0.608],
            [0.082, -0.616],
            [0.06, -0.618],
          ]),
          40,
        ),
      ),
      smoothBrass,
    ),
  );
  const solder = track(
    new MeshStandardMaterial({ color: 0xb4b8be, metalness: 1, roughness: 0.44 }),
  );
  bulb.add(
    new Mesh(
      track(
        new LatheGeometry(
          new SplineCurve(
            profileOf([
              [0.066, -0.612],
              [0.063, -0.63],
              [0.05, -0.646],
              [0.028, -0.657],
              [0.0001, -0.66],
            ]),
          ).getPoints(14),
          32,
        ),
      ),
      solder,
    ),
  );
  // Le second contact : un point de soudure sur le col, comme sur toute
  // lampe à vis.
  const dot = new Mesh(track(new SphereGeometry(0.021, 20, 14)), solder);
  {
    const a = (62 * Math.PI) / 180;
    dot.position.set(Math.cos(a) * 0.2745, -0.006, Math.sin(a) * 0.2745);
    dot.scale.set(1, 0.82, 0.4);
    dot.rotation.y = Math.PI / 2 - a;
    bulb.add(dot);
  }

  // ---- Le pied de verre --------------------------------------------------
  // Dans une vraie lampe c'est du verre : une jupe soudée au col, un tube
  // qui monte, un pincement aplati où sont scellés les fils, puis une tige
  // et sa perle. Ici il est OPAQUE, et il triche : il émet exactement la
  // couleur du fond, un peu assombrie, si bien que son corps disparaît
  // comme celui d'un verre clair — il ne reste que ce qu'on voit d'un
  // barreau de verre sur fond sombre, ses reflets et son bord lumineux.
  const stemGlass = track(
    new MeshPhysicalMaterial({
      color: 0x11161c,
      emissive: behind.clone().multiplyScalar(0.86),
      metalness: 0,
      roughness: 0.05,
      ior: 1.75,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.35,
    }),
  );
  bulb.add(
    new Mesh(
      track(
        pinchedLathe(
          new SplineCurve(
            profileOf([
              [0.214, -0.03],
              [0.205, 0.04],
              [0.168, 0.11],
              [0.118, 0.19],
              [0.086, 0.27],
              [0.074, 0.34],
              [0.079, 0.41],
              [0.084, 0.47],
              [0.072, 0.51],
              [0.04, 0.53],
              [0.0001, 0.535],
            ]),
          ).getPoints(44),
          48,
          (y) => lerp(1, 0.36, smooth(0.3, 0.41, y)),
        ),
      ),
      stemGlass,
    ),
  );
  const rod = new Mesh(track(new CylinderGeometry(0.013, 0.018, 0.14, 16)), stemGlass);
  rod.position.y = 0.6;
  bulb.add(rod);
  const BEAD_Y = 0.672;
  const bead = new Mesh(track(new SphereGeometry(0.03, 20, 14)), stemGlass);
  bead.position.y = BEAD_Y;
  bead.scale.y = 0.86;
  bulb.add(bead);

  // ---- Les fils ---------------------------------------------------------
  // Deux fils d'amenée, du pincement jusqu'aux bouts du filament, et deux
  // crochets plus fins, de la perle jusqu'au boudin.
  const leadMat = track(
    new MeshStandardMaterial({ color: 0x9c968a, metalness: 1, roughness: 0.34 }),
  );
  const hookMat = track(
    new MeshStandardMaterial({ color: 0x77726b, metalness: 1, roughness: 0.42 }),
  );
  const LEAD = 18;
  const HOOK = 12;
  const liveTubes: LiveTube[] = [];
  const wire = (segments: number, radial: number, material: MeshStandardMaterial) => {
    const tube = new LiveTube(segments, radial, { normals: true });
    const mesh = new Mesh(tube.geometry, material);
    // Les sommets bougent : pas de boîte englobante à tenir à jour.
    mesh.frustumCulled = false;
    bulb.add(mesh);
    liveTubes.push(tube);
    return { tube, mesh, pts: Array.from({ length: segments + 1 }, () => new Vector3()) };
  };
  const leads = [wire(LEAD, 8, leadMat), wire(LEAD, 8, leadMat)];
  const hooks = [wire(HOOK, 6, hookMat), wire(HOOK, 6, hookMat)];

  // La soudure du filament sur chaque fil d'amenée.
  const crimpGeo = track(new SphereGeometry(0.0125, 12, 10));
  const crimps = [new Mesh(crimpGeo, leadMat), new Mesh(crimpGeo, leadMat)];
  for (const crimp of crimps) bulb.add(crimp);

  // ---- Le filament -----------------------------------------------------
  // Un tube qui luit n'est pas un aplat : il est plus chaud en son cœur que
  // sur ses bords. Deux couleurs, donc, mêlées selon que la surface fait
  // face à la caméra ou la fuit — c'est ce qui donne du volume au L.
  const filamentMat = track(
    new ShaderMaterial({
      uniforms: {
        uEdge: { value: new Color(0x2b2420) },
        uCore: { value: new Color(0x2b2420) },
        uDepth: { value: 0.5 },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aTint;
        varying vec3 vNormal;
        varying vec3 vView;
        varying vec3 vTint;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalMatrix * normal;
          vView = -mv.xyz;
          vTint = aTint;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uEdge;
        uniform vec3 uCore;
        uniform float uDepth;
        varying vec3 vNormal;
        varying vec3 vView;
        varying vec3 vTint;
        void main() {
          float facing = abs(dot(normalize(vNormal), normalize(vView)));
          float core = pow(facing, 1.7) * uDepth;
          gl_FragColor = vec4(mix(uEdge, uCore, core) * vTint, 1.0);
          #include <colorspace_fragment>
        }
      `,
      side: DoubleSide,
    }),
  );
  const filamentTube = new LiveTube(N, 12, { normals: true, tint: true });
  liveTubes.push(filamentTube);
  const filament = new Mesh(filamentTube.geometry, filamentMat);
  filament.frustumCulled = false;
  bulb.add(filament);

  // ---- La lueur ----------------------------------------------------------
  // Un tube plus gros que le filament, qui suit son tracé, additif, plein
  // au centre et éteint sur ses bords (il ne s'allume que là où sa surface
  // fait face à la caméra). C'est un halo qui a la FORME du filament — un
  // fuseau autour du boudin, puis un L — sans rendu supplémentaire.
  const AURA_STEP = N / AURA;
  const auraTube = new LiveTube(AURA, 14, { normals: true });
  liveTubes.push(auraTube);
  {
    // La lueur s'éteint vers les deux bouts, au lieu de s'arrêter net.
    const fade = new Float32Array((AURA + 1) * 14);
    for (let i = 0; i <= AURA; i++) {
      const s = i / AURA;
      fade.fill(smooth(0, 0.14, Math.min(s, 1 - s)), i * 14, (i + 1) * 14);
    }
    auraTube.geometry.setAttribute("aFade", new BufferAttribute(fade, 1));
  }
  const auraMat = track(
    new ShaderMaterial({
      uniforms: {
        uColor: { value: new Color(WARM) },
        uStrength: { value: 0 },
      },
      vertexShader: /* glsl */ `
        attribute float aFade;
        varying vec3 vNormal;
        varying vec3 vView;
        varying float vFade;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalMatrix * normal;
          vView = -mv.xyz;
          vFade = aFade;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uStrength;
        varying vec3 vNormal;
        varying vec3 vView;
        varying float vFade;
        void main() {
          float facing = max(dot(normalize(vNormal), normalize(vView)), 0.0);
          float glow = facing * facing * facing;
          gl_FragColor = vec4(uColor, glow * vFade * uStrength);
          #include <colorspace_fragment>
        }
      `,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    }),
  );
  const aura = new Mesh(auraTube.geometry, auraMat);
  aura.frustumCulled = false;
  aura.renderOrder = 2;
  bulb.add(aura);
  const auraPts = Array.from({ length: AURA + 1 }, () => new Vector3());

  const points = COIL.map((p) => p.clone());
  const hookTip = new Vector3();
  let builtAt = -1;

  /** Une courbe de Bézier à un point de contrôle, écrite dans `pts`. */
  const bezier = (
    pts: Vector3[],
    ax: number,
    ay: number,
    cx: number,
    cy: number,
    end: Vector3,
  ) => {
    const last = pts.length - 1;
    for (let i = 0; i <= last; i++) {
      const u = i / last;
      const v = 1 - u;
      pts[i].set(
        v * v * ax + 2 * v * u * cx + u * u * end.x,
        v * v * ay + 2 * v * u * cy + u * u * end.y,
        u * u * end.z,
      );
    }
  };

  function buildFilament(e: number) {
    if (Math.abs(e - builtAt) < 0.0015 && builtAt >= 0) return;
    builtAt = e;
    for (let i = 0; i <= N; i++) points[i].lerpVectors(COIL[i], ELL[i], e);
    filamentTube.update(points, lerp(WIRE, STROKE, e), ROUND_ENDS, e);
    // Un filament est plus froid à ses deux bouts, où la chaleur fuit
    // dans les fils. Le L, lui, est le logo : il brille d'un seul ton.
    filamentTube.shade((s) => lerp(Math.pow(Math.sin(Math.PI * s), 0.55), 1, e));

    for (let i = 0; i <= AURA; i++) {
      auraPts[i].lerpVectors(AXIS[Math.round(i * AURA_STEP)], AURA_ELL[i], e);
    }
    auraTube.update(auraPts, lerp(0.082, 0.112, e));

    // Les fils d'amenée suivent les deux bouts du filament. Autour du
    // boudin ils montent en V ; quand le L se forme, celui de gauche file
    // vers l'angle puis remonte DERRIÈRE la verticale, où on ne le voit
    // plus — la lettre reste nette, sans trait parasite à côté d'elle.
    // Autour du boudin, chaque fil rejoint le bout du filament. Quand le
    // trait s'épaissit il entre DANS le trait, un peu en retrait du bout
    // arrondi, pour que ni lui ni sa soudure n'en dépassent.
    const inset = Math.round(INSET * e);
    for (let k = 0; k < 2; k++) {
      const side = k === 0 ? -1 : 1;
      const end = points[k === 0 ? inset : N - inset];
      const ax = side * 0.046;
      const ay = 0.5;
      const coilX = lerp(ax, end.x, 0.55) + side * 0.03;
      const coilY = lerp(ay, end.y, 0.5);
      const ellX = k === 0 ? -0.19 : 0.17;
      const ellY = k === 0 ? 0.62 : 0.55;
      bezier(leads[k].pts, ax, ay, lerp(coilX, ellX, e), lerp(coilY, ellY, e), end);
      leads[k].tube.update(leads[k].pts, 0.0075);
      crimps[k].position.copy(end);
    }

    // Les crochets tiennent le boudin au tiers et aux deux tiers. Ils se
    // rétractent dans la perle dès que le filament commence à se plier :
    // le L n'a pas besoin de tuteurs.
    const reach = 1 - smooth(0.04, 0.42, e);
    for (let k = 0; k < 2; k++) {
      const at = Math.round((k === 0 ? 1 / 3 : 2 / 3) * N);
      hookTip.lerpVectors(AXIS[at], ELL[at], e);
      hookTip.x = lerp(0, hookTip.x, reach);
      hookTip.y = lerp(BEAD_Y, hookTip.y, reach);
      hookTip.z = 0;
      bezier(hooks[k].pts, 0, BEAD_Y, hookTip.x * 0.25, lerp(BEAD_Y, hookTip.y, 0.62), hookTip);
      hooks[k].tube.update(hooks[k].pts, 0.0042);
      hooks[k].mesh.visible = reach > 0.02;
    }
  }

  // ---- La lumière ------------------------------------------------------
  const inner = new PointLight(WARM, 0, 5, 2);
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
  core.renderOrder = 3;
  bulb.add(core);

  const haloMat = track(coreMat.clone());
  const halo = new Sprite(haloMat);
  halo.position.set(0, CENTER_Y, -0.2);
  halo.renderOrder = 1;
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

  // ---- Le régulateur -----------------------------------------------------
  // Sur une carte graphique modeste, le verre coûte cher en haute densité.
  // Si les images arrivent en retard de façon durable, on rend moins de
  // pixels : 1,5 par point, puis 1,25, puis 1. L'ampoule perd un peu de
  // piqué, le défilement reste fluide. On ne remonte jamais, pour ne pas
  // osciller, et on ne juge pas les premières secondes — le temps que les
  // programmes de la carte se compilent.
  let quality = renderer.getPixelRatio();
  let judgeFrom = performance.now() + 2500;
  let judged = 0;
  let late = 0;
  function govern(now: number, elapsed: number) {
    if (quality <= 1 || now < judgeFrom) return;
    judged++;
    if (elapsed > 21) late++;
    if (judged < 90) return;
    if (late >= 54) {
      quality = Math.max(1, quality - 0.25);
      renderer.setPixelRatio(quality);
      resize();
      judgeFrom = now + 1000;
    }
    judged = 0;
    late = 0;
  }

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
    // Les bords du tube à la température du filament, son cœur un cran
    // plus chaud.
    heatColor(h * 0.94, filamentMat.uniforms.uEdge.value as Color);
    heatColor(Math.min(1, h + 0.17), filamentMat.uniforms.uCore.value as Color);
    filamentMat.uniforms.uDepth.value = lerp(0.7, 1, e);
    inner.intensity = h * h * 5.5 + light * 5;
    inner.position.set(lerp(0, -0.03, e), lerp(CENTER_Y + 0.01, CENTER_Y - 0.08, e), 0.06);

    // La lueur qui épouse le filament : elle suit sa température.
    (auraMat.uniforms.uColor.value as Color).copy(heatColor(Math.min(1, h * 0.92 + 0.04), color));
    auraMat.uniforms.uStrength.value = h * h * lerp(0.8, 0.5, e) + light * 0.5;

    // Le point chaud : un fuseau couché sur le boudin, qui s'arrondit et
    // s'efface à mesure que le L se forme — c'est la lettre qui doit se
    // lire, pas un disque posé dessus.
    core.position.set(lerp(0, -0.03, e), lerp(CENTER_Y + 0.012, CENTER_Y - 0.08, e), 0.05);
    coreMat.opacity = h * lerp(0.95, 0.2, e) + light * 0.25;
    const size = (lerp(0.3, 0.74, h) + light * 0.5) * lerp(1, 2, e);
    core.scale.set(size * lerp(1.9, 1, e), size * lerp(0.62, 1, e), 1);
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
    govern(now, now - last);
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
      // Une reprise n'est pas un retard : on laisse la boucle se relancer.
      judgeFrom = last + 1500;
      judged = 0;
      late = 0;
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
      for (const tube of liveTubes) tube.geometry.dispose();
      for (const d of disposables) d.dispose();
      renderer.dispose();
    },
  };
}
