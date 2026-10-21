// Une image de partage par page, et non une seule pour tout le site.
// Un lien vers /solutions/ partagé sur LinkedIn doit montrer les offres,
// pas la page d'accueil. Relancer après un changement de titre.
import { writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
import { mark, NAVY, BEIGE, LIGHT_BEIGE, IVORY } from "./brand.mjs";

const SANS = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

/** Les pages qui méritent leur propre carte, avec leur accroche. */
const PAGES = [
  { slug: "home", kicker: "ALBERT SCHOOL MILANO", lines: ["AI your lawyer", "can sign off on."], foot: "FIXED PRICE · 3 WEEKS" },
  { slug: "solutions", kicker: "SOLUTIONS", lines: ["Five engagements.", "Fixed price."], foot: "FROM €2,500" },
  { slug: "approach", kicker: "APPROACH", lines: ["The method", "is the product."], foot: "SCOPED TO FINISH" },
  { slug: "events", kicker: "EVENTS", lines: ["We run the room,", "not a syllabus."], foot: "HACKATHONS · WORKSHOPS · TALKS" },
  { slug: "about", kicker: "WHO WE ARE", lines: ["Students.", "We say so first."], foot: "ALBERT SCHOOL MILANO" },
  { slug: "contact", kicker: "CONTACT", lines: ["Forty-five minutes.", "No slide deck."], foot: "BOOK A CONVERSATION" },
];

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

  <g transform="translate(74 54) scale(0.4)" fill="none">
    ${mark({ outline: IVORY, glyph: LIGHT_BEIGE }).replace(/^<svg[^>]*>|<\/svg>$/g, "")}
  </g>
  <text x="168" y="118" font-family="${SANS}" font-weight="600" font-size="26" letter-spacing="5" fill="${IVORY}">ALBERT L.I.G.H.T.</text>
  <text x="168" y="152" font-family="${MONO}" font-size="17" letter-spacing="2.5" fill="${BEIGE}">${kicker}</text>

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
