/**
 * La mascotte : un petit terminal rond qui cligne des yeux et dont le
 * curseur bat. Dessinée en SVG pur pour rester nette à toute taille et
 * ne peser que quelques centaines d'octets.
 */
export function Mascot({
  size = 160,
  mood = "happy",
  className = "",
}: {
  size?: number;
  mood?: "happy" | "focused" | "party";
  className?: string;
}) {
  const mouth =
    mood === "party"
      ? "M58 92 Q80 116 102 92"
      : mood === "focused"
        ? "M64 98 L96 98"
        : "M62 94 Q80 108 98 94";

  return (
    <svg
      aria-hidden
      className={className}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
    >
      {/* corps */}
      <rect x="18" y="26" width="124" height="110" rx="30" fill="var(--ink)" />
      <rect
        x="18"
        y="26"
        width="124"
        height="110"
        rx="30"
        stroke="#000"
        strokeWidth="4"
        strokeOpacity="0.35"
      />
      {/* barre de titre */}
      <circle cx="40" cy="46" r="5" fill="var(--accent)" />
      <circle cx="56" cy="46" r="5" fill="var(--streak)" />
      <circle cx="72" cy="46" r="5" fill="var(--done)" />
      {/* yeux */}
      <g style={{ transformOrigin: "58px 76px", animation: "blink 4.6s infinite" }}>
        <ellipse cx="58" cy="76" rx="9" ry="10" fill="var(--paper)" />
        <circle cx="60" cy="78" r="4" fill="var(--ink)" />
      </g>
      <g style={{ transformOrigin: "102px 76px", animation: "blink 4.6s 0.15s infinite" }}>
        <ellipse cx="102" cy="76" rx="9" ry="10" fill="var(--paper)" />
        <circle cx="104" cy="78" r="4" fill="var(--ink)" />
      </g>
      {/* bouche */}
      <path d={mouth} stroke="var(--paper)" strokeWidth="5" strokeLinecap="round" />
      {/* curseur qui bat */}
      <rect x="112" y="110" width="12" height="16" rx="2" fill="var(--done)">
        <animate attributeName="opacity" values="1;1;0;0" dur="1.1s" repeatCount="indefinite" />
      </rect>
      {/* pieds */}
      <rect x="44" y="132" width="26" height="12" rx="6" fill="var(--ink)" />
      <rect x="90" y="132" width="26" height="12" rx="6" fill="var(--ink)" />
      {mood === "party" ? (
        <>
          <circle cx="24" cy="18" r="5" fill="var(--xp)" />
          <circle cx="140" cy="24" r="4" fill="var(--streak)" />
          <circle cx="132" cy="8" r="3" fill="var(--accent)" />
        </>
      ) : null}
    </svg>
  );
}
