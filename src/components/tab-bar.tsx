"use client";

import { Map, Medal, Trophy, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/sessions/", label: "My path", icon: Map },
  { href: "/contests/", label: "Contests", icon: Trophy },
  { href: "/leaderboard/", label: "Board", icon: Medal },
  { href: "/me/", label: "Me", icon: UserRound },
];

/** Barre d'onglets mobile, cachée dès 640 px où le menu de l'en-tête suffit. */
export function TabBar() {
  const path = usePathname() ?? "";
  return (
    <nav
      aria-label="Quick"
      className="projector-hide fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-3xl border-2 border-line bg-surface p-1 shadow-lift sm:hidden"
    >
      {TABS.map((t) => {
        const active = path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`tap flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-xs font-bold transition active:scale-95 ${
              active ? "bg-accent fill-text" : "text-muted hover:bg-sunken hover:text-ink"
            }`}
          >
            <t.icon aria-hidden className="size-5" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
