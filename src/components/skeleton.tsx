/** Squelette de chargement : des barres qui respirent, à la place de « Loading… ». */
export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-busy aria-live="polite" className="grid gap-3">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-2xl border-2 border-line bg-sunken"
          style={{ width: `${100 - (i % 3) * 8}%`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  );
}
