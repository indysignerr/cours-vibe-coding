import Link from "next/link";
import { SITE } from "@/lib/site";

/** Jours restants avant la séance 1, calculés en heure de Paris. */
function daysUntilStart(): number {
  const start = new Date(`${SITE.startsWeekOf}T00:00:00+02:00`);
  return Math.ceil((start.getTime() - Date.now()) / 86_400_000);
}

/**
 * Bandeau visible tant que la séance 1 n'a pas eu lieu. Rendu dès le serveur
 * pour ne pas décaler la page après l'hydratation ; le chiffre peut différer
 * d'un jour entre le build et l'affichage, d'où le suppressHydrationWarning.
 */
export function Countdown({ compact = false }: { compact?: boolean }) {
  const days = daysUntilStart();
  if (days <= 0) return null;

  return (
    <div className={`card-3d card-3d--streak anim-pop flex flex-wrap items-center gap-5 ${compact ? "p-5" : "p-6 md:p-7"}`}>
      <div className="min-w-[12rem] flex-1">
        <p className="eyebrow">Step 01 opens in</p>
        <p className="font-display text-display-md font-extrabold leading-none" suppressHydrationWarning>
          {days} {days === 1 ? "day" : "days"}
        </p>
        <p className="mt-1 font-bold">Use them for the setup, so the first hour is all building.</p>
      </div>
      <Link className="btn-3d btn-3d--ink w-full sm:w-auto" href="/setup/">Setup</Link>
    </div>
  );
}
