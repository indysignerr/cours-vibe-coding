/**
 * L'ampoule, en un seul tracé réutilisable.
 *
 * Les rayons et le filament sortent par des classes pour qu'une
 * chronologie puisse les allumer séparément du verre : c'est ce qui
 * fait la différence entre « une ampoule qui apparaît » et « une
 * ampoule qui s'allume ».
 */
export function BulbMark({
  className = "",
  raysClassName = "",
  filamentClassName = "",
  outline = "var(--ink)",
  glyph = "var(--brand)",
}: {
  className?: string;
  raysClassName?: string;
  filamentClassName?: string;
  outline?: string;
  glyph?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden
      focusable="false"
    >
      <g
        className={raysClassName}
        stroke={glyph}
        strokeWidth="11"
        strokeLinecap="round"
      >
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
      <path
        className={filamentClassName}
        d="M88 66v46h28"
        stroke={glyph}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="72" y="147" width="56" height="13" rx="6.5" fill={outline} />
      <path d="M80 170h40a20 20 0 0 1-40 0Z" fill={outline} />
    </svg>
  );
}
