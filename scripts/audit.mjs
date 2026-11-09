/**
 * Audit statique de `out/`.
 *
 * Lit chaque page générée et ne rapporte QUE les défauts : titre ou
 * description manquants ou hors gabarit, canonical absente ou fausse,
 * h1 absent ou multiple, JSON-LD invalide, lien interne vers une page
 * qui n'existe pas, ressource (image, script, feuille, favicon) absente,
 * image sans alt, id en double. Rien d'autre à lire.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
const SITE = "https://albertlight.com";
const pages = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f === "index.html" || f === "404.html") pages.push(p);
  }
})(OUT);

const issues = [];
const note = (page, msg) => issues.push(`${page.replace(/^out/, "").replace(/index\.html$/, "")}  ${msg}`);
// Les longueurs se mesurent sur le texte que lit Google, pas sur son
// échappement HTML : en français une apostrophe devient « &#x27; », six
// signes pour un, et une description juste paraissait trop longue.
const decode = (s) =>
  s == null
    ? s
    : s
        .replace(/&#x27;|&#39;|&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
const attr = (tag, name) => decode((tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, "i")) || [])[1]);
const exists = (url) => {
  const clean = url.split(/[?#]/)[0];
  if (!clean.startsWith("/")) return true;
  const p = join(OUT, clean);
  return existsSync(p) || existsSync(join(p, "index.html")) || existsSync(p + ".html");
};
const titles = new Map();

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const is404 = page.endsWith("404.html") || /\/_not-found\//.test(page) || /name=["']robots["'][^>]*noindex/i.test(html);
  const route = page.replace(/^out/, "").replace(/index\.html$/, "");

  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1]);
  if (!title) note(page, "titre absent");
  else {
    if (title.length > 70) note(page, `titre long : ${title.length} car.`);
    if (titles.has(title) && !is404) note(page, `titre dupliqué avec ${titles.get(title)}`);
    titles.set(title, route);
  }
  const desc = attr(html.match(/<meta[^>]+name=["']description["'][^>]*>/i)?.[0] || "", "content");
  if (!is404) {
    if (!desc) note(page, "description absente");
    else if (desc.length < 50 || desc.length > 165) note(page, `description ${desc.length} car. (viser 50–160)`);
  }
  const canon = attr(html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0] || "", "href");
  if (!is404) {
    if (!canon) note(page, "canonical absente");
    else if (canon !== SITE + route) note(page, `canonical ${canon} ≠ ${SITE + route}`);
  }
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) note(page, `${h1} h1`);
  if (!/<html[^>]+lang=/.test(html)) note(page, "lang absent");
  if (!/<meta[^>]+name=["']viewport["']/.test(html)) note(page, "viewport absent");

  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { note(page, `JSON-LD invalide : ${String(e.message).slice(0, 60)}`); }
  }
  for (const m of html.matchAll(/<a\s[^>]*href=["']([^"']+)["']/g)) {
    const h = m[1];
    if (h.startsWith("/") && !h.startsWith("//") && !exists(h)) note(page, `lien interne cassé : ${h}`);
  }
  for (const m of html.matchAll(/<(img|script|link)\s[^>]*>/g)) {
    const tag = m[0];
    const src = attr(tag, "src") || attr(tag, "href");
    if (!src || !src.startsWith("/")) continue;
    if (m[1] === "link" && !/rel=["'](stylesheet|icon|apple-touch-icon|manifest|preload|alternate)/.test(tag)) continue;
    if (!exists(src)) note(page, `ressource absente : ${src}`);
    if (m[1] === "img" && !/\salt=/.test(tag)) note(page, `img sans alt : ${src}`);
  }
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) note(page, `id en double : ${[...new Set(dup)].join(", ")}`);
}

// sitemap et robots
for (const f of ["sitemap.xml", "robots.txt", "favicon.ico", "site.webmanifest", "og.png"]) {
  if (!existsSync(join(OUT, f))) issues.push(`/  fichier racine absent : /${f}`);
}
if (existsSync(join(OUT, "sitemap.xml"))) {
  for (const m of readFileSync(join(OUT, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const path = m[1].replace(SITE, "");
    if (!exists(path)) issues.push(`sitemap  entrée sans page : ${path}`);
  }
}

console.log(`${pages.length} pages auditées`);
if (issues.length === 0) console.log("Aucun défaut.");
else { console.log(`${issues.length} défaut(s) :`); for (const i of issues) console.log("  " + i); }
process.exit(issues.length ? 1 : 0);
