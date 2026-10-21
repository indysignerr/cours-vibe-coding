// Produit public/albert-light.ics : tout le programme d'évènements, pour
// ceux qui ne sont pas chez Google — Apple Calendar, Outlook, Thunderbird.
// Les dates sont lues dans src/lib/events.ts : une seule source.
// Relancer après un changement de programme.
import { writeFile, readFile } from "node:fs/promises";

const site = await readFile("src/lib/site.ts", "utf8");
const events = await readFile("src/lib/events.ts", "utf8");

const field = (src, key) => src.match(new RegExp(`${key}:\\s*"([^"]*)"`))?.[1] ?? "";
const NAME = field(site, "name");
const TZ = field(site, "timezone");

// On ne parse que le bloc EVENTS, pour ne pas confondre avec les exemples
// qui traînent ailleurs dans le fichier.
const block = events.slice(events.indexOf("export const EVENTS"), events.indexOf("/** Les évènements encore à venir"));
const entries = block
  .split(/\n  \{\n/)
  .slice(1)
  .map((chunk) => ({
    slug: field(chunk, "slug"),
    title: field(chunk, "title"),
    summary: field(chunk, "summary"),
    date: field(chunk, "date"),
    endDate: field(chunk, "endDate"),
    start: field(chunk, "start"),
    end: field(chunk, "end"),
    location: field(chunk, "location").replace(/\$\{SITE\.school\}/, field(site, "school")).replace(/\$\{SITE\.campus\}/, field(site, "campus")),
  }))
  .filter((e) => e.slug && e.date);

if (entries.length === 0) throw new Error("aucun évènement lu dans src/lib/events.ts");

const stamp = (date, time) => `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
// Les retours à la ligne et les virgules doivent être échappés dans un .ics.
const esc = (s) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

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
for (const e of entries) {
  lines.push(
    "BEGIN:VEVENT",
    `UID:${e.slug}@albert-light`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=${TZ}:${stamp(e.date, e.start)}`,
    `DTEND;TZID=${TZ}:${stamp(e.endDate || e.date, e.end)}`,
    `SUMMARY:${esc(`${NAME} — ${e.title}`)}`,
    `DESCRIPTION:${esc(e.summary)}`,
    `LOCATION:${esc(e.location)}`,
    "END:VEVENT",
  );
}

lines.push("END:VCALENDAR");
// Le format impose CRLF.
await writeFile("public/albert-light.ics", lines.join("\r\n") + "\r\n");
console.log(`albert-light.ics généré — ${entries.length} évènements`);
