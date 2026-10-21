// Produit public/albert-light.ics : l'heure d'entraide récurrente et les
// trois concours. Pour ceux qui ne sont pas chez Google — Apple Calendar,
// Outlook, Thunderbird. Relancer après un changement de calendrier.
import { writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";

// On relit les deux sources TypeScript au lieu de dupliquer les dates :
// un simple parsing suffit, elles sont écrites à plat.
const site = readFileSync("src/lib/site.ts", "utf8");
const curriculum = readFileSync("src/lib/curriculum.ts", "utf8");

const field = (src, key) => src.match(new RegExp(`${key}:\\s*"([^"]*)"`))?.[1] ?? "";
const NAME = field(site, "name");
const TZ = field(site, "timezone");
const WEEKLY = site.slice(site.indexOf("weekly: {"));
const DAY = field(WEEKLY, "day");
const START = field(WEEKLY, "start");
const END = field(WEEKLY, "end");
const LOCATION = field(WEEKLY, "location");
const TITLE = field(WEEKLY, "title");
const DETAILS = field(WEEKLY, "details");

const entries = [...curriculum.matchAll(
  /number: (\d+), slug: "([^"]+)", title: "([^"]+)", promise: "([^"]+)", weekOf: "([^"]+)", kind: "([^"]+)"/g,
)].map((m) => ({ number: +m[1], slug: m[2], title: m[3], promise: m[4], weekOf: m[5], kind: m[6] }));

const WEEKDAY = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
const RRULE_DAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const pad = (n) => String(n).padStart(2, "0");

function dateOfWeekday(weekOf, weekday) {
  const [y, m, d] = weekOf.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  const shift = (WEEKDAY[weekday] - start.getUTCDay() + 7) % 7;
  const out = new Date(start.getTime() + shift * 86_400_000);
  return `${out.getUTCFullYear()}-${pad(out.getUTCMonth() + 1)}-${pad(out.getUTCDate())}`;
}
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

function event({ uid, title, date, start, end, details, location, rrule }) {
  lines.push(
    "BEGIN:VEVENT",
    `UID:${uid}@albert-light`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;TZID=${TZ}:${stamp(date, start)}`,
    `DTEND;TZID=${TZ}:${stamp(date, end)}`,
    ...(rrule ? [`RRULE:${rrule}`] : []),
    `SUMMARY:${esc(title)}`,
    ...(details ? [`DESCRIPTION:${esc(details)}`] : []),
    ...(location ? [`LOCATION:${esc(location)}`] : []),
    "END:VEVENT",
  );
}

const first = entries[0];
const last = entries[entries.length - 1];
event({
  uid: "peer-hour",
  title: TITLE,
  date: dateOfWeekday(first.weekOf, DAY),
  start: START,
  end: END,
  details: DETAILS,
  location: LOCATION,
  rrule: `FREQ=WEEKLY;BYDAY=${RRULE_DAY[WEEKDAY[DAY]]};UNTIL=${dateOfWeekday(last.weekOf, DAY).replaceAll("-", "")}T235959Z`,
});

for (const e of entries.filter((x) => x.kind === "contest")) {
  event({
    uid: e.slug,
    title: `${NAME} — ${e.title}`,
    date: dateOfWeekday(e.weekOf, "Sunday"),
    start: "20:00",
    end: "23:59",
    details: `${e.promise} Submissions close at midnight.`,
  });
}

lines.push("END:VCALENDAR");
// Le format impose CRLF.
await writeFile("public/albert-light.ics", lines.join("\r\n") + "\r\n");
console.log(`albert-light.ics généré — ${lines.filter((l) => l === "BEGIN:VEVENT").length} évènements`);
