// Produit public/albert-light.ics : tout le programme, pour ceux qui ne
// sont pas chez Google — Apple Calendar, Outlook, Thunderbird.
// Les dates sont lues dans content/events.json : une seule source.
//
// Lancé tout seul avant `npm run dev` et `npm run build` (voir package.json) :
// modifier le calendrier, même depuis l'éditeur web de GitHub, suffit — le
// fichier .ics est refait au déploiement. À la main : npm run ics
import { readFile, writeFile } from "node:fs/promises";

const site = JSON.parse(await readFile("content/site.json", "utf8"));
const { events } = JSON.parse(await readFile("content/events.json", "utf8"));

const NAME = site.name;
const TZ = site.timezone;
if (!events?.length) throw new Error("aucun événement dans content/events.json");

const stamp = (date, time) => `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
// Les retours à la ligne et les virgules doivent être échappés dans un .ics.
const esc = (s) => String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

const lines = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  `PRODID:-//${NAME}//EN`,
  "CALSCALE:GREGORIAN",
  "METHOD:PUBLISH",
  `X-WR-CALNAME:${esc(NAME)}`,
  `X-WR-TIMEZONE:${TZ}`,
];

const now = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
// Une date sans horaire devient un événement « journée entière » : la
// date de fin d'un all-day est exclusive, d'où le lendemain.
const nextDay = (d) => {
  const x = new Date(`${d}T12:00:00Z`);
  x.setUTCDate(x.getUTCDate() + 1);
  return x.toISOString().slice(0, 10).replaceAll("-", "");
};

for (const e of events) {
  const allDay = !e.start || !e.end;
  const end = e.endDate || e.date;
  lines.push(
    "BEGIN:VEVENT",
    `UID:${e.slug}@albert-light`,
    `DTSTAMP:${now}`,
    ...(allDay
      ? [`DTSTART;VALUE=DATE:${e.date.replaceAll("-", "")}`, `DTEND;VALUE=DATE:${nextDay(end)}`]
      : [`DTSTART;TZID=${TZ}:${stamp(e.date, e.start)}`, `DTEND;TZID=${TZ}:${stamp(end, e.end)}`]),
    `SUMMARY:${esc(`${NAME} — ${e.title.en}`)}`,
    `DESCRIPTION:${esc(e.summary.en)}`,
    `LOCATION:${esc(e.location?.en ?? "")}`,
    `URL:${site.url}/events/${e.slug}/`,
    "END:VEVENT",
  );
}

lines.push("END:VCALENDAR");
// Le format exige CRLF.
const OUT = "public/albert-light.ics";
const next = lines.join("\r\n") + "\r\n";

// L'horodatage (DTSTAMP) change à chaque passage. Lui seul ne justifie pas
// de réécrire le fichier : on ne l'écrit que si le programme a changé. Le
// dépôt reste propre d'un build à l'autre, et l'horodatage dit quelque
// chose de vrai — la dernière fois que le calendrier a bougé.
const bare = (text) => text.replace(/^DTSTAMP:.*\r?\n/gm, "");
let previous = "";
try {
  previous = await readFile(OUT, "utf8");
} catch {
  // Pas encore de fichier : on l'écrit.
}

if (previous && bare(previous) === bare(next)) {
  console.log(`${OUT} — à jour (${events.length} événements)`);
} else {
  await writeFile(OUT, next);
  console.log(`${OUT} — réécrit (${events.length} événements)`);
}
