// Vérifie chaque paire couleur/fond du thème contre le plancher WCAG AA.
// À relancer après toute modification de la palette dans globals.css.
const lin = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
export const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const PAPER = "#f4f1ea";
const SURFACE = "#ffffff";
const INK = "#14121a";

const TEXT_ON_LIGHT = {
  ink: INK,
  muted: "#5f5647",
  accentStrong: "#b8341a",
  doneStrong: "#0d6b4f",
  streakStrong: "#8a5200",
  xpStrong: "#6b3b8f",
};

const FILLS = {
  accent: "#ff4d2e",
  done: "#12a374",
  streak: "#f0a500",
  xp: "#8b5cf6",
};

const rows = [];
for (const [name, hex] of Object.entries(TEXT_ON_LIGHT)) {
  rows.push([`${name} sur paper`, hex, PAPER, 4.5]);
  rows.push([`${name} sur surface`, hex, SURFACE, 4.5]);
}
// Texte posé sur un aplat de couleur : on teste l'encre et le blanc.
for (const [name, hex] of Object.entries(FILLS)) {
  rows.push([`ink sur ${name}`, INK, hex, 4.5]);
  rows.push([`white sur ${name}`, "#ffffff", hex, 4.5]);
}
// Les aplats servent aussi de gros repères non textuels : 3:1 suffit.
for (const [name, hex] of Object.entries(FILLS)) {
  rows.push([`${name} vs paper (repère)`, hex, PAPER, 3]);
}

let fails = 0;
for (const [label, fg, bg, floor] of rows) {
  const r = ratio(fg, bg);
  const ok = r >= floor;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2)}  min ${floor}  ${label}`);
}
console.log(fails === 0 ? "\nToutes les paires passent." : `\n${fails} paire(s) à corriger.`);
process.exit(fails === 0 ? 0 : 1);
