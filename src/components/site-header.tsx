import Link from "next/link";
import { BrandMark, BrandWordmark } from "@/components/brand";
import { LangSwitch } from "@/components/lang-switch";
import { href, t, type Locale, type PageRef, type RouteKey } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/**
 * L'en-tête : une barre marine pleine, fixe, la même sur toutes les pages.
 *
 * Le logo y est sur le fond pour lequel le bureau l'a dessiné. La barre
 * ne change pas de peau en traversant la page : il faudrait du JavaScript
 * pour ne rien dire de plus.
 *
 * Sous 1000 px la navigation passe dans un <details> : pas de script, le
 * clavier et le lecteur d'écran viennent avec.
 */
const NAV: RouteKey[] = ["about", "programme", "team", "faq"];

export function SiteHeader({
  lang,
  page,
}: {
  lang: Locale;
  /** La page courante, ou null pour les pages qui n'existent qu'en anglais. */
  page: PageRef | null;
}) {
  const d = t(lang);
  const current = typeof page === "string" ? page : page ? "programme" : null;

  const links = NAV.map((key) => (
    <li key={key}>
      <Link
        className="nav__link"
        href={href(key, lang)}
        aria-current={current === key ? "page" : undefined}
      >
        {d.nav[key]}
      </Link>
    </li>
  ));

  return (
    <header className="site-header on-navy" style={{ viewTransitionName: "site-header" }}>
      <div className="site-header__in">
        <Link className="brand" href={href("home", lang)} aria-label={`${SITE.name}, ${d.nav.home}`}>
          <BrandMark className="brand__mark" />
          <BrandWordmark className="brand__name" />
        </Link>

        <nav className="nav nav--wide" aria-label={d.nav.main}>
          <ul>{links}</ul>
        </nav>

        <div className="site-header__tools">
          <LangSwitch lang={lang} page={page} compact />
          <Link className="btn btn--brand btn--sm site-header__cta" href={href("join", lang)}>
            {d.nav.cta}
          </Link>

          <details className="menu" name="header-panel">
            <summary className="menu__btn">
              {d.nav.menu}
              <span aria-hidden className="menu__icon" />
            </summary>
            <nav className="menu__panel" aria-label={d.nav.main}>
              <ul>{links}</ul>
              <p className="menu__cta">
                <Link className="btn btn--brand" href={href("join", lang)}>
                  {d.nav.cta}
                </Link>
              </p>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
