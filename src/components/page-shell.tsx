import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/** En-tête, titre, contenu, pied de page. Utilisé par toutes les pages sauf l'accueil. */
export function PageShell({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-stage px-6 pb-8 pt-10 md:px-10 md:pt-16">
        {eyebrow ? (
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-accent-strong">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-[24ch] font-display text-display-lg">{title}</h1>
        {lede ? <p className="mt-6 max-w-measure text-project text-muted">{lede}</p> : null}
        <div className="mt-14 md:mt-20">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
