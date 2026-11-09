// Refait l'affiche de l'ampoule : l'image fixe servie au téléphone, en
// mouvement réduit, sans JavaScript, et pendant que la scène 3D charge.
//
// À relancer seulement si la scène (src/components/hero/bulb-scene.ts)
// change d'aspect. Deux temps :
//
//   1. Sur un grand écran, ouvrir l'accueil, attendre l'ampoule, puis dans
//      la console du navigateur :
//
//        const blob = await window.__bulb.snapshot();
//        const a = document.createElement("a");
//        a.href = URL.createObjectURL(blob);
//        a.download = "bulb.png";
//        a.click();
//
//   2. node scripts/make-poster.mjs ~/Downloads/bulb.png
//
// Le canvas est plus large que l'ampoule (190 % de sa boîte, pour que la
// lueur ait la place de s'étaler) : on n'en garde que la bande centrale,
// au format 3:4 de la boîte, en deux tailles.
import sharp from "sharp";

const [source] = process.argv.slice(2);
if (!source) {
  console.error("usage : node scripts/make-poster.mjs <capture.png>");
  process.exit(1);
}

/** Le rapport entre la largeur du canvas et celle de la boîte : `.bulb__canvas { width: 190% }`. */
const CANVAS_OVER_BOX = 1.9;
const SIZES = [
  { file: "public/images/bulb-poster.webp", width: 1080, height: 1440 },
  { file: "public/images/bulb-poster-640.webp", width: 640, height: 853 },
];

const meta = await sharp(source).metadata();
const boxWidth = Math.round(meta.width / CANVAS_OVER_BOX);
const ratio = boxWidth / meta.height;
if (Math.abs(ratio - 3 / 4) > 0.02) {
  console.error(
    `capture inattendue : ${meta.width}×${meta.height}. La bande centrale ferait ` +
      `${boxWidth}×${meta.height}, pas du 3:4 — la capture vient-elle bien de window.__bulb.snapshot() ?`,
  );
  process.exit(1);
}
if (meta.height < 1200) {
  console.warn(
    `attention : capture de ${meta.height} px de haut, l'affiche en demande 1440. ` +
      "Refaire la capture dans une fenêtre plus haute ou sur un écran plus dense.",
  );
}

for (const { file, width, height } of SIZES) {
  await sharp(source)
    .extract({ left: Math.round((meta.width - boxWidth) / 2), top: 0, width: boxWidth, height: meta.height })
    .resize(width, height, { fit: "cover" })
    .webp({ quality: 80 })
    .toFile(file);
  console.log(`${file} — ${width}×${height}`);
}
