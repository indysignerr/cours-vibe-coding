"use client";

import { useEffect, useState } from "react";
import { EVENTS, readableSpan, type SiteEvent } from "@/lib/events";
import { getSupabase } from "@/lib/supabase/client";

type Row = {
  id: string;
  event_slug: string;
  full_name: string;
  email: string;
  organisation: string | null;
  note: string | null;
  created_at: string;
};

/**
 * La case « join Albert L.I.G.H.T. » du formulaire voyage en tête de la
 * note (voir event-signup.tsx). On la relit ici pour en faire une colonne :
 * c'est l'une des deux façons de devenir membre, elle ne doit pas se
 * perdre au milieu d'un commentaire.
 */
const JOIN = "[JOIN]";
const wantsToJoin = (r: Row) => (r.note ?? "").startsWith(JOIN);
const plainNote = (r: Row) => (r.note ?? "").replace(JOIN, "").trim() || null;

// « Course and year » : c'est la question que pose le formulaire.
const COLUMNS = ["Name", "Email", "Course and year", "Joining", "Note", "Signed up"];

/** Transforme les inscriptions d'un évènement en CSV, pour le badge et le traiteur. */
function toCsv(rows: Row[]) {
  const esc = (v: string | null) => `"${(v ?? "").replaceAll('"', '""')}"`;
  const head = COLUMNS.join(",");
  const body = rows.map((r) =>
    [
      r.full_name,
      r.email,
      r.organisation,
      wantsToJoin(r) ? "yes" : "",
      plainNote(r),
      new Date(r.created_at).toISOString(),
    ]
      .map(esc)
      .join(","),
  );
  return [head, ...body].join("\n");
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function EventBlock({ event, rows }: { event: SiteEvent; rows: Row[] }) {
  const taken = rows.length;
  const joining = rows.filter(wantsToJoin).length;
  // `null` veut dire « pas de jauge », pas « zéro place ».
  const left = event.capacity === null ? null : event.capacity - taken;

  return (
    <section className="mt-14 first:mt-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{event.format}</p>
          <h2 className="display-2 mt-3">{event.title}</h2>
          <p className="tnum mt-2 text-sm text-muted">{readableSpan(event)}</p>
        </div>
        <div className="text-right">
          <p className="tnum text-3xl font-semibold tracking-[-0.02em] text-ink">
            {taken}
            {event.capacity === null ? "" : ` / ${event.capacity}`}
          </p>
          <p className="text-sm text-muted">
            {left === null ? "no cap" : left > 0 ? `${left} left` : "full"}
            {joining > 0 ? ` · ${joining} joining` : ""}
          </p>
        </div>
      </div>

      {taken === 0 ? (
        <p className="card card--sand mt-6 p-5 text-body">Nobody yet.</p>
      ) : (
        <>
          <div className="card mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  {COLUMNS.map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold text-ink">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-ink">{r.full_name}</td>
                    <td className="px-4 py-3 text-body">{r.email}</td>
                    <td className="px-4 py-3 text-body">{r.organisation ?? "—"}</td>
                    <td className="px-4 py-3 text-ink">{wantsToJoin(r) ? "Yes" : "—"}</td>
                    <td className="max-w-[28ch] px-4 py-3 text-muted">{plainNote(r) ?? "—"}</td>
                    <td className="tnum whitespace-nowrap px-4 py-3 text-muted">
                      {new Date(r.created_at).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => download(`${event.slug}.csv`, toCsv(rows))}
            >
              Download the list (CSV)
            </button>
            <a
              className="btn btn--quiet"
              href={`mailto:?bcc=${rows.map((r) => r.email).join(",")}&subject=${encodeURIComponent(event.title)}`}
            >
              Email everyone (bcc)
            </a>
          </div>
        </>
      )}
    </section>
  );
}

/** Le tableau de bord des organisateurs : qui vient, à quoi. */
export function SignupBoard() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { data, error: err } = await getSupabase()
        .from("event_signups")
        .select("id, event_slug, full_name, email, organisation, note, created_at")
        .order("created_at", { ascending: true });
      if (err) {
        setError(
          err.message.includes("does not exist")
            ? "The events tables are not in the database yet. Run supabase/007_events.sql once, then supabase/008_programme.sql."
            : err.message,
        );
        return;
      }
      setRows(data as Row[]);
    })();
  }, []);

  if (error) {
    return (
      <div className="card card--sand p-7">
        <h2 className="display-3">Nothing to show</h2>
        <p className="mt-3 text-body">{error}</p>
      </div>
    );
  }
  if (!rows) return <p className="text-muted">Loading…</p>;

  const total = rows.length;

  return (
    <>
      <p className="lede">
        {total === 0
          ? "No sign-ups yet."
          : `${total} ${total === 1 ? "person has" : "people have"} signed up across all events.`}
      </p>
      {EVENTS.map((e) => (
        <EventBlock key={e.slug} event={e} rows={rows.filter((r) => r.event_slug === e.slug)} />
      ))}
    </>
  );
}
