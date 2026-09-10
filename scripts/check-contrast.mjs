// Contrôle WCAG de la palette, lu directement dans src/app/globals.css,
// pour les DEUX thèmes. À relancer après toute retouche de couleur.
//
//   1. Texte sur papier / surface / sunken   → 4.5:1
//   2. --on-fill sur chaque aplat            → 4.5:1
//   3. Bordure -line d'un repère sur le fond → 3:1
//   4. Anneau de focus (accent-line) sur fond → 3:1
import { readFileSync } from "node:fs";

const css = readFileSync("src/app/globals.css", "utf8");
const block = (sel) => {
  const i = css.indexOf(sel);
  const body = css.slice(css.indexOf("{", i) + 1, css.indexOf("}", i));
  return Object.fromEntries([...body.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2].toLowerCase()]));
};
const themes = { light: block(":root {"), dark: block(':root[data-theme="dark"]') };

const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = (h) => { const n = parseInt(h.slice(1), 16); return 0.2126 * lin(n >> 16 & 255) + 0.7152 * lin(n >> 8 & 255) + 0.0722 * lin(n & 255); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

let fails = 0;
for (const [name, T] of Object.entries(themes)) {
  const rows = [];
  for (const bg of ["paper", "surface", "sunken"]) {
    for (const fg of ["ink", "muted", "accent-strong", "done-strong", "streak-strong", "xp-strong"]) {
      rows.push([`${fg} sur ${bg}`, ratio(T[fg], T[bg]), 4.5]);
    }
    for (const c of ["accent", "done", "streak", "xp"]) rows.push([`${c}-line vs ${bg} (repère)`, ratio(T[`${c}-line`], T[bg]), 3]);
    rows.push([`focus (accent-line) vs ${bg}`, ratio(T["accent-line"], T[bg]), 3]);
    rows.push([`line-strong vs ${bg} (champ)`, ratio(T["line-strong"], T[bg]), 3]);
  }
  for (const c of ["accent", "done", "streak", "xp"]) rows.push([`on-fill sur ${c}`, ratio(T["on-fill"], T[c]), 4.5]);
  rows.push(["paper sur ink (bouton encre)", ratio(T.paper, T.ink), 4.5]);
  rows.push(["code-ink sur code-bg", ratio(T["code-ink"], T["code-bg"]), 4.5]);
  rows.push(["mascot-face sur mascot-body", ratio(T["mascot-face"], T["mascot-body"]), 4.5]);
  console.log(`\n== thème ${name} ==`);
  for (const [label, r, floor] of rows) {
    const ok = r >= floor; if (!ok) fails++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2)}  min ${floor}  ${label}`);
  }
}
console.log(fails === 0 ? "\nToutes les paires passent, dans les deux thèmes." : `\n${fails} paire(s) a corriger.`);
process.exit(fails === 0 ? 0 : 1);
