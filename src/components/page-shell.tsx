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
      <main id="main" className="mx-auto max-w-stage px-5 pb-8 pt-8 md:px-10 md:pt-14">
        {eyebrow ? (
          <p className="anim-pop mb-4 inline-block rounded-full bg-sunken px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.15em] text-accent-strong">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="anim-pop max-w-[22ch] font-display text-display-lg font-extrabold [animation-delay:60ms]">
          {title}
        </h1>
        {lede ? (
          <p className="anim-pop mt-5 max-w-measure text-project text-muted [animation-delay:120ms]">
            {lede}
          </p>
        ) : null}
        <div className="mt-12 md:mt-16">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
