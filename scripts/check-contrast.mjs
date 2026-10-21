// Contrôle WCAG de la palette, lue dans src/app/globals.css.
// Texte courant 4.5:1, repères non textuels 3:1. Relancer après retouche.
import { readFileSync } from "node:fs";

const css = readFileSync("src/app/globals.css", "utf8");
const root = css.slice(css.indexOf(":root {"), css.indexOf("}", css.indexOf(":root {")));
const T = Object.fromEntries(
  [...root.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2].toLowerCase()])
);

const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = (h) => { const n = parseInt(h.slice(1), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const rows = [];
for (const bg of ["canvas", "surface", "sunken", "accent-tint"]) {
  for (const fg of ["ink", "body", "muted", "accent"]) rows.push([`${fg} sur ${bg}`, ratio(T[fg], T[bg]), 4.5]);
}
rows.push(["on-ink sur ink-surface", ratio(T["on-ink"], T["ink-surface"]), 4.5]);
rows.push(["on-ink-muted sur ink-surface", ratio(T["on-ink-muted"], T["ink-surface"]), 4.5]);
rows.push(["on-accent sur accent", ratio(T["on-accent"], T.accent), 4.5]);
rows.push(["on-accent sur accent-hover", ratio(T["on-accent"], T["accent-hover"]), 4.5]);
rows.push(["on-ink sur ink (bouton)", ratio(T["on-ink"], T.ink), 4.5]);
rows.push(["accent vs canvas (repere)", ratio(T.accent, T.canvas), 3]);

let fails = 0;
for (const [label, r, floor] of rows) {
  const ok = r >= floor;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2)}  min ${floor}  ${label}`);
}
console.log(fails === 0 ? "\nToutes les paires passent." : `\n${fails} paire(s) a corriger.`);
process.exit(fails === 0 ? 0 : 1);
