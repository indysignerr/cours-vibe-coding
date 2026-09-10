import { Check, Lock, Trophy } from "lucide-react";
import Link from "next/link";
import { ProgressRing } from "@/components/progress-ring";
import type { PathNode } from "@/lib/types";

export type { NodeState, PathNode } from "@/lib/types";

const WEEK = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Europe/Paris" });
const STATE_LABEL = { done: "Completed", current: "Next up", open: "Available", locked: "Locked, opens on the day" } as const;

function nodeClasses(n: PathNode) {
  if (n.state === "done") return "border-done-line bg-done fill-text";
  // L'étape en cours porte un anneau de repère fixe en plus de la pulsation :
  // sans mouvement, elle reste distinguable.
  if (n.state === "current") return "anim-pulse border-accent-line bg-accent fill-text ring-4 ring-accent-line ring-offset-4 ring-offset-paper";
  if (n.state === "open") return n.kind === "contest" ? "border-xp-line bg-xp fill-text" : "border-accent-line bg-accent fill-text";
  return "border-line bg-surface text-muted";
}

/**
 * Le chemin de séances. Purement présentationnel : chaque page lui donne
 * ses nœuds déjà calculés, avec leur état et leur progression.
 */
export function Path({ nodes }: { nodes: PathNode[] }) {
  return (
    <ol className="relative mx-auto max-w-3xl py-4">
      <span
        aria-hidden
        className="absolute left-[52px] top-0 h-full w-1.5 -translate-x-1/2 rounded-full bg-[repeating-linear-gradient(to_bottom,var(--line)_0_10px,transparent_10px_20px)] md:left-1/2"
      />

      {nodes.map((n, i) => {
        const left = i % 2 === 0;
        const tone = n.state === "done" ? "done" : n.kind === "contest" ? "xp" : "accent";
        const interactive = n.href && n.state !== "locked";
        const number = String(n.number).padStart(2, "0");

        const bubble = (
          <ProgressRing value={n.progress} size={104} stroke={10} tone={tone} label={`${Math.round(n.progress * 100)}% of the checklist`}>
            <span
              className={`grid size-[76px] place-items-center rounded-full border-[3px] font-display text-2xl font-extrabold transition-transform duration-200 ease-swift ${nodeClasses(n)} ${
                interactive ? "group-hover:scale-105 group-active:scale-95" : ""
              }`}
            >
              {n.state === "done" ? <Check aria-hidden className="size-8" strokeWidth={3} />
                : n.state === "locked" ? <Lock aria-hidden className="size-6" />
                : n.kind === "contest" ? <Trophy aria-hidden className="size-8" />
                : number}
            </span>
          </ProgressRing>
        );

        const label = (
          <div className={left ? "text-left md:text-right" : "text-left"}>
            <p className="eyebrow text-muted">
              {n.kind === "contest" ? "Contest" : `Step ${number}`} · {WEEK.format(new Date(`${n.weekOf}T12:00:00`))}
              {n.state === "current" ? <span className="ml-2 rounded-full bg-accent px-2 py-0.5 fill-text">Next up</span> : null}
            </p>
            <p className="mt-1 font-display text-xl font-extrabold leading-tight">{n.title}</p>
            <p className="mt-1 text-muted">{n.state === "locked" ? "Opens on the day of the session." : n.promise}</p>
          </div>
        );

        const row = (
          <div className="grid grid-cols-[auto_1fr] items-center gap-4 py-4 md:grid-cols-[1fr_auto_1fr] md:gap-6">
            <div className="hidden justify-end md:flex">{left ? label : null}</div>
            <div className="relative z-10">
              <span className="sr-only">{STATE_LABEL[n.state]}. </span>
              {bubble}
            </div>
            <div className="flex justify-start">
              <div className={left ? "md:hidden" : ""}>{label}</div>
            </div>
          </div>
        );

        return (
          <li key={n.slug} className="anim-pop" style={{ animationDelay: `${i * 60}ms` }}>
            {interactive ? (
              <Link className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-line" href={n.href!}>
                {row}
              </Link>
            ) : (
              <div className={n.state === "locked" ? "opacity-70" : ""}>{row}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
