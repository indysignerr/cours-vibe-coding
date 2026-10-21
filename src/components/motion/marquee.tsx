"use client";

/**
 * Bandeau défilant, en CSS pur : deux copies du contenu qui se suivent.
 * Pas de JavaScript, donc rien à nettoyer et rien à recalculer au redimensionnement.
 */
export function Marquee({
  items,
  speed = 38,
  reverse = false,
  className = "",
}: {
  items: string[];
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const track = (
    <ul
      aria-hidden
      className="flex shrink-0 items-center gap-10 px-5 motion-reduce:animate-none"
      style={{
        animation: `marquee ${speed}s linear infinite`,
        animationDirection: reverse ? "reverse" : "normal",
      }}
    >
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="flex shrink-0 items-center gap-10">
          <span className="whitespace-nowrap">{item}</span>
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`marquee relative flex overflow-hidden ${className}`}>
      {track}
      {track}
    </div>
  );
}
