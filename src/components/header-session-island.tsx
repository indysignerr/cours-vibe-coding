"use client";

import { Flame, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadStats, type Stats } from "@/lib/progress";
import { useAuth } from "@/lib/use-auth";

/** Série, points et bouton Continue. Monté seulement pour un membre connu. */
export function HeaderSessionIsland() {
  const { state } = useAuth();
  const userId = state.status === "ready" ? state.userId : null;
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let alive = true;
    if (!userId) {
      Promise.resolve().then(() => alive && setStats(null));
    } else {
      void loadStats(userId).then((s) => alive && setStats(s));
    }
    return () => { alive = false; };
  }, [userId]);

  if (!userId) {
    return <Link className="btn-3d btn-3d--ink ml-2 min-h-[44px] px-5 text-sm" href="/sessions/">Sign in</Link>;
  }
  const current = stats?.nodes.find((n) => n.state === "current");
  return (
    <>
      <Link href="/sessions/" className="pill pill--streak ml-2 hidden min-w-[4.5rem] justify-center text-base hover:border-ink-line md:inline-flex">
        <Flame aria-hidden className="size-4" /> {stats?.streak ?? "–"}<span className="sr-only"> week streak</span>
      </Link>
      <Link href="/sessions/" className="pill pill--xp hidden min-w-[5rem] justify-center text-base hover:border-ink-line md:inline-flex">
        <Zap aria-hidden className="size-4" /> {stats?.xp ?? "–"}<span className="sr-only"> XP</span>
      </Link>
      <Link className="btn-3d ml-2 min-h-[44px] px-5 text-sm" href={current?.href ?? "/sessions/"}>
        {current ? "Continue" : "My path"}
      </Link>
    </>
  );
}
