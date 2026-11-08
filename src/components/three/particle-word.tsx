/* eslint-disable react-hooks/immutability --
   Une boucle de rendu WebGL avance en mutant : on écrit dans les uniformes et
   dans les tableaux de particules soixante fois par seconde, et allouer à
   neuf à chaque image produirait exactement le ramage qu'on cherche à
   éviter. La règle protège d'un vrai piège React ; ici le modèle impératif
   est celui que react-three-fiber documente, et rien de ce qui est muté
   n'alimente un rendu React. */
"use client";
// Même raison que le champ : WebGL n'avance que par mutation. Le compilateur
// React mémoïserait des valeurs qui changent soixante fois par seconde.
"use no memo";

import { useCallback, useEffect, useRef } from "react";

/**
 * Un mot en particules.
 *
 * Adapté de « Particle Text » de lovesickfromthe6ix (21st.dev). Le
 * principe est le sien : le mot est peint dans un canvas hors écran,
 * les pixels opaques deviennent des particules, et chacune revient à sa
 * place par un ressort pendant que la souris les écarte.
 *
 * Ce qui a changé, et pourquoi :
 *
 * - L'original appelait `setPerformance` À CHAQUE IMAGE pour afficher
 *   un compteur d'images. Soixante rendus React par seconde : c'est
 *   exactement le genre de chose qui a fait ramer ce site. Supprimé.
 * - Il créait et détruisait un buffer GPU par image pour le quad de
 *   post-traitement. Le buffer est maintenant créé une fois.
 * - Les emplacements d'attributs et d'uniformes étaient relus à chaque
 *   image. Ils sont lus une fois, à l'initialisation.
 * - Le bloom échantillonnait 9×9 = 81 fois la texture par pixel. Ramené
 *   à 5×5, soit trois fois moins, pour un rendu qu'on ne distingue pas.
 * - Le fond était un bleu nuit opaque. Il est transparent : la section
 *   dessous tient la couleur.
 * - Le canvas prenait toute la fenêtre. Il prend son conteneur.
 * - Rien ne s'arrêtait hors écran, et `prefers-reduced-motion` n'était
 *   pas lu. Les deux sont là.
 */

type RGB = [number, number, number];

type Props = {
  text: string;
  /** Repos : la taille d'une particule. */
  particleSize?: number;
  /** Le rayon, en pixels, où la souris agit. */
  mouseForce?: number;
  mode?: "attract" | "repel";
  colors?: { base: RGB; warm: RGB; deep: RGB; glow: RGB; core: RGB };
  className?: string;
};

type Particle = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  burst: boolean;
};

const VERT = `
  precision mediump float;
  attribute vec2 a_position;
  attribute float a_size;
  attribute float a_opacity;
  uniform vec2 u_resolution;
  varying float v_opacity;
  varying vec2 v_position;
  void main() {
    vec2 p = (a_position / u_resolution) * 2.0 - 1.0;
    p.y *= -1.0;
    gl_Position = vec4(p, 0.0, 1.0);
    gl_PointSize = a_size;
    v_opacity = a_opacity;
    v_position = a_position;
  }
`;

const FRAG = `
  precision mediump float;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_base;
  uniform vec3 u_warm;
  uniform vec3 u_deep;
  uniform vec3 u_glow;
  uniform vec3 u_core;
  varying float v_opacity;
  varying vec2 v_position;

  void main() {
    vec2 coord = gl_PointCoord - 0.5;
    float dist = length(coord);
    if (dist > 0.5) discard;

    float inner = 1.0 - smoothstep(0.0, 0.2, dist);
    float outer = 1.0 - smoothstep(0.2, 0.5, dist);
    float glow = pow(inner, 3.0) + pow(outer, 1.5) * 0.6;

    float mDist = distance(v_position, u_mouse);
    float mGlow = 1.0 / (1.0 + mDist * 0.008);
    float mNear = smoothstep(320.0, 0.0, mDist);

    float wave = sin(u_time * 0.0007) * 0.5 + 0.5;
    float grad = (v_position.x / u_resolution.x + v_position.y / u_resolution.y) * 0.5;

    vec3 c = mix(u_base, u_warm, wave);
    c = mix(c, u_deep, grad * 0.28);
    c = mix(c, u_core, inner * 0.72);
    c = mix(c, u_glow, mGlow * mNear * 0.55);

    float bloom = glow * (1.0 + mGlow * 0.7);
    gl_FragColor = vec4(c, bloom * v_opacity * (0.9 + mNear * 0.35));
  }
`;

