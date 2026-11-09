import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/site";

/**
 * La scène.
 *
 * Chaque page est UN écran, composé — pas une colonne de sections qu'on
 * déroule. L'en-tête en haut, la scène qui prend toute la hauteur
 * restante, un pied d'une ligne. Ce qui dépasse l'écran défile, mais
 * rien n'est dessiné pour être découvert au défilement : à taille
 * normale, tout est là.
 *
 * C'est la réponse à « c'est redondant » : l'ancien gabarit — surtitre,
 * grand titre, chapeau, puis des sections empilées — était le même sur
 * huit pages, et l'accueil répétait trois fois le même geste. Ici
 * chaque page a sa propre composition et le gabarit n'impose que la
 * hauteur.
 */
export function Stage({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="page">
      <SiteHeader />
      <main id="main" className={`stage ${className}`.trim()}>
        {children}
      </main>
      <SceneFoot />
    </div>
  );
}

/**
 * Le bloc de titre des pages qui en ont un. Décalé, jamais centré, et
 * tenu court : le titre est la page, pas son introduction.
 */
export function StageHead({
  eyebrow,
  title,
  lede,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  className?: string;
}) {
  return (
    <header className={`stage__head ${className}`.trim()}>
      {eyebrow ? (
        <p className="eyebrow eyebrow--accent rise">{eyebrow}</p>
      ) : null}
      <h1 className="display-1 rise mt-4 max-w-[16ch] [animation-delay:80ms]">
        {title}
      </h1>
      {lede ? (
        <p className="lede rise mt-5 max-w-measure [animation-delay:160ms]">
          {lede}
        </p>
      ) : null}
    </header>
  );
}

const FOOT_LINKS: [string, string][] = [
  ["/setup/", "Before you come"],
  [SITE.social.linkedin, "LinkedIn"],
  ["/legal/", "Legal"],
  ["/privacy/", "Privacy"],
];

/**
 * Le pied : une ligne. L'ancien pied de page à quatre colonnes répétait
 * la navigation, le logo et la mention légale sur chaque page — pour un
 * site de huit pages, c'était une neuvième page en bas de chacune.
 */
export function SceneFoot() {
  return (
    <footer className="foot">
      <p className="foot__who">
        {SITE.name} · {SITE.school} {SITE.campus} · Free events
      </p>
      <ul className="foot__links">
        {FOOT_LINKS.map(([href, label]) => (
          <li key={href}>
            {href.startsWith("http") ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ) : (
              <Link href={href}>{label}</Link>
            )}
          </li>
        ))}
      </ul>
    </footer>
  );
}
