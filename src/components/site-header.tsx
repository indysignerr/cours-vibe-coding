import Link from "next/link";
import { Logo } from "@/components/brand";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/work/", label: "Work" },
  { href: "/solutions/", label: "Solutions" },
  { href: "/approach/", label: "Approach" },
  { href: "/events/", label: "Events" },
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
        <Link className="tap flex items-center" href="/" aria-label={`${SITE.name}, home`}>
          <Logo />
        </Link>

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
          <Link className="btn btn--primary ml-2" href="/contact/">
            Contact
          </Link>
        </nav>
      </div>

      {/* Rangée mobile : les mêmes liens, atteignables au pouce */}
      <nav
        aria-label="Sections"
        className="no-scrollbar flex gap-1 overflow-x-auto border-t border-line px-3 md:hidden"
      >
        {[...LINKS, { href: "/join/", label: "Join us" }].map((l) => (
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
