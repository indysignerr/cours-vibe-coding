import { SITE } from "@/lib/site";

/**
 * Marque typographique. Pas de mascotte, pas d'icône : un carré d'encre
 * et le nom. Le « AI » est accentué, c'est le seul jeu visuel du logo.
 */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="grid size-7 place-items-center rounded-[6px] bg-ink font-mono text-[11px] font-medium text-on-ink"
      >
        Ai
      </span>
      <span className="font-display text-[1.3rem] font-normal leading-none tracking-[-0.02em] text-ink">
        {SITE.name}
      </span>
      {compact ? null : (
        <span className="hidden border-l border-line pl-2.5 text-xs text-muted lg:inline">
          {SITE.campus}
        </span>
      )}
    </span>
  );
}
