"use client";

import { useEffect, useRef } from "react";

/**
 * Le compte à rebours en grains.
 *
 * Adapté de « countdown-vapor-digits » (21st.dev). Le principe est le
 * sien : chaque changement de chiffre est un changement d'état — le
 * chiffre sortant se sublime en grains emportés par un vent de bruit,
 * le chiffre entrant se condense depuis le même nuage, chaque grain
 * rejoignant sa place par un ressort. Un canvas 2D dessine par-dessus
 * un vrai `<time>`, qui reste la vérité pour un lecteur d'écran.
 *
 * Ce qui a changé, et pourquoi :
 *
 * - L'original comptait HH:MM:SS et plafonnait à 99 heures. Le prochain
 *   évènement est dans treize jours : il aurait affiché « 99:xx:xx »
 *   pendant neuf jours. Il compte maintenant JJ:HH:MM:SS — huit chiffres
 *   au lieu de six, et tout ce qui était câblé sur « 6 » lit désormais
 *   le nombre réel de cases.
 * - Les chiffres sont composés dans la fonte mono du site : une fonte à
 *   chasse fixe garantit des cases identiques, ce dont la rastérisation
 *   des glyphes dépend. C'est aussi le registre « donnée » du site.
 * - Les classes de thème étrangères (`text-foreground`, `text-ns-muted`)
 *   sont devenues nos jetons.
 *
 * Inchangé parce que juste : la boucle s'endort dès que tous les grains
 * sont posés, la couleur est lue sur l'élément réel (donc juste sur
 * fond marine comme sur ivoire), et sous `prefers-reduced-motion` le
 * canvas disparaît et le `<time>` s'affiche tel quel.
 */

// ---- bruit de valeur déterministe, deux octaves, sans dépendance --------
function hash2(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}
function vnoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function noise2(x: number, y: number) {
  return 0.65 * vnoise(x, y) + 0.35 * vnoise(x * 2.1 + 19.7, y * 2.1 + 7.3);
}

const FLOATS = 6; // grains : x, y, vx, vy, hx, hy · vapeur : x, y, vx, vy, âge, vie
const MAX_GRAINS = 2500;
const SAMPLE_STRIDE = 3;
const SPRING_K = 90;
const ZETA = 0.55;
const DRAG = 0.92;
const DT_MAX = 0.032;
const FIELD_SCALE = 0.008;
const CURL_EPS = 0.75;
const PAD_X = 40;
const PAD_TOP = 110;
const PAD_BOTTOM = 20;

/** Quatre groupes de deux chiffres : jours, heures, minutes, secondes. */
const GROUPS = 4;
const DIGITS = GROUPS * 2;
const DEFAULT_LABELS = ["DAYS", "HOURS", "MINUTES", "SECONDS"] as const;

type Slot = {
  g: Float32Array;
  v: Float32Array;
  gc: number;
  vc: number;
  active: boolean;
};

