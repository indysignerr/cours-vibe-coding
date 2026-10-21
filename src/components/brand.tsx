import { SITE } from "@/lib/site";

/**
 * Le pictogramme : ampoule au trait, « L » et rayons en beige.
 * Reproduit en SVG plutôt qu'en image : il hérite des couleurs et reste
 * net à toute taille. Les mêmes tracés vivent dans scripts/brand.mjs,
 * qui produit les fichiers livrés au client et les favicons.
 */
export function BrandMark({
  className = "size-8",
  outline = "var(--ink)",
  glyph = "var(--accent)",
}: {
  className?: string;
  outline?: string;
  glyph?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden focusable="false">
      <g stroke={glyph} strokeWidth="11" strokeLinecap="round">
        <path d="M100 27V9" />
        <path d="M56.2 44.2 43.4 31.4" />
        <path d="M143.8 44.2 156.6 31.4" />
        <path d="M41.7 66.8 24.8 60.6" />
        <path d="M158.3 66.8 175.2 60.6" />
      </g>
      <path
        d="M100 42a46 46 0 0 1 28 82 8 8 0 0 0-3 6v9H75v-9a8 8 0 0 0-3-6 46 46 0 0 1 28-82Z"
        stroke={outline}
        strokeWidth="13"
        strokeLinejoin="round"
      />
      <path d="M88 66v46h28" stroke={glyph} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="72" y="147" width="56" height="13" rx="6.5" fill={outline} />
      <path d="M80 170h40a20 20 0 0 1-40 0Z" fill={outline} />
    </svg>
  );
}

/**
 * Le nom. Les points de L.I.G.H.T. prennent la couleur de marque, comme
 * sur le logo : c'est le seul jeu typographique de l'identité.
 */
export function Wordmark({
  className = "tracking-[0.16em]",
  letters = "text-ink",
  dots = "text-accent",
}: {
  className?: string;
  letters?: string;
  dots?: string;
}) {
  return (
    <span
      className={`whitespace-nowrap font-semibold uppercase ${letters} ${className}`}
      aria-hidden
    >
      Albert L<span className={dots}>.</span>I<span className={dots}>.</span>G
      <span className={dots}>.</span>H<span className={dots}>.</span>T
      <span className={dots}>.</span>
    </span>
  );
}

/** Pictogramme + nom, la lockup utilisée dans l'en-tête et le pied de page. */
export function Logo({
  compact = false,
  onInk = false,
}: {
  compact?: boolean;
  onInk?: boolean;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2.5 overflow-hidden">
      <BrandMark
        className="size-8 shrink-0"
        outline={onInk ? "var(--on-ink)" : "var(--ink)"}
        glyph={onInk ? "var(--brand)" : "var(--accent)"}
      />
      {/* Sous 360 px — plus étroit que n'importe quel téléphone courant — le
          nom serait tronqué en plein milieu. On ne garde que le pictogramme. */}
      <Wordmark
        className="hidden text-[0.8125rem] tracking-[0.1em] min-[360px]:inline sm:text-[0.9375rem] sm:tracking-[0.16em]"
        letters={onInk ? "text-on-ink" : "text-ink"}
        dots={onInk ? "text-brand" : "text-accent"}
      />
      {compact ? null : (
        /*
         * La ville est un repère visuel, pas une partie du nom. Sans
         * aria-hidden le texte accessible du logo devenait
         * « Albert L.I.G.H.T.Milano », d'un seul tenant : le lien porte
         * déjà son libellé, celle-ci n'a donc rien à ajouter.
         */
        <span
          aria-hidden
          className="hidden border-l border-line pl-2.5 text-sm text-muted lg:inline"
        >
          {SITE.campus}
        </span>
      )}
    </span>
  );
}
