// Contrôle WCAG des deux peaux, lues dans src/app/globals.css.
// Le site est sombre par défaut ; « .on-paper » inverse localement.
// Texte courant 4.5:1, repères non textuels 3:1. Relancer après retouche.
import { readFileSync } from "node:fs";

const css = readFileSync("src/app/globals.css", "utf8");

/** Lit un bloc de déclarations et n'en garde que les couleurs en hexadécimal. */
function tokens(selector) {
  const i = css.indexOf(selector + " {");
  if (i === -1) throw new Error(`bloc ${selector} introuvable`);
  const body = css.slice(i, css.indexOf("}", i));
  return Object.fromEntries(
    [...body.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2].toLowerCase()]),
  );
}

const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = (h) => { const n = parseInt(h.slice(1), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

let fails = 0;
function check(label, fg, bg, floor) {
  const r = ratio(fg, bg);
  const ok = r >= floor;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2)}  min ${floor}  ${label}`);
}

for (const [name, selector] of [["SOMBRE", ":root"], ["CLAIR", ".on-paper"]]) {
  const T = tokens(selector);
  console.log(`\n── ${name} ──`);
  for (const bg of ["canvas", "surface", "sunken", "accent-tint"]) {
    if (!T[bg]) continue;
    for (const fg of ["ink", "body", "muted", "accent"]) {
      if (T[fg]) check(`${fg} sur ${bg}`, T[fg], T[bg], 4.5);
    }
  }
  // Les aplats de marque servent de boutons : le texte dessus doit passer.
  check("on-brand sur brand (bouton)", T["on-brand"], T.brand, 4.5);
  check("on-brand sur brand-soft (survol)", T["on-brand"], T["brand-soft"], 4.5);
  // Le beige comme repère non textuel : filets, pictogramme, jauges.
  // Il n'est porteur que sur le marine. Sur l'ivoire il est décoratif, et la
  // charte interdit déjà de s'en servir comme texte — on ne lui demande donc
  // pas un rapport qu'il ne peut pas tenir, on vérifie qu'il reste interdit.
  if (selector === ":root") {
    check("brand vs canvas (repere)", T.brand, T.canvas, 3);
  } else if (ratio(T.brand, T.canvas) >= 4.5) {
    console.log("ATTENTION : le beige passerait en texte sur l'ivoire, la charte l'interdit.");
  }
}

console.log(fails === 0 ? "\nToutes les paires passent." : `\n${fails} paire(s) a corriger.`);
process.exit(fails === 0 ? 0 : 1);
