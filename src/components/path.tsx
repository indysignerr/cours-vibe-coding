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

/** Décalage horizontal qui fait serpenter le chemin. */
const OFFSETS = [0, 48, 72, 48, 0, -48, -72, -48];

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
    <ol className="relative mx-auto max-w-2xl py-4">
      {/* la ligne pointillée derrière les nœuds */}
      <span
        aria-hidden
        className="absolute left-1/2 top-0 h-full w-1.5 -translate-x-1/2 rounded-full bg-[repeating-linear-gradient(to_bottom,var(--line)_0_10px,transparent_10px_20px)]"
      />

      {nodes.map((n, i) => {
        const offset = OFFSETS[i % OFFSETS.length];
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
          <div className={`max-w-[18ch] sm:max-w-[24ch] ${offset >= 0 ? "text-left" : "text-right"}`}>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
              {n.kind === "contest" ? "Contest" : `Step ${String(n.number).padStart(2, "0")}`} · {WEEK.format(new Date(n.weekOf))}
            </p>
            <p className="mt-1 font-display text-xl font-extrabold leading-tight">{n.title}</p>
            <p className="mt-1 text-sm text-muted">
              {n.state === "locked" ? "Opens on the day of the session." : n.promise}
            </p>
          </div>
        );

        const row = (
          <div
            className={`relative flex items-center gap-4 py-5 translate-x-[calc(var(--off)*0.2)] md:gap-5 md:translate-x-[var(--off)] ${offset >= 0 ? "flex-row" : "flex-row-reverse"}`}
            style={{ "--off": `${offset}px` } as React.CSSProperties}
          >
            <span className="sr-only">{n.state}</span>
            {bubble}
            {label}
          </div>
        );

        return (
          <li
            key={n.slug}
            className="anim-pop flex justify-center"
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
