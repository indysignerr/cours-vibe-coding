"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand";
import { scrollToTop } from "@/components/motion/lenis";
import { SITE } from "@/lib/site";

/**
 * Le logo de l'en-tête.
 *
 * Depuis une autre page, c'est un lien vers l'accueil comme n'importe
 * quel logo. Depuis l'accueil, où le lien ne mènerait nulle part, il
 * remonte au début de page — les deux portes. On reste sur un vrai
 * <Link> pour que le clic du milieu, le ctrl-clic et le survol affichant
 * l'URL continuent de fonctionner ; on n'intercepte que le clic simple.
 */
export function BrandLink() {
  const pathname = usePathname();
  const atHome = pathname === "/";

  return (
    <Link
      className="tap flex items-center"
      href="/"
      aria-label={atHome ? `${SITE.name}, back to top` : `${SITE.name}, home`}
      onClick={(e) => {
        if (!atHome) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        scrollToTop();
      }}
    >
      <Logo />
    </Link>
  );
}
