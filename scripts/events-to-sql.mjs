// Produit supabase/008_programme.sql à partir de content/events.json.
//
// Le site lit le programme dans content/events.json. La base, elle, ne
// porte que les inscriptions — mais sa fonction `rsvp` refuse un événement
// qu'elle ne connaît pas. Ce script écrit le SQL qui met les deux d'accord.
//
//   npm run events:sql      → réécrit supabase/008_programme.sql
//
// Puis coller le fichier dans l'éditeur SQL de Supabase et l'exécuter. Sans
// danger et rejouable : rien n'est supprimé, aucune inscription n'est touchée.
import { readFile, writeFile } from "node:fs/promises";

const site = JSON.parse(await readFile("content/site.json", "utf8"));
const { events } = JSON.parse(await readFile("content/events.json", "utf8"));
if (!events?.length) throw new Error("aucun événement dans content/events.json");

const TZ = site.timezone;

// La colonne `kind` date de l'ancien modèle et n'accepte que quatre valeurs
// (voir 007_events.sql). Le site ne la lit plus : on y range chaque format
// dans la case la plus proche, sans toucher au schéma.
const KIND = {
  workshop: "workshop",
  "crash-course": "workshop",
  "build-lab": "workshop",
  tournament: "hackathon",
  "open-event": "talk",
};

const q = (v) => (v == null || v === "" ? "null" : `'${String(v).replaceAll("'", "''")}'`);
const at = (date, time) => q(`${date} ${time} ${TZ}`);

const rows = events.map((e) => {
  const kind = KIND[e.format];
  if (!kind) throw new Error(`format inconnu « ${e.format} » pour ${e.slug}`);
  const lastDay = e.endDate || e.date;
  // Sans horaire, l'événement couvre la journée (ou la fenêtre de dates) :
  // les inscriptions restent ouvertes jusqu'à la fin du dernier jour.
  const starts = at(e.date, e.start || "00:00");
  const ends = at(lastDay, e.start && e.end ? e.end : "23:59");
  return `  (${[
    q(e.slug),
    q(e.title.en),
    q(kind),
    starts,
    ends,
    q(e.online ? "Online" : e.location?.en),
    q(e.summary.en),
    e.capacity ?? "null",
  ].join(", ")})`;
});

const slugs = events.map((e) => q(e.slug)).join(", ");

const sql = `-- =====================================================================
-- Le programme, tel qu'il est dans content/events.json.
--
-- FICHIER GÉNÉRÉ par \`npm run events:sql\` — ne pas le modifier à la main.
-- À rejouer dans l'éditeur SQL de Supabase chaque fois qu'un événement est
-- ajouté, ou qu'une date, un horaire ou une jauge change.
--
-- Sans danger, rejouable :
--   — les événements du programme sont créés ou mis à jour ;
--   — ceux qui n'y sont plus sont FERMÉS (is_open = false), jamais
--     supprimés : leurs inscriptions restent lisibles dans /admin/ ;
--   — aucune inscription n'est touchée.
--
-- Prérequis : supabase/007_events.sql a été joué une fois (il crée les
-- tables ; ne PAS le rejouer, il les recrée vides).
--
-- Un événement fermé à la main (is_open = false) le reste : ce fichier ne
-- rouvre rien.
-- =====================================================================

insert into public.events (slug, title, kind, starts_at, ends_at, location, summary, capacity) values
${rows.join(",\n")}
on conflict (slug) do update set
  title = excluded.title, kind = excluded.kind,
  starts_at = excluded.starts_at, ends_at = excluded.ends_at,
  location = excluded.location, summary = excluded.summary,
  capacity = excluded.capacity;

-- Ce qui n'est plus au programme ne prend plus d'inscription.
update public.events set is_open = false
where slug not in (${slugs});

-- Contrôle : la liste que la page d'un événement interroge.
select slug, starts_at, ends_at, capacity, is_open from public.events order by starts_at;
`;

await writeFile("supabase/008_programme.sql", sql);
console.log(`supabase/008_programme.sql — ${events.length} événements`);
