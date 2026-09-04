// Génère le jeu complet de favicons, le manifeste et l'image de partage
// à partir de la mascotte, dessinée ici en SVG sur un carré vermillon.
// Relancer après un changement de nom ou de couleur d'accent.
import { writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const ACCENT = "#ff4d2e";
const INK = "#14121a";
const PAPER = "#f4f1ea";
const NAME = "Vibe Coding Club"; // PROVISOIRE, aligné sur src/lib/site.ts
const TAGLINE = "Ship something real, every week.";

const mascot = (x, y, s) => `
<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="18" y="26" width="124" height="110" rx="30" fill="${INK}"/>
  <circle cx="40" cy="46" r="5" fill="${ACCENT}"/><circle cx="56" cy="46" r="5" fill="#ffb43d"/><circle cx="72" cy="46" r="5" fill="#16c08a"/>
  <ellipse cx="58" cy="76" rx="9" ry="10" fill="${PAPER}"/><circle cx="60" cy="78" r="4" fill="${INK}"/>
  <ellipse cx="102" cy="76" rx="9" ry="10" fill="${PAPER}"/><circle cx="104" cy="78" r="4" fill="${INK}"/>
  <path d="M62 94 Q80 108 98 94" stroke="${PAPER}" stroke-width="5" stroke-linecap="round" fill="none"/>
  <rect x="112" y="110" width="12" height="16" rx="2" fill="#16c08a"/>
  <rect x="44" y="132" width="26" height="12" rx="6" fill="${INK}"/><rect x="90" y="132" width="26" height="12" rx="6" fill="${INK}"/>
</g>`;

const icon = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 160 160">
  <rect width="160" height="160" rx="36" fill="${ACCENT}"/>
  ${mascot(8, 4, 0.9)}
</svg>`;

const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <circle cx="1080" cy="120" r="220" fill="#a678f0" opacity="0.35"/>
  <circle cx="140" cy="560" r="200" fill="#ffb43d" opacity="0.4"/>
  <circle cx="760" cy="600" r="140" fill="#16c08a" opacity="0.3"/>
  ${mascot(820, 170, 2.1)}
  <text x="80" y="230" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="40" fill="#5f5647">${NAME.toUpperCase()}</text>
  <text x="80" y="330" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="78" fill="${INK}">Ship something</text>
  <text x="80" y="420" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="78" fill="${INK}">real, every week.</text>
  <rect x="80" y="470" width="420" height="64" rx="32" fill="${ACCENT}"/>
  <text x="290" y="513" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="28" fill="${INK}">Albert School · 1 h / week</text>
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
  name: NAME, short_name: "VCC", start_url: "/", display: "standalone",
  background_color: PAPER, theme_color: ACCENT,
  icons: [
    { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
  ],
}, null, 2));
console.log("favicons, manifeste et og.png générés");
