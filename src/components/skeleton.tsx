/** Squelette de chargement : des barres qui respirent, à la place de « Loading… ». */
export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-busy aria-live="polite" className="skel">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="skel__bar"
          style={{ width: `${100 - (i % 3) * 8}%`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  );
}
