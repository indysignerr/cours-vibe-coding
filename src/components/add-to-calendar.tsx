import { googleCalendarUrl } from "@/lib/calendar";
import type { SiteEvent } from "@/lib/events";

/**
 * « Ajouter à Google Agenda » + le fichier .ics pour tous les autres.
 * Deux liens, aucun script : l'export est statique et le doit rester.
 */
export function AddToCalendar({
  event,
  label,
  icsLabel,
}: {
  event: SiteEvent;
  label: string;
  icsLabel: string;
}) {
  return (
    <span className="add-cal">
      <a
        className="btn btn--ghost"
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        data-magnetic
      >
        {label}
      </a>
      <a className="link" href="/albert-light.ics" download>
        {icsLabel}
      </a>
    </span>
  );
}
