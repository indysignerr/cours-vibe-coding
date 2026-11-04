/**
 * Génère les visuels de marque avec Gemini.
 *
 * Ce sont des images abstraites, dans la charte : marine #0E1A2B, beige
 * #C9AE84, ivoire #F8F4EC. Pas de personnes, pas de texte dans l'image —
 * un modèle dessine mal les lettres, et une photo d'évènement fabriquée
 * serait un mensonge sur les pages qui disent qui nous sommes.
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
  "Strict palette: deep navy #0E1A2B as the ground, warm sand beige #C9AE84 for light, " +
  "pale ivory #F8F4EC for highlights. No other hues. Matte, filmic, fine grain, no gloss, " +
  "no lens flare, no 3D render shine.";

const RULES =
  "Abstract, non-figurative. No people, no faces, no hands, no logos, no letters, no numbers, " +
  "no words anywhere in the image. Generous empty space. Editorial art direction, " +
  "the kind of still image an award-winning studio site uses behind type.";

const IMAGES = [
  {
    name: "atmos-hero",
    prompt:
      "A wide field of deep navy darkness with a single soft bloom of warm beige light rising " +
      "from the lower left, as if one lamp were lit in a large dark room. Very gradual falloff, " +
      "deep shadow across the upper right two thirds. Extremely minimal.",
  },
  {
    name: "atmos-board",
    prompt:
      "Close overhead view of an empty matte navy surface lit from one side by warm beige light, " +
      "with the faint geometry of a long table edge and soft shadow. Quiet, still, almost empty. " +
      "Architectural photography feel, shallow contrast.",
  },
  {
    name: "atmos-build",
    prompt:
      "Fine pale ivory lines on deep navy, forming a loose irregular lattice that thins out toward " +
      "the edges, like a hand-drawn circuit or a constellation. Warm beige glow behind the densest " +
      "part. Precise, sparse, lots of dark space.",
  },
  {
    name: "atmos-grain",
    prompt:
      "An almost-empty deep navy surface with a slow vertical gradient to warm beige at the very " +
      "bottom edge, heavy fine film grain, subtle paper texture. Nothing else. A backdrop.",
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
