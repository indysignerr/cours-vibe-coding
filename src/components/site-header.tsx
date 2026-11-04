import Link from "next/link";
import { BrandLink } from "@/components/brand-link";
import { Menu } from "@/components/menu";

const LINKS = [
  { href: "/events/", label: "Events" },
  { href: "/join/", label: "Join" },
  { href: "/about/", label: "About" },
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
        <BrandLink />

        <nav aria-label="Main" className="flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              className="tap hidden items-center rounded-btn px-3 text-sm text-body transition-colors hover:text-ink md:flex"
              href={l.href}
            >
              {l.label}
            </Link>
          ))}
          <Link className="btn btn--primary ml-2 hidden sm:inline-flex" href="/events/">
            Sign up
          </Link>
          <span className="ml-1">
            <Menu />
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
