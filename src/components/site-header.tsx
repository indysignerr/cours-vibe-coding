import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { LangSwitch } from "@/components/lang-switch";
import { SoundToggle } from "@/components/motion/sound-toggle";
import { href, t, type Locale, type PageRef, type RouteKey } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/**
 * L'en-tête : une barre marine, fixe, la même sur toutes les pages.
 *
 * Elle reste sombre au-dessus des sections ivoire — un en-tête qui
 * changerait de peau en traversant la page demanderait du JavaScript
 * pour ne rien dire de plus.
 *
 * Sous 900 px la navigation passe dans un <details> : pas de script, le
 * clavier et le lecteur d'écran viennent avec.
 */
const NAV: RouteKey[] = ["programme", "team", "join"];

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
    <header className="site-header" style={{ viewTransitionName: "site-header" }}>
      <div className="site-header__in">
        <Link className="brand" href={href("home", lang)} aria-label={`${SITE.name} — ${d.nav.home}`}>
          <BrandMark className="brand__mark" />
          <span className="brand__name" aria-hidden>
            Albert L<i>.</i>I<i>.</i>G<i>.</i>H<i>.</i>T<i>.</i>
          </span>
        </Link>

        <nav className="nav nav--wide" aria-label={d.nav.main}>
          <ul>{links}</ul>
        </nav>

        <div className="site-header__tools">
          <LangSwitch lang={lang} page={page} compact />
          <SoundToggle label={d.sound.label} on={d.sound.on} off={d.sound.off} />
          <Link className="btn btn--primary btn--sm site-header__cta" href={href("programme", lang)} data-magnetic>
            {d.nav.cta}
          </Link>

          <details className="menu" name="header-panel">
            <summary className="menu__btn">
              {d.nav.menu}
              <span aria-hidden className="menu__icon" />
            </summary>
            <nav className="menu__panel" aria-label={d.nav.main}>
              <ul>{links}</ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
