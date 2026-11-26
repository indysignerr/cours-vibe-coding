import shapes from "@/lib/brand-shapes.json";

/**
 * Le logo : celui du bureau, relevé sur son fichier et redessiné en SVG.
 *
 * Deux pièces, qui se posent côte à côte ou séparément :
 *   — BrandMark, le pictogramme : l'ampoule au trait, son « L » et ses
 *     cinq rayons ;
 *   — BrandWordmark, « ALBERT LIGHT » en contours. Ce sont des formes,
 *     pas du texte : aucune police n'est chargée pour l'écrire, et il
 *     reste identique au logo d'origine sur tous les écrans.
 *
 * La géométrie vit dans src/lib/brand-shapes.json, que scripts/brand.mjs
 * lit aussi pour produire favicons, images de partage et fichiers livrés.
 * Les couleurs sont celles du logo sur fond sombre : ivoire pour
 * l'ampoule et le nom, beige clair pour le « L » et les rayons.
 */
const { mark, wordmark } = shapes;

export function BrandMark({
  className = "h-10 w-auto",
  outline = "var(--ink)",
  glyph = "var(--brand-soft)",
}: {
  className?: string;
  outline?: string;
  glyph?: string;
}) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${mark.width} ${mark.height}`}
      fill="none"
      aria-hidden
      focusable="false"
    >
      <g strokeWidth={mark.stroke} strokeLinecap="round" strokeLinejoin="round">
        <path className="brand-glyph" d={mark.glyph} stroke={glyph} />
        <path d={mark.outline} stroke={outline} />
      </g>
      <path d={mark.cap} fill={outline} />
    </svg>
  );
}

export function BrandWordmark({
  className,
  fill = "currentColor",
}: {
  className?: string;
  fill?: string;
}) {
  const [x, y, w, h] = wordmark.box;
  return (
    <svg className={className} viewBox={`${x} ${y} ${w} ${h}`} aria-hidden focusable="false">
      <path d={wordmark.d} fill={fill} />
    </svg>
  );
}
