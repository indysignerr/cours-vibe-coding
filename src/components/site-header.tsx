"use client";

import { Flame, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Mascot } from "@/components/mascot";
import { loadStats, type Stats } from "@/lib/progress";
import { SITE } from "@/lib/site";
import { useAuth } from "@/lib/use-auth";

const LINKS = [
  { href: "/programme/", label: "Path" },
  { href: "/contests/", label: "Contests" },
  { href: "/setup/", label: "Setup" },
];

/**
 * En-tête partagé. Anonyme : les liens et « Sign in ». Connecté : la
 * série, les points et un bouton « Continue » vers la séance en cours.
 */
export function SiteHeader() {
  const { state } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (state.status !== "ready") return setStats(null);
    void loadStats(state.userId).then(setStats);
  }, [state]);

  const current = stats?.nodes.find((n) => n.state === "current");
  const signedIn = state.status === "ready";

  return (
    <header className="mx-auto flex max-w-stage items-center justify-between px-5 py-4 md:px-10 md:py-6">
      <a
        className="tap flex items-center gap-2 whitespace-nowrap font-display text-xl font-extrabold leading-none hover:text-accent-strong sm:text-2xl"
        href="/"
      >
        <Mascot size={34} />
        {SITE.name}
      </a>

      <nav aria-label="Main" className="flex items-center gap-1 text-sm">
        {LINKS.map((l) => (
          <a
            key={l.href}
            className="tap hidden items-center rounded-full px-4 font-bold text-muted hover:bg-sunken hover:text-ink sm:flex"
            href={l.href}
          >
            {l.label}
          </a>
        ))}

        {signedIn && stats ? (
          <>
            <a href="/sessions/" className="pill ml-2 hidden border-streak-line bg-streak text-base md:inline-flex" title="Week streak">
              <Flame aria-hidden className="size-4" /> {stats.streak}
            </a>
            <a href="/sessions/" className="pill hidden border-xp-line bg-xp text-base md:inline-flex" title="XP">
              <Zap aria-hidden className="size-4" /> {stats.xp}
            </a>
            <a className="btn-3d ml-2 min-h-[44px] px-5 text-sm" href={current?.href ?? "/sessions/"}>
              {current ? "Continue" : "My path"}
            </a>
          </>
        ) : (
          <a className="btn-3d btn-3d--ink ml-2 min-h-[44px] px-5 text-sm" href="/sessions/">
            {signedIn ? "My path" : "Sign in"}
          </a>
        )}
      </nav>
    </header>
  );
}
