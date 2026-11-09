import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { SITE } from "@/lib/site";

/**
 * Le gabarit de base : en-tête, contenu, pied. Une colonne lisible.
 *
 * Volontairement sans dessin : le site est reparti de zéro le
 * 9 novembre 2026, et ce fichier ne porte que la structure et le contenu
 * commun à toutes les pages.
 */
const NAV: [string, string][] = [
  ["/events/", "Events"],
  ["/join/", "Join"],
  ["/about/", "About"],
  ["/contact/", "Contact"],
];

const FOOT: [string, string][] = [
  ["/setup/", "Before you come"],
  [SITE.social.linkedin, "LinkedIn"],
  ["/legal/", "Legal notice"],
  ["/privacy/", "Privacy"],
];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5 text-ink">
            <BrandMark className="size-7 shrink-0" />
            <span className="font-semibold">{SITE.name}</span>
          </Link>
          <nav aria-label="Main">
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {NAV.map(([href, label]) => (
                <li key={href}>
                  <Link
                    className="inline-flex min-h-[44px] items-center text-body hover:text-ink"
                    href={href}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-3xl px-5 py-10 md:py-14">
        {children}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-3xl gap-4 px-5 py-8 text-sm text-muted">
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {FOOT.map(([href, label]) => (
              <li key={href}>
                {href.startsWith("http") ? (
                  <a
                    className="inline-flex min-h-[44px] items-center hover:text-ink"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    className="inline-flex min-h-[44px] items-center hover:text-ink"
                    href={href}
                  >
                    {label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <p>{SITE.legalMention}</p>
          <p>
            {SITE.name} · {SITE.school} {SITE.campus} ·{" "}
            <a className="hover:text-ink" href={`mailto:${SITE.contactEmail}`}>
              {SITE.contactEmail}
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}

/** Le bloc de titre d'une page : surtitre, titre, chapeau. */
export function PageHead({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="mb-10">
      {eyebrow ? <p className="eyebrow eyebrow--accent">{eyebrow}</p> : null}
      <h1 className="mt-3">{title}</h1>
      {lede ? <p className="lede mt-4 max-w-[60ch]">{lede}</p> : null}
    </header>
  );
}
