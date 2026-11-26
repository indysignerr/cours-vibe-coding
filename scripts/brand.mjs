// La marque, dessinée une seule fois et partagée par le site, les favicons,
// les images de partage et les fichiers de public/brand.
//
// La géométrie vient de src/lib/brand-shapes.json : le logo du bureau,
// relevé sur son fichier. Rien n'est redessiné ici — ce module ne fait
// qu'habiller ces tracés de couleurs.
import { readFileSync } from "node:fs";

const shapes = JSON.parse(
  readFileSync(new URL("../src/lib/brand-shapes.json", import.meta.url), "utf8"),
);

export const NAVY = "#0E1A2B";
export const BEIGE = "#C9AE84";
export const LIGHT_BEIGE = "#E3CFAE";
export const SAND = "#EADFCB";
export const IVORY = "#F8F4EC";
export const SLATE = "#55616F";
export const BRONZE = "#7A5C33";

/** Les dimensions du pictogramme et du logo horizontal, dans leur repère. */
export const MARK = { width: shapes.mark.width, height: shapes.mark.height };
export const LOGO = { width: shapes.logo.width, height: shapes.logo.height };

/**
 * Le pictogramme, sans balise <svg> : à poser dans un dessin plus grand.
 * `outline` colore l'ampoule, `glyph` le « L » et les rayons.
 * `stroke` épaissit le trait pour les très petites tailles (favicons).
 */
export function markShapes({ outline = NAVY, glyph = BEIGE, stroke = shapes.mark.stroke, rays = true } = {}) {
  const m = shapes.mark;
  const glyphPath = rays ? m.glyph : m.letter;
  return `<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="${stroke}"><path stroke="${glyph}" d="${glyphPath}"/><path stroke="${outline}" d="${m.outline}"/></g><path fill="${outline}" d="${m.cap}"/>`;
}

/** Le pictogramme seul, sans fond, pour se poser sur n'importe quelle surface. */
export function mark(colors = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARK.width} ${MARK.height}" fill="none">${markShapes(colors)}</svg>`;
}

/** « ALBERT LIGHT » en contours, dans le repère du logo horizontal. */
export function wordmarkShape({ letters = NAVY } = {}) {
  return `<path fill="${letters}" d="${shapes.wordmark.d}"/>`;
}

/** Logo horizontal : pictogramme à gauche, nom à droite. */
export function logoShapes({ outline = NAVY, glyph = BEIGE, letters = NAVY } = {}) {
  return markShapes({ outline, glyph }) + wordmarkShape({ letters });
}

export function logoHorizontal(colors = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGO.width} ${LOGO.height}" fill="none">${logoShapes(colors)}</svg>`;
}
