"use client";

import { useEffect, useState } from "react";
import { Mascot } from "@/components/mascot";
import { SITE } from "@/lib/site";

/** Bandeau visible tant que la séance 1 n'a pas eu lieu. */
export function Countdown({ compact = false }: { compact?: boolean }) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const start = new Date(`${SITE.startsWeekOf}T00:00:00`);
    const diff = Math.ceil((start.getTime() - Date.now()) / 86_400_000);
    setDays(diff);
  }, []);

  if (days === null || days <= 0) return null;

  return (
    <div className={`card-3d card-3d--streak anim-pop flex items-center gap-5 ${compact ? "p-5" : "p-6 md:p-7"}`}>
      {compact ? null : <Mascot size={72} mood="focused" className="anim-float shrink-0" />}
      <div className="flex-1">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.15em]">Step 01 opens in</p>
        <p className="font-display text-display-md font-extrabold leading-none">
          {days} {days === 1 ? "day" : "days"}
        </p>
        <p className="mt-1 font-medium">Use them for the setup, so the first hour is all building.</p>
      </div>
      <a className="btn-3d btn-3d--ink shrink-0" href="/setup/">Setup</a>
    </div>
  );
}
