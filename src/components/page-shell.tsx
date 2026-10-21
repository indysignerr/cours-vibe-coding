import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/** En-tête, bandeau de titre sur sable, contenu sur ivoire, pied de page. */
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
      <main id="main">
        <div className="border-b border-line bg-sunken">
          <div className="mx-auto max-w-stage px-5 pb-14 pt-14 md:px-8 md:pb-20 md:pt-20">
            {eyebrow ? <p className="eyebrow eyebrow--accent rise">{eyebrow}</p> : null}
            <h1 className="display-1 rise mt-4 max-w-[20ch] [animation-delay:60ms]">{title}</h1>
            {lede ? (
              <p className="lede rise mt-6 max-w-measure [animation-delay:120ms]">{lede}</p>
            ) : null}
          </div>
        </div>
        <div className="mx-auto max-w-stage px-5 py-14 md:px-8 md:py-20">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
