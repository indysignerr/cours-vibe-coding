// Une image de partage par page, et non une seule pour tout le site.
// Un lien vers /team/ partagé sur LinkedIn doit montrer l'équipe, pas la
// page d'accueil. Relancer après un changement d'accroche :
//   node scripts/generate-og.mjs
// La correspondance page → image est dans src/lib/metadata.ts.
import { writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
import { logoShapes, LOGO, NAVY, BEIGE, LIGHT_BEIGE, IVORY } from "./brand.mjs";

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

/** Les pages qui méritent leur propre carte, avec leur accroche. */
const PAGES = [
  { slug: "home", kicker: "ALBERT SCHOOL MILANO", lines: ["Albert School's student lab", "for AI and code."], foot: "WORKSHOPS · BUILD LAB · TOURNAMENTS" },
  { slug: "events", kicker: "EVENTS · NOVEMBER TO MAY", lines: ["Something on at least", "every two weeks."], foot: "FREE · BEGINNERS WELCOME" },
  { slug: "team", kicker: "WHO WE ARE", lines: ["A club", "that builds."], foot: "RECOGNISED BY ALBERT SCHOOL" },
  { slug: "join", kicker: "JOIN", lines: ["Come once.", "Stay if it is useful."], foot: "BEGINNERS WELCOME" },
];

// Le logo fait 112 px de haut sur la carte : l'ampoule se lit, le nom aussi.
const LOGO_SCALE = (112 / LOGO.height).toFixed(4);

const card = ({ kicker, lines, foot }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${NAVY}"/>
  <!-- La même lueur haute que sur le site -->
  <defs>
    <radialGradient id="glow" cx="50%" cy="0%" r="70%">
      <stop offset="0%" stop-color="${BEIGE}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${BEIGE}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="1200" height="6" fill="${BEIGE}"/>

  <!-- Le logo entier, à gauche ; la rubrique, à droite sur la même ligne. -->
  <g transform="translate(72 44) scale(${LOGO_SCALE})" fill="none">
    ${logoShapes({ outline: IVORY, glyph: LIGHT_BEIGE, letters: IVORY })}
  </g>
  <text x="1124" y="108" text-anchor="end" font-family="${MONO}" font-size="17" letter-spacing="2.5" fill="${BEIGE}">${kicker}</text>

  <text x="76" y="352" font-family="${SANS}" font-weight="600" font-size="74" letter-spacing="-3" fill="${IVORY}">${lines[0]}</text>
  <text x="76" y="440" font-family="${SANS}" font-weight="600" font-size="74" letter-spacing="-3" fill="${IVORY}">${lines[1]}</text>

  <rect x="76" y="516" width="1048" height="1" fill="${IVORY}" opacity="0.18"/>
  <text x="76" y="566" font-family="${MONO}" font-size="19" letter-spacing="2.5" fill="${BEIGE}">${foot}</text>
</svg>`;

await mkdir("public/og", { recursive: true });
for (const p of PAGES) {
  const png = await sharp(Buffer.from(card(p))).png().toBuffer();
  await writeFile(p.slug === "home" ? "public/og.png" : `public/og/${p.slug}.png`, png);
}
console.log(`${PAGES.length} images de partage générées`);
