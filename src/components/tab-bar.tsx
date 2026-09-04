"use client";

import { Map, Send, Trophy, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

const TABS = [
  { href: "/sessions/", label: "Path", icon: Map },
  { href: "/contests/", label: "Contests", icon: Trophy },
  { href: "/leaderboard/", label: "Board", icon: Send },
  { href: "/me/", label: "Me", icon: UserRound },
];

/** Barre d'onglets mobile, cachée dès 640 px où le menu de l'en-tête suffit. */
export function TabBar() {
  const [path, setPath] = useState("");
  useEffect(() => setPath(window.location.pathname), []);

  return (
    <nav
      aria-label="Quick"
      className="projector-hide fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-3xl border-2 border-line bg-surface p-1 shadow-lift sm:hidden"
    >
      {TABS.map((t) => {
        const active = path.startsWith(t.href);
        return (
          <a
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`tap flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-bold ${
              active ? "bg-accent text-accent-ink" : "text-muted"
            }`}
          >
            <t.icon aria-hidden className="size-5" />
            {t.label}
          </a>
        );
      })}
    </nav>
  );
}
