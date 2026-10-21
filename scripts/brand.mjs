// La marque, dessinée une seule fois et partagée par le site, les favicons
// et les fichiers livrés au client. Couleurs de la charte Albert L.I.G.H.T.
export const NAVY = "#0E1A2B";
export const BEIGE = "#C9AE84";
export const LIGHT_BEIGE = "#E3CFAE";
export const SAND = "#EADFCB";
export const IVORY = "#F8F4EC";
export const SLATE = "#55616F";
export const BRONZE = "#7A5C33";

/**
 * Le pictogramme : ampoule au trait, « L » et rayons dans la couleur de marque.
 * viewBox 0 0 200 200, sans fond, pour se poser sur n'importe quelle surface.
 */
export function mark({ outline = NAVY, glyph = BEIGE } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <g stroke="${glyph}" stroke-width="11" stroke-linecap="round">
    <path d="M100 27V9"/>
    <path d="M56.2 44.2 43.4 31.4"/>
    <path d="M143.8 44.2 156.6 31.4"/>
    <path d="M41.7 66.8 24.8 60.6"/>
    <path d="M158.3 66.8 175.2 60.6"/>
  </g>
  <path d="M100 42a46 46 0 0 1 28 82 8 8 0 0 0-3 6v9H75v-9a8 8 0 0 0-3-6 46 46 0 0 1 28-82Z" stroke="${outline}" stroke-width="13" stroke-linejoin="round"/>
  <path d="M88 66v46h28" stroke="${glyph}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="72" y="147" width="56" height="13" rx="6.5" fill="${outline}"/>
  <path d="M80 170h40a20 20 0 0 1-40 0Z" fill="${outline}"/>
</svg>`;
}

/**
 * Le nom. Un seul <text> : c'est le moteur de rendu qui place les lettres,
 * pas nous — un placement glyphe par glyphe décale les points.
 * Les points de L.I.G.H.T. prennent la couleur de marque, comme sur le logo.
 */
export function wordmarkText({ letters = NAVY, dots = BEIGE, size = 64, x = 0, y = 0 } = {}) {
  const dot = `<tspan fill="${dots}">.</tspan>`;
  const svg = `<text x="${x}" y="${y}" font-family="Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="600" font-size="${size}" letter-spacing="${(size * 0.16).toFixed(1)}" fill="${letters}">ALBERT L${dot}I${dot}G${dot}H${dot}T${dot}</text>`;
  // Largeur estimée : capitales d'Inter, crénage compris. Sert au viewBox.
  return { svg, width: size * 0.82 * 17 };
}

/** Logo horizontal : pictogramme à gauche, nom à droite. */
export function logoHorizontal({ outline = NAVY, glyph = BEIGE, letters = NAVY, dots = BEIGE } = {}) {
  const { svg, width } = wordmarkText({ letters, dots, size: 64, x: 250, y: 122 });
  const total = Math.ceil(width + 250 + 24);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} 200" fill="none">
  <g transform="translate(10 0)" fill="none">${mark({ outline, glyph }).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g>
    ${svg}
</svg>`;
}
