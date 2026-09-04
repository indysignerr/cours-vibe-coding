import { Check, Lock, Trophy } from "lucide-react";
import { ProgressRing } from "@/components/progress-ring";

export type NodeState = "done" | "current" | "open" | "locked";

export type PathNode = {
  number: number;
  slug: string;
  title: string;
  promise: string;
  weekOf: string;
  kind: "lesson" | "contest";
  state: NodeState;
  progress: number; // 0 à 1
  href?: string;
};

const WEEK = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

function nodeClasses(n: PathNode) {
  if (n.state === "done") return "border-done-line bg-done";
  if (n.state === "current") return "anim-pulse border-accent-line bg-accent";
  if (n.state === "open") return n.kind === "contest" ? "border-xp-line bg-xp" : "border-accent-line bg-accent";
  return "border-line bg-surface text-muted";
}

/**
 * Le chemin de séances. Purement présentationnel : chaque page lui donne
 * ses nœuds déjà calculés, avec leur état et leur progression.
 */
export function Path({ nodes }: { nodes: PathNode[] }) {
  return (
    <ol className="relative mx-auto max-w-3xl py-4">
      {/* la ligne pointillée derrière les nœuds */}
      <span
        aria-hidden
        className="absolute left-[52px] top-0 h-full w-1.5 -translate-x-1/2 rounded-full bg-[repeating-linear-gradient(to_bottom,var(--line)_0_10px,transparent_10px_20px)] md:left-1/2"
      />

      {nodes.map((n, i) => {
        const left = i % 2 === 0; // étiquette à gauche pour les pairs, à droite pour les impairs
        const tone = n.state === "done" ? "done" : n.kind === "contest" ? "xp" : "accent";
        const interactive = n.href && n.state !== "locked";

        const bubble = (
          <ProgressRing value={n.progress} size={104} stroke={10} tone={tone}>
            <span
              className={`grid size-[76px] place-items-center rounded-full border-[3px] font-display text-2xl font-extrabold transition-transform duration-200 ease-swift ${nodeClasses(n)} ${
                interactive ? "group-hover:scale-105 group-active:scale-95" : ""
              }`}
            >
              {n.state === "done" ? (
                <Check aria-hidden className="size-8" strokeWidth={3} />
              ) : n.state === "locked" ? (
                <Lock aria-hidden className="size-6" />
              ) : n.kind === "contest" ? (
                <Trophy aria-hidden className="size-8" />
              ) : (
                String(n.number).padStart(2, "0")
              )}
            </span>
          </ProgressRing>
        );

        const label = (
          <div className={left ? "text-left md:text-right" : "text-left"}>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
              {n.kind === "contest" ? "Contest" : `Step ${String(n.number).padStart(2, "0")}`} · {WEEK.format(new Date(n.weekOf))}
            </p>
            <p className="mt-1 font-display text-xl font-extrabold leading-tight">{n.title}</p>
            <p className="mt-1 text-sm text-muted">
              {n.state === "locked" ? "Opens on the day of the session." : n.promise}
            </p>
          </div>
        );

        // Trois colonnes : étiquette | anneau | étiquette. L'anneau est
        // toujours au centre, exactement sur le rail, et l'étiquette occupe
        // la colonne opposée. Les pointillés ne passent jamais sous du texte.
        const row = (
          <div className="grid grid-cols-[auto_1fr] items-center gap-4 py-4 md:grid-cols-[1fr_auto_1fr] md:gap-6">
            <div className="hidden justify-end md:flex">{left ? label : null}</div>
            <div className="relative z-10">
              <span className="sr-only">{n.state}</span>
              {bubble}
            </div>
            <div className="flex justify-start">
              {/* mobile : toujours à droite ; desktop : seulement pour les impairs */}
              <div className={left ? "md:hidden" : ""}>{label}</div>
              {left ? <div className="hidden md:block">{null}</div> : null}
            </div>
          </div>
        );

        return (
          <li
            key={n.slug}
            className="anim-pop"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {interactive ? (
              <a className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-line" href={n.href}>
                {row}
              </a>
            ) : (
              <div aria-disabled={n.state === "locked"} className={n.state === "locked" ? "opacity-70" : ""}>
                {row}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
