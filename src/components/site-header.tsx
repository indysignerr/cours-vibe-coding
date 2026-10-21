import Link from "next/link";
import { HeaderSession } from "@/components/header-session";
import { Logo } from "@/components/brand";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/solutions/", label: "Solutions" },
  { href: "/approach/", label: "Approach" },
  { href: "/about/", label: "About" },
  { href: "/join/", label: "Join us", quiet: true },
];

/**
 * En-tête sobre. Quatre liens au plus, une seule action primaire.
 * Le volet étudiant est volontairement discret : le visiteur par défaut
 * est une entreprise.
 *
 * Sous 768 px les liens passent dans une deuxième rangée défilante plutôt
 * que derrière un menu : pas de JavaScript, et rien d'inatteignable.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/88 backdrop-blur-md">
      <div className="mx-auto flex max-w-stage items-center justify-between px-5 py-3 md:px-8">
        <Link className="tap flex items-center" href="/" aria-label={`${SITE.name}, home`}>
          <Logo />
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              className={`tap hidden items-center rounded-btn px-3 text-sm transition-colors hover:text-ink md:flex ${
                l.quiet ? "text-muted lg:flex" : "text-body"
              }`}
              href={l.href}
            >
              {l.label}
            </Link>
          ))}
          <span className="ml-2 flex items-center gap-2">
            <Link className="btn btn--ghost hidden sm:inline-flex" href="/contact/">
              Contact
            </Link>
            <HeaderSession />
          </span>
        </nav>
      </div>

      {/* Rangée mobile : les mêmes liens, atteignables au pouce */}
      <nav
        aria-label="Sections"
        className="no-scrollbar flex gap-1 overflow-x-auto border-t border-line px-3 md:hidden"
      >
        {[...LINKS, { href: "/contact/", label: "Contact" }].map((l) => (
          <Link
            key={l.href}
            className="tap flex flex-none items-center px-3 text-sm text-body transition-colors hover:text-ink"
            href={l.href}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
