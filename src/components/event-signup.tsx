"use client";

import { useEffect, useId, useRef, useState } from "react";
import { googleCalendarUrl } from "@/lib/calendar";
import { isPast, today, type SiteEvent } from "@/lib/events";
import type { Dict } from "@/lib/i18n";
import { fetchEventCounts, getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Inscription à un événement, depuis le navigateur.
 *
 * Aucun serveur : l'appel part vers la fonction `rsvp` de Supabase, en
 * security definer. Le visiteur n'a aucun droit d'écriture sur la table
 * et aucun droit de lecture sur la liste des inscrits — voir
 * supabase/setup.sql. Le formulaire ne fait que poster.
 *
 * La case « join Albert L.I.G.H.T. » est celle dont parle la page
 * Rejoindre. La fonction `rsvp` n'a pas de paramètre pour elle : cochée,
 * elle ajoute la mention [JOIN] en tête de la note, que le tableau des
 * organisateurs (/admin/) relit pour en faire une colonne. Aucune
 * migration à passer.
 *
 * Le formulaire ne s'affiche que s'il peut aboutir. La page est statique :
 * elle ne sait ni si la base répond, ni si l'événement y a été chargé, ni
 * quel jour on est chez le visiteur. Une sonde le vérifie à l'arrivée, et
 * trois cas remplacent le formulaire par une phrase honnête :
 *   — la base ne répond pas, ou ne connaît pas cet événement → « pas
 *     encore ouvertes », avec le lien pour noter la date ;
 *   — la date est passée depuis le dernier déploiement → « closes ».
 */
export function EventSignup({
  event,
  labels: l,
}: {
  event: SiteEvent;
  labels: Dict["form"];
}) {
  const id = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [join, setJoin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ seatsLeft: number | null } | null>(null);
  // « checking » affiche le formulaire : c'est le cas de loin le plus
  // fréquent, et la page ne doit pas sauter quand tout va bien.
  const [status, setStatus] = useState<"checking" | "on" | "off" | "over">("checking");
  // Vrai dès la première frappe dans le formulaire.
  const touched = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let dead = false;
    void (async () => {
      // Le jour du visiteur, pas celui du build.
      if (isPast(event, today())) {
        if (!dead) setStatus("over");
        return;
      }
      const counts = await fetchEventCounts();
      if (dead) return;
      const reachable = counts?.some((c) => c.event_slug === event.slug) ?? false;
      // Sur un réseau lent la sonde peut répondre tard. Si quelqu'un a déjà
      // commencé à écrire, on ne lui retire pas le formulaire sous les
      // doigts : l'envoi dira lui-même ce qui ne va pas.
      if (!reachable && touched.current) return;
      setStatus(reachable ? "on" : "off");
    })();
    return () => {
      dead = true;
    };
  }, [event]);

  if (status === "over") {
    return (
      <div className="card card--sand p-6" role="status">
        <p>{l.errClosed}</p>
      </div>
    );
  }

  if (!isSupabaseConfigured() || status === "off") {
    return (
      <div className="card card--sand p-6">
        <p>{l.notOn}</p>
        <a
          className="btn btn--ghost mt-5"
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {l.addGoogle}
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card card--sand p-6" role="status">
        <p className="display-3">{l.doneTitle}</p>
        <p className="mt-3">
          {done.seatsLeft === null
            ? l.doneNoCap
            : done.seatsLeft > 0
              ? l.doneLeft.replace("{n}", String(done.seatsLeft))
              : l.doneLast}{" "}
          {l.doneCalendar}
        </p>
        <a
          className="btn btn--primary mt-5"
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {l.addGoogle}
        </a>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fullNote = [join ? "[JOIN]" : "", note].filter(Boolean).join(" ");
    const { data, error: err } = await getSupabase().rpc("rsvp", {
      p_slug: event.slug,
      p_name: name,
      p_email: email,
      p_organisation: organisation || null,
      p_note: fullNote || null,
    });
    setBusy(false);
    if (err) {
      const m = err.message.toLowerCase();
      if (m.includes("full")) return setError(l.errFull);
      if (m.includes("closed") || m.includes("past")) return setError(l.errClosed);
      if (m.includes("unknown")) return setError(l.errUnknown);
      if (m.includes("check") || m.includes("constraint")) return setError(l.errCheck);
      return setError(l.errGeneric);
    }
    const seats = Array.isArray(data)
      ? (data[0] as { seats_left: number | null } | undefined)
      : null;
    setDone({ seatsLeft: seats?.seats_left ?? null });
  }

  return (
    <form
      className="signup"
      onSubmit={submit}
      onInput={() => {
        touched.current = true;
      }}
      noValidate
    >
      <div className="signup__row">
        <div>
          <label className="label" htmlFor={`${id}-name`}>
            {l.name}
          </label>
          <input
            id={`${id}-name`}
            className="field"
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
          <label className="label" htmlFor={`${id}-email`}>
            {l.email}
          </label>
          <input
            id={`${id}-email`}
            className="field"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? true : undefined}
          />
        </div>
      </div>

      {event.audience === "open" ? (
        <div>
          <label className="label" htmlFor={`${id}-org`}>
            {l.org} <span className="label__opt">{l.optional}</span>
          </label>
          <input
            id={`${id}-org`}
            className="field"
            maxLength={120}
            autoComplete="organization"
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
          />
        </div>
      ) : null}

      <div>
        <label className="label" htmlFor={`${id}-note`}>
          {l.note} <span className="label__opt">{l.optional}</span>
        </label>
        <textarea
          id={`${id}-note`}
          className="field"
          maxLength={480}
          rows={3}
          placeholder={
            event.kind === "compete" ? l.notePlaceholderCompete : l.notePlaceholder
          }
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <label className="check" htmlFor={`${id}-join`}>
        <input
          id={`${id}-join`}
          type="checkbox"
          checked={join}
          onChange={(e) => setJoin(e.target.checked)}
        />
        <span>{l.joinBox}</span>
      </label>

      {error ? (
        <p role="alert" className="card card--tint p-4">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className="btn btn--primary" data-magnetic>
        {busy ? l.busy : event.kind === "compete" ? l.submitCompete : l.submit}
      </button>

      <p className="signup__privacy">{l.privacy}</p>
    </form>
  );
}
