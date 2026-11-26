// Une image de partage par page, et non une seule pour tout le site.
// Un lien vers /team/ partagé sur LinkedIn doit montrer l'équipe, pas la
// page d'accueil. Relancer après un changement d'accroche ou de logo :
//   node scripts/generate-og.mjs
// La correspondance page → image est dans src/lib/metadata.ts.
//
// La carte reprend la mise en page du site : le logo sur marine, un filet,
// un titre en serif. Le rendu passe par les polices du système (Georgia) :
// les polices du site ne sont pas installées sur la machine qui construit.
import { writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
import { logoShapes, LOGO, NAVY, BEIGE, LIGHT_BEIGE, IVORY } from "./brand.mjs";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Les pages qui méritent leur propre carte, avec leur accroche. */
const PAGES = [
  { slug: "home", kicker: "ALBERT SCHOOL MILANO", lines: ["The student association", "for AI and software."], foot: "LEARN · BUILD · COMPETE · CONNECT" },
  { slug: "about", kicker: "ABOUT", lines: ["We bridge academic theory", "and industry practice."], foot: "LAB OF INTELLIGENT, GENERATIVE, HANDS-ON TECHNOLOGY" },
  { slug: "events", kicker: "EVENTS · NOVEMBER TO MAY", lines: ["Something on at least", "every two weeks."], foot: "FREE · BEGINNERS WELCOME" },
  { slug: "team", kicker: "TEAM", lines: ["A club", "that builds."], foot: "STUDENT-RUN · ALBERT SCHOOL MILANO" },
  { slug: "join", kicker: "JOIN", lines: ["Come once.", "Stay if it is useful."], foot: "FREE · BEGINNERS WELCOME" },
  { slug: "faq", kicker: "FAQ", lines: ["Frequently asked", "questions."], foot: "WHO CAN COME · WHAT IT COSTS · HOW TO JOIN" },
];

// Le logo fait 104 px de haut sur la carte : l'ampoule se lit, le nom aussi.
const LOGO_SCALE = (104 / LOGO.height).toFixed(4);

const card = ({ kicker, lines, foot }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${NAVY}"/>
  <!-- Le logo entier, à gauche ; la rubrique, à droite sur la même ligne. -->
  <g transform="translate(72 48) scale(${LOGO_SCALE})" fill="none">
    ${logoShapes({ outline: IVORY, glyph: LIGHT_BEIGE, letters: IVORY })}
  </g>
  <text x="1128" y="108" text-anchor="end" font-family="${SANS}" font-weight="700" font-size="17" letter-spacing="3" fill="${BEIGE}">${kicker}</text>
  <rect x="72" y="188" width="1056" height="2" fill="${IVORY}"/>

  <text x="72" y="340" font-family="${SERIF}" font-size="82" letter-spacing="-2" fill="${IVORY}">${lines[0]}</text>
  <text x="72" y="434" font-family="${SERIF}" font-size="82" letter-spacing="-2" fill="${IVORY}">${lines[1]}</text>

  <rect x="72" y="520" width="1056" height="1" fill="${IVORY}" opacity="0.3"/>
  <text x="72" y="566" font-family="${SANS}" font-weight="700" font-size="17" letter-spacing="3" fill="${BEIGE}">${foot}</text>
</svg>`;

await mkdir("public/og", { recursive: true });
for (const p of PAGES) {
  const png = await sharp(Buffer.from(card(p))).png().toBuffer();
  await writeFile(p.slug === "home" ? "public/og.png" : `public/og/${p.slug}.png`, png);
}
console.log(`${PAGES.length} images de partage générées`);
