"use client";

import { useId, useState } from "react";
import { googleCalendarUrl } from "@/lib/calendar";
import { EVENT_KINDS, type SiteEvent } from "@/lib/events";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";

/**
 * Inscription à un évènement, depuis le navigateur.
 *
 * Aucun serveur : l'appel part vers la fonction `rsvp` de Supabase, en
 * security definer. Le visiteur n'a aucun droit d'écriture sur la table
 * et aucun droit de lecture sur la liste des inscrits — voir
 * supabase/006_events.sql. Le formulaire ne fait que poster.
 */
export function EventSignup({ event }: { event: SiteEvent }) {
  const id = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ seatsLeft: number | null } | null>(null);

  if (!isSupabaseConfigured()) {
    return (
      <div className="card card--sand p-6">
        <p className="text-body">
          Sign-ups are not switched on yet. The date is firm — add it to your calendar and we will
          open the list a fortnight before the {EVENT_KINDS[event.kind].label.toLowerCase()}.
        </p>
        <a
          className="btn btn--ghost mt-5"
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Add to Google Calendar
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card card--sand p-6" role="status">
        <p className="display-3">You are on the list.</p>
        <p className="mt-3 text-body">
          {done.seatsLeft === null
            ? "No cap on this one. See you there."
            : done.seatsLeft > 0
              ? `${done.seatsLeft} ${done.seatsLeft === 1 ? "place" : "places"} left after yours.`
              : "That was the last place."}{" "}
          Put it in your calendar so you do not have to remember it.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            className="btn btn--brand"
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Add to Google Calendar
          </a>
          <a
            className="tap inline-flex items-center text-sm text-muted underline underline-offset-4 hover:text-ink"
            href="/albert-light.ics"
            download
          >
            Apple or Outlook (.ics)
          </a>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error: err } = await getSupabase().rpc("rsvp", {
      p_slug: event.slug,
      p_name: name,
      p_email: email,
      p_organisation: organisation || null,
      p_note: note || null,
    });
    setBusy(false);
    if (err) {
      const m = err.message.toLowerCase();
      if (m.includes("full")) return setError("This one is full. Write to us and we will tell you when the next date opens.");
      if (m.includes("closed") || m.includes("past")) return setError("Sign-ups for this date are closed.");
      if (m.includes("unknown")) return setError("Sign-ups are not open yet for this date.");
      if (m.includes("check") || m.includes("constraint")) return setError("Check the name and the email, one of the two was not accepted.");
      return setError("That did not go through. Try again in a moment, or write to us.");
    }
    const seats = Array.isArray(data) ? (data[0] as { seats_left: number | null } | undefined) : null;
    setDone({ seatsLeft: seats?.seats_left ?? null });
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor={`${id}-name`}>
            Full name
          </label>
          <input
            id={`${id}-name`}
            className="field mt-2"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={error ? true : undefined}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor={`${id}-email`}>
            Email
          </label>
          <input
            id={`${id}-email`}
            className="field mt-2"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? true : undefined}
          />
        </div>
      </div>

      {event.kind === "company" || event.kind === "talk" ? (
        <>
          <label className="mt-5 block text-sm font-medium text-ink" htmlFor={`${id}-org`}>
            Company <span className="font-normal text-muted">Optional — leave empty if you are a student</span>
          </label>
          <input
            id={`${id}-org`}
            className="field mt-2"
            maxLength={120}
            autoComplete="organization"
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
          />
        </>
      ) : null}

      <label className="mt-5 block text-sm font-medium text-ink" htmlFor={`${id}-note`}>
        Anything we should know? <span className="font-normal text-muted">Optional</span>
      </label>
      <textarea
        id={`${id}-note`}
        className="field mt-2 min-h-[5.5rem]"
        maxLength={500}
        rows={3}
        placeholder={event.kind === "hackathon" ? "Who you are coming with, or that you need a team." : "What you want to get out of it."}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {error ? (
        <p role="alert" className="card card--tint mt-5 p-4 text-ink">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className="btn btn--primary mt-6 disabled:opacity-55">
        {busy ? "One moment…" : event.kind === "hackathon" ? "Count me in" : "Sign me up"}
      </button>

      <p className="mt-4 max-w-measure text-sm text-muted">
        We keep your name and email to know who is coming, and we delete the list a month after the
        event. We never pass it on. Write to us and we remove you the same day.
      </p>
    </form>
  );
}
