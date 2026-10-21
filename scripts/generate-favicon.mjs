// Génère le jeu complet de favicons, le manifeste et l'image de partage
// à partir de la marque typographique : un carré d'encre, « Ai » dedans.
// Pas de mascotte : le site s'adresse à des entreprises.
// Relancer après un changement de nom ou de couleur d'accent.
import { writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
import pngToIco from "png-to-ico";

// Jetons alignés sur src/app/globals.css.
const INK = "#0b1220";
const ON_INK = "#ffffff";
const CANVAS = "#fcfcfd";
const ACCENT = "#b4441f";
const BODY = "#495567";
const LINE = "#e3e6eb";

const NAME = "AI-bert"; // aligné sur src/lib/site.ts
const TAGLINE_1 = "AI that your lawyer";
const TAGLINE_2 = "can sign off on.";

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Helvetica, Arial, sans-serif";

// L'icône : carré plein, deux lettres centrées. Lisible à 16 px.
const icon = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 160 160">
  <rect width="160" height="160" rx="34" fill="${INK}"/>
  <text x="80" y="80" text-anchor="middle" dominant-baseline="central"
        font-family="${MONO}" font-weight="500" font-size="74" letter-spacing="-2"
        fill="${ON_INK}">Ai</text>
</svg>`;

// L'image de partage : la une du site, en plus calme.
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${CANVAS}"/>
  <rect x="0" y="0" width="1200" height="6" fill="${INK}"/>

  <rect x="80" y="76" width="54" height="54" rx="12" fill="${INK}"/>
  <text x="107" y="104" text-anchor="middle" dominant-baseline="central"
        font-family="${MONO}" font-weight="500" font-size="25" fill="${ON_INK}">Ai</text>
  <text x="152" y="113" font-family="${SERIF}" font-size="38" fill="${INK}">${NAME}</text>
  <text x="300" y="112" font-family="${MONO}" font-size="20" letter-spacing="2"
        fill="${BODY}">ALBERT SCHOOL MILANO</text>

  <text x="80" y="300" font-family="${SERIF}" font-size="82" fill="${INK}">${TAGLINE_1}</text>
  <text x="80" y="392" font-family="${SERIF}" font-size="82" fill="${INK}">${TAGLINE_2}</text>

  <rect x="80" y="452" width="1040" height="1" fill="${LINE}"/>
  <text x="80" y="512" font-family="${SANS}" font-size="27" fill="${BODY}">We automate the repetitive work inside your company, and we hand you</text>
  <text x="80" y="552" font-family="${SANS}" font-size="27" fill="${BODY}">the file that lets you deploy it.</text>
  <text x="1120" y="552" text-anchor="end" font-family="${MONO}" font-size="22" letter-spacing="2"
        fill="${ACCENT}">FIXED PRICE · 3 WEEKS</text>
</svg>`;

await mkdir("public", { recursive: true });
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
await writeFile("public/site.webmanifest", JSON.stringify({
  name: NAME, short_name: NAME, start_url: "/", display: "standalone",
  background_color: CANVAS, theme_color: INK,
  icons: [
    { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
  ],
}, null, 2));
console.log("favicons, manifeste et og.png générés");
