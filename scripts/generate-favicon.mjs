// Favicons, manifeste, image de partage et fichiers de marque livrables,
// tous produits depuis scripts/brand.mjs. Un seul dessin, une seule source.
// Relancer après un changement de nom ou de couleur.
import { writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { mark, logoHorizontal, NAVY, BEIGE, LIGHT_BEIGE, IVORY, SLATE, BRONZE } from "./brand.mjs";

const NAME = "Albert L.I.G.H.T."; // aligné sur src/lib/site.ts
const SANS = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";

// L'icône : le pictogramme sur un carré marine, cadré pour rester lisible à 16 px.
const icon = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 240 240">
  <rect width="240" height="240" rx="52" fill="${NAVY}"/>
  <g transform="translate(26 22) scale(0.78)" fill="none">
    ${mark({ outline: IVORY, glyph: LIGHT_BEIGE }).replace(/^<svg[^>]*>|<\/svg>$/g, "")}
  </g>
</svg>`;

// L'image de partage : la une du site, en plus calme.
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${IVORY}"/>
  <rect x="0" y="0" width="1200" height="8" fill="${NAVY}"/>
  <g transform="translate(78 58) scale(0.45)" fill="none">
    ${mark().replace(/^<svg[^>]*>|<\/svg>$/g, "")}
  </g>
  <text x="188" y="128" font-family="${SANS}" font-weight="600" font-size="30" letter-spacing="5" fill="${NAVY}">ALBERT L.I.G.H.T.</text>
  <text x="188" y="166" font-family="${SANS}" font-weight="500" font-size="19" letter-spacing="3" fill="${SLATE}">ALBERT SCHOOL MILANO</text>

  <text x="80" y="330" font-family="${SANS}" font-weight="600" font-size="78" letter-spacing="-3" fill="${NAVY}">AI your lawyer</text>
  <text x="80" y="418" font-family="${SANS}" font-weight="600" font-size="78" letter-spacing="-3" fill="${NAVY}">can sign off on.</text>

  <rect x="80" y="474" width="1040" height="1" fill="${BEIGE}"/>
  <text x="80" y="528" font-family="${SANS}" font-size="26" fill="${SLATE}">We automate the repetitive work inside your company, and we hand</text>
  <text x="80" y="566" font-family="${SANS}" font-size="26" fill="${SLATE}">you the file that lets you deploy it.</text>
  <text x="1120" y="566" text-anchor="end" font-family="${SANS}" font-weight="500" font-size="21" letter-spacing="2" fill="${BRONZE}">FIXED PRICE · 3 WEEKS</text>
</svg>`;

await mkdir("public/brand", { recursive: true });
const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

const sizes = [16, 32, 48, 180, 192, 512];
const buffers = {};
for (const s of sizes) buffers[s] = await png(icon(s), s);

await writeFile("public/favicon-16x16.png", buffers[16]);
await writeFile("public/favicon-32x32.png", buffers[32]);
await writeFile("public/favicon-48x48.png", buffers[48]);
await writeFile("public/apple-touch-icon.png", buffers[180]);
await writeFile("public/android-chrome-192x192.png", buffers[192]);
await writeFile("public/android-chrome-512x512.png", buffers[512]);
await writeFile("public/favicon.ico", await pngToIco([buffers[16], buffers[32], buffers[48]]));
await writeFile("public/icon.svg", icon(512).trim());
await writeFile("public/og.png", await sharp(Buffer.from(og)).png().toBuffer());

// Les fichiers de marque, à donner au client pour ses documents.
await writeFile("public/brand/mark.svg", mark().trim());
await writeFile("public/brand/mark-inverse.svg", mark({ outline: IVORY, glyph: LIGHT_BEIGE }).trim());
await writeFile("public/brand/logo.svg", logoHorizontal().trim());
await writeFile(
  "public/brand/logo-inverse.svg",
  logoHorizontal({ outline: IVORY, glyph: LIGHT_BEIGE, letters: IVORY, dots: LIGHT_BEIGE }).trim(),
);

await writeFile(
  "public/site.webmanifest",
  JSON.stringify(
    {
      name: NAME,
      short_name: "Albert L.I.G.H.T.",
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
  ),
);
console.log("favicons, manifeste, og.png et fichiers de marque générés");