export function VaporCountdown({
  targetDate,
  labels = DEFAULT_LABELS,
  size = "clamp(2rem, 4.6vw, 3.6rem)",
  className = "",
}: {
  /** La cible : Date, chaîne ISO ou millisecondes. */
  targetDate: Date | string | number;
  /** Les libellés sous JJ / HH / MM / SS ; `null` les cache. */
  labels?: readonly [string, string, string, string] | null;
  /** La taille des chiffres, en CSS. */
  size?: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<HTMLTimeElement>(null);

  const targetKey =
    targetDate instanceof Date ? targetDate.getTime() : targetDate;

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const timeEl = timeRef.current;
    if (!root || !canvas || !timeEl) return;
    const digitEls = Array.from(
      root.querySelectorAll<HTMLSpanElement>("[data-vc-digit]"),
    );
    if (digitEls.length !== DIGITS) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const targetMs =
      typeof targetKey === "number" ? targetKey : new Date(targetKey).getTime();

    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let digits = "0".repeat(DIGITS);

    const remaining = () => Math.max(0, targetMs - Date.now());
    const toDigits = () => {
      const rem = Math.round(remaining() / 1000);
      const d = Math.min(99, Math.floor(rem / 86400));
      const h = Math.floor((rem % 86400) / 3600);
      const m = Math.floor((rem % 3600) / 60);
      const s = rem % 60;
      return [d, h, m, s].map((n) => String(n).padStart(2, "0")).join("");
    };
    const applyDateTime = () => {
      timeEl.setAttribute(
        "datetime",
        `P${digits.slice(0, 2)}DT${digits.slice(2, 4)}H${digits.slice(4, 6)}M${digits.slice(6)}S`,
      );
    };

    const ctx = canvas.getContext("2d");

    // La couleur est lue sur l'élément réel : juste sur marine comme sur ivoire.
    let grainColor = "#f8f4ec";
    const updateGrainColor = () => {
      grainColor = getComputedStyle(digitEls[0]).color || grainColor;
    };
    updateGrainColor();

    const slots: Slot[] = Array.from({ length: DIGITS }, () => ({
      g: new Float32Array(MAX_GRAINS * FLOATS),
      v: new Float32Array(MAX_GRAINS * FLOATS),
      gc: 0,
      vc: 0,
      active: false,
    }));
    let glyphs: Float32Array[] | null = null;
    let cells: { x: number; y: number }[] = [];
    let cw = 0;
    let ch = 0;
    let lastW = 0;
    let lastH = 0;
    let raf = 0;
    let last = 0;
    const dampC = 2 * ZETA * Math.sqrt(SPRING_K);

    const loop = (now: number) => {
      if (!ctx) return;
      const dt = Math.min(Math.max((now - last) / 1000, 0), DT_MAX);
      last = now;
      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = grainColor;
      let anyActive = false;

      for (let s = 0; s < DIGITS; s++) {
        const slot = slots[s];
        const g = slot.g;
        const v = slot.v;

        if (!slot.active) {
          // Endormi : les grains sont posés, un seul passage, pas de physique.
          ctx.globalAlpha = 0.5;
          for (let i = 0; i < slot.gc; i++) {
            const o = i * FLOATS;
            ctx.fillRect(g[o] - 1, g[o + 1] - 1, 2, 2);
          }
          continue;
        }
        anyActive = true;
        let settled = true;

        // Les grains entrants : ressort sous-amorti vers leur place.
        for (let i = 0; i < slot.gc; i++) {
          const o = i * FLOATS;
          let x = g[o];
          let y = g[o + 1];
          let vx = g[o + 2];
          let vy = g[o + 3];
          const hx = g[o + 4];
          const hy = g[o + 5];

          vx = (vx + (SPRING_K * (hx - x) - dampC * vx) * dt) * DRAG;
          vy = (vy + (SPRING_K * (hy - y) - dampC * vy) * dt) * DRAG;
          x += vx * dt;
          y += vy * dt;

          g[o] = x;
          g[o + 1] = y;
          g[o + 2] = vx;
          g[o + 3] = vy;

          if (
            Math.abs(x - hx) > 0.5 ||
            Math.abs(y - hy) > 0.5 ||
            Math.abs(vx) > 2 ||
            Math.abs(vy) > 2
          ) {
            settled = false;
          }

          const speed = Math.hypot(vx, vy);
          ctx.globalAlpha = 0.5 + 0.5 * Math.min(1, speed / 500);
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }

        // La vapeur : vent en rotationnel de bruit, poussé vers le haut.
        let j = 0;
        while (j < slot.vc) {
          const o = j * FLOATS;
          const age = v[o + 4] + dt * 1000;
          const life = v[o + 5];
          if (age >= life) {
            const lo = (slot.vc - 1) * FLOATS;
            for (let k = 0; k < FLOATS; k++) v[o + k] = v[lo + k];
            slot.vc--;
            continue;
          }
          v[o + 4] = age;
          let x = v[o];
          let y = v[o + 1];
          let vx = v[o + 2];
          let vy = v[o + 3];

          const nx = x * FIELD_SCALE;
          const ny = y * FIELD_SCALE;
          const dndx = noise2(nx + CURL_EPS, ny) - noise2(nx - CURL_EPS, ny);
          const dndy = noise2(nx, ny + CURL_EPS) - noise2(nx, ny - CURL_EPS);
          let wx = dndy;
          let wy = -dndx;
          const cl = Math.hypot(wx, wy) || 1;
          const sp = 40 + 50 * hash2(j * 1.31, s * 7.7);
          wx = (wx / cl) * sp * 0.6;
          wy = (wy / cl) * sp * 0.6 - sp * 0.8;
          const mix = Math.min(1, dt * 5);
          vx += (wx - vx) * mix;
          vy += (wy - vy) * mix;
          x += vx * dt;
          y += vy * dt;

          v[o] = x;
          v[o + 1] = y;
          v[o + 2] = vx;
          v[o + 3] = vy;

          const speed = Math.hypot(vx, vy);
          ctx.globalAlpha =
            (1 - age / life) * (0.5 + 0.5 * Math.min(1, speed / 500));
          ctx.fillRect(x - 1, y - 1, 2, 2);
          j++;
        }
        if (slot.vc > 0) settled = false;

        if (settled) {
          for (let i = 0; i < slot.gc; i++) {
            const o = i * FLOATS;
            g[o] = g[o + 4];
            g[o + 1] = g[o + 5];
            g[o + 2] = 0;
            g[o + 3] = 0;
          }
          slot.active = false;
        }
      }
      ctx.globalAlpha = 1;
      raf = anyActive ? requestAnimationFrame(loop) : 0;
    };

    const wake = () => {
      if (!raf && ctx) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    const transition = (s: number, d: number) => {
      if (!glyphs) return;
      const slot = slots[s];
      const g = slot.g;
      const v = slot.v;

      let vc = 0;
      for (let i = 0; i < slot.gc && vc < MAX_GRAINS; i++) {
        const o = i * FLOATS;
        const vo = vc * FLOATS;
        v[vo] = g[o];
        v[vo + 1] = g[o + 1];
        v[vo + 2] = g[o + 2] * 0.4;
        v[vo + 3] = g[o + 3] * 0.4 - 12;
        v[vo + 4] = 0;
        v[vo + 5] = 600 + Math.random() * 300;
        vc++;
      }
      slot.vc = vc;

      const homes = glyphs[d];
      const cell = cells[s];
      const n = homes.length / 2;
      slot.gc = n;
      for (let i = 0; i < n; i++) {
        const o = i * FLOATS;
        const hx = cell.x + homes[i * 2];
        const hy = cell.y + homes[i * 2 + 1];
        if (vc > 0) {
          const src = ((Math.random() * vc) | 0) * FLOATS;
          g[o] = v[src] + (Math.random() - 0.5) * 10;
          g[o + 1] = v[src + 1] + (Math.random() - 0.5) * 10;
          g[o + 2] = (Math.random() - 0.5) * 40;
          g[o + 3] = -20 - Math.random() * 40;
        } else {
          g[o] = hx;
          g[o + 1] = hy;
          g[o + 2] = 0;
          g[o + 3] = 0;
        }
        g[o + 4] = hx;
        g[o + 5] = hy;
      }
      slot.active = true;
    };

    const init = () => {
      if (!ctx) return;
      const rootRect = root.getBoundingClientRect();
      const w = Math.round(rootRect.width);
      const h = Math.round(rootRect.height);
      if (w < 2 || h < 2) return;
      lastW = w;
      lastH = h;
      cw = w + PAD_X * 2;
      ch = h + PAD_TOP + PAD_BOTTOM;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cells = digitEls.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left - rootRect.left + PAD_X,
          y: r.top - rootRect.top + PAD_TOP,
        };
      });

      // Les dix glyphes, rastérisés une fois : en mono, toutes les cases sont identiques.
      const cellRect = digitEls[0].getBoundingClientRect();
      const gw = Math.max(2, Math.ceil(cellRect.width));
      const gh = Math.max(2, Math.ceil(cellRect.height));
      const off = document.createElement("canvas");
      off.width = gw;
      off.height = gh;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      const cs = getComputedStyle(digitEls[0]);
      octx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillStyle = "#ffffff";
      glyphs = [];
      for (let d = 0; d < 10; d++) {
        octx.clearRect(0, 0, gw, gh);
        octx.fillText(String(d), gw / 2, gh / 2);
        const alpha = octx.getImageData(0, 0, gw, gh).data;
        const pts: number[] = [];
        for (let y = 1; y < gh; y += SAMPLE_STRIDE) {
          const row = y * gw;
          for (let x = 1; x < gw; x += SAMPLE_STRIDE) {
            if (alpha[(row + x) * 4 + 3] > 128) pts.push(x, y);
          }
        }
        const total = pts.length / 2;
        const keepEvery = Math.max(1, Math.ceil(total / MAX_GRAINS));
        const homes = new Float32Array(Math.ceil(total / keepEvery) * 2);
        let n = 0;
        for (let i = 0; i < total; i += keepEvery) {
          homes[n * 2] = pts[i * 2];
          homes[n * 2 + 1] = pts[i * 2 + 1];
          n++;
        }
        glyphs.push(homes.subarray(0, n * 2));
      }

      for (let s = 0; s < DIGITS; s++) {
        const slot = slots[s];
        const homes = glyphs[Number(digits.charAt(s))];
        const cell = cells[s];
        const n = homes.length / 2;
        slot.gc = n;
        slot.vc = 0;
        slot.active = false;
        for (let i = 0; i < n; i++) {
          const o = i * FLOATS;
          const hx = cell.x + homes[i * 2];
          const hy = cell.y + homes[i * 2 + 1];
          slot.g[o] = hx;
          slot.g[o + 1] = hy;
          slot.g[o + 2] = 0;
          slot.g[o + 3] = 0;
          slot.g[o + 4] = hx;
          slot.g[o + 5] = hy;
        }
      }
      wake();
    };

    const schedule = () => {
      timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 15);
    };
    const tick = () => {
      const next = toDigits();
      if (next !== digits) {
        for (let s = 0; s < DIGITS; s++) {
          if (next.charAt(s) !== digits.charAt(s)) {
            digitEls[s].textContent = next.charAt(s);
            if (!reduced) transition(s, Number(next.charAt(s)));
          }
        }
        digits = next;
        applyDateTime();
        if (!reduced) wake();
      }
      if (remaining() > 0) schedule();
    };

    digits = toDigits();
    for (let s = 0; s < DIGITS; s++) digitEls[s].textContent = digits.charAt(s);
    applyDateTime();
    if (remaining() > 0) schedule();

    if (reduced || !ctx) {
      return () => {
        disposed = true;
        if (timer) clearTimeout(timer);
      };
    }

    let ro: ResizeObserver | undefined;
    // On rastérise après l'arrivée des fontes : un raster de la fonte de repli serait faux.
    void document.fonts.ready.then(() => {
      if (disposed) return;
      init();
      ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const w = Math.round(entry.contentRect.width);
        const h = Math.round(entry.contentRect.height);
        if (w !== lastW || h !== lastH) init();
      });
      ro.observe(root);
    });

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      cancelAnimationFrame(raf);
      raf = 0;
      ro?.disconnect();
    };
  }, [targetKey]);

  return (
    <div
      ref={rootRef}
      className={`relative inline-grid select-none ${className}`}
      style={{
        gridTemplateColumns: `repeat(${GROUPS}, auto)`,
        columnGap: "0.55em",
        rowGap: "0.7rem",
        fontSize: size,
      }}
    >
      {/* L'élément réel : la vérité pour un lecteur d'écran, visible tel quel sans animation. */}
      <time ref={timeRef} aria-live="off" style={{ display: "contents" }}>
        {Array.from({ length: GROUPS }, (_, group) => (
          <span
            key={group}
            className="flex justify-center font-mono font-medium leading-none text-ink opacity-0 motion-reduce:opacity-100"
          >
            <span data-vc-digit>0</span>
            <span data-vc-digit>0</span>
          </span>
        ))}
      </time>
      {labels
        ? labels.map((label) => (
            <span key={label} className="eyebrow text-center">
              {label}
            </span>
          ))
        : null}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute motion-reduce:hidden"
        style={{
          left: -PAD_X,
          top: -PAD_TOP,
          width: `calc(100% + ${PAD_X * 2}px)`,
          height: `calc(100% + ${PAD_TOP + PAD_BOTTOM}px)`,
        }}
      />
    </div>
  );
}
