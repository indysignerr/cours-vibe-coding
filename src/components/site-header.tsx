import Link from "next/link";
import { HeaderSession } from "@/components/header-session";
import { Mascot } from "@/components/mascot";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/programme/", label: "Path" },
  { href: "/contests/", label: "Contests" },
  { href: "/leaderboard/", label: "Board" },
  { href: "/setup/", label: "Setup" },
];

/**
 * En-tête partagé, rendu statique. La partie connectée est un îlot qui ne
 * charge le client Supabase que si une session est mémorisée : un visiteur
 * anonyme ne télécharge jamais supabase-js sur une page publique.
 */
export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-stage items-center justify-between px-5 py-4 md:px-10 md:py-6">
      <Link className="tap flex items-center gap-2 whitespace-nowrap font-display text-xl font-extrabold leading-none hover:text-accent-strong sm:text-2xl" href="/">
        <Mascot size={34} />
        {SITE.name}
      </Link>
      <nav aria-label="Main" className="flex items-center gap-1 text-sm">
        {LINKS.map((l) => (
          <Link key={l.href} className="tap hidden items-center rounded-full px-4 font-bold text-muted hover:bg-sunken hover:text-ink sm:flex" href={l.href}>
            {l.label}
          </Link>
        ))}
        <span className="ml-1 hidden sm:inline-flex"><ThemeToggle compact /></span>
        <HeaderSession />
      </nav>
    </header>
  );
}
