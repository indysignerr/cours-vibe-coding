// Contrôle WCAG de la palette. À relancer après toute retouche de couleur.
//
// Règles appliquées :
//   1. Tout texte sur papier ou surface  → 4.5:1 minimum (AA, 1.4.3)
//   2. L'encre posée sur un aplat        → 4.5:1 minimum
//   3. La bordure d'un repère non textuel → 3:1 minimum (AA, 1.4.11)
//
// Les aplats vifs ne sont JAMAIS testés seuls contre le papier : un anneau
// de progression ou une pastille porte toujours sa bordure `-line`, et
// c'est elle qui assure le contraste. Le blanc n'est jamais posé sur un
// aplat : c'est ce qui avait fait échouer la première palette.
const lin = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  );
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const PAPER = "#f4f1ea";
const SURFACE = "#ffffff";
const INK = "#14121a";
const MUTED = "#5f5647";

// fill : aplat vif · line : bordure du repère · strong : texte sur fond clair
const SEMANTIC = {
  accent: { fill: "#ff4d2e", line: "#d13a1c", strong: "#b8341a" },
  done:   { fill: "#16c08a", line: "#0e8f66", strong: "#0d6b4f" },
  streak: { fill: "#ffb43d", line: "#b57a00", strong: "#8a5200" },
  xp:     { fill: "#a678f0", line: "#7a48c4", strong: "#6b3b8f" },
};

const rows = [];
for (const [label, hex] of [["ink", INK], ["muted", MUTED]]) {
  rows.push([`${label} sur paper`, ratio(hex, PAPER), 4.5]);
  rows.push([`${label} sur surface`, ratio(hex, SURFACE), 4.5]);
}
for (const [name, set] of Object.entries(SEMANTIC)) {
  rows.push([`${name}-strong sur paper`, ratio(set.strong, PAPER), 4.5]);
  rows.push([`${name}-strong sur surface`, ratio(set.strong, SURFACE), 4.5]);
  rows.push([`ink sur ${name} (aplat)`, ratio(INK, set.fill), 4.5]);
  rows.push([`${name}-line vs paper (repère)`, ratio(set.line, PAPER), 3]);
  rows.push([`${name}-line vs surface (repère)`, ratio(set.line, SURFACE), 3]);
}

let fails = 0;
for (const [label, r, floor] of rows) {
  const ok = r >= floor;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2)}  min ${floor}  ${label}`);
}
console.log(fails === 0 ? "\nToutes les paires passent." : `\n${fails} paire(s) a corriger.`);
process.exit(fails === 0 ? 0 : 1);
