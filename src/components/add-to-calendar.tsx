import { googleCalendarUrl, type CalendarEvent } from "@/lib/calendar";

/**
 * « Ajouter à Google Agenda » + le fichier .ics pour tous les autres.
 * Deux liens, aucun script : l'export est statique et le doit rester.
 */
export function AddToCalendar({
  event,
  label = "Add to Google Calendar",
  variant = "ghost",
}: {
  event: CalendarEvent;
  label?: string;
  variant?: "ghost" | "primary" | "brand" | "outline";
}) {
  return (
    <span className="flex flex-wrap items-center gap-3">
      <a
        className={`btn btn--${variant}`}
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </a>
      <a
        className="tap inline-flex items-center text-sm text-muted underline underline-offset-4 transition-colors hover:text-ink"
        href="/albert-light.ics"
        download
      >
        Apple or Outlook (.ics)
      </a>
    </span>
  );
}
