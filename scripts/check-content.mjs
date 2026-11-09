#!/usr/bin/env node
/**
 * Vérifie que chaque texte du site existe dans toutes les langues.
 *
 * Le contenu s'écrit à la main dans content/. Avec quatre langues, la
 * faute la plus facile est d'en oublier une : un lieu saisi en anglais,
 * en italien et en français, et la page espagnole afficherait « lieu à
 * confirmer » sans que rien ne le signale. Ce script s'exécute avant
 * chaque build et l'arrête, en nommant le fichier et le champ.
 *
 * Il contrôle deux choses :
 *
 *   1. les dictionnaires de content/i18n/ ont exactement les mêmes clés
 *      que en.json, sans texte vide, avec les mêmes variables ({n}, …) ;
 *   2. dans les autres fichiers de content/, tout texte traduit — un objet
 *      { "en": …, "it": …, … } — porte chaque langue, et rien d'autre.
 *
 * La liste des langues n'est pas recopiée ici : elle est lue dans
 * src/lib/i18n.ts, et comparée aux dictionnaires présents.
 *
 *   node scripts/check-content.mjs     (ou : npm run content)
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const contentDir = join(root, "content");
const dictDir = join(contentDir, "i18n");

const problems = [];
const say = (file, where, what) => problems.push(`  ${file} → ${where} : ${what}`);

const read = (path, label) => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    say(label, "le fichier", `JSON illisible (${err.message})`);
    return null;
  }
};

// --- Les langues ----------------------------------------------------------
const source = readFileSync(join(root, "src/lib/i18n.ts"), "utf8");
const declared = source.match(/export const LOCALES = \[([^\]]*)\]/);
const LOCALES = declared ? [...declared[1].matchAll(/"([a-z-]+)"/g)].map((m) => m[1]) : [];
if (LOCALES.length === 0) {
  console.error("Contenu : impossible de lire LOCALES dans src/lib/i18n.ts.");
  process.exit(1);
}

const dictFiles = readdirSync(dictDir).filter((f) => f.endsWith(".json")).sort();
const onDisk = dictFiles.map((f) => f.replace(/\.json$/, ""));
for (const l of LOCALES) {
  if (!onDisk.includes(l)) say(`content/i18n/${l}.json`, "le fichier", "dictionnaire absent");
}
for (const l of onDisk) {
  if (!LOCALES.includes(l)) {
    say(`content/i18n/${l}.json`, "le fichier", "langue absente de LOCALES (src/lib/i18n.ts)");
  }
}

// --- 1. Les dictionnaires -------------------------------------------------
/** Tous les textes d'un dictionnaire, à plat : « form.email » → « Email ». */
function leaves(node, path, out) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => leaves(v, `${path}[${i}]`, out));
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) leaves(v, path ? `${path}.${k}` : k, out);
  } else {
    out.set(path, node);
  }
  return out;
}
const variables = (text) => (String(text).match(/\{\w+\}/g) ?? []).sort().join(" ");

const reference = read(join(dictDir, "en.json"), "content/i18n/en.json");
const refLeaves = reference ? leaves(reference, "", new Map()) : new Map();
const dictKeys = refLeaves.size;

for (const lang of LOCALES) {
  if (!onDisk.includes(lang)) continue;
  const file = `content/i18n/${lang}.json`;
  const dict = lang === "en" ? reference : read(join(dictDir, `${lang}.json`), file);
  if (!dict) continue;
  const own = leaves(dict, "", new Map());
  for (const [key, ref] of refLeaves) {
    if (!own.has(key)) {
      say(file, key, "clé absente (elle existe dans en.json)");
      continue;
    }
    const value = own.get(key);
    if (typeof value !== "string" || value.trim() === "") say(file, key, "texte vide");
    else if (variables(value) !== variables(ref)) {
      say(file, key, `variables différentes de en.json (attendu : ${variables(ref) || "aucune"})`);
    }
  }
  for (const key of own.keys()) {
    if (!refLeaves.has(key)) say(file, key, "clé inconnue (absente de en.json)");
  }
}

// --- 2. Les fichiers de données -------------------------------------------
const isLang = (k) => /^[a-z]{2}(-[A-Za-z]{2})?$/.test(k);
let texts = 0;

function walk(node, path, file) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, `${path}[${i}]`, file));
    return;
  }
  if (!node || typeof node !== "object") return;

  const keys = Object.keys(node).filter((k) => !k.startsWith("_"));
  // Un texte traduit : un objet dont les clés sont des codes de langue.
  const translated =
    keys.length > 0 && keys.every(isLang) && keys.some((k) => LOCALES.includes(k));
  if (translated) {
    texts++;
    for (const l of LOCALES) {
      if (!(l in node)) say(file, path, `il manque "${l}"`);
      else if (typeof node[l] !== "string" || node[l].trim() === "") {
        say(file, `${path}.${l}`, "texte vide");
      }
    }
    for (const k of keys) {
      if (!LOCALES.includes(k)) say(file, `${path}.${k}`, "langue inconnue du site");
    }
    return;
  }
  for (const k of keys) walk(node[k], path ? `${path}.${k}` : k, file);
}

for (const f of readdirSync(contentDir).filter((x) => x.endsWith(".json")).sort()) {
  const file = `content/${f}`;
  const data = read(join(contentDir, f), file);
  if (data) walk(data, "", file);
}

// --- Verdict --------------------------------------------------------------
if (problems.length > 0) {
  console.error(`Contenu : ${problems.length} défaut${problems.length > 1 ? "s" : ""}.\n`);
  console.error(problems.join("\n"));
  console.error(
    `\nChaque texte s'écrit dans les ${LOCALES.length} langues du site : ${LOCALES.join(", ")}.`,
  );
  process.exit(1);
}
console.log(
  `Contenu : ${LOCALES.length} langues (${LOCALES.join(", ")}), ${dictKeys} textes par dictionnaire, ${texts} textes traduits dans les données. Rien ne manque.`,
);
