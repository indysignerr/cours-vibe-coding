import { Award, Flame, Zap } from "lucide-react";

/** Les trois compteurs du joueur : série, points, badges. */
export function StatPills({ streak, xp, badges }: { streak: number; xp: number; badges: number }) {
  return (
    <ul className="flex flex-wrap gap-3">
      <li className="pill border-streak-line bg-streak anim-pop">
        <Flame aria-hidden className="size-5" />
        <span className="text-lg">{streak}</span>
        <span className="text-sm font-bold">week streak</span>
      </li>
      <li className="pill border-xp-line bg-xp anim-pop [animation-delay:80ms]">
        <Zap aria-hidden className="size-5" />
        <span className="text-lg">{xp}</span>
        <span className="text-sm font-bold">XP</span>
      </li>
      <li className="pill border-done-line bg-done anim-pop [animation-delay:160ms]">
        <Award aria-hidden className="size-5" />
        <span className="text-lg">{badges}</span>
        <span className="text-sm font-bold">badges</span>
      </li>
    </ul>
  );
}