const POST_VERT = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_uv = (a_position + 1.0) * 0.5;
  }
`;

// Bloom en 5×5 plutôt qu'en 9×9 : 25 échantillons au lieu de 81.
const POST_FRAG = `
  precision mediump float;
  uniform sampler2D u_texture;
  uniform vec2 u_texel;
  varying vec2 v_uv;

  void main() {
    vec4 color = texture2D(u_texture, v_uv);

    vec4 bloom = vec4(0.0);
    float total = 0.0;
    for (int i = -2; i <= 2; i++) {
      for (int j = -2; j <= 2; j++) {
        vec2 off = vec2(float(i), float(j)) * u_texel * 3.5;
        float w = exp(-float(i * i + j * j) * 0.35);
        bloom += texture2D(u_texture, v_uv + off) * w;
        total += w;
      }
    }
    bloom /= total;

    vec4 bright = max(color - 0.35, 0.0) * 2.4;
    vec4 outColor = color + (bloom + bright) * 0.55;
    // L'alpha reste celui des particules : la section dessous se voit.
    gl_FragColor = vec4(outColor.rgb, clamp(outColor.a, 0.0, 1.0));
  }
`;

const CHARTER = {
  base: [0.788, 0.682, 0.518] as RGB, // #C9AE84
  warm: [0.89, 0.812, 0.682] as RGB, // #E3CFAE
  deep: [0.478, 0.361, 0.2] as RGB, // #7A5C33
  glow: [0.973, 0.957, 0.925] as RGB, // #F8F4EC
  core: [1.0, 0.99, 0.96] as RGB,
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("shader:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function link(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const p = gl.createProgram();
  if (!p) return null;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error("program:", gl.getProgramInfoLog(p));
    gl.deleteProgram(p);
    return null;
  }
  return p;
}

export function ParticleWord({
  text,
  particleSize = 1.4,
  mouseForce = 170,
  mode = "repel",
  colors = CHARTER,
  className = "",
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -9999, y: -9999 });
  const live = useRef(false);
  const reduced = useRef(false);

  // Tout l'état WebGL vit ici, créé une fois.
  const gpu = useRef<{
    gl: WebGLRenderingContext;
    prog: WebGLProgram;
    post: WebGLProgram;
    fbo: WebGLFramebuffer;
    tex: WebGLTexture;
    bufPos: WebGLBuffer;
    bufSize: WebGLBuffer;
    bufOpacity: WebGLBuffer;
    bufQuad: WebGLBuffer;
    loc: Record<string, WebGLUniformLocation | null>;
    attr: Record<string, number>;
    arrays: { pos: Float32Array; size: Float32Array; opacity: Float32Array };
  } | null>(null);

  /** Peint le mot hors écran et transforme ses pixels en particules. */
  const build = useCallback(() => {
    const el = host.current;
    const cv = canvas.current;
    if (!el || !cv) return;

    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w === 0 || h === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.floor(w * dpr);
    cv.height = Math.floor(h * dpr);

    const off = document.createElement("canvas");
    const ctx = off.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    off.width = cv.width;
    off.height = cv.height;

    // L'API canvas REFUSE `var(--font-body)` : elle rejette la déclaration
    // entière et retombe sur « 10px sans-serif ». Le mot était alors peint
    // minuscule, et il n'en sortait presque aucune particule. On lit donc la
    // famille résolue sur le document.
    const family =
      getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";

    // La taille suit la largeur : le mot doit remplir sans déborder.
    const size = Math.min(cv.height * 0.78, (cv.width / text.length) * 1.45);
    ctx.font = `600 ${size}px ${family}`;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cv.width / 2, cv.height / 2);

    const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
    const next: Particle[] = [];

    // Le pas suit la densité de l'écran : une particule tous les ~3 px CSS.
    const step = Math.max(2, Math.round(3 * dpr));
    for (let y = 0; y < cv.height; y += step) {
      for (let x = 0; x < cv.width; x += step) {
        if (data[(y * cv.width + x) * 4 + 3] <= 128) continue;
        next.push({
          x: x + (Math.random() - 0.5) * 260,
          y: y + (Math.random() - 0.5) * 260,
          homeX: x,
          homeY: y,
          vx: 0,
          vy: 0,
          size: particleSize + Math.random() * 1.6,
          opacity: 0.62 + Math.random() * 0.38,
          life: 1,
          burst: false,
        });
      }
    }

    particles.current = next;

    const g = gpu.current;
    if (g) {
      g.gl.viewport(0, 0, cv.width, cv.height);
      g.gl.bindTexture(g.gl.TEXTURE_2D, g.tex);
      g.gl.texImage2D(
        g.gl.TEXTURE_2D,
        0,
        g.gl.RGBA,
        cv.width,
        cv.height,
        0,
        g.gl.RGBA,
        g.gl.UNSIGNED_BYTE,
        null,
      );
      const n = next.length;
      g.arrays = {
        pos: new Float32Array(n * 2),
        size: new Float32Array(n),
        opacity: new Float32Array(n),
      };
    }
  }, [text, particleSize]);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const cv = canvas.current;
    if (!cv) return;

    const gl = cv.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) return; // Pas de WebGL : le repli HTML reste affiché.

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const pvs = compile(gl, gl.VERTEX_SHADER, POST_VERT);
    const pfs = compile(gl, gl.FRAGMENT_SHADER, POST_FRAG);
    if (!vs || !fs || !pvs || !pfs) return;

    const prog = link(gl, vs, fs);
    const post = link(gl, pvs, pfs);
    if (!prog || !post) return;

    const fbo = gl.createFramebuffer();
    const tex = gl.createTexture();
    if (!fbo || !tex) return;

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex,
      0,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Le quad plein écran, créé UNE fois. L'original le refaisait par image.
    const bufQuad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, bufQuad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gpu.current = {
      gl,
      prog,
      post,
      fbo,
      tex,
      bufPos: gl.createBuffer()!,
      bufSize: gl.createBuffer()!,
      bufOpacity: gl.createBuffer()!,
      bufQuad,
      // Lus une fois, pas à chaque image.
      loc: {
        resolution: gl.getUniformLocation(prog, "u_resolution"),
        mouse: gl.getUniformLocation(prog, "u_mouse"),
        time: gl.getUniformLocation(prog, "u_time"),
        base: gl.getUniformLocation(prog, "u_base"),
        warm: gl.getUniformLocation(prog, "u_warm"),
        deep: gl.getUniformLocation(prog, "u_deep"),
        glow: gl.getUniformLocation(prog, "u_glow"),
        core: gl.getUniformLocation(prog, "u_core"),
        postTexture: gl.getUniformLocation(post, "u_texture"),
        postTexel: gl.getUniformLocation(post, "u_texel"),
      },
      attr: {
        position: gl.getAttribLocation(prog, "a_position"),
        size: gl.getAttribLocation(prog, "a_size"),
        opacity: gl.getAttribLocation(prog, "a_opacity"),
        postPosition: gl.getAttribLocation(post, "a_position"),
      },
      arrays: {
        pos: new Float32Array(0),
        size: new Float32Array(0),
        opacity: new Float32Array(0),
      },
    };

    build();
    // Les polices arrivent après le premier rendu : sans cette seconde
    // passe, les particules dessinent la police de repli.
    if (document.fonts?.ready) void document.fonts.ready.then(build);

    const ro = new ResizeObserver(build);
    if (host.current) ro.observe(host.current);

    const io = new IntersectionObserver(
      ([entry]) => {
        live.current = entry.isIntersecting && !document.hidden;
      },
      { rootMargin: "100px" },
    );
    if (host.current) io.observe(host.current);

    const onVisibility = () => {
      if (document.hidden) live.current = false;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      const dpr = cv.width / r.width;
      mouse.current.x = (e.clientX - r.left) * dpr;
      mouse.current.y = (e.clientY - r.top) * dpr;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const onLeave = () => {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    };
    document.addEventListener("pointerleave", onLeave);

    const tick = (time: number) => {
      raf.current = requestAnimationFrame(tick);
      const g = gpu.current;
      if (!g || !live.current) return;

      const list = particles.current;
      const m = mouse.current;
      const force2 = mouseForce * mouseForce;
      const pull = mode === "attract" ? 1 : -1;
      const still = reduced.current;

      let write = 0;
      for (let i = 0; i < list.length; i++) {
        const p = list[i];

        if (p.burst) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.955;
          p.vy *= 0.955;
          p.life -= 0.022;
          p.opacity = Math.max(0, p.life);
          if (p.life <= 0) continue;
        } else if (still) {
          // Mouvement réduit : les particules se posent et n'en bougent plus.
          p.x = p.homeX;
          p.y = p.homeY;
        } else {
          const dx = m.x - p.x;
          const dy = m.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < force2) {
            const d = Math.sqrt(d2) || 0.001;
            const f = (mouseForce - d) / mouseForce;
            p.vx += (dx / d) * f * 3 * pull;
            p.vy += (dy / d) * f * 3 * pull;
          }
          p.vx += (p.homeX - p.x) * 0.045;
          p.vy += (p.homeY - p.y) * 0.045;
          p.vx *= 0.935;
          p.vy *= 0.935;
          p.x += p.vx;
          p.y += p.vy;
        }

        list[write++] = p;
      }
      list.length = write;

      if (write > g.arrays.size.length) {
        g.arrays = {
          pos: new Float32Array(write * 2),
          size: new Float32Array(write),
          opacity: new Float32Array(write),
        };
      }
      const { pos, size, opacity } = g.arrays;
      for (let i = 0; i < write; i++) {
        const p = list[i];
        pos[i * 2] = p.x;
        pos[i * 2 + 1] = p.y;
        size[i] = p.size * 5.5;
        opacity[i] = p.opacity;
      }

      const { gl } = g;
      const cw = cv.width;
      const ch = cv.height;

      // Passe 1 : les particules, dans le framebuffer.
      gl.bindFramebuffer(gl.FRAMEBUFFER, g.fbo);
      gl.viewport(0, 0, cw, ch);
      gl.clearColor(0, 0, 0, 0); // transparent : la section dessous reste visible
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(g.prog);

      gl.uniform2f(g.loc.resolution, cw, ch);
      gl.uniform2f(g.loc.mouse, m.x, m.y);
      gl.uniform1f(g.loc.time, time);
      gl.uniform3fv(g.loc.base, colors.base);
      gl.uniform3fv(g.loc.warm, colors.warm);
      gl.uniform3fv(g.loc.deep, colors.deep);
      gl.uniform3fv(g.loc.glow, colors.glow);
      gl.uniform3fv(g.loc.core, colors.core);

      const bind = (
        buf: WebGLBuffer,
        arr: Float32Array,
        loc: number,
        n: number,
      ) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          arr.subarray(0, write * n),
          gl.DYNAMIC_DRAW,
        );
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0);
      };
      bind(g.bufPos, pos, g.attr.position, 2);
      bind(g.bufSize, size, g.attr.size, 1);
      bind(g.bufOpacity, opacity, g.attr.opacity, 1);

      gl.drawArrays(gl.POINTS, 0, write);

      // Passe 2 : le bloom, sur le quad déjà en mémoire.
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, cw, ch);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(g.post);

      gl.bindBuffer(gl.ARRAY_BUFFER, g.bufQuad);
      gl.enableVertexAttribArray(g.attr.postPosition);
      gl.vertexAttribPointer(g.attr.postPosition, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, g.tex);
      gl.uniform1i(g.loc.postTexture, 0);
      gl.uniform2f(g.loc.postTexel, 1 / cw, 1 / ch);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf.current);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      const g = gpu.current;
      if (g) {
        g.gl.deleteBuffer(g.bufPos);
        g.gl.deleteBuffer(g.bufSize);
        g.gl.deleteBuffer(g.bufOpacity);
        g.gl.deleteBuffer(g.bufQuad);
        g.gl.deleteFramebuffer(g.fbo);
        g.gl.deleteTexture(g.tex);
        g.gl.deleteProgram(g.prog);
        g.gl.deleteProgram(g.post);
      }
      gpu.current = null;
    };
  }, [build, colors, mode, mouseForce]);

  /** Au clic, les particules proches sont soufflées puis reviennent. */
  const burst = useCallback((e: React.PointerEvent) => {
    if (reduced.current) return;
    const cv = canvas.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    const dpr = cv.width / r.width;
    const mx = (e.clientX - r.left) * dpr;
    const my = (e.clientY - r.top) * dpr;

    for (const p of particles.current) {
      if (p.burst) continue;
      const dx = p.x - mx;
      const dy = p.y - my;
      const d = Math.hypot(dx, dy);
      if (d < 150) {
        const f = (150 - d) / 150;
        p.vx += (dx / (d || 1)) * f * 58;
        p.vy += (dy / (d || 1)) * f * 58;
      }
    }
  }, []);

  return (
    <div ref={host} className={`absolute inset-0 ${className}`}>
      <canvas
        ref={canvas}
        aria-hidden
        className="h-full w-full"
        style={{ touchAction: "pan-y" }}
        onPointerDown={burst}
      />
    </div>
  );
}
