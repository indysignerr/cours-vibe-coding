import { BrandMark } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * En-tête, bandeau de titre, contenu, pied de page.
 *
 * Le bandeau est volontairement décalé et non centré, et le pictogramme
 * sort dans la marge : huit pages construites sur le même conteneur
 * centré donnaient exactement l'impression de gabarit qu'on cherche à
 * éviter.
 */
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
        <div className="relative overflow-hidden border-b border-line bg-sunken">
          <BrandMark
            className="pointer-events-none absolute -right-16 top-0 size-[22rem] opacity-[0.05] md:right-8 md:size-[26rem]"
            outline="var(--ink)"
            glyph="var(--brand)"
          />
          <div className="relative mx-auto max-w-stage px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
            <div className="md:pl-[6%]">
              {eyebrow ? <p className="eyebrow eyebrow--accent rise">{eyebrow}</p> : null}
              <h1 className="display-1 rise mt-5 max-w-[17ch] [animation-delay:60ms]">{title}</h1>
              {lede ? (
                <p className="lede rise mt-7 max-w-measure [animation-delay:120ms]">{lede}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-stage px-5 py-16 md:px-8 md:py-24">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
