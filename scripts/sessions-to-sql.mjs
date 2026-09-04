// Transforme les dossiers seances/SXX-*/ en SQL prêt à coller dans Supabase.
// Le texte est cité en dollar-quoting, donc aucune apostrophe à échapper.
// Idempotent : on remplace prompts et cases de chaque séance traitée.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = "seances";
const dirs = (await readdir(root)).filter((d) => /^S\d{2}-/.test(d)).sort();
const q = (s) => `$md$${s.trim()}$md$`;
let out = `-- Généré par scripts/sessions-to-sql.mjs. Ne pas éditer à la main.\n-- À exécuter après bootstrap.sql. Chaque séance est remplacée entièrement.\n\nbegin;\n`;

for (const d of dirs) {
  const n = Number(d.slice(1, 3));
  const dir = path.join(root, d);
  const read = async (f) => readFile(path.join(dir, f), "utf8").catch(() => null);
  const support = await read("SUPPORT.md");
  const brief = await read("ENONCE.md");
  const solution = await read("CORRIGE.md");
  const prompts = JSON.parse((await read("PROMPTS.json")) ?? "[]");
  const checks = JSON.parse((await read("CHECKS.json")) ?? "[]");
  if (!support || !brief) continue;

  out += `\n-- ---------- Séance ${n} ----------\n`;
  out += `update public.sessions set support_md = ${q(support)}, brief_md = ${q(brief)}, updated_at = now() where number = ${n};\n`;
  if (solution) {
    out += `insert into public.session_solutions (session_id, body_md) select id, ${q(solution)} from public.sessions where number = ${n}\n  on conflict (session_id) do update set body_md = excluded.body_md;\n`;
  }
  out += `delete from public.session_prompts where session_id = (select id from public.sessions where number = ${n});\n`;
  prompts.forEach((p, i) => {
    out += `insert into public.session_prompts (session_id, position, label, body) select id, ${i + 1}, ${q(p.label)}, ${q(p.body)} from public.sessions where number = ${n};\n`;
  });
  out += `delete from public.session_checks where session_id = (select id from public.sessions where number = ${n});\n`;
  checks.forEach((c, i) => {
    out += `insert into public.session_checks (session_id, position, label, is_bonus) select id, ${i + 1}, ${q(c.label)}, ${c.is_bonus ? "true" : "false"} from public.sessions where number = ${n};\n`;
  });
}
out += `\ncommit;\n`;
await writeFile("supabase/003_sessions.sql", out);
console.log(`écrit supabase/003_sessions.sql pour ${dirs.length} séance(s)`);
