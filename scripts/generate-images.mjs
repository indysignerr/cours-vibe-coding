/**
 * Génère les visuels de marque avec Gemini.
 *
 * Des scènes, étalonnées dans la charte : ombres marine #0E1A2B, lumière
 * beige #C9AE84, hautes lumières ivoire #F8F4EC.
 *
 * Ces images sont générées : elles illustrent ce qu'on fait, elles
 * n'attestent pas d'une séance précise. C'est pour cela qu'aucune ne
 * porte de légende documentaire — pas de « pris au tournoi du 21 ». Le
 * jour où il y a de vraies photos, elles prennent ces places.
 *
 * Les cadrages évitent les visages de face : de dos, de trois quarts ou à
 * contre-jour. On n'invente pas le portrait de gens qui existent.
 *
 *   GOOGLE_AI_API_KEY=… node scripts/generate-images.mjs [nom…]
 */
import { writeFile } from "node:fs/promises";
import { GoogleGenAI } from "@google/genai";

const KEY = process.env.GOOGLE_AI_API_KEY;
if (!KEY) {
  console.error("GOOGLE_AI_API_KEY manquante.");
  process.exit(1);
}

const PALETTE =
  "Color grade: navy #0E1A2B in the shadows, warm sand beige #C9AE84 in the light, " +
  "pale ivory #F8F4EC in the highlights. Restrained, almost monochrome. " +
  "35mm photograph, natural available light, shallow depth of field, fine film grain, " +
  "matte contrast. Not a 3D render, no HDR, no glossy stock-photo look.";

const RULES =
  "Documentary photography, candid, nobody posing or looking at the camera. " +
  "Faces turned away, in three-quarter view or backlit — no clear frontal portraits. " +
  "No logos, no brand names, no readable text, no letters or numbers on screens. " +
  "Real room, real clutter, generous negative space for type to sit over.";

const IMAGES = [
  {
    name: "scene-hero",
    prompt:
      "A wide shot of a university room in the evening, seen from the back. Six or seven students " +
      "sit along a long table with open laptops, screens glowing warm against the dark room. " +
      "One person stands at the far end, mid-sentence. Everyone is turned away from us. " +
      "Deep shadow in the foreground, the light pooled around the table.",
  },
  {
    name: "scene-board",
    prompt:
      "Four students around the corner of a table, laptops open, one pointing at another's screen. " +
      "Shot from the side at table height, close. Hands, screens, a notebook, coffee cups. " +
      "Warm light from one window out of frame, the rest of the room dark.",
  },
  {
    name: "scene-build",
    prompt:
      "Close over-the-shoulder shot of two people at one laptop, one typing, the other leaning in. " +
      "Only hands, forearms and the edge of a shoulder in frame, the screen a soft warm blur. " +
      "Night, a desk lamp the only light.",
  },
  {
    name: "scene-connect",
    prompt:
      "A small group standing and talking after a talk, in a corridor outside a lecture room, " +
      "seen from a distance down the corridor. Silhouettes against a bright doorway, " +
      "warm light spilling out. Nobody identifiable.",
  },
];

const ai = new GoogleGenAI({ apiKey: KEY });
const MODEL = process.env.IMAGE_MODEL || "gemini-3.1-flash-image-preview";

const wanted = process.argv.slice(2);
const todo = wanted.length
  ? IMAGES.filter((i) => wanted.includes(i.name))
  : IMAGES;

for (const img of todo) {
  process.stdout.write(`${img.name} … `);
  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: `${img.prompt}\n\n${PALETTE}\n\n${RULES}`,
    });

    const parts = res.candidates?.[0]?.content?.parts ?? [];
    const data = parts.find((p) => p.inlineData?.data)?.inlineData?.data;
    if (!data) {
      console.log("pas d'image renvoyée");
      const text = parts.find((p) => p.text)?.text;
      if (text) console.log(`  → ${text.slice(0, 200)}`);
      continue;
    }

    const buf = Buffer.from(data, "base64");
    await writeFile(`public/images/${img.name}.png`, buf);
    console.log(`${(buf.length / 1024).toFixed(0)} Ko`);
  } catch (err) {
    // Ne jamais relayer l'objet d'erreur brut : il peut contenir l'URL avec la clé.
    console.log(`échec — ${String(err?.message ?? err).slice(0, 180)}`);
  }
}
