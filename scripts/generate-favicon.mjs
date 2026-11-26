// Favicons, manifeste et fichiers de marque, tous produits depuis
// scripts/brand.mjs — donc depuis src/lib/brand-shapes.json, le logo du
// bureau. Un seul dessin, une seule source. Relancer après un changement
// de nom, de couleur ou de logo :
//   node scripts/generate-favicon.mjs
// Les images de partage, elles, viennent de scripts/generate-og.mjs.
import { readFileSync } from "node:fs";
import { writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { mark, markShapes, logoHorizontal, MARK, NAVY, LIGHT_BEIGE, IVORY } from "./brand.mjs";

// Le nom : celui de content/site.json, jamais recopié ici.
const NAME = JSON.parse(readFileSync(new URL("../content/site.json", import.meta.url), "utf8")).name;

/**
 * L'icône : le pictogramme sur un carré marine.
 *
 * Le logo est dessiné d'un trait fin. À 180 px et plus il passe tel quel ;
 * en dessous, le trait fondrait dans la grille de pixels. On l'épaissit
 * donc à mesure que l'icône rétrécit, et à 16 px on retire les rayons
 * pour donner toute la place à l'ampoule et à son « L ».
 *
 *   size    — le côté, en pixels
 *   stroke  — l'épaisseur du trait, dans le repère du pictogramme
 *   rays    — avec ou sans les rayons
 *   fill    — la part de la hauteur occupée par le dessin
 *   round   — coins arrondis (onglet) ou carré plein (écran d'accueil :
 *             iOS et Android découpent eux-mêmes, et noircissent le vide)
 */
const icon = ({ size, stroke = 21.7, rays = true, fill = 0.76, round = true }) => {
  // Sans rayons, on cadre sur l'ampoule seule.
  const box = rays ? { x: 0, y: 0, w: MARK.width, h: MARK.height } : { x: 59, y: 84, w: 234, h: 358 };
  const s = (240 * fill) / box.h;
  const tx = (240 - box.w * s) / 2 - box.x * s;
  const ty = (240 - box.h * s) / 2 - box.y * s;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 240 240">
  <rect width="240" height="240" rx="${round ? 52 : 0}" fill="${NAVY}"/>
  <g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})">${markShapes({ outline: IVORY, glyph: LIGHT_BEIGE, stroke, rays })}</g>
</svg>`;
};

const SMALL = { stroke: 28, fill: 0.84 };
const ICONS = {
  16: { stroke: 36, rays: false, fill: 0.84 },
  32: SMALL,
  48: { stroke: 26, fill: 0.82 },
  180: { round: false, fill: 0.7 },
  192: { round: false, fill: 0.7 },
  512: { round: false, fill: 0.7 },
};

await mkdir("public/brand", { recursive: true });
const buffers = {};
for (const [size, options] of Object.entries(ICONS)) {
  const px = Number(size);
  buffers[px] = await sharp(Buffer.from(icon({ size: px, ...options }))).resize(px, px).png().toBuffer();
}

await writeFile("public/favicon-16x16.png", buffers[16]);
await writeFile("public/favicon-32x32.png", buffers[32]);
await writeFile("public/favicon-48x48.png", buffers[48]);
await writeFile("public/apple-touch-icon.png", buffers[180]);
await writeFile("public/android-chrome-192x192.png", buffers[192]);
await writeFile("public/android-chrome-512x512.png", buffers[512]);
await writeFile("public/favicon.ico", await pngToIco([buffers[16], buffers[32], buffers[48]]));
// L'icône vectorielle sert surtout dans l'onglet : le dessin des petites tailles.
await writeFile("public/icon.svg", icon({ size: 512, ...SMALL }).trim() + "\n");

// Les fichiers de marque, à donner à qui prépare un document ou une affiche.
await writeFile("public/brand/mark.svg", mark() + "\n");
await writeFile("public/brand/mark-inverse.svg", mark({ outline: IVORY, glyph: LIGHT_BEIGE }) + "\n");
await writeFile("public/brand/logo.svg", logoHorizontal() + "\n");
await writeFile(
  "public/brand/logo-inverse.svg",
  logoHorizontal({ outline: IVORY, glyph: LIGHT_BEIGE, letters: IVORY }) + "\n",
);

await writeFile(
  "public/site.webmanifest",
  JSON.stringify(
    {
      name: NAME,
      short_name: NAME,
      start_url: "/",
      display: "standalone",
      background_color: IVORY,
      theme_color: NAVY,
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    null,
    2,
  ) + "\n",
);
console.log(`favicons, manifeste et fichiers de marque générés pour « ${NAME} »`);
