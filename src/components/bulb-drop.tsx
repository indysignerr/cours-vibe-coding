/**
 * L'ampoule qui vient prendre la place du I.
 *
 * L'hommage est assumé : chez Pixar, la lampe traverse l'écran en
 * sautillant et écrase le I de PIXAR. Ici le logo EST une ampoule et le
 * nom EST LIGHT — la lettre à remplacer s'imposait.
 *
 * Tout est en CSS. Une animation d'ouverture qui joue une fois n'a pas
 * besoin d'une bibliothèque, et surtout pas d'un écouteur de défilement :
 * elle ne doit rien coûter une fois finie.
 *
 * Les déformations suivent la règle du dessin animé — on s'étire en
 * tombant, on s'écrase en touchant — sans quoi le mouvement paraît
 * mécanique.
 */
export function BulbDrop() {
  return (
    <span aria-hidden className="bulb">
      <span className="bulb__shadow" />
      <span className="bulb__body">
        <svg viewBox="0 0 200 200" fill="none" className="bulb__svg">
          {/* Les rayons : éteints au départ, ils jaillissent à l'allumage. */}
          <g
            className="bulb__rays"
            stroke="var(--brand)"
            strokeWidth="11"
            strokeLinecap="round"
          >
            <path d="M100 27V9" />
            <path d="M56.2 44.2 43.4 31.4" />
            <path d="M143.8 44.2 156.6 31.4" />
            <path d="M41.7 66.8 24.8 60.6" />
            <path d="M158.3 66.8 175.2 60.6" />
          </g>

          {/* Le halo, dans le verre. */}
          <circle
            className="bulb__glow"
            cx="100"
            cy="92"
            r="40"
            fill="var(--brand)"
          />

          <path
            d="M100 42a46 46 0 0 1 28 82 8 8 0 0 0-3 6v9H75v-9a8 8 0 0 0-3-6 46 46 0 0 1 28-82Z"
            stroke="var(--ink)"
            strokeWidth="13"
            strokeLinejoin="round"
          />
          {/* Le filament en forme de L : il s'allume avant le reste. */}
          <path
            className="bulb__filament"
            d="M88 66v46h28"
            stroke="var(--brand)"
            strokeWidth="13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="72"
            y="147"
            width="56"
            height="13"
            rx="6.5"
            fill="var(--ink)"
          />
          <path d="M80 170h40a20 20 0 0 1-40 0Z" fill="var(--ink)" />
        </svg>
      </span>
    </span>
  );
}
